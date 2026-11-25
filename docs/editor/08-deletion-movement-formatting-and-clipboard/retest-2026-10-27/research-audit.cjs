// Research evidence checks only. Expected product failures remain failures.
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const zlib = require('zlib')
const dir = __dirname
const root = process.cwd()
const sha = value => crypto.createHash('sha256').update(value).digest('hex')
const read = name => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'))
const checks = []
function check(id, passed, details) {
  checks.push({ id, passed: !!passed, details })
}

const manifestDir = path.join(root, 'docs/editor/11-reconstruction-acceptance')
const manifest = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(manifestDir, '11-source-manifest.json.gz'))))
const changed = manifest.files.filter(record => {
  const file = path.resolve(manifestDir, record.path)
  return !fs.existsSync(file) || sha(fs.readFileSync(file)) !== record.sha256
}).map(record => record.path)
check('original-stage-evidence-unchanged', changed.length === 0, { files: manifest.files.length, changed })

const boundary = read('browser-single-paste-boundary.json')
const guard = sha('S08R_GUARD\n')
const input = Array.from({ length: 3000 }, (_, i) => 'B' + String(i + 1).padStart(5, '0')).join('\n')
const inputSha = sha(input)
check('single-paste-case-count', boundary.cases.length === 4, boundary.cases.map(record => [record.case || record.inputBlocks, record.round]))
for (const record of boundary.cases) {
  const accepted = !!record.applied
  const values = accepted ? [record.applied, record.redo] : [record.redoPrior]
  const bases = accepted ? [record.undo, record.restored] : [record.after, record.restored]
  check((accepted ? '3000-accepted-' : '3001-rejected-') + record.round,
    values.every(value => value.sha === inputSha && value.n === input.length && value.lines === 3000 && value.htmlLines === 3000 && value.trust) &&
    bases.every(value => value.sha === guard && value.n === 11 && value.lines === 2 && value.trust),
    { appliedCopies: values.map(value => value.count), baselineCopies: bases.map(value => value.count) })
}

const permission = read('permission-active-checkpoint.json').permissionException
check('permission-restored-after-real-reload', permission.restorationConfirmed && permission.restorationUIConfirmed &&
  permission.currentUIValue === permission.originalUIValue && permission.restoredAPI.read === 'prompt' &&
  permission.restoredAPI.write === 'granted' && permission.postReloadVerification.read === 'prompt', permission)
const blocked = read('browser-permission-blocked-recovered.json')
check('platform-read-denied-two-real-activations', blocked.browser.platform.length === 2 && blocked.browser.platform.every(value =>
  value.trusted && value.activation && value.writeFocus && value.readFocus && value.write === 'succeeded' &&
  value.read === 'NotAllowedError' && value.readMessage.includes('Read permission denied')), blocked.browser.platform)
check('native-control-terminal-LF-not-hidden', blocked.limits.some(value => /LF|newline|line feed/i.test(value)), blocked.limits)

const project = read('project-paste-retest.json')
check('project-primary-failures-preserved', project.counts.cases === 16 && project.counts.primaryPassed === 12 &&
  project.counts.primaryFailed === 4 && project.failures.every(value => ['legacy-active', 'legacy-resolved'].includes(value.id)), project.counts)
check('project-history-distinct-from-primary', project.counts.historyApplicable === 12 && project.counts.historyPassed === 12, project.counts)
check('unexercised-AI-stub-not-called', project.environment.aiStubCalls.length === 0, project.environment.aiStubCalls)
const sourceChanged = project.sourceFiles.filter(record => sha(fs.readFileSync(path.join(root, record.path))) !== record.sha256).map(record => record.path)
check('current-project-source-matches-recorded-run', sourceChanged.length === 0, { files: project.sourceFiles.length, changed: sourceChanged })

const names = fs.readdirSync(dir).filter(name => name.endsWith('.json') && name !== 'research-audit.json')
for (const name of names) {
  const value = read(name)
  if (value.browser && value.exportSha256) check('export-digest-' + name, sha(JSON.stringify(value.browser)) === value.exportSha256, value.exportSha256)
}
const fullSha = '23426e989f496deb5fad01c53ccbf401f621b81ca923a1f306b5a33bdbfeae96'
for (const name of ['browser-refresh-1.json', 'browser-refresh-2.json']) {
  const value = read(name), copied = value.browser.copies.at(-1)
  check('fulltext-reloaded-' + name, copied.n === 500010 && copied.lines === 10 && copied.sha === fullSha && copied.trust, copied)
}
const lineIssues = fs.readdirSync(dir).filter(name => /\.(?:md|cjs|json)$/.test(name) && name !== 'research-audit.json').flatMap(name => {
  const lines = fs.readFileSync(path.join(dir, name), 'utf8').trimEnd().split('\n').length
  return lines < 50 || lines > 500 ? [{ name, lines }] : []
})
check('new-text-file-size-band', lineIssues.length === 0, lineIssues)

const report = {
  date: '2026-10-27', scope: 'Static research integrity checks; not product acceptance',
  counts: { checks: checks.length, passed: checks.filter(value => value.passed).length, failed: checks.filter(value => !value.passed).length },
  functionalStatus: { projectIdentity: 'four actual isolated primary failures', naturalClipboardRefusal: 'not observed', totalDocumentCapacity: 'not established', cleanup: 'pending independent confirmation' },
  limits: [
    'Static audit success is not functional acceptance.',
    'Expected primary failures must remain visible after passing the evidence checks.',
    'The controlled Clipboard API probe is separate from the product error handler.',
    'Renderer failures are not document-capacity rejection thresholds.',
    'Virtualized DOM samples and selected word counts do not prove whole-document identity.',
    'A reload timeOrigin and clipboard digest do not prove the save protocol against races.',
    'Current source fingerprints describe this run; other build configurations remain untested.',
    'Final cleanup must be checked after the final content operation.',
  ],
  pendingActions: [
    'Finish clearing the body and title.',
    'Read back saved empty state in Chrome and Quark.',
    'Remove remaining temporary research state and restore user-selected tabs.',
  ],
  checks,
}
let text = JSON.stringify({ ...report, checks: '__CHECKS__' }, null, 2)
text = text.replace('"__CHECKS__"', '[\n' + checks.map(value => '    ' + JSON.stringify(value)).join(',\n') + '\n  ]')
fs.writeFileSync(path.join(dir, 'research-audit.json'), text + '\n')
console.log(JSON.stringify({ counts: report.counts, failures: checks.filter(value => !value.passed) }))
if (report.counts.failed) process.exitCode = 1
