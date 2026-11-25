# S02 已实测验收矩阵

状态：[✅] S02的B01–B11研究完成，共170条实测分支，供重构后复测；项目实现验收尚未执行。主需求与逐小项进度见[阶段需求](./02-creation-and-editing.md)，范围与阶段顺序见[总任务](../ym-research-task.md)。

- [✅] 已有证据对应验收用例持续整理；本轮新增前台 Chrome 实测，历史环境记录与新增功能证据分别保留。
- [✅] H4 输入规则创建历史已在新会话 R1/R3 重复实测；R2 焦点失败保留且排除于历史通过计数。
- [✅] H5–H9 输入规则实际创建、首字符与已测时序历史已逐级复测；H5 快速/延迟分支分别保留。
- [✅] 页标题、标题换行、创建入口、列表、引用和组合输入的约定研究范围已完成；抽样、失败及证据限制见对应子文件。

## 统一复测口径

每行使用指定起点及相同输入方式执行，在操作前后采集必要 DOM、MutationObserver 记录、节点身份、逻辑行、文字码点、焦点、选区、菜单和保存提示。每种历史分别执行撤销、重做、再次撤销，逐步对照；后续用例从明确恢复的起点开始。

JSON 中 n/q 引用只在同一 session 内表示身份，复刻验收比较复用/新建关系，不要求生成相同随机 ID 或作者 class。DOM 标识按 maiya 约定规范化，SVG 路径、重复结构及无关块只作为必要计数或省略项。

变化顺序与结构必须能解释最终行为；原始计数保留作证据，但同值属性写入、保存时机和外围噪声不直接变成固定 mutation 总数要求。既要检查结果，也要区分新增、移除、移动和内部编辑区替换。

不可把 U+200B 全部删除后比较用户文字；只有真实 data-enter 叶可按编辑器哨兵处理。软换行逻辑行与 DOM textContent 分开比较，复制输出规则尚须另行实际验证。

“已经保存到云端”仅通过 UI 提示核对，不能代替服务器持久化、刷新恢复或并发验收。页面 error、console 方法和引擎 DevTools 日志分别判断；没有采集的日志不能记为零错误。

## 文本创建与基本编辑

| 用例 | 起点与真实操作 | 对照结果与必要 DOM 合同 | 已采证据 |
| --- | --- | --- | --- |
| V02-01 | 唯一空正文，真实数字键 1 | 原块/区/行/空叶保留，新增正常文字叶，文字偏移 1，占位消失，页标题不变 | [首字符](./dom/text-first-character.json) |
| V02-02 | 正文 1，Cmd+Left 后输入 2 | 21，原文字叶复用，光标偏移 1，原块保留 | [首中尾插入](./dom/text-insertions.json) |
| V02-03 | 2[光标]1，输入 3 | 231，原文字叶复用，光标偏移 2 | 同上 |
| V02-04 | 正文 231，Cmd+Right 后输入 1 | 2311，原文字叶复用，光标偏移 4 | 同上 |
| V02-05 | 上述局部输入逐项撤销/重做/恢复 | 尾部偏移 3/4/3；中间 1/2/1；首部 0/1/0，文字叶复用 | [插入历史](./dom/text-insertion-history.json) |
| V02-06 | 首字符撤销/重做/恢复 | 回原空叶；重做新增文字对象；再撤销回原空叶，与非空局部插入不同 | 首字符 JSON |
| V02-07 | 空正文真实输入一/两空格 | 保留 U+0020 及连续空格，不按 trim 判空；正常文字叶与 non-empty 状态 | [空格](./dom/text-spaces.json) |
| V02-08 | 两空格依次 Backspace，最后删除撤销/重做 | 中间留一空格，最后回原空叶；一次撤销只恢复最后一空格，不恢复两字符 | 同上（含中间 checkpoint） |
| V02-09 | 唯一空正文真实 Enter 两次 | 每次新空块插在原块前，第二次顺序为首新块/第二新块/原块；光标原空叶保持 | [空块 Enter](./dom/text-empty-enter.json) |
| V02-10 | 两次空 Enter 分别做历史 | 每次撤销移除对应新块；重做用新 DOM 对象，原块/选区保留；最后占位恢复 | 同上 |
| V02-11 | 唯一空正文，真实纯文本 paste 123 | 原块/区/空叶保留，新增文字叶，光标文字偏移 3；不能用直接写 DOM 代替 | [粘贴样例](./dom/text-split-fixture.json) |
| V02-12 | [光标]123，真实 Enter | 前方新空块，原块保持完整 123，光标原文字偏移 0 | [段落拆分](./dom/text-paragraph-splits.json) |
| V02-13 | 1[光标]23，真实 Enter | 原块保留前段 1，后方新块为 23，光标新文字偏移 0，同父顺序正确 | 同上 |
| V02-14 | 123[光标]，真实 Enter | 原块保留 123，后方新空块，光标新空叶偏移 1 | 同上 |
| V02-15 | 文本首中尾 Enter 各自做历史 | 各自回原单段/对应偏移；重做新增块为新对象；无丢字、重复字或串入前一用例 | 同上 |
| V02-16 | [光标]123，真实 Shift+Enter 与历史 | 同块内新增前置空行，原文字偏移 0；重做空行是新对象，块与原行保留 | [首中软换行](./dom/text-softbreaks.json) |
| V02-17 | 1[光标]23，真实 Shift+Enter 与历史 | 同块两行 1/23；光标后行文字偏移 0；撤销回原文字偏移 1，重做后行新文字 | 同上 |
| V02-18 | 123[光标]，真实 Shift+Enter 与历史 | 同块两行 123/空行，光标后行空叶偏移 1；撤销原文字偏移 3，重做新空叶 | [段尾软换行](./dom/text-softbreak-tail.json) |
| V02-19 | 唯一空块，真实 Shift+Enter 与历史 | 同块两空行、移除 isEmpty、占位隐藏；原空叶偏移 1保持；撤销一空行恢复占位 | [空块软换行](./dom/text-softbreak-empty.json) |

## 标题、菜单及输入规则

