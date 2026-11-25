# S05 复杂样例与组合历史

本文件接续[阶段需求](./05-nesting-and-combinations.md)，来源为 2026-10-19 指定 Chrome 页面实操。
复杂样例六目标及组合历史各双轮已完成；两轮有效独立持久化读取已核对，首轮附加末空段异常单列。

## REQ-S05-E06-001 固定混合样例

正文七块按顺序为 HROOT、ORDER、BULLET、PLAIN/SOFT、空块、HDEEP、END。
前三块为 H1→ordered→quote_container→bullet；PLAIN/SOFT 为一个 text 块内两条 ace-line，SOFT 带行内加粗。
空 text 块位于软换行正文与 H9 HDEEP 之间；END 为不参与转换的外部 text。
页标题为空。软换行不是两个逻辑块，不能只比较 textContent 中有无换行字符。
建样证据：[七块](./dom/E00-complex-seven-block-fixture.json)、[类型](./dom/E00-complex-types-fixture.json)、[嵌套](./dom/E00-complex-nesting-fixture.json)、[引用](./dom/E00-complex-quote-fixture.json)、[软换行](./dom/E00-complex-softline-fixture.json)、[加粗](./dom/E00-complex-bold-fixture.json)。
每个目标使用 HROOT 全文起点至 HDEEP 全文终点，包含中间空块，排除 END。
再次拖选前先在末块空白区清除旧选区，避免拖动已选文字；实际端点仍以目标点击前 Range 为准。

## REQ-S05-E06-002 六目标及部分作用

操作均为真实气泡类型菜单；H9 使用“其他标题→九级标题”。
每轮转换后执行一次撤销、一次重做、再次撤销，恢复同一混合基线。

| 目标 | 实际作用 | 双轮证据 |
| --- | --- | --- |
| 正文 | 六个选中逻辑块均为 text，原引用与父子层级保留 | [R1](./dom/E06-complex-text-R1.json)、[R2](./dom/E06-complex-text-R2.json) |
| H1 | 六块均为 heading1，空块也成为空 H1，层级不扁平化 | [R1](./dom/E06-complex-heading1-R1.json)、[R2](./dom/E06-complex-heading1-R2.json) |
| H9 | 六块均为 heading9，原层级与引用保持 | [R1](./dom/E06-complex-heading9-R1.json)、[R2](./dom/E06-complex-heading9-R2.json) |
| 有序 | 两个标题仍为 H1/H9 并带编号，其他选中块为 ordered | [R1](./dom/E06-complex-ordered-R1.json)、[R2](./dom/E06-complex-ordered-R2.json) |
| 无序 | 六块均为 bullet，原父子及引用保持 | [R1](./dom/E06-complex-bullet-R1.json)、[R2](./dom/E06-complex-bullet-R2.json) |
| 引用 | 仅顶层 PLAIN、空块、HDEEP 共用新增引用；含既有引用后代的 HROOT 子树不再包装 | [R1](./dom/E06-complex-quote-R1.json)、[R2](./dom/E06-complex-quote-R2.json) |

有序目标与无序目标对标题类型的处理不同，不把两者合并为“清除标题后统一列表”。
引用目标属于部分作用，两轮均未嵌套包装原引用，也未将未作用子树移除；不能写成全部六块共同引用成功。
这组行为的来源是实际目标菜单，不用快捷键推导菜单结果。
六目标的四步状态均保留七个原逻辑块、全文、顺序、PLAIN 的两条 ace-line、SOFT 的 bold 格式及外部 END。
空块不因转换而吞并、额外产生或丢失；恢复后仍位于 PLAIN 和 HDEEP 之间。
外层对象身份和 data-block-id 按同会话窗口核对，内部编辑区允许按真实记录重建。
H2–H8 共同行为仅沿用 sir 已授权抽样，不冒充本次实测。

## REQ-S05-E08-001 顺序组合与各中间状态

前置为 E06 的完整混合样例；同范围依次选择 H9、有序列表、正文，每步后读取真实结构并重建范围。
[R1](./dom/E08-complex-sequence-R1.json)、[R2](./dom/E08-complex-sequence-R2.json)。
每轮 checkpoints 分别保留 heading9、ordered、text 三个中间状态。
第一步六块均为 H9；第二步保留这六个 H9 并加有序编号；第三步六块转 text。
之后三次撤销逐步回有序 H9、无新增编号的 H9、原始混合结构。
三次重做按相反路径到正文，再次三次撤销回原始结构；不是只检查末态。
全文、空块、软换行、加粗、内部引用及外部 END 均作为每个中间状态的验收内容。
本组使用每步读状态并重选的分隔条件，不推导未实测的内部历史合并时间常量。
原始窗口保留可信菜单点击、各 KeyZ 及必要 DOM 变化，失败的建选尝试不计目标转换次数。

## REQ-S05-E07-003 首项缩进菜单不可用并有提示

选中最前方 H1 HROOT 的全文，通过气泡“缩进和对齐→增加缩进”。
[R1](./dom/E07-first-heading-menu-refusal-R1.json)、[R2](./dom/E07-first-heading-menu-refusal-R2.json)。
两轮均出现“无法缩进当前内容块”，结构、全文、已有后代和外部块不变。
notices 字段保存 ud__tooltip-no-entry 内 role=tooltip 的真实 DOM；这是不可用入口的提示，不伪造执行命令后服务端拒绝。
这是无可用父项条件，不是最大深度条件；没有实际正文修改，不伪造独立撤销单位。
最大深度继续按 sir 的“无上限，不继续探究”决定处理，十五层记录仍只证明实测下界。

