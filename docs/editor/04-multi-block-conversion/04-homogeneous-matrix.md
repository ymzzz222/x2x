# S04 连续同类来源目标矩阵

状态：六种连续来源的六个抽样目标共36单元均有双轮；另有混合来源六目标双轮，证据数量不等于通过率。
规则来源为指定Chrome飞书页面实测，H2–H8共同行为仅依sir授权推断。
本表补充[阶段需求](./04-multi-block-conversion.md)的D01，正文与混合来源已有证据继续保留。
本批观察器session为S04-1792118735782，不与此前会话比较n引用。
每组来源固定三块111/222/333，页标题777不参与正文选区。
实际目标为正文、H1、H9、有序、无序、引用，不能用目标名称推断输出块类型。
五个类型目标通过真实快捷键执行；引用通过真实拖选与气泡类型菜单执行。
每个目标各R1/R2两轮，动作前后、正文HTML、节点身份、祖先、菜单和可信输入均入证据。
每次有正文变化时，随后真实撤销、重做、再次撤销，最终回到同一来源。
纯无变化命令须另测后续输入历史，不盲目撤销更早建样。

## REQ-S04-D01-005 连续三个H1的六目标

状态：六个具体目标各双轮已验证；不代表其他来源已完成。
[来源建样](./dom/D00-homogeneous-heading1-fixture.json)将原H1/H9/H1统一为H1×3，含建样撤销及重做。
前置业务ID51/50/49，三块同一正文父级，全部文字为111/222/333。
五个快捷键目标的最终前置Range为111:0→333:3；建立范围使用逐键扩选。
引用两轮均在目标点击前真实拖选为111:0→333:3，首轮多保留键盘和Shift点击入口准备。

| 目标入口 | 两轮输出 | 必须保留的差异 | 证据 |
| --- | --- | --- | --- |
| Cmd+Option+0 | text×3 | 三个标题一起去除标题属性 | [R1](./dom/D01-heading1x3-text-R1.json)、[R2](./dom/D01-heading1x3-text-R2.json) |
| Cmd+Option+1 | text×3 | 同类型批量命令执行开关，不是统一幂等 | [R1](./dom/D01-heading1x3-heading1-R1.json)、[R2](./dom/D01-heading1x3-heading1-R2.json) |
| Cmd+Option+9 | H9×3 | 三块同时改变级别，全文不拆分 | [R1](./dom/D01-heading1x3-heading9-R1.json)、[R2](./dom/D01-heading1x3-heading9-R2.json) |
| Cmd+Shift+7 | H1×3，编号1./2./3. | 保留标题类型，新加heading-order标记；不能写成ordered×3 | [R1](./dom/D01-heading1x3-ordered-R1.json)、[R2](./dom/D01-heading1x3-ordered-R2.json) |
| Cmd+Shift+8 | bullet×3 | 三个标题转成三个列表项 | [R1](./dom/D01-heading1x3-bullet-R1.json)、[R2](./dom/D01-heading1x3-bullet-R2.json) |
| 气泡类型→引用 | 一个quote_container含H1×3 | 保留三个标题，不逐块创建三个引用 | [R1](./dom/D01-heading1x3-quote-full-menu-R1.json)、[R2](./dom/D01-heading1x3-quote-full-menu-R2.json) |

