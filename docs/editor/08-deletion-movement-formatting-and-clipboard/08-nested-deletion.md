# S08 嵌套与容器删除边界

状态：2026-10-21，H01 按已确认代表范围结束研究交付；以下列表父子与空引用条件各有有效双轮，其他组合按[收口清单](./08-closeout-review.md)保留未知，不宣称功能全覆盖。
总范围与既有根级删除见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)。
来源为指定飞书研究文档，通过真实原生点击、选择文本与按键完成，没有内部编辑命令或正文 DOM 写入。

## 1 共用建样与读数

[建样](./dom/H00-expanded-list-deletion-fixture.json)从原混合正文展开 IndentParent，显示有序子项 IndentChild。
父项为顶层 ordered，编号 1.；子项为其内部 ordered，编号 a.，不是视觉缩进相似的顶层兄弟。
页标题 Title，前方依次是 Alpha、编号 H9 Beta、Gamma，后方是 Quote 引用及末空 ordered。
每轮先固定目标文字和精确偏移，真实按键，再分别明确标题焦点执行 Undo/Redo/Undo。
内容历史以稳定公开 DOM 比对；取样控制台焦点与内容命令本身的焦点分开保存。

| 角色 | 建样身份 | 本组保护范围 |
| --- | --- | --- |
| 父项 | n12348 / ID123 | 保留外层、编号和 ordered 类型 |
| 子项 | n20279 / ID150 | 类型转换时复用；被删除后恢复身份另记 |
| 相邻普通段 | Alpha ID120、Gamma ID179 | 文字、类型与身份保持 |
| 其他混合内容 | H9 Beta ID102、引用 ID148/149、末空 ordered ID109 | 内容、归属与身份保持 |

## 2 REQ-S08-H01-022 嵌套有序子项开头退格保留父级

状态：同前置双轮及三步历史已验证。
证据：[R1](./dom/H01-nested-ordered-child-start-backspace-R1.json)、[R2](./dom/H01-nested-ordered-child-start-backspace-R2.json)。
真实光标为 IndentChild:0，可信 Backspace 的目标在该子项所属编辑根；不是父项或标题光标。
子项从 ordered 转为 text，编号 a. 消失，文字完整保留 IndentChild。
父子关系仍是 ordered 父项包含 text 子项；没有提升到顶层，没有与父项文字合并，也不是 Shift+Tab 的出缩进行为。
可见数据块节点始终为 8 个（引用父子分别计数），同组父项及子项外层身份保持。
子项外层 n20279/ID150 的 data-block-type 在 ordered/text 间切换；不由外层复用推断其全部包装和文字叶也复用。
Undo 恢复原嵌套 ordered/a.，Redo 再转为嵌套 text，再 Undo 恢复；每步光标均在子项文字偏移 0。
Alpha、H9 Beta、Gamma、Quote 父子、末空 ordered 和页标题保持，父项没有丢失或复制。
两轮主观察器 errors/overflow 为空；尚未独立重载验证持久性。
复刻验收固定父子、前后兄弟和精确开头光标，核对只取消子项列表类型、原父级保持、完整历史及邻块保护。
只覆盖一层有序父子和非空子项，不推广多层、空子项、无序列表、标题父子或引用容器。

## 3 REQ-S08-H01-023 父项末尾 Delete 合并第一子项

状态：同前置双轮及完整历史已验证。
证据：[R1](./dom/H01-ordered-parent-end-delete-child-R1.json)、[R2](./dom/H01-ordered-parent-end-delete-child-R2.json)。
真实光标为 IndentParent:12，可信前向 Delete 从父项自身文字末尾触发。
父项文字变为 IndentParentIndentChild，不插入空格或换行；子项数据块移除，可见节点由 8 减为 7。
目标父项仍为顶层 ordered、编号 1.，外层 n12348/ID123 保持；原引用及其他相邻块不迁入父项。
Delete 后光标保持父项偏移 12，位于原父项文字与迁入文字的边界。
Undo 恢复独立嵌套 ordered 子项和 a. 编号，Redo 再合并，再 Undo 恢复；父项光标每步均为 12。
R1 子项前置 ID150 被删除，Undo 新建 ID180，最终恢复 ID181。
R2 前置子项 ID181 被删除，Undo 新建 ID182，最终恢复 ID183；不能声称删除后的原子项身份复原。
父项以及 Alpha/H9 Beta/Gamma、引用父子和末空 ordered 的身份保持；只有实际子项删除范围允许重建。
两轮主观察器 errors/overflow 为空，未独立重载；不推广父项多个子项、折叠时直接 Delete 或跨引用边界。
复刻验收核对父项保留类型/编号、仅第一子项内容迁入、子项移除与重建、邻块保护及光标和历史。

