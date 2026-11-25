# S08 H02 选区删除、全文替换与页标题边界

状态：2026-10-21，按已确认代表范围结束研究交付。以下固定条件的双轮和边界保持原样，清空续写及全块键入两项项目目标已确认保留保护合同；未测组合与项目实现不计通过，见[收口清单](./08-closeout-review.md)。

范围与总进度见[阶段主文档](./08-deletion-movement-formatting-and-clipboard.md)；总任务的状态、证据及来源标准继续适用。

## 1 REQ-S08-H02-001 单次与双次 Cmd+A 的作用域

来源：指定飞书 Chrome 实测。状态：以下混合样例的两轮结果一致，公开选择 DOM 已由 R3/R4 补齐；仅覆盖本条条件。

前置：Alpha text、编号 1. 的 Beta H1、Gamma text、包含唯一 text Quote 的引用、末尾空 bullet；空页标题、编辑模式，从 Gamma:0 开始。
正文顶层可编辑内容为五项，DOM 另有引用容器，共六个带 data-block-id 的节点；不能把父容器及其子块重复计为两个顶层段落。

首次真实 Cmd+A 选中 Gamma 全文，原生 Range 为 Gamma:0→5，其余正文未选；页面提示“连续按下 ⌘ + A 以选中全文”。
第二次 Cmd+A 将整份正文纳入全块选择，包含编号标题、引用和空列表；可视高亮不包含页标题。
第二次选择的焦点为 docx-selection-hidden-textarea，原生 DOM selection 在 BODY，不能将其当作各段的文字 Range 或推断内部选区模型。

证据为下节 R1/R2 的两个 Cmd+A 窗口，以及[第一次单段选择截图](./dom/H02-mixed-selectall-before-delete-R1.jpg)、[全文 R1](./dom/H02-mixed-double-selectall-before-delete-R1.jpg)、[全文 R2](./dom/H02-mixed-double-selectall-before-delete-R2.jpg)。
截图只补充自绘选区的可视范围，不代替结构、身份和 mutation。

早期[作用域探查](./dom/H02-mixed-selectall-backspace-R1-scope-probe.json)只按一次 Cmd+A，随后删除的是 Gamma 文字而非整份正文；预期全文清空的守卫因此停止。
该窗口不计全文删除复测，且没有继续发送重做或输入。[独立恢复](./dom/H00-selectall-scope-recovery.json)以真实 Cmd+Z 恢复 Gamma 后，才开始有效双轮。

复刻要求：明确一次全选与连续全选的范围，不让首次 Cmd+A 无提示扩大删除范围；若项目采用其他产品规则，须单列差异决定。
未推断页标题焦点、引用内部、只读或其他入口的 Cmd+A 作用域。

## 2 REQ-S08-H02-002 混合正文全选退格及完整历史

来源：指定飞书 Chrome 实测。状态：全文删除、历史与公开选择 DOM 双轮已验证；删除后的两种续输入见第 4、5 节，不宣称 H02 整体完成。

前置同上，每轮通过真实点击及 AX 精确文本定位恢复 Gamma:0，再执行：

1. Cmd+A，核对 Gamma 全文选择。
2. 再次 Cmd+A，核对全文高亮与隐藏输入承载。
3. Backspace，核对所有研究正文消失、空正文占位出现。
4. Cmd+Z，核对全部文字、编号、引用父子及空列表恢复。
5. Cmd+Shift+Z，再次清空正文。
6. Cmd+Z，再次恢复同语义混合结构。

证据：[R1](./dom/H02-mixed-double-selectall-backspace-R1.json)、[R2](./dom/H02-mixed-double-selectall-backspace-R2.json)。
两轮均有六次可信 keydown；两次全文选择后的 Backspace 实际投递到隐藏 TEXTAREA，历史按键的真实目标亦逐步保留。

### 结构、身份与边界