所有目标保持页标题777、三段全文、块数量、原业务ID和原外层DOM对象。
类型切换的内部编辑区重建与引用包装的复用须按各JSON核对，不能把外层保持推广为全子树保持。
每轮撤销恢复无编号H1×3；重做恢复对应输出；再次撤销恢复原来源。
有序入口的四步历史须同时核对标题类型和三个编号，只有type字段不能证明该命令无变化。
引用的撤销移除新包装，原三块回到原父级；重做使用新容器对象，不能要求复用已移除包装。
目标及历史的可信键盘/点击事件均保存，未通过内部编辑器命令或正文DOM赋值制造结果。
错误数组与overflow为0；后续静态审计分别核对console记录，不以页面error数组代替全部浏览器日志。
可见云端保存；该来源目标组合尚未独立重载，持久化代表用例已完成，见[保存读取](./04-structures-history-and-persistence.md#req-s04-d08-001-多块保存代表范围)。
项目编辑器未实现或验收，本条只规定可观察合同。

## REQ-S04-D01-006 连续三个H9的六目标

状态：六个具体目标各双轮已验证，来源为飞书实测。
[建样](./dom/D00-homogeneous-heading9-fixture.json)以正文整块全选将H1×3改为H9×3，撤销/重做后保留相同来源。
前置仍为111/222/333及标题777，业务ID51/50/49，三个块同父、没有额外正文。
快捷键范围为111:0→333:3；引用为相同端点的真实拖选与气泡类型菜单。

| 目标 | 两轮输出与区别 | 证据 |
| --- | --- | --- |
| 正文 | text×3 | [R1](./dom/D01-heading9x3-text-R1.json)、[R2](./dom/D01-heading9x3-text-R2.json) |
| H1 | H1×3，三段共同改级别 | [R1](./dom/D01-heading9x3-heading1-R1.json)、[R2](./dom/D01-heading9x3-heading1-R2.json) |
| H9 | text×3，同类目标开关 | [R1](./dom/D01-heading9x3-heading9-R1.json)、[R2](./dom/D01-heading9x3-heading9-R2.json) |
| 有序 | H9×3，新增heading-order编号1./2./3. | [R1](./dom/D01-heading9x3-ordered-R1.json)、[R2](./dom/D01-heading9x3-ordered-R2.json) |
| 无序 | bullet×3 | [R1](./dom/D01-heading9x3-bullet-R1.json)、[R2](./dom/D01-heading9x3-bullet-R2.json) |
| 引用 | 同一个quote_container包装原H9×3 | [R1](./dom/D01-heading9x3-quote-R1.json)、[R2](./dom/D01-heading9x3-quote-R2.json) |

每个目标/撤销/重做/再次撤销均保留三段全文、业务ID、顺序与外层对象；最后恢复无编号H9×3。
有序目标必须同时验收标题类型及编号，不以type未变误判命令没有效果。
引用菜单的实际overlay必要子树与mutation已捕获，R1/R2分别96/98条相关记录，次数本身不是产品要求。
同会话错误数组、被监控console.warn/error调用与overflow均为0；不由此宣称整个Chrome引擎网络日志为空。
已见云端保存；该组尚未独立重载。随后活动Chrome窗口被切换，未把其他页面当作研究文档继续输入。
完整B17导出为13个窗口，早期空切片导出不计功能或证据窗口，已核对完整文件和每个运行编号。

## REQ-S04-D01-007 连续三个有序项的六目标

状态：六个具体目标各双轮已验证，来源为飞书实测。
[建样](./dom/D00-homogeneous-ordered-fixture.json)先将H9×3恢复正文，再建立ordered×3，两个变化分别撤销/重做。
前置为ordered111/222/333，编号1./2./3.，页标题777及业务ID51/50/49保持。
选区真实DOM端点均为111:0→333:3；AX混入第二、三项标记，不用AX编号当作用户文字。
正文R1首次范围校验因AX标记暂停在目标前，核对范围后完成实际转换与三步历史，未伪造重跑。

| 目标 | 双轮输出及编号 | 证据 |
| --- | --- | --- |
| 正文 | text×3，移除原列表标记 | [R1](./dom/D01-orderedx3-text-R1.json)、[R2](./dom/D01-orderedx3-text-R2.json) |
| H1 | H1×3，标题编号1./2./3. | [R1](./dom/D01-orderedx3-heading1-R1.json)、[R2](./dom/D01-orderedx3-heading1-R2.json) |
| H9 | H9×3，标题编号1./2./3. | [R1](./dom/D01-orderedx3-heading9-R1.json)、[R2](./dom/D01-orderedx3-heading9-R2.json) |
| 有序 | text×3，同类开关解除列表 | [R1](./dom/D01-orderedx3-ordered-R1.json)、[R2](./dom/D01-orderedx3-ordered-R2.json) |
| 无序 | bullet×3，改为无序标记 | [R1](./dom/D01-orderedx3-bullet-R1.json)、[R2](./dom/D01-orderedx3-bullet-R2.json) |
| 引用 | 一个quote_container内ordered×3，仍为1./2./3. | [R1](./dom/D01-orderedx3-quote-R1.json)、[R2](./dom/D01-orderedx3-quote-R2.json) |

每轮目标、撤销、重做、再次撤销均保留三段全文、业务ID和原外层；最后恢复ordered×3及1./2./3.。
引用两轮捕获真实overlay菜单，不把三项分别包成三个引用；所有窗口错误数组和overflow为0。
类型切换、标题编号、引用父级与原范围须分别验收，不能只按目标名称判断输出。
此组尚未独立重载；[另一次新标签读取](./dom/D08-newtab-saved-H9-read.json)只确认此前保存的H9×3，不能冒充本组持久化。

## REQ-S04-D01-008 连续三个无序项的六目标

状态：六个具体目标各双轮已验证，来源为飞书实测。
[建样](./dom/D00-homogeneous-bullet-fixture.json)以正文整块全选将原ordered×3改为bullet×3，含撤销/重做。
固定标题777、正文111/222/333及业务ID51/50/49，实际Range为111:0→333:3。

| 目标 | 双轮输出 | 证据 |
| --- | --- | --- |
| 正文 | text×3 | [R1](./dom/D01-bulletx3-text-R1.json)、[R2](./dom/D01-bulletx3-text-R2.json) |
| H1 | H1×3，没有从无序标记生成标题编号 | [R1](./dom/D01-bulletx3-heading1-R1.json)、[R2](./dom/D01-bulletx3-heading1-R2.json) |
| H9 | H9×3，没有从无序标记生成标题编号 | [R1](./dom/D01-bulletx3-heading9-R1.json)、[R2](./dom/D01-bulletx3-heading9-R2.json) |
| 有序 | ordered×3，编号1./2./3. | [R1](./dom/D01-bulletx3-ordered-R1.json)、[R2](./dom/D01-bulletx3-ordered-R2.json) |
| 无序 | text×3，同类开关解除列表 | [R1](./dom/D01-bulletx3-bullet-R1.json)、[R2](./dom/D01-bulletx3-bullet-R2.json) |
| 引用 | 一个quote_container内bullet×3 | [R1](./dom/D01-bulletx3-quote-R1.json)、[R2](./dom/D01-bulletx3-quote-R2.json) |

各目标及三步历史保持正文全文、块数量、原外层身份和业务ID，最后回bullet×3；标题777不参与。
无序转标题与有序转标题的编号结果不同，复刻时须保留来源差异。
引用两轮完整overlay菜单均入同一运行窗口，错误数组与overflow为0；独立重载尚未执行。

## REQ-S04-D01-009 同一个引用内三段正文的六目标

状态：六个具体目标各双轮已验证，来源为飞书实测。
[建样](./dom/D00-homogeneous-quote-fixture.json)先将bullet×3恢复正文，再用同一个引用包装，建样变化分别撤销/重做。
正文111/222/333及业务ID51/50/49保持；引用来源指一个quote_container内的三段text，不虚构quote类型文字块。
四个变化快捷键目标为111:0→333:3，选中三段后改变子块类型，原引用父级保留。

| 目标 | 双轮输出与范围 | 证据 |
| --- | --- | --- |
| 正文 | 三段仍为text，仍在原引用内 | [R1](./dom/D01-quotex3-text-noop-history-R1.json)、[R2](./dom/D01-quotex3-text-noop-history-R2.json) |
| H1 | 原引用内H1×3 | [R1](./dom/D01-quotex3-heading1-R1.json)、[R2](./dom/D01-quotex3-heading1-R2.json) |
| H9 | 原引用内H9×3 | [R1](./dom/D01-quotex3-heading9-R1.json)、[R2](./dom/D01-quotex3-heading9-R2.json) |
| 有序 | 原引用内ordered×3，编号1./2./3. | [R1](./dom/D01-quotex3-ordered-R1.json)、[R2](./dom/D01-quotex3-ordered-R2.json) |
| 无序 | 原引用内bullet×3 | [R1](./dom/D01-quotex3-bullet-R1.json)、[R2](./dom/D01-quotex3-bullet-R2.json) |
| 引用 | 移除共同引用包装，三段text回原外部父级 | [R1](./dom/D01-quotex3-quote-R1.json)、[R2](./dom/D01-quotex3-quote-R2.json) |

正文无变化窗口先在完整原范围执行Cmd+Option+0，再在333末端输入X，重新选中后再执行同一正文命令。
随后一次撤销去掉X、重做恢复X、再次撤销去掉X；引用父级不变，没有多出一个无变化命令的撤销层。
输入对照的第二个范围真实止于333X:4，不与第一次111:0→333:3混写；两轮均保留全部实际事件。
四个类型变化目标每轮撤销/重做/再次撤销恢复原引用内text×3；页标题777和正文业务ID保持。
引用同类菜单的撤销重建包装，重做解除、再次撤销再包装；不要求恢复被移除引用的同一DOM对象或同一包装ID。
引用R1在第一次撤销后被用户中断，接续核对URL、活动窗口及实际结构后完成剩余两步，interruption字段保存该事实。
R2是独立完整窗口，两个目标前的实际范围与菜单入口相同；不将中断等待解释成菜单处理时延。
完整B21导出含13窗口；原未完成导出不计入交付。错误数组及overflow为0，独立重载尚未执行。

## REQ-S04-D01-010 正文同类无变化历史与菜单监控补齐

状态：正文同类命令的输入历史双轮、三正文引用及混合引用的完整菜单双轮均已验证。
[恢复记录](./dom/D00-resume-remove-extra-empty-after-quote.json)保留接续时额外空段的移除与历史；其来源未知，不追溯改写此前用例。
[失败准备](./dom/D00-quote-to-text3-preparation-failed.json)只有整块引用选择，没有目标转换，不计有效窗口。
[严格三正文建样](./dom/D00-quote-to-text3-fixture-valid.json)解除引用并验证撤销/重做后，三块仍为111/222/333、ID51/50/49。
正文同类：[R1](./dom/D01-textx3-text-noop-history-R1.json)、[R2](./dom/D01-textx3-text-noop-history-R2.json)。
每轮先在111:0→333:3执行正文命令，正文与范围无变化；再输入X，全文选择到333X:4后重复正文命令。
一次撤销移除X、重做恢复X、再次撤销移除X；最终回到顶层三正文，没有额外的无变化撤销层。
三正文引用完整菜单：[R1](./dom/D01-textx3-quote-full-menu-R1.json)、[R2](./dom/D01-textx3-quote-full-menu-R2.json)。
两轮同范围同菜单包装原三段；原较早三正文引用正文DOM结果保留，本批补齐同窗口实际overlay证据。
[混合来源重建](./dom/D00-mixed3-menu-supplement-fixture.json)为H1 111/text222/bullet333，两个变化分别撤销/重做。
混合引用完整菜单：[R1](./dom/D01-mixed3-quote-full-menu-R1.json)、[R2](./dom/D01-mixed3-quote-full-menu-R2.json)。
仍只有一个共同引用，三种子块类型、文字、业务ID及外层身份保留；三步历史恢复原混合来源。
本批错误数组及overflow为0；项目实现与独立重载另验收。

## 后续来源登记

| 连续来源 | 六目标状态 | 当前结论边界 |
| --- | --- | --- |
| text×3 | 六目标双轮 | D01-001–003及D01-010，同类无变化历史已补 |
| H1×3 | 六目标双轮 | 见D01-005 |
| H9×3 | 六目标双轮 | 见D01-006，独立实测 |
| ordered×3 | 六目标双轮 | 见D01-007，含标题编号与同类开关 |
| bullet×3 | 六目标双轮 | 见D01-008，含无编号标题与同类开关 |
| quote内text×3 | 六目标双轮 | 见D01-009，区分子块类型与共同包装 |

## 证据读取与验收

每个JSON使用objects字典去重，递归展开唯一$obj键即可还原原始窗口。
sha256针对规范化后窗口计算；DOM标识规范化为maiya，URL及用户文字保持原义。
同一会话引用可以比较身份，跨会话不得直接比较同名引用。
MutationObserver回调时读到的value不伪称每次属性写入瞬间的值。
早期H1引用窗口只监听旧popup节点，菜单DOM未捕获；原记录保留，正式引用链接改为overlay补证双轮。
补证窗口仅去掉BODY mutation目标的重复整页HTML，保留引用、属性和真实overlay子树，筛选口径写入evidenceFilter。
引用补证窗口同时保留真实弹层及必要菜单变更；几何坐标属于本次环境，不是产品固定常量。
H1×3有序目标必须检查heading-order button的1./2./3.，不借AX文字猜测DOM结构。
历史序列必须逐动作断言，不只比较整个窗口首尾。
六类来源×六目标共36格、另混合六目标，共42格各双轮的选区、类型、内容、身份及历史语义审计通过。
保存代表范围另有H9、有序、引用各双轮的Chrome与夸克刷新；未宣称每格都独立重载。
最终D01状态与证据范围统一维护在[运行矩阵](./04-verification-matrix.md)。
