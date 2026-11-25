# S11 条件差异与发布门禁

状态：402个编号章节的条件已逐条回查；以下裁定汇总跨阶段差异，项目运行和核心服务合同仍未收口。
优先级为明确的人类决定、同条件有效实测、具体补测矩阵、阶段汇总、历史检查点；新摘要不能覆盖仍有效的原始异常。
数据来源与产品目标分开：接受阶段限制不表示允许项目照搬数据丢失、无效落点或越权。
以下没有新增项目浏览器或服务端测试，也没有业务代码修复；SR05及DR-S11-004/SR06另有实际模块的隔离验证。

## 1 跨阶段条件差异裁定

| 编号 | 表面矛盾 | 采用规则及条件 | 来源 |
| --- | --- | --- | --- |
| CR01 | 同一REQ编号对应不同编辑规则 | 原编号有6组重复；同文件内重复还需行号及标题，不能只加文件名 | [目录collisions](./11-requirement-catalog.json) |
| CR02 | S08旧收口表说多块拖动未完成，后续矩阵已双轮 | 固定Alpha/Beta两个顶层块一起移动已实测；任意多块/跨容器仍未知。采用后续具体有效窗口，不删除旧失败 | [后续第3节](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md)、[旧收口表](../08-deletion-movement-formatting-and-clipboard/08-closeout-review.md) |
| CR03 | 阶段显示完成，但一些入口/权限仍未验证 | 完成是已接受范围的研究交付；S10真实锁、权限、协议、迁移等继续专项 | [S10接受记录](../10-related-features-and-edge-cases/10-scope-acceptance.json) |
| CR04 | 相同目标“有序”却输出标题 | H1/H9上的有序命令增加标题编号；普通正文上的有序命令输出列表 | [C08原属性表](../03-single-block-conversion/dom/C08-attribute-summary.json) |
| CR05 | Tab有时缩进，有时改变父级 | 正文首行缩进前置与列表嵌套不同；正文已有text-indent时再Tab、菜单缩进分别验收 | [S05精确条件](../05-nesting-and-combinations/05-headings-and-ranges.md) |
| CR06 | 视图操作不应进历史，但折叠可以撤销 | 折叠有独立双轮历史；阅读视图/菜单取消另有记录，不统一排除所有视图历史 | [S06](../06-numbering-folding-and-outline/06-verification-matrix.md)、[S09](../09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| CR07 | 历史有时合并，有时分开 | 实际节奏、采样和重选属于前置；2.454s原窗口只有单轮，新约3秒双轮不补造精确阈值 | [S09分组表](../09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| CR08 | Undo后ID有时不变，有时变化 | 原块转换可保留外层；删除恢复/新块Redo可重建数字ID和对象。逻辑record ID与页面ID分开，跨加载不比对象 | [S10清理映射](../10-related-features-and-edge-cases/10-final-cleanup-audit.json) |
| CR09 | DOM只读和阅读模式已验证，为什么仍缺权限测试 | 带可用旧历史的真实降权、服务端拒绝和AI锁未取得，已有只读页/阅读视图不是同一前置 | [S09交接](../09-undo-redo-and-history-boundaries/09-remaining-acceptance-map.json) |
| CR10 | 相同Word/PDF内容的编号表现不同 | Word XML声明lowerLetter/bullet，但当前LibreOffice显示1.；PDF正常。保留文件与渲染器差异，不推断Microsoft Word | [双轮文件核对](../10-related-features-and-edge-cases/10-export-mixed-inspection.json) |
| CR11 | 旧阶段JSON数量与当前目录数量不一致 | 交付检查点、正文证据、辅助报告与当前全部文件分别计数，不汇总为功能通过数 | [本轮来源审计](./11-source-audit.json) |
| CR12 | 快照哈希检查未匹配 | S07排序规范JSON及规范化字段、S08长字符串字典必须按原口径展开；不能改原证据来适应通用校验器 | [旧编码复核](./11-legacy-encoding-audit.json)、[本轮审计](./11-source-audit.json) |
| CR13 | 首轮索引将4层列表列待决策，但S05已有明确决定 | 采用S05-E01-002的“后续需求按无固定上限处理”，当前4层常量列需修改；不把十五层探查当无限深度实测 | [S05原决定](../05-nesting-and-combinations/05-nesting-and-combinations.md)、[当前代码对照](./11-project-contract-comparison.md) |
| CR14 | 同级标题命令有时回正文，有时回有序项 | 普通标题、带有序编号标题及多块混合来源分开；S05编号标题同级命令可回有序，不能由S03普通标题的开关规则覆盖 | [S05标题与范围](../05-nesting-and-combinations/05-headings-and-ranges.md)、[S03来源表](../03-single-block-conversion/03-reachability-and-properties.md) |
| CR15 | 相同H1目标在同质与混合选择上输出不同 | 同质H1再次H1可切正文；混合H1/text/list命令统一为H1，未选后缀、空段与后代按实际范围保留 | [S04同质矩阵](../04-multi-block-conversion/04-homogeneous-matrix.md)、[S04边界](../04-multi-block-conversion/04-selection-boundaries.md) |
| CR16 | 选区终点为下一块0，有时保留该块，有时合并移除其壳 | 类型转换的范围归属与文字删除所包含的段落边界不同；S08保留未选Beta文字但移除标题壳/编号，不套用S04转换选块规则 | [S04边界](../04-multi-block-conversion/04-selection-boundaries.md)、[S08选区第7节](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md) |
| CR17 | Undo恢复相同范围，却没有恢复原方向 | S08反向跨块及标题正文范围撤销后规范为正向；内容、范围、anchor/focus方向分别断言 | [S08选区第9、12节](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md) |
| CR18 | 标题开头Backspace有时降级，有时只去编号 | 普通H1/H9先转text；编号H1/H9先去编号而保级别。Delete删首字且保级别/编号；空标题、后继段落另立规则 | [S08删除第12–21、27–28节](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md) |
| CR19 | 引用两侧Delete似乎不对称 | 引用外正文尾Delete不进入下一个引用；引用内尾Delete可删除外部空项或合入非空正文。来源端点和后继类型必须同时固定 | [S08删除第25–26节](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md)、[后补非空边界](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md) |
| CR20 | Escape和Tab关闭菜单的结果不同 | 斜杠、气泡类型、块类型、加号、页头更多分别记录；Escape保Range不等折叠，Tab根焦点与BODY/隐藏输入来源也不同 | [S07具体入口合同](../07-menus-and-shortcuts/07-verified-contracts.md) |
| CR21 | compositionend不可信是否说明自动化伪造输入 | 真人中文R1/R3也出现非可信结束事件；以人工输入来源和可信start/update/input共同判断，不由单一字段否定真人证据 | [S09真人中文](../09-undo-redo-and-history-boundaries/09-undo-redo-and-history-boundaries.md)、[S07组合输入](../07-menus-and-shortcuts/07-verified-contracts.md) |
| CR22 | 预组合重音与分解序列的Backspace结果不同 | 可合成é粘贴后一次删除整个é；不可合成x＋重音实测只删除重音。输入载荷、正文归一化和删除边界分开 | [S02 Unicode](../02-creation-and-editing/02-unicode-editing.md) |
| CR23 | 100000限制有时拒绝，有时接受超过100000的载荷 | 飞书实测为代表块的UTF-16/NFC等价及软行边界，多段可分配并接受大于100000的载荷；项目单次plain门禁与全文过滤器是独立目标 | [S08 Unicode与分配](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md)、[已批准长度合同](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) |
| CR24 | preventDefault或beforeinput缺省似乎能判粘贴失败 | 接受与拒绝均可能prevented=true；INPUT收到paste也可能值未插入。必须合查实际值、正文、反馈与可信窗口 | [S08累计阈值](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md)、[S10未插入差异](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) |
| CR25 | 纯文本粘贴是否总输出普通正文 | 折叠来源复制后的编号行通过Cmd+Shift+V仍生成两个顶层ordered；父子与引用结构降级，不是保留富结构，也不是全部text | [S08纯文本入口第23–26节](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) |
| CR26 | 外部HTML的字重/颜色保留结果不同 | strong和独立样式固定样例保留；复合span的700、颜色、字号等被清理。按输入标签及组合形态限定，不宣称全部支持或全部不支持 | [固定富HTML](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md)、[复合span](../08-deletion-movement-formatting-and-clipboard/08-supplemental-contracts.md) |
| CR27 | 可见复制HTML没有批注，为何仍有外来身份风险 | 飞书片段可见HTML无锚，但私有Attrib仍有旧评论ID；实际目标隔离与项目解析外来class失败分别保留，不能相互抵消 | [S08带批注复制](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md)、[项目确定失败](../08-deletion-movement-formatting-and-clipboard/08-project-paste-integration-audit.json) |
| CR28 | 移动应当保身份，但分栏/引用外提会重建 | 单纯顶层排序及入已有引用首段可保外层；生成分栏或独立引用时Alpha与新结构可重建。真实目标结构和入口决定断言，不按“移动”名称预设 | [S08移动记录](../08-deletion-movement-formatting-and-clipboard/08-movement-observations.md) |
| CR29 | 早期长按无repeat，后续却有系统重复 | CUA/System Events通道只送一次按下是通道限制；系统虚拟键盘每轮实际送17次repeat=true。后补只覆盖该系统入口，不冒充物理硬件 | [S07真实重复合同](../07-menus-and-shortcuts/07-verified-contracts.md) |
| CR30 | 保存版本有额外空段，后来的成功读取是否消除异常 | S05首次附加末空、S08未监控间隔首/末空及S10粘贴Undo两空均保留；后续正确读回只证明对应新版本，未知来源不归因给产品或工具 | [S05保存](../05-nesting-and-combinations/05-complex-history-and-persistence.md)、[S08保存清理](../08-deletion-movement-formatting-and-clipboard/08-persistence-and-cleanup.md)、[S10混合链](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) |

这些裁定绑定已审用例的具体条件；389个REQ、13个OBS与34个未编号规则的逐条字段见[语义复核表](./11-semantic-review.json)。
条件差异能解释观察结果，不意味着未测组合或项目实现已通过；其余239个标题的资料角色分类另见[来源清单](./11-section-coverage.json)，不自动接受其全部断言。
对无法由实际条件解释的冲突，保留两个窗口并继续复核，不取平均、不默默放宽要求。

## 2 已批准的七项项目保护合同

以下均承接2026-10-21的明确决定，不重复要求sir确认，也不等于实现已经通过。
完整来源为[S08项目差异表](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md)。

| 差异编号 | 冻结的项目目标 | 验收要求 |
| --- | --- | --- |
| DR-S08-H02-001 | 清空后在明确正文落点续写，保护页标题 | 空正文可继续输入，不路由到标题 |
| DR-S08-H02-002 | 确认的正文结构选区支持键入替换 | 不能把普通键入无变化算成功；IME另验 |
| DR-S08-H04-001 | 保留defaultProtocol=https | 域名输入、取消、危险协议分别验证 |
| DR-S08-H06-001 | 粘贴后原编辑焦点即可Undo | 不要求用户先点页标题 |
| DR-S08-H06-002 | Undo精确恢复粘贴前结构 | 不残留额外空段，不只比可见文字 |
| DR-S08-H07-001 | 保留plain单次100000与全文配置460000 | 不新增飞书累计块100000限制；Unicode计数未冻结 |
| DR-S08-H07-002 | DL降级保留术语/定义的可读边界 | 不接受无分隔拼接，不预定未验证的分隔实现 |

S10混合粘贴Undo留下两个空段，不推翻既有DR-S08-H06-002。
S10已接受的是研究范围，未批准项目允许裁切面板或错误编号。

## 3 待核对或决策的目标

| 项目 | 当前可确定事实 | 仍缺什么 |
| --- | --- | --- |
| 列表与块缩进 | S05已决定列表无固定上限；当前4层常量需对齐；块缩进0–8另列 | 不重复请求列表深度决定；块缩进属性范围与可达操作仍分别验收 |
| 性能与视觉容差 | 有固定规模功能及局部帧样本，没有生产性能分布 | 固定环境、重复测量和sir冻结的阈值 |
| 窄面板 | 400像素Desktop-UA视口左溢出−23.125双轮 | 项目必须保持可操作；具体响应布局和容差需设计/验收 |
| Word编号 | XML和当前渲染器显示不同 | 指定支持的阅读器与实际复验，不能选一个渲染器结果冒充全部 |
| 旧记录标识 | I05旧html含data-icon=FeishuclipOutlined | 原证据保持校验；复刻映射要求maiyaclipOutlined，命名修订单列，不冒充已全部规范化 |

## 4 发布门禁与当前结论

| 门禁 | 当前结果 | 解除条件及证据 |
| --- | --- | --- |
| BG01 外来批注身份隔离 | S08隔离集成断言存在一项确定失败，未有关闭证据 | 修复后在同源版本及真实项目浏览器复验，外来旧class不能恢复外文档批注身份 |
| BG02 权限与AI历史门禁 | 未验证 | E1/E2环境，带可用旧历史的真实降权、锁/解锁、各入口及服务端拒绝 |
| BG03 保存及会话协议 | 普通手动保存及双端重载已实测，SR01 在可控回执下复现旧回执清除新编辑待保存状态 | 修复后验证真实服务延迟、乱序、重试重复、切文档晚响应，独立读取及脏状态正确 |
| BG04 迁移与回退 | 未验证 | 授权旧HTML/JSON/Yjs样本、重复迁移、失败回退、旧客户端及协议兼容 |
| BG05 完整工作流与核心命令 | Chrome 实测 Cmd+Enter 缺少命令，普通 H2 再选「二级标题」仍为 H2，首次 Cmd+A 已跨至正文首末段 | 先关闭命令注册问题，再验证创建/IME/Unicode/转换/嵌套/批注修订/剪贴板/历史/保存重开及继续编辑 |
| BG06 性能、视觉及生命周期 | 数值和支持范围未冻结 | 固定规模分布、资源趋势、字体和操作可达性，批准后的明确容差 |
| BG07 需求与证据收口 | 研究包交付已接受，最终需求仍待收口 | K02/K03/K05资料复核已交付；支持环境、性能/视觉与服务标准未冻结，发布门禁保留 |
| BG08 标题转正文后代保护 | SR05 隔离函数两种后代样例失败；Chrome 划词菜单实测 H2 转文本遗漏内部加粗子段，夸克同步收到缺失 | 修复后同源函数及真实嵌套编辑器复验，保留后代/范围外内容、父子与身份；Undo/Redo、批注、协同及保存读回均核对 |

BG01来源为[原隔离流程报告](../08-deletion-movement-formatting-and-clipboard/08-project-paste-integration-audit.json)。
该报告在inert JSDOM中运行真实项目粘贴链，使用模拟剪贴板事件，scripts/resources禁用、无协同；七项断言六过一败。
失败项为external legacy comment class must not restore foreign identity，结果出现S08-foreign。
它不是OS剪贴板、真实服务端权限或生产攻击复现；也不能在没有修复复验时因研究阶段完成而改成通过。
当前版本修复情况未经本阶段复验，因此门禁记“已有失败未关闭”，不臆断代码从未变化。
BG08为本阶段新证据：[实际函数隔离报告](./11-heading-text-isolated-probe.json)。
它直接执行当前buildHeadingTextReplacement，使用真实ProseMirror Schema/Node；未使用的导入被隔离，UI包装器若被调用即抛错。
函数从整个标题范围构造只含首段的替换；嵌套标题与列表/引用两样例的后代文字均被遗漏，单段控制通过。
2026-11-17 已通过真实编辑器的划词菜单和双端协同复现段落后代遗漏，验证撤销可以恢复、重做再次遗漏。见[标题转换与选区实测](./11-stage-handoff.md#9-2026-11-17-标题转换与选区实测)。

## 5 需求交付与项目发布分别判断

S01–S10研究交付已按各自接受范围完成；这不替代S11逐条收口，也不替代项目运行。
S11研究包交付时新增索引、语义卡、源码对照和隔离函数证据；项目浏览器及测试服务的后续证据见[项目运行补证](./11-stage-handoff.md#8-2026-11-17-项目运行补证)。
当前项目发布结论为不能判定通过：BG01及BG08未关闭，其余关键专项没有完整运行证据。
SR06 的配置覆盖和自身无 `addCommands` 已由[实际模块隔离证据](./11-keyboard-contract-probe.json)确认；后续项目浏览器实际使用 Cmd+Enter 也报告缺少 `insertMySectionAfterCurrentTopHeading`。
未确认保存、数据丢失/重复、跨文档写入、越权及核心历史失败不能由高覆盖率抵消。
发布前必须记录各门禁证据、样本版本、实际失败恢复和已批准差异，不能只更新前端包。