- 删除与重做后的正文带 block-id 节点数均为 0；保留 page-block-children 渲染壳与输入占位，不生成可见的唯一 text 块。
- 页标题仍仅 U+200B，未被全文删除或历史修改。
- 每次撤销恢复 Alpha、编号 H1 Beta、Gamma、引用容器及内部 Quote、末空 bullet，文字、编号与父子顺序符合前置。
- 恢复块重新生成外层 DOM 和 ID，不能将恢复内容相同等同于复用原节点；每步映射见 JSON。
- 例如 R1 开始的 Alpha n10/ID 2、Beta n105/ID 13、Quote 容器 n667/ID 30，在最后恢复后分别成为 n1148/43、n1157/42、n1183/39。
- R2 同语义重测后又重新生成，最终 Alpha n1283/57、Beta n1292/56、引用容器 n1318/53。

### 焦点、历史与保存

清空后的首帧为正文根 activeElement，但原生 selection 的零宽叶 n6 属于页标题；不能把它标注成正文空块。
撤销恢复时首帧仍可能显示该叶；最终导出时焦点/选区为隐藏承载与 BODY，不能据此声称已在恢复的 Gamma 光标继续输入。
“清空后直接输入”和“主动点击空正文再输入”的真实归属与恢复已分别在第 4、5 节补齐；本节首帧不能代替那些续输入证据。

两轮 errors/overflow 均为空，可见保存提示；没有独立重载读取，不宣称持久化已验证。
[全块选择承载读取](./dom/H02-selectall-hidden-selection-DOM.json)确认隐藏 TEXTAREA 的公开 DOM、样式和矩形；其他匹配的 lazy-selection-node 是外围节点，不当作正文选区证据。
[候选选择节点发现](./dom/H02-selection-layer-discovery.json)后，已在原生按键前安装公开选择层的被动采集，补充[R3](./dom/H02-mixed-double-selectall-backspace-R3.json)、[R4](./dom/H02-mixed-double-selectall-backspace-R4.json)同前置双轮。两轮删除前五个顶层块均有 selected 类，引用内部 text 随父容器覆盖；页标题没有该类。新增/移除及类变化、可视矩形与隐藏 TEXTAREA 均保存于 presentation。p 引用与主观察器 n 引用分属独立 WeakMap，通过真实 block-id 对应，不混用字面引用。

补测各有20条选择相关 mutation，presentation 及正文 overflow、errors 均为空。筛选仅保留 selection/selected/block-select/select-layer，明确排除无关 select-disabled 导航与 image-select 控件。BODY Range 仍不能被编造成全文文字端点；该公开 DOM 合同补齐不表示飞书内部选区模型已可观察。

## 3 复刻与项目差异

本条验收必须逐步比较全文清空、标题保护、恢复的语义结构、ID/对象重建、隐藏选择与原生 Range 的区别，并补齐实际继续编辑位置。
项目的“保留唯一可编辑空正文”是项目现有合同，不能因为飞书此窗口渲染 0 块就标记该项目要求已通过，也不提前决定丢弃项目保护。
实际续输入进入标题的差异已由第 4 节双轮确认；sir 已于 2026-10-21 确认保留项目正文续写与标题保护合同，项目实现未验收。
跨块部分范围、反向选区、标题偏移 0/非零终点、全选输入、前向 Delete 和页标题跨界的具体已测条件见第 6–15 节；阶段[独立保存读取](./08-persistence-and-cleanup.md)已完成，不代表每个选区条件均单独重载，也不将局部条件推广为全组合。
未修改业务代码，未运行项目构建、测试或生产验收；本条研究结果与项目实现验收分开。


## 4 REQ-S08-H02-003 清空后不重点击的续输入进入页标题

状态：同前置双轮已验证该实际差异；不表示符合项目目标。来源：指定飞书 Chrome 实测。
前置与全文删除相同，从 Gamma:0 连续两次 Cmd+A 后 Backspace，确认空正文占位；不点击标题或正文、不重新设光标，直接通过真实键盘输入 Fresh。
证据：[R1](./dom/H02-clear-direct-typing-R1.json)、[R2](./dom/H02-clear-direct-typing-R2.json)、[DOM 归属审计](./dom/H02-clear-direct-typing-semantic-audit.json)。

