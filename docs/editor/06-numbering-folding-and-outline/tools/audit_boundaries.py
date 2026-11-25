"""Audit saved S06 boundary windows; contains no browser operations."""
import json
from pathlib import Path

from audit import blocks, semantic, walk

STAGE = Path(__file__).resolve().parents[1]


def read(name):
    return json.loads((STAGE / 'dom' / f'{name}.json').read_text())


def rows(state):
    return semantic(blocks(state))


def record_ids(state):
    return [n['attrs'].get('data-record-id') for n in walk(state['body'])
            if 'data-block-type' in n.get('attrs', {})]


def anchors(state):
    return [(a['href'], a['text']) for a in state['related']['anchors']]


def history_chords(keys, shifts):
    return len(keys) == len(shifts) and all(
        k.get('trusted') and k['code'] == 'KeyZ' and k.get('meta')
        and not k.get('alt') and not k.get('ctrl') and k.get('shift') == shift
        for k, shift in zip(keys, shifts))


def width_metrics(state):
    return [{'text': b['marker']['text'], 'width': b['marker']['rect']['width'],
             'fontSize': b['marker']['style']['fontSize'],
             'fontWeight': b['marker']['style']['fontWeight'],
             'lineHeight': b['marker']['style']['lineHeight'],
             'gap': b['zone']['textRect']['left'] - b['marker']['rect']['right'],
             'markerOffsetY': b['marker']['rect']['top'] - b['zone']['rect']['top']}
            for b in state['related']['blocks']]


def audit_widths():
    cases = {}
    for kind, runs in [('list', (2, 3)), ('heading1', (1, 2)), ('heading9', (1, 2))]:
        sources, targets, metrics, selections = [], [], [], []
        for run in runs:
            name = f'F07-{kind}-nine-ten-eleven'
            source = read(f'{name}-source-R{run}')['state']
            target = read(f'{name}-R{run}')['state']
            history = read(f'{name}-history-R{run}')
            before = [rows(k['before']) for k in history['keys']] + [rows(history['state'])]
            s, t, m = rows(source), rows(target), width_metrics(target)
            sources.append(s)
            targets.append(t)
            metrics.append(m)
            selections.append(source['selection'])
            cases[f'{name}-R{run}'] = {'checks': {
                'sourceMarkers': [r['markers'] for r in s] == [['1.'], ['2.'], ['3.']],
                'targetMarkers': [r['markers'] for r in t] == [['9.'], ['10.'], ['11.']],
                'expectedBlockTypes': [r['type'] for r in s]
                == [('ordered' if kind == 'list' else kind)] * 3,
                'textTypeAndStylePreserved': [dict(r, markers=[]) for r in s]
                == [dict(r, markers=[]) for r in t],
                'samePersistentRecords': record_ids(source) == record_ids(target),
                'history': before == [t, s, t, s],
                'historyChords': history_chords(history['keys'], [False, True, False]),
                'widerTwoDigitMarkers': m[1]['width'] > m[0]['width']
                and m[2]['width'] == m[1]['width'],
                'sixPixelGap': all(r['gap'] == 6 for r in m),
            }, 'metrics': m}
        cases[f'F07-{kind}-rounds'] = {'checks': {
            'sameSources': sources[0] == sources[1], 'sameTargets': targets[0] == targets[1],
            'sameSourceSelection': selections[0] == selections[1],
            'sameRelativeLayout': metrics[0] == metrics[1],
        }}
    return cases


def audit_navigation():
    cases = {}
    for kind, origin, destination in [('duplicate-heading1', 0, 1),
                                      ('duplicate-heading9', 2, 3),
                                      ('empty-heading1', 1, 0), ('empty-heading9', 2, 3)]:
        sources, targets = [], []
        for run in (1, 2):
            name = f'F07-{kind}-navigation'
            source = read(f'{name}-source-R{run}')['state']
            target = read(f'{name}-R{run}')['state']
            a, b = source['related']['anchors'], target['related']['anchors']
            sources.append((rows(source), a, source['related']['scroll']))
            targets.append((rows(target), b, target['related']['scroll']))
            cases[f'{name}-R{run}'] = {'checks': {
                'contentUnchanged': rows(source) == rows(target),
                'anchorTextAndHrefUnchanged': anchors(source) == anchors(target),
                'persistentRecordsUnchanged': record_ids(source) == record_ids(target),
                'allAnchorHrefsUnique': len({x['href'] for x in b}) == len(b) == 4,
                'anchorsMatchRecords': [x['href'] for x in b] == ['#' + x for x in record_ids(target)],
                'sourceActive': [i for i, x in enumerate(a)
                                 if 'active' in x['container'].split()] == [origin],
                'targetActive': [i for i, x in enumerate(b)
                                 if 'active' in x['container'].split()] == [destination],
            }, 'scroll': {'source': source['related']['scroll'], 'target': target['related']['scroll']}}
        cases[f'F07-{kind}-navigation-rounds'] = {'checks': {
            'sameSourceContentAnchorsAndScroll': sources[0] == sources[1],
            'sameTargetContentAnchorsAndScroll': targets[0] == targets[1],
        }}
    return cases


