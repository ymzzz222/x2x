# S05 标题层级与跨层范围

来源为 2026-10-19 指定 Chrome 页面实操，会话 S05-1792372930707。
本文件补充[阶段需求](./05-nesting-and-combinations.md)，只描述实际范围，不扩大为任意深度全组合。
H1/H9 共同行为实际验证，H2–H8 仅按 sir 已授权抽样推断。

## REQ-S05-E01-004 标题与正文的真实嵌套

H1 TOP、H9 SUB、正文 LEAF、外部 H1 NEXT 和正文 END 为基线。
标题级别本身不会让同级 DOM 自动变为父子；初始五段都为顶层。
SUB 行首 Tab 后成为 TOP 后代，类型仍为 H9；撤销、重做、再次撤销恢复相应层级。
同前置双轮：[R1](./dom/E01-heading9-tab-under-heading1-R1.json)、[R2](./dom/E01-heading9-tab-under-heading1-R2.json)。
正文先区分首行缩进属性与父子嵌套，不能只看光标横向位移。
[R1](./dom/E01-body-tab-into-heading-valid-R1.json)、[R2](./dom/E01-body-tab-into-heading-valid-R2.json)的前置为无首行缩进的 LEAF，Tab 只添加 text-block 的 text-indent 类，父级仍为 TOP。
早期 body-tab-nochange-R1/R2 实际从已有首行缩进建立不同层级，名字不代表结果；保留为探查，不计同条件双轮。
末次审计用最小样例 TPARENT H1 / TCHILD text / OUTSIDE text 补齐严格前置。
TCHILD 已有 text-indent 且同级时，再按 Tab 才成为 TPARENT 后代；首行缩进属性保留。
同条件双轮：[R1](./dom/E01-indented-body-tab-nesting-R1.json)、[R2](./dom/E01-indented-body-tab-nesting-R2.json)。

气泡“缩进和对齐→增加缩进”对相同 LEAF 前置也创建 SUB 后代：
[R1](./dom/E01-menu-indent-body-R1.json)、[R2](./dom/E01-menu-indent-body-R2.json)。
“减少缩进”则从 SUB 后代提升为 SUB 的同级，仍属 TOP：
[R1](./dom/E01-menu-lift-body-R1.json)、[R2](./dom/E01-menu-lift-body-R2.json)。
菜单两方向各有创建/提升、撤销、重做、再次撤销的真实操作和 DOM。
正文 Shift+Tab 的首行缩进前置：[R1](./dom/E01-body-shiftTab-R1.json)、[R2](./dom/E01-body-shiftTab-R2.json)。
两轮均移除 text-indent，保持 LEAF 的原两层祖先；撤销恢复该属性，重做移除，再次撤销恢复。
已有父项且无 text-indent 时，Shift+Tab 才提升一层：
[R1](./dom/E01-unindented-body-shiftTab-lift-R1.json)、[R2](./dom/E01-unindented-body-shiftTab-lift-R2.json)。
这两轮从 TPARENT 内的 TCHILD 开始，目标为同级 text；外部 OUTSIDE 不变，撤销重做恢复相应层级。
菜单减少缩进直接提升层级并保留原首行缩进，与键盘先取消该属性的路径分别验收。
十五层有序 Shift+Tab 的已验证合同仍见阶段正文，不与正文非列表条件混同。

## REQ-S05-E04-001 标题升降级保留已有后代

TOP H1 含 SUB H9，外部 LEAF/NEXT/END 不在该父项内时：
- TOP 按 Cmd+Option+9 成为 H9，SUB 仍在其内，即允许 H9 下保留 H9。
- SUB 按 Cmd+Option+1 成为 H1，仍在 TOP 内，即允许 H1 下保留 H1。
- 级别变化不自动提升、扁平化或把正文并入相邻标题，文字和外层身份保持。

父项降级：[R1](./dom/E04-lower-parent-R1.json)、[R2](./dom/E04-lower-parent-R2.json)。
子项升级：[R1](./dom/E04-raise-child-R1.json)、[R2](./dom/E04-raise-child-R2.json)。
每个方向均验证撤销、重做、再次撤销；第二轮曾遇工具调用超时，核对 active 无目标按键后才补完，不重复执行已发生的转换。

## REQ-S05-E04-002 编号标题与普通标题并存

Cmd+Shift+7 可给 H1 添加编号并保留 heading1 类型；此后再按同级 H1 快捷键会取消标题，留下 ordered。
[建样探查](./dom/E00-numbered-parent-heading-fixture.json)保留这段实际过程，不能误写为连续命令无故恢复错误。
[有效前置](./dom/E00-numbered-heading1-valid-fixture.json)从 ordered 恢复编号 H1，外部 NEXT 为普通 H1。
编号 H1 TOP 含 SUB H9 和 LEAF 正文，转换 TOP 到 H9 后编号和后代均保持，NEXT 仍为无编号 H1。
同条件双轮：[R1](./dom/E04-numbered-heading1-to9-valid-R1.json)、[R2](./dom/E04-numbered-heading1-to9-valid-R2.json)。
原 numbered-parent-lower-R1/R2 实际来源为 ordered，不计本条编号 H1 的双轮。

