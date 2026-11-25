# S02 创建入口与前缀解析

状态：B05约定的斜杠、加号、块菜单、快捷键、输入规则与粘贴入口已完成；历史受阻的引用快捷键已定位扩展冲突并补两轮，临时设置已恢复。
总进度见[阶段需求](./02-creation-and-editing.md)，断言见[矩阵](./02-verification-matrix.md)。

## 环境与入口合同

- 2026-10-14，指定飞书Chrome，原生text格式粘贴，不派发合成输入事件。
- session=S02-1791940824848，segment=creation-entries-1791952185213。
- 初始唯一空text n2250/区n2253/空叶文本n2256，页标题空。
- 记录段12窗口：五分支各两轮和两次引用历史遗留空块SETUP，不按窗口数计算通过率。
- 粘贴后AX与只读DOM settled检查点同时核对，Cmd+V双帧旧态不作为最终结果。
- checkpoints仅保存被动读取状态；正文修改均由原生粘贴与真实撤销/重做/删除完成。
- 本文只研究创建入口及对应历史，不进入S03的任意块转换全矩阵。

## [✅] REQ S02 B05 002 H1/H9前缀粘贴创建

唯一空正文原生text粘贴 `# 1`，两轮生成唯一heading1=1，前缀被消费。
新外层块分别n2261/n2305，原空text被替换；不能沿用键入井号输入规则的外层复用合同。
同样粘贴 `######### 1`，两轮实际生成heading9=1、新外层n2349/n2393，不限制为Markdown六级标题。
各34条mutation/24条事件，页面异常为空，页标题保持空。
真实Cmd+Z回新唯一空text，重做回新对应标题=1，再撤销恢复新唯一空text；完整身份/选区见逐键状态。

证据：[H1 R1](./dom/text-paste-heading1-prefix-r1.json)、[R2](./dom/text-paste-heading1-prefix-r2.json)。
证据：[H9 R1](./dom/text-paste-heading9-prefix-r1.json)、[R2](./dom/text-paste-heading9-prefix-r2.json)。
H2–H8对应井号前缀的共同创建规则仅标推断（sir已授权抽样），不计中间级别实测，不推断相同字号。
这是当前纯文本粘贴的实际解析能力，不能把text格式等同于“必然原样插入所有Markdown前缀”。

## [✅] REQ S02 B05 003 无序/有序前缀粘贴创建

两轮空正文粘贴 `* 1` 得唯一bullet=1，外层新块n2437/n2477，前缀被消费、标记与用户文字分离。
两轮粘贴 `1. 1` 得唯一ordered=1，外层新块n2517/n2557；编号标记和用户1区分，结构见JSON。
每轮29条mutation/24条事件，页面异常为空；Cmd+Z/重做/再撤销在空text与对应列表=1间恢复。
证据：[无序R1](./dom/text-paste-bullet-prefix-r1.json)、[R2](./dom/text-paste-bullet-prefix-r2.json)。
证据：[有序R1](./dom/text-paste-ordered-prefix-r1.json)、[R2](./dom/text-paste-ordered-prefix-r2.json)。
本项只覆盖1起点与当前前缀，不由此推断多位序号、相邻合并、嵌套或粘贴到非空列表中的行为。

## [✅] REQ S02 B05 004 引用前缀粘贴与历史遗留空块

两轮唯一空正文粘贴 `> 1` 得quote_container、内部text=1，以及引用外后置空text。
R1容器n2597/内部n2604/后置n2616；R2容器n2656/内部n2663/后置n2675。
光标实际在引用外后置空段的空叶文本偏移1，不能按标题/列表粘贴把光标断言为内容1尾部。
Cmd+Z移除引用/文字，生成前置新空text，但后置空text仍保持，两个空正文块同父。
重做恢复引用=1及原后置空段，再撤销仍回两个空text；各31条mutation/18条事件，页面异常为空。
证据：[引用粘贴R1](./dom/text-paste-quote-prefix-r1.json)、[R2](./dom/text-paste-quote-prefix-r2.json)。