## 4 建样恢复与明确边界

[清理](./dom/H00-expanded-list-deletion-fixture-cleanup.json)在恢复后的完整父子结构上，一次已知 Undo 收起子项，精确回到原折叠语义基线。
清理前已读到恢复的 IndentChild/ID183，折叠后不可见，不把缺少渲染节点等同于数据丢失。
本组是公开 DOM 与真实操作合同，不推断飞书内部存储结构、隐藏节点常驻或事务实现。
项目生产验收、修订/只读/锁状态、所有嵌套组合以及独立保存重开仍需各自记录。
后续容器边界在本文件继续登记；未测条件不写成拒绝或已验证。

## 5 REQ-S08-H01-024 空引用开头退格移除容器

状态：同前置双轮及 Undo/Redo/Undo 已验证。
证据：[R1](./dom/H01-empty-quote-start-backspace-R1.json)、[R2](./dom/H01-empty-quote-start-backspace-R2.json)。
[空引用建样](./dom/H00-empty-quote-deletion-fixture.json)只删除 Quote 文字，保留引用父容器及空 text 子块；后方仍为独立末空 ordered。
真实点击空子块并 Cmd+Left 后，可信 Backspace 前的光标为子块 U+200B:0。
Backspace 移除引用父容器，空 text 子块成为顶层兄弟；末空 ordered 保留，可见数据块由 7 减为 6。
空子块外层 n13598/ID149 保持；不是删除空子块，也没有与前面的折叠列表或后方空项合并。
Undo 恢复引用包裹，Redo 再移除，再 Undo 恢复；动作后与历史读数的占位光标为 U+200B:1。
R1 引用父块原 ID148，Undo 重建 ID184，最终恢复 ID185；R2 从 ID185 开始，Undo 重建 ID186，最终恢复 ID187。
子块复用与父容器重建分别断言，不声称整个引用身份复原。
Alpha、编号 H9 Beta、Gamma、折叠 IndentParent、末空 ordered 及页标题保持；两轮主观察器 errors/overflow 为空。
复刻验收固定单个空 text 子块、精确开头光标及外部后继，核对只解除包裹、子块及邻块保护和三步历史。
不推广含多个空段的引用、引用内部非首段、嵌套引用或跨容器选择删除；未独立重载。

## 6 REQ-S08-H01-025 空引用前向删除外部末空项

状态：同前置双轮及三步历史已验证。
证据：[R1](./dom/H01-empty-quote-delete-tail-R1.json)、[R2](./dom/H01-empty-quote-delete-tail-R2.json)。
前置为上述恢复后的空引用，子块 U+200B:0；后方紧邻一个顶层空 ordered。
可信 Delete 删除外部末空 ordered，引用父容器 n20484/ID187 和空子块 n13598/ID149 均保持，可见节点由 7 减为 6。
引用没有取消、空子块没有提升，也没有新增文字；动作及历史后的占位光标为 U+200B:1。
Undo 恢复外部空 ordered，Redo 再删除，再 Undo 恢复。
R1 末空项原 ID109，Undo 重建 ID188，最终恢复 ID189；R2 从 ID189 开始，Undo 重建 ID190，最终恢复 ID191。
只对实际删除的末空项允许重建，引用内外身份和前方四个内容块、页标题均受保护。
两轮主观察器 errors/overflow 为空；不推广后继非空列表、普通正文或其他引用，未独立重载。
复刻验收核对真实前向 Delete、容器及子块保持、只删除指定外部空项和完整历史。

## 7 空引用建样清理与输入通道恢复