## REQ-S05-E05-001 最深项与父项文字范围

只在 LEAF 行首按有序快捷键：[R1](./dom/E05-deepest-child-ordered-R1.json)、[R2](./dom/E05-deepest-child-ordered-R2.json)。
LEAF 成为 ordered，并归入前面的 SUB 内；TOP、SUB 自身和外部 NEXT/END 类型保持。
这条记录了附加层级修复，不能写成只改类型、所有父级绝不变化。
只在 TOP 行首按正文快捷键：[R1](./dom/E05-parent-text-command-R1.json)、[R2](./dom/E05-parent-text-command-R2.json)。
TOP 成为 text，SUB/LEAF 继续位于该 text 父块中；未选后代不一并变为正文，不丢失外部两块。
两条代表映射均核对目标、撤销、重做、再次撤销和全文。

## REQ-S05-E05-002 整个父项与部分后代的范围

选中 TOP/SUB/LEAF 全文，通过气泡“引用”转换：
[R1](./dom/E05-parent-subtree-quote-valid-R1.json)、[R2](./dom/E05-parent-subtree-quote-valid-R2.json)。
一个共同 quote_container 包住 TOP 及其原后代；内部类型、层级与外部 NEXT/END 保持。
只选 SUB/LEAF 的全文，通过气泡“无序列表”转换：
[R1](./dom/E05-partial-descendants-bullet-R1.json)、[有效R2](./dom/E05-partial-descendants-bullet-valid-R2.json)。
TOP 仍为 H1；SUB/LEAF 分别成为 bullet，LEAF 归 SUB 下；原本只共享 TOP 的结构发生了附加嵌套修复。
[未执行R2](./dom/E05-partial-descendants-bullet-R2.json)因菜单动画中的坐标超出窗口而未点击目标，保留但不算复测。
两类正式范围均经过单次撤销/重做/再次撤销，恢复各自的原父子结构。

## REQ-S05-E05-003 固定三层混合范围

明确前置为 TOP H1→SUB H9→LEAF text，另有外部 NEXT H1/END text。
通过键盘从 TOP:0 跨 SUB 扩选到 LEAF 全文，确认选中文字包含三段且不含 NEXT/END，再按 H9 快捷键。
[有效R1](./dom/E05-cross-level-heading9-valid-R1.json)、[有效R2](./dom/E05-cross-level-heading9-valid-R2.json)。
三块均变为 H9，原三层结构保留，外部两块不变；撤销和重做分别恢复原类型或三 H9。
旧 cross-level-heading9-R1/R2 的前置或真实范围不同，不作为这组双轮；只依据实际目标键前 Range 判定覆盖。

## REQ-S05-E03-004 引用内再次引用是取消包装

有序 LEAF 位于 quote_container→SUB H9→TOP H1 内。
引用包含有序的斜杠创建：[R1](./dom/E03-quote-contains-ordered-R1.json)、[R2](./dom/E03-quote-contains-ordered-R2.json)。
原 ordered、文字和其他父级保持；撤销返回带 `/` 的原块，重做恢复包装，再次撤销后删除 `/` 回原前置。
已有引用内，气泡类型菜单仍显示“引用”：
[R1](./dom/E03-quote-bubble-nested-menu-R1.json)、[R2](./dom/E03-quote-bubble-nested-menu-R2.json)。
点击后移除当前 quote_container，ordered LEAF 继续属于 SUB；没有创建第二层引用。
撤销恢复单层引用，重做取消，再次撤销恢复；与引用内斜杠菜单不提供引用项的结果按入口分别验收。

## REQ-S05-E07-002 删除父行至子项零偏移

前置为 text TOP→H9 SUB→quote_container→ordered LEAF，外部 NEXT/END。
从 TOP:0 向下扩选到 SUB:0，AX 仅含 TOP 文字，真实 Range 端点保留在 JSON。
[R1](./dom/E07-delete-parent-to-child-zero-R1.json)、[R2](./dom/E07-delete-parent-to-child-zero-R2.json)。
Backspace 后 TOP 文字移除，SUB 文字进入顶层 text，原 SUB 的标题壳消失；引用及有序 LEAF 保留在该 text 下。
TOP 的原外层对象及业务 ID 复用，SUB 原外层被移除；不是新建一个同名正文再删除两块。
不能把此手势当作只删除文字且结构不变，也不能把保留的子项误报为级联丢失。
一次撤销恢复完整 TOP/SUB 层级与标题，一次重做恢复合并，再次撤销恢复原样；外部 NEXT/END 始终不变。
父项手柄/整块入口未成功的尝试另保留，不用它们冒充本条真实边界删除。
