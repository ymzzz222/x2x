# S05 证据索引

已落盘 151 个不重复窗口，包含建样、失败、探查、异常、双轮用例和独立读取。
38 组同条件双轮按下表唯一窗口计数；复用的 ordered/ordered 等用例不重复计组。
六次独立刷新读取中，END-P2/P3 的四次读取构成两个有效保存轮次；END-P1 的两次均多一末空段，异常保留且不计通过。
研究来源为指定 Chrome 飞书页面；夸克仅辅助只读，功能转换不在第二浏览器进行。
需求与范围：[阶段正文](./05-nesting-and-combinations.md)、[运行矩阵](./05-verification-matrix.md)、[标题与范围](./05-headings-and-ranges.md)、[复杂组合与历史](./05-complex-history-and-persistence.md)。

## 审计结果

全部 JSON 可精确展开，SHA-256 匹配，来源 URL 与本地链接有效，overflow 和窗口 errors 均为 0。
38 组另核对同前置、实际源 Range、全文、类型、首行缩进、父子、当前项标记、外层身份、软换行、加粗和相关历史。
复杂六目标的实际源范围为 HROOT:0→HDEEP:5，排除 END；有序标题保留和引用部分作用分别审计。
三步组合历史的所有中间态和九次历史键均已核对，不用末态相同代替过程正确。
持久化跨加载核对 record-id、祖先记录、标记、样式、两条 ace-line、加粗和块数；不比较不同会话的 n 引用。
十五层有序为一次探查链，sir 决定无固定上限并停止探查；它不计为无限层级实测。

## 还原方式

递归将只有 `$obj` 字段的对象替换为 `objects` 中同名值，可精确还原完整 `run`，无事件或快照被省略。
对还原结果使用 Python json.dumps(sort_keys=True, ensure_ascii=False) 的默认分隔符序列化并计算 SHA-256，与文件 sha256 对照。
规范化只替换 DOM 标识中的 feishu，来源 URL 和用户文字保持原义。
同名 n/x 引用只在同一 session 各自引用空间中比较；x 为首批附加浮层观察器引用。
动作 before/after 与结束窗口快照分别保留；延后快照不能冒充连续写入的每个即时值。

## 双轮窗口对照

