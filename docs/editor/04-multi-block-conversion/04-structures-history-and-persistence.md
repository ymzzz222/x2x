# S04 复杂范围、历史与保存读取

本文件接续阶段正文，来源均为指定Chrome飞书测试页面的真实操作。
H1/H9为实际标题抽样；H2–H8共同行为仅按sir授权推断。
只记录可观察合同，不推断编辑器内部事务、存储或同步协议。

## REQ-S04-D03-005 混合列表嵌套与跨父转换

前置：顶层ordered111、其一级bullet子项222、顶层ordered333；父级编号为1、2。
[建样](./dom/D00-mixed-nested-list-fixture.json)通过真实Tab及无序快捷键建立，缩进和类型操作保留撤销/重做。
转H1：[R1](./dom/D03-mixed-nested-heading1-R1.json)、[R2](./dom/D03-mixed-nested-heading1-R2.json)。
三段逐块转H1，222仍嵌套于111，111/333保留1/2编号，原bullet子项不凭空添加编号。
两轮H1键盘范围均从111:0到末段U+200B哨兵:1；引用拖选则为111:0→333:3，分别按真实端点验收。
转引用：[R1](./dom/D03-mixed-nested-quote-R1.json)、[R2](./dom/D03-mixed-nested-quote-R2.json)。
共同引用包装两顶层项及其子项，原ordered/bullet类型、嵌套和1/2编号保留。
两个目标均经过撤销、重做、再次撤销；正文、原外层对象与块ID在同会话中保持。
本条验证跨父连续范围，不替代S05的完整嵌套深度及结构创建矩阵。

## REQ-S04-D03-006 列表包含引用的反向范围

