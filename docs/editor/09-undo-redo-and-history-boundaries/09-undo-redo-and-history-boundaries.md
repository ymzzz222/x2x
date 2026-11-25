# S09 撤销重做与事务边界

状态：2026-10-26，S09 已按 sir 明确接受的代表范围与限制完成；I01–I07 共 7/7 研究交付，21 组新增固定条件双轮。真实权限切换、AI 锁/解锁历史及独立历史 beforeinput 未验证，转交 S10/项目隔离验收，不计功能通过。
本阶段接续[研究总清单](../ym-research-task.md)，只更新研究资料，不修改项目业务代码。
飞书内部事务、历史栈实现和精确合并时间不能由 DOM 推断。

## 1 本轮现场与执行边界

指定来源为[飞书研究文档](https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX)，主测浏览器为 Google Chrome。
原标签仍被 S08 浏览器会话占用；sir 回复“已释放”后，明确接管入口仍拒绝。
sir 随后明确允许在同一 Chrome 新开后台研究标签。
创建调用超时，但清单确认标签已经创建；未因超时重复调用创建。
浏览器接口读取新标签仍超时，改用 CUA 原生菜单、点击、按键和控制台只读采样。
从搜索浮层点击同文档结果又打开一份标签；两份新增研究标签均属本轮，收尾时需清理。

[初始必要 DOM](./dom/I00-initial-empty-DOM.json)记录首个新标签正文零块、页标题仅 U+200B。
返回文档后重新安装观察器，不把首个标签的 DOM 对象身份带入新加载。
[观察器基线](./dom/I00-observer-baseline.json)记录当前会话、真实 URL、timeOrigin、视口、正文和标题树。
本轮观察器只建立独立临时变量、被动监听和只读快照，不写正文或调用内部编辑命令。
事件记录可信性、修饰键、组合状态、选区；正文与标题保留节点引用和必要 mutation。
关联菜单另采集可见状态与变化；事件、正文 mutation 和菜单变化均有限额，溢出不能计完整通过。
控制台读取会改变原生焦点，后续历史键前必须真实点击目标并检查焦点。
采样时的页面 activeElement 与按键送达时的原生焦点分别判断，不能互相替代。

直接 typeText 输入控制台代码丢失标点，产生 SyntaxError；后续改用保留标点的原生粘贴。
console.log 未返回可读日志，改用 console.dir 的独立标记导出；长结果按压缩分块完整取回。
这些是采集通道限制，不是飞书历史功能结论。
DOM 标识导出遵循 feishu → maiya 规则；来源 URL 和用户正文不替换。

## 2 I01–I07 执行矩阵

| 编号 | 本阶段核对范围 | 当前结果与缺口 |
| --- | --- | --- |
| I01 | S02–S08 各类内容操作的逐步可逆性 | 来源索引及代表类别复审已交付；范围、继承与未重跑部分见[历史合同](./09-history-contracts.md) |
| I02 | 连续输入、中文组合输入、Enter、快捷转换、批量与复杂转换的历史单位 | 新增普通 insertText、真实中文、分隔工作流及约 3 秒粘贴续写双轮；复审复杂转换；精确阈值未知 |
| I03 | 自动合并、编号重算、ID 更新及附加变化的历史归属 | 复杂编号/嵌套已复审；新粘贴双轮核对原块保留、新块重做换 ID；S06 编号继承与 S08 例外保留 |
| I04 | 已知起点往返、撤销后分支、菜单与选区对重做的影响 | 光标、取消菜单、新分支及完整工作流均有具体双轮合同；不扩展到所有菜单 |
| I05 | 空历史、保存中、菜单焦点、只读与锁状态 | 空历史、阅读、单字符粘贴原焦点 Undo 和保存中历史均双轮；输入框继承 S07；真实权限/锁及独立 beforeinput 未验证，sir 已同意转交 S10/项目专项 |
| I06 | 远程操作、重载、切文档及版本恢复后的本地历史 | 四种边界各新增同条件双轮；远程为同账号两浏览器，未推广并发冲突 |
| I07 | 完整工作流反向/正向回放，取消、拒绝及视图命令 | 十三态工作流、同类正文无变化、禁用缩进均双轮；复杂组合和折叠历史已复审 |

每个具体条件固定入口、内容、选区、焦点和节奏，独立双轮；有差异则保留实际分支。
H1/H9 共同行为双轮实测，H2–H8 沿用 sir 已确认的抽样推断，不计实测。
真实中文输入由 sir 配合取得 R1/R3 干净双轮；其他未执行条件保持未验证。
没有足够条件的真实权限只读、锁和未出现入口登记限制，不修改生产权限制造状态；版本还原已有独立双轮。

## 3 REQ-S09-I05-001 新加载空历史的标题快捷键

来源：指定 Chrome 文档真实点击与按键；状态：固定条件双轮已验证。
证据：[R1](./dom/I05-empty-title-history-R1.json)、[R2](./dom/I05-empty-title-history-R2.json)。
前置：本轮新加载尚无正文或标题编辑；正文零块，标题为 U+200B。
通过原生坐标点击标题，真实 Cmd+Z；采样后再次点击标题，真实 Cmd+Shift+Z。
两轮均捕获可信 KeyZ，Undo 为 meta=true/shift=false，Redo 为 meta=true/shift=true。
Undo、Redo 后正文仍零块，标题树与节点身份保持，光标为标题零宽文字偏移 1。
控制台采样后的焦点不能当作快捷键的输入目标；按键事件目标及选择另在 JSON 保留。
两轮未捕获 window error 或 unhandledrejection，未触及事件/正文/菜单日志限额。
本条只描述新加载空历史下的标题焦点，不推广正文空块、菜单输入框、只读、锁或历史按钮。
未据此推断空命令是否在内部建立事务；可观察结果只是文档不变。
验收：重建同一新加载空版本，分别真实按两键，逐步检查标题、正文、身份和选区不发生内容变化。
项目历史门禁、按钮及 beforeinput 支持仍须独立项目验收。

## 4 REQ-S09-I04-001 仅移动光标保留重做

