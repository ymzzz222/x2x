# S02 标题分段与软换行补测

本文按标题级别和光标位置交付规则，创建基线及阶段边界见[阶段需求](./02-creation-and-editing.md)。sir 于2026-10-14明确后续仅验证H1/H9，中间H2–H8共同行为允许推断：推断单列、不计实测数量，级别样式/DOM类型不当成相同；两端冲突时保留条件与差异。已采集的H2证据保留，不再补齐其未测位置。B06/B07及项目生产验收未收口。

## 环境与采集合同

来源为指定 [Chrome 飞书文档](https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX)，macOS、Asia/Shanghai，sir 已授权保持前台实测。实际 UTC 时间、视口与默认计算样式分别在 JSON，未冻结视觉/性能容差。

session=S02-1791940824848；旧 IME 窗口全部落盘后，只清理观察器记录数组、重取空正文基线，segment=heading-enter-1791944430779。WeakMap 保持，节点引用仅在本运行会话比较；不修改正文、不调用内部编辑命令。正文/既有 popup/根父节点及真实键盘、输入、组合、选区事件继续记录；正文外目录变化和完整新浮层、console 方法未完整监听。

每轮真实点击原标题文字，Cmd+Left 定位首部，必要时真实 Right 到目标偏移；每键前检查指定 URL 和正文 AX 焦点，控制台语句前检查提示焦点及命令内容。逐键前选区在 globalKeys，双 requestAnimationFrame 后状态在 steps，顺序是可观察顺序，不代表内部事务或精确输入延迟。

`editorAfter` 是正文焦点末态；结束窗口时的 `after` 可能处于控制台选区，二者不能互换。各动作由用例编号与 steps 顺序定位，撤销/重做按真实按键独立状态验收。

## H1 前置与重复方法

唯一空 text n17/业务 ID=2、空页标题。真实井号/空格创建 heading1，再数字键 `123`；生成区 n975/原行 n976/普通文字叶 n984（文字文本 n985）/原哨兵叶 n977，见 [建样](./dom/text-heading1-enter-fixture.json)。建样窗口为 SETUP，不新增创建规则通过项。

原 H1 默认 26px/500/36.4px，具体样式和矩形以 JSON 为准。新增普通文本与标题各用真实类型/样式验收；不能根据用户文字相同把它们合并为一种结构。

以下每轮从前轮最后一次撤销恢复的同一 H1 `123` 开始；没有重新创建标题。可信 Enter 前的原文字节点与偏移对应一致，页标题和范围外内容保持空。

## [✅] REQ S02 B06 008 H1 首部 Enter

两轮 Cmd+Left 后，可信 Enter 前均为 n985 偏移0、折叠选区。Enter 新增同父前置空 text R1 n986/区 n989、R2 n1000/区 n1003；原 n17/heading1、区 n975、行 n976 与文字 `123` 保持，光标仍 n985 偏移0，不移入新空段。

真实 Cmd+Z 移除前置 text，Cmd+Shift+Z 以新 text n993/区 n996、n1007/区 n1010 恢复，再次 Cmd+Z 移除。四步光标保持原标题文字首，空页标题不变。

证据：[首部 R1](./dom/text-heading1-enter-head-r1.json)、[R2](./dom/text-heading1-enter-head-r2.json)。mutation 为20/22条，事件均9条；差异保留，不强制噪声属性写入次数一致。页面异常/overflow=0，未触发 composition。

复刻断言：H1 文字首 Enter 在原标题之前插入普通空文本；原标题/内部区/文字身份保持，光标留原文字首。撤销只移除该空段，重做新对象，仍可在原标题继续输入；不能创建第二个空 H1、转换原标题或移走其文字。

正文前后父子、必要新增/删除顺序、空段身份与默认样式见 JSON。菜单未作为本例入口；保存提示已观察，独立持久化、目录更新、格式继承和其他标题级别仍未验证。

## [✅] REQ S02 B06 009 H1 中部 Enter

两轮 Cmd+Left/一次 Right，可信 Enter 前均为 n985 偏移1，即 `1|23`。原 n17/heading1、区 n975/原文字对象保留 `1`；同父新增后置 heading1 R1 n1014/区 n1018/文字文本 n1021=`23`、R2 n1044/区 n1048/文字文本 n1051=`23`，光标后段文字偏移0。

