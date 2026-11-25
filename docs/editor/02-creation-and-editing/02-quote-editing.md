# S02 引用分段与软换行补测

本文保存 2026-10-14 新会话的引用编辑需求，创建基线及阶段边界仍见 [阶段需求](./02-creation-and-editing.md)。总项 B04/B06/B07 尚未全部收口；项目生产验收未执行。

### [✅] REQ S02 B04 002 引用段尾 Enter 续段与历史

来源：2026-10-14 指定 Chrome 页面真实实测（macOS、Asia/Shanghai）。sir 已确认本轮可保持前台。现场旧观察器不存在，唯一空正文/业务 ID=2，未刷新页面；新 session=S02-1791940824848，只在本会话比较节点。安装正文/既有 popup 与根父节点观察器、真实输入及组合事件、可信按键与双 requestAnimationFrame 后末态读取；未监听 console 方法或所有正文外浮层生成，相关缺口仍保留。

前置样例真实 `/` 后点击“引用”，逐字数字键 `123`，见 [建样 R1](./dom/text-quote-tail-fixture-r1.json)、[建样 R2](./dom/text-quote-tail-fixture-r2.json)。首轮恢复真实删三字再 Backspace 解出引用，见 [恢复 R1](./dom/text-quote-tail-restore-r1.json)；仅为 SETUP，不新增删除历史通过项。首轮/第二轮 Cmd+Right 的末端分别落在哨兵 n11/偏移 1 和文字 n120/偏移 3，原记录 [R1](./dom/text-quote-tail-enter-r1.json)、[R2](./dom/text-quote-tail-enter-r2.json)保留，不用两种 DOM 端点宣称严格相同选区重复。

固定选区复测：同一引用 n109/原文本 n17/区 n8/文字 n120=`123`，每轮真实点击文字 → Cmd+Left → 三次 Right。可信 Enter 前均为 n120 偏移 3、折叠选区；该组复用了历史撤销恢复的相同样例，不再次创建容器。R1/R2 Enter 分别新增同父 n109 的后置空文本 n166/区 n169/空叶 n172 和 n180/区 n183/空叶 n186，光标偏移 1；容器、原文本/区/文字和空页标题保持。证据 [固定 R1](./dom/text-quote-tail-fixed-r1.json)、[固定 R2](./dom/text-quote-tail-fixed-r2.json)，各窗口动作以 `steps` 顺序及 `globalKeys` 时间/前选区对应，不把状态捕获时刻当性能数据。

真实 Cmd+Z 移除新增段、回 n120 偏移 3；Cmd+Shift+Z 分别使用新文本 n173/区 n176/空叶 n179 和 n187/区 n190/空叶 n193 重建后置空段，光标偏移 1；再次撤销回同一单段样例。两轮均 32 条必要 mutation、事件为 25/24、页面异常与 overflow=0。`editorAfter`/逐键状态是正文焦点末态，`after` 是结束窗口时控制台选区，二者分开使用。

复刻与验收：固定文字末端 Enter 必须在引用内部新增第二个独立 text 子块，保持 `123` 和原身份，不能同区软换行或直接退出引用；撤销只移除本次新增段，重做新对象、有效新空叶光标，再撤销仍可在原文字尾继续。默认子段样式来自 JSON，视口不作为跨平台容差；业务结构允许 quote_container 包含本例两个 text，其他子类型未由本例证明。实际 AX 已观察“已经保存到云端”，独立读取/重载持久化、格式继承、首中部、IME、精确历史分组阈值与完整生产工作流未验证。

一次原生 selectText 没有取得正文焦点，后续按键停留控制台；正文 mutation=0、未产生有效编辑按键，窗口 [选区工具失败](./dom/text-quote-tail-focus-failure.json)独立保留，不计复测通过。此后每次正文键前都重新检查指定 URL 和正文 AX 焦点，控制台命令前检查提示焦点。

### 已观察：引用后置空段退出与连续 Enter 合并历史

同一引用 `123` 尾，连续两次真实 Enter。第一次在引用内新建空段，第二次将同一空 text 移至正文父 n19、位于引用之后，内部区/空叶保持，原引用及 `123` 不变。R1 为 n137/区 n140/空叶 n143，R2 为 n152/区 n155/空叶 n158，见 [连续 Enter R1](./dom/text-quote-empty-enter-r1.json)、[R2](./dom/text-quote-empty-enter-r2.json)。各 38 条 mutation、24 条事件、页面异常/overflow=0。