来源：指定 Chrome 文档真实输入、点击和按键；状态：固定条件双轮已验证。
建样：[Alpha 正文](./dom/I00-Alpha-body-fixture.json)，页标题保持空。
证据：[有效 R1](./dom/I04-undo-selection-redo-valid-R1.json)、[有效 R2](./dom/I04-undo-selection-redo-valid-R2.json)。
两轮从 Alpha 末端真实输入 x，得到一个普通 text 块 Alphax；操作间有控制台采样，不属于连续输入分组探查。
Cmd+Z 恢复 Alpha；随后只点击文字前部并按 Right，正文仍是 Alpha，光标偏移变为 2。
再点击文字前部并 Cmd+Shift+Z，均恢复 Alphax；最后点击末端 Cmd+Z 回 Alpha。
因此该固定单段路径中的纯光标改变没有使 x 的重做失效。
逐步状态为 Alpha → Alphax → Alpha → Alpha → Alphax → Alpha。
原逻辑块的外层身份保持，文字叶变化、选择恢复和 mutation 以每轮 JSON 为准。
页标题始终仅 U+200B；两轮未捕获窗口异常，日志限额未触及。
不推广选区范围拖动、切文档、菜单操作、远程编辑或任意历史合并策略。
验收：同一末端输入和光标步骤，逐次核对准确文字、块数/类型、身份、标题保护及实际历史按键。

首个[焦点失败探查](./dom/I04-undo-selection-redo-R1-focus-failed.json)不计有效首轮。
AX click/selectText 未取得原生正文键盘焦点，x 实际进入控制台，与后续查询连成 xconsole 并报 ReferenceError。
该窗口正文仍为 Alpha，未发送正文历史键；已留原记录，未以改名或删日志消除失败。
后续改用截图确认的正文坐标，并在每个内容/历史键前检查原生焦点。

## 4.1 REQ-S09-I04-002 新内容使旧重做分支失效

来源：指定 Chrome 文档真实点击和按键；状态：固定条件双轮已验证。
证据：[R1](./dom/I04-new-edit-invalidates-redo-R1.json)、[R2](./dom/I04-new-edit-invalidates-redo-R2.json)。
两轮均从 Alpha 末端键入 x 得到 Alphax，再 Cmd+Z 回 Alpha。
在末端键入 y 得到 Alphay，随后 Cmd+Shift+Z 保持 Alphay，没有恢复 x 或新增重复字符。
继续 Cmd+Z、Cmd+Shift+Z、Cmd+Z，依次为 Alpha、Alphay、Alpha。
每一步真实读取文字、类型、父级、标题和根连接；正文一直是原单个普通 text 块。
完整路径为 Alpha → Alphax → Alpha → Alphay → Alphay → Alpha → Alphay → Alpha。
旧重做未生效后，一次 Undo 就能撤回 y；未观察到需要额外无变化 Undo 的步骤。
两轮页标题和原块身份保持，事件/必要 mutation 未溢出，窗口异常为空。
两轮均有逐步控制台采样及重新聚焦；不以此推导无间隔输入或远程事务的分组。
验收：同样建立旧分支并撤销，新增不同字符，再分别核对旧分支拒绝和新分支完整往返。
不访问飞书内部历史栈；“分支失效”仅描述真实快捷键的用户可观察结果。

## 4.2 REQ-S09-I04-003 气泡类型菜单取消保留重做

来源：指定 Chrome 文档真实点击、拖选与按键；状态：固定条件双轮已验证。
证据：[R1](./dom/I04-menu-cancel-redo-R1.json)、[R2](./dom/I04-menu-cancel-redo-R2.json)。
Alpha 末端输入 x，再撤销回 Alpha；拖选 Alpha 全文，点击气泡 T 类型入口。
真实菜单包含正文、一级标题及列表等条目；外部菜单 mutation 保存当时内容，不用 AX 代替 DOM。
不选择任何目标，按 Escape 关闭类型菜单；正文仍是 Alpha，未转换类型。
重新点击正文末端并重做，恢复 Alphax；再撤销回 Alpha。
两轮相同的完整内容路径与原块身份、页标题保持，菜单 DOM 确实出现且取消后不再显示类型条目。
因此本条的选区、打开/取消气泡类型菜单没有清掉旧重做，也未增加需要先撤销的内容步骤。
不推广选择转换目标、其他菜单、草稿输入、只读切换或整个气泡的所有关闭规则。
验收同时检查菜单出现与取消、未改正文及后续真实 Redo/Undo，不能仅凭菜单关闭截图。

## 4.3 首批证据审计与输入通道边界

[首批审计](./09-evidence-audit.json)逐步检查四组双轮的语义、原块身份、标题树、根连接、可信键序及日志限额。
JSON 文件包含建样、失败、探查和清理，不按文件数计功能通过；快照展开后摘要哈希逐份校验。
实际 x/y 输入带可信 compositionstart/update、insertCompositionText，compositionend 的 isTrusted=false。
没有通过自建观察器派发这些输入事件；这个通道序列按原样留存，不称为物理键盘或普通 insertText 实测。
历史快捷键均有可信 KeyZ；首批没有捕获 historyUndo/historyRedo 类型的 beforeinput，不能宣称该入口已验证。
此首批检查点之后的真人中文输入见第十一节；组合期间快捷键不由首批结果推出。

## 4.4 OBS-S09-I02-001 连续两键的输入通道探查

证据：[连续两键探查](./dom/I02-continuous-two-keys-R1-input-probe.json)，仅单轮，不计正常连续输入验收。
在 Alpha 末端分别调用真实 x、y 按键，中间仅作 AX 读取，不打开控制台或重定位光标。
目标原拟为 Alphaxy，实际为 Alphax y；两个可信 keydown 分别为 KeyX、KeyY。
对应 beforeinput 的 composition data 先为 x，后为 x y；不能把它写成产品丢字或自动插空格的普遍规则。
一次 Undo 回 Alpha，Redo 回 Alphax y，再 Undo 回 Alpha，原轨迹和准确历史保留。
本条未解释附加空格由输入源、原生控制通道还是产品组合处理引起，后续需独立区分。
不把该探查和前期普通 ASCII、实际中文拼音或精确历史时间阈值合并。

## 5 前期线索与不可直接继承的结论

| 来源 | 已有观察 | S09 还需确认 |
| --- | --- | --- |
| [S02 基础编辑矩阵](../02-creation-and-editing/02-verification-matrix.md) | 输入、Enter、软换行、创建与文字历史分别留证 | 按实际操作类别和前置逐条归档，不能仅数 JSON 文件 |
| [S04 历史与持久化](../04-multi-block-conversion/04-structures-history-and-persistence.md) | 连续三键可合并；分隔操作有独立历史；近间隔探查有差异 | 分离节奏、焦点和选区条件，不推断精确内部阈值 |
| [S05 复杂组合](../05-nesting-and-combinations/05-complex-history-and-persistence.md) | 三转换及各中间态、三次 Undo/Redo 已有双轮 | 不能用端点一致替代逐步回放，也不推广所有转换 |
| [S06 矩阵](../06-numbering-folding-and-outline/06-verification-matrix.md) | 编号更新、折叠和同账号远程修改已有特定历史 | 本地历史隔离、重载与版本恢复仍分别实测 |
| [S07 焦点合同](../07-menus-and-shortcuts/07-verified-contracts.md) | 链接、查找、批注草稿和正文历史有焦点差异 | 不把草稿输入历史算作正文历史，不发布新批注 |
| [S08 粘贴合同第 27–28 节](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) | 约 0.604s 续写的 R2/R3 一步撤销粘贴和 Z；约 2.454s 的 R1 分两步 | 较长间隔只有单轮，固定节奏分别补双轮；时间不是已证明的唯一变量 |
| [S08 重新验证矩阵](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md) | 拒绝、无变化、附加空段和项目安全失败分别登记 | 未变更七项已确认项目保护合同；失败和阻塞不计通过 |