真实 Cmd+Z 删除新标题、原文字恢复 `123`/n985偏移1；重做新 heading1 n1029/区 n1033/文字文本 n1036，n1059/区 n1063/文字文本 n1066，仍后段 `23`/偏移0；再次撤销回原样例。

证据：[中部 R1](./dom/text-heading1-enter-middle-r1.json)、[R2](./dom/text-heading1-enter-middle-r2.json)，各46条mutation、22条事件，页面异常/overflow=0、未触发composition。

复刻断言：中部拆成两个同父 H1，保留原标题与原区、准确分配 `1`/`23`，光标后标题文字首。历史恢复单个 `123` 和偏移1，重做新后标题及新后文字；不降级后段为text，不重复/遗漏用户字。

合法结构仅确认本例同父两 H1；内部身份、默认样式、选区与必要 mutation 见 JSON。保存提示已观察，独立持久化、编号/折叠/目录/格式组合及其他级别未验证。

## [✅] REQ S02 B06 010 H1 尾部 Enter

两轮 Cmd+Left/三次 Right，可信 Enter 前均为 n985 偏移3。Enter 保持原 n17/heading1、区 n975/`123`，同父新增后置空 text R1 n1074/区 n1077/空叶文本 n1080、R2 n1088/区 n1091/空叶文本 n1094，光标新空叶偏移1。

真实 Cmd+Z 移除新 text、回原 n985偏移3；重做新 text n1081/区 n1084/空叶文本 n1087，n1095/区 n1098/空叶文本 n1101，光标各偏移1；再次撤销回唯一H1 `123`。

证据：[尾部 R1](./dom/text-heading1-enter-tail-r1.json)、[R2](./dom/text-heading1-enter-tail-r2.json)，各34条mutation、25条事件，页面异常/overflow=0、无composition。

复刻断言：H1 非空尾 Enter 续普通空文本，不能续空 H1；原标题/区/文字不变，光标新正文空叶。历史只回放此次新增段，重做新对象，撤销回原文字尾，页标题保持空。

新 text 默认样式及实际身份/父子/位置见JSON，不把标题样式无条件继承到普通正文。保存提示已观察，独立持久化、历史精确分组阈值、格式继承与其他标题级别仍待测。

## [✅] REQ S02 B06 011 H1 首中尾 Shift+Enter

同一 H1 前置与记录段，每轮真实点击/Cmd+Left，首部偏移0、中部一次Right/偏移1、尾部三次Right/偏移3，可信Shift+Enter前选区均在原n985且各位置两轮一致。三组均保持唯一heading1 n17/区n975、空页标题与标题级别，不新增正文text或第二标题。

首部在原行n976之前新增空ace-line R1 n1102、R2 n1108，原文字`123`/光标n985偏移0保持；撤销移除空行，重做新行n1105/n1111，再撤销。见[首部R1](./dom/text-heading1-softbreak-head-r1.json)、[R2](./dom/text-heading1-softbreak-head-r2.json)，mutation为24/22条、事件均9条，必要差异保留。

中部原行/文字对象保留`1`，同区新增后行n1114/n1132、文字文本n1116/n1134=`23`、光标偏移0；撤销原`123`/n985偏移1，重做新后行n1123/n1141、新文字文本n1125/n1143偏移0，再撤销。见[中部R1](./dom/text-heading1-softbreak-middle-r1.json)、[R2](./dom/text-heading1-softbreak-middle-r2.json)，各46条mutation/15条事件。

尾部保持原`123`，同区新增后置空行n1150/n1164、空叶文本n1152/n1166，光标偏移1；撤销回n985偏移3，重做新空行n1157/n1171、新空叶文本n1159/n1173偏移1，再撤销。见[尾部R1](./dom/text-heading1-softbreak-tail-r1.json)、[R2](./dom/text-heading1-softbreak-tail-r2.json)，各44条mutation/19条事件。

复刻验收：三个位置按对应同区行树与准确光标处理，原块/区/文字身份保持，新增逻辑行重做新对象、普通Enter的块类型规则不能套入软换行。原行哨兵更替、每键前后选区、必要mutation和默认字号/字重/行高见JSON；全部页面异常/overflow=0、无composition，保存提示已观察。独立持久化、目录/折叠/编号、格式继承、其他标题级别/IME与生产验收仍未覆盖，外围目录和完整浮层/console方法缺口保持。

