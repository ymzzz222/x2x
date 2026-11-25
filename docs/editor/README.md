# 飞书云文档调研资料

这里保存第三阶段所需的 S01–S11 实测记录、验收索引和原始证据，来源是 my-translation-web 的 `docs/editor`。

| 开发任务 | 资料入口 |
| --- | --- |
| 标题、文字样式和列表结构 | [S11 范围与转换索引](./11-reconstruction-acceptance/11-coverage-and-conversion.md) |
| 目录、折叠及编号 | [S06 实测](./06-numbering-folding-and-outline/06-numbering-folding-and-outline.md) · [证据索引](./06-numbering-folding-and-outline/06-evidence-index.md)。先查 F05-003/F05-004 与 F06。 |
| 查找与替换 | [S10 J01/J08](./10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) · [J08 首轮 JSON](./10-related-features-and-edge-cases/dom/J08-long-find-replace-history-R1.json) · [J08 复测 JSON](./10-related-features-and-edge-cases/dom/J08-long-find-replace-history-R2.json) |
| 创建、输入与块转换 | [S02 创建与编辑](./02-creation-and-editing/02-creation-and-editing.md) · [S03 单块](./03-single-block-conversion/03-single-block-conversion.md) · [S04 多块](./04-multi-block-conversion/04-multi-block-conversion.md) · [S05 嵌套](./05-nesting-and-combinations/05-nesting-and-combinations.md) |
| 菜单、格式、剪贴板及历史 | [S07 入口](./07-menus-and-shortcuts/07-verified-contracts.md) · [S08 格式](./08-deletion-movement-formatting-and-clipboard/08-formatting-contracts.md) · [S08 剪贴板](./08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) · [S09 历史](./09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| 逐项验收和实测边界 | [S11 索引](./11-reconstruction-acceptance/README.md) · [逐条复核 JSON](./11-reconstruction-acceptance/11-semantic-review.json) · [历史总清单](./ym-research-task.md) |

x2x 的实施范围以[文档编辑器开发流程](./文档编辑器开发流程.md)和[文档编辑器需求范围](./文档编辑器需求范围.md)为准。同一行为优先查实测用例和证据，保留原样例的限制。JSON 字段里的历史路径 `docs/editor/` 对应当前目录。

## 资料校验

- 保留 2,826 个源文件，含 60 份 Markdown、2,708 份 JSON、1 份压缩 JSON 清单及附带证据。迁入时逐份解析 JSON 及压缩清单，复制后核对 SHA-256。
- 公开归档将飞书测试租户域名、测试文档标识和导出作者替换为示例值，遮盖截图中的地址和账号信息，并更新对应证据的字节数与 SHA-256。原档和原始校验清单保存在本机。
- S01–S11 的用例和证据按原目录查阅。实测资料中的旧实现源码链接仍按原仓库路径查阅。
