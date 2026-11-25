# S02 表情与组合字符输入边界

状态：B10已完成约定范围的表情、组合字符、全半角、Tab、NBSP、零宽、LF/CRLF及对应删除/历史、计数与复制往返；共12个完成子项。结论限实测样例与当前Chrome环境，扩展边界明确列出；S02总进度与最终现场以阶段文档为准。
阶段进度见[阶段需求](./02-creation-and-editing.md)，断言见[验收矩阵](./02-verification-matrix.md)。

## 环境与记录方式

- 2026-10-14，指定飞书Chrome前台、原生text格式粘贴与真实按键。
- session=S02-1791940824848，segment=unicode-1791948894415。
- 唯一正文text n17/区n1667/行n1668/末尾空叶n1669，页标题空。
- 共12个窗口：6个操作窗口与6个SETUP，不等于12个通过项。
- 其中重音样例先两轮只采DOM，后两轮补采真实paste载荷，属于同一分支的证据补充。
- DOM文本同时保存字符串与码点；Selection偏移按DOM的UTF-16单位解释。
- 使用现有逐键双帧状态，粘贴完成不只依赖Cmd+V双帧快照。
- 新增document paste观察只读取指定重音样例的载荷，不执行编辑命令或改写正文DOM。

## [✅] REQ S02 B10 001 单码点表情的Backspace单位

两轮从唯一空正文原生粘贴 `A😀B`，进入正文的码点为65/128512/66。
真实Cmd+Right落文字尾UTF-16偏移4；第一次Backspace删除B，留下 `A😀`、偏移3。
第二次Backspace一次删除完整U+1F600，留下A、偏移1，没有保留单个高/低代理项。
两轮文字文本分别n1687/n1689，原块/区/行/末尾空叶保持，不新增逻辑行或正文块。
Cmd+Z只恢复本次表情删除，回 `A😀`/偏移3；Cmd+Shift+Z回A/偏移1。

证据：[表情R1](./dom/text-emoji-delete-r1.json)、[R2](./dom/text-emoji-delete-r2.json)。
首轮28条mutation/22条事件、第二轮26条mutation/15条事件，页面异常为空；首轮包括焦点恢复操作。
首轮关闭DevTools未取得正文焦点，后续通过当前AX可编辑根节点恢复，再执行粘贴。
这是环境恢复记录，不改写为表情输入失败；准备与恢复见[重复清理](./dom/text-setup-emoji-repeat.json)。

验收只覆盖单码点代理对表情：Backspace不能按UTF-16单元只删半个代理对，历史恢复完整表情和有效落点。
ZWJ家庭表情、肤色修饰符、区域指示符旗帜、按键帽以及Delete/方向键/复制计数没有覆盖。

## [✅] REQ S02 B10 002 分解重音粘贴后的合成与删除

传给原生text粘贴的是 `Ae\u0301B`，其中e与U+0301是分开的两个码点。
最初两轮DOM已经是 `AéB`，仅据此不能确定归一化发生在系统剪贴板还是页面处理阶段。
补充两轮document paste事件，isTrusted=true，真实载荷码点均为65/101/769/66。
同窗口正文文字码点均为65/233/66，即页面粘贴处理后呈现合成U+00E9；不宣称一般输入也自动合成。

两轮正文文字文本分别n1695/n1697；Cmd+Right为尾偏移3，先Backspace删除B，回 `Aé`/偏移2。
再次Backspace删除完整é，回A/偏移1；撤销回 `Aé`/偏移2，重做回A/偏移1。
原正文块/区/行与末尾空叶保持，页面异常为空，各26条mutation/15条原监听事件。
paste载荷另列pastes，不混入原events统计；载荷读取与前后状态原样保存。

