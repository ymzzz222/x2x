# S11 项目当前合同对照

日期：2026-10-27。范围为当前工作区源码核对及一项隔离函数验证，没有启动项目编辑器/服务或改变业务代码。
分类允许一项含多种结果：静态对应、需修改、已批准保留、专项缺证、待决策。
“静态对应”只表示注册或处理路径存在，不能写成项目行为与飞书实测一致。
飞书基线仍以[能力来源表](./11-coverage-and-conversion.md)和具体用例为准。
当前代码摘要与关键片段位置另存[源码核对记录](./11-project-source-audit.json)，避免未来代码变化后沿用本次结论。

## 1 总清单19项逐项对照

源码路径均位于src/views/aiScriptCore/wordEdit；以下链接指向实际文件。
每行覆盖能力组；389个编号REQ的字段复核另见语义表，不能把19行源码对照当作每条项目行为均已验证。

| 能力索引 | 当前可确认的实现合同 | 分类与重构验收 |
| --- | --- | --- |
| CAP01 文本/标题/列表/引用 | [blocks.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/blocks.js)定义myParagraphBlock、myHeadingBlock、myListItem与引用；标题渲染限制1–9；[命令入口](../../../src/views/aiScriptCore/wordEdit/editor/components/common/convertSelectDoc.js)分发h1–h9等key | 静态对应＋需结构映射，SR05隔离函数已确认标题转正文会遗漏后代；PM节点名不冒充飞书data-block-type，DOM命名另修 |
| CAP02 标题/正文/空态/身份 | [page.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/page.js)是doc→myPage→header＋children；正文至少一块，段落优先；[index.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/index.js)UniqueID仅配置段落和标题，远程事务由isChangeOrigin过滤 | 静态保护合同保留，DOM仍需对照。结构节点无同类ID不等于漏ID；空态可续写和页标题保护必须独立运行 |
| CAP03 标题编号 | [blocks.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/blocks.js)将level、numbered、numberText分开；编号span不可编辑；编号同步在[extensions.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/extensions.js) | 静态对应，跨级/跨父/派生编号缺运行证据；有序命令不能统一解释成列表 |
| CAP04 折叠/目录 | [headingFold.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/headingFold.js)用本地Plugin meta切换并设置addToHistory=false；[目录](../../../src/views/aiScriptCore/wordEdit/shell/catalogue/composables/useCatalogue.js)读取文档并管理目录显示 | 需修改或取得明确差异批准：飞书F06-006折叠可Undo/Redo，当前显式排除历史；不得算已一致 |
| CAP05 列表维护 | [list.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/list.js)维护myListItem祖先数、嵌套、合并与续编号，真实嵌套常量4 | 静态对应＋需修改。S05-E01-002已决定无固定上限，当前4层需对齐；十五层探查不是无限深度验收 |
| CAP06 键盘 | [keyboard.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/keyboard.js)有两个addKeyboardShortcuts同名方法，后者生效；Mod-Enter调用前者原拟提供的命令；协同历史另注册 | SR06确认自身配置没有addCommands，三个辅助定义被覆盖；不能把源文件出现函数名等同已注册。真实Editor命令集仍需复验 |
| CAP07 菜单与拖动 | [Drag入口](../../../src/views/aiScriptCore/wordEdit/editor/components/Drag/index.vue)分开普通和斜杠面板；[menuActions.js](../../../src/views/aiScriptCore/wordEdit/editor/components/Drag/menuActions.js)点击入口检查canEdit与AI锁 | 静态对应。真实落点、跨块选区、互斥和取消恢复缺项目实测；UI检查不替代下层命令门禁 |
| CAP08 选择与光标 | [selection.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/selection.js)读取范围；装饰与buildConvertContext另分层；实际Mod-a回调直接选择正文区 | DR-S11-004：首次即全文，与飞书首次当前段、第二次正文不同；需按1:1目标对齐或明确批准保留。隔离回调出现结构端点TextSelection警告，未当有效UI光标保证 |
| CAP09 行内格式 | [扩展装配](../../../src/views/aiScriptCore/wordEdit/editor/extensions/index.js)注册StarterKit、Underline、Link、TextStyle、Color与多色Highlight；Link默认https | 默认协议已批准保留。注册不证明每个入口可达，混合格式、清除、续写及code入口另验 |
| CAP10 对齐/缩进 | [blocks.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/blocks.js)段落/标题块缩进0–8、每级2em；[index.js](../../../src/views/aiScriptCore/wordEdit/editor/extensions/index.js)单列列表缩进属性并注册left/center/right | 静态对应＋待决策。首行text-indent、块margin与真实父级是三种状态，不能合并或以2em代替飞书全部测量 |
| CAP11 剪贴板 | [clipboard.js](../../../src/views/aiScriptCore/wordEdit/editor/components/common/clipboard.js)清批注后构建HTML/plain并逐级降级写入；[externalPaste.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/externalPaste.js)按内部标记/表格提前返回，外部结构另归一 | 需修改/复验。BG01外来身份失败未关闭；SR04引用内外部标题扁平化须按同入口核对，不能拿转换合同直接判粘贴失败 |
| CAP12 查找替换 | [useFindReplace.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useFindReplace.js)普通/修订替换分支分开；[extensions.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/extensions.js)普通替换以tr.insertText修改；[入口](../../../src/views/aiScriptCore/wordEdit/editor/index.vue)向面板传canEdit | 静态风险SR02。按钮禁用与替换命令未见isEditable检查是不同层；真实降权及AI锁后的各入口需复验 |
| CAP13 保存/长度 | [useAutoSave.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useAutoSave.js)有未同步空保存保护、远程事务过滤、失败needSave及重试；[config.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/config.js)460000/100000；[useEditorChrome.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useEditorChrome.js)以plain字符串length限粘贴 | 已批准长度保护保留＋静态风险SR01。计数单位为该入口UTF-16 length，不是所有限额统一“字”；保存响应与最新编辑版本缺对应证据 |
| CAP14 协同/本地历史 | [扩展装配](../../../src/views/aiScriptCore/wordEdit/editor/extensions/index.js)协同时关闭StarterKit undoRedo并绑定独立field；[useCollaboration.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useCollaboration.js)负责provider/恢复/重建 | 静态对应＋专项缺证。trackedOrigins、服务端授权、并发结构和本地Undo隔离仍须隔离环境运行 |
| CAP15 批注/修订 | [annotation装配](../../../src/views/aiScriptCore/wordEdit/extensions/annotation/index.js)统一能力；[schema.js](../../../src/views/aiScriptCore/wordEdit/extensions/annotation/schema.js)将旧comment class解析为layers | 静态对应＋BG01。历史HTML兼容与不可信外部粘贴必须使用不同信任边界；保留正文/锚点不表示可继承外文档批注ID |
| CAP16 AI预览/锁 | [editor入口](../../../src/views/aiScriptCore/wordEdit/editor/index.vue)综合页面/props生成锁并watch setEditable；[useAiInteraction.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useAiInteraction.js)处理划词交互 | 项目业务能力保留＋专项缺证。不能用飞书阅读模式替代AI锁；生成事件、正式落版、重连解锁仍需服务证据 |
| CAP17 历史版本 | [requestHistoryVersionRestore](../../../src/views/aiScriptCore/wordEdit/editor/index.vue)发送restoreSnapshot与requestId；[useCollaboration.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useCollaboration.js)有恢复后禁写/重建 | 静态对应＋SR03。人物immediateDisconnect特殊路径的2500ms兜底可走成功提示，服务失败/未确认与重连成功须分开验收 |
| CAP18 导入导出/模块 | [usePageChrome.js](../../../src/views/aiScriptCore/wordEdit/index/composables/usePageChrome.js)经内容editor调用导入导出；[editor入口](../../../src/views/aiScriptCore/wordEdit/editor/index.vue)接收embedded/headless/collabDocumentId并监听切换 | 能力存在＋专项缺证。服务转换、真实往返、批注业务字段、晚响应和多模块实例隔离未运行；飞书导出不能替代项目结果 |
| CAP19 权限/切换/窄屏 | [editor入口](../../../src/views/aiScriptCore/wordEdit/editor/index.vue)由权限/模式/AI锁计算可编辑性并清理实例；[useEditorChrome.js](../../../src/views/aiScriptCore/wordEdit/editor/composables/useEditorChrome.js)管理尺寸、DOM和shell监听 | 静态对应＋专项缺证。服务端拒绝、全部命令一致门禁、窄视口可达性和重复挂卸需运行；隐藏按钮不足以证明拒绝写入 |

