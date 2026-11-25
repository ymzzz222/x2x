# S08 删除、移动、格式与剪贴板

状态：2026-10-22，可达补测、最终读回、清理和证据审计完成；项目安全验收一项确定失败，另有自然剪贴板拒绝及全文极限未验证，不宣称全部通过。当前逐项结论见[运行矩阵](./08-full-verification-matrix.md)及[收口清单](./08-closeout-review.md)。历史检查点、原始异常和七项项目保护合同决定保留；未改业务源码，未启动 S09。

总范围与证据标准见[总任务](../ym-research-task.md)。历史检查点中的待执行条目保留当时状态，最终处理以[收口清单](./08-closeout-review.md)为准；未测限制不算飞书行为结论或项目实现通过验收。

## 1 研究入口与现场

- 主端固定为已有 Google Chrome 标签，入口与原生 AX 读取到的 URL 均为 https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX 。
- 现有标签 ID 为 691069571；只用于本次控制定位，不作为 DOM 块身份。
- 页面显示“编辑”入口、页标题占位及“输入‘/’快速插入内容”；截图未见正文文字。
- [原生 AX 摘录](./dom/H00-start-native-AX.txt)与[空文档截图](./dom/H00-start-empty.jpg)仅证明可见现场，不能证明正文块数、节点复用、DOM 变化或保存持久性。
- S07 的最终清空证据保留在其原目录，不能代替 S08 新运行的 DOM 基线。
- 启动阻塞检查点时未编辑正文；获得前台授权后已用真实输入建立 Alpha、Beta、Gamma 三段研究样例，并开展下述删除双轮。
- 启动时尚无观察器；恢复后的真实 DOM 基线、被动监控、可信按键及选择区证据见第 7 节。

## 2 启动通道探查与阻塞（历史，已通过原生控制台恢复）

| 通道或动作 | 实际结果 | 判定 |
| --- | --- | --- |
| 按指定 URL 绑定 Chrome 标签 | 调用超时 | 未取得 DOM，不计功能用例 |
| Chrome 标签清单 | 能返回指定 URL 与标签 ID | 仅证明标签可发现 |
| 已有标签的 DOM snapshot | 调用超时 | 不能推断页面没有编辑根 |
| 受支持 CDP 的只读 Runtime.evaluate | 未取得返回，工具执行超时 | 未获得只读 DOM 结果 |
| 原生 Chrome AX 与截图 | 能读取目标 URL 和空白页面 | 仅作现场辅助证据 |
| 原生控制台快捷键、菜单入口与 F12 | 未取得可见 DevTools 或控制台输入焦点 | 输入送达或工具窗口路径待核对，不归为飞书缺陷 |

首次控制台快捷键请求后出现飞书搜索弹层；随后真实 Escape 收起。该窗口没有可信按键事件，不能据此认定请求的修饰键组合已正确送达，也不生成快捷键规则。

启动时无法取得必要正文 DOM 与变化，已遵守总任务约定询问前台使用条件。sir 随后明确答复“可以，允许使用 Chrome 前台”；已通过浏览器主菜单选中开发者工具并按 Return 打开控制台，不再等待同一前台授权。

恢复后已核对真实 URL、可编辑根、页标题、空正文及监控状态。原生文本 AX 点击不会自行建立正文焦点，已以真实坐标点击后再用 AX 选择文本建立精确光标，并验证可信方向键的 0→1 偏移；失败探针保留，不算有效双轮。

## 3 执行口径与通过条件

1. 只在指定研究文档通过真实点击、按键、输入和拖动建样及操作；不调用内部编辑命令、业务 API 或改写正文 DOM。
2. 每个子用例固定同一入口、结构、光标或选区，重建前置后执行 R1/R2。建样、失败和恢复窗口单列，不计双轮通过。
3. 每次内容操作分别记录撤销、重做及恢复；无变化、不可撤销或部分成功按真实结果记录。
4. 必要证据包含目标及受影响相邻节点、身份关系、文字和格式、mutation 顺序、焦点、选区、菜单、保存提示及异常。
5. H1/H9 共同行为各双轮；H2–H8 按 sir 既定授权仅作推断，不增加实测数，有冲突时保留并定位条件。
6. DOM 标识导出统一将 feishu 替换为 maiya；真实 URL、用户文字及源码路径保持原义。不同加载不比较 DOM 对象身份。
7. 复制剪切只采集研究样例的必要 text/plain、text/html 及类型信息；保存与恢复剪贴板的结果单列，不记录无关用户剪贴板内容。
8. 同文档与跨文档粘贴分别记录真实来源和目标；第二文档可写范围未确认时保持待执行，不沿用 S07 的只读辅助权限。
9. 剪贴板拒绝及中断只研究正常可达条件；不修改安全权限来制造结果。项目安全验收在隔离环境执行。
10. 两轮一致且需求字段、DOM、历史、恢复与验收断言齐全后才标“已验证”；限制、环境不可达与项目专项分开登记。

## 4 H01–H09 执行矩阵

下表为交付范围及实际边界。九项按 sir 接受的代表合同与限制收尾；只有对应双轮需求计为已验证，未测和项目专项仍分别列出。

| 编号 | 必须展开的子项 | 当前状态 |
| --- | --- | --- |
| H01 | 空/非空正文首中尾的 Backspace 与前向 Delete；首尾块、相邻异类 | 代表合同已交付，正文及末空段六组双轮已验证 |
| H01 | H1/H9、两类列表的标记旁、标题编号与文字边界、引用内外及嵌套边界 | 代表合同已交付，普通/编号/空编号 H1/H9、两类列表与引用首段退格双轮已验证，空编号 Delete 合并下一正文、嵌套子项退格、父项合并子项及空引用双向边界双轮 |
| H02 | 正反向跨块删除、部分文本、精确块边界及下一块偏移 0、跨容器 | 代表合同已交付，正文部分范围→编号 H1:0 的 Backspace 已双轮 |
| H02 | 正文全选删除、全选后输入替换、空文档继续输入、标题/正文跨界 | 代表合同已交付，全文退格、两种续输入、全块输入无变化、标题双向合并及反向部分范围均双轮 |
| H03 | 单块拖动上下排序；可达多块；父子、列表、引用及折叠后代 | 代表合同已交付，顶层下移、折叠父项上移及引用进出四组有效双轮；隐藏子项独立读回，分栏探查单列 |
| H03 | 嵌套及无效落点、取消、中断、拖动后的身份、焦点、选区与历史 | 原生 buttons=0 限制已留证；单块身份/历史已核对，多块、无效落点和中断缺口已获接受，仍未验证 |
| H04 | 粗体、斜体、删除线、下划线、文字色/背景色、链接 | 代表合同已交付，基本格式、链接、单独蓝字/黄底及已有组合完整历史双轮 |
| H04 | 左中右对齐、缩进、可达清格式、混合格式及转换后继续输入 | 代表合同已交付，左/中/右、有序列表 Tab/Shift+Tab 各有效双轮；颜色恢复默认保留粗体、混合粗体统一加粗双轮；完整粗体关闭 R1/R3、粗体转 H1 连续续写 R2/R3 双轮；停留后的不同历史单列；其他混合组合与清格式入口缺口按已接受限制保留 |
| H05 | 片段、整块、多块、嵌套与折叠内容的复制和剪切 | 代表合同已交付，片段、混合全文及折叠父项跨引用范围的复制/剪切双轮；带批注文字复制/粘贴隔离已双轮，测试批注已解决 |
| H05 | HTML/纯文本、编号前缀、批注、块身份；复制不变更正文与剪切历史 | 代表合同已交付，片段、混合全文及折叠范围的载荷、身份和剪切历史已有双轮；批注可见 HTML、私有记录和目标隔离分别验证 |
| H06 | 同文档、可授权的跨文档、普通与纯文本粘贴、多行、带格式 HTML | 代表合同已交付，片段/混合、多行正文/H1/H9/引用、外部富 HTML、跨文档混合及实际 Cmd+Shift+V 双轮；临时文档已回收 |
| H06 | 正文、H1/H9、列表及引用作为目标；首中尾、选区替换与接续编辑 | 代表合同已交付，普通正文中间 Range 多行替换及续写 R2/R3、编号 H9 中间替换 R2/R3、编号 H1/引用/有序项中间替换 R1/R2 有效双轮；异常前置与较长间隔历史单列，其他目标边界按已接受范围保留未知 |
| H07 | 非目标结构降级、重复身份、空内容、多行与超长内容、格式清理 | 代表合同已交付，重复身份、空内容、累计块长边界及 DL 降级已有双轮；复合行内 span 清理已补双轮，其他形态保持未知 |
| H07 | 取消和失败后的剪贴板、正文、历史与恢复；不把项目阈值当飞书规则 | 超长拒绝提示、原文/身份保护及标记历史已有双轮；其余失败入口按已接受限制保留未知 |
| H08 | 正常可达的读写拒绝、拖动中断、链接取消、无效 URL 与协议反馈 | 代表合同已交付，可确认域名取消双轮；单次 Escape 后仍排序有单轮完整历史，多动作探查排除；not a url 和原生 AX javascript:1 门禁/取消各双轮，其他协议未测，不能推广门禁结论 |
| H08 | 失败不误删、不重复插入；区分浏览器、系统、工具和产品拒绝 | 无效链接未改正文、超长粘贴未误删/重复已有局部证据；权限拒绝未测，限制已接受，不混为一类 |
| H09 | 从实际复制/粘贴结果生成文本、样式保留表及非目标结构降级表 | 代表合同已交付，固定外部 HTML 的文字/格式/颜色计算值/链接/标题/引用保留表已交付 |
| H09 | 项目 HTML 信任边界、链接与粘贴安全单列隔离环境验收 | 项目专项，未验收；该研究交付边界已接受 |