| 用例 | 起点与真实操作 | 对照结果与必要 DOM 合同 | 已采证据 |
| --- | --- | --- | --- |
| V02-20 | 唯一空正文，真实 / | 默认菜单出现 H1/H2/H3、文本、两种列表和引用；呈现搜索提示，用户 / 已插入 | [斜杠菜单](./dom/text-slash-open.json) |
| V02-21 | 斜杠菜单展开，真实 Escape | 菜单/搜索提示关闭，保留 /、原块及文字偏移 1；取消不等于删除输入 | [斜杠取消](./dom/text-slash-cancel.json) |
| V02-22 | / 输入撤销/重做/恢复 | 空正文 → 文本 / → 空正文；字符重做不会自动重开菜单 | [斜杠历史](./dom/text-slash-history.json) |
| V02-23 | 空正文 / 后真实点击 H1 | 消费 /；外层块/业务身份保留，内部区/行/空叶重建；H1 占位与 26px/500/36.4px | [H1 创建](./dom/text-heading-h1.json) |
| V02-24 | 空正文 / 后真实点击 H2 | 消费 /；外层保留、内部重建；H2 占位与 22px/500/30.8px | [H2 创建](./dom/text-heading-h2.json) |
| V02-25 | 空正文 / 后真实点击 H3 | 消费 /；外层保留、内部重建；H3 占位与 20px/500/28px | [H3 创建](./dom/text-heading-h3.json) |
| V02-26 | H1/H2/H3 空标题分别真实输入 1 | 块/区/空叶保留，新增正常文字叶、偏移 1，默认样式及页标题保持 | 上述各级创建 JSON |
| V02-27 | H1/H2/H3 首字符分别做历史 | 撤销回原空叶、重做新文字对象、再次撤销空标题；类型不退回文本 | [H1 文字历史](./dom/text-heading-h1-history.json)、[H2 历史](./dom/text-heading-h2-history.json)、[H3 历史](./dom/text-heading-h3-history.json) |
| V02-28 | H1/H2/H3 创建分别做历史 | 撤销文本 /，重做空标题，再撤销文本 /；外层保留、内部重建；不自动重开菜单 | [H1 创建历史](./dom/text-heading-h1-create-history.json)、H2/H3 历史 JSON |
| V02-29 | H1 的 1，Shift+Left 后展开标题/其他标题 | 范围 1→0 保持；实际可达正文与 H1–H9，H1 当前项 actived、触发项 hovered；未发生转换 | [标题菜单](./dom/text-heading-menu.json) |
| V02-30 | 两层标题菜单展开，真实 Escape 一次 | 两层标题菜单关闭、浮动文字工具栏保留，文字/H1/范围选区不变 | 同上 |
| V02-31 | 唯一空文本，真实 #### 后空格 | 空格前仍是 #### 文本；空格触发空 H4，前缀/空格被消费、内部重建；18px/500/25.2px | [H4 输入规则](./dom/text-heading-h4-rule.json)（含 checkpoint） |
| V02-32 | 空 H4 真实输入 1，随后做文字历史 | 区/空叶保留，新增正常文字叶；撤销回原空叶、重做新文字对象，H4 类型与页标题保持 | [H4 文字历史](./dom/text-heading-h4-history.json)及 H4 输入规则 JSON |
| V02-33 | 新会话唯一空正文，真实 #### 加空格创建 H4，再 Cmd+Z/Cmd+Shift+Z；重建起点重复 | R1/R3 撤销恢复正文 `#### `、光标独立空格叶偏移 1；重做空 H4、新空叶偏移 1；外层业务身份保持、内部区均重建 | [H4 创建历史重复](./dom/text-heading-h4-create-history-repeat.json)、[创建重复](./dom/text-heading-h4-create-repeat.json)；R2 [焦点失败](./dom/text-heading-h4-focus-recovery.json)不计通过 |
| V02-34 | 唯一空正文，五井号加空格创建 H5；较长间隔后输入 1，分别撤销/重做文字和创建 | 空 H5 为 16px/500/22.4px；文字历史区保留、重做新文字叶；创建撤销恢复 `##### `、重做内部区重建；外层身份保持 | [H5 R1](./dom/text-heading-h5-observed-r1.json)、[延迟 R3](./dom/text-heading-h5-repeated-r3.json)，实际间隔分别保留，不推定阈值 |
| V02-35 | 同一 H5 输入规则，创建后紧接输入 1（已测状态间隔 0.602/0.624 秒） | 一次撤销同时恢复前缀 `##### `；重做恢复 H5 1；再撤销前缀、继续撤销空正文 | [H5 R2](./dom/text-heading-h5-observed-r2.json)、[连续 R4](./dom/text-heading-h5-repeated-r4.json) |
| V02-36 | 唯一空正文，六井号加空格创建 H6；较长间隔输入 1，文字与创建历史分别回放 | heading6/H6 占位、16px/500/22.4px；文字区复用、创建历史内部重建、撤销创建保留六井号和空格；最终空正文 | [H6 R1](./dom/text-heading-h6-r1.json)、[H6 R2](./dom/text-heading-h6-r2.json) |
| V02-37 | 同上独立用七井号创建 H7 | 目标必须 heading7；文字与创建历史、空叶/文字叶偏移及最终恢复按本级步骤验收 | [H7 R1](./dom/text-heading-h7-r1.json)、[H7 R2](./dom/text-heading-h7-r2.json) |
| V02-38 | 同上独立用八井号创建 H8 | 目标必须 heading8；已测较长间隔下历史分离，外层身份与页标题保持；隐藏日志缺口保留 | [H8 R1](./dom/text-heading-h8-r1.json)、[H8 R2](./dom/text-heading-h8-r2.json) |
| V02-39 | 同上独立用九井号创建 H9 | 目标必须 heading9；历史分离、内部重建及最终空正文；网络错误与页面监听结果分开，不判持久化通过 | [H9 R1](./dom/text-heading-h9-r1.json)、[H9 R2](./dom/text-heading-h9-r2.json) |
| V02-40 | 唯一空正文，真实 * 加空格创建无序首项；读取标记后输入 1、文字与创建历史分别回放 | bullet 圆点与正文区分离；文字区复用、创建历史内部重建、撤销创建保留 `* `，外层与页标题保持 | [无序首项 R1](./dom/text-unordered-first-r1.json)、[R2](./dom/text-unordered-first-r2.json) |
| V02-41 | 唯一空正文，真实 1. 加空格创建有序首项；同序核对文字与创建历史 | ordered 编号为不可编辑独立按钮 `1.`；撤销创建保留 `1. `，重做内部区重建 | [有序首项 R1](./dom/text-ordered-first-r1.json)、[R3](./dom/text-ordered-first-r3.json)；异常 R2/恢复独立保留 |
| V02-42 | 唯一无序首项 123、尾光标偏移 3；Enter、撤销/重做/撤销 | 新增同父后置空 bullet，首项区/文字保留；重做新项/新区/空叶偏移 1，撤销回原文字偏移 3 | [无序段尾 R1](./dom/text-unordered-tail-r1.json)、[R2](./dom/text-unordered-tail-r2.json) |
| V02-43 | 同父无序两项 123/空项；后置空项 Enter、独立撤销/重做/撤销 | 后置外层身份保留、内部 bullet/text 反复重建，块数仍二、首项不变；不新增第三块 | [无序空项 R1](./dom/text-unordered-empty-enter-r1.json)、[R2](./dom/text-unordered-empty-enter-r2.json) |
| V02-44 | 唯一有序首项 123、尾光标偏移 3；同序段尾 Enter 历史 | 首项保持 1./123，新后置空项为 2.；撤销/重做顺序、身份、选区正确，重做新 DOM | [有序段尾 R1](./dom/text-ordered-tail-r1.json)、[R2](./dom/text-ordered-tail-r2.json) |
| V02-45 | 同父有序两项 1./123、2./空项；后置空项 Enter、独立历史 | 后置外层身份保留、ordered/text 内部重建，编号消失/恢复为 2.，首项不变、块数仍二 | [有序空项 R1](./dom/text-ordered-empty-enter-r1.json)、[R2](./dom/text-ordered-empty-enter-r2.json) |

## 引用创建与历史

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-46 | 唯一空正文 `/`，点击“引用”，在引用内输入 1；R2/R3 重建起点重复 | 消费触发字符，新建 quote_container，原 text 块移动为唯一子块，原区与空叶保持；页标题不变，文字叶新增/光标偏移 1，无额外正文兄弟 | [R2](./dom/text-quote-slash-r2.json)、[R3](./dom/text-quote-slash-r3.json) |
| V02-47 | 引用 1，文字撤销/重做/撤销，再创建撤销/重做/撤销 | 文字独立历史；创建撤销移除容器、原 text 回正文、区保持、恢复 `/` 且菜单不重开；重做用新容器及子 wrapper，原 text/区移入、空叶偏移 1 | 同上；[首轮额外块](./dom/text-quote-slash-extra-r1.json)不计稳定历史 |

