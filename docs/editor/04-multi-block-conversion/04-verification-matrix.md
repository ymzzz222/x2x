# S04 运行矩阵

状态：已完成。D01–D07共7/7，按明确代表范围验收；285份证据含建样、失败、恢复和只读，不当作功能通过数量。

## 最终清单状态（2026-10-16）

| 总项 | 已验证范围 | 证据与需求 |
| --- | --- | --- |
| D01 ✅ | text/H1/H9/有序/无序/共同引用六类来源×六目标，另H1/text/bullet混合六目标，42格各双轮 | [同类矩阵](./04-homogeneous-matrix.md)、阶段D01-001–004 |
| D02 ✅ | 六目标各含下一块0、部分正向、部分反向，36个正式窗口；未选内容与外部段保持 | [边界补充](./04-selection-boundaries.md)、阶段D02-001–002 |
| D03 ✅ | 同父、跨引用父级、连续/跨类型列表、混合嵌套、列表含引用、正文全选与未选项重编号，各代表双轮 | 阶段D03-001–004及[复杂范围D03-005–006](./04-structures-history-and-persistence.md) |
| D04 ✅ | 六块空/111/空/空格/软换行/空到六目标各双轮；文本Range与整块引用成员不同 | [边界D04-003](./04-selection-boundaries.md)、阶段D04-001–002 |
| D05 ✅ | 列表父文字/父子全文、展开标题仅文字/含后代、折叠仅文字/跨隐藏后代；无序与引用代表双轮 | 阶段D05-001–003及[折叠D05-004](./04-selection-boundaries.md) |
| D06 ✅ | 连续重复、标题往返、连续三键合并、分隔独立历史、嵌套列表及引用编号重算各双轮 | 阶段D06-001–002及[历史D06-003](./04-structures-history-and-persistence.md) |
| D07 ✅ | 七种手势、特殊父级反向/全选、折叠键盘/拖选、第一与第二视觉行/逻辑段/整块边界，各相同手势双轮 | 阶段D07-001及[视觉行D07-002](./04-structures-history-and-persistence.md) |
| 保存代表 ✅ | H9、有序、共同引用各双轮转换/撤销/重做/云端保存，十二次Chrome及夸克真实刷新读取 | [D08-001及逐轮链接](./04-structures-history-and-persistence.md#req-s04-d08-001-多块保存代表范围) |

范围：H1/H9实测，H2–H8共同行为按sir授权推断；不宣称全部来源、属性、容器、入口和时序的笛卡尔积。
近间隔676ms/805ms窗口时序不同，保留为探查；连续三键两轮实测25/16ms、21/13ms，均一次撤销回来源；分隔条件独立历史已双轮。
未知内部合并阈值不编造固定数值；这些探查不混作同条件双轮，也不要求项目复制未经观察的内部算法。
复杂嵌套深度、复制删除、协同及项目实现验收仍属于原后续阶段；本次没有修改项目代码或运行项目构建测试。
[证据索引](./04-evidence-index.md)列出全部285窗口；校验值、精确还原、50–500行、规范化命名、相对链接及必要语义断言已核对。
[最终清理](./dom/D00-S04-final-cleanup.json)及[刷新只读](./dom/D00-S04-final-reload-read.json)：12:56页标题/正文清空保存，旧观察器不存在，夸克恢复项目标签。

以下为历史批次记录，保留当时缺口与失败；“未完成”“尚未重载”等历史状态由上表及最终条目覆盖，不改写原始窗口。

## 历史首批窗口

| 窗口 | 状态 | 证据及说明 |
| --- | --- | --- |
| D00-three-text-fixture | 建样 | [JSON](./dom/D00-three-text-fixture.json)，含意外末尾空块 |
| D00-remove-extra-empty | 恢复 | [JSON](./dom/D00-remove-extra-empty.json) |
| D01-text3-heading1-R1 | 试运行 | [JSON](./dom/D01-text3-heading1-R1.json)，外层身份定位过宽 |
| D01-text3-heading1-valid-R1 | 前置失败 | [JSON](./dom/D01-text3-heading1-valid-R1.json)，实际仅末段光标 |
| D01-text3-heading1-keyboard-R1 | 转换及历史已验证 | [JSON](./dom/D01-text3-heading1-keyboard-R1.json) |
| D01-text3-heading1-keyboard-R2 | 转换及历史已验证 | [JSON](./dom/D01-text3-heading1-keyboard-R2.json) |
| D01-text3-heading9-keyboard-R1 | 转换及历史已验证 | [JSON](./dom/D01-text3-heading9-keyboard-R1.json)，转换前已补足选区 |
| D01-text3-heading9-keyboard-R2 | 转换及历史已验证 | [JSON](./dom/D01-text3-heading9-keyboard-R2.json) |

本批需求链接：[REQ-S04-D01-001](./04-multi-block-conversion.md#req-s04-d01-001-连续三正文转-h1-或-h9)。

## 初批比较口径（后续前置分别记录）

- 正式窗口 session 为 S04-1792114262782。
- 旧观察器 session 为 S04-1792114084043；同名节点引用不可跨会话比较。
- 转换动作前的实际选区为 111 偏移 0 → 333 偏移 3。
- 选区构造手势有差异，只验证最终同条件转换；D07 未收口。
- 类型序列：text×3 → 目标×3 → text×3 → 目标×3 → text×3。
- 页标题不参与，三个原外层身份与业务 ID 保持，内部编辑区重建。
- 已保存提示不能替代独立重载，当前未验证本条持久化。
- H2–H8 共同行为仅按既有抽样授权推断。
- 观察器错误数组为零，不等于没有 console policy 警告。

## 证据读取与完整性

JSON 通过 objects 字典对重复对象去重；递归展开单一 `$obj` 键即可还原。
每个窗口保留原 actions、前后快照、mutation 的顺序和次数，未省略失败操作。
sha256 对规范化后窗口以 Python json.dumps(sort_keys=True, ensure_ascii=False) 编码计算。
导出脚本已逐窗口检查展开值与规范化原值完全相等。
DOM 标识中的 feishu 规范化为 maiya，来源地址和用户文字保持不变。
当前 JSON 全部可解析，文件在 50–500 行范围内；这些是交付静态检查。
未运行项目构建、实现测试或项目浏览器验证。
后续每批实测必须继续更新本矩阵及阶段需求，不能把尚未执行的项目升级为通过。

## 列表追加窗口

| 窗口 | 状态 | 证据 |
| --- | --- | --- |
| ordered-R1 | 类型与历史已验证 | [JSON](./dom/D01-text3-ordered-R1.json) |
| ordered-R2 | 前置失败，无目标动作 | [JSON](./dom/D01-text3-ordered-R2.json) |
| ordered-valid-R2 | 类型与历史已验证 | [JSON](./dom/D01-text3-ordered-valid-R2.json) |
| bullet-R1 | 类型与历史已验证 | [JSON](./dom/D01-text3-bullet-R1.json) |
| bullet-R2 | 类型与历史已验证 | [JSON](./dom/D01-text3-bullet-R2.json) |

初批两类列表的完整标记子树未保存；后续完整DOM和相同正向复测已补齐，见 [D01-002](./04-multi-block-conversion.md#req-s04-d01-002-连续三正文转两类列表)。

## 完整块 DOM 与选区边界追加窗口

| 用例 | 范围 | 证据 |
| --- | --- | --- |
| ordered-full | 正向、反向各一次，分开计 | [正向](./dom/D01-text3-ordered-full-R1.json)、[反向](./dom/D01-text3-ordered-full-R2.json) |
| bullet-full | 相同反向全文各双轮 | [R1](./dom/D01-text3-bullet-full-R1.json)、[R2](./dom/D01-text3-bullet-full-R2.json) |
| next-zero-heading1 | 111:0 → 222:0 | [R1](./dom/D02-next-zero-heading1-R1.json)、[R2](./dom/D02-next-zero-heading1-R2.json) |
| partial-heading1 | 111:1 → 333:2 | [R1](./dom/D02-partial-heading1-R1.json)、[R2](./dom/D02-partial-heading1-R2.json) |
| reverse-heading1 | 333:2 → 111:1 | [R1](./dom/D02-reverse-heading1-R1.json)、[R2](./dom/D02-reverse-heading1-R2.json) |

新会话为 S04-1792114700730；与旧会话同名节点不得比较身份。
三个边界用例均逐目标键、历史键审计全文及类型；下一块零偏移用例同时核对未选中两块内部节点不变。

## 连续异类来源六目标

来源为 H1/text/bullet，五个快捷键目标反向全文，引用菜单正向全文，各自两轮端点相同。

| 目标 | 两轮证据 |
| --- | --- |
| heading1 | [R1](./dom/D01-mixed3-heading1-R1.json)、[R2](./dom/D01-mixed3-heading1-R2.json) |
| heading9 | [R1](./dom/D01-mixed3-heading9-R1.json)、[R2](./dom/D01-mixed3-heading9-R2.json) |
| ordered | [R1](./dom/D01-mixed3-ordered-R1.json)、[R2](./dom/D01-mixed3-ordered-R2.json) |
| bullet | [R1](./dom/D01-mixed3-bullet-R1.json)、[R2](./dom/D01-mixed3-bullet-R2.json) |
| text | [R1](./dom/D01-mixed3-text-R1.json)、[R2](./dom/D01-mixed3-text-R2.json) |
| quote-menu | [R1](./dom/D01-mixed3-quote-menu-R1.json)、[R2](./dom/D01-mixed3-quote-menu-R2.json) |

建样失败的布局重排和第二次实际完成分开记录：[初步建样](./dom/D00-mixed-heading-text-bullet-fixture.json)、[完成建样](./dom/D00-mixed-heading-text-bullet-complete.json)。
有序入口输出 H1 编号标题加两项有序；不是三个 ordered。引用保留三个子块类型。
三正文引用双轮：[R1](./dom/D01-text3-quote-menu-R1.json)、[R2](./dom/D01-text3-quote-menu-R2.json)。
有序完整 DOM 正向复测：[JSON](./dom/D01-text3-ordered-full-forward-repeat.json)。

## 连续转换与历史

| 用例 | 结果 | 证据 |
| --- | --- | --- |
| H1 连续两次 | 混合→全H1→全正文，两级历史双轮 | [R1](./dom/D06-mixed-heading1-repeat-R1.json)、[R2](./dom/D06-mixed-heading1-repeat-R2.json) |
| H1/H9 往返，近间隔 | 676ms 与 805ms 对照历史粒度不同，未确定阈值 | [R1](./dom/D06-heading1-heading9-roundtrip-R1.json)、[R2](./dom/D06-heading1-heading9-roundtrip-R2.json) |
| H1/H9 往返，分隔操作 | 实际间隔均超过2秒，三级历史双轮 | [R1](./dom/D06-roundtrip-spaced-R1.json)、[R2](./dom/D06-roundtrip-spaced-R2.json) |

恢复窗口：[多撤销恢复](./dom/D00-roundtrip-extra-undo-recovery.json)、[补充第三次撤销](./dom/D00-roundtrip-R2-final-restore.json)、[三正文重置](./dom/D00-mixed-to-three-text-reset.json)。

## 引用父级与正文全选

| 用例 | 证据 |
| --- | --- |
| quote-to-outside-heading1 | [R1](./dom/D03-quote-to-outside-heading1-R1.json)、[R2](./dom/D03-quote-to-outside-heading1-R2.json) |
| quote-to-outside-bullet | [R1](./dom/D03-quote-to-outside-bullet-R1.json)、[R2](./dom/D03-quote-to-outside-bullet-R2.json) |
| body-all-heading1 | [R1](./dom/D03-body-all-heading1-R1.json)、[R2](./dom/D03-body-all-heading1-R2.json) |

[两段引用建样](./dom/D00-quote-two-plus-outside-fixture.json)、[标题777建样](./dom/D00-title777-fixture.json)。
跨引用 Range 终点是容器入口 SPAN:0，并非 111 文本:0；正文全选是隐藏输入整块选择，并非可直接读取的文本 Range。

## 连续列表及父子范围

| 用例 | 有效证据 |
| --- | --- |
| D03-ordered-first-two-heading1 | [R1](./dom/D03-ordered-first-two-heading1-R1.json)、[R2](./dom/D03-ordered-first-two-heading1-R2.json) |
| D03-cross-list-heading1 | [R1](./dom/D03-cross-list-heading1-R1.json)、[R2](./dom/D03-cross-list-heading1-R2.json) |
| D03-cross-list-ordered | [R1](./dom/D03-cross-list-ordered-R1.json)、[R2](./dom/D03-cross-list-ordered-R2.json) |
| D05-parent-text-only-heading1 | [R1](./dom/D05-parent-text-only-heading1-R1.json)、[R2](./dom/D05-parent-text-only-heading1-R2.json) |
| D05-parent-and-child-heading1-valid | [R1](./dom/D05-parent-and-child-heading1-valid-R1.json)、[R2](./dom/D05-parent-and-child-heading1-valid-R2.json) |

父子全文失败前置单独保留：[R1](./dom/D05-parent-and-child-heading1-R1.json)、[R2](./dom/D05-parent-and-child-heading1-R2.json)，分别为子项光标和子项零偏移终点。

## 空块、空格与软换行

[六块建样](./dom/D00-empty-space-softbreak-fixture.json)；隐藏输入正文全选，四个目标各两轮。

| 目标 | 证据 |
| --- | --- |
| heading1 | [R1](./dom/D04-empty-space-softbreak-heading1-R1.json)、[R2](./dom/D04-empty-space-softbreak-heading1-R2.json) |
| heading9 | [R1](./dom/D04-empty-space-softbreak-heading9-R1.json)、[R2](./dom/D04-empty-space-softbreak-heading9-R2.json) |
| ordered | [R1](./dom/D04-empty-space-softbreak-ordered-R1.json)、[R2](./dom/D04-empty-space-softbreak-ordered-R2.json) |
| bullet | [R1](./dom/D04-empty-space-softbreak-bullet-R1.json)、[R2](./dom/D04-empty-space-softbreak-bullet-R2.json) |

## 自动折行选择手势

[长段建样](./dom/D00-wrapped-text-selection-fixture.json)，一个逻辑段、两条视觉行。

| 手势 | 两轮证据 |
| --- | --- |
| single | [R1](./dom/D07-wrap-single-R1.json)、[R2](./dom/D07-wrap-single-R2.json) |
| double | [R1](./dom/D07-wrap-double-R1.json)、[R2](./dom/D07-wrap-double-R2.json) |
| triple | [R1](./dom/D07-wrap-triple-R1.json)、[R2](./dom/D07-wrap-triple-R2.json) |
| drag | [R1](./dom/D07-wrap-drag-R1.json)、[R2](./dom/D07-wrap-drag-R2.json) |
| shift-click | [R1](./dom/D07-wrap-shift-click-R1.json)、[R2](./dom/D07-wrap-shift-click-R2.json) |
| keyboard | [R1](./dom/D07-wrap-keyboard-R1.json)、[R2](./dom/D07-wrap-keyboard-R2.json) |
| all | [R1](./dom/D07-wrap-all-R1.json)、[R2](./dom/D07-wrap-all-R2.json) |

可信click detail、shift修饰键、Range和文字fragment布局已保存；键盘用例ArrowLeft前实际光标已为0，不能声称第二视觉行定位成功。


## 引用空段边界与标题后代追加

| 子项 | 双轮证据及状态 |
| --- | --- |
| 六块样例文本Range到引用，中间四块包装 | [R1](./dom/D04-six-block-quote-text-range-R1.json)、[R2](./dom/D04-six-block-quote-text-range-R2.json)；首尾空段均留外部 |
| 展开父标题仅文字到无序 | [R1](./dom/D05-heading-parent-text-bullet-valid-R1.json)、[R2](./dom/D05-heading-parent-text-bullet-valid-R2.json) |
| 展开父标题及后续低级标题到无序 | [R1](./dom/D05-heading-parent-descendants-bullet-R1.json)、[有效R2](./dom/D05-heading-parent-descendants-bullet-valid-R2.json) |
| 折叠父标题仅文字到无序 | [R1](./dom/D05-folded-parent-text-bullet-R1.json)、[R2](./dom/D05-folded-parent-text-bullet-R2.json)；撤销后仍展开 |
| 错误快捷键，排除 | [JSON](./dom/D05-heading-parent-wrong-shortcut-preserved.json)；实际H8，已恢复 |
| 后代范围失败，排除 | [JSON](./dom/D05-heading-descendants-invalid-R2.json)；删除线误点与222光标，不计复测 |
| 边界探查，无目标 | [JSON](./dom/D04-boundary-empty-keyboard-probe.json) |

当时汇总：114个窗口，包含所有建样及失败；不是功能通过数量。当前观察器已停止、页面保留777及展开H1/H9/H1；详见[当时阶段检查点](./04-multi-block-conversion.md#1040检查点历史后续仍在执行)。
当时D01–D07未完成，尚无独立刷新；最终已补齐，见文首最终表。


## 持续完成批次：连续同类矩阵

当时按sir要求接续执行，不以该中间检查点结束任务；最终完成状态见文首。
连续H1六目标双轮及菜单补证15窗口、连续H9六目标双轮13窗口已新增落盘，总数142，包含建样和早期菜单缺口窗口。
具体合同及双轮链接见[同类来源矩阵](./04-homogeneous-matrix.md)。
两来源共24个正式目标窗口逐动作静态审计通过：端点111:0→333:3、三段文字、外层身份、输出类型、标题编号、引用菜单与三步历史。
H1/H9有序入口均保留标题类型并新增1./2./3.；同级目标均切回正文。
原popup监听未覆盖实际菜单overlay，H1引用已补完整overlay双轮，不把原窗口覆盖范围追溯升级。
后续监听同时覆盖实际overlay，BODY mutation目标不保存无关整页HTML；相关身份与overlay子树保留。
H9完整B17文件已核实13个窗口；最初空切片文件不计入证据窗口。
浏览器活动窗口随后持续切到其他项目页面，窗口菜单不再列出飞书文档；已询问Chrome是否由其他任务控制。
在得到前台使用情况回复前，完成不依赖UI的证据与文档审计；不在其他页面执行飞书输入。