## 5 已读取的项目合同

以下来自源码静态读取，仅用于范围和差异核对，不是飞书实测或项目浏览器验收结果。完整路径相对于项目根目录；同格简写的 `extensions/`、`utils/` 均位于 `src/views/aiScriptCore/wordEdit/editor/` 下。

| 能力 | 当前可确认的源码合同 | 来源 |
| --- | --- | --- |
| 删除与空正文保护 | Backspace/Delete 先处理空正文保护及正文选区删除，普通与修订模式分别分流 | `src/views/aiScriptCore/wordEdit/editor/extensions/keyboard.js` |
| 结构剪切失败边界 | 块菜单先等待剪贴板写入成功，再删除结构锚点；修订模式走修订删除 | `src/views/aiScriptCore/wordEdit/editor/components/Drag/menuActions.js` |
| 剪贴板载荷 | 构建 HTML 与纯文本；序列化前去批注 mark，之后去批注属性并规范化外部复制结构 | `src/views/aiScriptCore/wordEdit/editor/components/common/clipboard.js`、`extensions/copy.js` |
| 编号标题外部复制 | 移除折叠图标，将编号标题构建为 ol/li/hN，保留解析出的起点 | `src/views/aiScriptCore/wordEdit/editor/utils/externalCopy.js` |
| 外部 HTML 规范化 | 有行内样式选取和块结构归一化；识别为内部 HTML、含表格或处理失败时存在返回原 HTML 的路径，不能将其输出笼统视为已安全清理 | `src/views/aiScriptCore/wordEdit/editor/utils/externalPaste.js` |
| 粘贴上限 | capture 入口读取 text/plain，以 JavaScript 字符串 length 大于 100000 时阻止并提示；正文配置上限为 460000 | `src/views/aiScriptCore/wordEdit/editor/composables/useEditorChrome.js`、`utils/config.js` |
| 链接与对齐 | Link 配置 defaultProtocol=https、openOnClick=true；文本/标题配置 left/center/right 对齐 | `src/views/aiScriptCore/wordEdit/editor/extensions/index.js` |

子目录规则引用的 `editor/extensions/keyDelete.test-matrix.md` 当前路径不存在；本次不据此补写删除行为，也不扩展为源码修复。

## 6 当前检查点与恢复顺序