## 引用分段与软换行（2026-10-14 接续）

以下均用新会话必要 JSON；引用/文字样例相同，可信按键前精确选区一致。连续 Enter 合并历史及未取得正文焦点的 selectText 窗口只作观察/失败，不纳入这些固定选区用例。

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-48 | 引用唯一 text=123，Cmd+Left/三次 Right 到文字偏移 3；Enter、撤销/重做/撤销 | 引用内新增后置空 text，原段保持；撤销回文字尾、重做新块/区/空叶偏移 1 | [固定 R1](./dom/text-quote-tail-fixed-r1.json)、[R2](./dom/text-quote-tail-fixed-r2.json) |
| V02-49 | 引用两 text=123/空段，空叶偏移 1；Enter、独立历史 | 同一空块/区/空叶移至引用之后，撤销移回、重做移出；原引用/123 保持 | [退出 R1](./dom/text-quote-empty-exit-fixed-r1.json)、[R2](./dom/text-quote-empty-exit-fixed-r2.json) |
| V02-50 | 引用 text=123，文字尾偏移 3；Shift+Enter 及历史 | 同区新增第二空行，保持唯一 text；撤销原文字尾、重做新行/空叶 | [软换行尾 R1](./dom/text-quote-softbreak-tail-r1.json)、[R2](./dom/text-quote-softbreak-tail-r2.json) |
| V02-51 | 同样例文字首偏移 0；Enter 及历史 | 引用内原段前新增空 text，光标留原文字首；重做新前置段 | [Enter 首 R1](./dom/text-quote-enter-head-r1.json)、[R2](./dom/text-quote-enter-head-r2.json) |
| V02-52 | 同样例文字偏移 1；Enter 及历史 | 同引用拆成 1/23 两 text，后段文字偏移 0；撤销原区123/偏移1，重做新后段 | [Enter 中 R1](./dom/text-quote-enter-middle-r1.json)、[R2](./dom/text-quote-enter-middle-r2.json) |
| V02-53 | 同样例文字首偏移 0；Shift+Enter 及历史 | 同区原行前新增空行，原文字首光标保持，唯一 text 不变；重做新空行 | [软换行首 R1](./dom/text-quote-softbreak-head-r1.json)、[R2](./dom/text-quote-softbreak-head-r2.json) |
| V02-54 | 同样例文字偏移 1；Shift+Enter 及历史 | 同区两行 1/23，后行文字偏移 0；撤销/重做保持引用、原区与原文字 | [软换行中 R1](./dom/text-quote-softbreak-middle-r1.json)、[R2](./dom/text-quote-softbreak-middle-r2.json) |

## 无序列表首中部拆分（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-55 | 唯一 bullet=123、文字偏移0；Enter/撤销/重做/撤销，两轮 | 新增同父前置空 bullet，原项/文字/区保持，光标留原文字首；重做新前置项 | [首部 R1](./dom/text-bullet-enter-head-r1.json)、[R2](./dom/text-bullet-enter-head-r2.json) |
| V02-56 | 同样例文字偏移1；Enter及相同历史 | 原项保留1、新后置bullet=23、后段文字偏移0；撤销合回123/偏移1，重做新后项 | [中部 R1](./dom/text-bullet-enter-middle-r1.json)、[R2](./dom/text-bullet-enter-middle-r2.json) |

## 有序列表首中部拆分（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-57 | 唯一ordered=1./123，文字偏移0；Enter及历史，两轮 | 新增前置空1.，原项变2./123、原区/光标保持；撤销/重做同时恢复编号，新项重做新对象 | [首部R1](./dom/text-ordered-enter-head-r1.json)、[R2](./dom/text-ordered-enter-head-r2.json) |
| V02-58 | 同样例文字偏移1；Enter及历史 | 同父1./1、2./23，后段文字偏移0；撤销原123/偏移1，重做新后项及正确编号 | [中部R1](./dom/text-ordered-enter-middle-r1.json)、[R2](./dom/text-ordered-enter-middle-r2.json) |

## 有序列表软换行（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-59 | 唯一ordered=1./123，文字偏移0；Shift+Enter及历史，两轮 | 同区原行前新增空行，仍单项1.，光标原文字首；历史移除/重建新行 | [R1](./dom/text-ordered-softbreak-head-r1.json)、[R2创建](./dom/text-ordered-softbreak-head-r2.json)、[R2历史补测](./dom/text-ordered-softbreak-head-history-r2.json)；中途焦点失效保留 |
| V02-60 | 同样例文字偏移1；Shift+Enter及历史 | 同项两行1/23、后行文字偏移0；撤销123/偏移1，重做新行，编号保持1. | [中部R1](./dom/text-ordered-softbreak-middle-r1.json)、[R2](./dom/text-ordered-softbreak-middle-r2.json) |
| V02-61 | 同样例文字偏移3；Shift+Enter及历史 | 同项后置空行/空叶偏移1；撤销123尾、重做新行/空叶，仍单项1. | [尾部R1](./dom/text-ordered-softbreak-tail-r1.json)、[R2](./dom/text-ordered-softbreak-tail-r2.json) |

## 无序列表软换行（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-62 | 唯一bullet=123，文字偏移0；Shift+Enter及历史，两轮 | 同区原行前新增空行，仍单项单圆点，光标原文字首；历史移除/重建新行 | [首部R1](./dom/text-bullet-softbreak-head-r1.json)、[R2](./dom/text-bullet-softbreak-head-r2.json) |
| V02-63 | 同样例文字偏移1；Shift+Enter及历史 | 同项两行1/23、后行文字偏移0；撤销123/偏移1，重做新行，圆点保持一个 | [中部R1](./dom/text-bullet-softbreak-middle-r1.json)、[R2](./dom/text-bullet-softbreak-middle-r2.json) |
| V02-64 | 同样例文字偏移3；Shift+Enter及历史 | 同项后置空行/空叶偏移1；撤销123尾、重做新行/空叶，仍唯一bullet | [尾部R1](./dom/text-bullet-softbreak-tail-r1.json)、[R2](./dom/text-bullet-softbreak-tail-r2.json) |

## 唯一空列表首项退出（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-65 | 唯一空bullet、空叶偏移1；Enter及历史，两轮 | 原外层转text、标记移除、区重建，唯一块数保持；历史恢复bullet/text与新空叶选区 | [无序R1](./dom/text-bullet-empty-first-enter-r1.json)、[R2](./dom/text-bullet-empty-first-enter-r2.json) |
| V02-66 | 唯一空ordered=1.、空叶偏移1；Enter及历史，两轮 | 原外层转text，历史恢复编号1.、每步区/空叶新对象，唯一块数/空页标题保持 | [有序R1](./dom/text-ordered-empty-first-enter-r1.json)、[R2](./dom/text-ordered-empty-first-enter-r2.json) |

## 唯一空列表首项软换行（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-67 | 唯一空ordered=1.、原空叶偏移1；Shift+Enter及历史，两轮 | 同区原空行前新增空行，原区/行/空叶保持，仍单项1.；重做新前置行，光标原空叶不变 | [有序R1](./dom/text-ordered-empty-softbreak-r1.json)、[R2](./dom/text-ordered-empty-softbreak-r2.json) |
| V02-68 | 唯一空bullet、原空叶偏移1；Shift+Enter及历史，两轮 | 同区前置空行、仍单项单圆点、原空叶选区保持；历史移除/重建新行 | [无序R1](./dom/text-bullet-empty-softbreak-r1.json)、[R2](./dom/text-bullet-empty-softbreak-r2.json) |

