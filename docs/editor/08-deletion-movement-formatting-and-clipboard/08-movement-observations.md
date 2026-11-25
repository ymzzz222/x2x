# S08 移动、真实拖放与通道边界

状态：2026-10-21，按已确认代表范围及限制结束研究交付。顶层下移、折叠父项上移、移入引用首段及引用首段上提已有固定条件有效双轮；多块、无效落点和中断缺口保持未知，见[收口清单](./08-closeout-review.md)。
总范围见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)。
只记录研究文档的实际操作和必要公开 DOM；没有调用内部移动命令或改写正文。

## 1 原生拖动通道的已知限制

[早期文字选择探查](./dom/H03-drag-entry-text-selection-probe.json)没有完成块拖放，不能计入排序用例。
[菜单送达窗口](./dom/H03-H04-native-menu-delivery-probe.json)及其[鼠标补充记录](./dom/H03-H04-native-menu-delivery-supplement.json)保留原生尝试；前者的导出未附带 UI 字段，补充记录独立保留，不默默补写原文件。
[独立移动事件探查](./dom/H03-native-drag-motion-probe.json)取得真实 DragOutlined 手柄上的 mousedown。
原生工具随后送达的 pointermove/mousemove 的 buttons 为 0，再收到落点 mouseup/click；没有 dragstart/drop，正文块序及身份没有改变。
这只证明该工具尝试未形成持有鼠标状态的拖动，不证明飞书拒绝合法落点或不支持拖动。
用户两次回复手柄可见后，助手直接截图或检查到的画面曾只有文字气泡；不把口头回复代替当时可见 DOM。
之后已在实际截图和目标 SVG 的 data-icon 中确认六点 DragOutlined 手柄。
人工真实拖动作为独立来源，不能与原生工具的无变化尝试合并成同入口双轮。

## 2 OBS-S08-H03-001 人工将 Alpha 移入引用首段

状态：单轮观察及完整历史，未计双轮通过。
证据：[人工 R1](./dom/H03-manual-alpha-into-quote-R1.json)。
前置为页标题 Title、顶层 Alpha text、编号 H9 Beta、Gamma text、Quote 引用及末空 ordered。
助手建立观察窗口和 Alpha 光标后，sir 以真实鼠标操作六点手柄，并回复“已拖放”。
原请求意图为 Gamma 与 Quote 之间；实际稳定 DOM 为 Beta、Gamma、引用容器、末空 ordered。
引用内部是 Alpha、Quote 两段；不能将其写成顶层 Gamma 后排序。
实际拖放后的光标在 Alpha:3；该值来自读取，不由预期落点推断。

Alpha 外层 n1098/ID103、编辑区 n1101、行 n1102 在移动及历史中保持。
引用容器 n1133/ID99、原 Quote n1140/ID100 以及其余顶层块保持。
明确点击页标题后 Undo 恢复顶层 Alpha 在首位、Quote 引用仅含原段；Redo 再进入引用首位，Undo 再恢复。
三步文字、类型和父子关系均由稳定 DOM 样本核对；不要求仅依赖视觉缩进判断引用归属。
引用新增 Alpha 时没有重建原引用父节点，也没有删除原 Quote。
完整文字叶复用未在本条逐叶核定，不将外层复用扩大为整个子树复用。

主观察器 errors/overflow 为空；附加 UI 鼠标日志达到 160 条上限，真实拖动后段的鼠标轨迹不完整。
该上限限制与正文 mutation/历史证据分开报告，不能声称本轮全部鼠标轨迹无缺口。
未独立重载保存，也没有把单轮升级为 H03 整项完成。

## 3 OBS-S08-H03-002 连续人工拖动形成引用内分栏