## REQ-S05-E09-001 独立保存与恢复

菜单与局部历史验证结束时恢复 E06 混合基线，以外部 END 标记保存版本，其他六块保持不动。
每轮对标记修改执行撤销/重做，确认“已经保存到云端”，再真实刷新 Chrome 与夸克指定文档。
夸克仅只读核对，每轮恢复“剧本 · 跳跃视界”标签；不在夸克执行功能转换。
每次读取前直接验证旧 __s5 不存在，加载后才安装只读观察器；不声称捕获了加载期间的 mutation。

| 版本 | 保存窗口 | Chrome 刷新读取 | 夸克刷新读取 | 判定 |
| --- | --- | --- | --- | --- |
| END-P1 | [窗口](./dom/E09-persist-complex-save-R1.json) | [读取](./dom/E09-persist-complex-R1-Chrome-read.json) | [读取](./dom/E09-persist-complex-R1-Quark-read.json) | 两端均多一个末空段，不计通过 |
| END-P2 | [窗口](./dom/E09-persist-complex-save-R2.json) | [读取](./dom/E09-persist-complex-R2-Chrome-read.json) | [读取](./dom/E09-persist-complex-R2-Quark-read.json) | 七块、层级、标记、样式及格式一致 |
| END-P3 | [窗口](./dom/E09-persist-complex-save-R3.json) | [读取](./dom/E09-persist-complex-R3-Chrome-read.json) | [读取](./dom/E09-persist-complex-R3-Quark-read.json) | 同上；另核对导出间隙无新增 |

第二、三轮分别读取各自的新版本，不用读取到旧本地缓存冒充保存恢复。
两轮正文、data-record-id、父级记录、原引用、列表标记、计算样式、两条 ace-line、SOFT 加粗及中间空块均逐项对应。
跨加载以正文、类型、data-record-id、父级、标记和格式对应，不比较不同观察器的 n 引用。
第三轮另有[导出后扫描](./dom/E09-persist-R3-postexport-scan.json)，仍为七块及 END-P3。

### 首轮末空段异常

首轮保存窗口为七块，重载读取为八块，新增末空段有独立 data-record-id，Chrome 与夸克读取到同一个记录。
保存窗口结束至首轮重载读取之间未全程捕获动作，不能把新增空段归因为刷新、同步协议或功能命令。
[删除该空段](./dom/E09-persist-R2-remove-trailing-empty.json)独立验证撤销/重做，随后第二、三轮均未复现。
首轮为保留的异常/未通过记录；两轮正常结果不抹掉它，也不支持“任意保存场景绝不新增块”的普遍保证。
这段未完整观测的间隙继续作为后续保存与故障验收线索，不虚构根因或将其计入通过数。

## REQ-S05-E09-002 合法结构与入口限制

| 实测关系或操作 | 结果与依据 | 限制和恢复 |
| --- | --- | --- |
| ordered/bullet 四种父子组合 | 类型独立，父项和子项可分别转换；见阶段正文 E02 | 两层代表双轮，不推导任意属性全组合 |
| H1/H9 含标题、正文或列表 | 改变级别后仍可保留同级别、跳级和混合后代；见标题文档 E01/E04/E05 | 级别不等同于 DOM 嵌套，全部有局部历史 |
| text 含 H9/text/引用 | 父项转正文、删除边界合并后仍保留后代；见 E05-001/E07-002 | 原外层复用、被删除子壳及提升范围按 JSON 核对 |
| 列表含引用，引用含有序/无序/标题/正文 | 既有类型保留或在引用内转换；见阶段正文 E03、标题文档 E03、复杂样例六目标 | 引用包装与内部类型分开验收 |
| 已引用块再次选“引用” | 气泡取消当前包装；斜杠不提供引用项 | 恢复单层引用或删除临时斜杠，不编造第二层引用 |
| 混选含既有引用后代，再转引用 | 含引用的原子树不加新包装，仅合法顶层范围形成引用 | 部分修改范围和历史已双轮记录；不编造未采集的额外错误提示 |
| 列表首项 Tab | 无可用前项，不加深 | 无正文修改，不虚构独立撤销单位 |
| 首项 H1 菜单增加缩进 | 不可用且有“无法缩进当前内容块”tooltip | 没有正文修改；不混作最大深度限制 |
| 深度边界 | 实测十五层有序，sir 决定无固定上限并停止探查 | 不宣称已经验证无限深度；十五层反缩进双轮保留 |

以上覆盖本阶段指定创建、转换及父子关系；外部粘贴、移动、协同等入口继续归各自后续阶段。

## 清理与交付边界

[主样例清理](./dom/E00-S05-final-cleanup.json)和[审计补测清理](./dom/E00-S05-final-audit-cleanup.json)分别验证删除、撤销恢复及重做清空，并确认云端保存。
[最终刷新读取](./dom/E00-S05-final-audit-empty-reload-read.json)时间为北京时间 2026-10-19 10:23:48，旧观察器不存在，正文为空，仅空页标题哨兵。
读取导出后停止并删除观察器，Chrome 控制台已关闭；夸克保持原剧本项目标签。
151 个窗口包含建样、失败、异常和只读读取；38 组双轮经过语义审计，不等于 151 个功能通过。
飞书内部持久化协议、服务端事务和失败重试规则不从 DOM 推断。
项目代码、本地构建及项目生产 UI 验收均未在本阶段执行。
