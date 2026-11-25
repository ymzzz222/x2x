# S08 继续执行后的补充合同

状态：2026-10-21，以下三个固定条件各完成有效双轮及完整历史；S08 已按 sir 接受的代表范围与明确限制结束研究交付，未测项不计功能通过。
总范围、七项已确认产品差异和整项状态见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)。

## 1 来源、前置与记录口径

用户要求“继续直到结束”后，复用指定 Chrome 研究标签继续操作。
DOM 标签连接再次超时；Chrome 原生菜单能打开控制台，未改用其他浏览器开展主端功能研究。
初始只读确认页标题仅 U+200B、正文 0 块、无 __s08 变量；这是已完成清理之后的新一轮研究。
在真实正文位置输入 Alpha、Beta、Gamma，见[三段建样](./dom/H00-supplement-three-text-fixture.json)。
被动观察器会话为 S08-supplement-1792559080075，必要正文/标题树、选择、可信事件及 mutation 分别保留。
节点引用只在该会话内比较；导出后 DOM class/id/data 标识规范化为 maiya，原文和来源 URL 不变。
本轮只读树仍带 U+200B；下文文字省略该占位，不把它计为新增用户字符。
普通页标题保持为空；历史键前通过真实坐标聚焦页标题，避免将控制台焦点当作编辑历史入口。
快照及 mutation 分开保存；同一 mutation 回调读取的 valueAtDelivery 不冒充全部同步中间态。

## 2 REQ-S08-H01-028 无序列表末尾 Delete 合入下一正文

来源：指定 Chrome 实测。状态：同前置有效双轮。
前置为顶层 text Alpha、bullet Beta、text Gamma，折叠光标 Beta:4；标记不在文字选择范围。
证据：[R1](./dom/H01-supplement-bullet-tail-delete-R1.json)、[R2](./dom/H01-supplement-bullet-tail-delete-R2.json)。
两轮真实 Delete 均得到 Alpha、bullet BetaGamma 两块，保留无序标记，不降级为正文。
光标落在 BetaGamma:4，即合并处；没有删除 Beta 末字或 Gamma 首字。
Alpha 外层 r15/ID2、Beta 外层 r25/ID3 保持；Gamma 外层移除。
Cmd+Z 恢复三段，Cmd+Shift+Z 再合并，Cmd+Z 再恢复，均保留 Beta 的 bullet 类型和原文字。
Gamma 由 R1 初始 r34/ID4 重建为 r57/ID6、r66/ID7；R2 的两次恢复为 r75/ID8、r84/ID9。
因此内容恢复不要求复用被移除的 Gamma DOM 或原 ID；Alpha/Beta 则不得无故重建或变化。
R1 的控制调用在首次 Undo 取样后超时，恢复时先读取已执行阶段，再仅补 Redo/Undo；未重发 Delete 或首次 Undo。
两轮实际各有一次可信 Delete 和三次可信历史 KeyZ，mutation/事件未达上限，观察窗口 errors 为空。
验收固定该相邻结构，同时核对文字、标记、落点、前块保护、后块重建及三步历史。

## 3 REQ-S08-H01-029 有序列表末尾 Delete 合入下一正文

来源：指定 Chrome 实测。状态：同前置有效双轮。
由上一前置真实 Cmd+Shift+7 转为 ordered Beta，编号 1.，见[有序建样](./dom/H00-supplement-ordered-fixture.json)。
证据：[R1](./dom/H01-supplement-ordered-tail-delete-R1.json)、[R2](./dom/H01-supplement-ordered-tail-delete-R2.json)。
固定 Beta:4，Delete 得到 ordered BetaGamma，编号仍为 1.，Alpha 不变；光标在合并处偏移 4。
两轮均经 Undo/Redo/Undo 在三段与合并两段间往返，最终精确恢复语义前置。
Alpha r15/ID2、Beta r25/ID3 始终保持；Gamma 恢复依次为 r105/ID10、r114/ID11、r123/ID12、r132/ID13。
每轮只含一次可信 Delete 和三次可信历史键，观察窗口 errors 为空，两个日志均未达到上限。
验收须独立核对有序编号，不能仅凭与无序列表相似就推断通过；不推广所有列表邻接或父子组合。

## 4 REQ-S08-H07-007 外部复合行内样式的保留与清理

来源：指定 Chrome 实测。状态：固定 HTML、Gamma:5 目标有效双轮。
证据：[R1](./dom/H07-supplement-inline-style-cleanup-R1.json)、[R2](./dom/H07-supplement-inline-style-cleanup-R2.json)。
原生 HTML 粘贴提交一个 span，文字 Paint；包含 700 字重、斜体、下划线与删除线、#c80000 前景、#ffff00 背景、42px 字号、7px 字距、大写转换和 data-s08-source 测试属性。
可信 paste 实际提供 text/plain、text/html、text/rtf；plain 为 PAINT，HTML 内文字为 Paint，不将二者混为同一载荷。
两轮结果均在原 Gamma 后插入 Paint，得到同一 text 块 GammaPaint，没有新段或额外末空段。
斜体、下划线和删除线保留；输出 span 的 style 与对应计算样式同时留存。
700 字重、两种输入颜色均未在本条保留：Paint 计算值为 weight 400、前景 rgb(31,35,41)、透明背景。
字号为 16px、字距 normal、text-transform none，测试 data 属性消失；不能从原 HTML 存在这些字段推断实际样式保留。
Gamma 外层 r132/ID13 及原文字叶 r138 保持；新增 Paint 叶在 Redo 时重建，其他两块和空页标题保持。
两轮各经 Undo/Redo/Undo 回到原 Gamma，均无残留空段；errors 为空，事件和 mutation 未达上限。
验收同时核对实际 HTML/plain、输出大小写、保留装饰、移除属性、计算样式及历史，不仅检查可见文字。
该结果只适用于这份复合 span；既有 strong、独立颜色等固定 HTML 样例见[剪贴板合同第 11 节](./08-clipboard-contracts.md)。
不同输入形态保留为条件差异，不推断全部字重或颜色均不支持，也不据此宣称项目 HTML 安全验收通过。

## 5 当前恢复边界

上述六个有效运行均恢复为 Alpha、ordered Beta、Gamma；页标题为空。Chrome 真实刷新确认该语义版本，后续首空段探查及恢复单列，未混入有效双轮。
本轮新建样已真实清空并验证 Undo/Redo；两浏览器最终空版本及变量清理见[收尾记录第 9 节](./08-persistence-and-cleanup.md#9-继续执行后的最终收尾)。
多块拖动、无效落点、单次中断的有效第二轮及剪贴板权限拒绝仍未补齐；sir 已明确接受这些研究限制，见[收口清单](./08-closeout-review.md)。
六个有效运行、清空历史、两个空版本及终检和界面恢复的[补充语义审计](./08-supplement-audit.json)共 12 个检查均通过；这不增加功能双轮数量。
未修改业务代码，未启动 S09，不将研究交付结束等同项目实现通过。