def audit_hidden_update():
    cases, sources, expanded = {}, [], []
    original = read('F00-D-hidden-numbering-expanded-source')['state']
    trials = [
        ('F07-hidden-numbering-paste-no-change-R2', 'F07-hidden-numbering-paste-blur-probe'),
        ('F07-hidden-numbering-paste-blur-source-R2', 'F07-hidden-numbering-paste-blur-R2'),
    ]
    for run, (source_name, prefix) in enumerate(trials, 1):
        source = read(source_name)['state']
        target = read(prefix)['state']
        reveal = read(prefix + '-expanded')['state']
        history = read(prefix + '-history')
        s, t, r = rows(source), rows(target), rows(reveal)
        states = [rows(k['before']) for k in history['keys'][:6]]
        sources.append((s, source['selection']))
        expanded.append(r)
        extra = history['keys'][6:]
        cases[f'F07-hidden-numbering-blur-R{run}'] = {'checks': {
            'sourceOnlyParentOne': [(x['text'], x['markers']) for x in s] == [('AAA', ['1.'])],
            'targetOnlyParentNine': [(x['text'], x['markers']) for x in t] == [('AAA', ['9.'])],
            'revealedChildNumbers': [(x['text'], x['markers']) for x in r]
            == [('AAA', ['9.']), ('BBB', ['9.1']), ('CCC', ['9.2'])],
            'descendantRecordsPreserved': record_ids(reveal) == record_ids(original),
            'parentRecordPreserved': record_ids(source) == record_ids(target),
            'outlineNumbersSynchronized': [x[1] for x in anchors(reveal)]
            == ['9. AAA', '9.1 BBB', '9.2 CCC'],
            'sixHistorySteps': states == [r, t, s, t, r, t],
            'trustedHistoryChords': history_chords(history['keys'][:6],
                                                   [False, False, True, True, False, False]),
            'restored': rows(history['state']) == s,
            'extraRecoveryKeyDoesNotChangeBody': all(rows(k['before']) == s for k in extra)
            and (not extra or len(extra) == 1 and extra[0]['code'] == 'KeyJ'
                 and extra[0].get('meta') and extra[0].get('alt')),
        }, 'sourceFile': source_name, 'targetFile': prefix,
            'extraRecoveryKeys': [k['code'] for k in extra],
            'limits': 'Children verified upon expansion; off-DOM update timing and blur causality unknown.'}
    cases['F07-hidden-numbering-blur-rounds'] = {'checks': {
        'sameSourceAndSelection': sources[0] == sources[1],
        'sameExpandedChildren': expanded[0] == expanded[1],
    }}
    return cases


def audit_second_reload():
    source = read('F06-P2-source-expanded')['state']
    target = read('F06-P2-Chrome-reload-expanded-read')['state']
    folded = read('F06-P2-save-folded')['state']
    reloaded = read('F06-P2-Chrome-reload-folded')['state']
    return {'F06-P2-Chrome-reload': {'checks': {
        'fullContentAndInlineStyles': rows(source) == rows(target),
        'persistentRecordIds': record_ids(source) == record_ids(target),
        'outlineHrefsAndText': anchors(source) == anchors(target),
        'foldedContent': rows(folded) == rows(reloaded),
        'foldedOutline': anchors(folded) == anchors(reloaded),
    }, 'limits': 'Second Chrome reload only; Quark independent reading and collaboration remain missing.'}}


def audit_hidden_lists():
    original = read('F00-D-hidden-list-expanded-source')['state']
    full = rows(original)
    source = [full[i] for i in (0, 1, 4)]
    target = [dict(source[0], markers=['9.'])] + source[1:]
    expanded = [dict(r, markers=[marker]) for r, marker in
                zip(full, ['9.', '1.', '10.', '11.', '2.'])]
    cases, sources, reveals = {}, [], []
    for run in (1, 2):
        s = read(f'F07-hidden-list-source-R{run}')['state']
        t = read(f'F07-hidden-list-folded-R{run}')['state']
        r = read(f'F07-hidden-list-expanded-R{run}')['state']
        h = read(f'F07-hidden-list-history-R{run}')
        states = [rows(k['before']) for k in h['keys']] + [rows(h['state'])]
        sources.append((rows(s), s['selection']))
        reveals.append(rows(r))
        cases[f'F07-hidden-list-R{run}'] = {'checks': {
            'expectedSource': rows(s) == source,
            'numberChangedWhileChildrenHidden': rows(t) == target,
            'expandedListsTenEleven': rows(r) == expanded,
            'originalRecordsPreserved': record_ids(r) == record_ids(original),
            'visibleRecordsPreserved': record_ids(s) == record_ids(t),
            'history': states == [expanded, target, source, target, expanded, target, source],
            'historyChords': history_chords(h['keys'], [False, False, True, True, False, False]),
        }, 'limits': 'Hidden list numbers verified on expansion; off-DOM update timing is unmeasured.'}
    cases['F07-hidden-list-rounds'] = {'checks': {
        'sameSourceAndSelection': sources[0] == sources[1],
        'sameExpandedContentAndMarkers': reveals[0] == reveals[1],
    }}
    return cases


def audit_boundaries():
    return {**audit_widths(), **audit_navigation(), **audit_hidden_update(),
            **audit_hidden_lists(), **audit_second_reload()}