S08 外部旧批注身份恢复的项目隔离失败继续有效，不在 S09 中静默修复或宣布通过。
飞书粘贴后需改焦点才能撤销、撤销残留空段等观察不覆盖 sir 已确认的项目内容保护要求。

## 6 接续顺序与当前现场

新输入使旧重做失效已双轮，接续展开菜单、无变化命令、连续/分隔输入及复杂工作流。
每个新增已验证条件立即补独立需求，保存逐步样本、可信事件、身份和必要变化。
重载、切文档和远程范围在明确保存版本及本地历史起点后执行，不盲撤销未知历史。
本轮现有四组有效双轮不代表 I04 或 I05 整项完成，也不代表项目生产验收通过。
本启动检查点已完成下述清理；S09 后续每批内容编辑仍须重新核对清理、历史、保存与读取。


## 7 启动检查点的清理与恢复

[清理轨迹](./dom/I00-startup-cleanup.json)保留 Alpha → 零块 → Undo 恢复 Alpha → Redo 零块。
删除采用正文两次 Cmd+A 后 Backspace；历史前明确点击空页标题，未把清理推广为正文所有焦点路径。
随后已读到“已经保存到云端”，[观察器停止](./dom/I00-startup-observer-stopped.json)明确无活动用例、零正文块。
[实际重载](./dom/I00-startup-empty-reload.json)的 timeOrigin 从 1792737354012.1 变为 1792738441520.7，navigation=reload。
重载后必要正文 DOM 无数据块，页标题仅 U+200B，主观察器不存在；导出缓存再删除，短查询读回 S09 前缀变量为空。
这是本轮新标签的实际 DOM 重载读取，不称为两浏览器独立读取或全部 S09 持久化验收。

关闭两份本轮研究标签时，最后一个触发自建临时标签分组的删除确认；该确认不改“不再询问”设置。
[中间确认状态](./dom/I00-startup-close-group-dialog.json)和[确认框截图](./dom/I00-startup-close-group-dialog.jpg)保留，不计恢复完成。
确认只清理本轮自建临时分组后，恢复原指定研究标签，发现它仍显示 Alpha。
[原标签旧视图](./dom/I00-original-tab-stale-AX.json)仅有原生 AX 证据；没有该标签的同期 DOM 或网络记录，原因未知。
不将它写成已证实的同步丢失、服务端回滚或历史栈泄漏。
随后真实刷新原标签，AX 不再出现 Alpha 编辑区，并显示空正文占位。
[最终界面恢复](./dom/I00-startup-interface-restored.json)确认原研究 URL、空占位、控制台关闭及两份新增研究标签移除。
[最终界面](./dom/I00-startup-empty-Chrome.jpg)保存；原标签的这一步是 AX/视觉核对，不冒充新一份 DOM 验收。

以上为已经结束的启动检查点；继续批次及最新状态见第十节之后，不用旧清理证明当前现场。
前期证据只是回查线索，连续输入通道、中文组合、beforeinput、只读锁、远程/重载/版本恢复及完整工作流继续保留缺口。

## 8 REQ-S09-I07-001 分段、输入及列表转换的逐步往返

状态：同条件双轮已验证，关联 I02 的分隔操作历史；不是 I07 整项通过。
证据：[R1](./dom/I07-enter-type-convert-workflow-R1.json)、[R2](./dom/I07-enter-type-convert-workflow-R2.json)。
建样为[本轮 Alpha](./dom/I00-continuation-Alpha-fixture.json)，空页标题、顶层单个普通 text。
每步均真实点击、输入或按键后采样，不把本组当成快速连续命令。
Alpha 尾 Enter 得到 Alpha 和空 text；在空段真实输入 Beta，得到第二个非空 text。
Beta 中 Cmd+Shift+7 变为 ordered，Alpha 不变；不是将两个块一起转换。
历史前重新点击空页标题，每次只发送一个历史键，保留真实目标与选区。
三次 Undo 分别取消列表标记、移除 Beta 文字、移除 Enter 新段，准确回 Alpha。
三次 Redo 分别恢复空段、Beta、ordered 标记；再次三次 Undo 准确回 Alpha。
两轮各十三个样本逐项匹配，不以最后一个样本代替中间态。
新块、文字和编号的 DOM 变化及身份按每轮原 JSON 留存，重做不预设必须复用新增身份。
首轮执行调用超时后，先只读核对页面已经结束的记录，才重新导出；没有重复发送历史键。
[工作流审计](./09-workflow-audit.json)核对全部中间文字/类型/父级、可信按键及日志完整性。
本条只覆盖单段分隔工作流；复杂嵌套、批量转换、取消/拒绝及纯视图命令仍需逐项核对。

## 9 REQ-S09-I06-001 真实重载前后的本地历史边界

状态：同条件双轮已验证；I06 的远程、切文档及版本恢复不随本条完成。
证据：[R1 重载前](./dom/I06-reload-local-history-R1-before.json)、[重载后](./dom/I06-reload-local-history-R1-after.json)，
[R2 重载前](./dom/I06-reload-local-history-R2-before.json)、[重载后](./dom/I06-reload-local-history-R2-after.json)。
Alpha 末端真实键入 x；重载前 Undo 回 Alpha，Redo 回 Alphax，先证明历史确实可用。
确认可见“已经保存到云端”，停止观察器，通过 Chrome 重新加载按钮实际刷新。
两轮刷新后旧观察器均不存在，重新安装新观察器；不能跨加载比较 r 引用是否相同。
新加载仍读到一个普通 text Alphax，页标题仅零宽占位。
在标题焦点分别真实 Cmd+Z、Cmd+Shift+Z，两键后均保持 Alphax，不恢复此前 Alpha。
两轮重载后 timeOrigin 分别为 1792747957475.9、1792748055611.6；不把同次 DOM 读取当作两次重载。
因此该路径的保存内容保留，而刷新前可用的本地历史未在新加载中继续生效。
没有查询内部历史栈，也不据此推断服务端历史版本被删除或所有入口的历史均清空。
测试后各真实 Backspace 删除 x，回 Alpha，属于新加载后的新编辑，不称为旧历史撤销。
每轮已保留根、全文、身份、菜单、选区、可信按键和必要变化；[重载审计](./09-reload-history-audit.json)的十四项检查通过。

