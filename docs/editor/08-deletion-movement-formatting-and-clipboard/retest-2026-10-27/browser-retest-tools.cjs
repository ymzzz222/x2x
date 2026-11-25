// Import only inside cua_repl. Every UI operation uses the supplied documented App API.
const fs = require('fs/promises')
const crypto = require('crypto')
const path = require('path')
const TARGET = 'https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX'
const sha = text => crypto.createHash('sha256').update(text).digest('hex')
const checkpointPath = path.join(__dirname, 'live-control-checkpoint.json')

function compactJson(value) {
  const arrays = new Map()
  const walk = (item, key = '') => {
    if (Array.isArray(item) && ['observations', 'actions', 'events', 'snapshots', 'copies', 'notices', 'platform'].includes(key)) {
      const token = '__COMPACT_' + arrays.size + '__'
      arrays.set(token, item)
      return token
    }
    if (Array.isArray(item)) return item.map(value => walk(value))
    if (item && typeof item === 'object') return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, walk(value, key)]))
    return item
  }
  let text = JSON.stringify(walk(value), null, 2)
  for (const [token, rows] of arrays) text = text.replace(JSON.stringify(token), '[\n' + rows.map(row => '    ' + JSON.stringify(row)).join(',\n') + '\n  ]')
  return text + '\n'
}

async function createTools(app, write) {
  let state
  try { state = JSON.parse(await fs.readFile(checkpointPath, 'utf8')) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    state = { date: '2026-10-27', target: TARGET, observations: [], actions: [], sequence: 0 }
  }
  return { app, write, state }
}

async function save(tool) {
  // Export parts stay compact even if a process is interrupted between batches.
  const copy = { ...tool.state }
  if (copy.export?.parts) copy.export = { ...copy.export, partsJson: JSON.stringify(copy.export.parts), parts: undefined }
  await fs.writeFile(checkpointPath, compactJson(copy))
}

async function inspect(tool) {
  const ax = await tool.app.getAXState({ emit: false, disableDiffing: true })
  if (!ax.split('\n').some(line => line.includes('标准窗口') && line.includes(TARGET.replace('https://', '')))) throw Error('Research URL guard')
  return ax
}

function resultFromAx(ax, marker) {
  const line = ax.split('\n').find(line => line.includes("container '" + marker + '|'))
  const encoded = line?.match(/\|([A-Za-z0-9+/=]+)' 堆栈/)?.[1]
  return encoded ? JSON.parse(Buffer.from(encoded, 'base64').toString('utf8')) : undefined
}

async function finishPending(tool) {
  const pending = tool.state.pending
  if (!pending) throw Error('No pending evaluation')
  let value
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await tool.app.getScreenshot({ emit: false })
    value = resultFromAx(await inspect(tool), pending.marker)
    if (value !== undefined) break
  }
  if (value === undefined) throw Error('Pending result not visible: ' + pending.marker)
  tool.state.observations.push({ marker: pending.marker, result: value })
  delete tool.state.pending
  await save(tool)
  tool.write(value)
  return value
}

async function evaluate(tool, body) {
  if (tool.state.pending) throw Error('Resolve pending evaluation before another UI action')
  const ax = await inspect(tool)
  const prompt = ax.match(/\n\s*(\d+) 文本输入区 \(settable\) 控制台提示, Value: ?\n/)
  if (!prompt) throw Error('An empty console prompt is required')
  const marker = 'S08R_' + Date.now() + '_' + (++tool.state.sequence)
  tool.state.pending = { marker, body, kind: 'research-only console evaluation' }
  await save(tool)
  // AX input avoids competing with the clipboard under observation.
  await tool.app.click(Number(prompt[1]))
  await tool.app.setValue(Number(prompt[1]), "'" + marker + "|'+btoa(unescape(encodeURIComponent(JSON.stringify(await(async()=>{if(location.href!==" + JSON.stringify(TARGET) + ")throw Error('URL guard');" + body + '})()))))')
  await tool.app.pressKey('Return')
  return finishPending(tool)
}

async function native(tool, keys, payload) {
  const point = await evaluate(tool, "const es=[...document.querySelectorAll('[data-block-type=\"text\"] .zone-container.text-editor')].map(e=>({e,r:e.getBoundingClientRect()})).filter(v=>v.r.bottom>96&&v.r.top<innerHeight-40&&v.r.height>0),v=es[0];return v?{p:'body-point',x:v.r.left+12,y:Math.max(96,v.r.top+13)+(outerHeight-innerHeight),zone:v.e.dataset.zoneId}:{p:'no-visible-body-point'};")
  if (point.p !== 'body-point') throw Error('No visible existing body text; explicit fixture setup required')
  const action = { sequence: tool.state.actions.length + 1, at: Date.now(), keys, point, payload: payload === undefined ? null : { units: payload.length, sha: sha(payload) }, completed: false }
  tool.state.actions.push(action)
  await save(tool)
  await tool.app.click([point.x, point.y])
  for (const key of keys) await tool.app.pressKey(key)
  if (payload !== undefined) await tool.app.paste(payload, { format: 'text' })
  await tool.app.getAXStateAndScreenshot({ emit: false })
  action.completed = true
  await save(tool)
}