状态：连续序列探查，不是 OBS-001 的 R2。
证据：[操作后](./dom/H03-manual-second-drop-columns-after.json)、[Undo 1](./dom/H03-manual-second-drop-columns-undo.json)、[Undo 2](./dom/H03-manual-second-drop-undo-2.json)、[完整序列与重做恢复](./dom/H03-manual-multiple-drops-columns-sequence.json)。
观察窗口原名包含 into-quote-R2，仅表示当时请求意图；实际结果与动作次数不同，按本节独立归类。
附加日志取得三次手柄 mousedown→mouseup 的实际拖动段，包含 300 条 buttons=1 的移动事件。
本轮过滤未按住时的移动记录，限额 4000，操作后取样为 312 条，limitReached=false。
没有把其中一次手势单独冒充受控单块 R2，也不由缺少原生 dragstart 推断自定义鼠标拖动失败。

最终引用 n1133/ID99 内包含 grid n2913/ID114；左右 grid_column 为 ID115/117。
左列 Alpha 为新 text n2925/ID116，右列 Quote 仍为 n1140/ID100；两列公开尺寸标签各为 50%。
第一次 Undo 移除分栏，将 Alpha 置于顶层 Gamma 后；第二次 Undo 将 Alpha 还原至顶层首位。
此时文字、块序、类型及原引用关系恢复，但 Alpha 已是新身份，不宣称恢复原 n1098/ID103。
第一次 Redo 恢复 Gamma 后的顶层 Alpha；第二次 Redo 再现引用内两列。
重做时 grid/column 与 Alpha 再生成身份，原引用父节点和 Quote 仍保持。
随后两次 Undo 恢复原语义结构，末态 Alpha 为 n3188，页标题及其他混合内容保持。
三次实际拖动在本序列中表现为两步可观察内容历史；不据此编造通用事务合并时间阈值。
没有继续 Undo 超过已知本窗口前置，也没有通过删除整个文档来掩盖恢复差异。

## 4 历史待核对检查点

顶层下移与折叠列表父项上移的固定条件分别见第 5、6 节；可达多块、其他列表父子和引用进出仍待固定前置双轮。
无效落点、取消、中断、焦点与选区，以及同一动作的身份复用仍需分别核对。
本次分栏是实际出现的非目标结构，保留观察；尚未扩展为分栏功能研究或项目实现需求。
人工协助仅覆盖上述实际动作，不视作用户接受全部差异或批准阶段收口。
独立保存读取与最终现场清理尚未执行；研究文档当前保留原混合建样以便后续继续。

## 5 REQ-S08-H03-001 单次顶层下移与身份保持

状态：同前置有效双轮已验证，采用 R2/R3；来源为 sir 的真实鼠标拖放及助手的原生历史操作。
证据：[R2](./dom/H03-manual-alpha-after-heading-R2.json)、[R3](./dom/H03-manual-alpha-after-heading-R3.json)。
前置为原混合正文；每轮先建立监控、定位 Alpha，再请求只拖一次，实际各取得一次六点手柄 mousedown→mouseup。
Alpha 从顶层首位移至编号 H9 Beta 与 Gamma 之间，仍是顶层 text；没有进入引用或分栏。
两轮分别取得 62/54 条 buttons=1 的移动事件，UI 日志 76/68 条，均低于 4000 限额，未报告 limitReached。
Alpha 外层 n3188/ID120、编辑区 n3191、行 n3192 保持；Beta、Gamma、引用父子和末空 ordered 的文字、类型与外层身份保持。
明确点击页标题后 Undo 恢复首位，Redo 回到 Beta 后，Undo 再恢复；每步稳定 DOM 的文字、块序和父子关系均核对一致。
拖动后及该历史样本的公开选择承载为 BODY/异常 Range，不是 Alpha 文本光标；不能据此声称文本光标恢复。
主观察器 errors/overflow 均为空，附加鼠标日志未达到上限；未独立重载保存。
[R1](./dom/H03-manual-alpha-after-heading-R1.json)取得相同最终顺序和历史，但含两次实际拖动，保留排除，不能用 R1/R2 文件名配对替代同手势条件。
验收必须同时核对真实手势次数、顶层落点、相邻保护、身份和历史；该结果不推广为多块、上移、跨引用或所有无效落点。

## 6 REQ-S08-H03-002 折叠列表父项上移与隐藏子项