证据：[载荷R1](./dom/text-combining-payload-r1.json)、[R2](./dom/text-combining-payload-r2.json)。
先前DOM观察见[早期R1](./dom/text-combining-delete-r1.json)、[R2](./dom/text-combining-delete-r2.json)，不重复增加矩阵分支。
两端样例清理见[初始准备](./dom/text-setup-combining-fixture.json)、[早期重复](./dom/text-setup-combining-repeat.json)、[载荷重复](./dom/text-setup-combining-payload-repeat.json)。

验收按已测粘贴路径复现合成文字和删除/历史落点；不能将这项写为DOM内分解重音的字素删除通过。
未验证NFC以外的归一化、不能合成的组合序列、多个重音、原生组合键直接输入或富文本粘贴差异。

## [✅] REQ S02 B10 003 LF纯文本粘贴与续输入历史

新记录段linebreak-1791949419104，两轮从唯一空正文原生text粘贴5、LF、6。
真实paste载荷码点53/10/54、isTrusted=true，结果是两个同父text块，各一个逻辑行，文字5/6。
原空块被替换，首轮新块n1698/n1707、第二轮n1748/n1757；光标在后块文字偏移1。
真实7沿该光标得到5/67、后块文字2，没有将LF留作用户文字或生成同区软换行。
一次撤销回5/6、后块文字1；第二次回唯一空正文/空叶文本1，空块/区/空叶都是新DOM身份。
重做再次生成新两块5/6，随后重做7得5/67；末尾两次撤销恢复新唯一空正文。
首轮最终n1741/区n1744/空叶文本n1747，第二轮最终n1791/区n1794/空叶文本n1797。
每轮48条mutation/32条事件，页面异常为空；见[LF R1](./dom/text-linebreak-lf-r1.json)、[R2](./dom/text-linebreak-lf-r2.json)。

## [✅] REQ S02 B10 004 CRLF纯文本粘贴与续输入历史

同样两轮粘贴5、CRLF、6，真实paste载荷码点53/13/10/54、isTrusted=true，CR未在进入页面前丢失。
编辑结果仍是两个同父text块5/6，真实7得5/67；撤销/重做的结构、文字与稳定光标规则和上述LF一致。
首轮新块n1798/n1807、第二轮n1848/n1857；重做新块及撤销回新空正文均按JSON留证，不要求DOM身份复用。
首轮V双帧状态仍为旧空块；随后的7输入前、mutation、历史与AX结果确认粘贴完成，不把早期状态误判为失败。
各48条mutation/32条事件，页面异常为空；见[CRLF R1](./dom/text-linebreak-crlf-r1.json)、[R2](./dom/text-linebreak-crlf-r2.json)。
结论限此无尾换行的两行样例；未覆盖单独CR、空行、首尾换行、混合换行、富文本或复制回剪贴板后的换行编码。
两类共四个窗口包含操作及恢复，不按窗口数重复计数，也不把文字等价推广为DOM身份/时序完全一致。

## [✅] REQ S02 B10 005–009 全半角、NBSP、用户零宽与Tab粘贴

special-characters-1791950265361段：正文有效全半角/NBSP各R1/R2、U+200B为R2/R3、U+200D与Tab各R1/R2。
真实paste载荷分别AＢC、A/U+00A0/B、A/U+200B/B、A/U+200D/B、A/Tab/B，码点和可信标志见specialPastes。
全角Ｂ=U+FF22与NBSP=U+00A0在正文中保留，尾偏移3，删除尾字后2，再删目标字符后只剩A/偏移1。
撤销恢复AＢ或A/NBSP、偏移2，重做A/1，最后清理A恢复原空叶；原正文区/行保持。
见[全半角R1](./dom/text-special-fullwidth-body-r1.json)、[R2](./dom/text-special-fullwidth-body-r2.json)、[NBSP R1](./dom/text-special-nbsp-body-r1.json)、[R2](./dom/text-special-nbsp-body-r2.json)。