## 中文组合输入基本确认与取消（2026-10-14）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-69 | 唯一空text，真实n/i/空格，两轮均有composition链 | 临时n/ni附原哨兵叶，空格确认只提交你、无额外空格或段；原区保持、光标普通文字偏移1、组合结束 | [确认R1](./dom/text-ime-candidate-probe-r1.json)、[R2](./dom/text-ime-candidate-probe-r2.json)；compositionend可信标志false如实保留 |
| V02-70 | 各轮确认你后Cmd+Z/重做/再撤销 | 一次撤销回原空叶，重做新文字你/偏移1，再撤销原空叶；不恢复临时拼音、不改块/区 | [历史R1](./dom/text-ime-candidate-history-r1.json)、[R2](./dom/text-ime-candidate-history-r2.json) |
| V02-71 | 同一空起点n/i/Escape，两轮 | 取消清除临时ni、原空叶/偏移1保持，组合结束、无汉字或新增段 | [取消R1](./dom/text-ime-candidate-cancel-r1.json)、[R2](./dom/text-ime-candidate-cancel-r2.json)；取消历史未测 |
| V02-72 | 同一空text，真实n/i/Enter及历史，两轮 | 组合Enter只提交ni、结束组合、仍单段；一次撤销空、重做新ni文字/偏移2，再撤销原空叶 | [EnterR1](./dom/text-ime-enter-r1.json)、[R2](./dom/text-ime-enter-r2.json) |
| V02-73 | 同一空text，n/i/Backspace/i/空格及历史，两轮 | 临时ni删除为n/组合继续、再次i后只确认你；整字历史和准确落点恢复，无重复/分块 | [删除续输入R1](./dom/text-ime-backspace-r1.json)、[R2](./dom/text-ime-backspace-r2.json) |

## H1 分段（续测）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-74 | 唯一H1=123，文字偏移0；Enter及历史，两轮 | 前置空text、原标题/区/文字保持，光标原文字首；重做新前置正文 | [首部R1](./dom/text-heading1-enter-head-r1.json)、[R2](./dom/text-heading1-enter-head-r2.json) |
| V02-75 | 同样例文字偏移1；Enter及历史 | 拆成同父H1=1/H1=23、光标后段首；撤销原123/偏移1，重做新后标题 | [中部R1](./dom/text-heading1-enter-middle-r1.json)、[R2](./dom/text-heading1-enter-middle-r2.json) |
| V02-76 | 同样例文字偏移3；Enter及历史 | 后置空text、光标新空叶偏移1；原标题保持、撤销原文字尾、重做新正文 | [尾部R1](./dom/text-heading1-enter-tail-r1.json)、[R2](./dom/text-heading1-enter-tail-r2.json) |

## H1 软换行（续测）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-77 | 唯一H1=123，文字偏移0；Shift+Enter及历史，两轮 | 同区原行前新增空行，原文字首光标保持；重做新空行、仍唯一H1 | [首部R1](./dom/text-heading1-softbreak-head-r1.json)、[R2](./dom/text-heading1-softbreak-head-r2.json) |
| V02-78 | 同样例文字偏移1；Shift+Enter及历史 | 同区两行1/23，光标后行文字首；撤销原123/偏移1，重做新后行 | [中部R1](./dom/text-heading1-softbreak-middle-r1.json)、[R2](./dom/text-heading1-softbreak-middle-r2.json) |
| V02-79 | 同样例文字偏移3；Shift+Enter及历史 | 同区后置空行/空叶偏移1；撤销原文字尾，重做新行/空叶，H1级别保持 | [尾部R1](./dom/text-heading1-softbreak-tail-r1.json)、[R2](./dom/text-heading1-softbreak-tail-r2.json) |

## 空 H1 换行（续测）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-80 | 唯一空H1、原空叶偏移1；Enter及历史，两轮 | 空H1保持、后置新增普通text/新空叶偏移1；撤销原标题空叶、重做新正文 | [空EnterR1](./dom/text-heading1-empty-enter-r1.json)、[R2](./dom/text-heading1-empty-enter-r2.json) |
| V02-81 | 同样例Shift+Enter及历史 | 同区原空行之前新增空行，仍唯一H1、原区/行/空叶与光标保持；重做新前置行 | [空软换行R1](./dom/text-heading1-empty-softbreak-r1.json)、[R2](./dom/text-heading1-empty-softbreak-r2.json) |

## H2 分段（续测）

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-82 | 唯一H2=123，文字偏移0；Enter及历史，两轮 | 新增前置空text、原H2/区/文字及光标保持；重做新前置正文 | [首部R1](./dom/text-heading2-enter-head-r1.json)、[R2](./dom/text-heading2-enter-head-r2.json) |
| V02-83 | 同样例文字偏移1；Enter及历史 | 同父H2=1/H2=23、后段首光标；撤销原123/偏移1、重做新后H2 | [中部R1](./dom/text-heading2-enter-middle-r1.json)、[R2](./dom/text-heading2-enter-middle-r2.json) |
| V02-84 | 同样例文字偏移3；Enter及历史 | 后置空text/空叶偏移1、原H2保持；撤销原文字尾、重做新正文；R1切换期间记录保留 | [尾部R1](./dom/text-heading2-enter-tail-r1.json)、[R2](./dom/text-heading2-enter-tail-r2.json) |

## 既有 H2 软换行证据与新抽样口径

sir已调整为后续仅实测H1/H9，中间级别共同规则允许推断、不计实测；下列两条是调整前已完成并保留的真实窗口，H2余下位置不再重复验证。两端规则冲突时不得抹去差异或写成无条件一致。

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-85 | 唯一H2=123、文字偏移0；Shift+Enter及历史，两轮 | 同区前置空行，原文字/光标保持、仍唯一H2；重做新行 | [首部R1](./dom/text-heading2-softbreak-head-r1.json)、[R2](./dom/text-heading2-softbreak-head-r2.json) |
| V02-86 | 同样例文字偏移1；Shift+Enter及历史 | 同区两行1/23、后行首光标；撤销原123/偏移1，重做新行 | [中部R1](./dom/text-heading2-softbreak-middle-r1.json)、[R2](./dom/text-heading2-softbreak-middle-r2.json) |

## H9 分段两端对照

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-87 | 唯一H9=123，文字偏移0；Enter及历史，两轮 | 前置空text、原H9/区/文字及文字首光标保持，重做新前置段；与H1对应行为一致 | [首部R1](./dom/text-heading9-enter-head-r1.json)、[R2](./dom/text-heading9-enter-head-r2.json) |
| V02-88 | 同样例文字偏移1；Enter及历史 | 同父H9=1/H9=23、后段首光标；撤销123/偏移1，重做新后H9 | [中部R1](./dom/text-heading9-enter-middle-r1.json)、[R2](./dom/text-heading9-enter-middle-r2.json) |
| V02-89 | 同样例文字偏移3；Enter及历史 | 后置空text/空叶偏移1，原H9保持；撤销原文字尾、重做新正文 | [尾部R1](./dom/text-heading9-enter-tail-r1.json)、[R2](./dom/text-heading9-enter-tail-r2.json) |