状态：同前置双轮及三步历史已验证；隐藏子项另有独立展开读回，不将单次读回冒充展开动作双轮。
证据：[R1](./dom/H03-manual-folded-list-before-alpha-R1.json)、[R2](./dom/H03-manual-folded-list-before-alpha-R2.json)、[上移位置展开与恢复](./dom/H00-post-move-hidden-child-readback.json)。
前置为 Alpha、编号 H9 Beta、Gamma、折叠 ordered IndentParent、Quote 引用父子及末空 ordered；IndentChild 在折叠区内，前置身份见[剪切后的独立展开](./dom/H00-post-cut-hidden-child-readback.json)。
每轮从 IndentParent:0 开始，sir 用真实鼠标将六点手柄拖至 Alpha 上方的整行落点，只松手一次。
两轮实际各有一个按住拖动段；R1 mousedown 目标为 DragOutlined SVG，R2 为同手柄区域内部 path，未保留 path 内容，不虚称其自身带 data-icon。
R1/R2 分别有 124/38 条 buttons=1 的移动事件，附加 UI 日志 141/61 条，limitReached=false。

父项从 Gamma 后移至顶层首位，仍为 ordered 且保持折叠；可见数据块节点均为 7 个（引用父子分别计数）。
父项外层 n12348/ID123、Alpha n3188/ID120、Beta n1107/ID102、Gamma n1124/ID101、引用 n13591/ID148 及 Quote n13598/ID149、末空 ordered n1215/ID109 均保持，文字类型未变。
每轮明确点击页标题后 Undo 恢复 Gamma 后，Redo 再移至首位，Undo 再恢复；前后文字、块序、父子、折叠相关公开属性和布局语义哈希一致。
拖动后及历史样本公开选区为 BODY 上 collapsed=true 的 Range，text 为一个空格；不将此解释为 IndentParent 文本光标复原。

独立读回先 Redo 已知上移，再通过真实折叠控件展开：首位父项内出现 a.IndentChild，父子关系为 ordered→ordered，子项数据块 ID 仍为 150。
子项可见 DOM 引用由先前读回的 n13578 变为本次 n14499；折叠时子项不在渲染树，不能声称隐藏 DOM 对象一直复用或推断内部存储模型。
一次 Undo 收起子项并精确恢复上移后的折叠哈希，再一次 Undo 恢复原顺序；不把展开额外历史混入单次拖动历史结论。
两轮和读回的主观察器 errors/overflow 均为空；没有独立重载验证持久性。

复刻验收：固定上述父子及相邻混合结构，拖动折叠父项到首位后，父项保留类型和折叠、子项内容及所属关系保留、相邻块身份和内容保持；一次 Undo/Redo 切换两个位置，再展开确认子项未遗失，最后可恢复原顺序。
此条不推广为多块拖动、引用移出、展开父项拖动或所有无效落点；项目实现与保存重开验收仍需独立完成。

## 7 OBS-S08-H08-001 多次拖动与 Escape 的混合序列

状态：探查及恢复窗口，排除于单次取消双轮。
证据：[原始序列](./dom/H08-manual-drag-escape-sequence-probe.json)、[逐步恢复](./dom/H00-drag-escape-sequence-recovery.json)。
请求原为一次折叠父项上移途中 Escape；实际存在多段按住移动、折叠控件区域操作、三次 Escape 和一次用户 Cmd+Z。
其中后两段按 Escape 后仍在 mouseup 时产生父项排序变化，不能将整段冒充同前置单手势 R1。
三次 Escape 均为可信事件，目标为 docx-selection-hidden-textarea；附加事件数组保留按键在松手前的顺序。
本条不据此认定所有焦点和所有拖动都忽略 Escape，也不把“取消完成”口头回复直接作为取消结果。