## 10 持续执行检查点

sir 已要求持续执行直到完成 S09，不以启动检查点作为结束条件。
2026-10-24 检查点新增有效双轮共十七组：首批四组、三步工作流、真实重载、真人中文、阅读视图、切文档、远端隔离、版本还原、同类无变化、原焦点粘贴撤销、禁用缩进、普通连续输入、保存中历史及较长间隔粘贴续写。
每组只按自己的固定条件判定；旧阶段复审不增加本轮新实测组数。
[I01 来源索引](./09-history-source-index.json)定位 316 个需求段、1340 个有效引用、1334 份不同 JSON；索引不是语义通过数。
[历史合同与复审范围](./09-history-contracts.md)区分本次重新执行断言、继承的旧审计及尚未补测的条件。
[接续审计](./09-continuation-audit.json)核对真人中文、阅读、切文档、远端、版本还原、无变化、粘贴和禁用缩进共八组新增双轮，119 项检查通过。
首批四组和另两组工作流/重载分别使用各自审计，不把同一组重复相加。
[前台补测审计](./09-foreground-audit.json)三组新双轮及最终清理共 56 项检查通过；[交付审计](./09-closeout-audit.json)汇总实际范围及未通过限制。
最终 Chrome 清理见第二十四节；早期失败与启动清理仍保留，不能代替当前现场。

## 11 OBS-S09-I02-002 真实中文输入与可信性标记

来源：sir 在当前聊天回复“1”确认的真实中文拼音输入；状态：有效 R1/R3 及完整历史已验证，R2 的额外动作单列。
[首轮](./dom/I02-physical-IME-R1.json)记录 Alpha → Alpha中文 → Undo 回 Alpha → Redo 回 Alpha中文 → Undo 回 Alpha。
输入与候选确认由 sir 完成；后续历史键由 CUA 真实发送，不调用页面内部历史命令。
同一普通段和空页标题保护，完整正文及每个历史状态见原 JSON。
真人输入同样出现可信 compositionstart/update、insertCompositionText，以及非可信 compositionend。
因此 compositionend 的 isTrusted=false 不是已证实的自动化通道特征，也不能凭它判定这次不是物理输入。
首轮没有此前连续两键的额外空格；仍不据此确定空格来自哪个层级，或推断所有中文组合状态的规则。
[有效复测 R3](./dom/I02-physical-IME-R3.json)使用拼音和空格确认，无额外 Enter/Backspace，五个文字/类型状态与 R1 一致。
[R2 原窗口](./dom/I02-physical-IME-R2.json)在确认后有额外 Enter、Backspace，不作为同条件重复。
该窗口首次 Undo 恢复空段，Redo 移除空段；原 phase 标签 restore-Alpha 实际仍有中文及空段，不能按名字判定恢复。
[R2 扩展历史](./dom/I02-physical-IME-R2-extra-history.json)继续核对：下一 Undo 同时撤销中文与 Enter，回 Alpha。
再两次 Redo 分别恢复中文/空段、移除空段；两次 Undo 回中文/空段及 Alpha。
额外分组是真实条件差异，完整保留，不据此给出时间阈值或把它写成单独输入不稳定。

## 12 REQ-S09-I05-002 阅读视图的历史门禁与返回编辑

状态：同条件双轮已验证；仅用户选择的阅读视图，不是服务端撤权或 AI 锁。
证据：[R1](./dom/I05-reading-mode-history-R1.json)、[R2](./dom/I05-reading-mode-history-R2.json)。
从 Alpha 末端输入 x，建立 Alphax 的已知本地历史；通过“编辑→阅读”切到仅查看或评论文档。
首轮实际查询相关 contenteditable 均为 false，标题、正文树和关联界面变化在 JSON 中保留。
点击标题区域分别真实 Cmd+Z、Cmd+Shift+Z，正文均保持 Alphax，未误改阅读内容。
通过“阅读→编辑”返回，随后 Undo 回 Alpha、Redo 回 Alphax、再次 Undo 回 Alpha。
因此本路径的阅读视图禁用内容历史操作，而模式往返没有消耗原可逆编辑。
两轮九个样本的根始终连接，原块和空页标题保持；必要菜单、事件、mutation 及选区完整留存。
不称为账号只读权限、服务器拒绝写入、AI 锁或所有快捷键的整项验证。

## 13 REQ-S09-I06-002 侧栏切文档后的本地历史边界

状态：同条件双轮已验证；只读访问既有 B1 研究文档，没有在另一文档发送内容或历史键。
证据：[R1 来源](./dom/I06-document-switch-R1-before.json)、[另一文档读取](./dom/I06-document-switch-R1-other-read.json)、[返回](./dom/I06-document-switch-R1-after.json)，
[R2 来源](./dom/I06-document-switch-R2-before.json)、[另一文档读取](./dom/I06-document-switch-R2-other-read.json)、[返回](./dom/I06-document-switch-R2-after.json)。
Alpha 尾输入 x；先 Undo 回 Alpha、Redo 回 Alphax，确认切换前历史可用并已保存。
通过真实侧栏点击 B1-first-character-recheck-20261012，读取实际 QAFixtureDocument01XXXXXXXX URL。
另一文档的编辑根存在，原研究根的 rootsConnected=false；旧观察器已停止，不向脱离的根发键。
通过浏览器返回回到原研究 URL，重新安装观察器；两轮均读到单个普通 text Alphax。
分别真实 Cmd+Z、Cmd+Shift+Z 后仍是 Alphax，未撤回切换前的 x。
三处 timeOrigin 均为 1792748055611.6，说明本次不是整页刷新；不能将本条直接归入刷新历史。
跨文档和新根之间不以 r 引用或页面局部 ID 判断同一 DOM 对象。
每轮测试后用新 Backspace 删除 x 回 Alpha，未将其称为原本地历史恢复。
结果只覆盖这两个实际研究文档的侧栏往返；远程修改和历史版本恢复分别见后续独立用例。

## 14 REQ-S09-I06-003 同账号两浏览器的本地历史隔离