此历史链没有恢复最初唯一空块的结构；作为观察到的飞书差异保留，不冒充普通入口可逆性一致。
研究结论已可复测；项目是否复制额外空块遗留属于后续差异决策，不通过改写证据消除差异。
每轮额外空块单独用原前置空正文末端真实Delete清理，各3条mutation/4条事件，不增加删除通过项。
恢复见[R1](./dom/text-setup-paste-quote-prefix-r1-empty-recovery.json)、[R2](./dom/text-setup-paste-quote-prefix-r2-empty-recovery.json)。

## [✅] REQ S02 B05 005 加号菜单可达范围与取消

唯一空正文原生聚焦后加号出现；打开基础区为两行十二图标，直接标题仅H1/H2/H3，有序/无序和引用图标可达。
没有H9直接项，不虚构加号H9创建；高等级标题其他入口已测，H2/H3共同创建规则按sir授权标题抽样推断。
先前发现窗口只作SETUP，见[加号探索](./dom/text-setup-plus-menu-discovery.json)。
两轮从空正文打开加号后Escape关闭，再真实1得到普通text=1，没有新增斜杠或留下其他触发字符；撤销回空。
见[取消R1](./dom/text-plus-cancel-r1.json)、[R2](./dom/text-plus-cancel-r2.json)，真实菜单点击及逐键状态见clicks/steps。
菜单基础图标没有AX文字标签，使用完整AX图像节点、已见图标顺序与真实点击核对，不把增量AX缺项误判为入口不存在。

## [✅] REQ S02 B05 006 加号H1/有序/无序创建与历史

唯一空正文通过真实加号基础图标分别创建H1、ordered、bullet，两轮均保留原外层n2708，替换内部编辑区。
创建的空叶文字偏移1；Cmd+Z回text，重做目标空块，再撤销回唯一空text，具体新区身份均见JSON。
H1首轮还真实输入1，单独撤销文字和创建，再重做/恢复；第二轮独立测试空块创建历史，不混淆两轮操作链长度。
H1各97/65条mutation、33/23条事件；ordered各60/23，bullet各59/23；页面异常为空。
见[H1 R1](./dom/text-plus-heading1-r1.json)、[R2](./dom/text-plus-heading1-r2.json)。
见[有序R1](./dom/text-plus-ordered-r1.json)、[R2](./dom/text-plus-ordered-r2.json)、[无序R1](./dom/text-plus-bullet-r1.json)、[R2](./dom/text-plus-bullet-r2.json)。
与前缀粘贴的整个外层替换分开；共同块类型不意味着所有创建入口采用相同身份合同。

## [✅] REQ S02 B05 007 加号引用创建与历史

两轮加号引用只形成容器和内部原text，没有引用外后置空text；光标在内部空叶文字偏移1。
R1容器n2959/内部n2708；R2容器n2990/内部n2969，各50条mutation/23条事件，页面异常为空。
撤销回新唯一空text，重做新引用容器及内部段，再撤销回新唯一空text；与粘贴引用的遗留后空段不同。
见[加号引用R1](./dom/text-plus-quote-r1.json)、[R2](./dom/text-plus-quote-r2.json)，最新最终空正文n3000/区n3003/空叶文本n3006偏移1。

## [✅] REQ S02 B05 008 H1/H9与列表快捷键创建

实际快捷键面板仅列标题H1–H3，但两轮Cmd+Option+1和Cmd+Option+9均分别生成H1/H9。
可信keydown的key受当前Mac布局显示为¡/ª，code分别Digit1/Digit9；Meta/Alt为true，不能只按显示字符识别入口。
每轮58条mutation/24条事件，原外层n3000保持，内部区重建；创建撤销/重做/再撤销回唯一空text。
见[H1 R1](./dom/text-shortcut-heading1-r1.json)、[R2](./dom/text-shortcut-heading1-r2.json)、[H9 R1](./dom/text-shortcut-heading9-r1.json)、[R2](./dom/text-shortcut-heading9-r2.json)。
H2–H8按数字级别的共同规则仅标推断（sir已授权抽样）；面板未列出H9不等于实际不支持。
Cmd+Shift+7两轮生成ordered，可信key=&/code=Digit7；Cmd+Shift+8生成bullet，key=*/code=Digit8。
ordered每轮53/24、bullet每轮52/24，页面异常为空，历史回原外层text及新内部区。
见[有序R1](./dom/text-shortcut-ordered-r1.json)、[R2](./dom/text-shortcut-ordered-r2.json)、[无序R1](./dom/text-shortcut-bullet-r1.json)、[R2](./dom/text-shortcut-bullet-r2.json)。