两轮一次 Cmd+Z 均同时撤销续段和退出、直接回唯一引用 `123`，不是恢复引用内空段；重做新建引用之后的正文空块 n145/空叶 n151 与 n159/空叶 n165，再撤销移除它。两轮首个 Enter 前光标分别在哨兵尾与文字尾；当前保留观察，不以严格相同选区或退出独立历史勾选通过。需固定前置两段及历史间隔另测退出的独立撤销；连续动作结果也不能推定所有输入间隔的分组规则。

### [✅] REQ S02 B04 003 引用后置空段 Enter 退出与独立历史

同一新会话、指定 Chrome/macOS 环境，先在 `123` 的 n120 偏移 3 真实 Enter 建立两段引用，单独结束 SETUP 后再执行退出，见 [前置](./dom/text-quote-exit-fixture-r1.json)。两轮均为引用 n109 内原文本 n17/区 n8/`123` 和后置空文本 n194/区 n197/空叶 n200；真实点击空段后可信 Enter 前均折叠在 n200 偏移 1。R2 通过前轮撤销恢复同一前置结构，不重新创建容器或空段。

Enter 将原 n194 从引用父 n109 移到正文父 n19，顺序为引用之后的普通空 text；n194、业务 ID、编辑区 n197 和空叶 n200 保留，光标仍 n200 偏移 1。引用 n109 保留唯一非空子块 n17、`123` 不变，页标题仍空；不会另增第三个正文块或把空段删除。Cmd+Z 将同一 n194 移回引用末尾，Cmd+Shift+Z 再移出，再次撤销又移回，四步选区均为同一空叶/偏移。各 46 条 mutation、22 条事件、页面异常与 overflow=0。必要增删/位置和 class 前后见 [独立 R1](./dom/text-quote-empty-exit-fixed-r1.json)、[独立 R2](./dom/text-quote-empty-exit-fixed-r2.json)。

复刻断言：在本例后置空 text 中 Enter 应保持内部可编辑结构、移动现有块到引用之后并清除引用子块角色；独立历史回放必须移动同一个块/区/空叶，原 `123` 不变，继续输入落在有效当前位置。此合同与紧接续段的连续 Enter 合并历史分别按已测操作时序适用；不推定精确分组阈值。正文末态与控制台末态分开记录，实际保存提示已观察，服务器独立持久化未验证。

空引用唯一子段、首中部、多层嵌套、其他子类型、格式继承、退出后的重做失效、刷新历史和组合输入仍待测。项目只得到可观察块/身份/父子与选区合同，不由 DOM 推断内部 Schema 或事务。布局样本与前置/末态在 JSON；外围占位、完整菜单 mutation、console 方法和生产验收未覆盖。

### [✅] REQ S02 B06 002 引用段尾 Shift+Enter 与软换行历史

来源/环境沿用本轮 session=S02-1791940824848。真实 Backspace 删除前置后置空段后，恢复唯一引用 n109/文本 n17/区 n8/`123`，见 [SETUP](./dom/text-quote-softbreak-fixture.json)。两轮均点击原文字、Cmd+Left/三次 Right，可信 Shift+Enter 前选区为 n120 偏移 3。证据 [R1](./dom/text-quote-softbreak-tail-r1.json)、[R2](./dom/text-quote-softbreak-tail-r2.json)，各 42 条 mutation、18 条事件、页面异常/overflow=0；未触发 composition。

Shift+Enter 保持引用和唯一 text 子块、同一编辑区 n8，区内从一条 ace-line 变成两条；原行 n9/文字 n119=`123` 保留，原哨兵移除/替换，新空行 R1 n201/空叶文本 n203，R2 n215/空叶文本 n217，光标偏移 1。不能把这次新增 ace-line 当成新增 text 子块或引用退出。Cmd+Z 移除第二行、原区/文字保持、光标回 n120 偏移 3；Cmd+Shift+Z 新建第二行 R1 n208/空叶文本 n210，R2 n222/空叶文本 n224，光标偏移 1；再次撤销恢复一行。原行尾哨兵在这些步骤均有新对象，不能要求所有空叶复用。

复刻与验收：引用 text 尾的软换行必须只增同区逻辑行，引用父子关系、原 `123` 与页标题保持；历史按已测区内行树恢复，重做新行/空叶、文字尾或新空行选区准确，后续可继续输入。默认样式/视口与按键前后选区见 JSON；未冻结像素或历史时序阈值。保存提示已观察，独立持久化/复制往返/计数、其他光标位置、格式继承、空引用和 IME 未验证。外围菜单/目录 mutation、console 方法及项目生产验收仍有缺口。