状态：相同条件双轮已验证，主判定始终在 Chrome；夸克只作必要远端编辑。
证据：[主 R1](./dom/I06-remote-isolation-R1.json)、[远端 R1](./dom/I06-remote-isolation-R1-remote.json)、[主 R2](./dom/I06-remote-isolation-R2.json)、[远端 R2](./dom/I06-remote-isolation-R2-remote.json)。
Chrome 从 Alpha 输入 x；夸克读到 Alphax，在末端输入 y，Chrome 随后读到 Alphaxy。
Chrome Undo 自己的 x 得到 Alphay，保留 y；Redo 得到 Alphaxy，再 Undo 得到 Alphay。
夸克 Undo 自己的 y 后两端回 Alpha，未把这个远端清理动作归入 Chrome 本地事务。
主窗口七个状态和辅助三态完整记录，实际历史键可信、根保持连接、无捕获异常或溢出。
这证明该单段、顺序穿插、同账号两会话路径的本地隔离；不声称跨账号、同时输入或断线冲突已验证。
[夸克恢复](./dom/I06-remote-auxiliary-restored.json)记录临时观察器清除、控制台关闭及返回原流水线标签。

## 15 REQ-S09-I06-004 历史版本还原清除旧本地可用历史

状态：相同条件双轮已验证；真实版本还原与普通 Undo 分开。
证据：[R1 前置与预览](./dom/I06-version-restore-R1-before.json)、[R1 全轨迹](./dom/I06-version-restore-R1.json)、[R2 前置与预览](./dom/I06-version-restore-R2-before.json)、[R2 全轨迹](./dom/I06-version-restore-R2.json)。
Alpha 尾输入 x，先 Undo 回 Alpha、Redo 回 Alphax，证明还原前历史确实可用。
从页头更多进入历史记录，选择本轮 10月23日 18:07 的同一 Alpha 历史项。
预览默认包含更改标记；其中 Alphay 的 y 标为删除，不能将差异文字直接当成还原正文。
每轮关闭“显示更改”后实际读到空页标题及 Alpha，导出必要预览 DOM，再点击还原并确认。
返回编辑页面后均为 Alpha，timeOrigin 仍为 1792748055611.6，原观察根仍连接。
在标题焦点分别 Undo、Redo 后均保持 Alpha，没有撤回还原或恢复旧 x。
两轮七个正文状态一致，捕获到实际点击、确认与后续可信历史键；不查询内部栈或服务端版本协议。
[最新版本入口读取](./dom/I06-version-history-latest-read.json)另记录当前最新项的还原按钮为 disabled。
[前置失败](./dom/I06-version-restore-R1-focus-failed.json)中原生焦点守卫在第一个 x 之前中止，未向误开的其他文档发内容键；已返回指定文档。
关闭最近访问浮层时的点击曾生成尾空段，[独立修复](./dom/I00-version-focus-repair.json)明确 Undo 移除空段后才进入有效双轮。

## 16 REQ-S09-I07-002 普通正文同类型命令不占内容历史

证据：[R1](./dom/I07-text-noop-R1.json)、[R2](./dom/I07-text-noop-R2.json)，相同条件双轮已验证。
Alpha 尾输入 x，在普通正文按 Cmd+Option+0，仍是单段 Alphax。
随后一次 Undo 直接回 Alpha，Redo 恢复 Alphax，再 Undo 回 Alpha，没有额外无变化历史步骤。
完整六态、原块身份、空页标题、可信快捷键及必要 mutation 保留；不推广标题/列表的同类开关行为。
首轮采集调用超时后只读核对已送达步骤，补最终快照和导出，没有重复撤销。

## 17 REQ-S09-I05-003 单字符真实粘贴后的原正文焦点 Undo

证据：[R1](./dom/I05-paste-body-undo-R1.json)、[R2](./dom/I05-paste-body-undo-R2.json)，相同条件双轮已验证。
Alpha 末端原生粘贴 text/plain x，随后不打开控制台、不换光标，直接在正文 Cmd+Z，均回 Alpha。
再到标题焦点 Redo 恢复 Alphax，Undo 回 Alpha；可信 paste 事件的 plain 载荷明确为 x。
正文原块、页标题及全部必要树和变化保留；原生 paste 恢复调用前用户剪贴板。
这组不能否定 S08 其他格式/结构粘贴的焦点差异，也不能当作已经命中“保存中”的证明。
[立即键入历史探查](./dom/I05-immediate-body-history-R1-composition-probe.json)实际在组合期间按 Cmd+Z，产生 Alphax z；后续 Undo 回 Alpha。
该单轮按真实结果排除，不计非组合输入、普通 Undo 失败或保存中门禁通过。
第二轮准备遇到屏幕捕捉错误，先读取 active、phase 和正文，再继续；没有重复已完成的 paste。

## 18 REQ-S09-I07-003 禁用缩进提示不占内容历史

证据：[R1](./dom/I07-disabled-indent-R1.json)、[R2](./dom/I07-disabled-indent-R2.json)，相同条件双轮已验证。
单个顶层 text Alphax 选全文，气泡“缩进和对齐”中的增加缩进为禁用态。
实际点击后出现“无法缩进当前内容块”，必要 tooltip DOM 在 notices 保留，正文仍为 Alphax。
随后 Undo 直接回 Alpha、Redo 回 Alphax、Undo 回 Alpha，页标题和原块保持。
本条是前端不可用入口的反馈，不称为服务器拒绝、深度上限或真实锁定。
纯菜单取消见第四节；纯视图阅读见第十二节；折叠的独立可撤销性则继承 S06，不能把所有视图都归为无历史。

## 19 2026-10-24 限制与恢复检查点（最新补测见第二十六节）

- 真实权限只读/AI 锁：阅读视图双轮不代表服务器撤权；项目能力映射已交付，实际门禁留 S10/项目专项。
- 历史按钮/独立 beforeinput：当前检查的块菜单、页头更多及子菜单未找到文档 Undo/Redo 按钮；真实历史快捷键未捕获 historyUndo/historyRedo，不派发合成事件补数。
- S08 原混合七块样例的约 2.454s 条件仍为单轮；本轮独立 Gamma 约 3 秒双轮不替代原条件，不推导精确时间阈值。
- 夸克最终空版 DOM 读取失败；Chrome 两次真实重载为空，但不能将其记为最终双浏览器独立读取。

此前 noWindowsAvailable、捕捉失败、扩展 DOM/CDP 超时和刷新后 AX 仍为 Alpha 的记录保留为历史检查点：
[恢复记录](./dom/I00-resume-recovery-status.json)、[界面](./dom/I00-resume-recovery-status.png)、[环境阻塞记录](./dom/I00-continuation-environment-blocker.json)。
sir 随后明确回复“允许临时切前台，完成 S09”，这是本轮 Chrome 前台操作的例外授权。
[恢复基线](./dom/I00-foreground-recovery-Alpha.json)取得可靠 DOM 后才继续内容动作；不将早期 AX 当作已清空。
保存中和普通 ASCII 的旧缺口已由下列真实双轮补齐；上述剩余限制未获接受前，不将所有条目勾选或声明 S09 完成。

## 20 REQ-S09-I02-003 普通连续 insertText 的历史分组

