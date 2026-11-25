# S05 嵌套与复杂组合

状态：已完成。E01–E09 按本阶段代表范围收口，38 组同条件双轮及 151 个不重复窗口已审计；复杂结构两轮有效 Chrome/夸克独立读取通过，首轮附加末空段异常保留且不计通过。深度按 sir 决定不再寻找上限，不宣称无限深度已实测。
本阶段只更新研究文档和证据，不修改项目实现。

## 范围与来源

- 主操作：[指定 Chrome 飞书文档](https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX)。
- 日期：2026-10-16、2026-10-19，北京时间；JSON 保留实际操作时间。
- 沿用 S04 的前台授权、真实界面操作及只读 DevTools 观察方式；扩展连接本次仍超时。
- sir 已确认开场现有文字可清空重建；观察器安装时正文已空，不能将此前清空归因于本阶段记录的操作。
- 创建、转换、选区、历史均使用真实按键或指针；JavaScript 只查询、监听和导出。
- 同一 session 内比较 DOM 对象及块 ID；跨加载不比较对象引用。
- DOM 标识按既定规则导出为 maiya，用户文字及来源 URL 保持原义。
- H1/H9 共同行为实测，H2–H8 仅沿用已授权的抽样推断。
- 进度与缺口见[运行矩阵](./05-verification-matrix.md)。
- 2026-10-19 的接续结果见[标题层级与跨层范围](./05-headings-and-ranges.md)，锁屏检查点保留为历史记录。
- 复杂六目标、组合历史、保存异常与合法结构表见[复杂样例与组合历史](./05-complex-history-and-persistence.md)。

## REQ-S05-E01-001 有序第二项成为前项子项

状态：同前置、同入口两轮已验证结构与局部历史。
证据：[R1](./dom/E01-ordered-child-tab-R1.json)、[R2](./dom/E01-ordered-child-tab-R2.json)。
前置为顶层 ordered PARENT / CHILD / TAIL，标记 1./2./3.；页标题为空。
点击 CHILD 文字区，Cmd+Left 到行首，再按 Tab、Cmd+Z、Cmd+Shift+Z、Cmd+Z。

观察及复刻验收：

1. Tab 将 CHILD 移入 PARENT 的 list-children，形成真实 DOM 父子关系，不能仅凭左边距推断嵌套。
2. PARENT 与 TAIL 仍为顶层，标记为 1./2.；CHILD 标记为 a.。
3. 三段文字、原外层 DOM 对象及 data-block-id 保留，外层移动与内部结构变化分别按 JSON 核对。
4. 一次撤销恢复同级 1./2./3.，一次重做恢复父子结构，再次撤销恢复三项同级。
5. 两轮事件均为真实 Tab 和历史按键，错误及溢出为 0。

恢复：本用例最后回到三项同级。独立刷新保存验证另列，未用保存提示替代持久化结论。
项目差异：当前项目的列表深度限制为 4；本条只规定第二层行为，不证明项目运行结果。

## REQ-S05-E01-002 深层列表与停止上限探查的决定

来源分开记录：飞书实测形成十五层有序祖先链；sir 随后决定“无上限。不继续探究了”。
后续需求按无固定上限处理，不再继续寻找硬上限；这不是飞书无限深度的实测证明。

七项阶梯通过真实 Tab 建立，第八至第十五项通过末项 Enter、输入新文字、Tab 继续加深。
初始七项各自有可用前项，排除了“没有可用父项所以不能继续 Tab”的伪上限。
证据包含 [N2](./dom/E01-staircase-N2-probe.json) 至 [N7](./dom/E01-staircase-N7-probe.json)、
[N8](./dom/E01-extend-depth-N8-probe.json) 至 [N15](./dom/E01-extend-depth-N15-probe.json)。
每层完整祖先链、标记、文字及动作均在对应窗口；阶梯建立为一次探查链，不计为十五个双轮用例。
有序标记从顶层起按 1. / a. / i. 循环，十五层末项为 i.。
[重复 Tab 探查](./dom/E00-first-nesting-maximum-probe.json)中，CHILD 首次成为 PARENT 子项后没有前置同级子项可继续接纳；其后无变化不能用作最大层级证据。

## REQ-S05-E01-003 十五层末项提升一层

状态：同前置、同入口两轮已验证结构与历史。
证据：[R1](./dom/E01-depth15-shiftTab-R1.json)、[R2](./dom/E01-depth15-shiftTab-R2.json)。
前置为 N1 至 N15 的 ordered 单链，N15 有十四个列表块祖先，标记 i.。
点击 N15，Cmd+Left 后按 Shift+Tab、撤销、重做、再次撤销。
N15 提升为 N14 的同级项，二者共同属于 N13；N14/N15 标记分别为 a./b.。
N1 至 N15 全文、顺序及外层身份保持；不会把 N15 提出整个列表或变为正文。
撤销恢复十五层，重做恢复十四层同级，再次撤销恢复十五层；两轮一致。
两轮错误及 overflow 为 0。后续通过独立窗口重建三项样例，没有以多余撤销清理未知历史。

