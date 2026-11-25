"""Audit saved S06 research windows without interacting with the product."""
import hashlib
import json
from collections import defaultdict
from pathlib import Path

STAGE = Path(__file__).resolve().parents[1]


def walk(node):
    yield node
    for child in node.get('children', []):
        yield from walk(child)


def text(node):
    return node.get('text', '') + ''.join(text(c) for c in node.get('children', []))


def blocks(state):
    result = []
    for node in walk(state.get('body') or {}):
        attrs = node.get('attrs', {})
        if 'data-block-type' not in attrs:
            continue
        descendants = list(walk(node))
        zone = next((n for n in descendants
                     if n.get('attrs', {}).get('contenteditable') == 'true'), {})
        inline = []
        for child in walk(zone):
            style = child.get('attrs', {}).get('style')
            if style:
                declarations = sorted(tuple(part.strip() for part in declaration.split(':', 1))
                                      for declaration in style.split(';') if ':' in declaration)
                inline.append({'text': text(child).replace('\u200b', ''),
                               'style': declarations})
        result.append({
            'type': attrs['data-block-type'], 'ref': node['ref'],
            'id': attrs.get('data-block-id'),
            'text': text(zone).replace('\u200b', ''),
            'markers': [text(n) for n in descendants if n.get('tag') == 'BUTTON'],
            'inline': inline,
        })
    return result


def semantic(rows):
    return [{k: v for k, v in row.items() if k not in ('id', 'ref')}
            for row in rows]