四轮均已恢复到空引用建样，再通过[清理](./dom/H00-empty-quote-deletion-fixture-cleanup.json)一次已知 Undo 恢复 Quote 文字。
恢复后为 7 个可见数据块、原折叠混合语义结构，外接屏布局下签名为 `4f39978a33b551b59e58f1804af8103437237c77c094785d064a995f2a033c33`。
清理前曾发生控制台输入未送达/焦点失效，未确认执行的请求没有当作成功；浏览器标签 DOM 连接重试超时导致控制内核重置。
重新建立原生连接后，先读到 active=null、上一完成操作为 Delete R2、Quote 仍为空，才执行清理；没有盲目重复 Undo。
原生入口探针残留在控制台提示中时，首条读取被插入字符串而未执行；提示清空后正式读取成功。该通道问题不归为飞书删除规则。
当前窗口仍在外接 24B36HE，最终清空、移回内建屏及 Chrome/夸克独立保存读取尚未执行。
## 8 REQ-S08-H01-026 编号 H9 末尾 Delete 合入下一普通段

状态：固定同前置 R1/R2 及 Undo/Redo/Undo 已验证；H1 对照见第 9 节。
证据：[R1](./dom/H01-numbered-H9-end-delete-next-text-R1.json)、[R2](./dom/H01-numbered-H9-end-delete-next-text-R2.json)。
真实光标为编号 H9 Beta:4，后方紧邻独立普通正文 Gamma；可信前向 Delete 将两段合为编号 H9 BetaGamma。
H9 类型与编号 1. 保留，不插空格或换行；可见节点由 7 减为 6，光标为 BetaGamma:4，位于原文字边界。
目标外层 n1107/ID102 保持，原 Gamma 被移除；折叠列表父项、引用父子、末空 ordered、Alpha 和页标题保持。
单次 Undo 恢复独立 Gamma 及 Beta:4，Redo 再合并并回 BetaGamma:4，再 Undo 恢复。
R1 Gamma 原 ID179，Undo 重建 ID247，最终恢复 ID248；R2 从 ID248 开始，Undo 重建 ID249，最终恢复 ID250。
不声称被删除 Gamma 的原身份复原；目标 H9 与未删除邻块的身份分别保护。
两轮 errors/overflow 为空；只覆盖编号 H9→普通段的前向合并，不推广 H1、无编号标题或其他后继类型。
复刻验收核对精确末端光标、仅下一普通段迁入、标题/编号保持、删除块重建、邻块保护及完整历史。

## 9 REQ-S08-H01-027 编号 H1 末尾 Delete 合入下一普通段

状态：固定同前置双轮及 Undo/Redo/Undo 已验证。
证据：[H1 建样](./dom/H00-numbered-H1-end-delete-fixture.json)、[R1](./dom/H01-numbered-H1-end-delete-next-text-R1.json)、[R2](./dom/H01-numbered-H1-end-delete-next-text-R2.json)、[建样清理](./dom/H00-numbered-H1-end-delete-fixture-cleanup.json)。
先用真实 Cmd+Alt+1 将编号 H9 Beta 转为编号 H1，文字、相邻结构及目标外层 n1107/ID102 保持。
每轮从 Beta:4 执行一次可信前向 Delete，后继普通段 Gamma 合入，成为编号 H1 BetaGamma，可见节点由 7 变 6；H1 类型和编号 1. 保留，无附加分隔符，光标仍在原文字边界 4。
Undo 恢复独立 Gamma 及 Beta:4，Redo 再合并及 BetaGamma:4，再 Undo 恢复；标题与其他未删除块外层身份保持。
R1 Gamma 原 ID250，Undo 重建 ID273，最终恢复 ID274；R2 从 ID274 开始，Undo 重建 ID275，最终恢复 ID276。
全文结构/样式签名逐步一致，另存的正文语义签名独立核对；不把删除块重建写成原身份复原。
双轮 errors/overflow 为空。结束后只撤销已知 H1 建样转换，恢复 H9 及原混合版本相同语义签名；尚未执行 Chrome 独立重载。
与第 8 节形成 H1/H9 两个实际端点对照，不推断 H2–H8、无编号标题或其他后继块的所有组合。