两轮 Fresh 的 F/r/e/s/h 均进入页标题，正文带 block-id 节点保持 0；逐字前后 title 树和 selection 指向页标题文字，不能按 AX 中出现 Fresh 就判为写入正文。
R1 的 historyAudit.bodyFreshObservedInNativeAX 仅是采集器的原生 AX 行匹配，字段名容易误解，不能作正文归属结论；原记录保留，语义以 title/body DOM 及审计为准。R2 已改用不带归属推断的字段并注明限制。

历史顺序两轮一致：首次 Cmd+Z 移除标题 Fresh、正文仍空；Cmd+Shift+Z 恢复标题 Fresh；Cmd+Z 再次清空标题；再 Cmd+Z 恢复原混合正文。标题输入与全文删除分属两次可撤销内容操作，不推导固定合并阈值。
末态页标题恢复 U+200B，正文恢复 Alpha、编号 H1 Beta、Gamma、Quote 引用及末空 bullet，恢复块身份重建见 JSON；errors/overflow 均为空。

复刻对照保留此真实路由与历史。差异 DR-S08-H02-001 已由 sir 于 2026-10-21 确认：保留项目保护合同，清空后仍可在明确的正文落点继续输入，保护页标题；未修改实现或完成项目验收。
本条不把失败路由称为成功正文续写；主动点击空正文后的输入与全块选择键入分别见第 5、6 节，独立持久化仍未验证。


## 5 REQ-S08-H02-004 主动点击空正文后输入的可用恢复路径

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；原混合样例及双次全选退格同上。
清空后核对空正文占位和实际 page-block-children 矩形，再真实点击其行内区域后输入 Fresh；中间的控制台读取只用于定位，不向正文写入。
R1/R2 的空正文矩形均为 x=166、y=235.25、820×26（当前页视口 1152×963）；原生窗口内容区顶偏移 87px，实际点击为窗口 x=186、y=335.25。此为固定环境实测值，未冻结跨窗口容差。

证据：[R1](./dom/H02-clear-click-body-typing-R1.json)、[R2](./dom/H02-clear-click-body-typing-R2.json)。
点击前正文 0 块；首个 F 的 keydown 前已出现一个含 U+200B 的 text 空块并落光标于空叶:1，随后 F/r/e/s/h 写入该正文块，页标题保持 U+200B。
输入完成时正文为唯一 text Fresh，光标 Fresh:5；与“不重点击直接输入页标题”的上条结果不同，不能合并结论。

历史两轮均为：Cmd+Z 同时移除 Fresh 及新正文块，回 0 块；Cmd+Shift+Z 重建一个 Fresh text；Cmd+Z 再回 0 块；再 Cmd+Z 恢复最初混合正文。
首次新块 R1 为 n1771/ID 101、R2 为 n1859/ID 111，重做分别变为 n1780/103、n1868/113，不能写成复用原新块。
最终页标题为空，混合文字、编号、引用及空 bullet 恢复；errors/overflow 均为空。保存提示不替代独立读取。

复刻验收核对明确点击正文后的空叶建立、文字归属、光标、标题保护及上述历史分组；项目须提供可判断的正文继续编辑落点，不能只用空渲染壳证明编辑可用。
此条没有验证点击目标外空白、不同视口、长文档或全选直接输入替换；后续仍分别执行。


## 6 REQ-S08-H02-005 全文全块选择下普通键入无正文替换

状态：带独立历史标记的同前置双轮已验证该限制，不推断普通文字 Range 或其他输入通道。来源：指定飞书 Chrome 实测。
每轮先在 Alpha 末尾真实输入 Tag，明确建立可撤销的 AlphaTag；再从 Gamma:0 连续两次 Cmd+A 进入五个顶层块的 selected 状态，直接真实键入 Fresh。

证据：[R1](./dom/H02-whole-selection-input-noop-sentinel-R1.json)、[R2](./dom/H02-whole-selection-input-noop-sentinel-R2.json)。
两轮 F/r/e/s/h 的可信 keydown 与 insertText beforeinput 均投递到 docx-selection-hidden-textarea，但没有对应的 input 事件、正文字符变化或全文替换；标题与原混合结构保持，AlphaTag 也保持。
随后 Cmd+Z 移除已知 Tag，Cmd+Shift+Z 恢复 Tag，Cmd+Z 再移除 Tag，末态回原混合样例；没有把 Fresh 写入新块或标题，也没有为它生成单独可撤销的内容变化。

