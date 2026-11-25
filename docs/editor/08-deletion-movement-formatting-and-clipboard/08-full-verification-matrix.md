# S08 重新验证运行矩阵

状态：2026-10-22，可达补测、证据审计与现场清理已完成；项目安全验收有一项确定失败，飞书自然剪贴板拒绝与全文最大值未验证，不宣称全部通过。
sir 在接受代表范围收尾后明确要求“继续。直到全部验证完成”；本轮重新打开原未测范围。
此前收尾是历史检查点，不再作为当前结束条件；七项项目保护合同决定仍有效。
本轮只修改研究资料与临时采集工具，不修改项目业务代码，不启动 S09。

## 1 通过口径

每个新增条件都必须固定来源、入口、块类型、父级、方向与选区，完成真实 R1/R2。
每次内容操作核对前后正文、页标题、节点身份、格式、父级、事件、mutation、焦点与选区。
Undo、Redo、再次 Undo 分步核对；无变化窗口用已知历史边界核对，不盲撤销早期输入。
只有有效条件和断言齐全才标已验证；环境不可达、单轮与被污染前置不计通过。
总任务要求显式边界及交互维度至少两两覆盖，不要求无理由执行所有维度笛卡尔积。
H2–H8 共同行为仍按既有授权推断，不增加实测次数或伪造用例。
清理必须在本轮操作全部结束后重做，旧空版本不能证明当前文档为空。

## 2 未闭合范围与执行队列

| 范围 | 本轮必要工作 | 当前状态 |
| --- | --- | --- |
| H03 多块 | 结构选区保留，两块一起顶层移动及历史 | 已双轮验证，见第 3 节 |
| H03 自身落点 | 同一块自身区域松手，不误移动及不意外产生内容历史 | 已双轮验证，见第 5 节 |
| H03 编辑区外落点 | 单次真实拖出正文再松手，核对拒绝和原文 | 已取得干净导航区双轮及标记历史，见第 18 节 |
| H03/H08 取消 | 折叠父项有效手柄拖动中一次 Escape，核对实际取消或移动与历史 | 普通单块及折叠父项已有目标手势双轮，均未取消，见第 6、14 节 |
| H03 展开父子 | 展开父项连同可见子项移动，读回层级和身份 | 已双轮验证，见第 13 节 |
| H08 剪贴板拒绝 | 正常可达的读/写拒绝，失败不剪掉原文或重复粘贴 | 尚无自然拒绝环境；不修改生产浏览器安全权限制造结果 |
| H04 清格式 | 可见入口或真实候选快捷键的范围、输出与历史 | 菜单/面板未找到；Cmd+反斜杠已双轮无变化，见第 9 节 |
| H01 删除 | 补齐两类列表空项 Delete、相邻异类与必要正反方向 | 空列表、相邻标题/引用及正文 Delete 下一列表均补双轮，见第 19、25、27 节 |
| H02 结构选区 | 新发现的局部整块选择与文字范围分开，补必要删除/替换边界 | 局部混合两块的 Backspace/Delete 与普通键入均双轮，见第 20 节 |
| H06 粘贴 | 六类目标首/中/尾、非空列表末端及反向替换的未覆盖格 | 六类目标首/中/尾已分别映射旧与新增双轮；反向范围已补，见第 21、24 节 |
| H04 混合格式 | 混合开关、跨块范围及转换续写的未覆盖两两交互 | 混合斜体、反向跨块下划线、复合删除线及混合转列表续写均双轮，见第 26 节 |
| H07 Unicode | 中文、非 BMP 表情、组合字符、软换行、多块分配及总量边界 | 中文/表情/组合序列七组、软换行两组、多块分配及超过项目总量各一组双轮已验证；飞书全文最大值未测得，见第 22–23 节 |
| H09 项目隔离验收 | 现有清理器、链接门禁、拒绝原子性与安全输入输出 | 隔离真实粘贴流程七项中六项通过、一项失败；外部旧批注身份被恢复，见第 16 节 |
| 保存及清理 | 新增版本 Chrome/夸克独立读回、本轮清空历史与刷新、变量/界面恢复 | 最终富格式及末空段变化均留证；清空/Undo/Redo 与两浏览器各两次空版本重载完成，见第 28 节 |

未闭合项不标“待用户确认”来掩盖缺口；需要真实手势时先建立前置和监控，再只请求具体单次操作。
受任务禁止的安全权限修改不会因“全部验证”变成已授权；须在正常可达环境或隔离条件内取得证据。

## 3 REQ-S08-H03-005 两个结构选中块一起下移

来源：指定 Chrome 研究文档的真实输入、人工单次拖放及公开 DOM 被动观察。
证据：[建样](./dom/H00-full-verification-four-text-fixture.json)、[结构选择入口探查](./dom/H00-full-block-selection-entry-probe.json)、[R1](./dom/H03-full-structural-multiblock-drag-R1.json)、[R2](./dom/H03-full-structural-multiblock-drag-R2.json)。
前置为四个顶层普通文本块 Alpha、Beta、Gamma、Tail，空页标题；Alpha 正文光标后真实 Escape、Shift+Down。
公开 DOM 中 Alpha、Beta 外层都有 selected 类，激活元素为 docx-selection-hidden-textarea。
原生 Range 为 BODY 折叠端点，即使 toString 返回空格，也不能用它描述两段文字范围。
原普通跨段 Range 探查不具备同一前置，仍保留排除，不推翻原始轨迹。