## 2 本批精确差异与静态风险

| 编号 | 源码事实与基线 | 必须补的可回放断言 |
| --- | --- | --- |
| DR-S11-001 DOM命名 | 当前page.js/index.js/blocks.js仍产生feishu类名或兼容data属性；目标规则为maiya | 输出DOM标识及所有读写选择器同步映射；历史兼容输入可保留明确入口；不修改原证据或用户文字/URL |
| DR-S11-002 折叠历史 | headingFold.js:146–155只写meta且addToHistory=false；飞书F06-006有独立Undo/Redo | Chrome 实测 H2 折叠后一次 Cmd+Z 撤销先前的粘贴，重做后子段仍处于折叠状态。编号标题、重开与远端状态另验。见[折叠历史实测](./11-stage-handoff.md#10-2026-11-17-折叠历史与列表深度实测) |
| DR-S11-003 列表深度 | list.js:31固定MAX_NESTED_MY_LIST_ITEM_DEPTH=4；[S05-E01-002](../05-nesting-and-combinations/05-nesting-and-combinations.md)已明确后续需求无固定上限 | Chrome 实测无序列表 Tab 从第三层进入第四层，有合法前项时两次尝试第五层均保持第四层，Shift+Tab 可退回第三层。见[列表深度实测](./11-stage-handoff.md#10-2026-11-17-折叠历史与列表深度实测) |
| DR-S11-004 首次正文全选 | keyboard.js:505–545按当前位置选myPageChildren全部content；[隔离实际回调](./11-keyboard-contract-probe.json)从Beta中部一次Mod-a选Alpha/Beta/Gamma且排除TITLE | 飞书S07 G05-003、S08 H02-001为第一次当前段、第二次全部正文。Chrome 从合成 H2 首次 Cmd+A 已跨到正文首末段且排除页标题。默认按1:1目标对齐，人物区块业务边界另验 |
| SR04 引用内外部标题 | externalPaste.js:715–733在blockquote容器将heading扁平化；S03引用内转换可保留标题，但两者不是同一操作 | 同一带H1/H9及后代来源分别内部/外部复制，固定引用目标，比较类型、文字、包装与Undo；先取得飞书同入口对照，不能把转换结果当作外部粘贴结果 |
| SR01 保存响应归属 | useAutoSave.js:110–150请求捕获id/version，then直接写当前store、needSave=false；未见编辑代次或当前文档校验 | 发出A保存后编辑B但暂不保存B；A响应不得清除B脏状态。再发B并乱序返回；切文档后旧响应不得写新文档版本/状态 |
| SR02 程序命令门禁 | useFindReplace.js替换回调与extensions.js替换命令未见可编辑检查；入口面板有canEdit | 面板打开后降权/锁定，再触发按钮、回调及暴露方法，均拒绝修改和历史写入；解锁后可继续，不沿用过期选区 |
| SR03 恢复确认 | editor/index.vue:1825–1877的人物立即断连分支在超时后调用onSuccess或forceSync并提示成功 | 服务端拒绝/无回执/重连失败各自不得被提示为已确认恢复；必须独立读取指定版本，旧会话晚事件不得解锁新文档 |
| SR05 标题转正文丢后代 | [convertHeadingText.js:31–40](../../../src/views/aiScriptCore/wordEdit/editor/components/common/convertHeadingText.js)替换范围覆盖整个标题，结果仅首段；[convertText.js](../../../src/views/aiScriptCore/wordEdit/editor/components/common/convertText.js)的正文/编号标题/事务路径调用它 | [隔离实测](./11-heading-text-isolated-probe.json)单段控制通过、两种后代样例失败。[双端实测](./11-stage-handoff.md#9-2026-11-17-标题转换与选区实测)确认划词菜单将 H2 转成文本时丢失加粗子段，撤销恢复，重做再次丢失 |
| SR06 命令配置被覆盖 | keyboard.js:765/830重复addKeyboardShortcuts；实际Extension配置只有后者，没有addCommands。Mod-Enter调用insertMySectionAfterCurrentTopHeading，列表处理器多处调用toggleListTree；当前core目录没有其他注册定义 | 隔离加载整个实际模块确认前字典三名称不在生效键表，自身无命令注册。安装的TipTap ExtensionManager只从addCommands收集命令。修复后验证普通段→列表、无锚点分支及Mod-Enter；空commands替身抛错仅旁证，不能单独作生产复现 |
| SR07 同级标题菜单语义 | convertHeading.js:596–653对同级编号标题直接true，对普通标题重新设同level；Bubble的nodeType/useToolbar及Drag menuActions传原key，未将同级目标改text/list | S03普通H1/H9同级回正文；S05编号H1/H9同级可回有序项。Chrome 通过划词菜单对普通 H2 再次选择二级标题，块类型及身份保持原样。编号标题、其他级别、同质多块及混合来源仍待复验 |

SR02–SR04保留静态待核对状态。SR01、SR06 的覆盖范围见[项目运行补证](./11-stage-handoff.md#8-2026-11-17-项目运行补证)，SR05、SR07、DR-S11-004 见[标题转换与选区实测](./11-stage-handoff.md#9-2026-11-17-标题转换与选区实测)。SR05 继续纳入 BG08。
DR-S11-001/002/004尚无新差异批准；按既定1:1目标登记需对齐，若要保留差异须由sir明确决定。
DR-S11-003承接已有S05决定，不重新请求深度决策；只将当前参数差异交重构处理。

## 3 保护合同、缺失证据与待决策

已批准的DR-S08七项完整沿用[保护合同表](./11-conflicts-and-release-gates.md)，本批不重开。
https、正文清空后可续写、结构选择键入、原粘贴焦点Undo、精确恢复、长度配置和DL可读边界都是验收目标。
保留目标不等于当前实现通过；例如外部归一化存在不证明旧批注身份已被清除。
核心项目能力有源码入口时归“专项缺证”，不凭本批没有运行结果写成“能力缺失”。
本批未发现足以断言全部CAP能力缺失的证据；特定入口不可达与缺少运行环境分别登记。
列表深度已有无固定上限决定；部分块缩进0–8与列表祖先深度不同，性能/视觉容差和支持阅读器仍待实测后冻结。
迁移[version.js](../../../src/views/aiScriptCore/wordEdit/editor/utils/version.js)存在阶段/steps及版本写入路径，当前1.0常量为空串，不能自行改成字符串1.0或假设可逆。
实际旧样本、协议幂等、迁移失败回退及旧客户端兼容均未运行，归BG04。
优先级按数据与权限风险决定：先关闭BG01、BG08及SR01–SR03，再以同语义样例验证结构与操作合同。
这些来源用于重构验收准备，不能据此宣称项目已经可发布。

## 4 逐卡项目验收入口

[逐卡项目映射](./11-project-case-map.json)覆盖389个REQ、13个OBS和34组补证，共436张卡。
每张卡绑定原段落摘要、具体断言来源、项目能力来源及相关风险。
结构化编号按显式能力族表映射；同文件重号仍使用完整source key，不按标题关键词自动判定。
当前源码路径位于[能力来源](./11-capability-map.json)的currentSourcePaths，源码版本以本批摘要为准。
该映射解决“实现或复验时到哪里查”，不提供436项行为一致或运行通过的结论。
关联SR05的卡不等于其全部操作都丢后代，关联SR06也不等于每个列表分支都调用缺失命令。
按卡中实际入口、前置和目标分支判定影响；已知风险应在对应最小样例中先复验。
OBS保留单轮、通道限制及实际无变化，不因得到项目路径而升级为已验证需求。
S08七项已批准保护目标继续覆盖相应飞书例外，不由当前实现反向改变目标。
后续验收记录必须返回到精确卡key，并附环境、当前源码版本、全部中间态和恢复结果。
只有静态路径时使用“源码存在/待运行”；不得填写“与飞书一致”。