## [✅] REQ S02 B05 009 普通文本快捷键及无变化边界

两轮空text上Cmd+Option+0保持普通text；可信key=º/code=Digit0，Meta/Alt为true，不触发用户文字输入。
R1临时截图捕捉错误后核对已发送按键，再完成检查点；不重复发送或将错误当编辑器异常。
R2无正文mutation，均未因无类型变化而撤销旧历史；见[文本R1](./dom/text-shortcut-text-r1.json)、[R2](./dom/text-shortcut-text-r2.json)。

## 引用快捷键通道失败历史（后续已解除）

面板实见Cmd+Shift+>；period/greater键名组合尝试没有页面keydown，明确字符>与.被工具拒绝keyNotFound。
不能把无事件判作飞书不支持，也不增加通过分支；原窗口与channelFailure保留，需真实标点实键补证据。
见[尝试R1](./dom/text-shortcut-quote-r1.json)、[R2](./dom/text-shortcut-quote-r2.json)、[未知键R3](./dom/text-shortcut-quote-r3.json)、[R4](./dom/text-shortcut-quote-r4.json)、[未知键R5](./dom/text-shortcut-quote-r5.json)。
必要指南行与面板真实显示按键见[快捷键探索](./dom/text-setup-keyboard-entry-discovery.json)，关闭/正文重定位见[恢复](./dom/text-setup-keyboard-guide-close.json)。

## [✅] REQ S02 B05 010 引用输入规则与英文标点

两轮从唯一空text真实Shift+Period输入`>`，再真实Space，生成quote_container并将原text移动为内部子段。
可信窗口键分别为key=>/code=Period/shift=true和key=空格/code=Space；没有用粘贴代替这一输入规则。
R1容器n3543、R2容器n3575，内部原n3503/区n3506保持；没有粘贴入口的后置引用外空text。
创建撤销恢复普通text的`> `前缀，重做空引用，再撤销仍恢复前缀；随后独立SETUP删除两个前缀字符。
每轮72条mutation/28条事件；必要身份、选区与逐键树见[R1](./dom/text-b05-input-quote-rule-r1.json)、[R2](./dom/text-b05-input-quote-rule-r2.json)。
清理见[R1恢复](./dom/text-setup-quote-rule-r1-recovery.json)、[R2恢复](./dom/text-setup-quote-rule-r2-recovery.json)。

当前中文输入状态的Shift+Period实际输出`》`，切换英文输入状态后才输出`>`，不能只按code推定编辑文字。
数字键盘Shift+Decimal产生key=./code=NumpadDecimal，不等同于主键盘大于号；探针及恢复见[真实标点核对](./dom/text-setup-keyboard-punctuation-probe.json)。
native typeText(`> `)只送达Space的失败窗口见[自行键入尝试](./dom/text-b05-manual-quote-input-rule-r1.json)，不计输入规则结果。

## [✅] REQ S02 B05 011 裸引用标记的纯文本粘贴

两轮唯一空正文原生text粘贴单独`>`，即使没有Space也直接生成空引用及引用外后置空text。
撤销和重做继续保留后置空text，撤销最终为两个普通空text，与`> 1`粘贴相同，不能套用真实输入规则的历史。
每轮31条mutation/18条事件；[R1](./dom/text-b05-quote-rule-pasted-marker-r1.json)、[R2](./dom/text-b05-paste-bare-quote-marker-r2.json)。
R1历史标签含rule仅是旧窗口名，本项明确归类为粘贴；没有将它算作真实键入大于号的证据。
遗留空块单独删除恢复见[R1](./dom/text-setup-bare-quote-marker-r1-recovery.json)、[R2](./dom/text-setup-bare-quote-marker-r2-recovery.json)。

## 引用快捷键与块菜单的继续观察