| 用例组 | 第一轮 | 第二轮 |
| --- | --- | --- |
| E01-ordered-child-tab | [R1](./dom/E01-ordered-child-tab-R1.json) | [R2](./dom/E01-ordered-child-tab-R2.json) |
| E01-bullet-child-tab | [R1](./dom/E01-bullet-child-tab-R1.json) | [R2](./dom/E01-bullet-child-tab-R2.json) |
| E01-depth15-shiftTab | [R1](./dom/E01-depth15-shiftTab-R1.json) | [R2](./dom/E01-depth15-shiftTab-R2.json) |
| E07-first-ordered-tab | [R1](./dom/E07-first-ordered-tab-R1.json) | [R2](./dom/E07-first-ordered-tab-R2.json) |
| E02-ordered-to-bullet-child | [R1](./dom/E02-ordered-to-bullet-child-R1.json) | [R2](./dom/E02-ordered-to-bullet-child-R2.json) |
| E02-bullet-parent-ordered-child | [R1](./dom/E02-bullet-parent-ordered-child-R1.json) | [R2](./dom/E02-bullet-parent-ordered-child-R2.json) |
| E02-bullet-parent-bullet-child | [R1](./dom/E02-bullet-parent-bullet-child-R1.json) | [R2](./dom/E02-bullet-parent-bullet-child-R2.json) |
| E03-quote-contains-heading1 | [R1](./dom/E03-quote-contains-heading1-R1.json) | [R2](./dom/E03-quote-contains-heading1-R2.json) |
| E03-quote-contains-heading9 | [R1](./dom/E03-quote-contains-heading9-R1.json) | [R2](./dom/E03-quote-contains-heading9-R2.json) |
| E03-quote-contains-bullet | [R1](./dom/E03-quote-contains-bullet-R1.json) | [R2](./dom/E03-quote-contains-bullet-R2.json) |
| E03-list-contains-quote | [R1](./dom/E03-list-contains-quote-R1.json) | [R2](./dom/E03-list-contains-quote-R2.json) |
| E03-quote-nesting | [R1](./dom/E03-quote-nesting-R1.json) | [R2](./dom/E03-quote-nesting-R2.json) |
| E01-heading9-tab-under-heading1 | [R1](./dom/E01-heading9-tab-under-heading1-R1.json) | [R2](./dom/E01-heading9-tab-under-heading1-R2.json) |
| E01-body-tab-into-heading-valid | [R1](./dom/E01-body-tab-into-heading-valid-R1.json) | [R2](./dom/E01-body-tab-into-heading-valid-R2.json) |
| E01-menu-indent-body | [R1](./dom/E01-menu-indent-body-R1.json) | [R2](./dom/E01-menu-indent-body-R2.json) |
| E01-body-shiftTab | [R1](./dom/E01-body-shiftTab-R1.json) | [R2](./dom/E01-body-shiftTab-R2.json) |
| E01-menu-lift-body | [R1](./dom/E01-menu-lift-body-R1.json) | [R2](./dom/E01-menu-lift-body-R2.json) |
| E04-lower-parent | [R1](./dom/E04-lower-parent-R1.json) | [R2](./dom/E04-lower-parent-R2.json) |
| E04-raise-child | [R1](./dom/E04-raise-child-R1.json) | [R2](./dom/E04-raise-child-R2.json) |
| E04-numbered-heading1-to9-valid | [R1](./dom/E04-numbered-heading1-to9-valid-R1.json) | [R2](./dom/E04-numbered-heading1-to9-valid-R2.json) |
| E05-deepest-child-ordered | [R1](./dom/E05-deepest-child-ordered-R1.json) | [R2](./dom/E05-deepest-child-ordered-R2.json) |
| E05-parent-text-command | [R1](./dom/E05-parent-text-command-R1.json) | [R2](./dom/E05-parent-text-command-R2.json) |
| E05-parent-subtree-quote-valid | [R1](./dom/E05-parent-subtree-quote-valid-R1.json) | [R2](./dom/E05-parent-subtree-quote-valid-R2.json) |
| E05-cross-level-heading9-valid | [R1](./dom/E05-cross-level-heading9-valid-R1.json) | [R2](./dom/E05-cross-level-heading9-valid-R2.json) |
| E03-quote-bubble-nested-menu | [R1](./dom/E03-quote-bubble-nested-menu-R1.json) | [R2](./dom/E03-quote-bubble-nested-menu-R2.json) |
| E07-delete-parent-to-child-zero | [R1](./dom/E07-delete-parent-to-child-zero-R1.json) | [R2](./dom/E07-delete-parent-to-child-zero-R2.json) |
| E01-indented-body-tab-nesting | [R1](./dom/E01-indented-body-tab-nesting-R1.json) | [R2](./dom/E01-indented-body-tab-nesting-R2.json) |
| E01-unindented-body-shiftTab-lift | [R1](./dom/E01-unindented-body-shiftTab-lift-R1.json) | [R2](./dom/E01-unindented-body-shiftTab-lift-R2.json) |
| E05-partial-descendants-bullet | [R1](./dom/E05-partial-descendants-bullet-R1.json) | [R2](./dom/E05-partial-descendants-bullet-valid-R2.json) |
| E03-quote-contains-ordered | [R1](./dom/E03-quote-contains-ordered-R1.json) | [R2](./dom/E03-quote-contains-ordered-R2.json) |
| E07-first-heading-menu-refusal | [R1](./dom/E07-first-heading-menu-refusal-R1.json) | [R2](./dom/E07-first-heading-menu-refusal-R2.json) |
| E06-complex-text | [R1](./dom/E06-complex-text-R1.json) | [R2](./dom/E06-complex-text-R2.json) |
| E06-complex-heading1 | [R1](./dom/E06-complex-heading1-R1.json) | [R2](./dom/E06-complex-heading1-R2.json) |
| E06-complex-heading9 | [R1](./dom/E06-complex-heading9-R1.json) | [R2](./dom/E06-complex-heading9-R2.json) |
| E06-complex-ordered | [R1](./dom/E06-complex-ordered-R1.json) | [R2](./dom/E06-complex-ordered-R2.json) |
| E06-complex-bullet | [R1](./dom/E06-complex-bullet-R1.json) | [R2](./dom/E06-complex-bullet-R2.json) |
| E06-complex-quote | [R1](./dom/E06-complex-quote-R1.json) | [R2](./dom/E06-complex-quote-R2.json) |
| E08-complex-sequence | [R1](./dom/E08-complex-sequence-R1.json) | [R2](./dom/E08-complex-sequence-R2.json) |

