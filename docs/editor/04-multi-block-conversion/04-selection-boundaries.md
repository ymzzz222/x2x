# S04 选区与容器边界补充

状态：持续执行。本文补充阶段D02及后续容器范围，不把某一目标的规则自动推广到其他目标。
来源为指定Chrome飞书页面实测；项目代码未修改，项目入口尚未验收。
H1/H9代表两端标题级别，H2–H8共同行为仅依sir授权推断，不计实际窗口。
主合同见[阶段需求](./04-multi-block-conversion.md)，来源目标矩阵见[同类来源](./04-homogeneous-matrix.md)。
本批session为S04-1792119385656，同名节点引用不能与其他session直接比较身份。
正文来源均为111/222/333，页标题777不参与。
[边界建样](./dom/D00-boundary-text3-fixture.json)将H1/text/bullet恢复text×3，含撤销与重做。
三个固定范围分别验证，不能把不同方向当作同条件双轮。
正文、引用及其他容器的补测持续追加；只有明确链接的子项计为完成。

## REQ-S04-D02-003 标题及列表目标的三种精确范围

状态：H9、有序、无序三个目标的每种范围各双轮；此前H1同范围双轮继续保留。
零偏移范围为111:0→222:0，部分范围为111:1→333:2，反向范围为333:2→111:1。
真实快捷键为Cmd+Option+9、Cmd+Shift+7、Cmd+Shift+8；每次目标后撤销、重做、再次撤销。

| 目标 | 零偏移双轮 | 部分范围双轮 | 反向范围双轮 |
| --- | --- | --- | --- |
| H9 | [R1](./dom/D02-next-zero-heading9-R1.json)、[R2](./dom/D02-next-zero-heading9-R2.json) | [R1](./dom/D02-partial-heading9-R1.json)、[R2](./dom/D02-partial-heading9-R2.json) | [R1](./dom/D02-reverse-heading9-R1.json)、[R2](./dom/D02-reverse-heading9-R2.json) |
| 有序 | [R1](./dom/D02-next-zero-ordered-R1.json)、[R2](./dom/D02-next-zero-ordered-R2.json) | [R1](./dom/D02-partial-ordered-R1.json)、[R2](./dom/D02-partial-ordered-R2.json) | [R1](./dom/D02-reverse-ordered-R1.json)、[有效R2](./dom/D02-reverse-ordered-valid-R2.json) |
| 无序 | [R1](./dom/D02-next-zero-bullet-R1.json)、[R2](./dom/D02-next-zero-bullet-R2.json) | [R1](./dom/D02-partial-bullet-R1.json)、[R2](./dom/D02-partial-bullet-R2.json) | [R1](./dom/D02-reverse-bullet-R1.json)、[有效R2](./dom/D02-reverse-bullet-valid-R2.json) |

零偏移：仅111变为目标类型，222/333仍是正文；接触下一段起点不构成选中下一段文字。
部分与反向：三个相交段落完整改为目标类型，首尾未选字符不拆段，不增删正文段落。
每个有效窗口的三段全文、顺序与同窗口业务ID及外层对象保持；不得跨恢复窗口强行比较字面ID。
有序部分/反向输出标记1./2./3.；零偏移只新增首项1.，后两段保持正文。
一次撤销恢复所有受影响段落，重做恢复对应输出，再次撤销回text×3。
原生Range保留实际容器与偏移；AX可能夹入列表标记，不把标记当成用户字符。
错误数组及overflow为0；画面采集错误与焦点失败属于操作环境记录，不冒充页面error事件。
可见保存提示不代替独立重载；本组暂无单独重载结果。

## 前置失败与恢复