def cross_effect_audit():
    """Check saved paste/history/reload evidence; never operate the browser."""
    def read(name):
        return json.loads((STAGE / 'dom' / f'{name}.json').read_text())

    def rows(state):
        return semantic(blocks(state))

    def record_ids(state):
        return [node['attrs'].get('data-record-id')
                for node in walk(state['body'])
                if 'data-block-type' in node.get('attrs', {})]

    def anchors(state):
        return [(a['href'], a['text']) for a in state['related']['anchors']]

    expanded = read('F06-P1-source-expanded')['state']
    source = rows(expanded)
    folded = [source[i] for i in (0, 3, 4, 5)]
    pasted = folded[:3] + [dict(source[0], markers=['3.']),
                              dict(source[3], markers=['4.']), source[4], source[5]]
    revealed = (folded[:3] + [dict(source[0], markers=['3.']),
                             dict(source[1], markers=['3.1'])] + source[2:3]
                + [dict(source[3], markers=['4.'])] + source[4:])
    cases = {}
    paste_sources = []
    for run in (1, 2):
        name = f'F06-structured-paste-continuous-R{run}'
        data = read(name)
        keys = data['keys']
        states = [key['before'] for key in keys] + [data['state']]
        focus = states[2]['inputFocus']
        selection = states[0]['selection']
        target = states[4]['selection']
        checks = {
            'sourceAndRestore': all(rows(states[i]) == folded
                                    for i in (0, 1, 2, 3, 4, 7, 9)),
            'pasteAndRedo': all(rows(states[i]) == pasted for i in (5, 6, 8)),
            'trusted': all(key.get('trusted') for key in keys),
            'actualChords': [(k['code'], k.get('meta'), k.get('shift')) for k in keys]
            == [('KeyA', True, False), ('KeyA', True, False), ('KeyC', True, False),
                ('ArrowDown', False, False), ('KeyV', True, False),
                ('KeyZ', True, False), ('KeyZ', True, False),
                ('KeyZ', True, True), ('KeyZ', True, False)],
            'sourceCaret': selection['type'] == 'Caret'
            and all(selection[end]['text'] == 'AAA' and selection[end]['offset'] == 3
                    for end in ('anchor', 'focus')),
            'wholeBodyCopySelection': focus.get('tag') == 'TEXTAREA'
            and (focus.get('value'), focus.get('start'), focus.get('end')) == (' ', 0, 1),
            'emptyTargetCaret': target['type'] == 'Caret'
            and all(target[end]['text'] == '\u200b' and target[end]['offset'] == 1
                    for end in ('anchor', 'focus')),
            'originalNamedBlocksPreserved': all(
                blocks(states[i])[:3] == blocks(states[0])[:3] for i in (5, 6, 7, 8, 9)),
        }
        cases[name] = {'checks': checks, 'historyTrace': data['historyTrace']}
        paste_sources.append(states[0])
        inspect = read(f'F06-pasted-hidden-content-inspect-R{run}')
        restore = read(f'F06-pasted-hidden-content-restore-R{run}')
        cases[f'F06-pasted-hidden-content-R{run}'] = {'checks': {
            'redoSource': rows(inspect['keys'][0]['before']) == folded,
            'revealedContentAndMarkers': rows(inspect['state']) == revealed,
            'undoExpansionThenPaste': len(restore['keys']) == 2
            and rows(restore['keys'][0]['before']) == revealed
            and rows(restore['keys'][1]['before']) == pasted,
            'restored': rows(restore['state']) == folded,
            'trustedHistory': all(k.get('trusted') and k['code'] == 'KeyZ'
                                  and k.get('meta') for k in inspect['keys'] + restore['keys']),
        }}
        for level in (1, 9):
            name = f'F06-heading{level}-fold-history-R{run}'
            data = read(name)
            keys = data['keys']
            folded_source = folded if level == 1 else [source[i] for i in (0, 1, 3, 4, 5)]
            cases[name] = {'checks': {
                'foldUndoRedoRestore': [rows(k['before']) for k in keys]
                + [rows(data['state'])] == [folded_source, source, folded_source, source],
                'trustedHistoryChords': len(keys) == 3 and all(
                    k.get('trusted') and k['code'] == 'KeyZ' and k.get('meta')
                    and k.get('shift') == (i == 1) for i, k in enumerate(keys)),
            }}
    cases['pasteRoundSources'] = {'checks': {
        'sameContentAndStyles': rows(paste_sources[0]) == rows(paste_sources[1]),
        'sameOriginalNamedObjects': blocks(paste_sources[0])[:3] == blocks(paste_sources[1])[:3],
        'sameOriginalNamedRecords': record_ids(paste_sources[0])[:3]
        == record_ids(paste_sources[1])[:3],
    }}
    reloaded = read('F06-P1-Chrome-reload-expanded-read')['state']
    before_fold = read('F06-P1-save-folded')['state']
    after_fold = read('F06-P1-Chrome-reload-folded')['state']
    cases['F06-P1-Chrome-reload'] = {'checks': {
        'fullContentAndInlineStyles': rows(expanded) == rows(reloaded),
        'persistentRecordIds': record_ids(expanded) == record_ids(reloaded),
        'outlineHrefsAndText': anchors(expanded) == anchors(reloaded),
        'foldedVisibleContent': rows(before_fold) == rows(after_fold) == folded,
        'foldedOutline': anchors(before_fold) == anchors(after_fold),
    }, 'limits': 'Only first Chrome reload; no Quark read, second round or collaboration.',
        'beforeBlockIds': [b['id'] for b in blocks(expanded)],
        'afterBlockIds': [b['id'] for b in blocks(reloaded)]}
    return cases