只拖一次 Alpha 左侧六点手柄至 Gamma 与 Tail 之间顶层横线；两轮输出均为 Gamma、Alpha、Beta、Tail。
操作阶段各一次可信 SVG mousedown 和一次 mouseup，按住的可信 mousemove 分别为 74、47 条。
观察器未采鼠标目标 data-icon，SVG 标签、单次轨迹及人工入口共同描述本条，不虚构捕获的图标属性。
历史核对阶段存在额外正文焦点点击，和首次 applied 之前的拖动窗口分开；不写成整份记录只有一次按下。
两轮各真实 Undo 回 Alpha、Beta、Gamma、Tail，Redo 回移动后，再 Undo 回原顺序。
四块的外层 DOM 引用 r4/r23/r32/r41、块 ID 2/3/4/5 全程保持；页标题树未变。
文字、父级、行内样式的双轮输入输出一致，所有恢复语义一致，errors/overflow 为空。
动作后与历史采样仍为隐藏 TEXTAREA 激活及 BODY 折叠 Range，不声称已恢复正文文字光标。
本条只证明固定的两块顶层排序，不扩大为任意多块、跨容器、全部无效落点或保存读取通过。

## 4 审计与当前现场

[本轮语义审计](./08-full-verification-audit.json)包含新增有效条件及双轮一致性，共二十五个检查组，当前零失败。
审计逐项检查结构选区、一次按下松开、可信按住移动、准确历史、原块身份、样式和标题保护。
全阶段 JSON、压缩快照及链接审计继续使用[全阶段审计](./08-evidence-audit-checkpoint.json)，不能替代上述功能断言。
本轮原生焦点多次未建立，失败均在历史键前中止；窗口菜单激活或实际正文 AX 点击后才发送按键。
最终现场已清空：Chrome/夸克各两次真实重载为零正文块、空标题；监控变量移除、研究控制台关闭，夸克恢复本轮接管时的原流水线标签。详见第 28 节。
当前不需要重复确认七项产品差异，也不重建已回收的跨文档副本或重复提交批注。

## 5 REQ-S08-H03-006 自身落点不改内容和历史

证据：[R1](./dom/H03-full-self-drop-R1.json)、[R2](./dom/H03-full-self-drop-R2.json)、[标记真实按键建样](./dom/H00-full-selfdrop-history-sentinel-key.json)。
前置为四个普通段 Alpha、Beta、Gamma、Tailx，只有 Alpha 外层 selected；页标题为空。
原生 typeText 未投递的[输入探查](./dom/H00-full-selfdrop-history-sentinel-input-probe.json)不计标记成功，后续实际 KeyX 才把 Tail 变为 Tailx。
拖 Alpha 六点手柄至本行中部，两轮各一次可信 SVG 按下与松手，按住的移动分别 166、86 条。
前后正文语义和四块外层 ID/对象均不变；首次 Undo 直接移除已知标记 x，Redo 恢复 x。
因此本条未观察到自身落点占用内容历史，不用无变化截图代替历史验证。
两轮页标题不变、errors/overflow 为空；本条不代表正文外落点或取消已通过。

## 6 OBS-S08-H08-004 单块拖动中 Escape 未取消移动

证据：[单次 Escape R2](./dom/H08-full-single-block-escape-R2.json)、[单次 Escape R4](./dom/H08-full-single-block-escape-R4.json)。
固定来源 Alpha、Beta、Gamma、Tailx，目标是 Gamma 与 Tailx 之间；实际结果均为 Beta、Gamma、Alpha、Tailx。
目标手势均有一次可信 SVG 按下，按住移动后一次 Escape keydown/keyup，之后才 mouseup；松手仍完成排序。
R2 保留完整短拖前奏：首个自身落点只导致 dragging 类开关两次，目标第二次按下前没有文字、结构、标题或样式变更。
R2 的有效局部子窗口是第二次按下至松手；原轨迹不裁剪，不能说整个窗口只有一次手势。
R4 没有前奏，新增被动手势采集在按下时读到 DragOutlined 和完整来源，松手后再次采样实际结果。
独立监听的 performance 时间有微差，审计以 10ms 内对应的主 mousedown/mouseup 对齐，不删除或改写原事件。
两个目标子窗口输入和输出一致；四块身份保留，Undo/Redo/Undo 准确恢复/重放/恢复，页标题不变，errors/overflow 为空。
这证明固定普通块条件下收到 Escape 仍移动，不等于成功取消；折叠父项的后续双轮见第 14 节；跨容器取消及项目目标仍未验收。
[未收到 Escape 的探查](./dom/H08-full-single-block-escape-missing-key-probe.json)和[实际两次 Escape](./dom/H08-full-single-block-escape-two-keys-probe.json)均保留，不计单次输入配对。

## 7 项目剪贴板写入拒绝的隔离单元检查

[隔离报告](./08-project-clipboard-isolation-audit.json)记录未修改源码的 SHA-256 与依赖替身范围，共八项检查，零失败。
执行整个 clipboard.js 和 menuActions.js 源模块，模拟系统 Clipboard API、copy 事件、Vue 生命周期、菜单锚点及删除调用。
异步与降级写入均拒绝时返回失败；实际 handleCut 等待写入成功后才调用删除，拒绝时删除次数为零。
降级成功保留 HTML/纯文本两种格式，异步成功不走降级，监听器均移除；空载荷、缺少事件剪贴板、只读及 AI 锁另行核对。
没有写系统剪贴板、没有修改浏览器权限、没有运行生产服务；载荷构建与删除为替身，不证明真实 DOM/schema、协同或系统权限集成已通过。
本报告补齐项目逻辑的一部分，不能把飞书真实读写拒绝或整个 H09 安全验收改成通过。

## 8 正文外落点的非目标与污染窗口