beforeInputDelivery 记录 Tag 的正常根输入和 Fresh 的隐藏输入；两者 defaultPreventedAtCapture/AfterDispatch 均为 false，不能声称 Fresh 被 preventDefault 取消。
[公开隐藏输入属性](./dom/H02-whole-selection-hidden-input-contract.json)在独立读取点为 TEXTAREA、readonly=true、disabled=false、值为空格、selectionStart=0/selectionEnd=1；不修改该属性，也不由此推断飞书内部选择模型或所有平台行为。
选择层公开 DOM 与 mutation、文本归属、按键目标及历史均在同一运行内保存；两轮 errors/overflow 均为空，未独立重载。

早期[历史探查](./dom/H02-mixed-selectall-type-replace-R1-history-probe.json)未先确认替换生效就执行撤销，实际把此前空列表建样从 bullet 还原为 ordered，后续真实重做已恢复 bullet；该旧窗口保留、不计本条有效双轮，不能将旧建样的历史当作 Fresh 替换历史。
有效复测改用明确的 Tag 业务无关标记并逐步核对，未继续反复撤销未知历史。

复刻验收区分全块选择与普通文字范围选择，在同样五块选区、真实键位和当前环境下核对无变化及已知历史标记，不将此结果写成“全选替换成功”。
差异 DR-S08-H02-002 已由 sir 于 2026-10-21 确认：保留项目选区替换合同，支持确认正文选区的输入替换，不复制本条键入无变化的限制；正常正文文字选区、剪贴板替换和中文组合仍分别验证，项目实现未验收。


## 7 REQ-S08-H02-006 部分文字到下一编号标题偏移 0 的删除

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；前置仍为混合样例，Alpha text 后为编号 1. 的 Beta H1。
通过真实点击/AX 定位 Alpha:0，Right 两次到 Alpha:2，再 Shift+Down；操作前的实际 Backspace keydown 均记录 Range Alpha:2 → Beta 文字:0，选中文字为 pha、零宽占位及段落边界，不包含 Beta 字母。

证据：[R1](./dom/H02-forward-heading-zero-backspace-R1.json)、[R2](./dom/H02-forward-heading-zero-backspace-R2.json)。
真实内容链为 Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z；每次由原生 AX 核对文字结果，再用同一运行 DOM/选区判定结构和身份。

删除得到 text AlBeta，光标同一 Alpha 文字节点 n1883:2；前段外层 n1877/ID 119 复用，原 Beta 标题外层及编号移除，未选 Beta 字母完整并入前段。
因此“终点为下一块偏移 0”不能实现为完全不影响下一块结构；该范围包含段落边界，保留的是 Beta 文字，不是原标题壳及编号。
Gamma、Quote 容器及内部块、空 bullet 与页标题保持。

撤销恢复 Alpha 与编号 H1 Beta，重做 AlBeta，再撤销恢复；Beta 标题每次新建外层及 ID，Alpha 和其他块复用。
R1 Beta 为 n1886/118 → n1977/121 → n1994/122，R2 为 n1994/122 → n2011/123 → n2028/124，移除/新增及编号重建顺序见 JSON。
撤销首帧可读到 Alpha:5，下一次重做前已恢复原 Range Alpha:2→Beta:0；最终以完整 selectionchange 和导出读数核对，不用首帧代替稳定位置。
两轮 errors/overflow 均为空，保存提示未由独立重载验证。

[初次边界键探查](./dom/H02-forward-next-heading-zero-selection-probe.json)额外 Cmd+Shift+Left 改变了锚点，不作为本条前置；[仅 Shift+Down 探查](./dom/H02-forward-heading-zero-exact-probe.json)的控制台失焦后读数会改变选择，亦不替代真实删除键前 Range。
有效双轮以前一刻实际 keydown 捕获的文本端点为准，正常文字 Range 与全块隐藏选择分别记录。
复刻验收核对精确范围、前缀/后缀、标题降为合并正文、节点复用/重建、相邻保持及完整历史；反向、H9、非零终点、引用跨父及 Delete 尚未由本条推断。