def fold_and_move_audit():
    """Audit menu and history windows that do not use the eight-key format."""
    def read(name):
        return json.loads((STAGE / 'dom' / f'{name}.json').read_text())

    def states(data):
        return [semantic(blocks(k['before'])) for k in data['keys']] + [semantic(blocks(data['state']))]

    def row(kind, value, marker=''):
        return {'type': kind, 'text': value, 'markers': [marker] if marker else [], 'inline': []}

    def chords(keys, shifts):
        return len(keys) == len(shifts) and all(
            k.get('trusted') and k['code'] == 'KeyZ' and k.get('meta')
            and k.get('shift') == shift for k, shift in zip(keys, shifts))

    full = [row('heading1', 'AAA', '1.'), row('heading9', 'BBB', '1.1'),
            row('ordered', 'CCC', '1.'), row('heading1', 'DDD', '2.'),
            row('ordered', 'TAIL', '2.'), row('text', '')]
    cases = {}
    for level in (1, 9):
        folded = [full[i] for i in ((0, 3, 4, 5) if level == 1 else (0, 1, 3, 4, 5))]
        for action in ('paste-edit', 'to-text'):
            # These earlier fixtures retain bold BBB; later deletion/move fixtures do not.
            action_full = [dict(r, inline=[{'text': 'BBB', 'style': [('font-weight', 'bold')]}])
                           if r['text'] == 'BBB' else r for r in full]
            action_folded = [action_full[i] for i in
                             ((0, 3, 4, 5) if level == 1 else (0, 1, 3, 4, 5))]
            pair = []
            for run in (1, 2):
                name = f'F04-folded-heading{level}-{action}-R{run}'
                data = read(name)
                if action == 'paste-edit':
                    index = 0 if level == 1 else 1
                    target = [dict(r, text=r['text'] + 'X', inline=[
                        dict(style, text=style['text'] + 'X') for style in r['inline']])
                        if i == index else r for i, r in enumerate(action_folded)]
                    expected = [action_folded, target, action_folded, target, action_folded]
                else:
                    index = 0 if level == 1 else 1
                    target = [dict(r, type='text', markers=[]) if i == index else r
                              for i, r in enumerate(action_full)]
                    expected = [action_folded, target, action_full, target, action_full]
                actual = states(data)
                pair.append(actual)
                cases[name] = {'checks': {
                    'contentMarkersStylesAndHistory': actual == expected,
                    'trustedAction': data['keys'][0].get('trusted')
                    and data['keys'][0]['code'] == ('KeyV' if action == 'paste-edit' else 'Digit0')
                    and data['keys'][0].get('meta'),
                    'historyChords': chords(data['keys'][1:], [False, True, False]),
                }}
            cases[f'F04-heading{level}-{action}-rounds'] = {'checks': {'sameSemanticTrace': pair[0] == pair[1]}}
        # H9 deletion fixture has no trailing empty paragraph; keep its source separate.
        source = folded if level == 1 else folded[:-1]
        deleted = ([row('heading1', 'DDD', '1.'), row('ordered', 'TAIL', '1.'), full[-1]]
                   if level == 1 else [full[0], full[3], row('ordered', 'TAIL', '1.')])
        for run in (1, 2):
            name = f'F04-folded-heading{level}-delete'
            action = read(f'{name}-R{run}')
            history = read(f'{name}-history-R{run}')
            cases[f'{name}-R{run}'] = {'checks': {
                'deletedContentAndMarkers': semantic(blocks(action['state'])) == deleted,
                'undoRedoRestore': states(history) == [deleted, source, deleted, source],
                'historyChords': chords(history['keys'], [False, True, False]),
            }}
    source = [full[i] for i in (0, 1, 3, 4, 5)]
    cut = [full[0], full[3], row('ordered', 'TAIL', '1.'), full[-1]]
    moved = cut[:-1] + [row('heading9', 'BBB', '2.1')]
    for run in (1, 2):
        name = f'F05-heading-cut-paste-move-R{run}'
        action = read(name)
        history = read(f'F05-heading-cut-paste-move-history-R{run}')
        cases[name] = {'checks': {
            'pasteResult': semantic(blocks(action['state'])) == moved,
            'sixHistorySteps': states(history) == [moved, cut, source, cut, moved, cut, source],
            'historyChords': chords(history['keys'], [False, False, True, True, False, False]),
        }}
    return cases


