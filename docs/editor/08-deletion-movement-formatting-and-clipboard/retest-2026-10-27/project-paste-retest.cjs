// Run from the repository root. This probe does not connect to a browser or service.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const Module = require('module')
const root = process.cwd()
const output = __dirname
const req = Module.createRequire(path.join(root, 'package.json'))
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
const pnpm = path.join(root, 'node_modules/.pnpm')
const packageAt = name => {
  const dir = fs.readdirSync(pnpm).find(entry => entry.startsWith(name + '@'))
  if (!dir) throw Error('Missing installed dependency: ' + name)
  return path.join(pnpm, dir, 'node_modules', name)
}

async function main() {
  // JSDOM supports an empty canvas module; no canvas or drawing behavior is tested.
  const originalLoad = Module._load
  Module._load = function (id, ...args) {
    if (id === 'canvas') return {}
    return originalLoad.call(this, id, ...args)
  }
  const { JSDOM, VirtualConsole } = req(packageAt('jsdom'))
  Module._load = originalLoad
  const runtimeErrors = []
  const virtualConsole = new VirtualConsole()
  virtualConsole.on('jsdomError', error => runtimeErrors.push(error.message))
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'https://s08-isolated.invalid/', pretendToBeVisual: true, virtualConsole,
    // Deliberately omit runScripts and resources: input markup stays inert.
  })
  for (const key of ['window', 'document', 'navigator', 'Node', 'Element', 'HTMLElement',
    'MutationObserver', 'DOMParser', 'getComputedStyle', 'DOMRect', 'Event', 'KeyboardEvent']) {
    Object.defineProperty(globalThis, key, { value: dom.window[key], configurable: true })
  }
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window)
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window)
  globalThis.innerHeight = 900
  globalThis.innerWidth = 1400
  const esbuild = req(packageAt('esbuild'))
  const stubCalls = []
  globalThis.__s08RetestStubCalls = stubCalls
  const built = await esbuild.build({
    stdin: {
      contents: [
        "export {createMyDocExtensions,getMyDefaultDocJson} from './src/views/aiScriptCore/wordEdit/editor/extensions/index.js';",
        "export {normalizeExternalHtmlForPaste} from './src/views/aiScriptCore/wordEdit/editor/utils/externalPaste.js';",
        "export {useEditorChrome} from './src/views/aiScriptCore/wordEdit/editor/composables/useEditorChrome.js';",
      ].join('\n'), resolveDir: root, sourcefile: 's08-retest-entry.js',
    },
    bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
    metafile: true, define: { 'import.meta.env': '{"VITE_APP_PLATFORM":"internal"}' },
    plugins: [{ name: 'explicit-isolation-boundaries', setup(build) {
      build.onResolve({ filter: /^@\// }, args => {
        const base = path.join(root, 'src', args.path.slice(2))
        const resolved = [base, base + '.js', path.join(base, 'index.js')].find(file => fs.existsSync(file) && fs.statSync(file).isFile())
        if (!resolved) throw Error('Unresolved project alias: ' + args.path)
        return { path: resolved }
      })
      build.onResolve({ filter: /\.vue$/ }, args => {
        if (!/\/(OutlineMetaView|CharacterSectionView)\.vue$/.test(args.path)) throw Error('Unexpected Vue import: ' + args.path)
        return { path: args.path, namespace: 'vue-declaration' }
      })
      build.onLoad({ filter: /.*/, namespace: 'vue-declaration' }, () => ({ contents: 'export default {}', loader: 'js' }))
      build.onResolve({ filter: /useWordEditAiPanel\.js$/ }, args => ({ path: args.path, namespace: 'unexercised-ai' }))
      build.onLoad({ filter: /.*/, namespace: 'unexercised-ai' }, () => ({
        contents: "export function insertPreviewHtmlWithRevision(){globalThis.__s08RetestStubCalls.push('AI');throw Error('AI stub called')}", loader: 'js',
      }))
    } }],
  })
  const moduleObject = { exports: {} }
  new Function('require', 'module', 'exports', built.outputFiles[0].text)(req, moduleObject, moduleObject.exports)
  const { createMyDocExtensions, getMyDefaultDocJson, normalizeExternalHtmlForPaste, useEditorChrome } = moduleObject.exports
  const { Editor } = req('@tiptap/core')
  const { TextSelection } = req('@tiptap/pm/state')
  const { shallowRef, ref, nextTick, effectScope } = req('vue')
  const fixtures = [
    { id: 'styled', html: '<p><strong>Safe</strong></p>', plain: 'Safe', text: 'Safe' },
    { id: 'unsafe', html: '<p onclick="window.__s08Attack=1">Safe<script>window.__s08Attack=1</script><a href="javascript:window.__s08Attack=1">Link</a></p>', plain: 'SafeLink', text: 'SafeLink' },
    { id: 'legacy-active', html: '<p><span class="comment-underline-S08-foreign">External</span></p>', plain: 'External', text: 'External' },
    { id: 'data-id', html: '<p><span data-comment-id="S08-foreign">External</span></p>', plain: 'External', text: 'External' },
    { id: 'forged-block', html: '<p data-my-paragraph data-block-id="S08-foreign">External</p>', plain: 'External', text: 'External' },
    { id: 'plain-limit', html: '<p>' + 'x'.repeat(100001) + '</p>', plain: 'x'.repeat(100001), text: '', reject: true },
    { id: 'document-limit', html: '<p>' + 'x'.repeat(460001) + '</p>', plain: '', text: '', reject: true },
    { id: 'legacy-resolved', html: '<p><span class="comment-anchor-S08-foreign">External</span></p>', plain: 'External', text: 'External' },
  ]
  const cases = []
  const semantic = node => JSON.stringify(node, (key, value) => key === 'data-block-id' ? undefined : value)
  for (const fixture of fixtures) for (const round of [1, 2]) {
    const warnings = [], transforms = [], errorStart = runtimeErrors.length
    const proxy = { userId: 'S08-research', $modal: { cWarning: value => warnings.push(value) } }
    const content = getMyDefaultDocJson()
    content.content[0].content[0].content[0].content[0].content = [{ type: 'text', text: 'TITLE' }]
    const mount = document.body.appendChild(document.createElement('div'))
    const editor = new Editor({
      element: mount, content, injectCSS: false,
      extensions: createMyDocExtensions(proxy, { enableCollaboration: false }).filter(extension => extension.name !== 'placeholder'),
      editorProps: { transformPastedHTML: html => {
        const normalized = normalizeExternalHtmlForPaste(html)
        transforms.push({ inputSha: sha(html), outputSha: sha(normalized), legacyClassRetained: /comment-(?:underline|anchor)-S08-foreign/.test(normalized) })
        return normalized
      } },
    })
    let position = null
    editor.state.doc.descendants((node, pos, parent) => {
      if (position === null && node.type.name === 'myParagraphBlock' && parent.type.name === 'myPageChildren') position = pos + 1
    })
    editor.view.dispatch(editor.state.tr.setSelection(TextSelection.create(editor.state.doc, position)))
    const store = { state: { wordEdit: { mode: 'edit', currentData: { permission: 'write' } } }, getters: { 'wordEdit/canEdit': true } }
    const editorRef = shallowRef(null), scope = effectScope()
    const shell = scope.run(() => useEditorChrome({ editorScrollRef: ref(null), editor: editorRef, store, commitWordEdit() {}, vm: proxy }))
    editorRef.value = editor
    await nextTick()
    const before = semantic(editor.getJSON())
    const event = new dom.window.Event('paste', { bubbles: true, cancelable: true })
    Object.defineProperty(event, 'clipboardData', { value: {
      types: ['text/plain', 'text/html'], getData: type => type === 'text/html' ? fixture.html : type === 'text/plain' ? fixture.plain : '',
    } })
    editor.view.dom.dispatchEvent(event)
    await nextTick()
    const applied = editor.getJSON(), after = semantic(applied), foreignLayers = []
    editor.state.doc.descendants(node => {
      for (const mark of node.marks) if (mark.type.name === 'annotationSpan') {
        for (const layer of mark.attrs.layers || []) if (layer.id === 'S08-foreign') foreignLayers.push(layer)
      }
    })
    const body = editor.state.doc.firstChild.lastChild
    const title = editor.state.doc.firstChild.firstChild.textContent
    const html = editor.getHTML()
    const unsafe = /<script\b|\son\w+=|href="(?:javascript|vbscript):/i.test(html)
    const primaryPassed = body.textContent === fixture.text && title === 'TITLE' && !foreignLayers.length && !unsafe && (fixture.id !== 'forged-block' || !html.includes('S08-foreign')) && (!fixture.reject || before === after)
    let history = { applicable: !fixture.reject }
    if (!fixture.reject) {
      const undo = editor.commands.undo(), restored = semantic(editor.getJSON()) === before
      const redo = editor.commands.redo(), replayed = semantic(editor.getJSON()) === after
      const undoAgain = editor.commands.undo(), restoredAgain = semantic(editor.getJSON()) === before
      history = { applicable: true, undo, restored, redo, replayed, undoAgain, restoredAgain }
    }
    cases.push({ id: fixture.id, round, primaryPassed, input: { htmlUnits: fixture.html.length, htmlSha: sha(fixture.html), plainUnits: fixture.plain.length },
      result: { bodyUnits: body.textContent.length, bodySha: sha(body.textContent), title, foreignLayers, unsafe, unchanged: before === after, prevented: event.defaultPrevented, transforms, warnings, runtimeErrors: runtimeErrors.slice(errorStart) }, history })
    shell.unregisterShellListeners()
    scope.stop()
    editor.destroy()
    mount.remove()
  }
  const sourceFiles = Object.keys(built.metafile.inputs).filter(file => file.startsWith('src/')).sort().map(file => ({ path: file, sha256: sha(fs.readFileSync(path.join(root, file))) }))
  const failed = cases.filter(item => !item.primaryPassed).map(item => ({ id: item.id, round: item.round, foreignLayers: item.result.foreignLayers }))
  const report = { date: '2026-10-27', scope: 'Actual current project registry, TipTap Editor, paste transform, capture listener and PM plugins in inert JSDOM; synthetic clipboard events, no live OS/browser/service permission test',
    environment: { scripts: 'disabled', resources: 'disabled', collaboration: false, excludedExtension: 'placeholder viewport UI', vueDeclarationStubs: ['OutlineMetaView.vue', 'CharacterSectionView.vue'], aiStubCalls: stubCalls, canvas: 'JSDOM supported empty module path; no drawing tested' },
    sourceFiles, bundleSha256: sha(built.outputFiles[0].text), buildWarnings: built.warnings.map(warning => ({ text: warning.text, location: warning.location })),
    cases, counts: { cases: cases.length, primaryPassed: cases.length - failed.length, primaryFailed: failed.length,
      historyApplicable: cases.filter(item => item.history.applicable).length,
      historyPassed: cases.filter(item => item.history.applicable && ['undo', 'restored', 'redo', 'replayed', 'undoAgain', 'restoredAgain'].every(key => item.history[key])).length },
    failures: failed, runtimeErrors }
  // Keep repetitive evidence records compact without dropping their fields.
  let text = JSON.stringify({ ...report, sourceFiles: '__SOURCE_RECORDS__', cases: '__CASE_RECORDS__' }, null, 2)
  for (const [token, records] of [['__SOURCE_RECORDS__', sourceFiles], ['__CASE_RECORDS__', cases]]) {
    text = text.replace(JSON.stringify(token), '[\n' + records.map(record => '    ' + JSON.stringify(record)).join(',\n') + '\n  ]')
  }
  fs.writeFileSync(path.join(output, 'project-paste-retest.json'), text + '\n')
  dom.window.close()
  console.log(JSON.stringify({ counts: report.counts, failures: failed, runtimeErrors, stubCalls }))
}
main().catch(error => { console.error(error); process.exitCode = 1 })