末态为 IndentParent 首位，另有新增末空 text n14615/ID151。
该空段在 07:58:14Z 的页面空白点击后生成，早于首次 Escape（07:58:41Z）；不能归因于 Escape 或拖动取消。
完整探查保留后，助手明确点击页标题，四次 Undo 逐步得到父项 Alpha 后、父项首位、父项 Gamma 后加末空段、最终移除附加空段。
每步均读取稳定 DOM 后再继续，最终语义哈希精确恢复原始折叠混合建样，未继续撤销已知前置之外的历史。
主观察器 errors/overflow 为空，附加日志未达 4000 限额；该探查不计 H08 取消成功或功能双轮。

## 8 OBS-S08-H08-002 单次 Escape 后松手仍排序

状态：有效单轮动作及完整历史，尚无同条件双轮；不计取消成功。
证据：[受控 R1](./dom/H08-manual-folded-drag-escape-once-R1.json)。
固定第 6 节折叠建样，从 IndentParent:0 开始，sir 一次按住六点手柄区域，移到 Alpha 上方；保持按住时按一次 Escape，再松手。
附加日志中只有一个实际拖动段，144 条 buttons=1 移动；可信 Escape keydown/keyup 均在该段 mousedown 与 mouseup 之间，键目标为编辑根 DIV。
松手后 IndentParent 仍移至 Alpha 上方，保持折叠；可见节点仍为 7 个，没有新增末空 text、文字丢失或重复插入。
该观察仅说明这个落点、焦点与手势条件下 Escape 未阻止松手排序，不能扩大为所有拖动取消入口或所有焦点。
明确点击页标题后 Undo 恢复原位，Redo 再上移，Undo 再恢复；目标及相邻外层身份保持，公开选择为 BODY Range。
主观察器 errors/overflow 为空，附加日志 169 条且未达上限；尚未独立重载保存。

[第二次请求的实际探查](./dom/H08-manual-folded-drag-escape-extra-click-probe.json)包含四段拖动尝试、折叠控件区域点击及一次正文空白点击，不能与 R1 配对。
额外末空 text n16444/ID152 在 Escape 之前生成；唯一 Escape 的目标为隐藏 TEXTAREA，操作前置和焦点均不同。
该序列经[四步恢复](./dom/H00-drag-escape-extra-click-recovery.json)精确返回原始折叠语义基线；不把多个真实动作或相同最终落点冒充一次动作双轮。
## 9 夸克误作拖放源的远端分栏探查与恢复

状态：源端由 sir 明确确认是夸克，排除于 Chrome 拖放双轮。
Chrome 观察窗口原名 H03-comment-resolved-alpha-into-quote-R1，仅表示请求意图，实际主事件为 0、附加鼠标事件也为 0。
[实际结果](./dom/H03-comment-resolved-into-quote-columns-source-probe.json)为引用内 grid 和两个 50% 的 grid_column，Alpha/Quote 分别在两列，可见数据块由 7 增至 10。
该结果不写成引用内第一段，也不从用户的完成回复推断 Chrome 收到了单次真实拖动。
助手未确保 Chrome 成为用户实际操作的前台窗口；确认源端之前没有在 Chrome 发送可能撤销其他内容的历史键。
[夸克源端恢复](./dom/H00-Quark-quote-columns-source-recovery.json)记录一次可信 Cmd+Z，恢复 7 节点原混合版本，其内容、编号和样式签名与夸克有效保存版本一致。
这里只验证必要远端恢复，没有在夸克补做功能调研或将其包装为主端 Undo/Redo 双轮。
[Chrome 接收恢复](./dom/H00-Chrome-received-Quark-columns-recovery.json)记录同步后的正文；原整体块 textContent 签名仍有差异，没有继续盲目撤销。
离线逐字段比对表明唯一差异是 Alpha 后出现协作光标标签“合岳(重庆)”，不是正文输入或文字丢失。
[正文与样式独立读取](./dom/H00-Chrome-received-Quark-columns-semantic-read.json)排除块外协作装饰，得到原混合版本相同语义签名；此读取未经重载，不计 Chrome 独立保存刷新。
后续人工主端动作明确要求先确认 macOS 菜单栏为 Chrome；sir 约定后续回复“1”代表相应人工步骤完成。
新的 Chrome 本地首轮另行建窗，结果见第 10 节；采用实际文字编辑区、编号、父级及必要样式作内容签名，原完整块读数和主观察器身份记录同时保留。