## 观察与交付边界

必要证据保留结构、选区、节点身份、可信输入及 mutation；对象池去重后可精确还原原窗口。
MutationObserver 的 value 为回调时读取值，不能冒称每次属性写入的即时新值。
控制台长 JSON 展示曾被截断，未据截断文本判断结果；完整下载文件用于结构和历史审计。
窗口 errors 为空不表示 Chrome 后台网络或整个控制台没有警告。
项目 4 层列表限制与无固定上限需求存在差异，留待重构阶段处理，本阶段不改代码。
正文和标题的块级缩进 0–8 是另一项项目合同，不等同于真实列表祖先层数。

## REQ-S05-E02-001 四种列表父子组合

同前置双轮证据与真实快捷键如下；各轮均转换、撤销、重做、再次撤销，最后回原前置。

| 父类型和子类型 | 操作前置及入口 | 双轮证据 |
| --- | --- | --- |
| 有序含有序 | 三项同级有序，CHILD 按 Tab | [R1](./dom/E01-ordered-child-tab-R1.json)、[R2](./dom/E01-ordered-child-tab-R2.json) |
| 有序含无序 | 有序父子中，仅 CHILD 按 Cmd+Shift+8 | [R1](./dom/E02-ordered-to-bullet-child-R1.json)、[R2](./dom/E02-ordered-to-bullet-child-R2.json) |
| 无序含有序 | 有序父子中，仅 PARENT 按 Cmd+Shift+8 | [R1](./dom/E02-bullet-parent-ordered-child-R1.json)、[R2](./dom/E02-bullet-parent-ordered-child-R2.json) |
| 无序含无序 | 无序 PARENT 和有序 CHILD 中，仅 CHILD 按 Cmd+Shift+8 | [R1](./dom/E02-bullet-parent-bullet-child-R1.json)、[R2](./dom/E02-bullet-parent-bullet-child-R2.json) |

四种组合均保留 PARENT→CHILD 父子关系、外部 TAIL、全文及原块身份。
转换父项不会同时转换未选中的子项；转换子项不改变父项类型。
PARENT 由有序变无序后，外部有序 TAIL 的标记由 2. 变为 1.；其类型和文字保持。
有序子项在无序父项内仍显示 a.，不能把无序祖先从编号层级计算中排除。
无序项自身没有有序数字；检查标记必须限定当前项，不能读取整个父块的后代 button 冒充父项标记。

| 结构 | PARENT 自身标记 | CHILD 自身标记 | 外部 ordered TAIL |
| --- | --- | --- | --- |
| ordered→ordered | 1. | a. | 2. |
| ordered→bullet | 1. | ◦ | 2. |
| bullet→ordered | • | a. | 1. |
| bullet→bullet | • | ◦ | 1. |

ordered 标记为不可编辑 button；bullet 标记为不可编辑 div.bullet 内的 div.bullet-dot-style。
无序顶层 list 含 list-style-group-1，第二层含 list-style-group-2；本表只规定实测两层标记，不推导未测层级的无序形状。

无序三同级 CHILD Tab 另有独立双轮：[R1](./dom/E01-bullet-child-tab-R1.json)、[R2](./dom/E01-bullet-child-tab-R2.json)。
两轮都将 CHILD 移入 PARENT 下，历史往返恢复父子或同级，文字及身份保持。
本条四组合为代表第二层结构，不宣称穷尽所有深度、标记属性和混合祖先链。

## REQ-S05-E07-001 首项没有可用前项时不加深

[R1](./dom/E07-first-ordered-tab-R1.json)、[R2](./dom/E07-first-ordered-tab-R2.json)从三顶层 ordered 开始。
在 PARENT 行首按 Tab，两轮均保留三同级结构和文字，没有产生父项或块级左缩进。
这是无可用前项条件，不是层级超限。没有正文变更，不伪造本次 Tab 独立撤销单位。

## REQ-S05-E03-001 引用和列表可以互相包含

真实入口为块首输入 `/` 后点击斜杠菜单“引用”，不是粘贴字符，也不是内部命令。
[初始入口探查](./dom/E03-slash-quote-probe.json)保留粘贴 `/` 未触发菜单、删除后真实输入才出现菜单的差异。
[气泡探查](./dom/E03-bubble-focus-probe.json)和[手柄探查](./dom/E01-indent-menu-reachability.json)未取得目标菜单，不能冒充成功入口。

| 前置 | 引用后的合法结构 | 双轮证据 |
| --- | --- | --- |
| 三同级 bullet，在 CHILD 行首操作 | 顶层 quote_container 包住原 bullet CHILD；外部 PARENT/TAIL 不变 | [R1](./dom/E03-quote-contains-bullet-R1.json)、[R2](./dom/E03-quote-contains-bullet-R2.json) |
| bullet PARENT 含 bullet CHILD，在 CHILD 行首操作 | PARENT→quote_container→原 bullet CHILD；外部 TAIL 不变 | [R1](./dom/E03-list-contains-quote-R1.json)、[R2](./dom/E03-list-contains-quote-R2.json) |

