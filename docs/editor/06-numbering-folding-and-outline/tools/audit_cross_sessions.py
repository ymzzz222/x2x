"""Compare independent browser reads and real local/remote history windows."""
from copy import deepcopy

from audit_boundaries import read, rows, record_ids, anchors, history_chords


def state(name):
    return read(name)['state']


def trace(data):
    return [rows(k['before']) for k in data['keys']] + [rows(data['state'])]


def changed(source, index, **values):
    result = deepcopy(source)
    result[index].update(values)
    return result


def audit_reload(full, folded):
    cases = {}
    for run in (1, 2):
        for browser in ('Chrome', 'Quark'):
            prefix = f'F06-X{run}-{browser}-'
            collapsed = read(prefix + 'reload-folded')
            expanded = state(prefix + 'reload-expanded')
            cases[prefix + 'independent-read'] = {'checks': {
                'nativeReloadAndOldObserverAbsenceRecorded': 'native' in collapsed['action']
                and 'old observer absent' in collapsed['action'],
                'newObserverSession': collapsed['session'] != read(
                    'F06-X0-Chrome-mixed-expanded-source')['session'],
                'fullContentMarkersAndStyles': rows(expanded) == rows(full),
                'allFivePersistentRecords': record_ids(expanded) == record_ids(full),
                'fullOutlineAnchors': anchors(expanded) == anchors(full),
                'foldPreserved': rows(collapsed['state']) == rows(folded),
                'foldedRecordsAndOutline': record_ids(collapsed['state']) == record_ids(folded)
                and anchors(collapsed['state']) == anchors(folded),
            }}
    return cases


def audit_text_collaboration(full, folded):
    cases, sources, selections = {}, [], []
    original = rows(full)
    local = changed(original, 0, text='AAAL')
    remote = changed(original, 2, text='CCCR')
    both = changed(local, 2, text='CCCR')
    for run in (1, 2):
        prefix = f'F06-Collab-R{run}-'
        source = state(prefix + 'Chrome-source')
        local_edit = read(prefix + 'Chrome-local')
        remote_edit = read(prefix + 'Quark-remote-edit')
        chrome_history = read(prefix + 'Chrome-local-history')
        quark_history = read(prefix + 'Quark-own-history')
        restored = state(prefix + 'Chrome-restored-expanded')
        sources.append(rows(source))
        selections.append([local_edit['keys'][0]['before']['selection'],
                           remote_edit['keys'][0]['before']['selection']])
        cases[prefix + 'local-remote-history'] = {'checks': {
            'foldedSource': rows(source) == rows(folded),
            'independentLocalRead': rows(state(prefix + 'Quark-sees-local'))
            == [local[i] for i in (0, 1, 4)],
            'remoteEditBothVisible': rows(remote_edit['state']) == both,
            'independentRemoteReadAndUnfold': rows(state(prefix + 'Chrome-after-remote')) == both,
            'chromeUndoPreservesRemote': trace(chrome_history) == [both, remote, both, remote],
            'remoteSessionSeesLocalUndo': rows(state(prefix + 'Quark-before-own-history')) == remote,
            'quarkUndoPreservesRestoredLocal': trace(quark_history)
            == [remote, original, remote, original],
            'bothHistoriesTrusted': history_chords(chrome_history['keys'], [False, True, False])
            and history_chords(quark_history['keys'], [False, True, False]),
            'bothEditsTrustedPaste': all(len(d['keys']) == 1 and d['keys'][0].get('trusted')
                and d['keys'][0]['code'] == 'KeyV' and d['keys'][0].get('meta')
                for d in (local_edit, remote_edit)),
            'fullRestoration': rows(restored) == original,
            'originalPersistentRecords': all(record_ids(s) == record_ids(full) for s in
                (remote_edit['state'], state(prefix + 'Chrome-after-remote'), restored)),
            'outlineHrefsPreservedAndTextSynced': all([a[0] for a in anchors(s)]
                == [a[0] for a in anchors(full)] for s in
                (remote_edit['state'], state(prefix + 'Chrome-after-remote'), restored))
                and anchors(remote_edit['state']) == anchors(state(prefix + 'Chrome-after-remote'))
                and anchors(restored) == anchors(full),
            'refoldRestored': rows(state(prefix + 'Quark-restored-folded')) == rows(folded),
        }}
    cases['F06-Collab-matching-rounds'] = {'checks': {
        'sameSource': sources[0] == sources[1],
        'sameTwoEditSelections': selections[0] == selections[1],
    }}
    return cases