- 已完成：既定阶段范围、S07 交付边界、项目相关合同和原生现场核对。
- 已留存：本阶段 AX 摘录及空文档截图；没有伪造 DOM JSON 或预先生成已验证需求。
- 静态核对：阶段与总任务的本地链接可解析，H01–H09 编号及研究交付状态一致，证据文件存在；截图实际为 JPEG，已按文件头修正扩展名。
- 已完成 H01 局部双轮及 DOM/历史记录；[H02 全文删除与选择作用域](./08-selection-deletion.md)的正文/历史/公开选择 DOM 与直接续输入已双轮验证；直接续输入进入页标题，项目目标差异已确认；最终研究交付范围见收口清单。
- 嵌套删除补充：[列表父子与容器边界](./08-nested-deletion.md)，含子项类型取消但保留父级、父项末尾合并子项、空引用退格解除包裹及 Delete 移除外部空项的双轮与身份恢复。
- 新增交付：[选区与标题边界](./08-selection-deletion.md)、[真实拖放与通道限制](./08-movement-observations.md)、[格式与链接取消](./08-formatting-contracts.md)、[剪贴板、外部 HTML、跨文档及身份合同](./08-clipboard-contracts.md)。异常和失败前置均保留排除，差异单列；临时文档已验证回收。
- 已接受的未测范围：其余删除/选区/粘贴/混合格式组合、多块和无效落点拖动、完整清格式入口及剪贴板拒绝环境，均在收口清单明示。独立保存读取与最终清理已完成；项目生产验收未执行。
- [阶段内证据检查点](./08-evidence-audit-checkpoint.json)：423 份 JSON 可解析，413 份编码快照还原哈希一致（含两份 v2 stringRef），无缺失引用/本地链接、主观察器操作错误或溢出；首轮引用内人工拖动的附加鼠标日志达到 160 条限额，已单列；109 个 R1/R2 文件组只表示配对存在，不等于功能通过，部分有效配对采用 R2/R3 或 R1/R3。新增六个有效运行、清空、两端空版本/终检及界面恢复的 12 项[补充语义检查](./08-supplement-audit.json)均通过。
- 最近实测现场：原生正文坐标在内建屏持续报 windowNotFoundAtPosition，临时通过窗口菜单移至 24B36HE 后恢复；完整粗体关闭以 R3 补齐。未监控间隔新增末空 text ID153 已单独清理，来源未定。空引用建样已明确恢复 Quote；H9 替换前另一个未监控间隔新增末空 text 已定点清理，未计有效配对。原生控制内核重建后输入恢复，后续取样/导出超时均先核对已完成步骤再继续。最后读到 Alpha 普通字重、原折叠混合结构保持，窗口在外接显示器；阶段现场清理、移回内建屏和独立保存读取未执行。该记录不是 2026-10-21 的实时现场确认。
- 本阶段只更新 `docs/editor/` 的研究文档和证据；未改业务代码，未使用 Git 命令，未修改浏览器安全设置或权限。
- sir 要求继续后已重新建样，新增两类列表尾 Delete 合并及复合行内 HTML 清理三个有效双轮，见[补充合同](./08-supplemental-contracts.md)。本轮保存、首空段探查排除、最终清空历史和双浏览器空版本/界面恢复均已完成，见[收尾记录第 9 节](./08-persistence-and-cleanup.md#9-继续执行后的最终收尾)。

### 2026-10-21 离线复核与未完成边界（历史检查点）

本轮未操作浏览器、未新增功能实测；343 份 JSON、340 份编码快照还原哈希及本地链接重新检查无缺口。
审计新增 recentContractChecks：空引用双向删除、列表父子删除、H9/引用/有序项中间替换共 7 组、14 份证据，结构、身份与三步历史均通过。
多行替换另核对唯一可信纯文本 paste、精确原选区、Two:3 光标、恢复 Range 及重做新块身份；不把文件配对存在当成语义通过。
历史按键以可信 code=KeyZ、meta/shift 判定，保留原始 key 的 Z/z 差别；没有改写原始证据来匹配断言。

上次连接夸克时，工具明确返回“Computer Use is not allowed on the current browser URL”，并终止会话、要求停止计算机操作。
该返回没有提供触发 URL，不能推断指定飞书文档被拒绝，也不能改用其他控制通道绕过限制；本轮没有重试计算机操作。
夸克独立读取、Chrome/夸克两轮刷新、最终正文/标题清空、观察器停止、控制台关闭及研究窗口移回内建屏均未因此完成。
已授权临时跨文档副本的回收证据仍有效；没有在本轮重开或另建副本。

| 范围 | 现有交付 | 仍需完成或确认 |
| --- | --- | --- |
| H01/H02 | 删除、降级、选区与标题跨界局部双轮 | 剩余代表边界及保存读取；清空续写误入标题、全块键入无替换两项差异待冻结 |
| H03 | 顶层下移、折叠父项上移双轮 | 引用进出同落点复测、可达多块与无效落点；原生 buttons=0 限制不算产品拒绝 |
| H04 | 行内格式、链接、颜色、对齐、缩进与转换续写 | 更多混合/接续条件；两个已查入口未见完整清格式，仍不能宣称全局不支持 |
| H05 | 片段、混合全文、折叠父子范围复制剪切 | 批注载荷实测；先前创建“S08 临时批注”并测完解决的授权问题尚无明确答复，不提交批注 |
| H06 | 同/跨文档、纯文本、富 HTML、三类中间替换 | 其余代表目标边界与保存读取；隐藏选择历史失效和撤销残留差异待冻结 |
| H07 | 重复身份、空载荷、ASCII 累计块阈值、DL 降级 | 其余格式降级与失败恢复；累计阈值及定义项边界丢失差异待冻结 |
| H08 | 链接取消、无效文本及 ASCII javascript:1 门禁双轮 | 可达剪贴板读写拒绝；受控单次 Escape 仅一轮，其他动作混杂窗口排除 |
| H09 | 固定样例的保留/降级表 | 项目 HTML/链接安全为隔离环境专项；不能将正常样例通过扩大为安全验收通过 |
| 收尾 | 各最近建样已按已知历史恢复 | 先重新核对真实现场与监控，再补测、两轮独立保存读取，最后清空及恢复窗口 |

上表保留当时的授权、控制和待决策状态；后续补测与清理见下节，七项产品差异以“已确认的项目差异”为准。未覆盖项仍保留原总范围，不勾选 H01–H09，不能用既有阶段刷新代替 S08。


### 2026-10-21 前台恢复后的新进展（收口确认前）

[Chrome 恢复基线](./dom/H00-20261021-Chrome-resume-checkpoint.json)重新确认指定 URL、7 节点、Title 和原监控就绪。
编号 H1 中间替换、带批注文字复制/粘贴隔离及编号 H1/H9 末尾合并下一普通段均已补有效双轮，分别见剪贴板合同第 33/34 节和嵌套删除第 8/9 节。
批注提交已明确获准，测试后通过“解决并隐藏”完成，侧栏评论（0），已解决标识残留按真实结果记录；上表 H05 的授权缺口已解除。
[独立保存读取](./08-persistence-and-cleanup.md)已完成 Chrome/夸克各两轮真实 reload，7 节点折叠与 8 节点展开的编号、父子和样式均一致；早期派生字段缺口和未成功收起的探查保留排除。
审计新增 20 份近期合同、2 份批注载荷隔离、11 份有效双浏览器保存读取的语义检查，均通过；不改变整项 0/9 判定。
Chrome 六点手柄将 Alpha 移入引用首段的有效 R1/R2 及三步历史已补齐，目标和相邻块身份保持，见[移动记录第 12 节](./08-movement-observations.md#12-req-s08-h03-003-单次手柄拖动进入引用首段)。左右分栏及 TextOutlined 入口探查分别保留，不混入该双轮；3 份引用落点/手势/身份/历史语义检查通过。引用首段上提时实际保留为独立引用；输入故障恢复探查已排除，受控 R1/R2 的手势、身份、语义和历史检查均通过；建样清理已精确恢复原混合版本。最终窗口菜单仅提供移到 24B36HE，按两屏配置推定当前在内建屏；独立显示器标识未读取。多块来源已取得真实 Alpha/Beta 跨块选区，正文/控件预点击打断的窗口保留排除；完整正向选区也在拖动前折叠，反向完整选区也在六点拖动前被点击清掉；该单块移动已由助手自行撤销；原生手柄复核的未过滤移动仍为 buttons=0，详见[移动记录第 17 节](./08-movement-observations.md#17-自行恢复成功与原生拖动通道复核)。没有待人工拖动请求；最终空版本、清理历史及界面恢复见[收尾记录第 7、8 节](./08-persistence-and-cleanup.md#7-真实清空逐步撤销与重做)。

### 已确认的项目差异

2026-10-21，sir 明确选择“统一保留项目保护合同（建议）”，以下七项冻结为相对飞书实测的明确偏差。此决定只确定项目目标合同，未修改实现，不表示项目验收通过，也不补齐未执行用例或接受其他限制。

| 差异编号 | 已观察事实 | 已确认的项目目标合同 |
| --- | --- | --- |
| DR-S08-H02-001 | 全文清空后直接输入进入页标题 | 清空后在明确的正文落点续写，保护页标题，见[选区合同第 4 节](./08-selection-deletion.md) |
| DR-S08-H02-002 | 全块结构选择下普通键入不替换正文 | 支持确认正文选区的输入替换，不能以无变化作为成功；中文组合等条件仍独立验证，见[第 6 节](./08-selection-deletion.md) |
| DR-S08-H04-001 | 域名链接入口自动加 http | 保留项目 defaultProtocol=https，见[格式合同第 7 节](./08-formatting-contracts.md) |
| DR-S08-H06-001 | 粘贴后隐藏选择承载中的立即 Undo 无变化，标题焦点下有效 | 粘贴后在原编辑焦点即可撤销，无需先聚焦标题，见[剪贴板合同第 6 节](./08-clipboard-contracts.md) |
| DR-S08-H06-002 | 富 HTML 粘贴后撤销仍有额外空段残留 | 撤销精确恢复原内容和结构，不残留额外空段，见[第 10 节](./08-clipboard-contracts.md) |
| DR-S08-H07-001 | 固定 ASCII 条件呈现累计块长 100000 边界 | 保留项目单次 plain 字符串长度 100000、全文配置 460000；不新增飞书累计块阈值，未测 Unicode 口径不冻结，见[第 18/19 节](./08-clipboard-contracts.md) |
| DR-S08-H07-002 | DL 定义项降为连续文字，语义边界丢失 | 降级须保留可读的术语/定义边界；不指定未验证的分隔实现，项目实际结果未验收，见[第 21 节](./08-clipboard-contracts.md) |

## 7 监控恢复与证据完整性

[真实空文档基线](./dom/H00-live-baseline.json)与[观察器基线](./dom/H00-observer-baseline.json)分别保存原生控制台实际读取结果。
正文为 page-block-children，初始渲染容器无正文块；标题仅 U+200B。只读观察器记录正文与标题的必要 childList、字符及语义属性变化，WeakMap 引用用于单会话身份判定。

[建样](./dom/H00-three-text-fixture.json)用真实输入建立三段；该早期事件筛选未覆盖全部输入承载，不能作可信键位证据。
[未送达探针](./dom/H00-hidden-input-key-probe.json)没有正文事件，保留排除。
[有效方向键探针](./dom/H00-native-key-delivery-R2.json)取得真实 ArrowLeft、Gamma 偏移 2→1；[精确光标探针](./dom/H00-AX-caret-probe.json)取得 Alpha 偏移 0→1。

观察器重建前后分为独立会话，不把不同会话的相同 n 引用当作同一节点。
字段 valueAtDelivery 是 mutation 交付时读取的新值，不伪造每次同步写入的中间值。
证据经 gzip 分段从控制台输出，完整拼接并解压后保存；body/title 重复快照通过 snapshotRef 和文件内字典精确还原，保存规范化前后 SHA256 与还原校验。

[控制台既有状态](./dom/H00-console-existing-summary.txt)记录操作前已有 17 个错误、2 条警告及其类别；这些不归因于 H01。
每个运行的 errors 只表示本观察窗口捕获的 error/unhandledrejection，不等同全部浏览器引擎控制台清零。

## 8 REQ-S08-H01-001 普通正文段尾退格与历史

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；只覆盖本条条件。

前置为三个顶层 text 块 Alpha、Beta、Gamma，空页标题、编辑模式；先真实点击正文建立根焦点，再通过原生文本选择把折叠光标置于 Alpha 偏移 5。
动作依次为 Backspace、Cmd+Z、Cmd+Shift+Z、Cmd+Z，每步等待原生状态读取并保留键前与下一动画帧的 DOM/选区。

证据：[R1](./dom/H01-text-tail-backspace-R1.json)、[R2](./dom/H01-text-tail-backspace-R2.json)。
两轮均取得四次可信 keydown，撤销/重做的 Meta 与 Shift 组合符合实际动作；不是通过内部命令制造历史。

- Backspace 将 Alpha 改为 Alph，仍为 text、仍为三块，光标同一文字节点 n16 偏移 4。
- 第一次撤销恢复 Alpha/偏移 5；重做恢复 Alph/偏移 4；再次撤销恢复 Alpha/偏移 5。
- 当前监控会话内 Alpha 外层 n10/ID 2、Beta n19/ID 3、Gamma n28/ID 4 保持，Alpha 文字节点 n16 在四步间复用；相邻段文字未变。
- 必要字符变化及焦点 class 变化保留在 JSON；不得把 mutation 总数当作删除字符数量。
- 两轮 errors 与 overflow 均为空；末态可见“已经保存到云端”，本条没有独立重载读取，不宣称持久性已验证。

复刻需求与验收：从同样三段和精确末端光标开始，每次操作核对上述文字、块数、类型、外层/文字身份及光标偏移，页标题和相邻段保持；最终能从恢复后的 Alpha 继续编辑。
此条不推断空块、段首合并、跨块选区、Unicode、列表/编号、引用、修订或只读行为。项目合同要求删除仅改变确认范围，项目实现仍需独立验收；观察到的 DOM 不能用来推断飞书内部存储协议。


## 9 REQ-S08-H01-002 段首前向删除

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；前置仍为 Alpha/Beta/Gamma 三个 text、空页标题、编辑模式，精确光标在 Alpha:0。
真实动作与历史链为 Delete → Cmd+Z → Cmd+Shift+Z → Cmd+Z；证据：[R1](./dom/H01-text-start-delete-R1.json)、[R2](./dom/H01-text-start-delete-R2.json)。

Delete 得到 lpha:0；首次撤销恢复 Alpha:1，重做 lpha:0，再次撤销 Alpha:1。不能把撤销后的光标写成恢复最初 Alpha:0。
四步的外层 n10/ID 2 与文字 n16 复用，Beta/Gamma 类型、文字及外层身份保持；页标题未变，errors/overflow 均为空。
复刻验收逐步核对文字、三块结构、上述身份和真实光标落点，并能从末态继续输入。保存提示可见但未独立重载；此条不覆盖跨块或特殊容器。

## 10 REQ-S08-H01-003 普通段间双向合并及恢复身份

状态：两种入口分别同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置均为 Alpha/Beta/Gamma 三个顶层 text、空页标题、编辑模式；R2 从前轮历史恢复后的同语义三段开始，不要求随机 ID 字面值相同。

| 入口 | 真实光标与动作 | 证据 |
| --- | --- | --- |
| 后段首退格 | Beta:0，Backspace | [R1](./dom/H01-text-start-backspace-merge-R1.json)、[R2](./dom/H01-text-start-backspace-merge-R2.json) |
| 前段尾前向删 | Alpha:5，Delete | [R1](./dom/H01-text-end-delete-merge-R1.json)、[R2](./dom/H01-text-end-delete-merge-R2.json) |

每轮均在目标动作后执行 Cmd+Z、Cmd+Shift+Z、Cmd+Z，并保留每次可信按键、必要 DOM/mutation、焦点及选区。
首次动作均变为 AlphaBeta/Gamma 两段；前段 n10/ID 2 与其文字 n16 复用，Beta 外层移除，Gamma n28/ID 4 保持。首次合并后折叠光标在 AlphaBeta:5。

撤销重新拆为 Alpha/Beta/Gamma，Alpha 与 Gamma 保持，恢复出的 Beta 外层和 ID 新建；两次撤销分别生成新的 Beta 身份，不能要求历史恢复原后段 DOM 或原 ID。
例如后段首退格 R1 的 Beta 为 n19/3 → 移除 → n40/6 → 移除 → n51/7；R2 为 n51/7 → n60/8 → n69/9。
前段尾 Delete 的 R1 为 n69/9 → n78/10 → n87/11，R2 为 n87/11 → n96/12 → n105/13，移除步骤见各文件。

选区存在时序差异，须保留而非平均：后段首退格的重做首帧两轮均短暂落在 BODY；前段尾 Delete 的重做首帧两轮均为 AlphaBeta:9。下一次真实撤销按键前，两种入口均已恢复 AlphaBeta:5。
因此首帧快照不是稳定完成时刻，不把 BODY 或偏移 9 写成可持续编辑的最终落点；两次撤销后的稳定可读落点均为 Alpha:5，三段结构可继续编辑。

复刻验收需同时覆盖两入口、外层复用/后段重建、相邻不变、完整历史及可继续编辑的稳定选区。短暂中间态保留为飞书时序观察；项目按已确定的[数据不变量](../ym-research-task.md#各步骤都检查的数据不变量)验收稳定且有效的光标，不要求制造无效选区。本项不再作为待产品确认的差异，也不推断飞书内部事务时序。
四轮 errors/overflow 均为空，保存提示不替代独立持久化。此条不推断列表、引用、标题、折叠后代或跨页标题合并。


## 11 REQ-S08-H01-004 末空正文块的两种删除入口

状态：两入口各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为 Alpha/Beta/Gamma 后接一个仅 U+200B 的空 text 块，页标题为空、编辑模式；[建样](./dom/H00-empty-tail-fixture.json)由 Gamma 末尾真实 Enter 创建，不以修改 DOM 建样。

| 入口与精确前置 | R1/R2 证据 | 删除后结果 |
| --- | --- | --- |
| Gamma:5 按 Down 到空叶 U+200B:1，再 Backspace | [R1](./dom/H01-empty-tail-backspace-R1.json)、[R2](./dom/H01-empty-tail-backspace-R2.json) | 空块移除，Gamma:5 |
| Gamma:5 直接 Delete | [R1](./dom/H01-text-end-delete-empty-next-R1.json)、[R2](./dom/H01-text-end-delete-empty-next-R2.json) | 空块移除，Gamma:5 |

两入口各轮均执行 Cmd+Z、Cmd+Shift+Z、Cmd+Z，依次恢复四块、再次三块、再次四块；前三段 n10/ID 2、n105/ID 13、n28/ID 4 的外层身份和文字保持。
恢复出的空块每次均新建外层、ID 及空叶，不能把“恢复空段”写成复用删除前的空 DOM；完整映射见 JSON。
Backspace 入口撤销后的首帧在 Gamma:5，下一次真实重做前已在新空叶:1；Delete 入口的上述读数均为 Gamma:5。记录真实时序，不从首帧读数推出最终光标。

复刻验收核对四/三块往返、唯一被删除的空块、空叶恢复、相邻身份、可信键位和可继续编辑位置；页标题保持为空。
四轮 errors/overflow 均为空。本条无独立重载，不覆盖唯一空正文、首空块、连续空块或特殊容器中的空项。


## 12 REQ-S08-H01-005 普通 H1/H9 开头退格先降级

状态：H1/H9 各同前置双轮已验证；仅覆盖下述入口和读取到的状态。来源：指定飞书 Chrome 实测。
前置为 Alpha text、Beta 普通 H1 或 H9、Gamma text，空页标题、编辑模式，Beta 折叠光标偏移 0。
建样分别通过真实 Cmd+Option+1/9，见[H1](./dom/H00-heading1-fixture.json)、[H9](./dom/H00-heading9-fixture.json)；可信键位记录为 Digit1/Digit9、Meta/Alt=true，key 显示 ¡/ª，不按字符名称误判物理键位。

| 来源 | 动作及完整历史 | 证据 |
| --- | --- | --- |
| 普通 H1 Beta:0 | Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z | [R1](./dom/H01-heading1-start-backspace-R1.json)、[R2](./dom/H01-heading1-start-backspace-R2.json) |
| 普通 H9 Beta:0 | 同上，固定同一来源及光标 | [R1](./dom/H01-heading9-start-backspace-R1.json)、[R2](./dom/H01-heading9-start-backspace-R2.json) |

首次 Backspace 将 Beta 从 heading1/heading9 变为 text，不与 Alpha 合并，三段文字、顺序、外层 n105/ID 13 与 record-id 保持。
内部标题/正文包装、zone 和文字叶随类型往返重建；不能从外层 ID 稳定推断内部文字节点复用。
历史四步类型依次为 text → 原标题 → text → 原标题；Alpha n10/ID 2 与 Gamma n28/ID 4 保持，页标题无变化。

焦点与选区按实际窗口交付：首次降级的首帧仍为 Beta:0；各次历史首帧可见 docx-selection-hidden-textarea 承载焦点，原生 DOM selection 落 BODY，不能把它写成正文可见光标或直接判丢失内容。
重做后下次撤销的 keydown 确实投递到隐藏 TEXTAREA；最终导出时已回到正文根与新标题文字 Beta:0。四轮的事件、selectionchange 时间线和 activeElement 均保留，不推断飞书的内部选区模型。

复刻验收：精确标题开头退格先降级、保持文字和相邻段、历史恢复原类型与外层身份，并从最终 Beta:0 继续编辑；中间隐藏承载差异须核对可观察交互，不以 BODY 偏移作为项目光标位置。
H2–H8 的共同降级行为仅作“推断（sir 已授权抽样）”，不增加实测数；不推断编号标题、标题后代、折叠或非开头删除。
四轮 errors/overflow 均为空；仅取得保存提示，未独立重载，也未执行项目验收。

目录出现后正文横向位置变化，两次前置失败均由焦点守卫停止，未发送目标退格：[旧坐标](./dom/H01-heading1-start-backspace-R1-precondition-failed.json)、[旧函数引用](./dom/H01-heading1-start-backspace-R1-layout-probe-failed.json)。
后续按真实 editable zone 的当前 DOM 矩形定位，再核对原生正文焦点及 AX 精确文本位置；固定截图中的原生内容区顶偏移为 87px，窗口尺寸改变时须重新核对。


## 13 REQ-S08-H01-006 H1/H9 正文字母删除与标题类型保持

状态：H1/H9 的两个方向各同前置双轮已验证，共四组。来源：指定飞书 Chrome 实测；前置为 Alpha text、Beta 普通 H1 或 H9、Gamma text，空页标题、编辑模式。

| 精确前置与真实动作 | Delete/Backspace 后、撤销后、重做后、再撤销后 | 证据 |
| --- | --- | --- |
| Beta:0，Delete | eta:0 → Beta:1 → eta:0 → Beta:1 | [R1](./dom/H01-heading9-start-delete-R1.json)、[R2](./dom/H01-heading9-start-delete-R2.json) |
| Beta:4，Backspace | Bet:3 → Beta:4 → Bet:3 → Beta:4 | [R1](./dom/H01-heading9-tail-backspace-R1.json)、[R2](./dom/H01-heading9-tail-backspace-R2.json) |

每行完整历史链均为目标键 → Cmd+Z → Cmd+Shift+Z → Cmd+Z。H9 的四步类型、Beta 外层 n105/ID 13 与文字叶 n374 保持；相邻 Alpha/Gamma 的文字、类型和外层身份不变。
这与 H9:0 的 Backspace 先降级不同，不能把两种删除键统一实现为标题降级。Delete 的撤销落点为 1，不能硬写恢复到最初偏移 0。

复刻验收按两行分别核对可信实际键位、字符删除范围、标题类型、节点复用及逐步光标；最终恢复 Beta，可继续输入。四轮 errors/overflow 均为空，仅保存提示而无独立重载。
H1 同方向对照由[建样](./dom/H00-heading1-character-fixture.json)及开头 Delete [R1](./dom/H01-heading1-start-delete-R1.json)/[R2](./dom/H01-heading1-start-delete-R2.json)、段尾 Backspace [R1](./dom/H01-heading1-tail-backspace-R1.json)/[R2](./dom/H01-heading1-tail-backspace-R2.json)补齐，文字与偏移序列和 H9 一致；H1 类型、外层 n105/ID 13 及文字叶 n388 保持。H2–H8 共同行为仅作授权推断，不增加实测数量。格式、编号标题、Unicode 和跨块删除不由本条推断。


## 14 REQ-S08-H01-007 两类列表开头退格取消标记

状态：无序与有序各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为 Alpha text、Beta 顶层单项列表、Gamma text，空页标题、编辑模式；折叠光标在列表文字 Beta:0，未选择标记。
[无序建样](./dom/H00-bullet-fixture.json)使用正文转换及 Cmd+Shift+8；[有序建样](./dom/H00-ordered-fixture.json)使用 Cmd+Shift+7，实际分别显示 • 与 1.，不把标记计入 Beta 文字偏移。

| 来源 | 动作与完整历史 | 证据 |
| --- | --- | --- |
| bullet，文字 Beta:0 | Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z | [R1](./dom/H01-bullet-start-backspace-R1.json)、[R2](./dom/H01-bullet-start-backspace-R2.json) |
| ordered 起点 1，文字 Beta:0 | 同上 | [R1](./dom/H01-ordered-start-backspace-R1.json)、[R2](./dom/H01-ordered-start-backspace-R2.json) |

首次 Backspace 变为同位置 text Beta:0，移除对应项目符号或编号；不删首字，不与 Alpha 合并，不改变三段顺序及文字。
目标外层 n105/ID 13、record-id 保持，内部标记、包装与文字叶随类型重建；Alpha n10/ID 2 和 Gamma n28/ID 4 保持。
历史类型依次为 text → 原列表 → text → 原列表，有序编号恢复为 1.；最终回到正文根及恢复出的列表文字 Beta:0。

各次历史首帧可见隐藏 TEXTAREA/BODY 原生选区，完整 activeElement 与 selectionchange 保留；不将其映射为列表文字偏移，也不从可见编号恢复推断内部存储。
复刻验收需分别核对标记、类型、文字、身份、相邻不变、完整历史和最终可继续编辑落点。四轮 errors/overflow 均为空，保存提示不替代独立读取。
本条不推断 Delete 的文字删除、空项退出、嵌套/多项或重启编号；这些仍为 H01 待测边界。


## 15 REQ-S08-H01-008 两类列表开头 Delete 保留标记

状态：ordered/bullet 各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为 Alpha text、Beta 顶层单项列表、Gamma text，空页标题、编辑模式，列表文字 Beta:0。无序对照的[建样](./dom/H00-bullet-character-fixture.json)由有序通过真实 Cmd+Shift+8 转换。

- 有序：[R1](./dom/H01-ordered-start-delete-R1.json)、[R2](./dom/H01-ordered-start-delete-R2.json)，编号 1. 始终保留。
- 无序：[R1](./dom/H01-bullet-start-delete-R1.json)、[R2](./dom/H01-bullet-start-delete-R2.json)，项目符号 • 始终保留。

两入口各轮真实动作链均为 Delete → Cmd+Z → Cmd+Shift+Z → Cmd+Z，文字与光标依次为 eta:0 → Beta:1 → eta:0 → Beta:1。
列表类型、目标外层 n105/ID 13 与其文字叶保持；有序叶为 n585，无序叶为 n597。Alpha/Gamma 的文字、类型和外层身份保持，页标题不变。
与上条 Backspace 取消标记的行为不同，Delete 不能实现为列表降级；撤销不得按最初位置硬置到 0。

复刻验收分别核对真实键位、标记、类型、文字范围、节点复用、历史及最终可继续编辑落点。四轮 errors/overflow 均为空；仅有保存提示，无独立重载。
本条只覆盖顶层单项列表，不推断空项、嵌套、多项编号重算、标记区域选中或其他属性组合。


## 16 REQ-S08-H01-009 引用首段开头退格取消容器

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置依次为 Alpha text、Beta bullet、Gamma text、引用容器中的唯一 text Quote、引用外空 text；空页标题、编辑模式，光标在 Quote:0。
有效建样见[纯文本粘贴前缀窗口](./dom/H00-quote-default-paste-probe.json)和[引用内部输入](./dom/H00-quote-fill-fixture.json)。前者实际 paste 事件仅有 text/plain='>'，页面当次生成空引用及外部空段；这只是本条建样记录，尚无同条件双轮，不据此生成通用粘贴规则。

动作链为 Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z；证据：[R1](./dom/H01-quote-first-text-backspace-R1.json)、[R2](./dom/H01-quote-first-text-backspace-R2.json)。
首次退格取消引用容器，Quote 成为同位置顶层 text，不与 Gamma 合并；内部块 n618/ID 25、文字 n636 与 Quote:0 保持。Alpha、bullet Beta、Gamma 及外部空段 n628/ID 26 保持。

撤销重建引用容器并将原 Quote 块移回其中，重做再次取消，再次撤销再重建；内部块与文字复用，但容器 ID/对象每次新建。
R1 容器为 n611/24 → 移除 → n637/27 → 移除 → n647/28；R2 为 n647/28 → n657/29 → n667/30，完整移动/删除/新增顺序见 mutation。
历史首帧的隐藏 TEXTAREA 与 BODY 原生 selection 保留；最终读取为正文根、引用内 Quote:0。不能把原引用容器复刻为始终复用，也不从 BODY 偏移推断编辑位置。

复刻验收核对容器消失/恢复、原内部块移动、相邻及外部空段不变、完整历史和最终可继续编辑位置。两轮 errors/overflow 均为空，仅取得保存提示；未独立重载，未执行项目验收。
本条不覆盖引用中间段、引用外前向删除、空引用、内部列表/标题或嵌套引用。

引用建样的失败与差异均不计功能双轮：[文本输入通道未送达大于号](./dom/H00-quote-fixture.json)、[全文选择焦点守卫](./dom/H00-quote-prefix-selection-guard-failed.json)、[物理 Shift+Period 生成中文标点](./dom/H00-quote-Chinese-punctuation-probe.json)。
本次未修改系统输入源或浏览器权限；ASCII 粘贴后的实际载荷与结构按原证据保留，不按脚本预期补写字面前缀。


## 17 REQ-S08-H01-010 引用内文字删除保留容器

状态：两个方向各同前置双轮已验证。来源：指定飞书 Chrome 实测；前置沿用上条恢复后的单段引用，容器 n667/ID 30、内部 text n618/ID 25、文字 n636，引用外 Alpha、bullet Beta、Gamma 及空段保持。

| 精确前置及动作 | 目标键、撤销、重做、再撤销后的文字与光标 | 证据 |
| --- | --- | --- |
| Quote:0，Delete | uote:0 → Quote:1 → uote:0 → Quote:1 | [R1](./dom/H01-quote-start-delete-R1.json)、[R2](./dom/H01-quote-start-delete-R2.json) |
| Quote:5，Backspace | Quot:4 → Quote:5 → Quot:4 → Quote:5 | [R1](./dom/H01-quote-tail-backspace-R1.json)、[R2](./dom/H01-quote-tail-backspace-R2.json) |

四步都保持引用容器、内部 text 外层与文字节点对象；只改确认的字符，引用外各块不变。各次历史均为真实 Cmd+Z/Cmd+Shift+Z/Cmd+Z，最终仍在原引用文字中继续编辑。
复刻验收不能将引用内 Delete 或段尾 Backspace 实现成取消容器；开头 Backspace 的容器取消另按上条验收。
四轮 errors/overflow 均为空，仅有保存提示、无独立重载。未推断空引用、多段、跨引用边界或嵌套条件。


## 18 REQ-S08-H01-011 编号 H1/H9 开头退格先取消编号

状态：H1/H9 各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为 Alpha text、编号 1. 的 Beta H1/H9、Gamma text、Quote 引用及外部空段，编辑模式、空页标题，文字光标 Beta:0，未选择编号按钮。
[编号 H1 建样](./dom/H00-numbered-heading1-fixture.json)由有序列表转换，编号与文字区域分离；[H9 建样](./dom/H00-numbered-heading9-fixture.json)保持编号。编号为 contenteditable=false 的 BUTTON.heading-order，文字位于 heading-content 的独立编辑 zone。

| 来源与动作 | 完整历史 | 证据 |
| --- | --- | --- |
| 编号 H1，Beta:0，Backspace | Cmd+Z → Cmd+Shift+Z → Cmd+Z | [R1](./dom/H01-numbered-heading1-start-backspace-R1.json)、[R2](./dom/H01-numbered-heading1-start-backspace-R2.json) |
| 编号 H9，Beta:0，Backspace | 同上 | [R1](./dom/H01-numbered-heading9-start-backspace-R1.json)、[R2](./dom/H01-numbered-heading9-start-backspace-R2.json) |

首次退格只移除编号按钮，Beta 保持原 H1/H9、外层 n105/ID 13 与文字叶；不降为 text、不与 Alpha 合并、不删除首字。文字叶 H1 为 n697，H9 为 n721，四步光标均保持 Beta:0。
撤销恢复编号 1.，重做取消编号，再撤销恢复；按钮每次重新生成，标题内部其余文字结构保持。H1 按钮引用由 n691 依历史恢复为 n705/n707，R2 为 n707→n709/n711；H9 对应 n715→n729/n731、n731→n733/n735。

首个动画帧快照可能仍含旧编号，不能单凭该帧判无变化。两轮均在下一次撤销/重做的真实 keydown 前读到编号有/无的正确状态，且相应 childList 明确移除/新增编号 BUTTON；完整时间顺序和原始首帧均保留。
最终恢复编号标题与 Beta:0，其他块及页标题保持，四轮 errors/overflow 均为空。保存提示不替代独立读取。

复刻验收必须区分“编号标题先取消编号”与“普通标题先降级”，核对标题级别、编号按钮重建、外层/文字复用和逐步光标；不由首帧延迟推断内部协议或固定耗时。
H2–H8 共同行为仅为授权抽样推断，不计实测。编号区域直接点击/选择、Delete、空编号标题、多层编号和后代影响尚未由本条验证。


## 19 REQ-S08-H01-012 编号 H1/H9 开头 Delete 保留编号

状态：H1/H9 各同前置双轮已验证。来源：指定飞书 Chrome 实测；前置沿用编号标题及 Quote 混合样例，文字光标 Beta:0。

- 编号 H9：[R1](./dom/H01-numbered-heading9-start-delete-R1.json)、[R2](./dom/H01-numbered-heading9-start-delete-R2.json)；编号按钮 n735、文字 n721。
- 编号 H1：[建样](./dom/H00-numbered-heading1-delete-fixture.json)、[R1](./dom/H01-numbered-heading1-start-delete-R1.json)、[R2](./dom/H01-numbered-heading1-start-delete-R2.json)；编号按钮 n739、文字 n745。

每轮 Delete → Cmd+Z → Cmd+Shift+Z → Cmd+Z，文字与光标为 eta:0 → Beta:1 → eta:0 → Beta:1；编号 1.、对应 H1/H9 类型、外层 n105/ID 13、按钮与文字节点在四步间复用，其他块及页标题不变。
复刻验收必须与 Backspace 取消编号分开；Delete 不应移除编号或降级，撤销后的光标为 1。四轮 errors/overflow 均为空，保存提示未由独立重载验证。
H2–H8 共同行为仅作授权抽样推断；编号区域直接选中、空标题、多级编号和跨块选择不由本条推断。


## 20 REQ-S08-H01-013 空普通标题退格先降为正文

状态：空 H1/H9 各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为现有混合样例末尾的唯一空普通 H1、空页标题、编辑模式；空标题为 n628/ID 26，编辑叶只有 U+200B，真实光标偏移 1，不将零宽占位误记为用户字符。
[建样](./dom/H00-empty-heading1-fixture.json)由原外部空正文真实 Cmd+Option+1 转换；[R1](./dom/H01-empty-heading1-backspace-R1.json)、[R2](./dom/H01-empty-heading1-backspace-R2.json)均执行 Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z。

首次 Backspace 保留该空块外层与位置，H1 降为 text，空叶仍可落光标；不删除该块、不并入前方引用，也不改变其他块或页标题。
历史类型为 text → H1 → text → H1，外层 n628/ID 26 保持，内部包装/空叶重建；最终为恢复的 H1 空叶:1。
历史首帧的隐藏 TEXTAREA/BODY selection 按原证据保留，最终恢复正文根；errors/overflow 均为空。
复刻验收核对降级而非移除、唯一空目标的位置、其他块不变、完整历史及可继续输入的空叶。仅保存提示、无独立重载；不覆盖空编号标题、首空块或 Delete。


空 H9 的[建样](./dom/H00-empty-heading9-fixture.json)与[R1](./dom/H01-empty-heading9-backspace-R1.json)、[R2](./dom/H01-empty-heading9-backspace-R2.json)已补齐：同一 n628/ID 26 外层在 text/H9 间往返，零宽空叶重建，首次降级与最终恢复后的光标均为对应空叶:1，其他块保持，errors/overflow 均为空。
两端共同规则可按 sir 授权推断 H2–H8，但中间级别未增加实测数；本条仍不覆盖空编号标题或 Delete。


## 21 REQ-S08-H01-014 空列表退格取消标记并保留空块

状态：空有序/无序列表各同前置双轮已验证。来源：指定飞书 Chrome 实测。
前置为混合样例最后的唯一空 ordered、编号 1.、空页标题、编辑模式；目标 n628/ID 26，文字空叶仅 U+200B，光标在该空叶:1。
[建样](./dom/H00-empty-ordered-fixture.json)通过正文及有序快捷键完成；[R1](./dom/H01-empty-ordered-backspace-R1.json)、[R2](./dom/H01-empty-ordered-backspace-R2.json)真实动作均为 Backspace → Cmd+Z → Cmd+Shift+Z → Cmd+Z。

首次取消编号并转为 text，保持目标外层、位置与可编辑空叶，不直接删掉空项，不并入前方引用；其他块及页标题保持。
历史类型为 text → ordered(1.) → text → ordered(1.)，内部标记/包装/空叶重建，最终在恢复的空叶:1。不能将此与普通末空正文的“移除整块”规则混用。
首帧隐藏输入焦点保留，最终回到正文根；errors/overflow 均为空。复刻验收核对标记、类型、空块保留、身份、完整历史及继续输入能力；未独立重载，不推断嵌套空项或 Delete。


空无序对照的[建样](./dom/H00-empty-bullet-fixture.json)、[R1](./dom/H01-empty-bullet-backspace-R1.json)、[R2](./dom/H01-empty-bullet-backspace-R2.json)已补齐：同一 n628/ID 26 外层在 text/bullet 间往返，• 标记消失/恢复，空叶重建；首次与最终光标为对应空叶:1，其他块保持，errors/overflow 均为空。
两类空列表都先取消标记而保留空目标块，不将普通末空正文的移除规则套到空列表。

## 22 REQ-S08-H01-015 文档末空 bullet 的前向 Delete 无变化

状态：固定末端与已知历史标记双轮已验证。来源：指定飞书 Chrome 实测；本次为重新加载后的独立身份会话，不与前节 n 引用混用。
证据：[R1](./dom/H01-last-empty-bullet-delete-R1.json)、[R2](./dom/H01-last-empty-bullet-delete-R2.json)。
每轮先在 Alpha 末真实输入 Tag，建立明确可撤销的内容；再点击最后唯一空 bullet，Delete 前为其 U+200B 空叶:0。
Delete 不移除空 bullet、不取消 •、不改变正文或页标题，原空外层 n66/ID7 与空叶 n76 保持；其他混合块保持。
随后 Cmd+Z 移除已知 Tag，Cmd+Shift+Z 恢复 Tag，再 Cmd+Z 移除 Tag；不能把这三步说成删除空列表的内容历史。
两轮 errors/overflow 均为空；未独立重载该无变化操作，不推广到空 ordered、其他末块或空文档。
验收同时检查实际末端、零宽空叶偏移、无内容/结构变化与明确历史标记，避免无变化后撤销未知操作。

## 23 REQ-S08-H01-016 普通段中退格与光标恢复

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H01-text-middle-backspace-R1.json)、[R2](./dom/H01-text-middle-backspace-R2.json)。
Alpha:0 逐键 Right 两次到精确偏移 2，Backspace 只移除左侧 l，得到 Apha；段落类型、块序、外层 n1098/ID103 和文字叶 n1104 保持，相邻混合内容及页标题保持。
每步历史前真实点击页标题，Cmd+Z 恢复 Alpha:2，Cmd+Shift+Z 再删除 l，Cmd+Z 再恢复 Alpha:2；必要字符变化及即时光标见对应 JSON。
两轮 errors/overflow 均为空，未独立重载；不推广 Unicode、软换行、前向 Delete 或其他类型段中规则。
验收检查删除侧别、精确字符、同一文字叶、恢复光标及完整历史，不用前后可见文字相似代替身份与位置。

## 24 REQ-S08-H01-017 普通段中前向 Delete

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H01-text-middle-delete-R1.json)、[R2](./dom/H01-text-middle-delete-R2.json)。
Alpha:2 真实 Delete 只删除右侧 p，得到 Alha；原外层 n1098/ID103、文字 n1104、段落类型及相邻混合内容/页标题保持。
每步历史前点击页标题，撤销恢复 Alpha、重做 Alha、再次撤销 Alpha；最终光标同一文字叶偏移 2。
与早期段首直接历史的恢复位置分别验收，本条包含主动点击页标题的条件，不从按键类别推导统一 +1 或原位规则。
errors/overflow 均为空，未独立重载；验收核对精确位置、删除侧别、同叶字符变化、历史与相邻保护，不推广 Unicode 或其他块类型。

## 25 REQ-S08-H01-018 引用前方正文末端 Delete 不跨容器合并

状态：带已知标记的同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H01-text-end-delete-next-quote-sentinel-R1.json)、[R2](./dom/H01-text-end-delete-next-quote-sentinel-R2.json)。
先在 Alpha 末输入 Tag，再将光标放在紧邻引用容器之前的 Gamma:5，真实 Delete；Gamma、整个引用及内部 Quote 均保持，不跨容器合并，不移除下一个字符/块。
真实 DOM 类型/文字/父子签名与操作前一致，引用、Gamma 及其他原块身份保持；每步历史前点击页标题，撤销只移除 Tag、重做恢复 Tag、再撤销移除 Tag。
不能把普通相邻 text 的段尾合并规则套到引用外壳，也不能把引用内部段首 Backspace 的解除容器规则反向套用。
[无标记探查](./dom/H01-text-end-delete-next-quote-nochange-probe.json)只证实无变化，没有撤销未知历史，不计有效双轮。
errors/overflow 均为空，未独立重载；本条不覆盖引用内部末尾、引用前为空段或跨父级选区删除。
验收核对原始落点、相邻容器结构、无内容变化、节点保护及独立历史标记，不把按键有投递等同内容已删除。

