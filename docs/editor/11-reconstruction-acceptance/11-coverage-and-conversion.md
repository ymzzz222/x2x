# S11 范围与转换索引

来源为总清单及S01–S10既有合同。本页分配来源，不新增飞书实测或项目运行通过数。

## 项目能力逐项映射

总清单原表19项逐项保留；路径仅为项目静态来源，不证明实现通过。

| 索引 | 原能力 | 合同与边界 |
| --- | --- | --- |
| CAP01 | 文本、H1 至 H9、无序、有序、引用 | [合同](../02-creation-and-editing/02-verification-matrix.md)、[边界](../03-single-block-conversion/03-reachability-and-properties.md)；S02/S03，项目运行未验收 |
| CAP02 | 页标题、正文壳、空文档默认块、占位符、块身份 | [合同](../01-baseline-and-dom/01-verification-matrix.md)、[边界](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md)；S01/S02/S08/S10，项目运行未验收 |
| CAP03 | 标题编号、编号与文字区域、层级编号同步 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[边界](../06-numbering-folding-and-outline/06-verification-matrix.md)；S03/S06，项目运行未验收 |
| CAP04 | 标题折叠、展开、目录导航 | [合同](../05-nesting-and-combinations/05-headings-and-ranges.md)、[边界](../06-numbering-folding-and-outline/06-verification-matrix.md)；S05/S06，项目运行未验收 |
| CAP05 | 列表嵌套、合并、续编号、重新开始、标记形态 | [合同](../05-nesting-and-combinations/05-verification-matrix.md)、[边界](../06-numbering-folding-and-outline/06-verification-matrix.md)；S05/S06，项目运行未验收 |
| CAP06 | Enter、软换行、Tab、反缩进、删除、全选、保存快捷键 | [合同](../02-creation-and-editing/02-verification-matrix.md)、[边界](../09-undo-redo-and-history-boundaries/09-history-contracts.md)；S02/S07/S08/S09，项目运行未验收 |
| CAP07 | 块手柄、加号、斜杠菜单、块菜单、选区气泡 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[边界](../07-menus-and-shortcuts/07-verification-matrix.md)；S02/S03/S07/S08，项目运行未验收 |
| CAP08 | 全选、跨块选区、保留选区高亮、光标恢复 | [合同](../04-multi-block-conversion/04-selection-boundaries.md)、[边界](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md)；S02/S04/S08，项目运行未验收 |
| CAP09 | 加粗、斜体、删除线、下划线、链接、颜色、背景色 | [合同](../03-single-block-conversion/03-format-preservation.md)、[边界](../08-deletion-movement-formatting-and-clipboard/08-formatting-contracts.md)；S03/S07/S08，项目运行未验收 |
| CAP10 | 左中右对齐、文本与列表缩进 | [合同](../05-nesting-and-combinations/05-headings-and-ranges.md)、[边界](../08-deletion-movement-formatting-and-clipboard/08-formatting-contracts.md)；S03/S05/S08，项目运行未验收 |
| CAP11 | 复制、剪切、粘贴、外部格式清理 | [合同](../02-creation-and-editing/02-unicode-editing.md)、[边界](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md)；S02/S08，项目运行未验收 |
| CAP12 | 查找、上一项下一项、替换、全部替换 | [合同](../06-numbering-folding-and-outline/06-verification-matrix.md)、[边界](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)；S06/S10，项目运行未验收 |
| CAP13 | 自动保存、手动保存、字数与粘贴限制 | [合同](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；S08/S10，项目运行未验收 |
| CAP14 | 协同、连接状态、远程光标、本地撤销隔离 | [合同](../09-undo-redo-and-history-boundaries/09-history-contracts.md)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；S06/S09/S10，项目运行未验收 |
| CAP15 | 批注、修订与编辑模式 | [合同](../03-single-block-conversion/03-format-preservation.md)、[边界](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)；S03/S10，项目运行未验收 |
| CAP16 | AI 选区交互、预览、采纳替换、生成时只读锁 | [合同](../09-undo-redo-and-history-boundaries/09-remaining-acceptance-map.json)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；J07/J11专项，项目运行未验收 |
| CAP17 | 历史版本展示、比较、恢复与会话重建 | [合同](../09-undo-redo-and-history-boundaries/09-history-contracts.md)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；S09/J10专项，项目运行未验收 |
| CAP18 | 导入导出、正文与嵌入编辑器、模块切换 | [合同](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；J09/J12/J19/J23专项，项目运行未验收 |
| CAP19 | 权限、只读分享、文档切换、窄屏与滚动定位 | [合同](../07-menus-and-shortcuts/07-verification-matrix.md)、[边界](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)；S07/J07/J08/J12/J22专项，项目运行未验收 |

## 13×13命令映射

169格分成30个异类实测、6个同类实测、126个异类授权推断、7个同类授权推断；格子数不是功能通过数。
目标是命令，不是输出类型。编号标题、引用内子块、同类开关与默认来源必须分开解释。
气泡六类默认来源的机器属性来源为[C08表](../03-single-block-conversion/dom/C08-attribute-summary.json)。
中间级别只引用授权推断，不填写不存在的实际运行。

| 单元 | 来源→目标命令 | 状态 | 实际输出或边界 | 来源 |
| --- | --- | --- | --- | --- |
| CONV-01-01 | 正文→正文 | 实测代表 | 正文无可见转换；另用已知输入历史核对无额外步骤 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-case-menu-text.json) |
| CONV-01-02 | 正文→H1 | 实测代表 | heading1 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-text-heading1.json) |
| CONV-01-03 | 正文→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-04 | 正文→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-05 | 正文→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-06 | 正文→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-07 | 正文→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-08 | 正文→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-09 | 正文→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-01-10 | 正文→H9 | 实测代表 | heading9 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-text-heading9.json) |
| CONV-01-11 | 正文→有序 | 实测代表 | ordered；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-text-ordered.json) |
| CONV-01-12 | 正文→无序 | 实测代表 | bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-text-bullet.json) |
| CONV-01-13 | 正文→引用 | 实测代表 | quote_container > text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-text-quote.json) |
| CONV-02-01 | H1→正文 | 实测代表 | text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading1-text.json) |
| CONV-02-02 | H1→H1 | 实测代表 | 当前同类命令切回正文；编号等非默认属性另验 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-case-menu-heading1.json) |
| CONV-02-03 | H1→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-04 | H1→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-05 | H1→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-06 | H1→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-07 | H1→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-08 | H1→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-09 | H1→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-02-10 | H1→H9 | 实测代表 | heading9 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading1-heading9.json) |
| CONV-02-11 | H1→有序 | 实测代表 | heading1；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading1-ordered.json) |
| CONV-02-12 | H1→无序 | 实测代表 | bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading1-bullet.json) |
| CONV-02-13 | H1→引用 | 实测代表 | quote_container > heading1 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading1-quote.json) |
| CONV-03-01 | H2→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-02 | H2→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-03 | H2→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-04 | H2→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-05 | H2→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-06 | H2→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-07 | H2→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-08 | H2→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-09 | H2→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-10 | H2→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-11 | H2→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-12 | H2→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-03-13 | H2→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-01 | H3→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-02 | H3→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-03 | H3→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-04 | H3→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-05 | H3→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-06 | H3→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-07 | H3→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-08 | H3→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-09 | H3→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-10 | H3→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-11 | H3→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-12 | H3→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-04-13 | H3→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-01 | H4→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-02 | H4→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-03 | H4→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-04 | H4→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-05 | H4→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-06 | H4→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-07 | H4→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-08 | H4→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-09 | H4→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-10 | H4→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-11 | H4→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-12 | H4→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-05-13 | H4→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-01 | H5→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-02 | H5→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-03 | H5→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-04 | H5→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-05 | H5→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-06 | H5→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-07 | H5→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-08 | H5→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-09 | H5→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-10 | H5→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-11 | H5→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-12 | H5→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-06-13 | H5→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-01 | H6→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-02 | H6→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-03 | H6→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-04 | H6→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-05 | H6→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-06 | H6→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-07 | H6→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-08 | H6→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-09 | H6→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-10 | H6→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-11 | H6→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-12 | H6→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-07-13 | H6→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-01 | H7→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-02 | H7→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-03 | H7→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-04 | H7→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-05 | H7→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-06 | H7→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-07 | H7→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-08 | H7→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-09 | H7→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-10 | H7→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-11 | H7→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-12 | H7→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-08-13 | H7→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-01 | H8→正文 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-02 | H8→H1 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-03 | H8→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-04 | H8→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-05 | H8→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-06 | H8→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-07 | H8→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-08 | H8→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-09 | H8→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-10 | H8→H9 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-11 | H8→有序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-12 | H8→无序 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-09-13 | H8→引用 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-01 | H9→正文 | 实测代表 | text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading9-text.json) |
| CONV-10-02 | H9→H1 | 实测代表 | heading1 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading9-heading1.json) |
| CONV-10-03 | H9→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-04 | H9→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-05 | H9→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-06 | H9→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-07 | H9→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-08 | H9→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-09 | H9→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-10-10 | H9→H9 | 实测代表 | 当前同类命令切回正文；编号等非默认属性另验 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-case-menu-heading9.json) |
| CONV-10-11 | H9→有序 | 实测代表 | heading9；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading9-ordered.json) |
| CONV-10-12 | H9→无序 | 实测代表 | bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading9-bullet.json) |
| CONV-10-13 | H9→引用 | 实测代表 | quote_container > heading9 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-heading9-quote.json) |
| CONV-11-01 | 有序→正文 | 实测代表 | text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-ordered-text.json) |
| CONV-11-02 | 有序→H1 | 实测代表 | heading1；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-ordered-heading1.json) |
| CONV-11-03 | 有序→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-04 | 有序→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-05 | 有序→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-06 | 有序→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-07 | 有序→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-08 | 有序→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-09 | 有序→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-11-10 | 有序→H9 | 实测代表 | heading9；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-ordered-heading9.json) |
| CONV-11-11 | 有序→有序 | 实测代表 | 当前同类命令切回正文；编号等非默认属性另验 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-case-menu-ordered.json) |
| CONV-11-12 | 有序→无序 | 实测代表 | bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-ordered-bullet.json) |
| CONV-11-13 | 有序→引用 | 实测代表 | quote_container > ordered；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-ordered-quote.json) |
| CONV-12-01 | 无序→正文 | 实测代表 | text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-bullet-text.json) |
| CONV-12-02 | 无序→H1 | 实测代表 | heading1 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-bullet-heading1.json) |
| CONV-12-03 | 无序→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-04 | 无序→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-05 | 无序→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-06 | 无序→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-07 | 无序→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-08 | 无序→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-09 | 无序→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-12-10 | 无序→H9 | 实测代表 | heading9 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-bullet-heading9.json) |
| CONV-12-11 | 无序→有序 | 实测代表 | ordered；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-bullet-ordered.json) |
| CONV-12-12 | 无序→无序 | 实测代表 | 当前同类命令切回正文；编号等非默认属性另验 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-case-menu-bullet.json) |
| CONV-12-13 | 无序→引用 | 实测代表 | quote_container > bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-bullet-quote.json) |
| CONV-13-01 | 引用→正文 | 实测代表 | quote_container > text | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-quote-text.json) |
| CONV-13-02 | 引用→H1 | 实测代表 | quote_container > heading1 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-quote-heading1.json) |
| CONV-13-03 | 引用→H2 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-04 | 引用→H3 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-05 | 引用→H4 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-06 | 引用→H5 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-07 | 引用→H6 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-08 | 引用→H7 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-09 | 引用→H8 | 授权推断 | 仅由H1/H9端点授权推断；不补造中间级别DOM/样式或双轮 | [合同](../03-single-block-conversion/03-reachability-and-properties.md) |
| CONV-13-10 | 引用→H9 | 实测代表 | quote_container > heading9 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-quote-heading9.json) |
| CONV-13-11 | 引用→有序 | 实测代表 | quote_container > ordered；标记1. | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-quote-ordered.json) |
| CONV-13-12 | 引用→无序 | 实测代表 | quote_container > bullet；标记• | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C07-case-quote-bullet.json) |
| CONV-13-13 | 引用→引用 | 实测代表 | 取消引用包装；精确内部类型按来源 | [合同](../03-single-block-conversion/03-reachability-and-properties.md)、[DOM](../03-single-block-conversion/dom/C03-quote-menu.json) |