## H9 软换行两端对照

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-90 | 唯一H9=123，文字偏移0；Shift+Enter及历史，两轮 | 同区前置空行，原文字首光标保持、仍唯一H9；重做新行 | [首部R1](./dom/text-heading9-softbreak-head-r1.json)、[R2](./dom/text-heading9-softbreak-head-r2.json) |
| V02-91 | 同样例文字偏移1；Shift+Enter及历史 | 同区两行1/23、后行首光标；撤销123/偏移1，重做新后行 | [中部R1](./dom/text-heading9-softbreak-middle-r1.json)、[R2](./dom/text-heading9-softbreak-middle-r2.json) |
| V02-92 | 同样例文字偏移3；Shift+Enter及历史 | 同区后置空行/空叶偏移1；撤销原文字尾、重做新行，H9级别保持 | [尾部R1](./dom/text-heading9-softbreak-tail-r1.json)、[R2](./dom/text-heading9-softbreak-tail-r2.json) |

## 空 H9 两端对照

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-93 | 唯一空H9、原空叶偏移1；Enter及历史，两轮 | 保持空H9、新增后置text，新空叶偏移1；历史回原标题或重做新正文；R1临时隐藏输入选区与随后稳定原空叶事件分开 | [空EnterR1](./dom/text-heading9-empty-enter-r1.json)、[R2](./dom/text-heading9-empty-enter-r2.json) |
| V02-94 | 同样例Shift+Enter及历史 | 同区前置空行、原H9/区/行/空叶与光标保持；重做新行 | [空软换行R1](./dom/text-heading9-empty-softbreak-r1.json)、[R2](./dom/text-heading9-empty-softbreak-r2.json) |

H2–H8的8条共同规则见[两端对照与推断](./02-heading-editing.md)，状态为推断、来源sir授权抽样，不算新增中间级别实测。H1/H9共8场景16组运行的行为/稳定光标对照一致，布局/字号、mutation次数与临时焦点状态不宣称全部一致。

## 选区替换与失焦续输入

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-95 | 唯一text=123，反向选择23；真实9、4及一次撤销/重做，两轮 | 替换19/文字2，再194/文字3；撤销只移除4，重做194；原块/区/行保持，替换动作完整历史另见V02-97 | [首轮扩选](./dom/text-selection-replace-r1.json)、[R1完成](./dom/text-selection-replace-complete-r1.json)、[R2](./dom/text-selection-replace-complete-r2.json) |
| V02-96 | 唯一text=194、文字1，打开/关闭开发者工具后真实8及历史，两轮 | 1894/文字2；撤销194/文字1，重做1894/文字2；不落段尾或旧范围，仅覆盖同标签工具失焦 | [R1](./dom/text-focus-resume-r1.json)、[R2](./dom/text-focus-resume-r2.json) |
| V02-97 | 123反向选择23→9→4，撤销到替换前再重做，两轮 | 回123时恢复正向1→3范围；R1一次撤销/重做合并9和4，R2两次分开；最终194/文字3，不据此确定时间阈值 | [历史R1](./dom/text-selection-history-r1.json)、[R2](./dom/text-selection-history-r2.json) |
| V02-98 | 123反向选择23，纯文本粘贴56、续输入7及完整历史，两轮 | 156→1567/文字4；撤销156/文字3→123正向23范围，重做156→1567；R2粘贴V双帧仍旧状态，不据其判断完成 | [R1](./dom/text-paste-selection-r1.json)、[R2](./dom/text-paste-selection-r2.json) |

逐项需求、首轮焦点保护中止、恢复与未测边界见[选区编辑补测](./02-selection-editing.md)，中止及SETUP不增加通过项。

## Unicode删除与粘贴归一化

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-99 | 空text纯文本粘贴A😀B，尾部两次Backspace及历史，两轮 | UTF-16尾4→删B得A😀/3→删完整😀得A/1；撤销A😀/3、重做A/1，原区/行保持 | [R1](./dom/text-emoji-delete-r1.json)、[R2](./dom/text-emoji-delete-r2.json) |
| V02-100 | 空text粘贴Ae+U+0301+B，核对真实paste载荷和删除历史，两轮 | 载荷65/101/769/66，正文65/233/66；删B与é，偏移3→2→1；历史恢复合成é，不算分解重音DOM删除通过 | [载荷R1](./dom/text-combining-payload-r1.json)、[R2](./dom/text-combining-payload-r2.json) |
| V02-101 | 空text纯文本粘贴5/LF/6，续输入7及完整历史，两轮 | 同父两text块5/6、后块文字1→5/67/文字2；历史先7后整体粘贴，撤销回新空块，重做重建身份 | [LF R1](./dom/text-linebreak-lf-r1.json)、[R2](./dom/text-linebreak-lf-r2.json) |
| V02-102 | 同样例换行改为CRLF，两轮 | 载荷保留13/10，编辑后同父两text块及续输入/历史与LF角色一致；不宣称DOM身份或V早期快照相同 | [CRLF R1](./dom/text-linebreak-crlf-r1.json)、[R2](./dom/text-linebreak-crlf-r2.json) |

归一化定位、早期缺少载荷的观察、恢复与未测边界见[Unicode补测](./02-unicode-editing.md)，同一分支补证据不重复计数。

## 按词与跨块导航

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-103 | 单行one two，Option左右、Cmd首尾、Shift+Option扩选及Right折叠，两轮 | 按词4→0→3→7；扩选0→3，Right折叠3，Cmd+Right7，文字不变；首轮早期行尾快照仍旧状态 | [R1](./dom/text-word-navigation-r1.json)、[R2](./dom/text-word-navigation-r2.json) |
| V02-104 | 唯一空正文粘贴5/LF/6，最后块文字0开始左右/Down/Up及历史，两次明确同起点 | Left到前块文字1、Right回后块0；Down新增尾空text/空叶1，Up回后块0；撤销移新增空块，重做新身份；混合前置R2不计重复通过 | [首轮](./dom/text-cross-block-navigation-r1.json)、[同起点R3](./dom/text-cross-block-navigation-r3.json) |

已完成需求与混合前置恢复见[导航补测](./02-navigation-editing.md)，跨软换行/折叠区等仍未完成。

## 特殊字符正文边界

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-105 | 空正文粘贴AＢC，逐字删除及历史，两轮 | 保留U+FF22，尾3→删C偏移2→删Ｂ得A/1，历史恢复完整全角字 | [R1](./dom/text-special-fullwidth-body-r1.json)、[R2](./dom/text-special-fullwidth-body-r2.json) |
| V02-106 | 空正文粘贴A/NBSP/B，删除及历史，两轮 | 保留U+00A0，删除目标后A/1；撤销A/NBSP/2，不混为普通空格 | [R1](./dom/text-special-nbsp-body-r1.json)、[R2](./dom/text-special-nbsp-body-r2.json) |
| V02-107 | 空正文粘贴A/U+200B/B，载荷与删除历史，两次安全空态清理 | 用户零宽在粘贴后过滤、正文AB；删B/A回原空叶，哨兵与用户字分开；首轮额外清理失败不计重复通过 | [R2](./dom/text-special-zwsp-body-r2.json)、[R3](./dom/text-special-zwsp-body-r3.json) |
| V02-108 | 空正文粘贴A/U+200D/B，两轮 | 载荷含零宽连接符，正文AB；删B/A与历史按普通字，不宣称键入/富文本同样过滤 | [R1](./dom/text-special-zwj-body-r1.json)、[R2](./dom/text-special-zwj-body-r2.json) |
| V02-109 | 空正文粘贴A/Tab/B，删除及历史，两轮 | 展开八普通空格、尾10；删除B到9、删一空格到8，历史恢复该空格；不作为物理Tab缩进规则 | [R1](./dom/text-special-tab-body-r1.json)、[R2](./dom/text-special-tab-body-r2.json) |
| V02-110 | 混合Unicode粘贴、整行复制与文档信息计数，两轮 | pbpaste等于正文规范化文本，无哨兵；字数4/字符数8，计数两行DOM留证，不据单例确定算法 | [R1](./dom/text-special-copy-count-r1.json)、[R2](./dom/text-special-copy-count-r2.json) |