[H9反向准备失败](./dom/D02-reverse-heading9-preparation-failed.json)因视觉列映射只得到首段偏移2，目标键未执行。
后续通过逻辑段首键确定偏移0，再向右扩到偏移1；最终Range按DOM核对，而非仅按按键脚本命名。
[有序反向R2失败](./dom/D02-reverse-ordered-R2-capture-and-focus-failure.json)保留原转换、采集错误后索引失效及误粘贴诊断文字。
这份窗口排除出正式R2；不能因其前半段有目标结果就把整份当成干净的复测。
[诊断文字恢复](./dom/D00-recover-mispasted-diagnostic-query.json)保留真实撤销及重做，最终三段文字和text类型恢复。
误粘贴和Enter合并为一条历史；第二次撤销多退回混合建样，再重做一步恢复三正文，未隐瞒多撤销。
恢复后第二、三段业务ID变为91/90，首段仍51；后续以新基线记录同窗口身份，不能声称恢复原50/49。
新有效有序R2使用51/91/90，语义前置仍为同父text111/222/333，目标与端点和有效R1一致。
[无序反向R2准备失败](./dom/D02-reverse-bullet-R2-focus-preparation-failed.json)时Chrome切到其他标签，没有捕获编辑器keydown，也没有执行目标。
切回指定URL并核对活动窗口后执行有效R2；不把其他页面上的准备按键算作飞书选区证据。
后续查询前重新读取标准窗口URL和控制台索引，点击后确认控制台焦点再粘贴，避免旧索引指向正文。
这些恢复是测试操作维护，不作为项目编辑器已具备故障恢复能力的证明。

## REQ-S04-D02-004 引用包装的三种精确范围

状态：每种范围各双轮，完整真实overlay菜单及原生Range已入对应窗口。

| 范围 | 双轮包装结果 | 证据 |
| --- | --- | --- |
| 111:0→222:0 | 只有111进入引用，222/333仍在外部 | [R1](./dom/D02-next-zero-quote-R1.json)、[R2](./dom/D02-next-zero-quote-R2.json) |
| 111:1→333:2 | 三段完整进入同一个引用，没有拆出首尾未选字符 | [R1](./dom/D02-partial-quote-R1.json)、[R2](./dom/D02-partial-quote-R2.json) |
| 333:2→111:1 | 同样包装三段，保留反向范围对应的内容边界 | [R1](./dom/D02-reverse-quote-R1.json)、[R2](./dom/D02-reverse-quote-R2.json) |

范围通过真实拖选建立；只读Range几何用于定位字符边界，没有直接设Selection或调用编辑命令。
每轮目标、撤销、重做、再次撤销保持三段文字及原块身份；历史只新增/移除共同包装，最后回顶层text×3。
零偏移两轮的未选222/333编辑区对象和HTML均保持；不能把Range接触下一段起点算作选中该段。
错误数组及overflow为0；实际菜单点击、必要overlay变更与正文变化同窗口保存。

## REQ-S04-D02-005 正文无变化命令的三范围

状态：三种范围各双轮，原命令输出与后续输入历史分别核对。

| 原命令范围 | 证据 |
| --- | --- |
| 111:0→222:0 | [R1](./dom/D02-next-zero-text-noop-R1.json)、[R2](./dom/D02-next-zero-text-noop-R2.json) |
| 111:1→333:2 | [R1](./dom/D02-partial-text-noop-R1.json)、[R2](./dom/D02-partial-text-noop-R2.json) |
| 333:2→111:1 | [R1](./dom/D02-reverse-text-noop-R1.json)、[R2](./dom/D02-reverse-text-noop-R2.json) |

每轮第一次Cmd+Option+0保持原三段text及HTML、ID与实际范围，不生成转换结果或拆分段落。
后续独立将333末端输入X，全文选到333X:4后再次执行正文命令，再撤销/重做/再次撤销X。
后续全文范围不冒充第一次边界范围；第一次无变化与输入历史是同窗口中的不同检查点。
两轮最终均回111/222/333，标题777保持；没有额外无变化撤销层，错误数组和overflow为0。

D02语义审计已覆盖六个抽样目标×三范围×双轮，共36个正式窗口。
逐窗口检查了原生Range、方向、全文、外层身份、零偏移未选编辑区、引用成员及三步历史；失败窗口单独保留。
这表示约定代表边界已收口，不宣称所有来源、容器与属性的笛卡尔积均实测。

## REQ-S04-D04-003 六整块全选到引用及正文无变化