## 10 OBS-S08-H03-003 Chrome 单次拖放形成引用内分栏

状态：有效单轮及完整历史，记录实际分栏落点，不计“移入引用首段”双轮。
证据：[Chrome 单次分栏 R1](./dom/H03-Chrome-single-drag-quote-columns-R1.json)。
原观察窗口名 H03-Chrome-resolved-alpha-into-quote-R1 表示请求意图；附加公开鼠标观察确认本地一次可信 DragOutlined 手柄按下、112 条 buttons=1 移动及一次松开。
松手公开视口坐标为 (318,398)，主观察器没有收到这段被界面拦截的鼠标事件；来源由 Chrome 的独立可信 UI 记录证明，不能声称两个观察器都完整记录拖动。
结果为引用内 grid 和两个 50% 列，左列 Alpha、右列 Quote，可见数据块从 7 变为 10；不是引用内连续两段。
Alpha 从 n21890/ID256 重建为 n22097/ID259；编号 Beta、Gamma、折叠父项、引用容器、原 Quote 与末空 ordered 的外层身份保持。
一次 Undo 恢复原顶层顺序并保留新 Alpha ID259；Redo 重建 grid/column 和 Alpha（ID263），末次 Undo 再恢复原混合语义，未恢复旧 Alpha ID256。
内容/编号/父级/样式签名在 before、undo、restore 一致，applied 与 redo 一致；排除块外协作标签后核对，不以有装饰差异的整块 textContent 替代正文判断。
操作后及 Redo 读到 Alpha:5 光标；Undo 和最终恢复读到 BODY 的折叠 Range，不宣称文本光标复原。
主观察器 errors/overflow 为空，附加日志 123 条、limitReached=false；尚无该落点受控双轮或 Chrome 独立刷新。
后续横向引用落点请求的实际结果见第 11 节，未用请求意图代替实际落点。

## 11 OBS-S08-H03-004 修正目标后实际落入引用右列

状态：独立单轮实际观察，不与第 10 节的左列配对，也不计引用内连续两段验证。
证据：[右列探查及完整历史](./dom/H03-Chrome-single-drag-quote-right-column-probe.json)。
前置恢复为原 7 节点混合内容；sir 回复“1”后，附加日志确认一次 Alpha 文字点击，再一次 DragOutlined 手柄拖放；全窗 190 条 buttons=1 移动，其中 188 条在手柄按下与松开之间，另 2 条早于手柄按下。
松手公开视口坐标 (902,387)，最终为同一引用内左列 Quote、右列 Alpha，两列 50%，可见节点为 10；并非请求的引用内第一段。
Alpha 原 n22258/ID263 重建为 n22622/ID268；原引用容器和 Quote、其他未删除邻块外层身份保持。
一次 Undo 恢复顶层原结构，Redo 重建分栏及 Alpha ID272，再 Undo 恢复原混合内容/编号/样式；Alpha 原身份不复原。
操作后及 Redo 为 Alpha:5 光标，Undo 与恢复为 BODY 折叠 Range；完整块签名和排除协作装饰的正文签名均逐步一致。
主观察器 errors/overflow 为空，附加日志 204 条、未达上限。后续已补编号 H1 删除双轮，并按 Quote 上方空隙另建窗口完成第 12 节；不把反复请求或相同节点数量当作同条件双轮。

## 12 REQ-S08-H03-003 单次手柄拖动进入引用首段