## 会话范围

| 会话 | 不重复窗口数 |
| --- | --- |
| S05-1792146317466 | 53 |
| S05-1792372930707 | 77 |
| S05-1792375726703 | 3 |
| S05-1792375925577 | 1 |
| S05-1792376010622 | 3 |
| S05-1792376096488 | 1 |
| S05-1792376170052 | 2 |
| S05-1792376179439 | 1 |
| S05-1792376328581 | 1 |
| S05-1792376490628 | 8 |
| S05-1792376628703 | 1 |

## 全部窗口

| 窗口 | 分类 | 事件数 | 窗口错误数 |
| --- | --- | --- | --- |
| [E00-20261019-resume-snapshot](./dom/E00-20261019-resume-snapshot.json) | 建样、恢复、清理或读取 | 0 | 0 |
| [E00-S05-final-audit-cleanup](./dom/E00-S05-final-audit-cleanup.json) | 建样、恢复、清理或读取 | 14 | 0 |
| [E00-S05-final-audit-empty-reload-read](./dom/E00-S05-final-audit-empty-reload-read.json) | 建样、恢复、清理或读取 | 0 | 0 |
| [E00-S05-final-cleanup](./dom/E00-S05-final-cleanup.json) | 建样、恢复、清理或读取 | 14 | 0 |
| [E00-S05-final-reload-read](./dom/E00-S05-final-reload-read.json) | 建样、恢复、清理或读取 | 0 | 0 |
| [E00-body-deep-for-lift](./dom/E00-body-deep-for-lift.json) | 建样、恢复、清理或读取 | 9 | 0 |
| [E00-body-depth-reset](./dom/E00-body-depth-reset.json) | 建样、恢复、清理或读取 | 23 | 0 |
| [E00-body-no-indent-nested-fixture](./dom/E00-body-no-indent-nested-fixture.json) | 建样、恢复、清理或读取 | 24 | 0 |
| [E00-bullet-nested-for-quote](./dom/E00-bullet-nested-for-quote.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-bullet-parent-ordered-child-fixture](./dom/E00-bullet-parent-ordered-child-fixture.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-complex-bold-fixture](./dom/E00-complex-bold-fixture.json) | 建样、恢复、清理或读取 | 14 | 0 |
| [E00-complex-nesting-fixture](./dom/E00-complex-nesting-fixture.json) | 建样、恢复、清理或读取 | 33 | 0 |
| [E00-complex-quote-fixture](./dom/E00-complex-quote-fixture.json) | 建样、恢复、清理或读取 | 22 | 0 |
| [E00-complex-seven-block-fixture](./dom/E00-complex-seven-block-fixture.json) | 建样、恢复、清理或读取 | 14 | 0 |
| [E00-complex-softline-fixture](./dom/E00-complex-softline-fixture.json) | 建样、恢复、清理或读取 | 19 | 0 |
| [E00-complex-types-fixture](./dom/E00-complex-types-fixture.json) | 建样、恢复、清理或读取 | 60 | 0 |
| [E00-empty-start-and-fixture](./dom/E00-empty-start-and-fixture.json) | 建样、恢复、清理或读取 | 12 | 0 |
| [E00-first-nesting-maximum-probe](./dom/E00-first-nesting-maximum-probe.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-heading-fixture-clean-20261019](./dom/E00-heading-fixture-clean-20261019.json) | 建样、恢复、清理或读取 | 58 | 0 |
| [E00-heading-nested-chain-fixture](./dom/E00-heading-nested-chain-fixture.json) | 建样、恢复、清理或读取 | 24 | 0 |
| [E00-nested-quote-fixture](./dom/E00-nested-quote-fixture.json) | 建样、恢复、清理或读取 | 22 | 0 |
| [E00-numbered-heading1-valid-fixture](./dom/E00-numbered-heading1-valid-fixture.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-numbered-parent-heading-fixture](./dom/E00-numbered-parent-heading-fixture.json) | 建样、恢复、清理或读取 | 24 | 0 |
| [E00-ordered-in-quote-fixture](./dom/E00-ordered-in-quote-fixture.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-ordered-nested-child-fixture](./dom/E00-ordered-nested-child-fixture.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-ordered-three-fixture](./dom/E00-ordered-three-fixture.json) | 建样、恢复、清理或读取 | 10 | 0 |
| [E00-plain-parent-with-children-fixture](./dom/E00-plain-parent-with-children-fixture.json) | 建样、恢复、清理或读取 | 15 | 0 |
| [E00-quote-for-nesting-entrances](./dom/E00-quote-for-nesting-entrances.json) | 建样、恢复、清理或读取 | 22 | 0 |
| [E00-quote-probe-reset](./dom/E00-quote-probe-reset.json) | 建样、恢复、清理或读取 | 11 | 0 |
| [E00-reset-three-ordered](./dom/E00-reset-three-ordered.json) | 建样、恢复、清理或读取 | 24 | 0 |
| [E00-seven-ordered-fixture](./dom/E00-seven-ordered-fixture.json) | 建样、恢复、清理或读取 | 10 | 0 |
| [E00-staircase-seven-fixture](./dom/E00-staircase-seven-fixture.json) | 建样、恢复、清理或读取 | 14 | 0 |
| [E00-tab-audit-start-empty](./dom/E00-tab-audit-start-empty.json) | 建样、恢复、清理或读取 | 0 | 0 |
| [E00-tab-audit-three-fixture](./dom/E00-tab-audit-three-fixture.json) | 建样、恢复、清理或读取 | 37 | 0 |
| [E00-three-bullet-reset](./dom/E00-three-bullet-reset.json) | 建样、恢复、清理或读取 | 24 | 0 |
| [E00-three-level-heading-fixture](./dom/E00-three-level-heading-fixture.json) | 建样、恢复、清理或读取 | 9 | 0 |
| [E01-body-shiftTab-R1](./dom/E01-body-shiftTab-R1.json) | 有效双轮窗口 | 10 | 0 |
| [E01-body-shiftTab-R2](./dom/E01-body-shiftTab-R2.json) | 有效双轮窗口 | 10 | 0 |
| [E01-body-tab-into-heading-valid-R1](./dom/E01-body-tab-into-heading-valid-R1.json) | 有效双轮窗口 | 10 | 0 |
| [E01-body-tab-into-heading-valid-R2](./dom/E01-body-tab-into-heading-valid-R2.json) | 有效双轮窗口 | 10 | 0 |
| [E01-body-tab-nochange-R1](./dom/E01-body-tab-nochange-R1.json) | 探查、失败前置或补充窗口 | 9 | 0 |
| [E01-body-tab-nochange-R2](./dom/E01-body-tab-nochange-R2.json) | 探查、失败前置或补充窗口 | 9 | 0 |
| [E01-bullet-child-tab-R1](./dom/E01-bullet-child-tab-R1.json) | 有效双轮窗口 | 17 | 0 |
| [E01-bullet-child-tab-R2](./dom/E01-bullet-child-tab-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E01-depth15-shiftTab-R1](./dom/E01-depth15-shiftTab-R1.json) | 有效双轮窗口 | 17 | 0 |
| [E01-depth15-shiftTab-R2](./dom/E01-depth15-shiftTab-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E01-extend-depth-N10-probe](./dom/E01-extend-depth-N10-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N11-probe](./dom/E01-extend-depth-N11-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N12-probe](./dom/E01-extend-depth-N12-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N13-probe](./dom/E01-extend-depth-N13-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N14-probe](./dom/E01-extend-depth-N14-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N15-probe](./dom/E01-extend-depth-N15-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-extend-depth-N8-probe](./dom/E01-extend-depth-N8-probe.json) | 单次探查，不计双轮 | 21 | 0 |
| [E01-extend-depth-N9-probe](./dom/E01-extend-depth-N9-probe.json) | 单次探查，不计双轮 | 20 | 0 |
| [E01-heading9-tab-under-heading1-R1](./dom/E01-heading9-tab-under-heading1-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E01-heading9-tab-under-heading1-R2](./dom/E01-heading9-tab-under-heading1-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E01-indent-menu-reachability](./dom/E01-indent-menu-reachability.json) | 探查、失败前置或补充窗口 | 30 | 0 |
| [E01-indented-body-tab-nesting-R1](./dom/E01-indented-body-tab-nesting-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E01-indented-body-tab-nesting-R2](./dom/E01-indented-body-tab-nesting-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E01-menu-discovery-20261019](./dom/E01-menu-discovery-20261019.json) | 探查、失败前置或补充窗口 | 18 | 0 |
| [E01-menu-indent-body-R1](./dom/E01-menu-indent-body-R1.json) | 有效双轮窗口 | 21 | 0 |
| [E01-menu-indent-body-R2](./dom/E01-menu-indent-body-R2.json) | 有效双轮窗口 | 24 | 0 |
| [E01-menu-lift-body-R1](./dom/E01-menu-lift-body-R1.json) | 有效双轮窗口 | 19 | 0 |
| [E01-menu-lift-body-R2](./dom/E01-menu-lift-body-R2.json) | 有效双轮窗口 | 26 | 0 |
| [E01-ordered-child-tab-R1](./dom/E01-ordered-child-tab-R1.json) | 有效双轮窗口 | 17 | 0 |
| [E01-ordered-child-tab-R2](./dom/E01-ordered-child-tab-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E01-staircase-N2-probe](./dom/E01-staircase-N2-probe.json) | 单次探查，不计双轮 | 8 | 0 |
| [E01-staircase-N3-probe](./dom/E01-staircase-N3-probe.json) | 单次探查，不计双轮 | 12 | 0 |
| [E01-staircase-N4-probe](./dom/E01-staircase-N4-probe.json) | 单次探查，不计双轮 | 15 | 0 |
| [E01-staircase-N5-probe](./dom/E01-staircase-N5-probe.json) | 单次探查，不计双轮 | 18 | 0 |
| [E01-staircase-N6-probe](./dom/E01-staircase-N6-probe.json) | 单次探查，不计双轮 | 21 | 0 |
| [E01-staircase-N7-probe](./dom/E01-staircase-N7-probe.json) | 单次探查，不计双轮 | 24 | 0 |
| [E01-unindented-body-shiftTab-lift-R1](./dom/E01-unindented-body-shiftTab-lift-R1.json) | 有效双轮窗口 | 16 | 0 |
| [E01-unindented-body-shiftTab-lift-R2](./dom/E01-unindented-body-shiftTab-lift-R2.json) | 有效双轮窗口 | 16 | 0 |
| [E02-bullet-parent-bullet-child-R1](./dom/E02-bullet-parent-bullet-child-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E02-bullet-parent-bullet-child-R2](./dom/E02-bullet-parent-bullet-child-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E02-bullet-parent-ordered-child-R1](./dom/E02-bullet-parent-ordered-child-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E02-bullet-parent-ordered-child-R2](./dom/E02-bullet-parent-ordered-child-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E02-ordered-to-bullet-child-R1](./dom/E02-ordered-to-bullet-child-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E02-ordered-to-bullet-child-R2](./dom/E02-ordered-to-bullet-child-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E03-bubble-focus-probe](./dom/E03-bubble-focus-probe.json) | 单次探查，不计双轮 | 8 | 0 |
| [E03-list-contains-quote-R1](./dom/E03-list-contains-quote-R1.json) | 有效双轮窗口 | 27 | 0 |
| [E03-list-contains-quote-R2](./dom/E03-list-contains-quote-R2.json) | 有效双轮窗口 | 27 | 0 |
| [E03-quote-bubble-nested-menu-R1](./dom/E03-quote-bubble-nested-menu-R1.json) | 有效双轮窗口 | 21 | 0 |
| [E03-quote-bubble-nested-menu-R2](./dom/E03-quote-bubble-nested-menu-R2.json) | 有效双轮窗口 | 25 | 0 |
| [E03-quote-contains-bullet-R1](./dom/E03-quote-contains-bullet-R1.json) | 有效双轮窗口 | 27 | 0 |
| [E03-quote-contains-bullet-R2](./dom/E03-quote-contains-bullet-R2.json) | 有效双轮窗口 | 27 | 0 |
| [E03-quote-contains-heading1-R1](./dom/E03-quote-contains-heading1-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E03-quote-contains-heading1-R2](./dom/E03-quote-contains-heading1-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E03-quote-contains-heading9-R1](./dom/E03-quote-contains-heading9-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E03-quote-contains-heading9-R2](./dom/E03-quote-contains-heading9-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E03-quote-contains-ordered-R1](./dom/E03-quote-contains-ordered-R1.json) | 有效双轮窗口 | 27 | 0 |
| [E03-quote-contains-ordered-R2](./dom/E03-quote-contains-ordered-R2.json) | 有效双轮窗口 | 27 | 0 |
| [E03-quote-nesting-R1](./dom/E03-quote-nesting-R1.json) | 有效双轮窗口 | 14 | 0 |
| [E03-quote-nesting-R2](./dom/E03-quote-nesting-R2.json) | 有效双轮窗口 | 14 | 0 |
| [E03-slash-quote-probe](./dom/E03-slash-quote-probe.json) | 单次探查，不计双轮 | 26 | 0 |
| [E04-lower-parent-R1](./dom/E04-lower-parent-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E04-lower-parent-R2](./dom/E04-lower-parent-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E04-numbered-heading1-to9-valid-R1](./dom/E04-numbered-heading1-to9-valid-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E04-numbered-heading1-to9-valid-R2](./dom/E04-numbered-heading1-to9-valid-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E04-numbered-parent-lower-R1](./dom/E04-numbered-parent-lower-R1.json) | 探查、失败前置或补充窗口 | 18 | 0 |
| [E04-numbered-parent-lower-R2](./dom/E04-numbered-parent-lower-R2.json) | 探查、失败前置或补充窗口 | 18 | 0 |
| [E04-raise-child-R1](./dom/E04-raise-child-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E04-raise-child-R2](./dom/E04-raise-child-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E05-cross-level-heading9-R1](./dom/E05-cross-level-heading9-R1.json) | 探查、失败前置或补充窗口 | 15 | 0 |
| [E05-cross-level-heading9-R2](./dom/E05-cross-level-heading9-R2.json) | 探查、失败前置或补充窗口 | 16 | 0 |
| [E05-cross-level-heading9-valid-R1](./dom/E05-cross-level-heading9-valid-R1.json) | 有效双轮窗口 | 25 | 0 |
| [E05-cross-level-heading9-valid-R2](./dom/E05-cross-level-heading9-valid-R2.json) | 有效双轮窗口 | 25 | 0 |
| [E05-deepest-child-ordered-R1](./dom/E05-deepest-child-ordered-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E05-deepest-child-ordered-R2](./dom/E05-deepest-child-ordered-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E05-parent-and-descendants-quote-probe](./dom/E05-parent-and-descendants-quote-probe.json) | 单次探查，不计双轮 | 24 | 0 |
| [E05-parent-subtree-quote-valid-R1](./dom/E05-parent-subtree-quote-valid-R1.json) | 有效双轮窗口 | 25 | 0 |
| [E05-parent-subtree-quote-valid-R2](./dom/E05-parent-subtree-quote-valid-R2.json) | 有效双轮窗口 | 25 | 0 |
| [E05-parent-text-command-R1](./dom/E05-parent-text-command-R1.json) | 有效双轮窗口 | 18 | 0 |
| [E05-parent-text-command-R2](./dom/E05-parent-text-command-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E05-partial-descendants-bullet-R1](./dom/E05-partial-descendants-bullet-R1.json) | 有效双轮窗口 | 21 | 0 |
| [E05-partial-descendants-bullet-R2](./dom/E05-partial-descendants-bullet-R2.json) | 探查、失败前置或补充窗口 | 4 | 0 |
| [E05-partial-descendants-bullet-valid-R2](./dom/E05-partial-descendants-bullet-valid-R2.json) | 有效双轮窗口 | 21 | 0 |
| [E06-complex-bullet-R1](./dom/E06-complex-bullet-R1.json) | 有效双轮窗口 | 21 | 0 |
| [E06-complex-bullet-R2](./dom/E06-complex-bullet-R2.json) | 有效双轮窗口 | 21 | 0 |
| [E06-complex-heading1-R1](./dom/E06-complex-heading1-R1.json) | 有效双轮窗口 | 24 | 0 |
| [E06-complex-heading1-R2](./dom/E06-complex-heading1-R2.json) | 有效双轮窗口 | 24 | 0 |
| [E06-complex-heading9-R1](./dom/E06-complex-heading9-R1.json) | 有效双轮窗口 | 27 | 0 |
| [E06-complex-heading9-R2](./dom/E06-complex-heading9-R2.json) | 有效双轮窗口 | 27 | 0 |
| [E06-complex-ordered-R1](./dom/E06-complex-ordered-R1.json) | 有效双轮窗口 | 17 | 0 |
| [E06-complex-ordered-R2](./dom/E06-complex-ordered-R2.json) | 有效双轮窗口 | 17 | 0 |
| [E06-complex-quote-R1](./dom/E06-complex-quote-R1.json) | 有效双轮窗口 | 24 | 0 |
| [E06-complex-quote-R2](./dom/E06-complex-quote-R2.json) | 有效双轮窗口 | 24 | 0 |
| [E06-complex-text-R1](./dom/E06-complex-text-R1.json) | 有效双轮窗口 | 20 | 0 |
| [E06-complex-text-R2](./dom/E06-complex-text-R2.json) | 有效双轮窗口 | 27 | 0 |
| [E07-delete-parent-block-R1](./dom/E07-delete-parent-block-R1.json) | 探查、失败前置或补充窗口 | 7 | 0 |
| [E07-delete-parent-to-child-zero-R1](./dom/E07-delete-parent-to-child-zero-R1.json) | 有效双轮窗口 | 17 | 0 |
| [E07-delete-parent-to-child-zero-R2](./dom/E07-delete-parent-to-child-zero-R2.json) | 有效双轮窗口 | 18 | 0 |
| [E07-first-heading-menu-refusal-R1](./dom/E07-first-heading-menu-refusal-R1.json) | 有效双轮窗口 | 14 | 0 |
| [E07-first-heading-menu-refusal-R2](./dom/E07-first-heading-menu-refusal-R2.json) | 有效双轮窗口 | 14 | 0 |
| [E07-first-ordered-tab-R1](./dom/E07-first-ordered-tab-R1.json) | 有效双轮窗口 | 6 | 0 |
| [E07-first-ordered-tab-R2](./dom/E07-first-ordered-tab-R2.json) | 有效双轮窗口 | 7 | 0 |
| [E07-parent-delete-entry-probe](./dom/E07-parent-delete-entry-probe.json) | 单次探查，不计双轮 | 8 | 0 |
| [E08-complex-sequence-R1](./dom/E08-complex-sequence-R1.json) | 有效双轮窗口 | 73 | 0 |
| [E08-complex-sequence-R2](./dom/E08-complex-sequence-R2.json) | 有效双轮窗口 | 73 | 0 |
| [E09-persist-R2-remove-trailing-empty](./dom/E09-persist-R2-remove-trailing-empty.json) | 探查、失败前置或补充窗口 | 14 | 0 |
| [E09-persist-R3-postexport-scan](./dom/E09-persist-R3-postexport-scan.json) | 探查、失败前置或补充窗口 | 0 | 0 |
| [E09-persist-complex-R1-Chrome-read](./dom/E09-persist-complex-R1-Chrome-read.json) | 首轮持久化异常，不计通过 | 0 | 0 |
| [E09-persist-complex-R1-Quark-read](./dom/E09-persist-complex-R1-Quark-read.json) | 首轮持久化异常，不计通过 | 0 | 0 |
| [E09-persist-complex-R2-Chrome-read](./dom/E09-persist-complex-R2-Chrome-read.json) | 有效独立刷新读取 | 0 | 0 |
| [E09-persist-complex-R2-Quark-read](./dom/E09-persist-complex-R2-Quark-read.json) | 有效独立刷新读取 | 0 | 0 |
| [E09-persist-complex-R3-Chrome-read](./dom/E09-persist-complex-R3-Chrome-read.json) | 有效独立刷新读取 | 0 | 0 |
| [E09-persist-complex-R3-Quark-read](./dom/E09-persist-complex-R3-Quark-read.json) | 有效独立刷新读取 | 0 | 0 |
| [E09-persist-complex-save-R1](./dom/E09-persist-complex-save-R1.json) | 首轮持久化异常，不计通过 | 16 | 0 |
| [E09-persist-complex-save-R2](./dom/E09-persist-complex-save-R2.json) | 保存版本与局部历史 | 15 | 0 |
| [E09-persist-complex-save-R3](./dom/E09-persist-complex-save-R3.json) | 保存版本与局部历史 | 16 | 0 |

## 异常与收尾

E05-partial-descendants-bullet-R2 没有执行目标菜单；有效复测另用 valid-R2，不覆盖失败窗口。
早期 cross-level-heading9-R1/R2 的前置或选区不同；正式跨层组只引用 valid-R1/valid-R2。
body-tab-nochange-R1/R2 实际创建层级，名称不能用于判断通过；首行属性与结构已补严格双轮。
首轮持久化间隙出现额外末空段，原因未知，后两轮正常不抹去该记录，也不证明所有保存场景均无额外块。
2026-10-16 锁屏中断窗口未导出，2026-10-19 Chrome 重启后旧观察器消失；不追溯补造。
最终北京时间 2026-10-19 10:23:48 真刷新确认为空正文、仅空页标题、旧观察器不存在；导出后移除新观察器并关闭控制台。
夸克已恢复原“剧本 · 跳跃视界”。未改项目业务代码，未运行项目构建、实现测试或生产 UI 验收，未启动 S06。