状态：两个目标各双轮，连同既有H1/H9/有序/无序双轮，六目标的六块组合已取得代表证据。
[重建](./dom/D00-six-block-empty-space-softbreak-reprise.json)依次为空、111、空、单空格、222软换行223、空；真实Shift+Enter建立软换行。
建样的粘贴、软换行、223输入及末尾空块分别保留撤销/重做；不把textContent的222223误认成同一视觉行。
引用：[R1](./dom/D04-six-block-body-all-quote-R1.json)、[R2](./dom/D04-six-block-body-all-quote-R2.json)。
真实入口：显示111块手柄、打开块菜单，再Cmd+A扩大到六整块；菜单保持打开，点击引用图标。
R1含入口探查，R2含一次未显示手柄的准备；目标前均为同一菜单入口和六整块选择，不按准备步骤数量认定重复。
六个原text共同进入一个quote_container，首尾空段也在其中，与D04-002的空哨兵文本Range结果不同。
目标及三步历史均保留六个原外层、业务ID、文字、单个用户空格、两条ace-line及顺序，最终恢复六块正文。
正文无变化：[R1](./dom/D04-six-block-text-noop-history-R1.json)、[R2](./dom/D04-six-block-text-noop-history-R2.json)。
从111两次Cmd+A进入正文整块全选，Cmd+Option+0不改变六个编辑区对象和HTML。
后续在111末端输入X，撤销/重做/再次撤销分别移除、恢复、移除X；最终六块和软换行完整保留。
四个正式窗口的结构、内容、身份、引用成员与历史已逐动作静态审计，错误数组及overflow为0。
此处全选由docx-selection-hidden-textarea承载，不伪写为六块普通文字Range；页标题777不参与。

## 后续边界登记

| 范围 | 当前状态 | 仍需补充 |
| --- | --- | --- |
| H1/H9、有序、无序三范围 | 每个范围双轮 | 不扩大为所有来源与容器全组合 |
| 正文同类三范围 | 双轮已验证 | 见D02-005，边界命令与全文输入历史分开 |
| 引用三范围 | 双轮已验证 | 见D02-004，含外部未选段和完整菜单 |
| 折叠完整后代 | 无序及引用各双轮已验证 | 见D05-004，分开折叠历史与转换历史 |
| 特殊父级选择手势 | 已验证 | 跨引用反向、正文整块全选、折叠键盘/拖选，见复杂范围补充 |

最终S04状态以[运行矩阵](./04-verification-matrix.md)为准。
所有必要DOM按maiya命名规则规范化，来源URL和用户文字保持原义。
本文件的用例必须与对应动作编号、Range、菜单及history同窗口核对，不能只凭截图验收。

## REQ-S04-D05-004 折叠父标题到下一同级标题的零偏移

来源：Chrome真实键盘扩选及拖选，H1 111／隐藏H9 222／H1 333。
状态：无序和引用各两轮有效；目标前均为111:0→333:0，外部333不参与。
无序：[R1](./dom/D05-folded-parent-to-next-zero-bullet-R1.json)、[R2](./dom/D05-folded-parent-to-next-zero-bullet-R2.json)。
真实Shift+Down跨过隐藏后代，111与222均变为bullet，333仍为H1；撤销恢复展开H1/H9/H1。
引用：[有效R1](./dom/D05-folded-parent-descendants-quote-clean-R1.json)、[有效R2](./dom/D05-folded-parent-descendants-quote-clean-R2.json)。
真实拖选相同端点，共同quote_container包含父标题及隐藏后代，333保持外部。
引用目标保持折叠；撤销引用后展开原三标题，重做恢复折叠引用，再次撤销恢复展开三标题。
仅选111文字的既有双轮不包含隐藏222；不能把可见文字相同理解为作用范围相同。
[展开检查](./dom/D05-folded-parent-descendants-quote-R1.json)实际读到引用内H1/H9、外部H1，证明隐藏成员归属。
该窗口的历史按键只往返了其后插入的展开动作，不冒充转换历史；[拆分恢复](./dom/D05-folded-quote-history-disambiguation.json)保留两级撤销。
[错误前置](./dom/D05-folded-parent-descendants-quote-R2-precondition-failed.json)因三标题仍展开，未执行目标，不计第二轮。
正式两轮不在转换与历史之间插入展开动作；errors及overflow为0。
折叠/展开自身会进入历史，转换撤销后的展开状态与转换重做的折叠状态分别验收。