状态：固定内容与六点手柄入口的有效 R1/R2 及 Undo/Redo/Undo 已验证。
证据：[R1](./dom/H03-Chrome-alpha-first-in-quote-R1.json)、[R2](./dom/H03-Chrome-alpha-first-in-quote-R2.json)。
前置为原 7 节点折叠混合版本、Alpha:5 光标；每轮 sir 用真实鼠标将顶层 Alpha 移到 Quote 上缘，最终引用内连续两段为 Alpha、Quote，没有 grid 或 grid_column。
R1 有两次先行点击，再一次 DragOutlined SVG 的按住拖动；R2 只有一次按下松开，目标为六点区域内部 path，坐标 (298,244)、path 矩形 (293.54,243,5.84,10.5)。
R2 的 path 自身未记录 data-icon，不虚称它就是带属性的 SVG；位置落在此前确认的六点 SVG 矩形内。两轮手柄按下与松开之间分别有 334/180 条可信 buttons=1 移动，额外点击与窗口前段移动不并入手柄手势。
Alpha 外层 n22782/ID272 从顶层首位移入原引用 n20484/ID187；原 Quote n21865/ID255、其他相邻块和 Alpha 的外层身份在动作及历史中均保持。
一次 Undo 恢复顶层 Alpha，Redo 再移入引用首位，末次 Undo 恢复原混合版本；每步核对文字、编号、父级和样式，完整块签名也分别一致。
原混合语义签名 c6b6eed5…5b5dc78，引用首段签名 57420ac4…d87c89；两轮两个版本逐字段一致，可见数据节点均为 7。
动作后及三步历史的选择均为 BODY 折叠 Range，text 为一个空格，不声称恢复 Alpha 文本光标。
主观察器 errors/overflow 为空；附加日志 355/191 条、limitReached=false。未把早期 160 条截断窗口或左右分栏探查混入有效双轮。
[文字类型图标区单轮](./dom/H03-Chrome-alpha-first-in-quote-type-icon-probe.json)也产生同落点、身份及历史，实际入口为 TextOutlined 包裹 SPAN；另存为可达入口观察，不用作六点手柄配对。
本条只覆盖单块进入现有引用首段；移出引用、多块、无效落点及取消仍需各自核对，Chrome 独立保存读取尚未完成。

## 13 引用外提时的原生输入故障与恢复探查

证据：[输入故障检查点](./dom/H00-Chrome-quote-exit-native-input-blocked.json)、[截图](./dom/H03-quote-exit-native-input-blocked-20261021.jpg)、[完整探查与历史](./dom/H03-Chrome-quote-exit-control-recovery-probe.json)。
移出请求后，AX 可读取、控制台输入却没有确认送达，坐标点击报 noWindowsAvailable；重新绑定和 sir 激活后仍未恢复。期间没有发送正文历史键，也没有刷新或重做拖动。
新鲜窗口菜单只显示“移到 24B36HE”，随后通过该菜单迁移窗口；迁移后的 ScreenCaptureKit -3811 经一次新鲜 AX/截图恢复，只读查询重新取得原活动窗口和 before 样本。
恢复后控制台出现助手只读探针源码拼接造成的 SyntaxError，属于控制输入故障，不归为飞书内容或拖放错误；主观察器 errors/overflow 仍为空。
实际结构为 Beta 上方新增引用容器包裹 Alpha，原引用保留 Quote；不是普通顶层 Alpha，也不是把整段原引用一起排序。
Alpha 从 ID272 重建为 ID278，Undo 保留新 Alpha 回到原引用内；Redo 新建引用容器及 Alpha ID280，末次 Undo 恢复引用内两段语义。
本窗有一次六点手柄拖放，另有一次文字点击和两次正文区域点击，附加日志 126 条；控制恢复操作混杂，保留排除，不与受控双轮配对。

## 14 REQ-S08-H03-004 引用首段上提生成独立引用