用户U+200B和U+200D的载荷存在，正文普通文字实际只有AB；过滤发生在页面粘贴处理路径，不宣称键入/富文本同样过滤。
删除B得A/1，再删A回原空叶文本1；撤销恢复A/1，重做为空；没有对不存在的零宽字执行独立删除通过断言。
正文空叶的U+200B哨兵仍存在，与被过滤的用户零宽字区分；早期Cmd+Right延迟落点有时仍旧值，原数据保留。
见[U+200B R2](./dom/text-special-zwsp-body-r2.json)、[R3](./dom/text-special-zwsp-body-r3.json)、[U+200D R1](./dom/text-special-zwj-body-r1.json)、[R2](./dom/text-special-zwj-body-r2.json)。

Tab真实载荷码点65/9/66，正文为A/八个U+0020/B，共10个UTF-16单位，不是Tab或块缩进。
两次Backspace分别删B和一个空格，偏移10→9→8；历史恢复/删除单个空格，清理剩余A与七空格后回原空叶。
本路径仅覆盖粘贴字符，物理Tab按键的缩进/焦点行为另测；见[Tab R1](./dom/text-special-tab-body-r1.json)、[R2](./dom/text-special-tab-body-r2.json)。

## 错误落点与清理恢复（不计完成分支）

最初AX根可编辑焦点并不能区分页标题和正文；十个窗口误入或混合页标题，全部按失败保留，不作为上述正文两轮。
见[全半角失败R1](./dom/text-failed-special-fullwidth-r1.json)、[R2](./dom/text-failed-special-fullwidth-r2.json)、[NBSP失败R1](./dom/text-failed-special-nbsp-r1.json)、[R2](./dom/text-failed-special-nbsp-r2.json)。
其余见[U+200B失败R1](./dom/text-failed-special-zwsp-r1.json)、[R2](./dom/text-failed-special-zwsp-r2.json)、[U+200D失败R1](./dom/text-failed-special-zwj-r1.json)、[R2](./dom/text-failed-special-zwj-r2.json)、[Tab失败R1](./dom/text-failed-special-tab-r1.json)、[R2](./dom/text-failed-special-tab-r2.json)。
真实清理误入页标题的14字符后恢复标题空；见[恢复](./dom/text-setup-special-title-body-recovery.json)。
此后用可见正文点击和真实Right核对selectionContext，见[正文定位](./dom/text-setup-special-body-focus-verified.json)，不再用根节点点击推断正文落点。
U+200B正文首轮末次多余Backspace在空正文删除默认块、回页标题；见[首轮清理失败](./dom/text-special-zwsp-body-r1.json)，不计相同前置通过。
随后真实点击正文恢复新空text，再按剩余测试文字清理，见[空态恢复](./dom/text-setup-special-empty-body-refocus.json)。
有效最终唯一空text n2039/区n2042/空叶文本n2045，页标题空，active=null/connected=true/overflow=0；复制/计数尚未完成。

## [✅] REQ S02 B10 010 混合Unicode复制往返与计数

两轮唯一空正文粘贴A/全角Ｂ/NBSP/😀/分解重音e/Tab/X/U+200B/Y/U+200D/Z。
正文规范化为 `AＢ 😀é        XYZ`：全角、NBSP和表情保留，重音合成、Tab展开八空格、用户零宽过滤。
Cmd+Right、Shift+Cmd+Left选择正文整行，真实Cmd+C后系统pbpaste两轮均返回同一规范化文本。
复制不携带空叶哨兵、不额外恢复已过滤零宽或分解重音；仅确认此纯文本复制，不推导HTML复制格式。
文档信息两轮显示总字数4、总字符数8；仅保存统计两行的DOM，不保存所有者和访问记录。
此字符数等于本例去空白后UTF-16长度（表情占2），但单例不能证明通用计数算法；原统计值为验收断言。
见[复制计数R1](./dom/text-special-copy-count-r1.json)、[R2](./dom/text-special-copy-count-r2.json)，counterEvidence与clipboardRoundtrip单列为真实UI/剪贴板读取。
关闭信息面板后重新定位正文，选中整行真实Backspace清理，见[清理R1](./dom/text-setup-copy-count-cleanup-r1.json)、[R2](./dom/text-setup-copy-count-cleanup-r2.json)。