## [✅] REQ S02 B06 012 空 H1 Enter 及历史

真实从H1 `123`尾逐次Backspace删三字，保持空heading1 n17/区n975/原行n976/空叶文本n1177，见[空前置](./dom/text-heading1-empty-fixture.json)。该恢复只是SETUP，未单独补删除历史。两轮真实点击空标题，可信Enter前均n1177偏移1。

Enter保持空H1及原区/行/空叶，在其后新增同父空text R1 n1178/区n1181/空叶文本n1184，R2 n1192/区n1195/空叶文本n1198，光标新增空叶偏移1；不把原空标题转正文或删除原标题。Cmd+Z移除新text、回原空叶n1177偏移1，重做新text n1185/区n1188/空叶文本n1191，n1199/区n1202/空叶文本n1205，光标各偏移1；再撤销回唯一空H1。

见[空Enter R1](./dom/text-heading1-empty-enter-r1.json)、[R2](./dom/text-heading1-empty-enter-r2.json)，各28条mutation/16条事件。验收须保持原标题身份/级别/空态，新增段是普通text且历史重做新对象；页标题保持空，原与新空叶光标按各动作准确回放。样式/父子/变化序列见JSON，页面异常/overflow=0、无composition；保存提示已观察，独立持久化/格式/其他级别和生产验收仍有缺口。

## [✅] REQ S02 B06 013 空 H1 Shift+Enter 及历史

两轮从前轮撤销恢复的同一唯一空H1 n17/区n975/行n976/空叶文本n1177开始，真实点击空标题，可信Shift+Enter前均原空叶偏移1。新增同区、原空行之前的ace-line R1 n1206、R2 n1212；原区/行/空叶保持、仍唯一H1，光标留n1177偏移1。

Cmd+Z移除新空行，重做新行n1209/n1215，再次撤销；四步原标题/原空叶与光标保持，空页标题不变。见[空软换行R1](./dom/text-heading1-empty-softbreak-r1.json)、[R2](./dom/text-heading1-empty-softbreak-r2.json)，各26条mutation/6条事件。验收不能把空标题的软换行当新增text或标题退出，也不能套用非空尾部新增后置空行/移动光标的规则。完整行树/叶/默认样式及必要mutation见JSON；页面异常/overflow=0、无composition，独立持久化、目录/复杂格式/其他级别与生产验收未验证。

## 交付与缺口

## H9 两端对照前置

## [✅] REQ S02 B06 021 空 H9 Enter 及历史

真实从H9 `123`尾删三字，保持唯一空heading9 n17/区n1419/原行n1420/空叶文本n1624，见[空前置](./dom/text-heading9-empty-fixture.json)，仅为SETUP不新增删除通过。两轮真实Enter前均原空叶偏移1；原标题/区/行/空叶保持，同父后置新增空text n1625/区n1628/空叶文本n1631、n1639/区n1642/空叶文本n1645，光标新空叶偏移1。撤销回原标题，重做新text n1632/区n1635/空叶文本n1638、n1646/区n1649/空叶文本n1652，再撤销。各28条mutation/16条事件、异常/overflow=0。见[空EnterR1](./dom/text-heading9-empty-enter-r1.json)、[R2](./dom/text-heading9-empty-enter-r2.json)。

R1末次撤销的双帧steps捕获到docx-selection-hidden-textarea，选区n144偏移29、type=Range而collapsed=true；不能把该临时状态当原标题光标。对应可信末次z后事件明确focusin/selectionchange回原n1624偏移1，再focusout到控制台；稳定落点用这条真实事件链核对，原记录不改写。R2末次撤销steps及同类恢复事件均为原空叶偏移1。验收最终保持唯一空H9/原区及有效空叶落点、新text重做新对象，允许已观察临时隐藏输入状态被单列，而非宣称整个焦点过程一致；与空H1的稳定输出/历史规则一致。页标题保持空，保存提示已观察，独立持久化/复杂格式/生产验收仍未覆盖。

## [✅] REQ S02 B06 022 空 H9 Shift+Enter 及历史