状态：固定前置与六点手柄入口的受控 R1/R2 及三步历史已验证。
证据：[原混合版本至引用内建样](./dom/H00-Chrome-quote-exit-fixture.json)、[R1](./dom/H03-Chrome-quote-child-before-heading-R1.json)、[R2](./dom/H03-Chrome-quote-child-before-heading-R2.json)、[建样清理](./dom/H00-Chrome-quote-exit-fixture-cleanup.json)。
前置为同一引用内 Alpha、Quote 两段；真实六点 DragOutlined 手柄单次拖到 Beta 上方整行落点，松手实际生成独立引用容器包裹 Alpha，原引用仅剩 Quote，可见节点由 7 变 8。
一次 Undo 回到同一引用内两段，Redo 再出现顶部独立 Alpha 引用，再 Undo 恢复；两个版本的内容、编号、父级及样式签名分别一致。
原引用容器 n20484/ID187、Quote n21865/ID255 和其他未删除邻块外层身份保持；Alpha 及新引用容器会重建，不能按“移动”名称先推断对象复用。
R1 从 Alpha ID280 开始，动作后新引用 ID281/Alpha ID282，Undo 保留新 Alpha，Redo 重建 ID283/284，最终 Undo 保留 Alpha ID284 回原引用。R2 从 ID284 开始，动作后 ID285/286，Redo 重建 ID287/288，最终 Undo 保留 Alpha ID288。
两轮各只有一次手柄按下松开，分别有 98/52 条 buttons=1 移动；附加日志 109/63 条、未达上限，主观察器 errors/overflow 为空。
动作后和三步历史均读到 BODY 折叠 Range，不声称文本光标恢复。引用内和顶部独立引用两版本的语义签名分别为 57420ac4…d87c89、280e8bde…95672，双轮一致。
结束后只 Undo 已知移入引用建样，恢复原混合版本语义签名 c6b6eed5…5b5dc78；没有向更早历史继续撤销。
本条没有把引用样式保留写成普通段提升，也未覆盖多块、任意跨容器落点或 Chrome 独立重载保存。

## 15 多块来源的选择、工具栏与激活点击探查

[跨块选区](./dom/H00-Chrome-multi-block-drag-selection-probe.json)通过真实 Shift 点击得到 Alpha:0 至 Beta:4，公开 Range.text 为 Alpha、零宽占位、换行及 Beta；正文语义不变。此时不是已经验证的多块拖动。
[额外空段序列](./dom/H03-Chrome-cross-range-extra-blank-probe.json)在拖动前先收到正文空白点击；mouseup 的 Range 已折叠，随后出现末空 text ID289，六点按下时光标已在该空段。
实际只移动 Alpha 到 Gamma 后，第一步 Undo 恢复 Alpha 原位但保留空段，第二步 Undo 移除额外空段并恢复原混合版本；不据此推断保留跨块选区时的拖动行为。
[Escape 探查](./dom/H00-Chrome-cross-range-toolbar-escape-probe.json)确认跨块 Range 保留、选区工具栏关闭，正文语义不变。工具栏 1→0 数值按两次只读控制台输出补记，原完整工具栏 DOM 未采集，证据内明确说明。
[后续激活点击序列](./dom/H03-Chrome-cross-range-focus-click-probe.json)仍在手柄拖动前收到正文 DIV 点击：mouseup 已折叠至 IndentParent:12，手柄按下时不再是 Alpha/Beta 选区。
本轮只移动 Alpha，7 节点且无额外空段；Undo/Redo/Undo 已逐步核对并恢复。两种探查均保留排除，不包装为多块拖动失败或受控双轮。
[控件预点击](./dom/H03-Chrome-cross-range-control-preclick-probe.json)在六点拖动前先点击其旁 DIV，原 Alpha/Beta Range 随后折叠；[完整正向选区](./dom/H03-Chrome-complete-range-preclick-probe.json)扩至 Alpha:0→Gamma:0，完整覆盖前两块，但仍在手柄按下前收到 Alpha 文字单击，Range 已折叠。
两窗实际只移动 Alpha 到 Gamma 后，均经 Undo/Redo/Undo 恢复；没有把原生 Range 覆盖多块、文件名或完成回复替代拖动时的真实来源判断。
[反向完整选区的实际窗口](./dom/H03-Chrome-reverse-range-preclick-pending-recovery.json)以 Gamma:0→Alpha:0 开始，仍在六点拖动前收到正文 DIV 点击；选区先折叠，再只移动 Alpha 到 Gamma 后。它不计多块验证，也不据此推断多块拖动全局不可用。