sir报告实际按Cmd+Shift+Period，窗口只记录真实Shift和Meta修饰键，正文不变，见[人工按键窗口](./dom/text-b05-manual-quote-shortcut-r1.json)。
英文输入状态下工具发送同组合仍没有页面keydown，见[英文组合尝试](./dom/text-b05-shortcut-quote-valid-r1.json)。
Meta+Shift+NumpadDecimal实际到达页面，key=.，但正文保持text；这是另一键位，不据此否认面板的Period快捷键，见[数字键盘尝试](./dom/text-b05-shortcut-quote-numpad-r1.json)。
Meta+greater符号组合没有页面键，见[符号组合尝试](./dom/text-b05-shortcut-quote-symbol-r1.json)；快捷键仍未验证。
真实块手柄菜单已观察直接text/H1/H2/H3/有序/无序/引用及“在下方添加”，H9无直接项，见[菜单发现](./dom/text-setup-selection-menu-discovery.json)。
取消尝试的隐藏输入区及额外按键使前置不受控，原窗口保留但不算取消通过，见[失败取消](./dom/text-b05-block-menu-cancel-r1.json)。

## [✅] REQ S02 B05 012 非空正文尾部斜杠及Escape边界

唯一text=1尾部真实slash只形成普通文字1/，两轮没有创建菜单或“输入关键词”提示。
随后Escape进入整块选区，AX文本为空格；真实2到达docx-selection-hidden-textarea，正文仍1/，没有对应正文insertText。
这不是空正文斜杠菜单的取消后续写；不能把这里的2说成追加或替换成功，也不忽略其可信窗口按键。
通过实际点击文字、Cmd+Right恢复正文光标后撤销slash回1；R2另核对重做/再撤销，菜单不会因历史恢复而打开。
见[R1](./dom/text-b05-nonempty-tail-slash-r1.json)、[R2](./dom/text-b05-nonempty-tail-slash-r2.json)，两轮共同结论限定本尾部位置。

## [✅] REQ S02 B05 013 非空块尾标题前缀的拒绝边界

同一text=1尾部真实Shift+3、Space得到普通文字1#空格，两轮均不变heading1。
分别撤销实际Space/#历史回1，重做回1#空格，再按状态撤销回1；不按固定次数越过样例起点。
见[R1](./dom/text-b05-nonempty-tail-heading-rule-r1.json)、[R2](./dom/text-b05-nonempty-tail-heading-rule-r2.json)。
前缀在尾部而非块首，不消费已有1；不据此推断所有尾部粘贴或列表前缀算法。

## [✅] REQ S02 B05 014 已有文字块首H1/H9输入规则

同一普通text=1，Cmd+Left到块首，真实一或九个#再Space，两轮分别形成heading1=1/heading9=1。
消费前缀、保留原1，原外层n4810保持，内部编辑区重建；与非空块尾不触发明确区分。
每轮撤销创建恢复普通文字#空格1或九#空格1，重做回对应标题=1，再撤销恢复前缀。
独立SETUP用Cmd+Shift+Left选中恢复的前缀并Backspace，只删除前缀，回普通1，不沿用未清理状态。
见[H1 R1](./dom/text-b05-nonempty-head-heading1-rule-r1.json)、[R2](./dom/text-b05-nonempty-head-heading1-rule-r2.json)。
见[H9 R1](./dom/text-b05-nonempty-head-heading9-rule-r1.json)、[R2](./dom/text-b05-nonempty-head-heading9-rule-r2.json)。
H2–H8相同块首匹配及内容保留规则仅为推断（sir已授权两端抽样），不算中间级别实测。
本批开始全选清理折叠样例，真实点空正文创建唯一text，见[建样SETUP](./dom/text-setup-nonempty-entry-fixture.json)。

## [✅] REQ S02 B05 015 块菜单的取消边界与恢复输入

同一首段123与后置既有空text，先实际显示左侧T，再点击已见按钮，确认基础菜单及“在下方添加”可见。
受控R7/R8均确认没有颜色子菜单；真实Escape后基础菜单仍在，不把预期的“关闭”写成已发生。
点击菜单外、编辑区域上方的空白后菜单关闭；点击正文、Cmd+Right，再输入4得到1234。
撤销回123、重做1234、再撤销123，原后置空块保持；两轮语义恢复断言通过。
见[R7](./dom/text-b05-block-menu-controlled-r7.json)、[R8](./dom/text-b05-block-menu-controlled-r8.json)。
nativeMenuControl保留实际前后可见判定；逐键DOM、可信键和鼠标命中见steps/globalKeys/pointerAudit。
真实指针移动和选区可能影响手柄显隐；没有通过修改style或业务DOM强行显示菜单。
原生右键显示Chrome上下文菜单，不能当作飞书块菜单入口。
早期定位及层级不受控窗口继续保留：[发现](./dom/text-setup-block-menu-locate.json)、[R1](./dom/text-b05-block-menu-cancel-controlled-r1.json)、[R2](./dom/text-b05-block-menu-cancel-controlled-r2.json)、[R3](./dom/text-b05-block-menu-cancel-controlled-r3.json)、[R5](./dom/text-b05-block-menu-cancel-controlled-r5.json)、[R6](./dom/text-b05-block-menu-cancel-controlled-r6.json)。
R5临时元数据曾错误预填closedAfterEscape=true，导出前依据实际AX改为false，原说明和修正记录同时保留；不据错误预填产生通过结论。