两轮唯一空H9 n17/区n1419/行n1420/空叶文本n1624，可信Shift+Enter前原空叶偏移1。同区原空行之前新增空ace-line n1653/n1659，原区/行/空叶与光标保持，仍唯一H9。撤销移除新行、重做新行n1656/n1662、再次撤销；四步原空叶偏移1、空页标题不变。各26条mutation/6条事件、异常/overflow=0，无composition，见[空软换行R1](./dom/text-heading9-empty-softbreak-r1.json)、[R2](./dom/text-heading9-empty-softbreak-r2.json)。验收前置空逻辑行、原标题/原区保持及新行历史，不能当新增text或标题退出；与空H1对应规则一致。父子/必要mutation、真实按键/选区与默认样式见JSON；独立持久化/复杂格式/外围目录/console方法与生产验收缺口保持。

本组真实Backspace将最后唯一空H9解回text，外层n17/业务ID=2保持，内部重建区n1667/行n1668/空叶文本n1670偏移1，空页标题不变，见[最终恢复](./dom/text-heading9-group-empty-restore.json)。14条mutation/7条事件、异常/overflow=0，属于SETUP，不新增转换历史通过。最终监控active=null、connected=true、overflow=0；原生通道恢复方法只作为操作环境记录。

## H1/H9 对照与 H2–H8 推断（sir 已授权抽样）

程序比较8场景×2轮共16组H1/H9记录：真实键及修饰键、块类型角色/顺序/原标题身份、每条逻辑行的用户文字、原编辑区角色、折叠光标偏移及所属原/新块均一致。仅将heading1/heading9规范成“heading”角色，保留各级属性/样式差异；未比较为相同的mutation次数、全部class/外层布局或内部实现。空H9 Enter R1末次撤销按上述稳定selectionchange补核，不抹去其隐藏输入中间态。规则来源是H1/H9实测加sir授权推断，不是中间七个级别已经实测。

| 推断编号 | H2–H8同级别Hn的共同规则（限定本例空/123、同父、无复杂格式） | 两端依据 |
| --- | --- | --- |
| INF-S02-H01 | `123`首部Enter：新增前置空text，原标题/区/文字保持、光标原文字首；撤销移除、重做新text | V02-74/87 |
| INF-S02-H02 | `1\|23`中部Enter：同父Hn=1/Hn=23，光标后段首；撤销123/偏移1，重做新后Hn | V02-75/88 |
| INF-S02-H03 | `123`尾部Enter：后置空text/空叶偏移1，原标题保持；撤销原文字尾、重做新正文 | V02-76/89 |
| INF-S02-H04 | 首部Shift+Enter：同区前置空行、原文字首光标保持；撤销移除、重做新行 | V02-77/90 |
| INF-S02-H05 | 中部Shift+Enter：同区两行1/23、后行首光标；撤销123/偏移1，重做新行 | V02-78/91 |
| INF-S02-H06 | 尾部Shift+Enter：同区后置空行/空叶偏移1；撤销文字尾、重做新行/空叶 | V02-79/92 |
| INF-S02-H07 | 空Hn Enter：原标题保持、后置新空text；稳定历史恢复原空叶或新正文空叶偏移1 | V02-80/93 |
| INF-S02-H08 | 空Hn Shift+Enter：同区前置空行、原区/行/空叶与光标保持；重做新行 | V02-81/94 |

上表8条推断不加进94条实测分支，不复制随机节点引用/逐级mutation次数，也不推断七级字号相同；H2已有独立结果继续保留。格式继承、折叠/编号/目录、组合中转换/协同、其他入口与独立持久化需按两端独立补证；新差异按条件保留后定位，不以抽样为理由覆盖异常。

本轮恢复说明：坐标点击再次报窗口不可用；F6及空正文语义点击未成功恢复焦点。真实关闭DevTools后正文获得焦点并成功输入，随后通过Chrome显示菜单重开控制台。此后软换行窗口用相同原生面板关闭/菜单重开流程，可信编辑键始终在正文焦点下执行；没有脚本focus、设置选区或调用内部编辑命令。面板关闭导致编辑视口改变，实际视口分别在steps中，不把布局差异当成功能冲突，也不据此宣布视觉一致。此前“H9尚未输入”的条目保留为恢复前检查点。