## [✅] REQ S02 B10 011 LF/CRLF跨块复制与计数

linebreak-copy-1791951541582段，LF与CRLF各两轮：空正文粘贴5/换行/6，第一次Cmd+A只选当前6块文字。
第二次Cmd+A进入正文块选区，AX为隐藏空格选中状态；真实Cmd+C后pbpaste均为码点53/10/54，即5/LF/6，无尾换行/哨兵。
原CRLF载荷保留13/10，但复制文字已统一LF；文档信息各两轮总字数2、总字符数2，必要统计行DOM见counterEvidence。
见[LF复制R1](./dom/text-linebreak-copy-lf-r1.json)、[R2](./dom/text-linebreak-copy-lf-r2.json)、[CRLF复制R1](./dom/text-linebreak-copy-crlf-r1.json)、[R2](./dom/text-linebreak-copy-crlf-r2.json)。
clipboardRoundtrip初次text字段误录字面转义，已据真实pbpaste/码点修正；initialRecordedText与recordingCorrection保留追溯，编辑快照未改写。
关闭信息面板后真实定位6块、撤销粘贴，回新唯一空正文；见[LF恢复R1](./dom/text-setup-linebreak-copy-lf-r1-restore.json)、[R2](./dom/text-setup-linebreak-copy-lf-r2-restore.json)、[CRLF恢复R1](./dom/text-setup-linebreak-copy-crlf-r1-restore.json)、[R2](./dom/text-setup-linebreak-copy-crlf-r2-restore.json)。
最终唯一空text n2250/区n2253/空叶文本n2256偏移1，页标题空、active=null/connected=true/overflow=0。

## [✅] REQ S02 B10 012 不能合成的分解重音删除与历史

combining-uncomposed-1791951989694段，两轮真实载荷与正文均为Ax/U+0301/B，码点65/120/769/66，未合成独立码点。
Cmd+Right到文字4，Backspace删B得Ax/U+0301、偏移3；第二次只删除U+0301，回Ax/偏移2。
撤销只恢复重音，回Ax/U+0301/偏移3；重做回Ax/2，最后删除x与A恢复原空叶文本1。
因此不能将分解重音按合成é或整字素删除：当前Chrome/飞书实测按此重音码点单独删除，原块/区/行保持。
首轮剩余文字守卫拒绝自动清理Ax，未发送额外清理键；读取后明确两次Backspace完成恢复，原采集保留。
见[分解重音R1](./dom/text-special-combining-uncomposed-r1.json)、[R2](./dom/text-special-combining-uncomposed-r2.json)。

## 恢复与未测边界

各样例删到A后用真实Backspace清空；早期清理见[恢复](./dom/text-setup-unicode-final-restore.json)。
最终回唯一空正文n17/区n1667/行n1668/空叶文本n1670偏移1，页标题保持空。
最终窗口见[载荷组恢复](./dom/text-setup-unicode-payload-final-restore.json)，SETUP不增加删除通过项。
监控active=null、connected=true、overflow=0、compositionActive=false，未刷新页面验证独立保存。
截图捕捉通道曾返回ScreenCaptureKit -3811；AX与DOM仍可用，该工具错误不归因给编辑器。

最新换行组最终为唯一空text n1891/区n1894/空叶文本n1897偏移1，旧n17已被粘贴重建，页标题空。
仍待全半角、Tab/NBSP/零宽字符、其他换行边界、Unicode导航、复杂字素、计数与复制往返。
S02其余范围保持原状态；没有修改项目代码、启动服务或执行git，未进入S03。
B10收口：上述约定类别与必要计数/复制均有真实证据，标[✅]；复杂表情扩展、其他OS/输入法及更多混合字符属于未覆盖的泛化边界，不冒充通用算法。最终唯一空text n2250/区n2253/空叶文本n2256、页标题空，active=null/connected=true/overflow=0。