错误页标题落点与清理失败均单列于[Unicode补测](./02-unicode-editing.md)，不计功能完成分支。

## 换行复制与计数

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-111 | 空正文粘贴5/LF/6，两次全选、复制、文档信息，两轮 | 第一次选当前6，第二次正文块选区；复制53/10/54无尾换行，字数2/字符2 | [LF R1](./dom/text-linebreak-copy-lf-r1.json)、[R2](./dom/text-linebreak-copy-lf-r2.json) |
| V02-112 | 同样例改CRLF，各两轮 | 原载荷13/10保留、复制规范化LF，字数2/字符2；记录转义更正留追溯，编辑快照不改 | [CRLF R1](./dom/text-linebreak-copy-crlf-r1.json)、[R2](./dom/text-linebreak-copy-crlf-r2.json) |

## 分解组合字符删除

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-113 | 空正文粘贴Ax/U+0301/B，删除与历史，两轮 | 码点保持分解；尾4删B→3，再只删重音→Ax/2；撤销恢复重音/3、重做Ax/2，不能当整字素删除 | [R1](./dom/text-special-combining-uncomposed-r1.json)、[R2](./dom/text-special-combining-uncomposed-r2.json) |

## 前缀粘贴创建

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-114 | 空正文原生text粘贴# 1及历史，两轮 | 消费前缀生成H1=1，替换原空外层；历史新空text/新H1，不套用键入前缀复用规则 | [R1](./dom/text-paste-heading1-prefix-r1.json)、[R2](./dom/text-paste-heading1-prefix-r2.json) |
| V02-115 | 同样例九井号前缀，两轮 | 实际生成H9=1，不截到六级；历史回空text，H2–H8仅授权推断 | [R1](./dom/text-paste-heading9-prefix-r1.json)、[R2](./dom/text-paste-heading9-prefix-r2.json) |
| V02-116 | 空正文粘贴* 1及历史，两轮 | 唯一bullet=1、前缀消费、标记分离、原外层替换，历史回空正文 | [R1](./dom/text-paste-bullet-prefix-r1.json)、[R2](./dom/text-paste-bullet-prefix-r2.json) |
| V02-117 | 空正文粘贴1. 1及历史，两轮 | 唯一ordered=1，编号/用户文字分离，历史回空正文 | [R1](./dom/text-paste-ordered-prefix-r1.json)、[R2](./dom/text-paste-ordered-prefix-r2.json) |
| V02-118 | 空正文粘贴> 1及历史，两轮 | 引用内部1和外后空text，光标后空段；撤销仍遗留后空段，独立Delete恢复，不宣称结构完全可逆 | [R1](./dom/text-paste-quote-prefix-r1.json)、[R2](./dom/text-paste-quote-prefix-r2.json) |

详细入口、身份差异和恢复见[创建入口补测](./02-creation-entries.md)，加号/块菜单等仍待测。

## 加号创建入口

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-119 | 空正文加号打开、Escape、真实1及撤销，两轮 | 菜单关闭，text=1无额外触发字符；基础直接H1–H3，无H9直接项，不虚构创建 | [取消R1](./dom/text-plus-cancel-r1.json)、[R2](./dom/text-plus-cancel-r2.json) |
| V02-120 | 加号H1两轮创建与历史，首轮另测1输入历史 | 原外层复用、内部区变化；创建历史text/H1/text，首字符历史独立，仅按对应链复测 | [R1](./dom/text-plus-heading1-r1.json)、[R2](./dom/text-plus-heading1-r2.json) |
| V02-121 | 加号有序列表空项及历史，两轮 | 原外层复用、标记与空区分离，历史text/ordered/text及有效空叶1 | [R1](./dom/text-plus-ordered-r1.json)、[R2](./dom/text-plus-ordered-r2.json) |
| V02-122 | 加号无序列表空项及历史，两轮 | 原外层复用，历史text/bullet/text及有效空叶1 | [R1](./dom/text-plus-bullet-r1.json)、[R2](./dom/text-plus-bullet-r2.json) |
| V02-123 | 加号引用及历史，两轮 | 容器+内部原text，无引用外后空块；光标内部空叶1，撤销新唯一空text，重做新容器 | [R1](./dom/text-plus-quote-r1.json)、[R2](./dom/text-plus-quote-r2.json) |

## 快捷键创建入口

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-124 | 空text上Cmd+Option+1及历史，两轮 | heading1、外层复用、内部新区；按可信Digit1与Meta/Alt识别，key在本布局为¡ | [R1](./dom/text-shortcut-heading1-r1.json)、[R2](./dom/text-shortcut-heading1-r2.json) |
| V02-125 | 空text上Cmd+Option+9及历史，两轮 | heading9实际可用，面板未列不算不支持；可信Digit9/Meta/Alt，key=ª | [R1](./dom/text-shortcut-heading9-r1.json)、[R2](./dom/text-shortcut-heading9-r2.json) |
| V02-126 | 空text上Cmd+Option+0，两轮 | 仍text，无用户字；无类型变化时不撤销旧历史，key=º/code=Digit0 | [R1](./dom/text-shortcut-text-r1.json)、[R2](./dom/text-shortcut-text-r2.json) |
| V02-127 | 空text上Cmd+Shift+7及历史，两轮 | ordered，标记/空区分离，外层复用；key=&但code=Digit7，历史可逆 | [R1](./dom/text-shortcut-ordered-r1.json)、[R2](./dom/text-shortcut-ordered-r2.json) |
| V02-128 | 空text上Cmd+Shift+8及历史，两轮 | bullet，外层复用、内部新区；key=*/Digit8，历史回text | [R1](./dom/text-shortcut-bullet-r1.json)、[R2](./dom/text-shortcut-bullet-r2.json) |

引用标点组合未取得页面keydown，见[通道失败](./02-creation-entries.md)，不算功能通过或不支持结论。

## 引用前缀与加粗继承补测