证据：[R1](./dom/I02-continuous-foreground-R1.json)、[R2](./dom/I02-continuous-foreground-R2.json)，同条件双轮已验证。
Alpha 尾一次原生 typeText('ab')，两字间不开控制台、不重建光标，得到 Alphaab。
两轮均捕获可信 beforeinput insertText a、insertText b；有效窗口没有 composition 输入。
一次 Undo 回 Alpha，Redo 回 Alphaab，再 Undo 回 Alpha，共五个完整样本。
这只证明本组实际节奏下合并，不证明所有连续输入合并、硬件键盘重复或精确内部阈值。
早期后台 x y 组合通道探查仍独立保留，前台成功不能解释旧空格的根因。

## 21 REQ-S09-I05-004 可见保存中状态下 Undo/Redo

证据：[R1](./dom/I05-saving-history-R1.json)、[R2](./dom/I05-saving-history-R2.json)，同条件双轮已验证。
Alpha 尾原生粘贴一万个 x，固定等待 1000ms 后在原正文焦点真实 Undo，均回 Alpha。
随后标题焦点 Redo 恢复长段，再分别等待 1000ms 后 Undo、Redo，最终 Undo 回 Alpha。
每轮完整六态为 Alpha、Alpha、Alpha+一万个x、Alpha、Alpha+一万个x、Alpha。
独立被动观察在同一个真实 KeyZ 时刻保留保存标签 HTML；与主键事件记录时间相差不足 8ms。
首次 Undo、定时 Undo 和定时 Redo 均读到 `note-title__time__show` 的“保存中...”。
“已经保存到云端”同时在 hidden span，断言使用可见 class，不用合并文本中包含两种提示作判断。
定时历史后的被动样本延后 40ms；可信历史键、全文、标题、根和必要变化均保存，无日志溢出或捕获异常。
[立即撤销探查](./dom/I05-natural-save-window-R1-probe.json)的首次 Undo 发生在保存中提示之前，不计本条双轮。
这些结果只说明实际可见保存状态下历史可用，不证明服务端回执、保存竞态或所有网络条件；没有节流网络。

## 22 REQ-S09-I02-004 较长间隔多行粘贴与续写分成两步

证据：[R1](./dom/I02-long-paste-continue-R1.json)、[R2](./dom/I02-long-paste-continue-R2.json)。
[独立 Gamma 建样](./dom/I00-Gamma-long-paste-fixture.json)只有一个普通段、空页标题，不复用 S08 混合七块前置。
真实选择 Gamma 内的 amm，原生纯文本粘贴 One\nTwo；等待 3000ms 后原焦点 Shift+Z，不在间隔中读取控制台或移动光标。
可信 KeyV 处理前的选区明确为 amm；paste 事件到 Z keydown 分别为 3195.5ms、3156.1ms。
Z 前可信 keydown 的折叠光标位于 Two 偏移 3；保存的 mutation 包含粘贴产生的块和文字。
完整八态依次为 Gamma → G/One/TwoZ/a → G/One/Two/a → Gamma → G/One/Two/a → G/One/TwoZ/a → G/One/Two/a → Gamma。
各项均为顶层 text，首次 Undo 只移除 Z，再一次 Undo 才撤回粘贴；Redo 及再次 Undo 逐态准确。
原 Gamma 外层 ID/r 始终保留；粘贴新增三块在重做时产生新 ID/r，不能以新身份不同误判内容恢复失败。
额外计划的冒泡 paste 后采样监听未收到事件，故没有独立 after-paste 全树快照；不补造第九态。
paste 事件选区已被产品处理清空，不用它替代 KeyV 前置选区；审计初版的四个校验器误判及纠正原因保留在报告。
这组与 S08 的不同节奏、焦点和前置分别登记；时间不是已证明的唯一分组变量。

## 23 真实锁及历史入口的可达性检查

[入口检查](./dom/I05-lock-and-history-entry-inspection.json)保留 Gamma 块菜单、页头更多及其“更多”子菜单的必要 DOM。
本次检查未找到当前可用的锁定、文档 Undo/Redo 按钮；不推广为飞书平台永远没有这些入口。
没有变更账号权限、邀请只读账号或发起 AI 请求制造锁；本条是可达性单次检查，不计第十八组双轮。
真实服务器权限与项目 AI/生成锁的门禁仍须独立环境验证，源码存在不能算运行通过。

## 24 最终清理、重载与界面恢复

[最终清理](./dom/I00-final-cleanup.json)保留 Gamma → 零正文块 → Undo 恢复 Gamma → Redo 零块。
删除为两次 Cmd+A 和原生 BackSpace；早先错误拼写 Backspace 被驱动在送达前拒绝，记录保留，不计产品失败或已发生编辑。
[观察器停止](./dom/I00-final-observer-stopped.json)确认已显示云端保存、正文为空、观察器不再活动。
通过 Chrome 重新加载按钮分别真实刷新并读取完整必要 DOM：[R1](./dom/I00-final-Chrome-empty-reload-R1.json)、[R2](./dom/I00-final-Chrome-empty-reload-R2.json)。
timeOrigin 分别为 1792770995820 和 1792771412241，navigation 均为 reload；正文零块、页标题仅 U+200B、旧观察器不存在。
[最终变量读回](./dom/I00-final-main-variables-cleared.json)确认正文根已就绪、0 块、空标题、所有 __s09 前缀变量为空。
[最终界面](./dom/I00-final-main-interface.json)确认指定 URL、控制台关闭、没有 Alpha/Gamma；本次恢复没有新建研究标签。
[最终截图](./dom/I00-final-main-empty.png)实际显示空标题和“输入‘/’快速插入内容”占位，未以截图代替上述 DOM。
[夸克读回限制及恢复](./dom/I00-final-Quark-read-limit-and-restoration.json)：真实点刷新后仍未取得文档 DOM，不能计独立空版读取。
该辅助尝试未发送正文编辑、未安装观察器或强制前台；恢复本次接管时的 ColorPicker 颜色选择器 | Element Plus 标签，控制台未见打开。
早期远端隔离双轮的完整证据仍有效，但不能替代此最终空版读回限制。

## 25 2026-10-24 交付检查点（未收尾，见第二十六节）

十七组新增固定条件双轮、旧阶段代表语义复审、源码合同映射和 Chrome 最终清理均已交付。
[交付审计](./09-closeout-audit.json)将 34 个有效窗口与建样、探查、失败及清理分开，保留各分项审计，不把文件数或断言数当功能数。
全部当前阶段 JSON 编码快照及引用已核对；1334 份前期来源哈希复核不等于逐个重新做语义验证。
待 sir 按第十九节接受明确限制后，才能按代表范围结束 S09；真实权限/AI 锁等保持未验证，S08 项目安全失败不变。
本阶段没有修改业务代码、运行项目功能测试或执行生产验收，也未启动 S10。