### [✅] REQ S02 B06 003 引用首部与中部 Enter 拆分

来源/环境同本轮新会话，前置引用 n109 内唯一 n17/区 n8/文字 n120=`123`、页标题空，每次历史撤销恢复该样例；每键前核对指定 URL 与正文 AX 焦点。首部两轮点击文字并 Cmd+Left，可信 Enter 前均为 n120 偏移 0。Enter 在引用内、原 n17 之前新增空文本 R1 n229/区 n232、R2 n243/区 n246；原 `123` 及其节点保持，光标仍原 n120 偏移 0，没有移入新增空段。撤销移除前置空段，重做以新文本 n236/区 n239、n250/区 n253 恢复，再撤销移除；四步光标仍原文字首。见 [首部 R1](./dom/text-quote-enter-head-r1.json)、[R2](./dom/text-quote-enter-head-r2.json)，mutation/事件为 14/8、16/9，差异未影响本例结构结果。

中部两轮 Cmd+Left/一次 Right 后可信 Enter 前均为 n120 偏移 1。原 n17/区 n8/文字对象保留、内容改为 `1`，引用内新增同父后置 text R1 n257/区 n260/文字文本 n263=`23`、R2 n275/区 n278/文字文本 n281=`23`，选区在后段文字偏移 0。Cmd+Z 删除后段、原文字恢复 `123`、选区 n120 偏移 1；重做新后段 n266/区 n269/文字文本 n272 和 n284/区 n287/文字文本 n290，选区各偏移 0；再次撤销回相同样例。见 [中部 R1](./dom/text-quote-enter-middle-r1.json)、[R2](./dom/text-quote-enter-middle-r2.json)，各 44 条 mutation、22 条事件。

复刻断言：首部新增前置空子段并保持原文字首光标；中部按 `1|23` 精确拆成同引用下两 text、光标后段文字首。均保持引用/原编辑区/页标题，不丢字、不重复，不移至引用外；新增段重做使用新 DOM，对原文字的修改/恢复按必要 JSON 回放。按键前后、选区与变化顺序分别在 globalKeys/steps/changes，末态控制台选区不能替代编辑中选区。页面异常/overflow 均为 0，console 引擎有先前工具命令错误，不宣称控制台零错误；保存提示已观察，独立持久化、格式继承、其他位置、嵌套/标题/列表子类型与 IME 均未验证。布局参数仅为本环境样本，完整项目工作流与生产验收待执行。

### [✅] REQ S02 B06 004 引用首部和中部 Shift+Enter

同一引用 n109/唯一 text n17/区 n8/文字 n120=`123`，每轮从前次撤销恢复相同前置。首部真实 Cmd+Left 后 Shift+Enter，前选区 n120 偏移 0；只在原区内、原行 n9 之前新增空 ace-line R1 n293、R2 n299，原 `123` 行/文字不变，光标仍 n120 偏移 0。撤销移除前置空行，重做新空行 n296/n302，再撤销；各 22 条 mutation、9 条事件。见 [首部 R1](./dom/text-quote-softbreak-head-r1.json)、[R2](./dom/text-quote-softbreak-head-r2.json)。

中部 Cmd+Left/一次 Right 后 Shift+Enter，前选区 n120 偏移 1；原行 n9/文字保留 `1`，同区新增第二 ace-line n305/n323，后行文字文本 n307/n325=`23`，光标偏移 0。撤销合回原行 `123`、光标 n120 偏移 1；重做新后行 n314/n332、新文字文本 n316/n334 偏移 0，再撤销恢复。各 46 条 mutation、15 条事件，见 [中部 R1](./dom/text-quote-softbreak-middle-r1.json)、[R2](./dom/text-quote-softbreak-middle-r2.json)。

验收要求：两种位置均保持引用、唯一文本块、原区与空页标题；首部空行插前、原文字首选区保持，中部 `1|23` 拆成同区两行、选区后行首；历史按各位置精确回放，新行重做新对象。原行哨兵重建细节见 JSON，不假定全部叶对象保持。真实 Shift/可信按键、前后选区及必要 mutation 均留证，页面异常/overflow=0；未触发 composition，未覆盖格式继承、复制/计数与独立持久化、其他子类型/嵌套和生产验收，完整外围菜单与 console 方法仍未监听。保存提示已观察，布局值仅为本环境样本，不承诺跨平台容差。


## [✅] REQ S02 B04 002 引用内部创建H1/H9