## 16 助手自行恢复的最新阻塞检查点

本节保留当时阻塞状态，已由第 17 节自行恢复；不作为当前未恢复现场。
sir 的最新回复是“你不能自己操作吗”；助手决定不再重复请求人工拖动，开始自行恢复与通道检查。
[恢复检查点](./dom/H00-Chrome-agent-recovery-blocked.json)保存最新公开 DOM、只读语义和尝试摘要。其 scope 对用户意图的概括不是逐字指令，后续交互按上述原话理解。
当前仍为 7 个数据块，顶层顺序 Beta、Gamma、Alpha、折叠 IndentParent、原 Quote 引用和末空 ordered，Title 保持；语义签名 a6b40c1c…75d31e。
正文坐标反复报 windowNotFoundAtPosition；窗口菜单迁移、指定窗口条目激活、原生标题 selectText/click 都未建立可确认的标题焦点。可见 DOM 的 Undo/Redo 图标为零尺寸，未点击隐藏按钮。
浏览器 DOM getTab 连接超时并重置控制内核；随后重建原生绑定、只读工具并刷新截图，Dock 激活尝试也超时。
这些失败均发生在正文历史键发送之前；反向探查结束后的已知单次 Alpha 移动尚未撤销确认，没有刷新页面、继续新拖动或清空正文来掩盖现场。
只读/导出恢复可用，主观察器已无活动窗口，监听仍存在；该检查点不计 Chrome 两轮保存读取、最终清理或 S08 阶段通过。自行原生拖动的新测试尚未开始，既有 buttons=0 结论仍来自第 1 节。

## 17 自行恢复成功与原生拖动通道复核

证据：[已知单次移动撤销](./dom/H00-agent-known-single-move-undo-recovery.json)、[原生拖动复核](./dom/H03-native-filled-window-drag-channel-recheck.json)。
通过真实键盘可选中地址栏；随后调用已观察到的窗口“填充”菜单，标题坐标点击重新送达，公开选择落在 Title:1、激活根为 contenteditable 的 page-block，而非隐藏选择 TEXTAREA。
助手在新的恢复窗口先核对 Alpha 位于 Gamma 后的源签名 a6b40c1c…75d31e，再发送一次真实 Cmd+Z；完整恢复原混合版本 c6b6eed5…5b5dc78，没有继续撤销更早历史。
接着由助手自行定位可见 DragOutlined SVG，并用原生 drag 向 Beta/Gamma 之间的有效顶层落点操作；文字行 1px 准备动作、首轮手柄尝试及补采尝试分别保留。
第二次手柄尝试另建未过滤被动监听，取得 6 条可信事件：pointerdown、mousedown、pointermove、mousemove、pointerup、mouseup 各一条，两个移动事件的 buttons 都是 0；没有 dragstart/drop，未达 200 条限额。
准备、两次手柄尝试后的正文/编号/父级/样式签名始终为原混合版本，未发送 Undo；这证明该原生通道仍未送达持有鼠标的移动，不是飞书拒绝合法落点或多块功能不支持的证据。
助手不再重复请求人工拖动，剩余多块、无效落点和中断的未覆盖范围保持明示；两个浏览器的混合版本独立保存读取见[收尾记录](./08-persistence-and-cleanup.md)。

## 18 重新验证后的有效多块合同

sir 最新明确要求继续直到全部验证完成，已重新打开原多块缺口。
Alpha 正文焦点后 Escape、Shift+Down 得到两个带 selected 类的结构块，和第 15 节普通 Range 前置不同。
固定四段样例的两块一起下移、Undo/Redo/Undo、原块身份与样式现已完成真实双轮，见[REQ-S08-H03-005](./08-full-verification-matrix.md#3-req-s08-h03-005-两个结构选中块一起下移)。
第 16–17 节不再请求人工的表述属于此前代表范围收尾；本轮按新指令只在前置和监控就绪时请求具体单次真实手势。
本条不代表无效落点、取消及任意父子移动已完成。