## [✅] REQ S02 B05 016 在下方添加普通文本及创建历史

相同首段123和后置空text，真实T菜单→在下方添加→基础区T，新建普通text插在两原块之间。
首段123与原后置空段的顺序、文字、记录身份保持；不是转换123，也不复用原后置空段冒充新增。
新块首字符4落在新增text，实际光标与必要DOM身份见逐键记录。
撤销字符回新增空段，再撤销创建回原两块；重做创建、重做4，再两次撤销恢复原样例。
两轮文字、结构和历史一致，见[R1](./dom/text-b05-add-below-text-r1.json)、[R2](./dom/text-b05-add-below-text-r2.json)。
sir协助手动显示手柄并打开菜单，之后子菜单点击、创建、输入和全部历史由原生工具执行；不虚构全部过程为自动悬停。
R2前Chrome切到另一本地项目标签，恢复指定飞书标签并重新核对URL后才继续创建；未对该项目执行业务编辑。
零页滚动参数被工具拒绝；随后极小滚动实际改变约10px，菜单点击按最新截图重新定位，不沿用旧行坐标。
本项覆盖一种目标类型的下方新建入口，其他类型基础图标可见；完整转换全矩阵属于后续S03。

## [✅] REQ S02 B05 017 引用快捷键冲突定位、两轮创建及恢复

只读打开Chrome扩展快捷键页，实际发现ChatGPT扩展的“激活该扩展程序”绑定为⇧⌘.，范围为Chrome内。
它与飞书面板展示的引用快捷键冲突；此前主Period组合未到达文档，不能据此判飞书不支持。
sir明确授权临时清除这一个绑定、实测后恢复；清除后设置项实际显示未设置，未改其他扩展或权限。
延长250ms仍无Period事件的末次受阻窗口见[时长探针](./dom/text-b05-quote-shortcut-duration-r1.json)。
解除冲突后，两轮真实Cmd+Shift+Period均收到可信key=>、code=Period、metaKey/shiftKey=true，isComposing=false。
固定原普通text为两逻辑行1/7，1加粗700、7普通400；快捷键新增quote_container，将原text移为子段。
原文字、软换行和格式保持，其他H1/H9、列表和既有引用不变；不生成粘贴引用入口的引用外后置空段。
撤销移除新容器回原text，重做恢复包裹，再撤销回原样例；两轮原记录ID及语义恢复断言均通过。
见[R1](./dom/text-b05-quote-shortcut-unblocked-r1.json)、[R2](./dom/text-b05-quote-shortcut-unblocked-r2.json)。
随后原绑定已实测恢复为⇧⌘.，设置页标签关闭，见[设置恢复](./dom/text-setup-shortcut-conflict-restoration.json)的browserShortcutControl。
今后在当前浏览器保持原设置时，冲突仍会存在；复测应先识别扩展占用，不把环境按键拦截写成飞书行为。
本组基本创建入口已可复测；不扩展为所有快捷键、Markdown别名或后续任意转换矩阵已覆盖。

## 交付与后续边界

此前唯一空text n2708属于旧记录段，不能作为最新现场；当前123与后置空text，页标题空，创建历史已恢复。
块菜单取消边界、下方新建与引用快捷键均已补两轮，B05约定研究范围完成，临时浏览器设置已恢复。
B01–B11现已全部收口；B07独立读取和B08远程组合见对应子文件，S02最终现场与交付见阶段文档。
不从本组推导独立持久化、富文本/外部应用或跨平台解析，未修改项目代码、启动服务或执行git。