英文大于号加空格创建空引用，容器n3761/内部原text n3717；引用外没有额外空段。
内部空光标真实Cmd+Option+1/9，两轮分别创建heading1/heading9，内部原外层n3717保留、编辑区重建。
引用容器及父子关系保持，没有把目标标题移到引用外；撤销内部回text，重做对应标题，再撤销回text。
H1每轮58条mutation/24条事件，H9每轮58条mutation/24或26条事件；额外焦点事件按原记录保留。
见[H1 R1](./dom/text-b04-quote-heading1-r1.json)、[R2](./dom/text-b04-quote-heading1-r2.json)、[H9 R1](./dom/text-b04-quote-heading9-r1.json)、[R2](./dom/text-b04-quote-heading9-r2.json)。
H2–H8共同的容器归属/外层复用/内部区变化仅为推断（sir已授权两端抽样），不计中间级别实测，不推断相同字号。

## [✅] REQ S02 B04 003 引用内部创建有序/无序列表

相同空引用内部text真实Cmd+Shift+7/8，两轮生成ordered/bullet，原内部外层n3717及容器n3761保持。
列表标记与编辑文字区分离，仍为引用容器子块；撤销回内部text，重做列表，再撤销回text。
ordered每轮53条mutation/24或28条事件，bullet每轮52条mutation/24条事件；身份/选区与叶树见JSON。
见[有序R1](./dom/text-b04-quote-ordered-r1.json)、[R2](./dom/text-b04-quote-ordered-r2.json)、[无序R1](./dom/text-b04-quote-bullet-r1.json)、[R2](./dom/text-b04-quote-bullet-r2.json)。
空引用前置通过真实正文清理及输入规则建立，见[固定引用](./dom/text-setup-quote-nested-empty-fixture.json)。
本项证明容器中这些目标类型可创建及对应历史，嵌套后续编号、标题折叠/目录、复杂转换仍属于后续阶段或独立子项。
B04引用外前后插入已见以下补测；独立重载持久化继续归B07，不由保存提示替代。

## [✅] REQ S02 B04 004 引用外前置空段与输入

唯一引用内部text=1、光标文字首部，真实Enter新增引用内部前置空段，Up移入前置空段，Backspace将该空段移到引用之前。
随后真实2得到外部text=2、引用内部text=1，两个顶层块同父且前后次序固定；引用内部原text n3717及1保持。
R1原容器n3761改建为n4087，前置原空段n4080移出；R2对应外段n4142/新容器n4149。引用容器不是始终复用。
撤销2回外部空段，撤销Backspace回引用内部前置空段，撤销Enter回唯一引用=1；重做三步及再撤销均恢复对应结构与有效选区。
两轮前置、结果与角色一致，见[有效R1旧探针名](./dom/text-b04-quote-before-backspace-probe.json)、[R2](./dom/text-b04-quote-before-backspace-r2.json)。
R1标签含probe是探索时名称，后续已补实际外段输入、完整历史及同条件复测；按可复现证据判定，不由名称决定是否通过。

## [✅] REQ S02 B04 005 引用外后置空段与输入

唯一引用text=1尾部真实Enter形成后置内部空text；稳定检查点之后第二次Enter把该空text移到引用之后。
真实2只写入外段，原引用=1及内部text保持，顶层次序为引用、外text=2；首轮外段n4204/引用n4192。
三步分别撤销移除2、把空段移回引用、移除续段，重做及再撤销恢复对应结构；移动步骤保持空段身份，新增段重做用新对象。
每个Enter后的检查点保留，避免把既有连续Enter合并历史混入本例；不推定精确时间阈值。
见[后插入R1](./dom/text-b04-quote-after-insertion-r1.json)、[R2](./dom/text-b04-quote-after-insertion-r2.json)。

## 前置探索与限制

从首个引用文字首部Up只到页标题n2，没有插入外段；没有向页标题输入，见[上移探索](./dom/text-b04-quote-before-insertion-r1.json)。
引用内前置空段再Enter继续新增内部空段，不退出引用，见[前空段Enter](./dom/text-b04-quote-before-empty-exit-r1.json)。
子段菜单“在下方添加”只新增同引用内部text，见[菜单实际归属](./dom/text-b04-quote-menu-add-below-r1.json)；此单轮另归B05待复测，不算外插入第二轮。
实际快捷键指南未列上方/下方插入Enter命令；仅为菜单库存观察，不据此断言不存在其他键，见[指南](./dom/text-setup-external-insertion-keyboard-guide.json)。
B04约定的空/单段/多段、内标题/列表与外前后插入均已两轮覆盖，标[✅]；复杂嵌套和转换全矩阵、独立持久化及生产验收仍按对应阶段。