## 26 REQ-S08-H01-019 引用内部末端 Delete 移除外部空编号项

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H01-quote-tail-delete-next-empty-ordered-R1.json)、[R2](./dom/H01-quote-tail-delete-next-empty-ordered-R2.json)。
光标为引用内 Quote:5，容器之后紧邻唯一空 ordered(1.)；真实 Delete 移除外部空编号项，引用容器 n1133/99、内部 Quote n1140/100 及文字 n1146 保持，其他正文/页标题保持。
每步历史前点击页标题，撤销重建空 ordered、重做移除、再次撤销重建；空项每次恢复新身份，R2 从 n1193/107 最终为 n1215/109。
与“外部正文尾 Delete 不进入下一个引用”分别验收，不能把引用两侧边界平均为统一不跨容器规则。
[先验无变化探查](./dom/H01-quote-end-delete-outside-ordered-probe.json)实际删除了空项，保留排除；[恢复](./dom/H00-quote-tail-delete-probe-recovery.json)先撤销该删除、再撤销已知 Tag，未继续撤销未知历史。
errors/overflow 均为空，未独立重载；本条只覆盖外部空 ordered，不推断非空外块或引用后无块。
验收核对引用内部真实端点、外部空项移除、原容器/子叶保持及空项历史重建，不只检查 Quote 可见文字。