| 编号 | 真实前置与操作 | 复刻断言 | 证据 |
| --- | --- | --- | --- |
| V02-129 | 空正文真实英文Shift+Period、Space，两轮 | 引用容器包裹原text，无后置外空块；撤销恢复`> `，重做空引用；中文状态实际标点另记 | [R1](./dom/text-b05-input-quote-rule-r1.json)、[R2](./dom/text-b05-input-quote-rule-r2.json) |
| V02-130 | 空正文原生text粘贴裸`>`，两轮 | 无Space也创建引用及外后空块；撤销遗留后空块，与键入规则区分 | [R1](./dom/text-b05-quote-rule-pasted-marker-r1.json)、[R2](./dom/text-b05-paste-bare-quote-marker-r2.json) |
| V02-131 | 空text Cmd+B、12、Enter、3及历史，两轮 | 首段12保留bold/700，后段3普通/400；顺序与身份、选区见逐键证据 | [R1](./dom/text-b06-bold-enter-r1.json)、[R2](./dom/text-b06-bold-enter-r2.json) |
| V02-132 | 空text Cmd+B、12、Shift+Enter、3及历史，两轮 | 同块两行，12为700、3为400；历史分组变化不使用固定撤销次数作合同，R2多撤销的前缀保留 | [R1](./dom/text-b06-bold-softbreak-r1.json)、[R2](./dom/text-b06-bold-softbreak-r2.json) |
| V02-133 | 唯一text的加粗1/普通2，选1替换3及续输入4，受控R3/R4 | 34继承700、未选2保持400；撤销分两次恢复混合12及选中1，重做一致 | [R3](./dom/text-b11-formatted-replacement-r3.json)、[R4](./dom/text-b11-formatted-replacement-r4.json) |
| V02-134 | 加粗1/普通2，跨两叶全选12、3及4，两轮 | 替换为单一加粗34，继承起点样式；历史恢复混合叶及12范围 | [R1](./dom/text-b11-mixed-leaf-replacement-r1.json)、[R2](./dom/text-b11-mixed-leaf-replacement-r2.json) |
| V02-135 | 同块两行1/2，Cmd+Left、Left/Right、Up/Down、Shift+Left，两轮 | 左右跨软换行，上下保留列0；扩选第二行0到第一行1，正文/同块两行不变，AX为U+200B | [R1](./dom/text-b09-softbreak-navigation-r1.json)、[R2](./dom/text-b09-softbreak-navigation-r2.json) |
| V02-136 | 空引用内部Cmd+Option+1，两轮及历史 | 内部原text外层变heading1，引用父子保持；撤销/重做内部类型，容器保持 | [R1](./dom/text-b04-quote-heading1-r1.json)、[R2](./dom/text-b04-quote-heading1-r2.json) |
| V02-137 | 空引用内部Cmd+Option+9，两轮及历史 | 同一内部外层变heading9，引用保持；中间标题共同规则仅授权推断 | [R1](./dom/text-b04-quote-heading9-r1.json)、[R2](./dom/text-b04-quote-heading9-r2.json) |
| V02-138 | 空引用内部Cmd+Shift+7，两轮及历史 | 原内部外层ordered，标记/编辑区分离，引用保持；历史回内部text | [R1](./dom/text-b04-quote-ordered-r1.json)、[R2](./dom/text-b04-quote-ordered-r2.json) |
| V02-139 | 空引用内部Cmd+Shift+8，两轮及历史 | 原内部外层bullet，引用保持；历史回内部text | [R1](./dom/text-b04-quote-bullet-r1.json)、[R2](./dom/text-b04-quote-bullet-r2.json) |
| V02-140 | 引用=1文字首Enter、Up、Backspace及外输入2，两轮完整历史 | 前置空段移到引用外，原内部1保持、引用容器改建；撤销三步回唯一引用，重做结构/选区一致 | [R1](./dom/text-b04-quote-before-backspace-probe.json)、[R2](./dom/text-b04-quote-before-backspace-r2.json) |
| V02-141 | 引用=1尾Enter、检查点、再Enter及外输入2，两轮完整历史 | 内部续段移到引用之后，原引用1保持；续段创建与移出、输入分别可恢复 | [R1](./dom/text-b04-quote-after-insertion-r1.json)、[R2](./dom/text-b04-quote-after-insertion-r2.json) |
| V02-142 | ordered=1及后空ordered，Enter退出、快捷键重建ordered、2，两轮历史 | 相邻后项继续标记2.，两外层及前项保持，后区重建；历史回后空ordered | [R1](./dom/text-b03-adjacent-ordered-create-r1.json)、[R2](./dom/text-b03-adjacent-ordered-create-r2.json) |
| V02-143 | ordered=1/bullet=2/空bullet，Enter退出、快捷键重建bullet、3，两轮历史 | 两个相邻bullet同父独立块，既有1/2保持，最后外层复用；历史回空bullet | [R1](./dom/text-b03-adjacent-bullet-create-r1.json)、[R2](./dom/text-b03-adjacent-bullet-create-r2.json) |
| V02-144 | ordered=1/bullet=2/空bullet，退出后创建ordered=3，两轮历史 | 中间bullet中断续号，最后ordered标记1.；同父三块和前项文字保持，历史可恢复 | [R1](./dom/text-b03-mixed-adjacent-ordered-r1.json)、[R2](./dom/text-b03-mixed-adjacent-ordered-r2.json) |
| V02-145 | H1=1/text=2/H1=3/text=4，折叠第一标题后四方向及Shift+Right，两轮 | 方向键跳过隐藏2，偏移按逐键记录；Shift+Right保持第一标题尾部光标，不形成跨折叠范围；展开恢复原2及身份 | [R1](./dom/text-b09-folded-region-navigation-r1.json)、[R2](./dom/text-b09-folded-region-navigation-r2.json) |
| V02-146 | 非空text=1尾部slash、Escape、2，两轮 | slash不打开菜单；Escape整块选择，2到隐藏textarea但正文仍1/；重定位撤销slash，不能算取消后续写 | [R1](./dom/text-b05-nonempty-tail-slash-r1.json)、[R2](./dom/text-b05-nonempty-tail-slash-r2.json) |
| V02-147 | 非空text=1尾部#空格及历史，两轮 | 普通1#空格，不触发标题；按实际历史回1/重做/再恢复 | [R1](./dom/text-b05-nonempty-tail-heading-rule-r1.json)、[R2](./dom/text-b05-nonempty-tail-heading-rule-r2.json) |
| V02-148 | 非空text=1块首#空格及创建历史，两轮 | 生成H1=1，前缀消费、外层复用；撤销恢复#空格1，重做对应标题 | [R1](./dom/text-b05-nonempty-head-heading1-rule-r1.json)、[R2](./dom/text-b05-nonempty-head-heading1-rule-r2.json) |
| V02-149 | 非空text=1块首九#空格及创建历史，两轮 | 生成H9=1，前缀消费、外层复用；创建历史可逆，中间级别共同规则仅推断 | [R1](./dom/text-b05-nonempty-head-heading9-rule-r1.json)、[R2](./dom/text-b05-nonempty-head-heading9-rule-r2.json) |
| V02-150 | 固定空text真实n/i组合中Cmd+Option+1、Space及历史，两轮 | 快捷键isComposing=true，提交你¡，后续空格普通输入；保持text，历史分别恢复空格/组合文本/空态 | [R1](./dom/text-b08-empty-composition-heading1-r1.json)、[R2](./dom/text-b08-empty-composition-heading1-r2.json) |
| V02-151 | 相同空text真实n/i组合中Cmd+Option+9、Space及历史，两轮 | 保持text，实际提交ni且不插入ª，后续普通空格；与H1提交内容差异保留，历史可恢复 | [R1](./dom/text-b08-empty-composition-heading9-r1.json)、[R2](./dom/text-b08-empty-composition-heading9-r2.json) |