[旁侧留白探查](./dom/H03-full-outside-margin-probe.json)没有到指定导航区域，内容未变，标记 Undo/Redo 可逆，不计导航落点配对。
[导航区 R1 焦点污染](./dom/H03-full-outside-navigation-drop-R1-focus-probe.json)在公开 page/body 矩形左侧松手，正文未变，首次 Undo 移除标记。
其 Redo 后控制台原生焦点尝试造成额外末空段，完整窗口保留排除；[已知空段恢复](./dom/H00-full-outside-drop-extra-blank-recovery.json)已精确移除它。
[后续实际末尾移动](./dom/H03-full-outside-request-actual-tail-move-probe.json)松手于正文列下方，实际 Alpha 移到末尾；三步历史已恢复，不伪称无效导航落点。
原生通道出现窗口坐标失配、ScreenCaptureKit -3811 和管道关闭；重新绑定、窗口迁移/填充及用户激活后继续读取，均不归为飞书产品失败。
上述探查的空段和排序已恢复；第 14 节折叠建样另出现并固定了一个末空段，导航区干净双轮仍未取得，不使用用户回复“1”替代事件证据。

## 9 OBS-S08-H04-017 清格式候选快捷键无变化

证据：[格式建样](./dom/H00-full-clear-format-fixture.json)、[R1](./dom/H04-full-clear-format-shortcut-R1.json)、[R2](./dom/H04-full-clear-format-shortcut-R2.json)、[建样撤销](./dom/H00-full-clear-format-fixture-cleanup.json)。
前置为选中完整 Alpha，实际计算样式为 700、italic、underline，其余三段普通文字，页标题为空。
两轮均收到可信 Meta+Backslash，Alpha 三种格式均未改变；首次 Undo 撤掉先前格式组，Redo 恢复三种格式。
正文文字、页标题及其他块保持，errors/overflow 为空；最后单独 Undo 已知格式建样，恢复普通 Alpha。
这只证明该候选键在本条件无效果，不等于文档全局不存在清格式能力。
2026-10-21 查阅[飞书表格快捷键官方说明](https://www.feishu.cn/hc/zh-CN/articles/661397729819-在表格中使用快捷键)，其中清除格式的 Cmd+反斜杠明确属于表格，不能移植为文档支持证据。
[文档文本样式官方说明](https://www.feishu.cn/hc/zh-CN/articles/299406656534-在文档中设置文本样式)描述颜色面板恢复默认作用于前景/背景，不能代替全部行内格式清除；本阶段颜色恢复默认已有独立实测。
未以官方介绍代替当前账号 UI 实测，菜单/快捷键面板范围外仍未知。

## 10 项目 HTML 与链接的核心解析隔离检查

[HTML 隔离报告](./08-project-html-isolation-audit.json)包含十一项样例，当前零失败；正常文本/粗体/HTTPS 与脚本、事件属性、SVG/iframe、危险协议及编码变体分别核对。
执行未修改的 externalPaste.js，随后使用项目实际普通段、标题、列表项、引用节点与已安装 Link 扩展进行 DOMParser/DOMSerializer 解析往返。
内部标记和 table 的提前返回单独建样，确认中间 HTML 仍须经过 schema 解析；本报告不将结构归一化函数当通用安全清理器。
最终核心节点输出未保留脚本标签、事件属性、危险 href；正常可读文字仍在，HTTPS 链接保留。
JSDOM 没有开启脚本执行或资源加载，恶意样例只作为字符串/惰性 DOM；未访问生产服务或系统剪贴板。
项目安装的可选 canvas 原生二进制缺失，测试进程按 JSDOM 支持的无 canvas 分支加载；没有修改依赖、构建原生模块或伪称测试浏览器绘图。
隔离根为 block+，没有使用项目页壳；列表/table 使用同源官方扩展但未接项目展示属性，未装配 UniqueID、批注/修订 marks、协同或总量门禁。
因此本报告只验收所列核心解析路径；页标题保护、真实 target 插入、全部注册 marks/attrs、服务端与真实拒绝集成仍不能计通过。
源码和节点 bundle 摘要、依赖差异及每项中间/最终输出均在报告内，不以静态搜索替代动态断言。

## 11 实际完整注册 schema 的隔离复核

[完整 schema 隔离报告](./08-project-schema-isolation-audit.json)对同一十一项输入全部通过，使用实际 createMyDocExtensions 注册页壳、项目列表/table 属性及所有注册 marks。
本轮消除了第 10 节的简化根与核心节点装配限制；仍只执行 schema parse/serialize，没有运行编辑器插件或真实插入事务。
协同显式关闭，隔离环境平台为 internal；OutlineMetaView.vue 与 CharacterSectionView.vue 的 UI 声明替身已列明，节点定义和 parse/render 逻辑保持实际源码。
初次跨 VM realm 加载使依赖的 options 合并失真，出现重复扩展警告；该探查不计通过，改为同 realm 模块加载后没有该警告，重新完成全部断言。
脚本不执行、资源不加载、系统剪贴板与生产文档不参与；正常 HTTPS 和文字保留，危险标签/事件属性/协议经实际 schema 后不进入输出。
真实插入、UniqueID/长度插件、已存在批注/修订身份及目标边界仍须另行验收，不能把完整 schema 解析当作完整编辑器运行。

## 12 项目全文长度过滤器隔离检查

[长度过滤器报告](./08-project-length-isolation-audit.json)使用实际完整 schema、默认文档与已配置 DocLengthLimit 插件，共七项，零失败。
ASCII/中文 460000 单位、230000 个非 BMP 表情及 230000 组组合序列均可进入；再增加一个 UTF-16 单位的事务被整体过滤，原文对象不变。
一次插入 460001 单位也整体拒绝，标题文字计入总量；已有超长内容可减少但不能继续增加。
此处使用真实 ProseMirror 事务与该过滤器，未运行其他插件、浏览器、协同或服务端，不代替飞书 Unicode 实测。

## 13 REQ-S08-H03-007 展开有序父项携带可见子项上移

证据：[建样](./dom/H00-full-expanded-ordered-parent-fixture.json)、[R1](./dom/H03-full-expanded-parent-move-R1.json)、[R2](./dom/H03-full-expanded-parent-move-R2.json)。
前置 Alpha text、Beta ordered、其下 Gamma ordered、Tailx text，Beta 和其可见子区域结构选中。
Gamma 先前普通段 Tab 只产生 text-indent 展示类，尚不是数据块父子关系，见[探查](./dom/H00-full-text-indent-no-structure-probe.json)；转为有序后才读到 parent=Beta，未额外伪造 Tab 动作。
两轮各一个实际 DragOutlined 手势，直接按下前/松手后完整快照，Beta 移到 Alpha 前，Gamma 继续属于 Beta。
外层 ID/DOM 对象全程保持；每轮 Undo/Redo/Undo 的文字、父级、样式与标题准确，errors/overflow 为空。
R2 人工时间窗元数据未成功写入，但主事件、直接手势快照及阶段边界完整；审计按实际手柄手势而非缺失元数据判断。
只覆盖本条有序父项及一个可见子项，不外推多个后代或任意跨容器移动。

## 14 OBS-S08-H08-005 折叠有序父项中的单次 Escape 未取消

证据：[折叠建样](./dom/H00-full-folded-parent-fixture.json)、[R1](./dom/H08-full-folded-parent-escape-R1.json)、[R2](./dom/H08-full-folded-parent-escape-R2.json)、[隐藏子项真实展开读取](./dom/H00-full-folded-parent-hidden-child-readback.json)。
固定前置为 Alpha、折叠 Beta、Tailx、末空 text；Gamma 已退出渲染树，Beta 内公开 fold-folded 类存在。
建样出现了一个未计划末空段，不能将其归因于折叠；它作为明确固定基线参与两轮，不能隐去或计作无空段版本。
R1 有一次未按 Escape 的移动和一次人工 Meta+Z 前奏；第二次手柄按下的完整快照确认原前置已恢复，目标子窗口仅一次 Escape。
R2 没有前奏；两轮目标均是 DragOutlined 按住移动时一次 Escape keydown/keyup 后松手，Beta 仍上移到 Alpha 前。
各目标随后真实 Undo/Redo/Undo，恢复/重放/恢复准确，Beta 保持折叠，其他可见块、末空段与标题不变，errors/overflow 为空。
独立被动监听可能在主回调后超过 10ms 才运行；按同步回调顺序及相同按下/松手坐标对应事件，不用任意时间阈值排除真实 mouseup。
最终由助手点击可见且非零尺寸的折叠箭头，Gamma 重新出现为 Beta 的 ordered 子项，原块 ID4 保留，DOM 引用由 r32 变为 r275。
这段期间父项对象保持，隐藏子项 DOM 重建；不把退出渲染树当数据丢失，也不声称隐藏 DOM 一直复用。
本条是实际“未取消移动”结果，不是成功取消；项目取消目标没有因此被改写。

## 15 项目单次粘贴捕获函数隔离检查

[粘贴捕获报告](./08-project-paste-gate-isolation-audit.json)执行未修改的 useEditorChrome，使用真实 watcher 内的绑定函数获得实际 paste 捕获处理器，共九项断言零失败。
模拟 Vue 生命周期、事件和无关导入，不接系统剪贴板；ASCII/中文、非 BMP 表情和组合序列均按 UTF-16 100000 单位边界核对，超过时阻止默认和冒泡且仅一次提示。
空 clipboardData 不抛错，编辑器切换及卸载会移除旧监听；不据此证明真实只读或系统权限集成。
另明确记录现有边界：text/plain 为空的 HTML-only 输入不会被这道单次检查拦截；报告该条的通过只指分支观察一致，不表示 HTML 总量保护已通过。
第 12 节全文 460000 过滤器与这道单次门禁分别核对，不能合并成所有粘贴形态都已受 100000 限制的结论。

## 16 项目真实粘贴流程隔离验收：一项确定失败

[实际粘贴流程报告](./08-project-paste-integration-audit.json)执行实际项目扩展工厂、默认文档、HTML 归一化、useEditorChrome 捕获函数及 ProseMirror paste 事务，共七项，六项通过、一项失败。
正常样式/标题保护、危险脚本与协议清理、外部 data-comment-id 不恢复、伪造块 ID 被替换、plain 100001 原子拒绝、HTML-only 460001 全文拒绝均通过。
失败输入为外部 `<p><span class="comment-underline-S08-foreign">External</span></p>`；实际插入后恢复成 annotationSpan，origin=source，层 id=S08-foreign、kind=comment、state=active。
因此“不可信外部旧批注身份不进入项目批注层”的断言确定失败，不能将 H09 标为全部通过，也不将其写成待用户确认。
本结果未测试服务端批注读取或访问权限，不推导越权访问；本轮研究未修改业务解析逻辑。
另有实测边界：text/plain 为空的 HTML-only 100001 字符实际进入正文；100000 单次 plain 门禁不能描述为覆盖全部 HTML 输入。
JSDOM 禁止脚本/资源执行，使用合成剪贴板数据；协同关闭，两个节点视图声明替身，因缺少 elementFromPoint 排除 placeholder 视口 UI 插件。
其他数据插件（含 UniqueID、长度与批注解析）实际运行；不接系统剪贴板、生产文档、服务端或真实浏览器布局。

## 17 本轮混合版本保存检查点

[重载前](./dom/S08-full-mixed-Chrome-before-reload.json)、[观察器停止](./dom/S08-full-mixed-observers-stopped.json)、[Chrome R1](./dom/S08-full-mixed-Chrome-R1.json)、[Chrome R2](./dom/S08-full-mixed-Chrome-R2.json)保留本轮混合版本。
两次真实重载后 timeOrigin 分别为 1792570554438.8、1792570610426.8；公开语义摘要均为 5e0eb6afdfeca887f0da54f9a348f3b68338c396a04437f84308e68dc1f59a4e。
空标题、Alpha、Beta ordered 及 Gamma ordered 子项、Tailx 和末空 text 均一致；旧主观察器和拖动观察器均已随导航移除。
[夸克 R1](./dom/S08-full-mixed-Quark-R1.json)、[夸克 R2](./dom/S08-full-mixed-Quark-R2.json)真实重载的 timeOrigin 为 1792657738002.9、1792657776597.3；与 Chrome 相同摘要和完整语义。
夸克研究页已清除本轮变量及 Console 输出、关闭本页 DevTools，恢复当前接管时的“跳跃视界”原标签及其既有 Network 面板。
本节仅为当时混合版本检查点；所有后续操作后的最终清理已在第 28 节单列。

## 18 REQ-S08-H03-008 导航栏无效落点不改变内容或历史

证据：[标记建样](./dom/H00-full-outside-clean-sentinel.json)、[R1](./dom/H03-full-outside-navigation-clean-R1.json)、[R2](./dom/H03-full-outside-navigation-clean-R2.json)。
固定四个顶层普通段 Alpha、Beta、Gamma、Tailx；仅 Alpha 结构选中，标题为空。
两轮各一次可信 DragOutlined 按下及按住移动，松手坐标分别为 (192,683)、(256,691)，均进入正文 x=439 左侧的灰色导航栏，不是正文白色留白或列下方。
完整手势前后快照及 applied 均无内容变化；首次 Undo 直接移除先前真实 x 标记，Redo 恢复，未观察到额外内容历史。
标题、四块外层身份和样式保持，errors/overflow 为空；历史焦点点击与目标拖放分开，不宣称整份记录只有一次鼠标点击。
第 8 节的非目标、焦点污染与已恢复窗口继续保留；本条不以早期探查替代双轮，也不推广任意无效落点。

## 19 REQ-S08-H01-030 两类空列表项前向 Delete 合入下一正文

证据：无序项[建样](./dom/H00-full-empty-bullet-following-text-fixture.json)、[R1](./dom/H01-full-empty-bullet-delete-next-text-R1.json)、[R2](./dom/H01-full-empty-bullet-delete-next-text-R2.json)；有序项[建样](./dom/H00-full-empty-ordered-following-text-fixture.json)、[R1](./dom/H01-full-empty-ordered-delete-next-text-R1.json)、[R2](./dom/H01-full-empty-ordered-delete-next-text-R2.json)。
固定 Alpha text、空列表项、Gamma text、Tailx text；空项正文光标真实 Delete。
两类列表各两轮均由空项接收 Gamma，保留其 bullet/ordered 类型，原 Gamma 普通块消失；Alpha、Tailx 与空标题保持。
每轮 Undo 回空项及独立 Gamma，Redo 回合并，Undo 再恢复；文字、层级与样式准确，范围外外层 ID/DOM 对象保持，errors/overflow 为空。
这补齐后接非空普通段的空项边界，不用既有文档末空项 Delete 无变化替代。

## 20 REQ-S08-H02-015 局部整块选择的删除与普通键入

证据：[混合建样](./dom/H00-full-partial-structure-fixture.json)、退格 [R1](./dom/H02-full-partial-structural-backspace-R1.json)/[R2](./dom/H02-full-partial-structural-backspace-R2.json)、Delete [R1](./dom/H02-full-partial-structural-delete-R1.json)/[R2](./dom/H02-full-partial-structural-delete-R2.json)。
固定 Alpha text、Beta ordered、Gamma text、Tailx text；Beta 正文 caret 后 Escape、Shift+Down，使 Beta/Gamma 两块 selected，激活 docx-selection-hidden-textarea。
真实 Backspace 与 Delete 各双轮都只移除 Beta/Gamma，剩 Alpha、Tailx；三步历史准确恢复/重放/恢复，标题与范围外身份保持。
普通键入另用[真实标记](./dom/H00-full-partial-input-history-marker.json)、[R1](./dom/H02-full-partial-structural-input-R1.json)、[R2](./dom/H02-full-partial-structural-input-R2.json)：同一局部两块选中后可信 KeyY 未替换内容。
首次 Undo 直接把 Tailxx 还原为 Tailx，Redo 恢复；随后[单独清理标记](./dom/H00-full-partial-input-marker-cleanup.json)恢复 Tailx。
这是局部结构选区与原跨段文字 Range 的实际差异，不能将 BODY 折叠 Range 描述为 Beta/Gamma 的文字范围。
项目已确认的选区输入保护合同继续有效，不重复请求取舍；errors/overflow 均为空。

## 21 REQ-S08-H06-016 新增首尾及反向范围的多行纯文本

固定第 20 节四段建样，载荷实际为 text/plain 的 One、换行、Two，各条件真实双轮及 Undo/Redo/Undo。
| 落点 | R1/R2 | 实际新增结果 |
| --- | --- | --- |
| Gamma 普通段首 | [R1](./dom/H06-full-text-start-multiline-R1.json)、[R2](./dom/H06-full-text-start-multiline-R2.json) | 在 Gamma 前新增 One、Two 两个普通段，Gamma 保持 |
| Beta 有序项首 | [R1](./dom/H06-full-ordered-start-multiline-R1.json)、[R2](./dom/H06-full-ordered-start-multiline-R2.json) | 在 Beta 前新增 One、Two 两个普通段，Beta 编号保持 |
| Beta 非空项尾 | [R1](./dom/H06-full-ordered-tail-multiline-R1.json)、[R2](./dom/H06-full-ordered-tail-multiline-R2.json) | Beta 后新增 One、Two 普通段，未拼入 Beta 文字 |
| Beta:4 反向至 :2 | [R1](./dom/H06-full-ordered-reverse-range-multiline-R1.json)、[R2](./dom/H06-full-ordered-reverse-range-multiline-R2.json) | ta 被替换，Be 保持有序项，其后 One、Two 为普通段 |

每轮标题、范围外 Alpha/Tailx 外层身份保持，全部文本、类型、父级及样式在历史中准确，errors/overflow 为空。
paste 事件监听时选区已被飞书处理；反向范围以此前可信 Meta+KeyV 事件的 anchor=Beta:4、focus=Beta:2、text=ta 核对，不将事后 paste 回调选区冒充前置。
[新增边界语义审计](./08-boundary-verification-audit.json)逐条核对真实入口、精确结果、身份、样式及历史；文件配对不是通过数。
其余目标首中尾与 Unicode 条件仍继续执行，本节不扩大覆盖。

## 22 REQ-S08-H07-008 Unicode 块长及组合序列归一化

来源为 Chrome 原生 text/plain 粘贴；四段为 Alpha text、Beta ordered、Gamma text、Tailx text，固定 Gamma:5，空标题。
[Unicode 语义审计](./08-unicode-verification-audit.json)包含七组有效双轮及输入输出一致性，共二十一个检查组，当前零失败。

| 实际原始载荷 | 候选 Gamma 块长度 | 结果及证据 |
| --- | --- | --- |
| 中 ×99995 | 100000 UTF-16 单位 | 接受，[R1](./dom/H07-full-CJK-block-100000-R1.json)、[R2](./dom/H07-full-CJK-block-100000-R2.json) |
| 中 ×99996 | 100001 UTF-16 单位 | 拒绝，[R1](./dom/H07-full-CJK-block-100001-R1.json)、[R2](./dom/H07-full-CJK-block-100001-R2.json) |
| 😀 ×49997 + Z | 100000 UTF-16 单位；50003 码点 | 接受，[R1](./dom/H07-full-emoji-block-UTF16-100000-R1.json)、[R2](./dom/H07-full-emoji-block-UTF16-100000-R2.json) |
| 😀 ×49998 | 100001 UTF-16 单位；50003 码点 | 拒绝，[R1](./dom/H07-full-emoji-block-UTF16-100001-R1.json)、[R2](./dom/H07-full-emoji-block-UTF16-100001-R2.json) |
| e+U+0301 ×49997 + Z | 原始累计 100000，正文变为 Gamma + é×49997 + Z，50003 单位 | 接受并归一化，[R1](./dom/H07-full-combining-block-UTF16-100000-R1.json)、[R2](./dom/H07-full-combining-block-UTF16-100000-R2.json) |
| e+U+0301 ×99995 | 原始载荷 199990；变为 Gamma + é×99995，累计 100000 | 接受，[R1](./dom/H07-full-combining-NFC-block-100000-R1.json)、[R2](./dom/H07-full-combining-NFC-block-100000-R2.json) |
| e+U+0301 ×99996 | 原始载荷 199992；归一化候选累计 100001 | 拒绝，[R1](./dom/H07-full-combining-NFC-block-100001-R1.json)、[R2](./dom/H07-full-combining-NFC-block-100001-R2.json) |

原始 paste 载荷完整保留，e+U+0301 未在系统粘贴前变为 é；实际正文结果与 NFC 一致，不据此断言飞书内部实现或所有组合序列算法。
[原始累计 100001 的组合探查](./dom/H07-full-combining-raw-UTF16-100001-probe.json)也接受为 50003 单位，并完成三步历史；只作归一化次序旁证，不单独当有效双轮。
[早期表情拒绝探查](./dom/H07-full-emoji-UTF16-100001-probe.json)没有标记历史，不替代后续正式双轮。
接受组各真实 Undo 回四段、Redo 回准确长串、Undo 再回四段；长串期间前方块渲染缺省，恢复后全部原块 ID、文本、样式和层级准确，标题不变。
拒绝组固定 Tailxx 历史标记；内容和四块身份不变，捕获实际 alert“该内容块的字符数超出上限（100,000），请拆分部分内容后重试”。
两轮均首次 Undo 无变化，第二次 Undo 移除标记，Redo 恢复标记；这与现有 ASCII 累计超限的额外无变化 Undo 一致，不推导内部历史实现。
[首个标记](./dom/H00-full-Unicode-rejection-marker.json)及[清理](./dom/H00-full-Unicode-rejection-marker-cleanup.json)、[后续标记](./dom/H00-full-Unicode-second-rejection-marker.json)分别留证；当前 Tailxx 仍为明确测试现场，尚未最终清空。
errors/overflow 均为空。长文件使用 stringRef 无损存储，先展开字符串再展开快照可还原原对象；规范化内容哈希不变，未删文本或轨迹。
结论仅覆盖这些单行普通段输入；软换行、多块分配、全文上限及项目运行结果另行验证，七项项目差异决定不变。

## 23 REQ-S08-H07-009 软换行计数、多块分配与全文下界

[分配语义审计](./08-distribution-verification-audit.json)包含四组有效双轮及一致性，共十二个检查组，当前零失败；全部来自 Chrome 原生输入和公开 DOM 被动采样。
[软换行建样](./dom/H00-full-soft-line-fixture.json)在 Gamma 尾真实 Shift+Return 后输入 Soft：同一 text 块内两条 ace-line，innerText 为 Gamma、换行、Soft，textContent 去占位后为 GammaSoft。
在 Soft:4 粘贴 X×99990，文字节点长度 99999、innerText 长度 100000，接受并保留两条 ace-line；[R1](./dom/H07-full-soft-line-logical-100000-R1.json)、[R2](./dom/H07-full-soft-line-logical-100000-R2.json)三步历史准确。
粘贴 X×99991 的候选 innerText 长度 100001 则拒绝，原两行保持，真实 alert 与此前相同；[R1](./dom/H07-full-soft-line-innerText-100001-R1.json)、[R2](./dom/H07-full-soft-line-innerText-100001-R2.json)均首次 Undo 无变化、第二次移除 Tailxx 标记、Redo 恢复。
[标记建样](./dom/H00-full-soft-line-limit-marker.json)和[清理](./dom/H00-full-soft-line-limit-marker-cleanup.json)分别留证；固定条件支持一个软换行占一个块长单位，不推广任意隐藏节点计数。

多段输入固定原四段（Gamma 内含软换行），在 Soft:4 一次粘贴 A×60000、换行、B×60000，共 120001 原始单位。
[多块 R1](./dom/H07-full-multiblock-120000-R1.json)、[R2](./dom/H07-full-multiblock-120000-R2.json)均新增两个顶层普通段，分别完整 60000 字符，原 Gamma/Soft 不拼接；没有上限反馈。
Undo/Redo/Undo 精确恢复/重放/恢复；这证明本样例单次载荷超过 100000 仍可在飞书分配为多个不过限内容块，不能将项目 plain 单次门禁当作飞书行为。

再一次粘贴 A/B/C/D/E 各 92000、段间换行，共 460004 原始单位；[大输入 R1](./dom/H07-full-document-over-460000-R1.json)、[R2](./dom/H07-full-document-over-460000-R2.json)均接受，新增文字合计 460000，连原四段及软换行至少 460024 单位。
实际通过原生滚动逐段读取 A–E，每段精确 92000；初次和重做的下方/顶部/B/C/D 分段样本均保留，不将屏幕外渲染缺省当删除，也不只用载荷推断全部落盘。
两轮 Undo/Redo/Undo 语义准确，原四块 ID 恢复；新插入的块在 Redo 时重新获得 ID，不能宣称粘贴新身份跨历史保持。
R1 新段 ID A–E 为 82/81/80/79/78，Redo 为 87/86/85/84/83；R2 为 92/91/90/89/88，Redo 为 97/96/95/94/93。
空标题保持，全部 errors/overflow 为空。较大记录按压缩分片完整提取，再做快照和字符串无损去重及哈希还原，未删中间段或异常轨迹。
这只给出飞书接受一个大于项目 460000 配置总量的下界，没有测得飞书全文最大值；项目真实长度插件的 460000/460001 边界仍以第 12 节隔离事务报告为准。

## 24 REQ-S08-H06-017 六类目标的首/中/尾覆盖核对

载荷均为真实纯文本 One、换行、Two；首/中/尾是本阶段显式边界，不将空项代替非空项。
| 目标 | 段首 | 段中部分选区 | 非空段尾 |
| --- | --- | --- | --- |
| text | 第 21 节新双轮 | 原 H06-011，剪贴板合同第 27 节 | 原 H06-003，第 7 节 |
| H1 | [R1](./dom/H06-full-plain-H1-start-multiline-R1.json)、[R2](./dom/H06-full-plain-H1-start-multiline-R2.json) | 原编号 H1 H06-015，第 33 节 | 原编号 H1 H06-004，第 8 节 |
| H9 | [R1](./dom/H06-full-plain-H9-start-multiline-R1.json)、[R2](./dom/H06-full-plain-H9-start-multiline-R2.json) | 原编号 H9 H06-012，第 29 节 | 原编号 H9 H06-004，第 8 节 |
| bullet | [R1](./dom/H06-full-bullet-start-multiline-R1.json)、[R2](./dom/H06-full-bullet-start-multiline-R2.json) | [R1](./dom/H06-full-bullet-middle-range-multiline-R1.json)、[R2](./dom/H06-full-bullet-middle-range-multiline-R2.json) | [R1](./dom/H06-full-bullet-tail-multiline-R1.json)、[R2](./dom/H06-full-bullet-tail-multiline-R2.json) |
| ordered | 第 21 节新双轮 | 原 H06-014，第 32 节，另有第 21 节反向范围 | 第 21 节新双轮 |
| quote 内部 text | [R1](./dom/H06-full-quote-start-multiline-R1.json)、[R2](./dom/H06-full-quote-start-multiline-R2.json) | 原 H06-013，第 31 节 | 原 H06-005，第 9 节 |

原合同统一链接：[剪贴板合同](./08-clipboard-contracts.md)。H1/H9 首部新样例没有编号，中/尾原样例带编号，属性不同明确保留；不伪称十八格前置属性全部相同，也不新增 H2–H8 实测。
新标题/无序项首部都在原块前新增两个普通段；非空无序项尾部在原块后新增两个普通段，原 Beta 类型保留。
无序项中间 et:1→3 替换得到 B bullet、One text、Two text、a text；首尾范围外 Alpha/Gamma/Tailx 保持。
引用首部则在同一 quote_container 内新增 One、Two，原 Gamma 后移但继续属于该引用；外部 Alpha/H9/Tailx 不受影响。
每个新增条件 Undo/Redo/Undo 语义准确，空标题与范围外身份保持，errors/overflow 为空；见[短边界语义审计](./08-boundary-verification-audit.json)。
[无序建样](./dom/H00-full-bullet-paste-fixture.json)、[H1](./dom/H00-full-plain-H1-start-fixture.json)、[H9](./dom/H00-full-plain-H9-start-fixture.json)、[引用](./dom/H00-full-quote-start-fixture.json)及[软换行短建样恢复](./dom/H00-full-soft-line-short-fixture-reset.json)分别留证。

## 25 REQ-S08-H01-031 相邻标题与引用非空边界的新方向

普通 Alpha 段尾 Delete 下一普通 H1/H9 的 Beta，均得到一个普通 AlphaBeta，下一标题壳被移除；Gamma/Tailx 不变。
H1 [R1](./dom/H01-full-text-delete-next-H1-R1.json)、[R2](./dom/H01-full-text-delete-next-H1-R2.json)；H9 [R1](./dom/H01-full-text-delete-next-H9-R1.json)、[R2](./dom/H01-full-text-delete-next-H9-R2.json)。
引用内 Gamma 末尾 Delete 外部非空 Tailx，两轮均得到引用内 GammaTailx，保留引用父容器、移除外部 Tailx 块；[R1](./dom/H01-full-quote-end-delete-next-text-R1.json)、[R2](./dom/H01-full-quote-end-delete-next-text-R2.json)。
以上各真实 Undo/Redo/Undo 精确恢复和重放文字、类型、父级与样式，标题和范围外块身份保持，errors/overflow 为空。
这补充文字合入标题的反方向及引用外非空段条件，不用已有标题合入正文或删除外部空列表项代替。

## 26 REQ-S08-H04-018 混合行内样式、反向跨块及转换续写

[固定建样](./dom/H00-full-mixed-inline-fixture.json)：Alpha 的 Al 为 700/italic，无下划线；pha 为 400/normal/underline；邻段 Beta 为普通 H9，后为 Gamma 引用及 Tailx，空标题。
| 条件 | 双轮证据 | 实际输出 |
| --- | --- | --- |
| 整个 Alpha Cmd+I | [R1](./dom/H04-full-mixed-italic-on-R1.json)、[R2](./dom/H04-full-mixed-italic-on-R2.json) | 全文 italic，Al 粗体及 pha 下划线保留 |
| Beta:2 反向到 Alpha:0，Cmd+U | [R1](./dom/H04-full-reverse-cross-block-underline-R1.json)、[R2](./dom/H04-full-reverse-cross-block-underline-R2.json) | Alpha 与 Be 全部 underline，Al 粗斜体保留，H9 未选 ta 无下划线 |
| 整个 Alpha Cmd+Shift+X | [R1](./dom/H04-full-mixed-strikethrough-R1.json)、[R2](./dom/H04-full-mixed-strikethrough-R2.json) | Al 为粗斜体+line-through，pha 为 underline line-through |
| Alpha 尾 Cmd+Shift+7 紧接真实 z | [R1](./dom/H04-full-mixed-to-ordered-continue-R1.json)、[R2](./dom/H04-full-mixed-to-ordered-continue-R2.json) | 变 ordered Alphaz，phaz 继续 underline，Al 粗斜体保留 |

反向选区由真实 Right×2、Shift+Up、Cmd+Shift+Left 建立；命令 keydown 前确认为 anchor=Beta:2、focus=Al:0、text=Alpha+占位+换行+Be，不把事后选区冒充前置。
各样式条件三步历史精确；转换与续写真实间隔小于一秒，两轮首次 Undo 同时撤销二者，Redo 重放，最后 Undo 回源；只记录本次连续条件，不推导内部合并阈值。
标题、范围外引用/尾段以及 H9 非目标属性和身份保持；一个窗口的 H9 focused 类随真实焦点移除，保留原记录，不能把它误判为格式变化或宣称所有焦点状态不变。
[混合格式审计](./08-mixed-format-verification-audit.json)共十二个检查组、当前零失败；逐字符计算样式、精确范围、真实按键、类型、身份、历史及 errors/overflow 已核对。
原生读回失败和 ScreenCaptureKit -3811 曾使第二轮未开始，恢复后确认无 active 才执行；不重复撤销或把工具失联归为飞书产品错误。

## 27 REQ-S08-H01-032 普通段尾 Delete 下一有序/无序项

固定混合行内 Alpha text、Beta ordered/bullet、Gamma 引用、Tailx，页标题为空。
有序 [R1](./dom/H01-full-text-delete-next-ordered-R1.json)、[R2](./dom/H01-full-text-delete-next-ordered-R2.json)；无序 [R1](./dom/H01-full-text-delete-next-bullet-R1.json)、[R2](./dom/H01-full-text-delete-next-bullet-R2.json)。
真实 Alpha 末尾 Delete 均得到普通 AlphaBeta，Beta 列表壳移除，引用父序号由 2 变 1；Gamma/Tailx 身份与空标题不变。
两轮 Undo/Redo/Undo 精确恢复文字、层级和逐字符样式，errors/overflow 为空；[边界审计](./08-boundary-verification-audit.json)现为 59 个检查组、零失败。
[有序建样](./dom/H00-full-next-ordered-valid-fixture.json)、[无序建样](./dom/H00-full-next-bullet-valid-fixture.json)均检查实际 data-block-type 后才计入有效配对。
此前 Cmd+Shift+7 未把 H9 变为 ordered：[建样探查](./dom/H00-full-ordered-shortcut-on-H9-probe.json)、[实际仍为 H9 的删除探查](./dom/H01-full-requested-ordered-actual-H9-numbered-probe.json)保留原 operation.id 和完整恢复轨迹，明确排除，不能因操作名称误计有序项通过。

## 28 最终保存、清理与交付判定

[最终保存及清理](./08-persistence-and-cleanup.md#10-重新验证后的最终保存与清理)记录富格式版本的真实浏览器读取、额外末空段差异、清空历史和四次最终空版本重载。
[最终证据审计](./08-final-cleanup-audit.json)共 42 个检查组、零证据一致性失败；这不覆盖或取消项目安全失败。
[当前源码对照](./08-project-source-snapshot-check.json)的 50 个源输入与六项直接源检查保留，完整注册包与隔离测试注册包 SHA-256 相同；本轮未修改业务源码，隔离报告适用版本未变。
可达队列已补齐并审计；没有新的人工作业等待 sir 执行。自然剪贴板拒绝环境未获得，飞书全文最大值只测得超过项目上限的下界，均不计通过。
第 16 节外部旧批注 class 恢复外来身份是确定失败；项目验收未通过，后续业务修复及真实生产/服务端验收不在本研究任务内。
清格式只确认已搜索入口及候选快捷键的实际无变化，不推断全产品无此能力；H2–H8 仍为既有授权推断，未虚增穷举覆盖。