## 27 REQ-S08-H01-020 空编号 H1/H9 退格先取消编号

状态：H1/H9 各同前置双轮，历史与恢复已验证；H2–H8 仅按既定授权作共同规则推断，不计实测。
证据：[H1 R1](./dom/H01-empty-numbered-H1-backspace-R1.json)、[H1 R2](./dom/H01-empty-numbered-H1-backspace-R2.json)、[H9 R1](./dom/H01-empty-numbered-H9-backspace-R1.json)、[H9 R2](./dom/H01-empty-numbered-H9-backspace-R2.json)。
建样：[H9](./dom/H00-empty-numbered-H9-fixture.json)、[H1](./dom/H00-empty-numbered-H1-fixture.json)；前置均为 Alpha、目标空编号标题、Gamma、折叠父项、Quote 引用和末空 ordered，页标题 Title。
目标外层 n1107/ID102，保留“1.”编号、文字只有 U+200B；真实点击空编辑区并 Cmd+Left 后，Backspace 键前光标位于目标占位文字偏移 0。
可信 Backspace 仅取消编号，目标仍为相应 heading1/heading9 空块，没有删除块或改为 text；可见数据块节点保持 7 个。
明确标题焦点后 Undo 恢复编号，Redo 再取消，Undo 再恢复；目标外层及相邻所有块的身份、文字、类型和结构保持。
初次动作后占位光标为 0，历史稳定样本多为 U+200B 偏移 1，仍位于目标空标题；不声称恢复了同一个公开 DOM 偏移。
验收核对取消编号优先于降级/删块、级别及相邻保护、三步内容历史和空目标内逻辑光标；零宽占位的 0/1 如实保留，不假定为不同可见字符位置。
四轮 errors/overflow 均为空，未独立重载；本条不覆盖嵌套空标题、不同编号起点、空行之后或多块范围删除。