## 26 2026-10-26 按 sir 要求继续补测

sir 明确选择“继续补测四项限制，暂不收尾”，未接受原四项限制作为结束条件。
真实权限只读/AI 锁环境询问后，sir 回复“暂时没有。继续其他的测试”；这表示暂缺环境，不等于功能通过或批准结束。
本批新增两个固定条件双轮，总计十九组、38 个有效窗口；[补测审计](./09-resupplement-audit.json)135 项检查无未解决问题（含 60 项补测语义/清理检查）。
旧[交付审计](./09-closeout-audit.json)仍保留十七组和当时限制，不用旧报告冒充本批现场。

### 26.1 REQ-S09-I05-005 Chrome 原生历史菜单与文档快捷键分离

证据：[R1](./dom/I05-native-menu-history-R1.json)、[R2](./dom/I05-native-menu-history-R2.json)。
Alpha 尾真实粘贴 x；回到原正文焦点，分别点击 Chrome 菜单栏“编辑→撤销”“编辑→重做”，正文均保持 Alphax。
随后真实 Cmd+Z 回 Alpha、Cmd+Shift+Z 回 Alphax、Cmd+Z 回 Alpha，两轮七态完全一致。
真实原生菜单条目可达，但没有捕获 historyUndo/historyRedo beforeinput；没有以合成事件、内部命令或 DOM 写入补数。
这属于浏览器原生菜单的实际无变化结果，不称为飞书文档历史按钮已验证，也不否认其他平台存在独立历史入口。

### 26.2 REQ-S09-I02-005 原混合语义前置的较长间隔粘贴续写

[重建轨迹](./dom/I00-mixed-seven-block-reconstructed.json)通过原生 HTML 粘贴、真实标题/列表快捷键和折叠按钮重建，不写正文 DOM。
前置为 Title 页标题；Alpha text、编号 1. 的 H9 Beta、Gamma text、折叠 ordered IndentParent（ordered IndentChild 后代）、Quote 引用父子及末空 ordered，共 7 个可见数据块。
新建身份与原 S08 不同；它重建同一语义前置，不称为还原原版本、复用旧 ID 或精确重放原 2.454s 工具时延。
证据：[R1](./dom/I02-mixed-long-paste-continue-R1.json)、[R2](./dom/I02-mixed-long-paste-continue-R2.json)。
真实选择 amm，原生纯文本粘贴 One\nTwo，粘贴调用结束后固定等待 2400ms，再核对 URL/正文焦点并 Shift+Z。
实际 paste→Z 事件间隔分别为 3024.1ms、3023.9ms，包含工具调用及守卫读取；不把固定等待参数冒充实际间隔。
捕获阶段：before、after-paste-passive、continued-Z、undo-Z、undo-paste、redo-paste、redo-Z、restore-Z、restore-paste，共九个完整树样本。
80ms 被动 capture 监听取得独立粘贴后快照；目标四段为 G、One、Two、a，续写后为 TwoZ。
两轮一次 Undo 仅移除 Z，第二次回 Gamma；两次 Redo 分别恢复粘贴及 Z，再两次 Undo 精确回原混合正文。
所有状态的原 Gamma 身份、范围外 rich runs/类型/身份、折叠标记、编号 H9 与 Title 保持；新插入三块重做时生成新 ID。
[隐藏子项核对](./dom/I03-mixed-hidden-child-post-history.json)真实展开后仍有 ordered IndentChild，父级为 IndentParent；再折叠回七块。
原 S08 2.454s 记录仍是历史单轮；本条补齐的是同一语义混合前置的新固定较长节奏双轮，不推导精确阈值或时间为唯一变量。
首次长 sample 查询的 AX 文本截断只影响返回摘要，页面完整 sample 已保存；历史调用超时后读取九个阶段及 end 已完成，才补导出，未重复历史键。

### 26.3 本批最终清理与独立空版读回

[清理轨迹](./dom/I00-resupplement-cleanup.json)：混合七块 → 清空正文 → Undo 恢复 → Redo 清空；Title → 清空 → Undo 恢复 → Redo 清空。
[停止记录](./dom/I00-resupplement-observer-stopped.json)确认空正文及云端保存，随后移除观察器和导出变量。
Chrome 真实刷新：[R1](./dom/I00-resupplement-final-Chrome-R1.json)、[R2](./dom/I00-resupplement-final-Chrome-R2.json)。
夸克独立真实刷新：[R1](./dom/I00-resupplement-final-Quark-R1.json)、[R2](./dom/I00-resupplement-final-Quark-R2.json)。
四次 timeOrigin 各不同，均 ready=complete、正文根存在、0 块、标题仅 U+200B、无观察器或 __s09 前缀变量。
[界面恢复](./dom/I00-resupplement-final-interface.json)确认两端控制台关闭；夸克恢复本次原“流水线 - malt-creative-web - 重庆麦芽传媒有限公司”标签，未强制夸克前台。
[Chrome 截图](./dom/I00-resupplement-final-Chrome.png)保留最终空界面。本批没有新建研究标签。
早期夸克失败保持原记录，现由本批成功读取补齐；本批建样前的两次夸克空版读取不代替上述最终读取。

### 26.4 误导航、守卫缺口与限定核对

混合建样首次坐标动作遇到页面意外跳往“S2赛季获奖案例展示”，选择及 HTML 粘贴先于后续只读 URL 守卫触发。
未把该窗口计为测试；没有对未知历史盲目 Undo。最初限定核对被自动审批拒绝，理由为私人文档超出指定范围。
sir 随后明确允许限定只读核对；[事故记录](./dom/I00-mixed-preparation-navigation-failure.json)只保存编辑状态与研究载荷标记判断，不保存其他正文。
核对时正文和根均 contenteditable=false，未发现 IndentParent 或六个独立研究词块；没有事前全文基线，不据此宣称逐字证明整页未变。
已返回唯一指定研究 URL；后续建样/历史键补上内容动作之前的 URL 与焦点守卫，原失败不删不改为通过。
该检查点仅获得限定核对授权；随后 sir 明确允许只读 Undo/Redo 补测，执行范围及结果见第二十七节。

### 26.5 仍待满足的完成条件

- 真正服务端只读与 AI 锁尚无已明确可用的测试入口；sir 暂时无环境，保持未验证。
- 当前检查的文档菜单无 Undo/Redo 按钮；原生菜单补测未产生历史 beforeinput，不能宣称该入口已覆盖。
- 原混合语义前置的较长节奏双轮及最终夸克读取已补；原精确 2.454s 历史窗口不改成双轮。

