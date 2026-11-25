import fs from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';

export function normalizeEvidence(value) {
  if (Array.isArray(value)) return value.map(normalizeEvidence);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [
    key,
    key === 'attrs'
      ? Object.fromEntries(Object.entries(item).map(([name, text]) => [
        name.replace(/feishu/gi, 'maiya'), text.replace(/feishu/gi, 'maiya'),
      ]))
      : normalizeEvidence(item),
  ]));
}

// Native UI only. JavaScript entered in DevTools queries or records DOM;
// these helpers never invoke the application's internal editing commands.
export function createSession(app, directory, browser = 'Chrome') {
  const consolePrompt = /控制台提示|Console prompt/;
  const state = async () => {
    const ax = await app.getAXState({ emit: false, disableDiffing: true });
    const windowLine = ax.split('\n').find(line => /^0 标准窗口/.test(line));
    const url = windowLine?.match(/URL:\s*([^,\s]+)/)?.[1];
    if (url?.replace(/^https:\/\//, '').split('#')[0]
      !== 'research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX') {
      throw new Error(`${browser} is showing a different document or window`);
    }
    return ax;
  };
  const required = (match, description) => {
    if (!match) throw new Error(`Missing ${description}`);
    return Number(match[1]);
  };

  async function openConsole() {
    let ax = await state();
    if (consolePrompt.test(ax)) return;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await app.performSecondaryAction(0, 'Raise');
      ax = await state();
      await app.click(required(ax.match(/(\d+) 显示\n/), `${browser} View menu`));
      ax = await app.getAXState({ emit: false, disableDiffing: true });
      const entry = ax.match(/(\d+) JavaScript 控制台/);
      if (entry) {
        await app.click(Number(entry[1]));
        const after = await state();
        if (!consolePrompt.test(after)) throw new Error('Console did not open');
        return;
      }
      if (!/^0 显示, Secondary Actions:.*Cancel/m.test(ax)) {
        throw new Error('Unexpected Chrome menu; recheck native state');
      }
      // Retry only opening the console, never a document action.
      await app.performSecondaryAction(0, 'Cancel');
      ax = await state();
    }
    throw new Error(`${browser} console menu remains unavailable`);
  }

  async function closeConsole() {
    let ax = await state();
    if (!consolePrompt.test(ax)) return;
    await app.performSecondaryAction(0, 'Raise');
    ax = await state();
    const close = ax.includes('Console prompt')
      ? [...ax.split('container Console panel')[0].matchAll(/(\d+) 按钮 Close\n/g)].at(-1)
      : ax.match(/(\d+) 按钮 关闭\n/);
    await app.click(required(close, 'DevTools Close'));
    let after = await app.getAXState({ emit: false, disableDiffing: true });
    if (consolePrompt.test(after)) {
      if (browser !== 'Chrome') throw new Error('Recheck native DevTools Close control');
      const screenshot = Buffer.from(await app.getScreenshot({ emit: false }));
      if (screenshot.readUInt32BE(16) !== 1619) throw new Error('Recheck DevTools close coordinates');
      // Fallback observed on the current 1619px-wide native Chrome window.
      await app.click([1600, 100]);
      after = await app.getAXState({ emit: false });
      if (consolePrompt.test(after)) throw new Error('DevTools did not close');
    }
  }

  async function command(code) {
    await state();
    await app.performSecondaryAction(0, 'Raise');
    const ax = await state();
    await app.click(required(ax.match(/(\d+) 文本输入区 \(settable\) (?:Description: )?(?:控制台提示|Console prompt)/), 'console prompt'));
    await app.pressKey('super+a');
    await app.paste(code, { format: 'text' });
    // Observe the inserted prompt before submitting; an immediate Return can
    // otherwise precede native paste completion on this Chrome session.
    await app.getAXState({ emit: false });
    await app.pressKey('Return');
    return app.getAXState({ emit: false, disableDiffing: true });
  }

  async function query(expression) {
    const ax = await command(`'S06PART:'+btoa(unescape(encodeURIComponent(JSON.stringify(${expression}))))`);
    const line = ax.split('\n').filter(item => /\d+ 文本 'S06PART:/.test(item)).at(-1);
    if (!line?.endsWith("'")) throw new Error('Console result absent or truncated');
    return JSON.parse(Buffer.from(line.slice(line.indexOf("'S06PART:") + 9, -1), 'base64').toString('utf8'));
  }

  async function savePacked(name, metadata = {}) {
    let ax = await command('__s06.out.match(/.{1,330}/g)');
    const headerPattern = /^\s*(\d+) row[^\n]*\((\d+)\)[^\n]*H4sI/gm;
    let header = [...ax.matchAll(headerPattern)].at(-1);
    if (!header) throw new Error('Packed evidence array missing');
    await app.click(Number(header[1]));
    ax = await state();
    header = [...ax.matchAll(headerPattern)].at(-1);
    const rows = [...ax.slice(header.index).matchAll(/^\s*\d+ row\s+(\d+) : "([A-Za-z0-9+/=]+)"/gm)];
    if (rows.length !== Number(header[2]) || rows.some((row, index) => Number(row[1]) !== index)) {
      throw new Error('Packed evidence rows incomplete or out of order');
    }
    const packed = rows.map(row => row[2]).join('');
    const evidence = normalizeEvidence(JSON.parse(gunzipSync(Buffer.from(packed, 'base64')).toString('utf8')));
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(`${directory}/${name}.json`, JSON.stringify({
      case: name,
      source: `${browser} native UI and read-only DevTools observer`,
      normalization: 'DOM identifiers feishu -> maiya; source URLs and user text unchanged',
      eventWindow: 'keys and external events since previous export',
      ...metadata,
      ...evidence,
    }, null, 2));
    return evidence;
  }

  async function prepareCapture(name, fromSeq) {
    return query(`await (async()=>{
      const value={session:__s06.session,state:__s06.snapshot(${JSON.stringify(name)}),
        records:__s06.records.filter(r=>r.seq>${fromSeq}),
        keys:(__s06.keys||[]).slice(__s06.keyFrom||0),
        external:(__s06.external||[]).slice(__s06.externalFrom||0)};
      __s06.keyFrom=(__s06.keys||[]).length;
      __s06.externalFrom=(__s06.external||[]).length;
      const data=new Uint8Array(await new Response(new Blob([JSON.stringify(value)]).stream()
        .pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
      __s06.out=btoa(String.fromCharCode(...data));
      return __s06.out.length;
    })()`);
  }

  async function capture(name, fromSeq, metadata = {}) {
    await prepareCapture(name, fromSeq);
    return savePacked(name, metadata);
  }

  async function focusWord(word, selectionType = 'cursor_after') {
    const ax = await state();
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const id = required(ax.match(new RegExp(`(\\d+) 文本输入区 \\(settable\\) ${escaped}`)), `editor ${word}`);
    await app.selectText(id, word, { selectionType });
  }

  async function press(key) {
    await state();
    await app.pressKey(key);
    return app.getAXState({ emit: false, disableDiffing: true });
  }

  async function keyRounds(word, key, options = {}) {
    await closeConsole();
    const ui = [];
    for (let round = 1; round <= 2; round += 1) {
      await focusWord(word, options.selectionType || 'cursor_after');
      for (const key of options.preKeys || []) await press(key);
      for (const action of [key, 'super+z', 'super+shift+z', 'super+z']) {
        const ax = await press(action);
        ui.push({ round, action, lines: ax.split('\n').filter(line =>
          /按钮 \d+\.|文本输入区.*(AAA|BBB|CCC|DDD|TAIL)|标题.*(AAA|BBB|CCC|DDD|TAIL)/.test(line)) });
      }
    }
    await openConsole();
    return ui;
  }

  return { state, openConsole, closeConsole, command, query, savePacked,
    prepareCapture, capture, focusWord, press, keyRounds };
}

// This function is pasted into DevTools as source. It only reads document DOM
// and records events; no editor commands or DOM writes are used.
export function installObserver({ session, prefix }) {
  if (window.__s06) throw new Error('Export and stop the existing S06 observer first');
  const root = document.querySelector('.page-block.root-block');
  const body = root?.querySelector('.page-block-children');
  if (!body) throw new Error('Document body is not ready');
  const references = new WeakMap();
  let next = 0;
  let seq = 0;
  const records = [];
  const keys = [];
  const external = [];
  const ref = n => {
    if (!n) return null;
    if (!references.has(n)) references.set(n, `${prefix}${++next}`);
    return references.get(n);
  };
  const node = n => {
    if (!n) return null;
    if (n.nodeType === 3) return { ref: ref(n), text: n.data };
    if (n.nodeType !== 1) return { ref: ref(n), type: n.nodeType };
    const attrs = Object.fromEntries([...n.attributes].filter(a =>
      /^(class|style|id|contenteditable|role|aria-|data-(block|type|list|level|indent|fold|num|start|record|parent|index|zone))/.test(a.name))
      .map(a => [a.name, a.value]));
    return { ref: ref(n), tag: n.tagName, attrs, children: [...n.childNodes].map(node) };
  };
  const point = (n, offset) => n ? {
    ref: ref(n), offset, text: n.nodeType === 3 ? n.data : undefined,
    tag: n.nodeType === 1 ? n.tagName : undefined,
  } : null;
  const selection = () => {
    const s = getSelection();
    if (!s) return null;
    const ranges = Array.from({ length: s.rangeCount }, (_, i) => {
      const r = s.getRangeAt(i);
      return { start: point(r.startContainer, r.startOffset), end: point(r.endContainer, r.endOffset) };
    });
    const r = s.rangeCount ? s.getRangeAt(0) : null;
    return { anchor: point(s.anchorNode, s.anchorOffset), focus: point(s.focusNode, s.focusOffset),
      type: s.type, text: s.toString(), ranges,
      direction: s.isCollapsed ? 'none' : r && s.anchorNode === r.startContainer
        && s.anchorOffset === r.startOffset ? 'forward' : 'backward' };
  };
  let lastSelection = selection();
  const selectionListener = () => {
    const s = getSelection();
    if (root.contains(s?.anchorNode) || document.activeElement?.matches('.docx-selection-hidden-textarea')) {
      lastSelection = selection();
    }
  };
  const mutation = m => ({
    type: m.type, target: ref(m.target), attribute: m.attributeName, old: m.oldValue,
    value: m.type === 'attributes' ? m.target.getAttribute(m.attributeName) : m.target.nodeValue,
    added: [...m.addedNodes].map(node), removed: [...m.removedNodes].map(node),
    previous: ref(m.previousSibling), next: ref(m.nextSibling),
  });
  const record = entries => entries.forEach(m => records.push({ seq: ++seq, ...mutation(m) }));
  const observer = new MutationObserver(record);
  const options = { subtree: true, childList: true, attributes: true,
    characterData: true, attributeOldValue: true, characterDataOldValue: true };
  observer.observe(root, options);
  const related = new MutationObserver(entries => external.push({
    kind: 'related-mutations', time: Date.now(), records: entries.map(mutation),
  }));
  const observed = new WeakSet();
  const observeRelated = () => {
    const outline = document.querySelector('.catalogue__list');
    const find = document.querySelector('.find-field')?.closest('.ud__modal__body');
    for (const n of [root.parentNode, outline?.parentNode, find?.parentNode]) {
      if (n && !observed.has(n)) {
        related.observe(n, n === root.parentNode ? { childList: true } : options);
        observed.add(n);
      }
    }
  };
  const menuSelector = '[role=menu],[role=dialog],.list-modify-menu,.ud__modal__body';
  const outside = new MutationObserver(entries => {
    observeRelated();
    for (const m of entries) for (const [change, nodes] of [['added', m.addedNodes], ['removed', m.removedNodes]]) {
      for (const n of nodes) {
        if (n.nodeType !== 1 || root.contains(n)) continue;
        const matches = n.matches(menuSelector) ? [n] : [...n.querySelectorAll(menuSelector)];
        for (const candidate of matches.filter(item => !matches.some(parent => parent !== item && parent.contains(item)))) {
          external.push({ kind: 'external-menu', time: Date.now(), change, dom: node(candidate) });
        }
      }
    }
  });
  outside.observe(document.body, { subtree: true, childList: true });
  const style = n => {
    if (!n) return null;
    const s = getComputedStyle(n);
    return Object.fromEntries(['display', 'visibility', 'fontSize', 'fontFamily', 'fontWeight',
      'lineHeight', 'width', 'minWidth', 'paddingLeft', 'paddingRight', 'marginLeft',
      'marginRight', 'textAlign', 'verticalAlign', 'boxSizing'].map(k => [k, s[k]]));
  };
  const layout = () => [...root.querySelectorAll('.block[data-block-type]')].map(n => {
    const zone = n.querySelector('[contenteditable=true]');
    const marker = n.querySelector('button.order,button.heading-order');
    const range = document.createRange();
    if (zone) range.selectNodeContents(zone);
    return { ref: ref(n), id: n.dataset.blockId, record: n.dataset.recordId, type: n.dataset.blockType,
      text: zone?.textContent, rect: n.getBoundingClientRect().toJSON(), display: getComputedStyle(n).display,
      marker: marker ? { ref: ref(marker), text: marker.textContent,
        rect: marker.getBoundingClientRect().toJSON(), style: style(marker) } : null,
      zone: zone ? { ref: ref(zone), rect: zone.getBoundingClientRect().toJSON(),
        textRect: range.getBoundingClientRect().toJSON(), style: style(zone) } : null };
  });
  const snapshot = label => {
    record(observer.takeRecords());
    observeRelated();
    const a = document.activeElement;
    const outline = document.querySelector('.catalogue__list');
    const find = document.querySelector('.find-field')?.closest('.ud__modal__body');
    return { label, time: new Date().toISOString(), url: location.href, rootConnected: root.isConnected,
      body: node(body), selection: lastSelection, currentSelection: selection(), seq,
      active: { tag: a.tagName, cls: a.className },
      inputFocus: { ref: ref(a), tag: a.tagName, cls: a.className,
        value: 'value' in a ? a.value : undefined, start: a.selectionStart, end: a.selectionEnd },
      related: { outline: node(outline), blocks: layout(),
        anchors: [...document.querySelectorAll('.catalogue__item-title')].map(n => ({
          ref: ref(n), href: n.getAttribute('href'), text: n.textContent, container: n.parentElement.className })),
        scroll: [...document.querySelectorAll('*')].filter(n => n.scrollHeight > n.clientHeight + 50
          && /auto|scroll/.test(getComputedStyle(n).overflowY)).map(n => ({
          ref: ref(n), class: n.className, top: n.scrollTop, height: n.clientHeight })) },
      find: { dom: node(find), inputs: [...document.querySelectorAll('input[placeholder*=查找]')]
        .map(n => ({ value: n.value, placeholder: n.placeholder })) } };
  };
  const keyListener = e => {
    if (root.contains(e.target) || e.target.matches?.('.docx-selection-hidden-textarea')) keys.push({
      time: new Date().toISOString(), key: e.key, code: e.code, trusted: e.isTrusted,
      meta: e.metaKey, alt: e.altKey, shift: e.shiftKey, ctrl: e.ctrlKey, before: snapshot('before-key'),
    });
  };
  const errorListener = e => external.push({ kind: 'runtime-error', time: Date.now(),
    message: e.message || String(e.reason), filename: e.filename, line: e.lineno });
  document.addEventListener('selectionchange', selectionListener);
  document.addEventListener('keydown', keyListener, true);
  window.addEventListener('error', errorListener);
  window.addEventListener('unhandledrejection', errorListener);
  observeRelated();
  window.__s06 = { root, body, records, keys, external, ref, node, snapshot, session,
    selection: () => lastSelection, flush: () => record(observer.takeRecords()),
    stop: () => {
      record(observer.takeRecords());
      observer.disconnect(); related.disconnect(); outside.disconnect();
      document.removeEventListener('selectionchange', selectionListener);
      document.removeEventListener('keydown', keyListener, true);
      window.removeEventListener('error', errorListener);
      window.removeEventListener('unhandledrejection', errorListener);
      delete window.__s06;
    } };
  return { ready: true, session, root: ref(root), body: ref(body), blocks: layout().length,
    viewport: [innerWidth, innerHeight], dpr: devicePixelRatio, time: new Date().toISOString() };
}

export function buildObserverSource(options) {
  return `(${installObserver.toString()})(${JSON.stringify(options)})`;
}