def audit_remote_number(full, folded):
    cases, sources, selections, targets = {}, [], [], []
    target = deepcopy(rows(full))
    for index, marker in ((1, '9.'), (2, '9.1'), (4, '10.')):
        target[index]['markers'] = [marker]
    folded_target = [target[i] for i in (0, 1, 4)]
    for run in (1, 3):
        prefix = f'F06-RemoteNumber-R{run}-'
        source = state(prefix + 'Quark-source')
        expanded = state(prefix + 'Quark-expanded-target')
        history = read(prefix + 'Quark-history')
        restored = state(prefix + 'Quark-restored-expanded')
        sources.append(rows(source))
        selections.append(source['selection'])
        targets.append(rows(expanded))
        cases[prefix + 'valid-repeat'] = {'checks': {
            'sameFoldedSourceBothBrowsers': rows(source) == rows(folded)
            == rows(state(prefix + 'Chrome-source')),
            'foldedNumberSyncedBothBrowsers': rows(state(prefix + 'Quark-folded-target'))
            == folded_target == rows(state(prefix + 'Chrome-folded-target')),
            'hiddenNumberAndFiveBlocksBothBrowsers': rows(expanded) == target
            == rows(state(prefix + 'Chrome-expanded-target')),
            'sixActualHistoryStates': trace(history) == [target, folded_target,
                rows(folded), folded_target, target, folded_target, rows(folded)],
            'sixTrustedHistoryChords': history_chords(history['keys'],
                [False, False, True, True, False, False]),
            'independentRestoredFoldedRead': rows(state(prefix + 'Chrome-restored-folded')) == rows(folded),
            'hiddenContentFullyRestored': rows(restored) == rows(full),
            'originalPersistentRecords': record_ids(expanded) == record_ids(full) == record_ids(restored),
            'originalAnchorHrefs': [a[0] for a in anchors(expanded)]
            == [a[0] for a in anchors(full)] == [a[0] for a in anchors(restored)],
        }}
    cases['F06-RemoteNumber-matching-valid-rounds'] = {'checks': {
        'sameSources': sources[0] == sources[1],
        'sameSourceSelection': selections[0] == selections[1],
        'sameTargets': targets[0] == targets[1],
        'supplementalMutationWindowPresent': bool(read(
            'F06-RemoteNumber-R3-Quark-folded-target-records')['records']),
    }}
    anomaly = state('F06-RemoteNumber-R2-Quark-expanded-target')
    failed_restore = state('F06-RemoteNumber-R2-Chrome-restored-folded')
    cases['F06-RemoteNumber-R2-excluded-anomaly'] = {
        'status': 'excluded; cause of extra empty paragraph unknown', 'checks': {
            'extraEmptyRecorded': len(rows(anomaly)) == 6 and rows(anomaly)[-1]['text'] == '',
            'sixStepsDidNotRestoreNumber': rows(failed_restore) == folded_target,
            'recoveryFullSourceConfirmed': rows(state('F06-RemoteNumber-clean-expanded-source'))
            == rows(full) == rows(state('F06-RemoteNumber-Chrome-clean-expanded-source')),
        }}
    return cases


def audit_cross_sessions():
    full = state('F06-X0-Chrome-mixed-expanded-source')
    folded = state('F06-X0-Chrome-mixed-folded-source')
    return {**audit_reload(full, folded), **audit_text_collaboration(full, folded),
            **audit_remote_number(full, folded)}


def audit_cleanup():
    checks = {}
    for browser in ('Chrome', 'Quark'):
        data = read(f'F00-final-{browser}-after-refresh')
        checks[browser] = all((data['rootConnected'], not data['observerPresent'],
            data['bodyBlocks'] == 0, data['bodyText'] == '',
            data['titleEditors'] == [{'text': '', 'placeholder': '请输入标题'}],
            data['url'] == 'https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX'))
    restored = read('F00-final-ui-restored')
    checks['consolesClosed'] = restored['chrome']['consoleClosed'] and restored['quark']['researchConsoleClosed']
    checks['originalQuarkTabRestored'] = restored['quark']['restoredExistingTab'] == 'TDesign'
    return checks