session沿用、segment=heading9-1791946040983。此前正文点击报窗口不可用，随后语义关闭DevTools恢复正文焦点，可信首井号已进入空text；再真实八井号/空格及数字`123`生成heading9 n17/区n1419/行n1420/文字文本n1429。重新打开DevTools的快捷键触发飞书搜索，真实Escape取消后从Chrome“显示→开发者→JavaScript控制台”菜单打开。前置窗口含这些工具/焦点操作，112条mutation/57条事件、异常/overflow=0；见[H9建样](./dom/text-heading9-enter-fixture.json)。不将混合SETUP计作H9创建或快捷键通过；实际H9类型与字号等属性按JSON独立保留。

## [✅] REQ S02 B06 020 H9 首中尾 Shift+Enter

同一H9 `123`/原区n1419/文字文本n1429，首部Cmd+Left偏移0、中部一次Right偏移1、尾部三次Right偏移3，可信Shift+Enter前各位置两轮一致；每轮以最后撤销恢复样例。首部同区原行n1420之前新增空行n1549/n1555，原文字/光标n1429偏移0保持；撤销移除、重做新行n1552/n1558、再撤销。见[首部R1](./dom/text-heading9-softbreak-head-r1.json)、[R2](./dom/text-heading9-softbreak-head-r2.json)，mutation24/18、事件8/7，面板焦点等差异保留。

中部原行/文字保留`1`，同区新增后行n1561/n1579、文字文本n1563/n1581=`23`/光标偏移0；撤销原`123`/n1429偏移1，重做新行n1570/n1588、新文字文本n1572/n1590偏移0，再撤销。见[中部R1](./dom/text-heading9-softbreak-middle-r1.json)、[R2](./dom/text-heading9-softbreak-middle-r2.json)，mutation42/44、事件13/14。尾部原`123`保持、同区后置空行n1597/n1611、空叶文本n1599/n1613偏移1；撤销原文字尾，重做新行n1604/n1618、空叶文本n1606/n1620偏移1，再撤销。见[尾部R1](./dom/text-heading9-softbreak-tail-r1.json)、[R2](./dom/text-heading9-softbreak-tail-r2.json)，各42条mutation/18条事件。

验收三个位置的同区行树、文字分配和准确光标，与H1相应场景一致：始终唯一H9、原区/原文字保持，新增行重做新对象；不套用普通Enter的块类型规则，页标题保持空。完整哨兵/行树/必要mutation及各状态视口/默认样式见JSON，视觉与性能容差未冻结。页面异常/overflow=0、无composition，保存提示已观察，独立持久化、复杂格式/目录/折叠/编号及生产验收未覆盖，完整外围浮层/console方法缺口保持。

## [✅] REQ S02 B06 017 H9 首部 Enter

两轮点击原文字/Cmd+Left后Enter前n1429偏移0。新增同父前置空text n1433/区n1436、n1447/区n1450，原H9/区/`123`/原文字首光标保持。撤销移除前置text，重做新text n1440/区n1443、n1454/区n1457，再撤销。mutation22/20、事件均9，异常/overflow=0。见[首部R1](./dom/text-heading9-enter-head-r1.json)、[R2](./dom/text-heading9-enter-head-r2.json)。验收首部前置普通正文、保留原标题身份和级别、光标原文字首，新段重做新对象；默认样式/父子/变化见JSON，空页标题保持。当前与H1对应规则一致，不要求H1/H9字号相同。

## [✅] REQ S02 B06 018 H9 中部 Enter

两轮Cmd+Left/一次Right后Enter前n1429偏移1。原H9/区/文字对象保留`1`，新增同父后置H9 n1461/区n1465/文字文本n1468=`23`、n1491/区n1495/文字文本n1498=`23`，光标后段偏移0。撤销原`123`/n1429偏移1，重做新H9 n1476/区n1480/文字文本n1483、n1506/区n1510/文字文本n1513，再撤销。各46条mutation/22条事件、异常/overflow=0。见[中部R1](./dom/text-heading9-enter-middle-r1.json)、[R2](./dom/text-heading9-enter-middle-r2.json)。验收准确拆成同父两个H9，原区/身份保持、后段文字首落点，历史新后段及原文字恢复正确，不降级text、不丢字/重复；与H1对应规则一致。

## [✅] REQ S02 B06 019 H9 尾部 Enter