def main():
    from audit_boundaries import audit_boundaries
    from audit_cross_sessions import audit_cross_sessions, audit_cleanup

    sessions = defaultdict(dict)
    report = []
    integrity = {'snapshotFiles': 0, 'supportingFiles': [], 'snapshotsChecked': 0,
                 'legacyKeyEntriesWithoutBefore': 0, 'legacyKeyFiles': [],
                 'conflictingSeq': [], 'disconnectedRoots': [],
                 'unexpectedURLs': [], 'duplicatePersistentIds': []}
    for path in sorted((STAGE / 'dom').glob('*.json')):
        data = json.loads(path.read_text())
        state = data.get('state', {})
        keys = data.get('keys', [])
        records = data.get('records', [])
        # Early packed exports omitted the session label. Keep the b/n
        # identity namespaces separate instead of overwriting equal seq values.
        has_body = bool(state.get('body'))
        session = data.get('session') or (
            ('S06B' if state['body'].get('ref') == 'b3' else 'S06A (legacy)')
            if has_body else None)
        if has_body:
            integrity['snapshotFiles'] += 1
        else:
            integrity['supportingFiles'].append(path.name)
        missing_before = sum('before' not in key for key in keys)
        integrity['legacyKeyEntriesWithoutBefore'] += missing_before
        if missing_before:
            integrity['legacyKeyFiles'].append(path.name)
        snapshots = ([('final', state)] if has_body else []) + [
            (f'key-{i}', key['before']) for i, key in enumerate(keys) if 'before' in key]
        for label, snapshot in snapshots:
            integrity['snapshotsChecked'] += 1
            location = {'file': path.name, 'snapshot': label}
            if snapshot.get('rootConnected') is not True:
                integrity['disconnectedRoots'].append(location)
            if snapshot.get('url') != 'https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX':
                integrity['unexpectedURLs'].append(location)
            ids = defaultdict(list)
            for node in walk(snapshot.get('body') or {}):
                attrs = node.get('attrs', {})
                if 'data-block-type' in attrs and attrs.get('data-record-id'):
                    ids[attrs['data-record-id']].append(node['ref'])
            for record_id, refs in ids.items():
                if len(refs) > 1:
                    integrity['duplicatePersistentIds'].append(
                        dict(location, recordId=record_id, refs=refs))
        for record in records:
            seq = record.get('seq')
            if seq is not None:
                # Cumulative duplicates must agree before deduplication.
                previous = sessions[session].get(seq)
                if previous is not None and previous != record:
                    integrity['conflictingSeq'].append(
                        {'file': path.name, 'session': session, 'seq': seq})
                sessions[session][seq] = record
        item = {
            'file': path.name, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'session': session, 'records': len(records), 'keys': len(keys),
            'sessionInferredFromBodyRef': has_body and 'session' not in data,
            'evidenceKind': 'dom-snapshot' if has_body else data.get('kind', 'menu-discovery'),
            'external': len(data.get('external', [])),
            'final': blocks(state) if has_body else None,
            'rootConnected': state.get('rootConnected'),
        }
        if path.stem.endswith('-double') and len(keys) == 8:
            states = [blocks(key['before']) for key in keys] + [blocks(state)]
            source, target = semantic(states[0]), semantic(states[1])
            item['eightKeyAudit'] = {
                'sourceRestored': all(semantic(states[i]) == source
                                      for i in (2, 4, 6, 8)),
                'targetRepeated': all(semantic(states[i]) == target
                                       for i in (3, 5, 7)),
                'trusted': all(key.get('trusted') for key in keys),
                'sameTargetChord': all(keys[0].get(k) == keys[4].get(k)
                                       for k in ('code', 'meta', 'shift', 'alt', 'ctrl')),
                'historyChords': all(keys[i].get('code') == 'KeyZ'
                                     and keys[i].get('meta')
                                     and keys[i].get('shift') == (i % 4 == 2)
                                     for i in (1, 2, 3, 5, 6, 7)),
                'codes': [key.get('code') for key in keys],
            }
        report.append(item)
    continuity = {}
    for name, records in sessions.items():
        seqs = sorted(records)
        missing = sorted(set(range(seqs[0], seqs[-1] + 1)) - set(seqs)) if seqs else []
        continuity[name] = {'uniqueRecords': len(seqs), 'first': seqs[:1],
                            'last': seqs[-1:], 'missing': missing}
    cross_effects = cross_effect_audit()
    fold_and_move = fold_and_move_audit()
    boundaries = audit_boundaries()
    cross_sessions = audit_cross_sessions()
    cleanup = audit_cleanup()
    output = {'files': len(report), 'sessions': continuity, 'windows': report,
              'crossEffects': cross_effects, 'foldAndMove': fold_and_move,
              'boundaries': boundaries, 'crossSessions': cross_sessions, 'finalCleanup': cleanup, 'integrity': integrity}
    (STAGE / '06-audit.json').write_text(json.dumps(output, ensure_ascii=False, indent=2))
    failed = [r['file'] for r in report if 'eightKeyAudit' in r
              and not all(r['eightKeyAudit'][k] for k in
                          ('sourceRestored', 'targetRepeated', 'trusted',
                           'sameTargetChord', 'historyChords'))]
    cross_failed = {name: [key for key, value in item['checks'].items() if not value]
                    for name, item in cross_effects.items() if not all(item['checks'].values())}
    fold_failed = {name: [key for key, value in item['checks'].items() if not value]
                   for name, item in fold_and_move.items() if not all(item['checks'].values())}
    boundary_failed = {name: [key for key, value in item['checks'].items() if not value]
                       for name, item in boundaries.items() if not all(item['checks'].values())}
    session_failed = {name: [key for key, value in item['checks'].items() if not value]
                      for name, item in cross_sessions.items() if not all(item['checks'].values())}
    print(json.dumps({'files': len(report), 'sessions': continuity,
                      'snapshotFiles': integrity['snapshotFiles'],
                      'integrityExceptions': {key: integrity[key] for key in
                          ('conflictingSeq', 'disconnectedRoots', 'unexpectedURLs',
                           'duplicatePersistentIds') if integrity[key]},
                      'eightKeyExceptions': failed, 'crossEffectExceptions': cross_failed,
                      'foldAndMoveExceptions': fold_failed,
                      'boundaryExceptions': boundary_failed, 'crossSessionExceptions': session_failed, 'finalCleanup': cleanup},
                     ensure_ascii=False))
    lines = [
        '# S06 证据索引与审计', '',
        '状态：最终证据审计；完成范围及清理结果见主文档。', '',
        f'当前 dom/ 中有 {len(report)} 份 JSON。文件数、按键数和 mutation 数不作为通过用例数。',
        '来源为指定 Chrome 页面的原生操作及只读 DevTools 观察；夸克仅辅助独立读取及必要远程修改。',
        '阶段规则、有效双轮选择和失败边界见[主文档](./06-numbering-folding-and-outline.md)。', '',
        '## 审计范围', '',
        '- 全部 JSON 可解析，SHA-256 依据当前文件字节计算。',
        f"- {integrity['snapshotFiles']}份含正文DOM快照；其余为辅助记录，按evidenceKind区分清理、菜单与访问拒绝，不把缺state解释为空正文。",
        '- 同会话重复seq核对内容一致后去重；检查已有快照的根连接、指定URL及已捕获持久ID的唯一性。',
        f"- {len(integrity['legacyKeyFiles'])}份早期文件含共{integrity['legacyKeyEntriesWithoutBefore']}条累计按键条目，缺before快照；不套用后期逐键断言，也不把累计条目数当独立按键数。",
        '- 八按键双轮按前置快照核对来源恢复、目标重复、行内样式、可信事件及实际修饰键。',
        '- 菜单、移动及多步历史另按对应文件核对，不能套用八按键断言。',
        '- 早期导出为累计记录，重复 seq 去重；不同监控会话不拼接节点身份。',
        '- 缺 session 的早期文件按正文 b3/n3 引用命名空间分组，推定标签仅用于审计，原文件不改。',
        '- 结构粘贴、隐藏副本回读、H1/H9折叠历史及首次Chrome重载按专用断言审计。',
        '- F04粘贴编辑、转正文、删除与F05剪切粘贴移动另核对逐步全文、标记、样式和历史按键。',
        '- 两轮Chrome重载分别审计；不能代替夸克独立读取或协同，不证明生产验收。',
        '- F07跨位编号、空白/重名标题及导航、隐藏标题和普通列表编号另见boundaries。',
        '- 初轮多出的末空段保留；F01-middle-text 采用 R3/R4，R1/R2 不拼作稳定双轮。',
        '- F02 整块剪切粘贴移动采用 R2/R3，R1 缺正文外菜单 DOM。',
        '- 拖动未改变顺序的尝试不计成功，也不据此判定功能不支持。',
        '- 首次11:12清理是历史记录；最终清理以F00-final系列独立判定。', '',
        '## 监控区间', '',
        '| 会话 | 唯一正文 mutation | 首尾 seq | 区间内缺号 |',
        '| --- | --- | --- | --- |',
    ]
    for name, item in continuity.items():
        lines.append(f"| {name} | {item['uniqueRecords']} | {item['first']}–{item['last']} | {item['missing']} |")
    lines += ['', '## F06 专项断言', '',
              '结果见 06-audit.json 的 crossEffects；只核对已有证据，不补造实测。', '',
              json.dumps(cross_failed, ensure_ascii=False) if cross_failed
              else '结构粘贴两轮、隐藏副本两次回读、H1/H9各两轮折叠历史及首次Chrome重载的现有断言通过。', '',
              '## F04/F05 多步断言', '',
              '结果见 06-audit.json 的 foldAndMove；H1删除含末空段，H9删除不含，两类来源分别审计。', '',
              json.dumps(fold_failed, ensure_ascii=False) if fold_failed
              else 'H1/H9粘贴编辑、转正文、删除及标题剪切粘贴移动的现有两轮断言通过。', '',
              '## F07 与第二轮重载断言', '',
              '结果见 06-audit.json 的 boundaries；输入未生效及恢复采集的额外按键均单列，不计稳定通过。', '',
              json.dumps(boundary_failed, ensure_ascii=False) if boundary_failed
              else '跨位布局、隐藏标题及普通列表编号、四类锚点导航和第二轮Chrome重载断言通过。', '',
              '## F06 跨会话断言', '',
              '结果见06-audit.json的crossSessions：X1/X2独立刷新、Collab R1/R2文字历史、RemoteNumber R1/R3编号历史。R2额外空段为排除异常，另核对恢复，不计成功轮。', '',
              json.dumps(session_failed, ensure_ascii=False) if session_failed
              else '11组、81项断言通过；其中1组仅确认已知排除异常及恢复，不是成功用例。', '',
              '## 最终清理', '',
              '两边真实刷新后的空正文、空标题、观察器消失及原界面恢复：'
              + json.dumps(cleanup, ensure_ascii=False), '',
              '## 八按键断言异常', '',
              ', '.join(failed) if failed else '当前符合该结构的文件均通过内容、样式及按键断言。', '',
              '## 文件清单', '',
              '| 文件 | mutation | keys | external | SHA-256 |',
              '| --- | --- | --- | --- | --- |']
    for item in report:
        name = item['file']
        lines.append(f"| [{name}](./dom/{name}) | {item['records']} | {item['keys']} | {item['external']} | `{item['sha256']}` |")
    (STAGE / '06-evidence-index.md').write_text('\n'.join(lines) + '\n')


if __name__ == '__main__':
    main()