[建样](./dom/D00-list-containing-quote-fixture.json)中三击选中222并通过真实气泡引用入口包装。
引用位于ordered111下，内部保留bullet222；初次键盘/短拖选未出现气泡的尝试也保留。
反向范围333:2→111:1，真实键盘扩选；转H9：[R1](./dom/D03-list-with-quote-heading9-reverse-R1.json)、[R2](./dom/D03-list-with-quote-heading9-reverse-R2.json)。
三段均转H9，222仍在共同引用及111标题下，111/333保留1/2编号。
首尾未选字符未拆为新块；撤销/重做/再次撤销恢复同一层级与容器。
本条同时提供D07特殊父级中反向键盘扩选的两次真实端点，不把AX索引当DOM选区。
折叠父级的键盘扩选与指针拖选分别复用[D05-004](./04-selection-boundaries.md#req-s04-d05-004-折叠父标题到下一同级标题的零偏移)各自相同手势双轮。

## REQ-S04-D06-003 连续与分隔转换的历史

连续三个真实标题快捷键H1→H9→H1：[R1](./dom/D06-consecutive-heading-keys-R1.json)、[R2](./dom/D06-consecutive-heading-keys-R2.json)。
来源为两个正文块，其中一个179字符自动折行；两轮均保持两段及页标题777。
三键之间不插读取或重建选区；最终均为两H1，均一次撤销回两个原text，一次重做回两H1。
事件时间与必要mutation用于确认连续命令；180ms延后快照可能已是第三键的最终结果，不能把它当第二键即时状态。
旧676ms/805ms附近的历史差异保留；这两个点不足以推断固定合并阈值。
混合嵌套加引用的有序→无序→有序：[分隔R1](./dom/D06-nested-quote-list-roundtrip-spaced-R1.json)、[分隔R2](./dom/D06-nested-quote-list-roundtrip-spaced-R2.json)。
每次目标后读取状态并重建相同范围，三目标均分别进入历史；三次撤销、三次重做、再次三次撤销一致。
有序目标两顶层项为1、2，嵌套子项独立为1；无序时移除这些数字标记，引用及嵌套始终保留。
[较近列表窗口](./dom/D06-nested-quote-list-roundtrip-R1.json)前两次目标合并，两次撤销已回原类型，第三次撤销额外移除了此前引用。
该结果与[恢复](./dom/D00-restore-quote-after-history-grouping.json)均保留，不把多撤销的前置变化算转换丢容器。
合同要求明确记录当前历史单位及真实时间；实现验收不能假设“一次快捷键必有一个撤销单位”。
飞书内部合并阈值未知，不将未知阈值虚构为需求数值。

## REQ-S04-D07-002 第二视觉行导航

[重建](./dom/D00-second-visual-line-fixture.json)为179字符长正文及外部333，只有一条逻辑ace-line，自动排成两视觉行。
通过只读临时Range取得字符136的实际矩形，真实鼠标点击该处，不设置Selection。
[R1](./dom/D07-second-visual-line-navigation-R1.json)、[R2](./dom/D07-second-visual-line-navigation-R2.json)均得到折叠光标136。
真实Cmd+Left到108，再Cmd+Shift+Right得到108→179，第二视觉行的起止范围。
结合既有第一行0→108、三击0→179及整块隐藏输入全选，视觉行、逻辑段和整块三种范围已分开。
两轮正文、块身份保持，记录包含焦点和选择class属性mutation，错误及overflow为0；导航无可撤销内容变更，不伪造独立撤销层。
旧“点击第二行未落在第二行”的窗口保留为限制，最终导航结论仅来自本条两轮。

## REQ-S04-D08-001 多块保存代表范围

状态：三目标各双轮已验证，六个转换窗口对应十二次真实刷新读取。
固定三正文111/222/333及页标题777，目标H9、有序、共同引用各两轮。
每轮真实转换、撤销、重做，明确云端保存后Chrome刷新，再夸克指定页面刷新只读核对。
刷新后旧观察器必须不存在；重新安装的只读观察器只记录加载后的DOM，不声称采集加载期间mutation。
跨加载不比较n引用或页面局部数字ID；使用正文、data-record-id、类型、父级、标记和计算样式对应。
夸克不执行功能转换，读取完成即恢复“剧本 · 跳跃视界”。
每个转换前均核对顶层text111/222/333、实际全文范围、默认start对齐和页标题777。
两轮同入口：H9为Cmd+Option+9，有序为Cmd+Shift+7，引用为真实拖选后的气泡类型菜单。
转换前后保留正文外层对象和业务ID；各轮单独验证撤销恢复text、重做恢复目标，然后核对云端保存。
各轮刷新读取时间为北京时间2026-10-16，证据如下：

| 目标/轮次 | 转换及保存 | Chrome刷新 | 夸克刷新 |
| --- | --- | --- | --- |
| H9/R1 | [窗口](./dom/D08-persist-heading9-R1.json) | [12:45:08](./dom/D08-persist-heading9-R1-Chrome-reload.json) | [12:45:51](./dom/D08-persist-heading9-R1-Quark-reload.json) |
| H9/R2 | [窗口](./dom/D08-persist-heading9-R2.json) | [12:47:14](./dom/D08-persist-heading9-R2-Chrome-reload.json) | [12:47:40](./dom/D08-persist-heading9-R2-Quark-reload.json) |
| 有序/R1 | [窗口](./dom/D08-persist-ordered-R1.json) | [12:48:43](./dom/D08-persist-ordered-R1-Chrome-reload.json) | [12:49:02](./dom/D08-persist-ordered-R1-Quark-reload.json) |
| 有序/R2 | [窗口](./dom/D08-persist-ordered-R2.json) | [12:50:05](./dom/D08-persist-ordered-R2-Chrome-reload.json) | [12:50:28](./dom/D08-persist-ordered-R2-Quark-reload.json) |
| 引用/R1 | [窗口](./dom/D08-persist-quote-R1.json) | [12:52:09](./dom/D08-persist-quote-R1-Chrome-reload.json) | [12:52:28](./dom/D08-persist-quote-R1-Quark-reload.json) |
| 引用/R2 | [有效窗口](./dom/D08-persist-quote-valid-R2.json) | [12:54:24](./dom/D08-persist-quote-R2-Chrome-reload.json) | [12:54:41](./dom/D08-persist-quote-R2-Quark-reload.json) |

十二次读取的data-record-id逐块对应保存目标，正文均为111/222/333，页标题777保持。
H9均为16px/500/22.4px，列表与引用内text均为16px/400/26px，start对齐；与各自转换保存后样式相同。
有序三项标记1./2./3.，引用三段具有同一个quote_container祖先；没有合并文字或丢失边界。
[引用R2失败准备](./dom/D08-persist-quote-R2-empty-root-preparation-failed.json)只删除了前一引用，空正文占位未取得输入落点，粘贴没有建立块。
[点击占位后重建](./dom/D00-quote-persistence-R2-rebuild-empty-root.json)通过真实点击、粘贴及输入撤销/重做恢复三正文；正式转换另记valid-R2。
失败准备不计转换通过，也不解释为目标引用命令丢数据。
H1与无序的多块类型、编号和历史已分别双轮；本条用H9、有序、引用代表级别、标记、共同包装三种保存结构，不重复所有矩阵单元。

## 最终清理及交付检查

[清理窗口](./dom/D00-S04-final-cleanup.json)真实删除正文及页标题，两个删除分别验证撤销/重做后确认云端保存。
停止观察器后真实刷新；[12:56:13最终只读](./dom/D00-S04-final-reload-read.json)确认ready=true、observerPresent=false、正文块为空，仅空页标题哨兵。
没有把空壳误认成转换保存成功；六轮目标持久化已在清理前分别取得独立读取。
285份证据含建样、失败、恢复与只读，不等于285个功能通过；完整保留窗口见[证据索引](./04-evidence-index.md)。
逐文件精确还原与校验值、0溢出、实际范围、内容、身份、容器、标记及历史断言已完成静态核对。
早期H1/H9正文来源窗口只有Selection anchor/focus，未伪补Range数组；后续边界与连续来源窗口另有实际Range及完整块HTML。
Chrome引擎仍有后台网络、代理及加载警告；窗口errors/console数组为0不代表整个浏览器控制台无错误。
只交付研究需求与证据，未运行项目构建、实现测试或项目UI验收，未修改项目代码。
本条不会将云端提示、单一新标签读取或旧S03持久化证据代替S04刷新验证。