两轮Cmd+Left/三次Right后Enter前n1429偏移3。原H9/区/`123`保持，同父新增后置空text n1521/区n1524/空叶文本n1527、n1535/区n1538/空叶文本n1541，光标各偏移1。撤销回原文字尾，重做新text n1528/区n1531/空叶文本n1534、n1542/区n1545/空叶文本n1548，再撤销。各34条mutation/25条事件、异常/overflow=0。见[尾部R1](./dom/text-heading9-enter-tail-r1.json)、[R2](./dom/text-heading9-enter-tail-r2.json)。验收续普通空正文、新空叶落点，原标题/区/文字保持，历史重做新正文；与H1对应规则一致。三组均无composition、空页标题保持，保存提示已观察；独立持久化/复杂格式/目录/编号/折叠和完整生产验收仍未覆盖，完整外围浮层与console方法缺口保持。

## H2 分段前置与恢复

H9接续检查点：已建立segment=heading9-1791946040983和`SETUP-heading9-enter-fixture`前置窗口，但正文点击两次报告noWindowsAvailable。中间只读AX/截图与控制台查询确认指定URL、唯一空text n17/区n1408/空叶文本n1411、overflow=0，active为该SETUP；没有真实H9井号/空格输入，不能新增H9通过项或立即推断中间级别一致。新H9窗口未结束/导出，接续先读取active与正文，不清理监控。两端对比完成后才登记共同规则推断；已经实测的级别差异仍保持独立。

H2首/中软换行是在sir调整抽样口径之前已采集的窗口；本次只补结束/导出并恢复起点，不继续H2尾部或空标题测试。两轮首部在原区n1231/原行n1232之前新增空行n1358/n1364，原`123`与文字首n1241偏移0保持；撤销移除、重做新行n1361/n1367、再撤销，各22条mutation/9条事件，见[首部R1](./dom/text-heading2-softbreak-head-r1.json)、[R2](./dom/text-heading2-softbreak-head-r2.json)。中部`1|23`同区拆成两行，新增后行n1370/n1388、文字文本n1372/n1390=`23`/偏移0；撤销原`123`/n1241偏移1，重做新行n1379/n1397、文字文本n1381/n1399偏移0、再撤销。见[中部R1](./dom/text-heading2-softbreak-middle-r1.json)、[R2](./dom/text-heading2-softbreak-middle-r2.json)，mutation46/48、事件均15，R2跨切换但可信按键完整。四窗均保持唯一H2/原区/空页标题，异常/overflow=0、无composition；保存提示已观察，独立持久化/复杂格式/外围目录和console方法未覆盖。此已有实测只交付相应位置，不补造其余位置结果。

口径调整后真实Cmd+Right/三次Backspace删`123`、再Backspace解回text，完整[恢复](./dom/text-heading2-scope-change-restore.json)保留42条mutation/17条事件、异常/overflow=0。该链仅为SETUP恢复，不新增删除或转换通过项；后续转入H9两端对照。

本轮同session，清理已导出的旧记录数组并建立segment=heading2-1791945308486、重取空正文基线，节点映射保留。唯一空text真实两井号/空格、数字键`123`生成heading2 n17/区n1231/行n1232/文字文本n1241，空页标题保持；59条mutation/27条事件，见[H2建样](./dom/text-heading2-enter-fixture.json)。建样为SETUP，不新增输入规则通过。每轮用前次撤销恢复同一样例、可信按键前定位原文字相同偏移；默认样式/视口/时间见JSON，不推定与H1相同。

用户切换Chrome后的接续只读确认尾部首轮仍active，但其Enter/撤销/重做/再撤销均已捕获、正文已回唯一H2 `123`，connected=true/overflow=0。未清空记录，补结束窗口再执行第二轮，全部必要JSON已成功导出；下方“尚未导出/现场未知”保留为恢复前历史检查点，不再是当前缺口。

## [✅] REQ S02 B06 014 H2 首部 Enter

两轮真实点击/Cmd+Left后Enter前n1241偏移0。新增同父前置空text R1 n1242/区n1245、R2 n1256/区n1259；原heading2 n17/区n1231/`123`及文字首光标保持。Cmd+Z移除新text，重做新text n1249/区n1252、n1263/区n1266，再撤销；原文字首选区保持、空页标题不变。各20条mutation/9条事件、页面异常/overflow=0，见[首部R1](./dom/text-heading2-enter-head-r1.json)、[R2](./dom/text-heading2-enter-head-r2.json)。验收须前置普通空text而非H2，原标题/区/文字身份不变、新段重做新对象；正文与控制台选区分开。保存提示已观察，独立持久化/目录/复杂格式与生产验收仍未覆盖。