## 8 REQ-S08-H02-007 普通跨块 Range 可直接输入替换

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置与上条相同，真实输入 X 的 keydown 前必须为 Range Alpha:2 → 编号 H1 的 Beta:0，选中文字为 pha、零宽占位及段落边界；焦点在正文根，不是全块选择的只读 TEXTAREA。
动作链为真实 X → Cmd+Z → Cmd+Shift+Z → Cmd+Z；证据：[R1](./dom/H02-forward-heading-zero-input-replace-R1.json)、[R2](./dom/H02-forward-heading-zero-input-replace-R2.json)。

首次得到唯一合并正文 AlXBeta，Alpha 前缀 Al 与未选 Beta 字母保留，X 插入在两者之间；目标外层 n1877/ID 119、文字 n1883 复用，原 Beta 标题外层及编号移除，其他块和页标题保持。
首次稳定光标为 AlXBeta:3；撤销一次恢复原 Alpha/编号 H1 Beta 与原 Range，重做恢复 AlXBeta，稳定光标仍为 3；再次撤销恢复原结构和 Range。
重做的首帧曾读到 AlXBeta:2，下一次撤销 keydown 前两轮均已为 3，不能将首帧写成最终落点。
恢复的 Beta 标题重新生成 DOM 与 ID；Alpha、Gamma、引用及空 bullet 维持其身份合同。

两轮 X 的可信 insertText beforeinput 目标为正文根，defaultPrevented=false，并有真实字符/结构变化；与全块选择隐藏承载的普通键入无变化分开，不从“有 beforeinput”独自推出成功替换。
复刻验收核对精确端点、前缀/X/后缀、合并后的正文类型、节点复用/重建、原 Range 恢复及实际稳定光标。
errors/overflow 均为空，未独立重载；没有推断反向、非零终点、H9、跨引用容器、多字或中文组合替换。


## 9 REQ-S08-H02-008 同一跨块范围的反向删除与历史方向

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
从编号 H1 的 Beta:0 真实 Shift+Left 三次，删除键前为反向 Range：anchor=Beta:0，focus=Alpha:2；规范 Range start/end 仍为 Alpha:2→Beta:0，选中文字与正向相同。
[逻辑左扩选探查](./dom/H02-reverse-heading-left-range-probe.json)保留四次左扩选时 Alpha:1 的范围，不替代本条三次键的前置。

证据：[R1](./dom/H02-reverse-heading-zero-backspace-R1.json)、[R2](./dom/H02-reverse-heading-zero-backspace-R2.json)；动作链为 Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z。
删除得到 text AlBeta:2，前段外层 n1877/ID 119 与文字 n1883 复用，原 Beta 标题壳/编号移除，未选 Beta 字母保留；Gamma、Quote、空 bullet 及页标题保持。
撤销恢复编号 H1 Beta，重做 AlBeta，再次撤销恢复；Beta 标题每次新建外层及 ID，其他块符合前述身份合同。

两轮最终的选区均恢复成正向 Alpha:2→Beta:0，原来的反向 anchor/focus 未保留。不能把“恢复相同文字范围”写成“恢复原选区方向”。
复刻验收分别核对反向操作前置、与正向相同的文字/结构输出、身份重建、历史及实际恢复方向；不从文本等价推断方向等价。
errors/overflow 均为空，仅保存提示，无独立重载；非零标题终点、其他父级与 Delete 待测。


## 10 REQ-S08-H02-009 首段退格合入非空页标题

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；先通过真实标题输入建立 Title，正文第一段 Alpha，后续仍为编号 H1 Beta、Gamma、Quote 与空 bullet。
证据：[R1](./dom/H02-first-body-backspace-title-boundary-R1.json)、[R2](./dom/H02-first-body-backspace-title-boundary-R2.json)；[标题建样](./dom/H00-page-title-fixture.json)、[首轮探查](./dom/H02-first-body-backspace-title-boundary-probe.json)和[恢复](./dom/H00-title-boundary-probe-recovery.json)另列，不算有效双轮。