async function clipboard(tool, label) {
  const before = await evaluate(tool, "return {p:'copy-counter',n:window.__s08r.copies.length};")
  await native(tool, ['super+a', 'super+a', 'super+c'])
  const result = await evaluate(tool, "const m=window.__s08r,c=m.copies.at(-1);return {p:" + JSON.stringify(label) + ",count:m.copies.length,n:c?.n,lines:c?.lines,sha:c?.sha,htmlLines:c?.html.aceLines,trust:c?.trust};")
  if (result.count <= before.n) throw Error('No fresh trusted copy result')
  return result
}

async function prepareExport(tool, label) {
  const meta = await evaluate(tool, "const m=window.__s08r,d=JSON.stringify({version:m.version||1,origin:m.origin||performance.timeOrigin,events:m.events,snapshots:m.snapshots,copies:m.copies,overflow:m.overflow,mutations:m.mutations,notices:m.notices||[],platform:m.platform||[]});m.exportB64=btoa(unescape(encodeURIComponent(d)));return {p:'export-prepared',chunks:Math.ceil(m.exportB64.length/50),sha:await m.hash(d)};")
  tool.state.export = { label, chunks: meta.chunks, sha: meta.sha, next: 0, parts: {} }
  await save(tool)
  return meta
}

async function exportBatch(tool, count = 150) {
  const batch = tool.state.export
  if (batch.inFlight) return collectExportBatch(tool)
  if (batch.partsJson && !batch.parts) batch.parts = JSON.parse(batch.partsJson)
  const start = batch.next, end = Math.min(batch.chunks, start + count)
  if (start >= end) return { done: true }
  const tag = 'S08X_' + Date.now()
  batch.inFlight = { tag, start, end }
  await save(tool)
  await evaluate(tool, "const rows=[];for(let i=" + start + ';i<' + end + ";i++)rows.push({chunk:'" + tag + "_'+i+'|'+window.__s08r.exportB64.slice(i*50,(i+1)*50)});console.table(rows);return {p:'export-batch',start:" + start + ',end:' + end + '};')
  return collectExportBatch(tool)
}

async function collectExportBatch(tool) {
  const batch = tool.state.export
  if (!batch.inFlight && tool.state.pending) {
    const body = tool.state.pending.body
    const bounds = body.match(/for\(let i=(\d+);i<(\d+);i\+\+\)/)
    const tag = body.match(/chunk:'(S08X_\d+)_'/)
    if (!bounds || !tag || Number(bounds[1]) !== batch.next) throw Error('Pending evaluation is not this export batch')
    batch.inFlight = { tag: tag[1], start: Number(bounds[1]), end: Number(bounds[2]) }
  }
  if (!batch.inFlight) throw Error('No export batch in flight')
  if (tool.state.pending) await finishPending(tool)
  const { tag, start, end } = batch.inFlight
  const ax = await inspect(tool)
  for (const match of ax.matchAll(new RegExp("文本 '" + tag + "_(\\d+)\\|([A-Za-z0-9+/=]+)'", 'g'))) batch.parts[match[1]] = match[2]
  for (let i = start; i < end; i++) if (!batch.parts[i]) throw Error('Missing export chunk ' + i)
  batch.next = end
  delete batch.inFlight
  await save(tool)
  return { next: end, total: batch.chunks, done: end === batch.chunks }
}

async function finishExport(tool, extra = {}) {
  const batch = tool.state.export
  if (batch.partsJson && !batch.parts) batch.parts = JSON.parse(batch.partsJson)
  if (batch.next !== batch.chunks) throw Error('Export batches are incomplete')
  const text = Buffer.from(Array.from({ length: batch.chunks }, (_, i) => batch.parts[i]).join(''), 'base64').toString('utf8')
  if (sha(text) !== batch.sha) throw Error('Export digest mismatch')
  const browser = JSON.parse(text)
  const record = { date: '2026-10-27', target: TARGET, label: batch.label, scope: 'Actual native browser input and public DOM/clipboard observation; not service protocol acceptance', exportSha256: batch.sha, ...extra, browser }
  await fs.writeFile(path.join(__dirname, batch.label + '.json'), compactJson(record))
  tool.state.lastExport = { label: batch.label, sha: batch.sha }
  delete tool.state.export
  await save(tool)
  return { file: batch.label, events: browser.events.length, copies: browser.copies.length, snapshots: browser.snapshots.length, platform: (browser.platform || []).length }
}

module.exports = { createTools, compactJson, inspect, evaluate, finishPending, native, clipboard, prepareExport, exportBatch, collectExportBatch, finishExport }