## 入口逐项登记

| 入口 | 作用域与验收边界 | 来源 |
| --- | --- | --- |
| 斜杠 | 块首转换与块尾输入字符分开；消费前缀、取消、历史分别验收 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 加号 | 空块创建与非空下方添加分别验收，不能把T菜单当独立加号 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 块菜单 | 悬停目标与正文光标不同块时，按真实目标范围 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 选区气泡 | 30个异类方向与6个同类默认来源；混合/跨块另用S04 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 页面工具栏 | 现场为文档操作；没有证据不另造正文类型入口 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 快捷键 | 可信键码、输入法组合、浏览器/正文/INPUT接收者各自验证 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 输入规则 | 真实前缀键入与粘贴解析分开；触发字符历史按条件 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 粘贴 | 文本/HTML/私有载荷、普通/纯文本入口及目标上下文分开 | [入口合同](../03-single-block-conversion/03-reachability-and-properties.md)、[菜单矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |

## 状态维度登记

各行表示来源分配，不能据此宣称全部交叉或两两组合已覆盖。

| 维度 | 来源 | 仍须按具体条件核对 |
| --- | --- | --- |
| 内容 | [合同](../02-creation-and-editing/02-unicode-editing.md) | 空/空格/文字/格式/链接/中文/表情/组合字符/软行/多段 |
| 光标 | [合同](../02-creation-and-editing/02-navigation-editing.md) | 首中尾、编号旁与页标题边界分别定位 |
| 选区 | [合同](../04-multi-block-conversion/04-selection-boundaries.md) | 文字Range与隐藏textarea整块选择、正反向、终点偏移0 |
| 结构 | [合同](../05-nesting-and-combinations/05-verification-matrix.md) | 真实父子与大纲归属、跨引用、空块/软行 |
| 属性 | [合同](../06-numbering-folding-and-outline/06-verification-matrix.md) | 编号/折叠/对齐/缩进/起点及批注修订 |
| 时序 | [合同](../09-undo-redo-and-history-boundaries/09-history-contracts.md) | 快速、采样/重选、输入法、保存中与新分支；无精确合并阈值 |
| 环境 | [合同](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md) | 真实权限、AI、协议、缓存/上限/迁移继续项目专项 |

## 异常类别与限制映射

以下按J14显式类别分配来源；未观察到不等于不存在，也不自行制造异常用例。

| 异常类别 | 已知窗口或核对合同 | 未验证范围 |
| --- | --- | --- |
| 错误 | [来源](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)：离线R2的Network Error与采样脚本SyntaxError分开，保留原窗口 | 全错误分类、服务端故障与用户恢复矩阵未完成 |
| 警告 | [来源](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)：原生离线刷新警告的受控R2与来源不明R1分开 | 自然权限/AI锁拒绝与其他确认窗口未完成 |
| 焦点丢失 | [来源](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md)：清空/结构选择后正文续写与标题保护，沿用已批准项目目标 | 全输入源/失焦/重连组合未完成 |
| 重复块 | [来源](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md)：额外空段与重复正文分开，Undo不变量及范围断言保留 | 重复请求、晚响应和迁移重放未验证 |
| 残留菜单 | [来源](../07-menus-and-shortcuts/07-verification-matrix.md)：取消和互斥后的菜单/焦点状态回到具体有效窗口 | 全入口与会话生命周期组合未完成 |
| 编号漂移 | [来源](../06-numbering-folding-and-outline/06-verification-matrix.md)：标记、起点、续号与后代范围分开；F04异常窗口不抹去 | 任意深度、导入与并发编号全组合未验证 |
| 部分成功 | [来源](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md)：输入无变化、删除合并和部分作用范围必须比较前后缀 | 所有失败前修改及事务原子性不能由DOM推定 |

## 后续逐条字段复核

[原始标题目录](./11-requirement-catalog.json)保留来源文件、精确标题、行范围和证据链接。
同编号可能指不同规则，必须使用source key；包括同一文件内重复编号。
lexicalSignals只作待审线索，不能凭关键词命中自动完成K02。
各阶段的配对、排除窗口、合法结构及保存范围仍以具体原文和JSON为准。
当前K01完成来源分配；K02的逐条可执行字段和跨规则语义复核尚在进行。