本批只修改研究文档与证据，没有修改业务代码、执行项目功能/生产验收或启动 S10；S09 仍未声明完成。

## 27 REQ-S09-I05-006 已加载只读页面的 Undo/Redo 无变化

sir 明确回复“允许，只测只读 Undo/Redo 门禁”，授权临时使用该页，不输入、粘贴、改权限或保存全文。
对象为 S2赛季获奖案例展示；这是对主研究 URL 范围的一次明确例外，不沿用为其他私人文档授权。
证据：[R1](./dom/I05-readonly-history-R1.json)、[R2](./dom/I05-readonly-history-R2.json)；[审计](./09-readonly-audit.json)31 项检查通过（含 26 项证据断言）。
两轮均从已加载只读页开始，根 contenteditable=false，当前已渲染的 22 个数据块及编辑叶只读，未见“编辑”按钮。
在正文可见区域真实点击后 Cmd+Z、Cmd+Shift+Z；捕获的两次可信 KeyZ 目标为 BODY，修饰键分别为 meta、meta+shift。
每轮 before/undo/redo 三个状态的内容、结构及格式摘要一致，根保持只读且连接，范围内未捕获文字或结构 mutation。
R1 捕获两项属性 mutation，R2 为零；未捕获 beforeinput/input，未触及日志限额；不将无内容变化写成零 DOM 变化。
被动监控只在浏览器内计算哈希，导出结构元数据、摘要和必要事件，没有保存正文或标题全文。
摘要只覆盖当时已渲染 DOM；虚拟化之外内容未逐字核对，不能称为全文持久化或完整文档内容证明。
这个页面没有先前已证明可用的本地编辑历史，因此不能区分“空历史无事可撤销”与“只读阻止已有历史”。
contenteditable=false 与无编辑按钮也不能单独证明服务端写入拒绝、权限来源或 AI 锁；没有改权限或调用写接口制造该结论。
导航初期一次 URL 守卫阻止读取，确认目标完成加载后才安装监控；初次安装检查尚未读到临时变量，重试读取安装结果后进入有效双轮。
[恢复记录](./dom/I00-readonly-test-restored.json)：观察器停止、__s09 前缀变量为空，再导航返回指定研究页；加载后 0 正文块、空标题，控制台关闭。
本次只读补测没有输入或粘贴正文、修改权限、新建研究标签，也未修改业务代码或启动 S10。
累计新增有效双轮为二十组、40 个窗口；旧阶段复审、事故核对及清理均不计组数。
仍待真实服务端权限及已有历史门禁环境、AI 锁环境与独立 history beforeinput 入口；sir 已说明暂缺环境，不将缺口自动算作完成。

## 28 REQ-S09-I05-007 有效本地历史与原生右键入口分离

在指定研究文档标题右键检查，[空历史入口](./dom/I05-context-menu-empty-availability.json)显示 Chrome 原生撤消/重做禁用；不计功能双轮。
[有效 R1](./dom/I05-context-menu-valid-history-R1.json)、[有效 R2](./dom/I05-context-menu-valid-history-R2.json)各从 Alpha 尾真实粘贴 x，再右键 Alphax。
原生菜单撤消/重做两项仍禁用；Escape 取消后正文保持 Alphax；真实快捷键依次回 Alpha、恢复 Alphax、再回 Alpha。
六态为 Alpha → Alphax → Alphax → Alpha → Alphax → Alpha，原块身份、空页标题和根连接保持，两轮一致。
有文档历史不等于浏览器原生编辑历史可用；右键路径也未捕获 historyUndo/historyRedo beforeinput，不用合成事件或内部命令代替。
[审计](./09-context-entry-audit.json)118 项检查通过，含本组语义、最终清理、107 份阶段 JSON 及文档引用检查；累计二十一组、42 个有效窗口。
[清理轨迹](./dom/I00-context-entry-cleanup.json)为 Alpha → 空 → Undo 恢复 Alpha → Redo 空；[停止记录](./dom/I00-context-entry-observer-stopped.json)确认云端保存和空正文。
Chrome 最终真实刷新：[R1](./dom/I00-context-final-Chrome-R1.json)、[R2](./dom/I00-context-final-Chrome-R2.json)；夸克独立刷新：[R1](./dom/I00-context-final-Quark-R1.json)、[R2](./dom/I00-context-final-Quark-R2.json)。
四次 timeOrigin 不同，正文根已加载、0 块、空页标题、无 __s09 前缀变量；[界面恢复](./dom/I00-context-final-interface.json)确认控制台关闭和辅助原标签恢复。
未修改业务代码、权限或浏览器安全设置，没有新建研究标签；一次工具代码语法错误在执行前拒绝，未重送任何已发生内容/历史键。
当前可达检查已覆盖页头更多/子菜单、块菜单、Chrome 编辑菜单及右键菜单；未发现的文档按钮不编造，未捕获事件不追认为通过。
剩余测试所需条件：在已证明 Undo/Redo 可用的同一会话中，由真实权限变化或真实 AI 锁限制编辑，再分别验收按钮/键盘/原生历史事件及解锁恢复。
sir 已说明暂缺测试环境；当前没有相同条件可继续实测，不靠增加近似用例代替，S09 保持进行中，已有完成证据和未验证项分别保留。

## 29 剩余运行条件的源码定位

[项目专项入口与条件](./09-history-contracts.md#11-剩余项目专项的真实入口与执行条件)已按真实调用链补齐，[来源映射](./09-remaining-acceptance-map.json)记录 8 份当前文件哈希与 7 项静态检查；新增双轮仍为 21 组。
真实 AI 启动会先保存当前内容并发送协同通知；路由工作台不是隔离测试页，未在现有业务文档上直接触发生成或改权限。
协同 Undo/Redo 命令本身未显式检查可编辑性，外层事件和框架能否阻止历史仍须运行验证；这是待测风险，不是已确认缺陷。
需要可弃置文档、可用旧历史、真实权限切换与真实 AI 任务环境；本次未改业务代码、未运行项目测试，现场保持上节空版恢复状态。
在 sir 明确提供环境或同意将项目专项转交后再更新完成标记，不把新的静态读取算作飞书功能通过。

## 30 最终确认与阶段完成

2026-10-26，sir 明确回复“转交项目专项，按明确限制完成 S09”，此前暂不收尾条件已由本次确认更新。
I01–I07 共 7/7 按代表范围交付；21 组新增双轮、42 个有效窗口，旧证据复审、失败、推断和限制分别保留。
[最终交付审计](./09-final-delivery-audit.json)与[后续专项交接](./09-history-contracts.md#12-最终接受与-s10项目隔离验收交接)记录完成依据；未验证项仍未通过，未改业务代码、未执行项目运行验收、未启动 S10。