## 28 REQ-S08-H01-021 空编号 H1/H9 的 Delete 合并下一正文

状态：H1/H9 各同前置双轮，完整历史已验证。证据：[H1 R1](./dom/H01-empty-numbered-H1-delete-R1.json)、[H1 R2](./dom/H01-empty-numbered-H1-delete-R2.json)、[H9 R1](./dom/H01-empty-numbered-H9-delete-R1.json)、[H9 R2](./dom/H01-empty-numbered-H9-delete-R2.json)。
与第 27 节相同空编号前置、目标占位偏移 0；可信前向 Delete 将下一顶层正文 Gamma 并入目标，得到“1.Gamma”。
目标保留本轮 heading1/heading9 与编号，外层 n1107/ID102 复用；原 Gamma text 块移除，可见数据块节点由 7 减为 6，光标为合并后 Gamma:0。
Undo 恢复空编号标题与独立 Gamma，Redo 再合并，Undo 再恢复；撤销时占位光标为 1，重做后 Gamma:0，不将两者写成同一文字节点或偏移。
Gamma 属于实际被删除重建的范围：H9 R1 原 ID101，Undo 新 ID172，最终 ID173；H9 R2 前置 ID173，Undo ID174，最终 ID175。
H1 R1 前置 Gamma ID175，Undo ID176，最终 ID177；H1 R2 前置 ID177，Undo ID178，最终 ID179；不能宣称被删除后段的原身份恢复。
Alpha ID120、折叠父项 ID123、引用父子 ID148/149 和末空 ordered ID109 均保持文字、类型、身份及归属，页标题保持。
四轮 errors/overflow 为空，未独立重载；这与 Backspace 只取消编号的行为不同，不推广到下一块是列表/引用或隐藏子项的边界。
[H9 建样清理](./dom/H00-empty-numbered-H9-fixture-cleanup.json)一次 Undo 恢复 Beta；[H1 建样清理](./dom/H00-empty-numbered-H1-fixture-cleanup.json)依次恢复 H1 Beta、原 H9 Beta，末态回到原混合语义结构。
复刻验收固定空标题及其后普通段，核对目标级别/编号保持、后段内容完整迁入、实际节点生命周期、邻块保护及每步历史；项目实现仍须独立验收。