在 Alpha:0 真实 Backspace，页标题变为 TitleAlpha，正文首段移除，光标落在页标题文字偏移 5，即原 Title 与 Alpha 的连接处；后续标题、正文、引用和空列表均保持原身份。
Cmd+Z 恢复 Title 与独立 Alpha:0；Cmd+Shift+Z 再合并 TitleAlpha；再次 Cmd+Z 恢复。页标题外层与原文字叶复用，恢复的 Alpha 外层/ID/文字叶新建。
R1 首段外层为 n2183→n2192→n2201，R2 为 n2201→n2210→n2219；各中间移除与重建见对应 JSON，不把历史恢复说成复用原首段。

两轮 errors/overflow 均为空；本条只覆盖非空标题与首段正文的段首退格，标题末端 Delete、标题正文跨界 Range、空标题及独立持久化另测。
复刻验收逐步核对标题/正文归属、光标连接偏移、首段身份重建、其他块保持和四步历史，不由原生 AX 的文字匹配推断所属区域。


## 11 REQ-S08-H02-010 页标题末端前向删除合入首段

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；Title:5 后为独立 Alpha 正文，其他混合内容同上。
证据：[R1](./dom/H02-title-end-delete-body-merge-R1.json)、[R2](./dom/H02-title-end-delete-body-merge-R2.json)；真实 Delete→撤销→重做→撤销。

Delete 得到页标题 TitleAlpha:5，移除正文 Alpha；页标题外层及文字 n2182 复用，后续编号标题、Gamma、Quote 和末空 bullet 保持。
撤销拆回 Title:5 和 Alpha，重做再次合并，再撤销拆回；与首段退格的文字输出相同，撤销后的光标留在标题末端，不能套用首段退格的 Alpha:0。
R1 首段外层/ID 为 n2219/137→n2228/138→n2237/139，R2 为 n2237/139→n2246/140→n2255/141；每次恢复新建首段，标题身份保持。
errors/overflow 均为空；本条未独立重载，不推断空标题、标题内部字符删除或跨界 Range。复刻逐步核对文字归属、边界光标、身份及历史。


## 12 REQ-S08-H02-011 跨标题正文的反向部分范围删除

状态：固定逐键读取条件双轮已验证。来源：指定飞书 Chrome 实测。
从 Alpha:0 逐次 Right 到 2，再六次 Shift+Left，每键后读取原生状态；真实 Backspace 前均为 anchor=Alpha:2、focus=Title:1，选中 itle、零宽占位、段落边界和 Al。
证据：[R1](./dom/H02-title-body-reverse-range-settled-R1.json)、[R2](./dom/H02-title-body-reverse-range-settled-R2.json)。

Backspace 得到页标题 Tpha:1，标题前缀 T 与正文后缀 pha 保留，原首段移除；标题外层及文字叶复用，后续混合块保持。
撤销恢复 Title/Alpha 与相同文字范围，但方向规范为正向 Title:1→Alpha:2；重做 Tpha:1，再撤销恢复。Alpha 每次恢复重新生成身份，不恢复原首段 DOM/ID。
两轮 errors/overflow 均为空；未独立重载，未推断所有跨界范围或 Delete。

两份探查保留排除：[连续方向键](./dom/H02-title-body-reverse-range-backspace-probe.json)的实际终点为 Title:5，删除得到 Titlepha；[逐键探查](./dom/H02-title-body-reverse-range-backspace-observed-R1.json)终点为 Title:1，得到 Tpha，但尚无完整历史。
相应恢复见[恢复一](./dom/H00-title-range-probe-recovery.json)、[恢复二](./dom/H00-title-range-observed-recovery.json)。这些差异说明输入节奏会影响选区，不能按发送键数代替删除前的实际端点。
复刻验收使用固定端点、真实文字归属、相邻保持和历史方向判定；节奏差异另保留，不混作同前置冲突通过。