| V02-152 | H1加粗段尾Enter续输入及历史，两轮 | 新增默认正文/项，引用内保持同容器；原加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-h1-bold-enter-r1.json)、[R2](./dom/text-b06-h1-bold-enter-r2.json) |
| V02-153 | H1加粗段尾Shift+Enter续输入及历史，两轮 | 原块新增逻辑行，续写回类型默认字重，原行加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-h1-bold-softbreak-r1.json)、[R2](./dom/text-b06-h1-bold-softbreak-r2.json) |
| V02-154 | H9加粗段尾Enter续输入及历史，两轮 | 新增默认正文/项，引用内保持同容器；原加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-h9-bold-enter-r1.json)、[R2](./dom/text-b06-h9-bold-enter-r2.json) |
| V02-155 | H9加粗段尾Shift+Enter续输入及历史，两轮 | 原块新增逻辑行，续写回类型默认字重，原行加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-h9-bold-softbreak-r1.json)、[R2](./dom/text-b06-h9-bold-softbreak-r2.json) |
| V02-156 | 无序加粗段尾Enter续输入及历史，两轮 | 新增默认正文/项，引用内保持同容器；原加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-bullet-bold-enter-r1.json)、[R2](./dom/text-b06-bullet-bold-enter-r2.json) |
| V02-157 | 无序加粗段尾Shift+Enter续输入及历史，两轮 | 原块新增逻辑行，续写回类型默认字重，原行加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-bullet-bold-softbreak-r1.json)、[R2](./dom/text-b06-bullet-bold-softbreak-r2.json) |
| V02-158 | 有序加粗段尾Enter续输入及历史，两轮 | 新增默认正文/项，引用内保持同容器；原加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-ordered-bold-enter-r1.json)、[R2](./dom/text-b06-ordered-bold-enter-r2.json) |
| V02-159 | 有序加粗段尾Shift+Enter续输入及历史，两轮 | 原块新增逻辑行，续写回类型默认字重，原行加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-ordered-bold-softbreak-r1.json)、[R2](./dom/text-b06-ordered-bold-softbreak-r2.json) |
| V02-160 | 引用加粗段尾Enter续输入及历史，两轮 | 新增默认正文/项，引用内保持同容器；原加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-quote-bold-enter-r1.json)、[R2](./dom/text-b06-quote-bold-enter-r2.json) |
| V02-161 | 引用加粗段尾Shift+Enter续输入及历史，两轮 | 原块新增逻辑行，续写回类型默认字重，原行加粗保持；八步历史恢复起点 | [R1](./dom/text-b06-quote-bold-softbreak-r1.json)、[R2](./dom/text-b06-quote-bold-softbreak-r2.json) |

| V02-162 | 跨块反向部分范围替换/续写及完整历史，两轮 | 12/34→154→1564，未选1/4保持，逐项undo/redo并恢复跨块范围 | [R1](./dom/text-b11-cross-block-stable-r1.json)、[R2](./dom/text-b11-cross-block-stable-r2.json) |
| V02-163 | HTML范围粘贴、样式续写及完整历史，两轮 | 34→加粗7/斜体8→加粗7/斜体89；无中途console，历史恢复原34 | [R3](./dom/text-b11-rich-html-controlled-r3.json)、[R4](./dom/text-b11-rich-html-controlled-r4.json) |
| V02-164 | 地址栏真实失焦后新落点取代旧范围，两轮 | 旧范围23，重定位1|23后输入5→1523，undo/redo恢复；真实blur/focus留证 | [R3](./dom/text-b11-focus-new-location-r3.json)、[R4](./dom/text-b11-focus-new-location-r4.json) |

| V02-165 | 基础块菜单Escape边界、菜单外取消及恢复输入，两轮 | Escape后仍可见，菜单外点击关闭；1234及历史恢复原123和既有后空段 | [R7](./dom/text-b05-block-menu-controlled-r7.json)、[R8](./dom/text-b05-block-menu-controlled-r8.json) |
| V02-166 | 在下方添加text、首字符与完整历史，两轮 | 两原块之间新建独立text；创建/字符分别undo/redo，恢复原结构与身份 | [R1](./dom/text-b05-add-below-text-r1.json)、[R2](./dom/text-b05-add-below-text-r2.json) |

| V02-167 | 解除扩展占用后引用快捷键创建及完整历史，两轮 | 可信Period/Meta+Shift包裹原text，保留软换行/格式；undo/redo恢复原身份，扩展绑定已复原 | [R1](./dom/text-b05-quote-shortcut-unblocked-r1.json)、[R2](./dom/text-b05-quote-shortcut-unblocked-r2.json) |

| V02-168 | Chrome复合样例两次真实重载 | 八节点文字、样式、记录ID、逻辑行、标记与引用归属指纹完全相同；旧运行时清除 | [前R1](./dom/text-b07-before-reload-r1.json)、[后R1](./dom/text-b07-after-reload-r1.json)、[前R2](./dom/text-b07-before-reload-r2.json)、[后R2](./dom/text-b07-after-reload-r2.json) |
| V02-169 | 继续编辑、云端保存、辅助浏览器独立重载读取，两轮 | 引用6→67→678；两轮七节点全部指纹字段与已保存主端相同，辅助旧标记清除 | [主R1](./dom/text-b07-independent-primary-r1.json)、[辅R1](./dom/text-b07-independent-peer-r1.json)、[主R2](./dom/text-b07-independent-primary-r2.json)、[辅R2](./dom/text-b07-independent-peer-r2.json) |

| V02-170 | 真实组合期间辅助端输入及主端确认、本地历史，两轮 | 主端Space仍isComposing；结束后才呈现远端3，3你→undo3→redo3你→undo3；辅助独立末态3 | [主R1](./dom/text-b08-remote-composition-controlled-r1.json)、[主R2](./dom/text-b08-remote-composition-controlled-r2.json)、[辅R1](./dom/text-b08-remote-composition-controlled-peer-r1.json)、[辅R2](./dom/text-b08-remote-composition-controlled-peer-r2.json) |

## 完成范围与验收边界

当前B01–B11已完成约定研究范围，合计11/11总项，S02研究完成。
标题共同行为仅重复实测H1/H9，中间H2–H8按sir授权推断、不计实测数量；两端IME提交内容差异保留。
已实测170条分支，485份JSON/571个窗口包含SETUP、失败和恢复，不用窗口总数计算通过率。
B05引用快捷键已定位扩展占用并补两轮，临时设置恢复，入口范围完成，详见[创建入口](./02-creation-entries.md)。
B06目标类型加粗继承各两轮及历史已完成，见[格式继承](./02-format-inheritance.md)。
B07两次Chrome重载及两轮继续编辑后的辅助夸克独立重载读取均通过，见[保存与重载](./02-persistence-editing.md)。
B08早期失败保留；新增固定空态两轮远端输入/组合确认/本地历史已通过。通用mutation/audit容量耗尽，独立组合时间线、事件、逐键状态及辅助记录完整，见[组合输入](./02-composition-editing.md)。
B11跨块历史、HTML粘贴和地址栏失焦后的新落点均已补齐，跨应用Raise未形成真实blur，不宣称该外围场景通过，见[选区编辑](./02-selection-editing.md)。
此前后台控制超时、菜单失效或额外空块记录属于环境历史，不据此推断当前功能行为。
2026-10-15已解锁并恢复真实操作；控制异常按各轮原始记录保留。
未采集的其他输入法、内部同步协议和外围场景不增加通过行；后续阶段与生产验收各自执行。

## 后续验收记录要求

重构实现每条验收记录执行环境、样例数据、操作链、结构/身份/选区差异、必要 JSON、保存结果和异常；失败项应能回溯到具体需求与原始实测窗口。

本矩阵是S02已实测分支的开发复测入口；S02研究完成不等于项目实现、完整编辑器工作流或生产发布验收通过。S03及后续阶段未启动，不改写未采集结果为事实。