## [✅] REQ S02 B06 015 H2 中部 Enter

两轮Cmd+Left/一次Right后Enter前n1241偏移1。原heading2 n17/区/文字对象保留`1`，新增同父后置heading2 n1270/区n1274/文字文本n1277=`23`、n1300/区n1304/文字文本n1307=`23`，光标后段文字偏移0。撤销删新H2、原文字恢复`123`/n1241偏移1；重做新H2 n1285/区n1289/文字文本n1292、n1315/区n1319/文字文本n1322，再撤销。各46条mutation/22条事件、页面异常/overflow=0，见[中部R1](./dom/text-heading2-enter-middle-r1.json)、[R2](./dom/text-heading2-enter-middle-r2.json)。验收准确拆成同父两个H2、保持原区/身份、后段文字首落点及新后段历史，不丢字/重复/降级后段text；父子/样式/必要变化见JSON，页标题保持空。格式继承、折叠/编号/目录、独立持久化及生产验收未覆盖。

## [✅] REQ S02 B06 016 H2 尾部 Enter

两轮Cmd+Left/三次Right后Enter前n1241偏移3。新增同父后置空text R1 n1330/区n1333/空叶文本n1336，R2 n1344/区n1347/空叶文本n1350，光标新空叶偏移1；原H2/区/`123`保持。撤销删新增text、回n1241偏移3，重做新text n1337/区n1340/空叶文本n1343、n1351/区n1354/空叶文本n1357，再撤销。mutation为48/40条、事件均25条，R1跨用户切换包含额外属性变化，不抹去或强制次数一致；可信编辑链完整，页面异常/overflow=0。见[尾部R1](./dom/text-heading2-enter-tail-r1.json)、[R2](./dom/text-heading2-enter-tail-r2.json)。验收尾部续普通空text、原身份保持、历史重做新正文和有效新空叶，不能续空H2；空页标题不变，独立持久化/格式/复杂结构及生产验收仍未覆盖。上述三组未触发composition，外围目录/完整浮层和console方法缺口保持。

H2 接续进行中：同一 session 新建 segment=heading2-1791945308486，已通过真实两井号/空格与数字键建立唯一heading2 n17/区n1231/行n1232/文字叶n1240=`123`，建样摘要59条mutation/27条事件。首部Enter两轮摘要各20条/9条；中部Enter两轮各46条/22条，页面异常/overflow均0。这些窗口已在页面观察器结束，但尚未导出必要JSON，不纳入需求通过或矩阵。字号/身份/精确选区与变化结果以尚待导出的源数据为准，不能只靠摘要推定与H1等价。

准备执行`B06-heading2-enter-tail-R1`期间，工具报告用户切换Chrome；重新AX读取确认当前是另一飞书页面，已停止后续输入，不切回目标、不对新页面操作。旧只读AppleScript health查询返回`missing value`，未取得目标监控/正文新状态；尾部窗口是否仍active、已执行到哪个按键以及当前正文未知，不假定已完成或恢复。H2新窗口尚未落盘，已有151份JSON/237个窗口/81条矩阵统计保持；接续时先切回指定文档、读active/connected/overflow/正文与选区，结束并导出活动窗口，再决定历史恢复或干净复测，不能清空观察器丢掉本次数据。

三种位置规则分别适用，不合并为“Enter总是延续标题”或“总是转正文”。原节点复用、新段重建及精确光标必须和用户文字一起验收；云端保存提示不能独自证明服务器持久化。

当前已确认非空H1首中尾普通分段/软换行及唯一空H1的Enter/Shift+Enter；H2–H9、组合输入/复杂格式、折叠/编号/目录、远程改动和生产工作流仍未验证。监听缺口、未知输入法品牌与系统候选窗不因本组无composition而视为已补齐。

本组真实Backspace把最后唯一空H1解为text，保留外层n17/业务ID=2，内部区重建n1220/行n1221/空叶文本n1223，光标偏移1、空页标题保持，见[最终恢复](./dom/text-heading1-group-empty-restore.json)。14条mutation/7条事件、页面异常/overflow=0；仅为SETUP恢复，未独立验证该转换历史。监控active=null、connected=true，保存提示已观察；后续输入需重新核对URL、焦点和监控状态。