原 CHILD 不会自动转为正文，引用包装与其内部块类型分别记录。
一次撤销引用创建回到原层级的 `/CHILD`，一次重做恢复不带斜杠的引用包装；再次撤销后真实 Backspace 移除 `/` 恢复同前置。
不能把斜杠仍存在的中间状态当成文字丢失或最终恢复成功。
两轮外层身份、全文、顺序、引用容器祖先和局部历史均有同窗口证据；错误及溢出为 0。

## REQ-S05-E03-002 引用内保留标题和列表祖先

前置为 bullet PARENT→quote_container→bullet CHILD，外部 bullet TAIL。
只在 CHILD 行首按 Cmd+Option+1 或 Cmd+Option+9，随后撤销、重做、再次撤销。
CHILD 分别成为 H1/H9，仍同时位于引用和 PARENT 内，不把引用提升至顶层；外部两个 bullet 不变。
H1：[R1](./dom/E03-quote-contains-heading1-R1.json)、[R2](./dom/E03-quote-contains-heading1-R2.json)。
H9：[R1](./dom/E03-quote-contains-heading9-R1.json)、[R2](./dom/E03-quote-contains-heading9-R2.json)。
两目标局部历史均恢复原 bullet CHILD，全文与外层身份保持。H2–H8 共同行为仅按既有授权推断。

## REQ-S05-E03-003 引用内部斜杠菜单不提供再次引用

[R1](./dom/E03-quote-nesting-R1.json)、[R2](./dom/E03-quote-nesting-R2.json)使用 E03-002 的同一结构。
CHILD 行首真实输入 `/` 后，基础菜单含文本、H1/H2/H3、有序、无序、代码块、分隔线和链接，没有“引用”项。
两轮均按 Escape 关闭菜单、Backspace 删除 `/`，恢复原引用结构和 CHILD 全文。
状态为“该前置的斜杠入口不可达”；未执行不存在的菜单项，不称为命令拒绝或无限嵌套验证。
气泡入口已另行双轮验证为取消当前引用，见[标题层级与跨层范围](./05-headings-and-ranges.md#req-s05-e03-004-引用内再次引用是取消包装)。外部粘贴、移动等入口仍归后续阶段。

## 10月16日锁屏检查点 历史记录

2026-10-16，北京时间：53 个不重复窗口已落盘，见[证据索引](./05-evidence-index.md)。
精确还原、SHA-256、本地链接、来源 URL、0 overflow/errors 校验通过；12 组双轮另核对实际类型、父子、全文、原外层身份及相应历史。
证据内未捕获 console 警告不代表引擎累计问题计数为 0。
已导出时正文为 bullet PARENT→quote_container→bullet CHILD，外部 bullet TAIL，页标题空。
随后开始将正文替换为 TOP/SUB/LEAF/NEXT/END 并设置 H1/H9；期间工具报 noWindowsAvailable。
CUA 目录查询明确提示 Mac 已锁定且因物理输入暂停自动解锁；当前现场及中断窗口末态未知。
已请求 sir 手动解锁。解锁前不再输入，未将中断的标题建样算作已验证。
解锁后先核对真实 URL、正文、选区、观察器 active、runs 和 overflow；导出中断记录后再重建明确前置。
当前观察器若仍在，应为 __s5 / S05-1792146317466；active 可能为 E00-heading-five-fixture，不能假定其已结束。
已将本地 harness 的 AX 读取改为完整树后更新控制台索引，避免菜单或截图后的索引变化；查询无返回先核对是否执行，不盲目重放编辑步骤。
本批未做独立保存刷新读取，也未运行项目构建、实现测试或生产 UI 验收；未修改业务代码。

## 最终交付检查点

2026-10-19 完成 E01–E09 代表范围，具体边界见[运行矩阵](./05-verification-matrix.md)。
151 份证据的精确还原、SHA-256、来源 URL、本地链接与 0 overflow/window-errors 校验通过，见[完整索引](./05-evidence-index.md)。
38 组双轮另核对同一前置、实际选区、类型、首行缩进与父子关系、标记、全文、外层身份、软换行、格式及相关历史；复用窗口不重复计组。
组合历史的三个中间状态及九次历史键逐项核对，不用最终恢复掩盖中间异常。
END-P2、END-P3 的两轮保存均在 Chrome 与夸克真实刷新读取，正文记录、父级、标记、样式及格式一致。
END-P1 的首次读取附加一个末空段，间隙未完整观测、根因未知；原窗口保留，不计通过，也不宣称任意保存情形无额外块。
最终北京时间 10:23:48 真实重载确认仅空页标题、正文为空，旧观察器不存在；导出后移除新观察器并关闭 Chrome 控制台。
夸克已恢复“剧本 · 跳跃视界”，未在第二浏览器执行功能转换。
S05 完成表示本阶段研究需求可交付，不表示项目实现、所有深度与属性全组合或生产发布验收通过；未修改项目业务代码，未运行项目构建及生产 UI 验收。
本次按 sir 要求在 S05 结束，不启动 S06。
