# S10 关联能力与异常边界

状态：2026-10-27已按sir明确接受的25组代表双轮及限制完成；J01–J24共24/24研究交付，未验证项不计功能通过。
本阶段遵循[研究总清单](../ym-research-task.md)，只更新研究资料和证据，不修改项目业务代码。
主测仍为[指定 Chrome 飞书研究文档](https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX)。

## 1 S09 交接与执行边界

S09 已由 sir 明确接受按 21 组双轮及限制完成；[最终交付审计](../09-undo-redo-and-history-boundaries/09-final-delivery-audit.json)是前期来源，不算 S10 新实测。
承接[历史合同第 12 节](../09-undo-redo-and-history-boundaries/09-history-contracts.md#12-最终接受与-s10项目隔离验收交接)：真实权限变化前先建立可用历史，AI 锁/解锁与重连、按钮/命令/快捷键/真实历史 beforeinput 分别验收。
[项目专项入口及环境](../09-undo-redo-and-history-boundaries/09-remaining-acceptance-map.json)只有静态来源；真实服务端与 AI 环境仍缺，不写成通过。
S08 项目安全确定失败、原精确 2.454s 单轮及既有异常保持原结论。
S09的临时Chrome前台例外未自动扩展到S10；2026-10-26前批未使用Raise，2026-10-27收到sir“允许临时切前台，完成S10”后才对指定Chrome窗口使用一次Raise恢复通道。未新建研究标签，夸克仅按明确授权作必要辅助动作和独立读取，未Raise。
后台可达的原生菜单、只读控制台、真实面板输入优先；内容动作前检查指定 URL 和实际焦点，守卫不满足则停止发送。
只读观察器不调用内部编辑命令或写正文 DOM；原型、工具通道与项目运行结果分别记录。

## 2 J01–J24 交付矩阵

| 条目 | 接续范围 | 当前状态 |
| --- | --- | --- |
| J01 | 查找、转换后匹配、折叠/跨行、当前与全部替换及历史 | 五组独立双轮；另在混合H1/H9目标工作流双轮中核对七处替换，未宣称全组合 |
| J02 | 批注锚点与转换、删除、移动、历史及已解决状态 | 局部锚点转换/拆分/合并/删除双轮已保存，两条测试评论已解决；其他待测 |
| J03 | 修订编辑、格式、接受/拒绝及回到编辑 | 九组修订/回编辑双轮；H9修订、其他属性接受及并发未全覆盖 |
| J04 | 自动/手动保存、编辑中保存及重载恢复 | H1转换/Cmd+S/实际Chrome重载双轮；并发保存与错误待测 |
| J05 | 双会话并发、远端删除、选区与本地历史 | 顺序同步同块插入及双方历史隔离双轮；同时冲突/删除/选区仍待测 |
| J06 | 离线、延迟、重连、权限变化 | 离线模拟编辑/历史/最终联网恢复双轮；受控离线刷新单轮，真实权限专项未测 |
| J07 | 只读/分享/AI 锁的各入口门禁与恢复 | 待执行；服务端与真实 AI 环境未取得 |
| J08 | 长文、虚拟化、快速操作及窄窗口 | 120段全文功能、Desktop-UA窄视口共两组双轮；真实OS窄窗及性能分布未测 |
| J09 | 实际可达导入导出的结构/格式往返 | Markdown、混合Word及混合PDF共三组双轮；Word渲染差异保留，导入往返未测 |
| J10 | 历史恢复后继续转换、保存与协同状态 | 15:58本阶段版本还原、继续转换/输入/历史、保存重载双轮；并发仍未测 |
| J11 | AI 预览、采纳、待定选区及正文锁 | 项目专项，环境缺失；不启动真实业务生成代测 |
| J12 | 正文、设定、模块与文档会话隔离 | 项目专项，待明确可弃置样例 |
| J13 | 长度、首尾、空文档和临界值 | 120段与空文档恢复为代表；真实上限和项目阈值两侧未测 |
| J14 | 异常最小复现及恢复 | 已留焦点探查、重开粘贴未插入差异，原因未定 |
| J15 | 加载与空/旧/不可用缓存区分 | 两浏览器各两次实际重载证明已加载空根；缓存完整矩阵未测 |
| J16 | 保存响应乱序、重复送达及文档隔离 | 受控延迟/协议环境待取得 |
| J17 | 保存失败、离线与未确认编辑恢复 | 离线与最终恢复有代表证据；错误/未确认编辑保障矩阵未全覆盖 |
| J18 | 双端转换、权限、删除与版本恢复并发 | 待执行，需固定双方动作和独立读取 |
| J19 | 旧 HTML/JSON/Yjs 与历史版本迁移 | 项目真实授权样本未取得 |
| J20 | 固定规模性能与上限 | 待执行；双轮功能不算性能分布 |
| J21 | 长时间切换/重连及资源残留 | 待执行 |
| J22 | 真实服务端权限与保存/协同协议 | 隔离环境缺失，前端只读不代替 |
| J23 | 旧数据保留、失败回退与协议兼容 | 项目样本及可回退环境待取得 |
| J24 | 关联功能完整工作流、重开后第二轮 | 混合目标块代表工作流双轮及重开后继续编辑；中文/表情/批注修订/AI/模块同链未全覆盖 |

## 3 启动现场与观察范围

[本阶段独立基线](./dom/J00-initial-empty-baseline.json)确认真实 URL、ready=complete、正文零块、标题仅 U+200B、根可编辑，无先前 S09/S10 变量。
此读取来自当前页面，不用 S09 的最终空版证明本阶段现场。
被动监控记录正文/标题的必要树、节点引用、选择、可信事件、有限 mutation、面板变化和捕获异常。
查找替换面板额外保留必要 HTML、输入实际 value 和按钮 disabled；动态属性与 AX 摘要分开。
控制台取样会夺走输入焦点；下次输入必须重新定位可见 INPUT，并检查原生焦点和 URL。
长 JSON 的 AX 文本可能在约 500 字处截断；完整证据按压缩分块导出并校验哈希，不拿截断摘要替代正文/面板树。

## 4 REQ-S10-J01-001 加载后首次打开的空结果门禁

状态：固定条件双轮有效，采用 [R1](./dom/J01-empty-no-match-R1.json)、[R3](./dom/J01-empty-no-match-R3.json)，不代表 J01 整项完成。
前置：已加载空正文、空页标题；本次加载首次由页头更多→查找和替换打开面板，两个可见输入均为空。
真实坐标点击查找 INPUT，原生粘贴 S10Absent；再聚焦替换 INPUT，原生粘贴 Changed。
查找计数保持 0 / 0，真实 DOM 的全部替换、替换、上一处、下一处四按钮均 disabled=true。
这些是已观察的禁用状态，没有宣称执行了不可达的替换命令，也不推断有匹配或部分匹配时的行为。
重新点击查找输入并 Escape 关闭面板；正文始终零块，标题树与零宽占位保持，根保持连接。
每轮完整正文/标题采样为 before、panel-open-empty、query-no-match、replacement-no-match、closed；面板必要样本与阶段对应。
R3 前先[实际刷新](./dom/J00-before-fresh-repeat-empty-reload.json)，首次打开字段重新为空；两次加载分别保留会话与 timeOrigin，不跨加载要求节点引用相同。
两轮可信 paste 均送到 INPUT，载荷分别为上述两段研究字符串；实际插入与 INPUT 值一起判断，不仅凭 paste 事件判成功。
复刻验收：固定相同加载前置，核对输入值、0 / 0、四个按钮状态、关闭状态及正文/标题保护。

## 5 单轮差异、失败与不配对窗口

[焦点探查](./dom/J01-startup-find-focus-probe.json)：AX click 未建立查找输入焦点，守卫在查询粘贴之前中止；坐标聚焦后才进入有效首轮，不计功能双轮。
[重开字段观察](./dom/J01-reopen-retained-fields-observation.json)：关闭再重开保留 S10Absent/Changed，DOM 多了隐藏查找页签输入；仅单次观察。
[R2 重开/清空后粘贴未插入](./dom/J01-empty-no-match-R2-paste-no-insertion.json)捕获可信 paste、目标 INPUT、正确 plain，但无 input 事件，输入值仍为空。
该窗口与“本次加载首次打开”前置不同，排除同条件配对，不能把 R1/R2 写为稳定双轮。
当时可见输入的 readOnly/disabled 均为 false，原因未定；不归因为服务端拒绝、产品必然阻止粘贴或工具必然故障。
R3 用相同首次打开前置得到首轮结果，不以成功重测消除 R2 差异。

## 6 启动批次恢复与接续（历史检查点）

本批只输入面板字段，没有正文/标题编辑，因此未制造正文删除/Undo/Redo 来证明恢复。
[停止记录](./dom/J00-startup-observer-stopped.json)确认面板已关闭、正文为空，观察器停止；阶段变量和导出缓存随后删除。
[最终实际刷新](./dom/J00-startup-final-empty-reload.json)确认加载根存在、0 正文块、空标题、旧观察器不存在，面板关闭。
[最终界面](./dom/J00-startup-interface-restored.json)记录变量读回为空、控制台关闭、指定 URL 保持，无强制前台、新标签或辅助浏览器操作。
[启动审计](./10-startup-audit.json)42 项检查通过，覆盖 10 份阶段 JSON；校验有效 R1/R3、排除窗口、编码快照和本地引用；文件数和检查数不当作功能通过数。
下一批从非空普通正文的精确查找开始，再逐项展开转换后匹配、当前/全部替换与逐步历史；实际出现的大小写、跨行和折叠条件分别建样。
真实权限、AI、协议、迁移等专项按矩阵登记所需环境，未执行项继续保持未验证；启动 S10 不等于启动项目生产验收。

## 7 REQ-S10-J01-002 当前与全部替换的独立历史

[首轮](./dom/J01-current-all-history-R1.json)、[复测](./dom/J01-current-all-history-R2.json)各十三态固定条件双轮；[审计](./10-find-workflow-audit.json)与下条合计30项检查通过。
[建样](./dom/J00-Alpha-Alpha-fixture.json)为普通正文 Alpha Alpha、空页标题；两次加载首次打开面板，查找 Alpha、替换 Gamma。
查找计数1 / 2；点击替换后为Gamma Alpha、1 / 1；全部替换后为Gamma Gamma、0 / 0。
Escape关闭后两次Undo分别恢复Gamma Alpha、Alpha Alpha；两次Redo再现中间和最终态，再两次Undo回Alpha Alpha。
每个状态的文字、类型、原块身份、页标题和根连接均核对；菜单输入与关闭本身未多占需要撤销的正文步骤。
首轮摘要代码出现一次控制台正则SyntaxError，发生在采样前；只读核对查找词已插入后修正摘要，没有重送输入。元数据保留，观察器窗口错误为空。
第二轮前[实际重载](./dom/J00-current-all-before-R2-reload.json)读到已恢复Alpha Alpha；不能跨加载比较引用编号相同。
本条只覆盖普通单段两个相同词；不推广带格式、跨段、保护标题、批注锚点或并发替换。

## 8 REQ-S10-J01-003 H1 默认大小写匹配、循环导航与转换历史

[首轮](./dom/J01-heading-default-case-R1.json)、[复测](./dom/J01-heading-default-case-R2.json)各十二态双轮有效，原样例见[大小写混合建样](./dom/J00-mixed-case-fixture.json)。
普通正文Alpha alpha ALPHA先通过真实Cmd+Option+1转H1，再打开查找替换；小写alpha匹配3处。
下一处计数1 / 3→2 / 3→3 / 3→1 / 3；上一处从1 / 3回3 / 3，文字与H1类型保持。
Escape关闭后一次Undo回普通正文，Redo恢复H1，再Undo回普通正文；查找与循环导航未增加本条路径的正文历史步骤。
这是当前默认匹配规则的固定样例，不声称大小写开关或全字匹配已验证。
[More可达性检查](./dom/J01-more-availability-inspection.json)中的箭头图标实际宽高为0，点击后未得到选项；不把AX里的More文字当成已可操作控件。

## 9 REQ-S10-J01-004 折叠后代查找与自动展开

[首轮](./dom/J01-folded-descendant-find-R1.json)、[复测](./dom/J01-folded-descendant-find-R2.json)各四态；[审计](./10-folded-find-audit.json)20项检查通过。
[建样](./dom/J00-folded-search-fixture.json)为有序Parent、其有序子项Needle、独立正文Tail，页标题为空。
两轮分别从实际重载后的折叠父项开始；可见DOM只有Parent、Tail，首次打开查找时字段为空。
查询Needle后计数1 / 1，父项自动展开，Needle作为Parent的后代重新渲染；关闭面板后保持展开。
Parent和Tail的原块ID及同会话DOM对象保留，文字、类型和空页标题不变。
可见块从2到3是隐藏后代渲染，不当作新建一块；没有验证自动展开的撤销分组。
两轮查询均捕获可信INPUT粘贴并读到实际匹配计数，无窗口异常或轨迹溢出。

## 10 REQ-S10-J03-001 新增修订的接受、拒绝与历史

[拒绝R1](./dom/J03-revision-insert-reject-R1.json)、[R2](./dom/J03-revision-insert-reject-R2.json)与[接受R1](./dom/J03-revision-insert-accept-R1.json)、[R2](./dom/J03-revision-insert-accept-R2.json)共两组双轮；[审计](./10-revision-insert-audit.json)28项检查通过。
真实页头编辑菜单切换到修订模式，原样例Parent/Needle/Tail和空页标题不变；Tail末尾原生粘贴X。
新增后正文为TailX，X有text-revision和revision-container标记，右侧出现“新增：X”建议。
拒绝路径：拒绝后Tail且无该建议；Undo恢复TailX和建议，Redo回Tail并去除建议。
接受路径：输入自身Undo回Tail/无建议、Redo回TailX/有建议；接受后TailX保留但建议与正文修订标记移除。
接受的Undo恢复TailX和建议、Redo再次接受；最后Undo接受再Undo输入，回Tail和无建议。
全链核对正文、标题树、原块ID、同会话DOM身份、窗口异常和轨迹完整性，不以卡片消失单独证明接受。
接受R2的工具30秒超时发生在redo-insert采样已经送达后，只读核对阶段后续执行；没有重送输入，事件留在原始元数据。
这只覆盖单字符新增建议；原有评论身份、跨块批注与其他修订类型不得据此算通过。

## 11 REQ-S10-J03-002 标题转换修订的拒绝与历史

[首轮](./dom/J03-revision-convert-heading-R1.json)、[复测](./dom/J03-revision-convert-heading-R2.json)各七态；与下条合计[28项审计](./10-revision-structure-audit.json)通过。
修订模式中Tail末尾真实Cmd+Option+1转H1，文字不变并出现修订建议。
转换Undo回text且无建议，Redo回heading1及建议；拒绝回text，Undo拒绝回heading1建议，Redo拒绝回text。
Parent及其Needle后代保持，Tail原块ID和DOM对象保留，空页标题不变。
只覆盖H1快捷键转换及拒绝；H9、其他转换方向与接受属性建议仍未测。

## 12 REQ-S10-J03-003 局部删除修订的文字与接受

[首轮](./dom/J03-revision-delete-R1.json)、[复测](./dom/J03-revision-delete-R2.json)各九态固定双轮。
真实选择Tail中的il，BackSpace产生删除建议；此时textContent仍为Tail，正文删除修订标记与卡片共同判定。
删除自身Undo移除建议、Redo恢复建议；接受后实际文字变为Ta且无建议。
Undo接受恢复Tail和删除建议，Redo接受回Ta；最后Undo接受、Undo删除回无建议的Tail。
全链保留三个块的文字、类型、父子关系及同会话身份，标题和根连接受保护。
本条不能推广为跨块删除、合并或批注锚点；删除建议未接受时的textContent不得当作最终可见纯文本。

## 13 REQ-S10-J03-004 加粗格式建议

[首轮](./dom/J03-revision-bold-R1.json)、[复测](./dom/J03-revision-bold-R2.json)各七态；与下条合计[30项审计](./10-revision-format-break-audit.json)通过。
修订模式真实选中Tail，Cmd+B产生加粗建议，Tail计算字重400→700，正文文字及类型保持。
加粗Undo回400/无建议，Redo回700/有建议；拒绝回400，Undo拒绝回700，Redo拒绝回400。
格式、正文修订标记、右侧卡片同时核对；不能只看文字相同，也不泛化为其他格式属性。

## 14 REQ-S10-J03-005 段落回车建议

[首轮](./dom/J03-revision-paragraph-break-R1.json)、[复测](./dom/J03-revision-paragraph-break-R2.json)各七态。
修订模式Tail末尾真实Return，新增一个独立空text块，原三块保留；使用revision-linefeed标记并出现修订建议。
回车Undo移除新空块及建议，Redo恢复；拒绝移除空块，Undo拒绝恢复，Redo拒绝再次移除。
新空块恢复后的DOM对象不要求与先前销毁对象相同，原有三块身份、层级和空页标题保持。
这是段落回车的实测合同，不推断软换行也会创建新块。

## 15 REQ-S10-J03-006 软换行修订

[首轮](./dom/J03-revision-soft-break-R1.json)、[复测](./dom/J03-revision-soft-break-R2.json)各七态；与下条合计[32项审计](./10-revision-soft-ordered-audit.json)通过。
Tail末尾真实Shift+Return后仍三个块；Tail内部ace-line从一行增至两行，有revision-linefeed建议标记，不生成BR。
Undo回一行/无建议，Redo回两行/有建议；拒绝回一行，Undo拒绝回两行，Redo拒绝回一行。
textContent中的零宽占位从一个变两个不是实际新增可见文字；行节点与块结构分别验收。

## 16 REQ-S10-J03-007 有序列表转换修订

[首轮](./dom/J03-revision-ordered-R1.json)、[复测](./dom/J03-revision-ordered-R2.json)各七态。
Tail末尾真实Cmd+Shift+7转ordered，原Parent/Needle/Tail类型为ordered/ordered/ordered，父子关系-1/0/-1。
实际不可编辑BUTTON标记分别为1.、a.、2.；文字保持，Tail生成转换建议。
Undo回text/无建议，Redo回ordered/建议；拒绝回text，Undo拒绝恢复ordered，Redo拒绝回text。
这只覆盖有序转换；不能宣称无序及所有列表标记操作已验证。

## 17 REQ-S10-J03-008 回到编辑模式后的普通输入

[R1](./dom/J03-return-edit-mode-R1.json)、[R2](./dom/J03-return-edit-mode-R2.json)均从真实模式菜单退出修订后，在Tail末尾原生粘贴E。
正文TailE不产生text-revision，Undo回Tail、Redo回TailE、再Undo恢复；原三块和空页标题保持。
第二轮重新切入修订再切回编辑，重复相同输入与历史；不声称完整修订会话重载和协同已验证。

## 18 REQ-S10-J02-001 局部批注锚点的转换、拆分、合并与删除

sir明确允许两轮发布指定研究文档中的“S10批注锚点测试（完成后解决）”，不@他人，每轮末解决。
[首轮](./dom/J02-local-anchor-workflow-R1.json)、[复测](./dom/J02-local-anchor-workflow-R2.json)均以Tail中的ai为新评论锚点；第二轮前[同文替换建样](./dom/J00-comment-R2-clean-anchor.json)已清除旧正文锚点。
转换前后及历史的原块ID和对象保持，ai仍归同一评论；Cmd+Option+1转H1、Undo、Redo、再Undo均不重复评论。
在Ta之后真实Return拆成Ta/il，ai锚点分为a/i两个span，评论ID相同；Undo合回ai，Redo再拆，恢复后再准备拆段。
在il块首BackSpace主动合并回Tail；初次合并锚点是相邻a/i，Undo恢复两块，Redo合并时归为一个ai span；保留此节点归并差异。
删除整个ai后正文Tl，正文锚点和当前卡片均消失；Undo恢复Tail/ai/卡片，Redo再移除，最后Undo恢复。
两轮点击本条评论YesOutlined解决后卡片关闭，正文仍保留text-comment类；类名存在不等于未解决。
R1的单span光标助手在带批注分段后拒绝，转换键未发送；改为完整编辑区选区，两轮正式转换入口与选区一致。
本条配对范围从posted-confirmed开始；首轮begin在草稿已打开后，第二轮begin在草稿创建前，不把草稿创建前置写成相同双轮。
批注发布/解决本身未宣称由正文Undo撤销；跨块初始批注、移动、复制归属及历史评论重开仍未验证。

## 19 REQ-S10-J09-001 仅文本Markdown导出

有效双轮为[R3](./dom/J09-markdown-export-R3.json)、[R4](./dom/J09-markdown-export-R4.json)，与普通编辑/批注合计[37项审计](./10-comment-export-audit.json)通过。
真实更多→下载为→Markdown→导出，完整保存docx-export-panel HTML和两个radio实际checked=true/false，默认仅文本。
[实际下载文件字节](./J09-downloaded-markdown-complete-pair.json)来自两个不同完成文件，均36字节且SHA-256一致；原文内容保存在JSON，不依赖Downloads长期存在。
空页标题输出一个空的一级标题行；Parent为1.，Needle以四空格嵌套1.，Tail为普通段落。
页内子项显示a.而Markdown语法为1.，属于表示差异，不能宣称标记字面相同；导出不含页面块ID，不证明身份往返。
正文/标题树与身份受保护，仅R3开始原有focused、text-editor-focused类在打开菜单后移除，已单列精确差异。
早期[R1](./dom/J09-markdown-export-R1.json)、[R2](./dom/J09-markdown-export-R2.json)下载也一致，但保存设置HTML只含标题，排除完整双轮；R1只读格式定位晚于异步设置弹窗，探查错误保留。
本条没有执行导入、Word/PDF往返、格式和批注的完整导出，J09整项仍未完成。

## 20 REQ-S10-J04-001 正常转换、保存键与实际重载

[R1操作](./dom/J04-heading-save-reload-R1-operation.json)、[R2操作](./dom/J04-heading-save-reload-R2-operation.json)及各自before/after独立读取形成双轮；[20项审计](./10-save-reload-audit.json)通过，累计十六组。
Parent/Needle/普通Tail起点，真实Cmd+Option+1转Tail为H1，Undo回正文、Redo回H1；空页标题和前两块保持。
真实Cmd+S可信按键已捕获，未出现浏览器另存对话框；页面显示云端保存，但不把该文案当作服务端协议确认。
记录并导出操作后真实点击Chrome重新加载，timeOrigin变化且navigation.type=reload，旧观察器消失。
R1重载后Parent折叠，仅渲染Parent/H1 Tail；[真实展开后读取](./dom/J04-heading-save-reload-R1-after-expanded.json)恢复Needle，三块语义哈希与重载前完全一致。
R2从真实手动展开后再建相同正文起点；重载直接读到三块，哈希一致，服务端data-record-id也与各自重载前保持。
R1/R2折叠历史不同，不把它们写为同条件折叠持久化双轮；查找自动展开后的重载差异保留为条件线索。
本条不是毫秒级立即重载，也未模拟保存中继续编辑、失败、离线、乱序或重复送达；正文操作前后有采样/导出间隔。

## 21 REQ-S10-J10-001 指定历史还原后的继续编辑与保存

[25项审计](./10-history-restore-audit.json)通过；R1/R2均从Parent/Needle/H1 Tail还原到本阶段10月26日15:58的Parent/Needle/text Tail，形成一组双轮。
每轮before分别保存可编辑live根和contenteditable=false的历史预览根，预览实际类型与还原按钮状态均核对，不能把第一套根误当预览。
完整确认框保存目标时间；最初自动审批因缺少具体覆盖提交授权而拒绝，sir随后明确允许两轮指定还原，两个最终提交均在该授权后执行。
还原回单正文根，语义、父子关系及记录ID匹配历史预览；还原自身不宣称由正文Undo撤销。
每轮继续Tail→H1、Undo、Redo、Undo；末尾输入E、Undo、Redo、Undo；Cmd+S后实际Chrome重载，最终普通Tail哈希一致。
R2先展开15:59历史组再选15:58子记录，未误选新生成的还原记录。
SPA还原可保留旧观察器变量，R2旧观察器已停止，继续操作前移除并重建；最终重载均无观察器。
远端并发恢复、目录/批注状态全组合和断线中的版本恢复仍未验证。

## 22 REQ-S10-J06-001 离线模拟编辑、历史与联网恢复

[R1操作](./dom/J06-offline-reconnect-R1-operation.json)、[R2操作](./dom/J06-offline-reconnect-R2-operation.json)固定普通Tail起点，通过真实DevTools网络面板设为“预设：离线”；各阶段navigator.onLine=false。
两轮末尾原生输入E为TailE，Undo回Tail，Redo回TailE；页面显示离线编辑将在联网后同步，必要提示DOM已留存。
[24项审计](./10-offline-reconnect-audit.json)通过，统计一组离线编辑/历史及最终恢复双轮，累计十八组；不是物理断网和服务端协议验收。
R2捕获一条Error: Network Error，R1无同类窗口异常；原错误保留，不写成错误为零，也不由此归因到特定请求。
离线刷新初次提交被自动审批拒绝，理由是未明确接受未确认编辑可能丢失；sir随后明确允许两轮并接受研究TailE可能丢失。
R1最终警告的确认来源未独立归因，后读到断网页；R2保存[原生确认记录](./dom/J06-offline-refresh-R2-confirmed-native.json)并受控确认。受控离线刷新仅单轮，不计有效双轮。
两个断网页都为ERR_INTERNET_DISCONNECTED、0正文根、online=false；受控R2错误文档navigation也显示back_forward，不能据此认定R1由用户后退触发。
恢复“已停用节流模式”后真实重新加载，R1新正常文档navigation=navigate、R2=reload；均有新timeOrigin并恢复TailE，三块最终语义哈希一致。
[R2夸克独立实际刷新](./dom/J06-offline-reconnect-R2-Quark-independent.json)也读到同一哈希；这不是R1同时独立读取，不能混写两轮辅助验证。
网络已恢复正常，缓存设置未改；临界断线、旧响应后到、重复请求、关闭重开及未确认编辑不可恢复提示仍属后续专项。

## 23 REQ-S10-J05-001 双会话本地与远端历史隔离

[28项审计](./10-collaboration-history-audit.json)通过，R1/R2双方各自的完整DOM及事件分别保存为J05-local-remote-history-R*-Chrome/Quark。
相同账号、独立浏览器会话、共同Parent/Needle/TailE起点；先Chrome输入L并Undo/Redo，证明本地旧历史可用，夸克读到TailEL。
夸克仅执行必要远端插入R，双方读到TailELR；Chrome Undo只移除L，双方收敛TailER，Redo恢复TailELR。
夸克自己的Undo只移除R为TailEL，Redo恢复TailELR；最后夸克Undo、Chrome Undo回TailE，双方一致。
原三块ID及同会话DOM对象、服务端记录ID、空页标题保持，双方没有窗口异常或轨迹溢出。
本条是顺序同步的同块插入，不是同时冲突、跨账号授权、远端删除、双端转换或选区映射全组合。
夸克被切到其他页面时守卫在输入前中止；sir明确确认当时可使用辅助研究标签后才接续，未向其他页面发送L/R。

## 24 REQ-S10-J01-005 逐键查询的软行/跨块范围与活动高亮

[R1](./dom/J01-soft-crossblock-physical-R1.json)、[R2](./dom/J01-soft-crossblock-physical-R2.json)由独立重载重建首次打开前置；[15项审计](./10-crossline-highlight-audit.json)通过，累计二十组。
[真实建样](./dom/J00-crossline-search-fixture-v2.json)：整块HTML粘贴中的BR实际生成三段；通过真实块首合并和Shift+Enter才得到首text块两行CrossA/CrossB、第二text块CrossC。建样的替换、合并、软行均核对Undo/Redo。
逐个大写物理按键，100ms按键及原生AX检查点；前缀采样后重新聚焦INPUT、Cmd+Right并单独输入最后字符，两轮入口与节奏相同。
CROSSACROSSB为0 / 0，不跨软行把两侧文字拼成一个匹配；CROSSBCROSSC为0 / 0，不跨块拼接。
CROSS为1 / 3，CROSSB为1 / 1；原两块文字、类型、层级、ID和DOM对象、空页标题保持，输入事件可信且无composition。
活动高亮为text-block-highlight-content绝对定位覆盖矩形，背景rgba(245,74,69,0.5)，宽52px、高22px、left2px、top28px、pointer-events:none；关闭面板后节点数归零。
该矩形尺寸仅当前固定文字与环境样例，不是通用高亮宽高；高亮定位应随真实文本范围测量。
[粘贴未插入探查](./dom/J01-soft-crossblock-paste-no-insertion-probe.json)的可信INPUT paste没有实际插入，排除；不把0 / 0当范围结论。
[快速typeText差异](./dom/J01-fast-type-stale-match-probe.json)字段完整CrossACrossB但保留四个C高亮，Enter仅跳到第二处；[可见截图](./dom/J01-fast-type-visible-mismatch.png)留存，不能归因成产品必然规则或工具必然故障。
最初[全选探查](./dom/J00-crossline-allselect-probe.json)仅原生选区空格，未粘贴；后核对它实际是隐藏TEXTAREA和整块selected状态，真实粘贴前被动记录范围。
字面换行查询、其他格式与替换范围未由本条验证，快速输入一致性仍须独立真实输入专项。

## 25 REQ-S10-J08-001 固定120段虚拟化查找、批量替换与全文历史

[首轮](./dom/J08-long-find-replace-history-R1.json)、[复测](./dom/J08-long-find-replace-history-R2.json)各十七态；[28项审计](./10-long-virtualization-audit.json)通过，累计二十一组。
[源样例](./J08-long-fixture-source.json)固定120段text，每段一个ALPHA，末段一个ZZZEND；不把该规模当460000字项目上限或飞书上限。
[建样](./dom/J00-long-fixture.json)真实整块HTML粘贴，Undo回此前两块、Redo恢复长文；建样及长文窗口mutation预算扩至20000，所有实际记录均未溢出。
每轮实际重载并原生滚到顶部，DOM渲染ROW001–ROW036；查找末段ZZZEND为1 / 1，窗口变为ROW091–ROW120。
ALPHA为1 / 120并回顶部，上一处到120 / 120、窗口ROW092–ROW120，下一处回1 / 120及顶部；不能从29/30/36个渲染块推断文档总数。
替换字段BETA，真实全部替换后ALPHA计数0 / 0；关闭查找，一次Undo为ALPHA、Redo为BETA、再Undo回ALPHA。
[首轮Undo全文](./dom/J08-R1-undo-alpha-download.json)、[Redo全文](./dom/J08-R1-redo-beta-download.json)、[复测Undo全文](./dom/J08-R2-undo-alpha-download.json)、[Redo全文](./dom/J08-R2-redo-beta-download.json)来自四个不同实际完成下载，均120段逐行匹配预期。
ALPHA导出6611字节、BETA导出6491字节，同类两轮哈希相同；必要默认导出设置DOM及radio实际状态也保留。
所有渲染文字均精确来自源样例及其BETA版本，根连接、空页标题和再次渲染时的逻辑记录身份保持；ROW037–ROW090的DOM未直接逐段遍历，全文内容由实际下载核对。
本条为功能双轮，不是性能分布、内存泄漏或极限压力结论；没有给p95、最大规模或所有富块虚拟化宣称通过。
R1旧摘要助手返回完整渲染列表而截断、只读标记一次缺失、完整证据导出超时均保留；恢复前核对实际phase，没有重复正文操作。
两轮约2.4MB原始证据分别分624块完整落盘，编码往返及哈希校验通过；压缩和分块不删减失败或必要变化。

## 26 窄视口探查与环境限制

[实际探查](./dom/J08-narrow-emulation-R1.json)先后两次原生拖动 DevTools 分隔线，页面仍为1303×963；不能把拖动动作算作尺寸改变。
随后通过真实“显示/隐藏设备工具栏”进入400×876自适应视口，更多→查找和替换可达；面板宽407.125、左边界−23.125、右边界384，左侧超出视口。
真实关闭按钮可关闭面板，关闭设备工具栏后恢复1303×963；正文未输入，布局变化和虚拟化重绘不当作正文删除。
采样发现该工具默认同时启用 Android/Pixel 移动端UA，因此仅为模拟环境单轮探查，不计桌面窄窗口有效双轮，也不推广为真实移动端结果。
首个更多按钮定位曾命中宽高为0的SSR节点，后续改为仅取实际可见按钮；失败定位保留。
后续通过真实设备工具栏“添加设备类型→Desktop”，固定Mac桌面UA、touch=0、400×876，实际刷新后执行[桌面R1](./dom/J08-desktop-400-panel-R1.json)、[R2](./dom/J08-desktop-400-panel-R2.json)。
两轮更多→查找和替换均可达；面板边界同为x=−23.125、width=407.125、right=384，关闭可用，九块正文及空标题未变。这是重复可观察的左溢出，不能作为项目允许裁切的决定。
第二轮首次AX菜单查询早于菜单出现，重新读取后继续，没有重复点击；新增设备类型控制已移除、Mobile偏好已恢复后关闭仿真，[原桌面1303×963恢复](./dom/J08-desktop-viewport-restored.json)。
新增的是Desktop-UA响应视口双轮，不是原生OS窗口缩放或真实移动设备验证。

## 27 组合工作流首轮与长文恢复

长文[清空历史链](./dom/J00-long-clear-history.json)通过全正文自定义选区清空、Undo、Redo；Undo后[实际下载](./dom/J00-long-clear-undo-download.json)全部120段与源样例逐段一致，不能仅凭36个已渲染块证明全文恢复。
空版没有可见正文编辑器，首次聚焦守卫在Undo之前停止；改从空页标题聚焦才执行Undo，没有重复历史动作。
[组合首轮](./dom/J24-workflow-R1-before-reload.json)从空版原生HTML粘贴生成H1、正文、有序父子项、无序项、引用及末空段，共9个块；粘贴Undo实际留下两个空段，Redo恢复9块，差异保留。
一次块菜单短拖动实际转换H3，已单列incidental-h3及Undo/Redo/Undo恢复；随后选区气泡→其他标题→九级标题实际转换Deep Alpha，转换Undo/Redo正确。
ALPHA默认匹配7处，替换为BETA后逐次Undo/Redo/Undo恢复Alpha；H1/H9、列表父子归属、引用包装、正文Alpha加粗及空标题保留。
真实Cmd+S后[实际重载读回](./dom/J24-R1-reload.json)九块，语义哈希d21f24f9b846323f9c0dec7fa3d22151f702d82dba469456ce67c2076558b109。
一次60秒工具超时后只读确认phase=restore-alpha，再继续保存，未重复正文替换或历史按键。
相同空版前置的[第二轮](./dom/J24-workflow-R2-before-reload.json)重复创建、H9转换、七处替换与历史链；粘贴Undo同样留下两个空段，Redo恢复九块。
[第二轮重载](./dom/J24-R2-reload.json)与首轮语义哈希相同；[首轮继续编辑](./dom/J24-R1-after-reload-continue.json)、[第二轮继续编辑](./dom/J24-R2-after-reload-continue.json)均在H9末尾输入E，Undo/Redo/Undo准确恢复。
两轮共同目标阶段成对，首轮额外H3探查及恢复单列排除；第二轮45秒超时停在只读按钮坐标查询，核对phase=replacement-ready后才首次替换，没有重复正文动作。
这是代表混合工作流双轮，未串入中文/表情、批注修订、权限、AI及模块；不宣称J24完整项目流程已通过。

## 28 混合目标块实际导出双轮与差异

真实更多→下载为可达Word、PDF、Markdown；已执行[Word设置及同状态DOM](./dom/J09-mixed-word-R1-settings.json)，单选为“仅正文”。
[Word下载记录](./dom/J09-mixed-word-R1-download.json)及[原始DOCX](./exports/J09-mixed-R1.docx)、[PDF下载记录](./dom/J09-mixed-pdf-R1-download.json)及[原始PDF](./exports/J09-mixed-R1.pdf)均对应本次完成下载、文件mtime和SHA256，不以旧下载冒充本轮。
Word OOXML中H1/H9分别outlineLvl=0/8，正文Alpha有粗体run；有序父子项numId分开，子项left=453，编号定义分别decimal、lowerLetter、bullet；引用输出为单格表及左边框。这是导出表示，不当作编辑器新增研究表格。
documents技能的render_docx.py实际渲染一页，当前LibreOffice把子项a.和无序圆点都呈现为1.；XML的w:lvl缺少w:ilvl属性，因果未确定，不声称Microsoft Word表现相同或导出完全保真。
PDF实际一页A4，逐页PNG核对保留a.、圆点、子项缩进、正文局部加粗与引用左线；正文及导出水印为现场真实结果。
文件结构和逐页复核见[首轮导出检查](./10-export-first-round-inspection.json)，七项文件检查通过；这些检查数不计功能双轮。
PDF首轮设置[完整证据](./dom/J09-mixed-pdf-R1-settings.json)于获准前台后恢复落盘；下载后粘贴未送达、残留typeText缺失标点的SyntaxError保留，不归因为正文编辑错误。
[Word第二轮设置](./dom/J09-mixed-word-R2-settings.json)、[下载](./dom/J09-mixed-word-R2-download.json)、[DOCX](./exports/J09-mixed-R2.docx)和[PDF第二轮设置](./dom/J09-mixed-pdf-R2-settings.json)、[下载](./dom/J09-mixed-pdf-R2-download.json)、[PDF](./exports/J09-mixed-R2.pdf)均为实际完成的新文件，单选仅正文，源DOM语义哈希一致。
[双轮文件核对](./10-export-mixed-inspection.json)确认Word结构语义相同、PDF页面/文字语义相同，两种格式均逐页实际渲染复核；Word编号渲染差异重复出现，不修改原文件来掩盖差异。
[本批审计](./10-workflow-export-viewport-audit.json)74项检查通过，新增代表工作流、Word、PDF、桌面UA视口四组，总计25组；导入往返仍未验证。

## 29 最终清理与独立读取

[最终清空历史](./dom/J00-final-clear-history.json)为九块→0块→Undo九块→Redo0块，空页标题保持；文字、格式、层级和data-record-id完整恢复。
Undo后数字data-block-id及DOM对象重建，不能声称所有标识原样复用；[清理审计](./10-final-cleanup-audit.json)保留逐块前后映射，也记录首次“数字ID保持”假设失败及修正理由。
观察器停止、所有__s10变量移除后，Chrome[刷新R1](./dom/J00-final-Chrome-R1.json)、[R2](./dom/J00-final-Chrome-R2.json)，夸克[刷新R1](./dom/J00-final-Quark-R1.json)、[R2](./dom/J00-final-Quark-R2.json)均为真实reload、ready=complete、online=true、0块、空标题、无观察器/查找面板/高亮。
四个独立timeOrigin对应相同空版语义哈希b2c824e3a243f733fc30b557ccca815b11b61f54591394ed0581204a18b42595；不以启动批次或一个保存提示代替最终读回。
每次读取导出后再次移除读回缓存变量；[Chrome现场](./dom/J00-final-Chrome-interface.json)确认节流关闭、停用缓存=false，控制台已关闭，[全窗口空页截图](./exports/J00-final-Chrome-empty.png)已人工视觉核对。
[夸克现场](./dom/J00-final-Quark-interface.json)确认研究控制台关闭，并恢复最新接管前“跳跃-创意广场”；无Raise，其他页正文不作为研究来源。
夸克首次Close命中语言提示，随后关闭主控制台；捕捉错误返回177×166变形缩略图，保留为失败证据、明确不作空页证明。之后重新选研究标签独立确认控制台关闭，再恢复原标签。
清理32项检查通过；清理次数和独立读取不加入功能双轮数。项目业务代码未修改，未执行项目运行或生产验收。

## 30 最终接受与项目专项交接

当前25组有效代表双轮及清理已落盘，J01–J24逐项已有[验收合同与缺口](./10-acceptance-and-gaps.md)，其中真实权限/AI、项目会话隔离、协议竞态、迁移/回退、性能与生命周期均不标通过。
重复的两个空段、视口左溢出、Word当前渲染器编号差异以及所有无效前置/通道故障继续保留；不把异常自动接受为项目规范。
[总交付审计](./10-final-delivery-audit.json)核对124份DOM/辅助JSON、108份编码快照、本地引用及现有审计；文件数和审计检查数均不代替25组功能样例数。
sir于2026-10-27明确回复“接受明确限制，完成 S10（推荐）”，[范围接受记录](./10-scope-acceptance.json)保存原问题、答复及所接受文档版本哈希。依总清单§3和§9，S10正式研究交付完成，J01–J24按代表范围及限制勾选；未验证专项继续转交，异常不默认成为项目允许行为。
本阶段到此结束；未修改业务代码、未执行项目生产验收，也未启动S11。