## 13 REQ-S08-H02-012 跨编号 H9 非零终点的部分范围退格

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；当前为新加载的独立引用会话，末空项为 ordered。
证据：[R1](./dom/H02-H9-nonzero-backspace-R1.json)、[R2](./dom/H02-H9-nonzero-backspace-R2.json)。
逐键选择后，实际 Backspace 前均为正向 Alpha:2→编号 H9 Beta:2，选中 pha、零宽占位/段落边界及 Be；保留 Al 和 ta。
退格输出 text Alta，Alpha 外层 n12/ID2 与原文字叶 n553 复用，原 H9 标题壳及编号移除，Gamma、Quote/内部块、空 ordered 和页标题保持。
每步历史前真实点击页标题；撤销重建编号 H9 Beta 与原 Range，重做 Alta，再撤销恢复原结构/范围。Beta 每次恢复新外层和 ID，其他原块身份保持。
R2 Beta 从 n571/53 最终重建为 n605/55；不要求恢复原后段 DOM 对象。
errors/overflow 均为空，未独立重载；标题 H1 的非零终点、反向及其他输入/删除入口不由本条推断。
验收核对端点而非键数、前后缀、合并类型、编号移除、身份和完整历史；标题末端文字部分未选不代表原标题结构保留。

## 14 REQ-S08-H02-013 同一非零 H9 范围的前向 Delete

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H02-H9-nonzero-delete-R1.json)、[R2](./dom/H02-H9-nonzero-delete-R2.json)。
实际 Delete 前仍为正向 Alpha:2→编号 H9 Beta:2；输出 text Alta，原 Alpha 外层和文字复用，原标题/编号移除，其他混合块及页标题保持。
Delete 后采集帧的折叠光标为 Alta:2；本条后续每次历史前主动点击页标题，其后的标题光标不能代替删除即时落点。
撤销恢复 Alpha/编号 H9 Beta 与同一 Range，重做 Alta，再次撤销恢复；Beta 重建身份，R2 从 n639/57 最终为 n673/59。
两轮 errors/overflow 均为空，未独立重载；非零 H1 与反向 Delete 不由本条推断，不能因选中文字相同就省略入口证据。
验收逐步核对实际范围、文字接合、标题结构移除、光标/历史和节点生命周期。

## 15 REQ-S08-H02-014 正文起点跨过整个引用容器的退格

状态：实际容器端点同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H02-text-through-whole-quote-backspace-R1.json)、[R2](./dom/H02-text-through-whole-quote-backspace-R2.json)。
Gamma:0 真实 Shift+Down 后，Backspace 前实际 Range 为 Gamma 文字:0→引用容器末尾占位 SPAN:1；选中完整 Gamma、Quote 及容器边界，引用外层带 selected。
该终点不是 Quote 文字:0，不能套用下一块文字偏移零的保留后缀规则。
退格清空 Gamma 但保留其 text 外层 n38/ID4，移除整个引用及内部 Quote；Alpha、编号 H9、末空 ordered 和页标题保持。
每步历史前点击页标题，撤销恢复 Gamma 并新建引用/内部 Quote，重做再次清空/移除，最后撤销恢复原范围及结构。
Gamma 外层保持但文字叶可重建；引用和子块每次恢复新身份，R2 引用从 n738/64 最终为 n783/68，内部 Quote 最终为 n790/69。
errors/overflow 均为空，未独立重载；不推断精确 Quote:0、部分引用文字、反向或其他删除入口。

[焦点探查](./dom/H02-text-to-quote-zero-backspace-focus-probe.json)保留第一次实际范围和控制台焦点回跳，没有脚本正文 paste 记录；[已知删除恢复](./dom/H00-cross-quote-probe-recovery.json)已恢复 Gamma/Quote，不计有效双轮。
采样驱动现同时核对粘贴前后控制台焦点，未稳定聚焦时不粘贴、失焦时不提交；这里只修改研究驱动，不改项目代码或页面业务 DOM。
验收必须核对实际容器端点、范围文字、空前段保留、父子销毁/重建、相邻保护及完整历史，不按 Shift+Down 名称猜测终点。
