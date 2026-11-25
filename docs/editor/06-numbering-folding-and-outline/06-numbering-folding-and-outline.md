# S06 列表编号、标题折叠与目录

启动日期：2026-10-19（Asia/Shanghai）。

当前状态：S06 的 F01–F07 已按本阶段代表范围完成并审计。360份研究JSON中352份含正文DOM，另有8份辅助记录；两份Word及解析另存exports。Chrome/夸克各两轮真实刷新与独立全文读取、两轮文字协同及编号协同有效R1/R3均已核对。16:34最终刷新确认两边正文和页标题为空、观察器不存在，控制台关闭，夸克恢复TDesign。完成的是研究需求交付，未修改业务代码或执行项目生产验收。

执行依据：sir要求「S06全部完成才能结束任务。一直持续」，随后明确「夸克浏览器直接前台调用」。现已完成约定范围及最终清理；11:12等早期清理仅为历史检查点。

## 1 范围与依据

范围沿用[研究清单 S06](../ym-research-task.md#s06-列表编号-标题折叠与目录)的 F01–F07。
本文记录实测行为、有效范围和证据缺口；未测组合不提前生成飞书行为需求。

- 主测浏览器：Google Chrome，复用既有研究标签页。
- 指定页面：https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX 。
- 仅更新研究文档与证据；项目业务代码不属于本阶段执行范围。
- H1/H9 共同行为按既定两端抽样；H2–H8 的推断必须单列，不计实测。
- 不恢复 S05 已按 sir 决定停止的嵌套深度上限探查。
- 后台操作优先；本轮 sir 已明确答复「现在可以使用前台」，沿用该授权执行。

## 2 成功条件

1. 每个具体用例从相同前置、入口和选区完成两轮实操。
2. 必要正文、标记、目录、焦点选区及 mutation 对应同一操作编号。
3. 明确受影响范围、节点身份关系、序号与布局变化及撤销重做表现。
4. 保存重载与独立读取区分正文数据和视图状态；未测项不计通过。
5. 结果及时落入本阶段文档，必要 JSON 放在本目录 `dom/` 下。
6. 缺口、异常和不可达入口保留；不存在证据时不推断为功能不支持。

## 3 执行矩阵

| 编号 | 既定研究范围 | 当前状态 | 有效双轮 |
| --- | --- | --- | --- |
| F01 | 相邻列表合并、属性不同、跨正文或标题续编号、手动重启 | 已完成，代表双轮已审计 | 10 组 |
| F02 | 中间插删、拆分、转换、移动、缩进与反缩进后的全部标记 | 已完成，代表双轮已审计 | 8 组，移动采用 R2/R3 |
| F03 | 编号标题创建、标记与文字分离、层级跳变、混合块及重新计算 | 已完成，编号值及跨位由F07补齐 | 9 组 |
| F04 | 折叠范围、嵌套折叠、折叠后编辑转换删除、隐藏内容选区和全选 | 已完成，原生字符输入异常单列排除 | 见运行矩阵 |
| F05 | 目录锚点、标题级别变动、删除移动、编号前缀、折叠态和滚动 | 已完成，空白与重名定位由F07补齐 | 见运行矩阵 |
| F06 | 复制粘贴、查找、导出、协同、保存重载、撤销及视图状态区别 | 已完成，两轮独立读取、文字及编号协同均已审计 | 见运行矩阵 |
| F07 | 个位到多位、隐藏区编号更新、空标题、重复标题与唯一锚点 | 已完成，未生效输入及失败窗口保留 | 见第17节 |

## 4 启动检查与阻塞

以下为首次后台启动检查的历史记录，不是功能通过证据。

- 浏览器清单中已发现指定 URL 的现有 Chrome 标签页。
- Chrome 原生 AX 与一次页面语义快照均显示空正文提示及空页标题。
- 语义快照未提供足以确认正文块结构、节点身份或标记样式的信息。
- 首次标签绑定超时；重新核对浏览器对应关系后取得一次语义快照。
- 随后的只读 DOM 查询超时；受支持 CDP 接口的同类只读查询也超时。
- 首次后台检查未执行创建、转换、删除、输入、编号、折叠或目录操作。
- 首次后台检查未安装观察器，未取得必要 DOM JSON 或 mutation 证据。
- 不把上述采集故障归因于飞书功能；原因尚未确定。

后续恢复：sir 明确允许使用前台。Chrome 原生「显示 → 开发者 → JavaScript 控制台」可读取表达式结果，并已安装正文 MutationObserver、对象身份映射和真实按键记录；编号菜单另补正文外 childList 监控。
后台超时原因仍未知，不把前台恢复写成后台接口已修复。

## 5 首次历史检查点（已被持续执行进度覆盖）

2026-10-19 11:12（北京时间）：F01 已完成 4 组局部双轮及对应真实撤销重做，整项完成 0/7。
共 40 份 JSON，其中 35 份为功能和历史窗口，另含建样、前置异常、基线及清理；不把文件数当通过数。
只读采集已在前台恢复；首次纯三块与后续附加末空段的前置差异单列，正文中断用后续 R3/R4 形成干净双轮。
未修改项目业务代码，未执行项目构建、测试或生产 UI 验收。
本轮收尾已清空测试正文并移除观察器，真实刷新后再次查询确认正文块数 0、正文文字为空、观察器不存在，随后关闭控制台。
见[刷新后只读确认](./dom/F00-cleanup-after-refresh.json)、[页面截图](./06-clean-page.png)及[证据索引](./06-evidence-index.md)。
下一步继续 F01 的属性不同、标题中断及无序列表等未测范围，再推进 F02–F07。

## 6 F01 当前实测规则

### REQ-S06-F01-001 正文中断后的继续编号（局部双轮）

来源：飞书实测；入口为 BBB 文字末端的真实 Cmd+Shift+7。
首轮来源为同层 ordered AAA/BBB/CCC，标记 1/2/3；BBB 转为 text 后为 ordered/text/ordered，标记 1/无/2。
三块外层对象 n17/n26/n35、块 ID 5/4/3 保持；BBB 内部文字区重建，后项标记同步更新。
真实 Cmd+Z 恢复 1/2/3，Cmd+Shift+Z 回到 1/无/2，再次撤销恢复来源。
证据：[首轮](./dom/F01-middle-text-R1.json)、[撤销](./dom/F01-middle-text-undo-R1.json)、[重做](./dom/F01-middle-text-redo-R1.json)、[恢复](./dom/F01-middle-text-restore-R1.json)。

早期第二轮得到相同目标及历史，但窗口内出现额外末尾空 text n125/ID 7。
其新增为 mutation seq 157，发生在本轮 BBB 转换所需结构变化之前；尚未确定由哪次前置界面交互触发。
该窗口没有真实 Enter 按键记录，不据此猜测空段来源；不得把第一次三块样例和第二次四块样例写成同前置稳定双轮。
证据：[第二轮及附加变化](./dom/F01-middle-text-R2.json)、[撤销](./dom/F01-middle-text-undo-R2.json)、[重做](./dom/F01-middle-text-redo-R2.json)。

后续 R3/R4 从相同四块前置复测：前三块 ordered 1/2/3，末尾是上述同一空 text。
两次真实快捷键的 `before-key` 快照均确认此前置；结果为 ordered/text/ordered/空 text，标记 1/无/2。
两轮均无新增或删除外层块，四块对象、块 ID、顺序与文字保持；BBB 的内部内容壳重建，CCC 标记文本节点 n47 从 3 改为 2。
BBB 光标在新文字节点的末端偏移 3；两轮撤销均回 1/2/3，重做均回 1/无/2。
证据：[R3](./dom/F01-middle-text-R3.json)、[撤销](./dom/F01-middle-text-undo-R3.json)、[重做](./dom/F01-middle-text-redo-R3.json)、[恢复](./dom/F01-middle-text-restore-R3.json)、[R4](./dom/F01-middle-text-R4.json)、[撤销](./dom/F01-middle-text-undo-R4.json)、[重做](./dom/F01-middle-text-redo-R4.json)。
以上稳定结论限定四块前置；纯三块只有首轮观察，不用后续样例替代其同前置复测。

### REQ-S06-F01-002 中间正文接入相邻有序项（局部双轮）

来源：飞书实测。共同前置为 ordered AAA 1.、text BBB、ordered CCC 2.，末尾另有一个空 text n125/ID 7。
在 BBB 文字末端按 Cmd+Shift+7，BBB 转 ordered 2.，CCC 同步变 3.；四块的外层对象、块 ID、顺序及正文保持。
这里的「接入」表示可观察编号关系和块类型变化，不推断飞书内部合并了某种列表数据容器。
两轮均真实撤销到 1/无/2，重做到 1/2/3；首轮另有再次撤销重建第二轮前置。
证据：[R1](./dom/F01-middle-rejoin-R1.json)、[撤销](./dom/F01-middle-rejoin-undo-R1.json)、[重做](./dom/F01-middle-rejoin-redo-R1.json)、[恢复](./dom/F01-middle-rejoin-restore-R1.json)、[R2](./dom/F01-middle-rejoin-R2.json)、[撤销](./dom/F01-middle-rejoin-undo-R2.json)、[重做](./dom/F01-middle-rejoin-redo-R2.json)。

### REQ-S06-F01-003 末项手动开始新列表（局部双轮）

来源：飞书实测。共同前置为同层 ordered AAA/BBB/CCC，标记 1/2/3，保留同一末尾空 text。
点击 CCC 的 3. 标记，菜单中「继续之前的编号」为 disabled，「开始新列表」可用。
点击「开始新列表」后为 1/2/1，文字、类型及四块外层身份保持。
两轮 Cmd+Z 均恢复 1/2/3，Cmd+Shift+Z 均恢复 1/2/1；首轮另有再次撤销重建第二轮前置。
菜单为正文外 `ul[role=menu].list-modify-menu`，选项为 `li[role=menuitem]`，禁用态由 `aria-disabled` 表达；菜单必要增删已单独监听。
证据：[R1](./dom/F01-restart-last-R1.json)、[撤销](./dom/F01-restart-last-undo-R1.json)、[重做](./dom/F01-restart-last-redo-R1.json)、[恢复](./dom/F01-restart-last-restore-R1.json)、[R2](./dom/F01-restart-last-R2.json)、[撤销](./dom/F01-restart-last-undo-R2.json)、[重做](./dom/F01-restart-last-redo-R2.json)。

### REQ-S06-F01-004 重启后恢复继续编号（局部双轮）

来源：飞书实测。共同前置为同层 ordered AAA/BBB/CCC，标记 1/2/1，末尾保持同一空 text。
点击 CCC 的 1. 标记后，「继续之前的编号」可用，「开始新列表」禁用；与连续编号来源的菜单状态相反。
点击「继续之前的编号」后，CCC 恢复 3.；四块的外层身份、类型、文字和顺序保持。
两轮 Cmd+Z 均回到 1/2/1，Cmd+Shift+Z 均恢复 1/2/3；首轮再次撤销重建第二轮来源。
该结论只覆盖此末项重启标记，不推出任意跨父级、不同属性或多个重启点的编号公式。
证据：[R1](./dom/F01-continue-last-R1.json)、[撤销](./dom/F01-continue-last-undo-R1.json)、[重做](./dom/F01-continue-last-redo-R1.json)、[恢复](./dom/F01-continue-last-restore-R1.json)、[R2](./dom/F01-continue-last-R2.json)、[撤销](./dom/F01-continue-last-undo-R2.json)、[重做](./dom/F01-continue-last-redo-R2.json)。

## 7 证据口径与当前限制

- [空正文基线](./dom/F00-empty-baseline.json)保存正文容器、最小结构及初版观察器来源；[建样](./dom/F00-ordered-fixture-R1.json)保留首次 Cmd+A 仅选中 CCC 的前置失败。
- DOM 对象引用在本轮会话内统一；block ID 和对象身份分开判断，不用两次相同文字证明对象复用。
- 初期 `keys` 和菜单 `external` 为截至该快照的累计记录；有 `eventWindow` 字段的文件改为自前一导出后的新增记录。正文 mutation 用 seq 范围界定。
- 控制台会抢占焦点；每次历史按键前通过原生选文能力将光标放回 BBB 或 CCC 末端，动作说明已写入对应 JSON，不把控制台焦点当正文焦点。
- 原有豆包代理连接错误和资源预加载警告已存在；本轮没有完整逐窗口 console 错误归因，不声称所有窗口零错误。
- 首次清理刷新不计功能验证；后续P1/P2及X1/X2执行真实刷新和全文回读，独立读取与协同见第18节；保存提示不代替实际回读。
- F07已补量当前Chrome停靠视口下的编号字号、宽度与间距；这些参数不等于其他视口、字体或浏览器的视觉验收。
- F01–F07约定代表范围已补齐；全组合、其他账号或平台、项目实现与生产验收不由此推定。

## 8 持续实测新增记录（会话 S06B）

2026-10-19：在真实刷新后的同一指定 Chrome 页面重新建立观察器，节点引用使用 b 前缀，与初轮 n 引用不混用。
本会话复用五块 AAA/BBB/CCC/DDD/TAIL；BBB 加粗作为与邻项不同的行内格式，标题共同行为仍只测 H1/H9。
新增证据以一个文件容纳同一用例两轮及历史：keys.before 是该按键的精确前置，下一按键前置对应前一步结果，末态是最后一次恢复。
每一步真实按键后均读取原生 AX；不是在控制台调用编辑命令。控制台仅查询、监控和导出。

| 追加用例 | 双轮结果及历史 | 证据 |
| --- | --- | --- |
| 正文中断改 H1 | 1.AAA / text BBB / 2.CCC / 3.DDD / 4.TAIL 中，BBB 转无编号 H1，后面仍为 2/3/4；撤销重做可逆 | [H1](./dom/F01-plain-heading1-interruption-double.json) |
| 正文中断改 H9 | 相同前置改无编号 H9，后面仍为 2/3/4；撤销重做可逆 | [H9](./dom/F01-plain-heading9-interruption-double.json) |
| 不同行内属性中项接入 | 加粗 text BBB 转 ordered，得到 1/2/3/4/5；邻项文字及原加粗格式保留；历史可逆 | [加粗中项](./dom/F01-bold-middle-rejoin-double.json) |
| 不同起点属性与后项 | CCC 编号输入框 2→7 后，五块为 1.AAA / text BBB / 7.CCC / 8.DDD / 9.TAIL；两轮各撤销、重做、恢复 | [自定义起点](./dom/F01-custom-start-seven-double.json) |
| 无序中项取消 | 五项 bullet 中 BBB 转 text，其他四项仍保留 •；两轮历史可逆 | [取消](./dom/F01-bullet-middle-text-double.json) |
| 无序中项接入 | •AAA / text BBB / •CCC / •DDD / •TAIL 中 BBB 转 bullet，恢复五个 •；两轮历史可逆 | [接入](./dom/F01-bullet-middle-rejoin-double.json) |

自定义编号的探索输入框在切开发者工具及 Escape 后仍存在；首轮直接从该框的值 2 起操作，额外保存 existing-number-popup-baseline。第二轮重新从 CCC 的标记菜单打开。两轮确认动作与值变化一致，不把第一次未重新打开菜单算成成功入口复测。
加粗接入用例的导出因工具超时中断，恢复后从原 prepared gzip 数据完整读取；没有重放正文操作，异常说明留在 JSON。
F01 行为范围已取得上述代表双轮；视觉参数、跨功能保存与后续组合仍由 F06/F07 补齐后统一收口。

## 9 F02 插删、拆分、转换与层级变化

共同代表来源为五项同层 ordered，文字 AAA/BBB/CCC/DDD/TAIL，标记 1–5；BBB 加粗。
全部子用例各执行两轮，目标操作后真实 undo/redo/restore，前后其他项一并保存。

| 用例 | 实测结果 | 证据 |
| --- | --- | --- |
| BBB 首 Enter 插入 | 新增空 ordered 2.，BBB→3.，CCC/DDD/TAIL→4/5/6；原文字保持 | [插入](./dom/F02-middle-empty-insert-double.json) |
| ordered BBB 首 Backspace | 先降为 text；后项 CCC/DDD/TAIL→2/3/4，并不立即与 AAA 合并 | [降级](./dom/F02-middle-backspace-merge-double.json) |
| BBB 偏移 1 Enter | 原 BBB 分成 B 与 BB 两个有序项 2/3，后项→4/5/6 | [拆分](./dom/F02-middle-offset1-split-double.json) |
| ordered BBB 转 bullet | BBB 标记改 •，后项 ordered 变为 2/3/4，其他文字保持 | [类型转换](./dom/F02-ordered-middle-to-bullet-double.json) |
| BBB Tab | BBB 进入 AAA 下，标记为 a.；CCC/DDD/TAIL 顶层改为 2/3/4，文字及该项外层身份保持 | [缩进](./dom/F02-middle-indent-double.json) |
| 嵌套 BBB Shift+Tab | BBB 返回顶层 2.，CCC/DDD/TAIL 恢复 3/4/5 | [反缩进](./dom/F02-middle-outdent-double.json) |
| text BBB 首 Backspace | BBB 块移除，文字合入 ordered AAA，成为 1.AAABBB；CCC/DDD/TAIL 为 2/3/4 | [删除合并](./dom/F02-text-middle-delete-merge-double.json) |

上述文件名 `middle-backspace-merge` 为执行前命名；真实结果是降级，不能按文件名推断合并。

### 整块移动入口与历史

通过块菜单剪切第二项 BBB，再在 DDD 末端 Cmd+V，顺序成为 AAA/CCC/DDD/BBB/TAIL，标记重新为 1–5。
这是剪切、粘贴两步真实编辑；一次 undo 只撤粘贴，第二次 undo 才恢复剪切前，redo 同样两步。
有效双轮采用 [R2](./dom/F02-cut-paste-move-R2.json)和[R3](./dom/F02-cut-paste-move-R3.json)，包含正文外块菜单 DOM；[R1](./dom/F02-cut-paste-move-R1.json)缺该菜单 DOM，只保留探索与历史，不代替有效双轮。
移动后的块身份以原始 JSON 为准，不能把剪切粘贴的重建关系外推为拖动的身份合同。

原生手柄拖动有可信 mousedown/mousemove，但未改变顺序，保留为未生效尝试，不宣称飞书不支持拖动，也不计成功。
部分坐标尝试发生在 DevTools 未真正关闭的窄版布局；后续补做关闭状态确认，不能把此前位置失败解释为功能拒绝。
此处移动覆盖可达的整块剪切粘贴入口；专门拖动入口仍归后续 S08/H03，当前失败记录需保留供该阶段复测。

## 10 F03 编号标题与层级跳变

六组双轮分别覆盖 ordered 转 H1/H9、无编号 H1/H9 添加编号、编号 H9→H1 与反向跳变。
对应证据为 dom/F03-ordered-to-numbered-heading1-double.json、dom/F03-ordered-to-numbered-heading9-double.json、dom/F03-plain-heading1-add-number-double.json、dom/F03-plain-heading9-add-number-double.json、dom/F03-numbered-heading9-to-heading1-double.json、dom/F03-numbered-heading1-to-heading9-double.json。
每组两次目标操作，并真实撤销、重做、再次撤销恢复。
ordered 第二项 BBB 转标题后标记从 2. 变为 1.，普通列表 AAA/CCC/DDD/TAIL 标记为 1/2/3/4；两类分别计数。
无编号标题 Cmd+Shift+7 添加 1.；H1/H9 互转保持 1.，其他列表数字不变。
BBB 外层 b1824/块 ID32 保持，内部 heading 壳和编辑区可能重建。
编号是 button[contenteditable=false].heading-order，位于 heading-content 文字编辑区之外。文字编辑区只有 BBB 与编辑器零宽末字符。
H9 加编号及之后层级跳变的两轮前置均有同一末空 text b2094；建样时出现，不归因于目标命令。H1 加编号是五块前置，不混称同一来源。
H2–H8 仍只有授权推断，未实测。标题编号重算入口及混合标题序列追加如下。
审批服务间歇返回模型容量不足，失败调用明确未执行；sir 要求继续重试，没有绕过审批。

### 混合标题序列及编号菜单

来源：飞书实测。[混合序列双轮](./dom/F03-mixed-headings-level-jump-double.json)包含 H1 AAA、H1 BBB、ordered CCC、H1 DDD、ordered TAIL 与末空正文。
三个 H1 编号为 1./2./3.，普通列表为 1./2.。BBB 跳 H9 后变 1.1，DDD 变 2.，普通列表保持 1./2.。
跳过 H2–H8 不补零；该结果限定此 H1→H9 样例，不推出任意层级组合公式。目录同步显示新标题前缀。
两次转换及 undo/redo/restore 一致，BBB 外层身份保持。

点击第一个编号标题标记，菜单“继续标题编号”“重新开始编号”均禁用，“设置编号的值”可用。
点击连续编号中的 BBB 2.，“继续标题编号”禁用、“重新开始编号”可用。
点击“重新开始编号”后 BBB 变 1.，后续 DDD 变 2.；普通列表、文字及块身份保持。
[重启 R1](./dom/F03-heading-restart-R1.json)、[R2](./dom/F03-heading-restart-R2.json)、[第二轮历史](./dom/F03-heading-restart-final-history.json)共同包含两次操作和各自 undo/redo/restore。
重启后菜单启用“继续标题编号”并禁用“重新开始编号”。
点击“继续标题编号”恢复 AAA/BBB/DDD 为 1./2./3.。
[继续 R1](./dom/F03-heading-continue-R1.json)、[R2](./dom/F03-heading-continue-R2.json)、[第二轮历史](./dom/F03-heading-continue-final-history.json)包含两次操作和可逆历史。
正文外菜单及目录变化已捕获；目录观察器和编辑根父节点观察器从混合样例建样开始加入，早期用例不能追认具有这些监控。
本次可达编号重算入口就是以上标记菜单，未发现独立名为“重新计算”的菜单项；不据此推断其他文档或版本没有此入口。
设置编号值还需在 F07 多位数字样例继续核对。

当前机器审计：[06-audit.json](./06-audit.json)，由 tools/audit.py 读取研究 JSON 生成，无产品操作。
审计只证明已落盘数据的完整性和可比较状态，不代替未执行的协同、独立读取或生产验收。

## 11 F04 父标题折叠（进行中）

来源：飞书实测。共同来源为编号 H1 AAA、编号 H9 BBB、有序 CCC、编号 H1 DDD、有序 TAIL 与末空正文。
点击 AAA 左侧箭头折叠，隐藏 BBB 和 CCC，到下一个同级 H1 DDD 停止；DDD、TAIL 和末空正文仍可见。
两轮采用 [折叠 R1](./dom/F04-parent-collapse-R1.json)、[展开 R1](./dom/F04-parent-expand-R1.json)、[折叠 R2](./dom/F04-parent-collapse-R2.json)、[展开 R2](./dom/F04-parent-expand-R2.json)。
收起时先出现 fold-folded/展开态手柄类及 block-hidden，BBB/CCC 随后从当前渲染树退出。
展开时恢复相同外层对象 b1824/b35、块 ID32/5，文字与编号仍为 1.1 BBB、1. CCC；不是仅凭同名判断复用。
折叠时目录中 BBB 项退出，AAA 项具有 collapsible 状态；展开恢复 BBB 目录项。
这些文件含正文外目录 mutation、真实 href 锚点、正文布局与折叠手柄状态。
控制台停靠会改变可用视口，因此 rect 只能比较同一停靠状态，不把截图绝对坐标当产品布局常量。
父折叠边界两轮已保存；当时尚缺的子折叠、编辑转换删除及选区已在下文补齐；不能仅据父折叠窗口勾选 F04。
工具提示 Chrome 被用户切换后已停止坐标输入并重新确认指定 URL；后续截图读取又遇审批容量/超时，未执行调用不计结果。

### 嵌套折叠（两轮已采集）

[子折叠 R1](./dom/F04-child-collapse-R1.json)：H9 BBB 折叠隐藏其后 ordered CCC，到 H1 DDD 停止。
[父折叠 R1](./dom/F04-nested-parent-collapse-R1.json)：随后折叠 H1 AAA，BBB 一并退出可见渲染树。
[父展开 R1](./dom/F04-nested-parent-expand-R1.json)：展开 AAA 恢复 BBB，但 CCC 仍隐藏，BBB 自身的折叠状态保留。
[子展开 R1](./dom/F04-child-expand-R1.json)：单独展开 BBB，恢复 CCC，正文顺序和编号与来源一致。
该三步采集调用在文件全部保存后超时并重置工具内核，磁盘文件可解析且 seq 分别为 3612/3623/3635。
不能因工具超时重放已经执行的三步；应恢复句柄、核对当前控制台状态后，从第二轮开始。
当时恢复句柄连续遇自动审批超时，第二轮尚未开始；随后恢复并补齐如下。

第二轮随后收齐：[子折叠](./dom/F04-child-collapse-R2.json)、[父折叠](./dom/F04-nested-parent-collapse-R2.json)、[父展开](./dom/F04-nested-parent-expand-R2.json)、[子展开](./dom/F04-child-expand-R2.json)。
两轮可见块身份、范围和恢复状态一致；工具审批失败期间未重放第一轮步骤。
[折叠 H9 编辑异常](./dom/F04-folded-heading9-edit-double.json)不计有效双轮：第一次 x 使 BBB 成为 BBBx，但后续可信 Meta+Z/Meta+Shift+Z 没有撤销，正文继续出现 z/Z 文字及空格。最终为 BBBx z Z z x z Z z。
两轮前置不同，来源未恢复，不能按文件名 double 或可见块集合一致计通过。CCC 持续隐藏只属于该异常窗口中的观察。
具体原因未知，尚不能归因于飞书或原生输入工具；随后恢复干净文本，以原生粘贴 X 重测并逐步核对 AX 与 DOM。前面曾按可见块集合误报历史可逆，已由全文审计纠正。

### F04 追加有效行为与历史

来源均为飞书实测；各 R1/R2 采用相同操作与可观察前置。
前置分组：此处粘贴编辑与转正文的早期样例保留 BBB 加粗，粘贴 X 后 BBBX 继承加粗；后续重建的 H9 删除及 F05 移动样例中 BBB 为普通文字。
H1 删除样例含末空段，H9 删除样例不含；仅在各自同前置的 R1/R2 内比较，不将不同建样混作同源。

| 用例 | 结果与证据窗口 |
| --- | --- |
| 折叠 H9 粘贴 X | BBB→BBBX，CCC 保持隐藏；undo/redo/restore 正常。采用 F04-folded-heading9-paste-edit-R1/R2，原单字符 x 异常不计入 |
| 折叠 H1 粘贴 X | AAA→AAAX，BBB/CCC 保持隐藏；历史正常。F04-folded-heading1-paste-edit-R1/R2 |
| 折叠 H1/H9 转正文 | 隐藏后续块立即出现；撤销恢复类型和编号，但保持展开。每轮重新折叠来源；F04-folded-heading1-to-text-R1/R2、F04-folded-heading9-to-text-R1/R2 |
| 折叠 H1 块菜单删除 | AAA 与隐藏 BBB/CCC 整组删除，DDD 标题改1、TAIL列表改1；历史恢复原组及折叠。F04-folded-heading1-delete-R1/R2 与各 history 文件 |
| 折叠 H9 块菜单删除 | BBB 与隐藏 CCC 删除；AAA/DDD为1/2，TAIL列表改1；历史恢复 BBB 折叠组。F04-folded-heading9-delete-R1/R2 与各 history 文件 |
| 折叠样例全选 | 首 Cmd+A 只选 AAA；第二次进入整块隐藏 textarea 的0→1空格选区。F04-folded-select-first-R1、F04-F06-folded-select-all-copy-R1/R2 |
| 整块全选删除 | 所有正文含隐藏组一起清空；一次撤销恢复、重做再清空、再次撤销恢复。F04-folded-select-all-delete-R1/R2 及各 history 文件，来源为下述累积粘贴的复杂样例，两轮同前置 |

### F06 复制及粘贴历史异常（继续执行）

两轮真实 Cmd+C 后，在 DevTools 空提示中真实 Cmd+V，读取 AX 纯文本后立即清空，未执行粘贴内容。
纯文本均为五行：1. AAA / 1.1 BBB / 1. CCC / 2. DDD / 2. TAIL，包含折叠隐藏内容及编号。
证据：F06-folded-copy-plain-probe-R1、F04-F06-folded-select-all-copy-R2。第二轮最初定长偏移提取截掉4字符，已从原保留 AX 字符串按实际前缀长度修正，没有重放操作。
复制事件未到达 document bubble 监听，不能把监听缺失解释为复制失败；纯文本通过真实粘贴探针确认。
F06-folded-body-paste-R1/R2 可观察到新折叠 AAA 和后续 DDD/TAIL，编号继续3/4。
展开粘贴 AAA 后出现 BBB，BBB 本身仍折叠，不能声称 CCC 已经显示。
F06-folded-body-paste-history-R2 的第一次 undo 只撤销展开，redo 展开，再 undo 折叠，未撤掉粘贴。
因此 R3 在已有副本来源上继续粘贴，前置不同；R2/R3 不计同条件结构粘贴双轮。
原先按预期历史步数误报通过，已由逐步状态审计纠正；折叠确实具有可观察历史步骤，不能先假设纯视图不占历史。
这些异常和累积内容保留在对应文件；随后通过真实全选转正文、粘贴五行、统一有序并转换 AAA/BBB/DDD 重建控制样例。
新基线为 F00-B-controlled-numbered-headings-v2，seq5798；新块身份不得与旧 b17/b1824 等混称同一对象。
F05/F06/F07 的后续测试以新来源为准，保存重载与协同尚未验证。

## 12 F05 目录锚点与层级

来源：飞书实测，当前环境固定指定 Chrome 页面。

### REQ-S06-F05-001 级别与编号前缀

[F05 H9→H1](./dom/F05-heading9-to-heading1-anchor-double.json)及[H1→H9](./dom/F05-heading1-to-heading9-anchor-double.json)各两轮真实转换和历史。
BBB 的目录 a 对象 b7084 与 href #A9Spdv83VoVrLsx5BCZcCmkGn3c 保持，文字在 2. BBB 与 1.1 BBB 间同步。
目录容器类在 heading-1/heading-9、indent-level-1/2 间变化；H9 在 H1 下显示第二个目录层级，不等同9倍固定缩进。
DDD 的标题编号及目录前缀同步在3/2之间变化，href保持；实际稳定身份以原始 JSON 为准。

### REQ-S06-F05-002 删除及移动

F04 的 H1/H9 删除两轮均含目录观察及真实 anchors，标题项随删除退出，undo恢复。
F05-heading-cut-paste-move-R1/R2 从折叠 BBB/CCC 来源剪切并粘贴到 TAIL 后，目录顺序随之变化，BBB 编号改为 DDD 下的2.1。
每轮 history 文件逐步断言真实 AX 块顺序：撤粘贴→撤剪切→重做剪切→重做粘贴→撤粘贴→撤剪切。
剪切粘贴可能产生新块及新 href；不能把同名 BBB 当原节点，也不能把此入口外推为拖动。

### REQ-S06-F05-003 目录与正文折叠独立

F05-outline-chevron-expand/collapse-R1/R2：正文 AAA 折叠时，点目录 AAA 箭头可单独显示/隐藏目录 BBB，正文 BBB/CCC 始终隐藏。
目录可展开并不表示正文已展开；二者分别存状态。

### REQ-S06-F05-004 隐藏标题的导航

F05-outline-hidden-anchor-R1/R2：正文 AAA 折叠、目录 BBB 可见时，点 BBB 目录链接会展开隐藏正文，使 BBB/CCC 可读。
同来源两轮正文滚动容器 scrollTop 均为134；这是当前短样例及视口的实测值，不作为固定偏移常量。
链接 href 与标题 record-id 对应，点击后的 active 项、滚动及展开变化保留在 related 和 external 中。
空标题、重复标题与唯一锚点随后由F07代表双轮补齐，见第17节；各导航仍按具体来源分别判断。

## 13 F06 查找（已取得双轮）

REQ-S06-F06-001，来源：飞书实测。F06-folded-find-BBB-R1/R2 从 AAA 折叠、查找框空值开始。
原生 AX setValue 设置真实查找 input 为 BBB，核对焦点后真实 Return 提交，两次均为1/1，自动展开隐藏正文并定位。
查找 input 属性值与匹配计数分别记录；AX 控件的旧 label 0/0 可滞后，不用它覆盖旁侧实际计数1/1。
F06-find-number-marker-R1/R2 先查 BBB 再查1.1：后者均0/0，当前标题编号按钮不属于可查找文字。
首次尝试点击输入框后粘贴，实际替换了选中的折叠 AAA 组；已真实 Cmd+Z 恢复。
异常保存为 F06-find-focus-paste-anomaly-and-recovery，不计查找通过；随后改为对已确认控件 setValue 并核对焦点。
查找浮层的必要 DOM、input 值及相关 mutation 已在实际 .ud__modal__body 上补充观察；旧用例不追认具备该观察。
后续Word导出、两轮Chrome刷新及跨会话读取/修改见第14–18节；不能仅用查找双轮代替F06整项。

## 14 F06 Word 导出（双轮已采集）

来源：飞书实测。入口为页面“更多→下载为→Word”，默认选中“仅正文”后点击导出。
两轮来源均为 AAA 折叠、BBB/CCC 隐藏，其他标题及列表仍在；设置 DOM 分别见 F06-folded-word-export-settings-R1/R2。
原生 Chrome 下载记录显示 Untitled.docx 和 Untitled (1).docx 完成；原文件复制到 exports/F06-folded-R1.docx、F06-folded-R2.docx 保留。
[Word 导出分析](./exports/F06-export-analysis.json)保留文件哈希、正文段落、pPr、编号 XML 与去随机 ID 后的编号语义。
两份段落相同：包含1. AAA、1.1 BBB、CCC、2. DDD、TAIL及空段；折叠没有删掉导出内容。
标题编号是导出文字前缀，H1/H9 的 outlineLvl 为0/8；列表正文不含数字，使用 Word numPr，CCC起点1、TAIL起点2。
原始 numbering XML 的随机 abstractNumId 不同，解析映射后的起点/格式/编号模板语义一致，不把二进制哈希不同当导出不稳定。
本次只验证当前可达 Word 的内容与结构；PDF/Markdown 菜单已看到，但没有将它们计为已执行格式。
导出是下载读取，不是正文编辑，没有虚构导出可撤销。下载完成后 Chrome 被切到其他登录页面，未在该页输入或修改任何内容。

具体规则映射：[运行矩阵](./06-verification-matrix.md)。该表列出有效双轮选择与排除异常，阶段完成范围见第19节。

## 15 F06 结构粘贴与折叠历史（后续有效双轮）

来源：飞书实测。采用 [连续粘贴 R1](./dom/F06-structured-paste-continuous-R1.json)、[R2](./dom/F06-structured-paste-continuous-R2.json)，替代前述前置累积的探索窗口。
同一来源为 AAA 折叠、BBB/CCC 隐藏，正文可见 AAA/DDD/TAIL 及末空段；AAA/DDD/TAIL 原对象、持久记录与类型、文字、编号、行内样式一致。
起点均为 AAA 末端偏移3；两次 Cmd+A 后，真实隐藏 textarea 的值为空格、选区0→1。复制后将光标移到现有末空段的零宽字符偏移1，再真实 Cmd+V。
粘贴后可见原 AAA1 / DDD2 / TAIL2，以及副本 AAA3 / DDD4 / TAIL2 和末空段；副本 AAA 折叠。
首次撤销正文内容与标记未变，第二次撤销才移除副本；一次重做恢复副本，再一次撤销恢复来源。两轮均为此可观察的2/1/1历史序列，不推断内部事务原因。
原三块保持对象和记录身份，末空段在历史中可重建，不声称所有对象不变。
粘贴至历史步骤之间没有切入 DevTools；keys.before 保存逐步状态，原生 AX 的 historyTrace 另存可见顺序。

[隐藏副本回读 R1](./dom/F06-pasted-hidden-content-inspect-R1.json)、[R2](./dom/F06-pasted-hidden-content-inspect-R2.json)均为重做上述粘贴后再展开副本 AAA，并非又做两次新粘贴。
展开显示副本 BBB3.1 和 CCC1，副本完整组为 AAA3 / BBB3.1 / CCC1 / DDD4 / TAIL2；类型与文字正确，原组保持折叠。
各 restore 文件含两次真实撤销：先撤展开，再撤粘贴，恢复同一来源。两次回读均经专用语义断言核对。
早期 clean/stable/undo 探索文件保留，不计有效双轮；其中一次 ScreenCaptureKit 报错发生在按键之后，stable-undo-R1 实际记录两次 Cmd+Z，不能按工具报错推定动作未执行。

F06-heading1-fold-history-R1/R2、F06-heading9-fold-history-R1/R2 各从相同展开来源点击折叠箭头。
H1 隐藏 BBB/CCC，H9 仅隐藏 CCC；一次撤销展开、一次重做折叠、再次撤销展开，四份窗口的实际可信修饰键及全文标记一致。
H9 最初手柄未显露的点击没有折叠，另存 F00-B-heading9-fold-hover-miss，不计成功。
这些证据表明当前正文折叠操作可进入本地历史；不能因此推断它的服务器存储范围或其他视图操作均占历史。

## 16 F06 首次真实刷新回读（仅单轮）

[刷新前展开全文](./dom/F06-P1-source-expanded.json)为 H1 AAA1 / H9 BBB1.1 / ordered CCC1 / H1 DDD2 / ordered TAIL2 / 空正文。
[保存折叠来源](./dom/F06-P1-save-folded.json)记录 AAA 折叠及最后 B 会话 seq7732。随后真实 Cmd+R，旧观察器已不存在，安装新只读观察器。
[刷新后折叠](./dom/F06-P1-Chrome-reload-folded.json)仍隐藏 BBB/CCC；[展开回读](./dom/F06-P1-Chrome-reload-expanded-read.json)全文、类型、全部标记、行内样式、六个持久 data-record-id 及三个目录 href/文字均与刷新前一致。
数字 data-block-id 从174/173/172/138/137/244变为2/3/4/5/6/7；WeakMap引用也从b变为c，不能当作跨刷新DOM对象复用。
最后[重新折叠](./dom/F06-P1-Chrome-refold-before-Quark.json)保存新会话 S06C-P1-1792390490386 的 seq37。
本节仅证明首次Chrome读取；第二轮见第17节，夸克独立读取及远程修改见第18节。内部存储机制仍不能由这些观察判定。

## 17 恢复Chrome后的第二轮刷新与F07

sir提供Chrome权限截图，显示默认浏览始终允许、未列网站例外；随后Chrome原生读取成功且URL符合指定研究页。此前把夸克URL拒绝扩大为全部电脑操作不可用的判断已纠正；Codex自身被控制的安全拒绝也不证明Chrome被禁。
F00-C-resume-Chrome-permitted保存恢复现场；原C观察器延续到seq108。F06-P2-source-expanded/save-folded及Chrome-reload-folded/expanded-read保存第二次真实Cmd+R：旧观察器消失，新会话S06D-P2-1792391792635使用d引用。
两轮刷新前后的完整文字、类型、行内样式、所有标记、六个持久记录ID和目录href/文字一致；折叠仍在。P2专用断言通过；后续跨浏览器证据另见第18节，不外推内部存储机制。

### F07-001 9/10/11及布局

F07-list-nine-ten-eleven采用source/target/history的R2/R3；R1始于建样后的全选状态，仅作探索，不拼严格双轮。H1/H9分别采用F07-heading1/9-nine-ten-eleven的R1/R2。
各有效轮从AAA末端偏移3打开首项编号菜单，值1→9并确认；三块1/2/3变9/10/11，文字、类型、样式和持久记录保持。各轮undo/redo/restore及双轮来源选区一致。
布局取相同DevTools停靠视口、DPR1的只读rect/computedStyle；两轮相对参数一致，不能横比不同视口的绝对x坐标。

| 类型 | 标记字号/字重 | 9标记宽px | 10及11标记宽px | 标记右缘至内容起点px |
| --- | --- | --- | --- | --- |
| ordered | 16px/400 | 18 | 26.25 | 6 |
| H1 | 26px/500 | 25.6875 | 40.140625 | 6 |
| H9 | 16px/500 | 17.359375 | 26.25 | 6 |

标记左缘在同组保持；两位数变宽时正文起点同量右移，10与11宽度一致。表中内容起点来自文字区Range矩形左缘；该Range包含行容器，不把其宽度称为真实字形宽度。字体回退及其他环境需独立量测。

### F07-002 隐藏标题及普通列表更新

标题来源为AAA H1编号1、BBB/CCC H9编号1.1/1.2，折叠AAA。修改父编号9时子标题仍隐藏；展开读到9.1/9.2，原记录ID及目录同步保持。
有效同路径双轮为F07-hidden-numbering-paste-blur-probe及paste-blur-R2，各含expanded/history；首轮来源取未生效窗口paste-no-change-R2的末态seq777，第二轮source为paste-blur-source-R2。两者正文、原对象及AAA末端选区一致。
两次均真实聚焦数字框、Cmd+A、粘贴9、Tab到确定并点击。历史为撤展开→撤编号→重做编号→重做展开→撤展开→撤编号，恢复折叠来源。
早期AX设值9确认无变化、直接粘贴第二轮无变化均保留；直接粘贴也有成功探针，不能由此断言必须Tab、归因产品或工具。第二轮历史导出恢复期间额外KeyJ打开飞书搜索；正文未变，额外键单列，随后Escape关闭搜索。
普通列表采用F07-hidden-list的source/folded/expanded/history R1/R2：ordered AAA1位于折叠H1 BBB1之外，隐藏ordered CCC2/DDD3，到H1 TAIL2停止。AAA起点改9后仍隐藏CCC/DDD；展开读到10/11，五个原记录保持，标题1/2不变；同样六步历史及双轮来源选区断言通过。
这些结果证明展开回读时编号正确；没有监测已脱离DOM子节点的数据模型，不能声称已量测离DOM更新发生的确切时刻。

### F07-003/004 空标题与重复标题

F07-empty-heading1/9-double各两轮完整文字选区Backspace及真实历史。三块H1/H9/H9来源中，空标题保留类型、编号、原记录和href；目录文字为1.或1.1加空白，未观察到额外“无标题”文字替代。
F07-duplicate-heading1/9-double各两轮真实选文粘贴及历史；四块独立来源为H1 AAA1/BBB2、H9 CCC2.1/DDD2.2。BBB→AAA、DDD→CCC后，同级同名标题仍各有独立原记录及href，编号、顺序不变。
四类F07-empty/duplicate-heading1/9-navigation各source/target R1/R2，均采用四块来源，不能与三块空标题编辑来源混作同一用例。点击第二个重名或仅含编号的空标题目录项，两轮正文不变、href唯一且对应记录、active目标及滚动位置逐项一致。

## 18 F06 跨会话读取、同步与历史

来源：指定Chrome主操作、夸克辅助独立读取及必要远程修改。早期F00-Quark-access-review-rejection仍保留；sir随后明确要求夸克直接前台调用后，同一原生入口返回了研究页并可操作。此前访问拒绝不再是当前阻塞，也不作为飞书功能结论。

### REQ-S06-F06-007 两轮真实刷新与独立读取

共同来源F06-X0为ordered AAA1、H1 BBB1、H9 CCC1.1、ordered DDD2、H1 TAIL2，共五块；BBB折叠隐藏CCC/DDD。与P1/P2的六块来源分别审计，不混为同一来源。
F06-X1/X2中Chrome及夸克各真实Cmd+R、重新确认正文就绪，旧观察器不存在后安装新只读观察器。reload-folded保留折叠，reload-expanded完整回读全文。
四次完整回读的文字、类型、全部编号、行内样式、五个持久record-id、目录href及文字均与X0一致。跨刷新或跨浏览器的WeakMap引用不能用来断言同一个DOM对象。
X1-Chrome-refold是未成功折叠的点击，保留；后续refold-confirmed才是有效折叠来源。
这些结果及后述远程展开表明折叠状态在当前同账号双会话中可见并随真实刷新保留；不能推定服务器Schema、账号间共享范围或精确保存时点。

### REQ-S06-F06-008 本地与远程文字历史

F06-Collab-R1/R2来源与选区完全一致：Chrome在AAA末端偏移3真实粘贴L，夸克独立读到AAAL；夸克展开BBB，在CCC末端偏移3真实粘贴R。
Chrome自动展开并读到CCCR，H9编号仍为1.1。Chrome的undo/redo/undo只改变本地L，远程R始终保留；夸克独立确认本地L已撤销后，其undo/redo/undo只改变自己的R。
两轮逐键状态分别为Chrome的L+R→R→L+R→R，及夸克的R→原文→R→原文；可信修饰键、来源、精确选区、五个持久ID和目录href均已核对。目录文字随CCCR同步，恢复后回到CCC。
最终Chrome完整回读恢复原五块，夸克重新折叠。此结论限于同账号、不同位置的顺序修改；同位置冲突、掉线重连及不同权限账户归后续协同专题，不虚称已覆盖。

### REQ-S06-F06-009 远程编号及隐藏区同步

有效双轮采用F06-RemoteNumber-R1/R3。来源均为上述五块、BBB折叠、BBB末端偏移3；夸克点击标题1.按钮→设置编号的值→原生聚焦输入、Cmd+A粘贴9、Tab到确定并点击。
两边折叠态均读到AAA1、BBB9、TAIL10；夸克展开后，两边完整读到CCC9.1、DDD2，仍恰好五块。原持久记录和目录href保持，编号及目录文字同步更新。
六次真实历史为：撤展开、撤编号、重做编号、重做展开、撤展开、撤编号。逐步全文及标记一致，最终折叠来源恢复；另行展开完整回读CCC1.1，第三轮Chrome与夸克均确认原文。
R3首份Quark-folded-target导出误传未定义mutation游标，故该文件records为空；未重放编辑，另存folded-target-records补回来源之后的连续记录。审计不把空records解释为编号未发生变化。

R2出现额外末空段，六次历史实际有一步撤销该空段，因此最终仍为BBB9/TAIL10。文件名restored-folded与实际内容不符，保留原件并按内容判为失败；早先口头“已恢复”的判断已纠正。
R2不计有效双轮，根因未知。post-history-prefix-mismatch和anomaly-recovery记录检查及额外撤销；clean-expanded-source与Chrome-clean-expanded-source均完整匹配X0五块后才开始R3。

## 19 最终审计、清理与交付范围

2026-10-19 16:34（北京时间）完成最终清理。F00-final-Chrome/Quark-cleared保留清空后的零正文块与连续mutation末态；随后分别移除本次观察器并真实Cmd+R。
[F00-final-Chrome-after-refresh](./dom/F00-final-Chrome-after-refresh.json)与[夸克对应确认](./dom/F00-final-Quark-after-refresh.json)均为根已连接、正文块0、正文空、页标题空、observerPresent=false；未重新安装观察器。
两边控制台关闭，夸克恢复既有TDesign标签；[界面恢复记录](./dom/F00-final-ui-restored.json)及[最终空页截图](./06-final-clean-page.png)另存，不将11:12的历史截图当最终状态。

[审计报告](./06-audit.json)与[证据索引](./06-evidence-index.md)覆盖360份JSON：352份正文DOM、8份辅助记录；两份Word及解析另列。各观察会话已捕获seq区间内部无缺号，重复seq内容一致，根连接、指定URL及已捕获持久ID唯一性无异常。
20份早期累计文件有156条按键条目缺before，未追认逐键前置，也不当作156次独立按键。F04原生x/z/Z异常仍排除，不宣称所有原始尝试通过。
专用审计包括crossEffects 10组/42项、foldAndMove 18组/46项、boundaries 28组/173项、crossSessions 11组/81项；最后一类含1组已知R2失败及恢复断言，不当作成功用例数。最终清理四项断言均通过。

F01–F07共7/7按矩阵列明的代表范围完成。H2–H8共同行为仅按sir授权推断；Word之外格式未实测；其他账号、平台及全组合不在本轮实测结论中。未知内部存储与历史事务原因保留未知。
未修改业务代码，未运行项目构建、测试或生产验收；这部分由重构和后续验收阶段承担。S07尚未启动。
采集工具为tools/session.mjs（临时运行副本v12）；审计工具仅读取已保存文件，不补造飞书行为。
