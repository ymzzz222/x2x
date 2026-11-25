# S11 验收合同与逐条复核方法

状态：389个REQ、13个OBS章节及34组未编号规则已复核；sir已接受研究交付完成，最终需求仍待收口。
本文件使用S01–S10已有实测和已接受的项目合同；本批未运行项目Editor/浏览器/服务，实际辅助函数隔离失败另列BG08，键盘模块隔离结果另列DR-S11-004与SR06。
每条原需求通过[来源目录](./11-requirement-catalog.json)的source、lineStart、lineEnd和精确标题定位。
source key包含阶段、文件及行号；同一文件内也有重复编号，不能只依赖REQ编号。
字段关键词命中只是检查线索，不能充当完整断言、双轮资格或通过判定。

## 1 每条用例必须形成的验收包

| 字段 | 必须能回答的问题 | 缺失时的处置 |
| --- | --- | --- |
| 来源与状态 | 飞书实测、授权推断、项目保护合同、生产要求分别是什么 | 不混成“与飞书一致” |
| 固定前置 | URL、权限、内容、层级、编号/折叠、历史、焦点和选区是什么 | 保留明确缺口，不猜默认状态 |
| 实际动作 | 点击哪个入口，按什么键，选择哪个方向和偏移 | 不用相似入口替代 |
| 精确输出 | 文字、块顺序、类型、父子、格式、标记及范围外内容怎样变化 | 不能仅比较最终全文 |
| DOM身份 | 逻辑record ID、页面block ID、DOM对象分别保留还是重建 | 跨加载不比较对象身份 |
| 变化顺序 | 哪些节点新增/移除/移动、属性和文字怎样改变 | Observer批次不冒充内部事务 |
| 焦点与选择 | 键盘接收者、activeElement、文字Range或自定义块选择是什么 | 隐藏textarea不能当普通文字Range |
| 菜单状态 | 选中/混合/禁用、关闭、取消和后续输入的状态是什么 | 控件亮起不能代替正文结果 |
| 历史与恢复 | Undo、Redo、再次Undo的每个中间态和恢复落点是什么 | 不从一次恢复推断完整分组 |
| 保存与独立读取 | 保存提示和独立重载证明的范围分别是什么 | 只见提示不判持久化成功 |
| 重复条件 | 两次是否同入口、同选区、同前置，哪些窗口被排除 | 文件名R1/R2不能自动配对 |
| 边界与不变量 | 无变化、拒绝、附加空段、部分作用及原文保护怎样判定 | 原始异常不能被成功重测覆盖 |
| 项目目标 | 复刻观察、保留已有保护，还是需要产品决定 | 阶段限制接受不等于允许产品缺陷 |
| 发布关联 | 服务、迁移、权限、性能和回退需要哪些运行证据 | 源码映射不充当发布通过 |

精确用例仍沿用原文中的前置和结果，不能用本页通用步骤覆盖实际差异。
每项至少输出“前置→实际用户动作→精确状态→恢复→同条件复测”的完整包。
不适用字段须解释原因，例如复制不改变正文、视图状态无正文保存，不能简单留空。

## 2 内容与结构合同

| 结构 | 已有可观察合同 | 来源及边界 |
| --- | --- | --- |
| 页标题与正文 | 分属不同区；正文类型命令不能误作用于页标题 | [S01](../01-baseline-and-dom/01-verification-matrix.md)、[S03页标题限制](../03-single-block-conversion/03-reachability-and-properties.md) |
| 正文空态 | 根已加载与加载未完成分开；空叶占位不是用户文字 | [S01](../01-baseline-and-dom/01-baseline-and-dom.md)、[S10清理](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) |
| 标题 | heading1…heading9是级别；编号是附加属性 | [S03输出属性](../03-single-block-conversion/dom/C08-attribute-summary.json)、[S06](../06-numbering-folding-and-outline/06-verification-matrix.md) |
| 列表 | 有序/无序类型、父子关系和标记分别核对 | [S05](../05-nesting-and-combinations/05-verification-matrix.md)、[S06](../06-numbering-folding-and-outline/06-verification-matrix.md) |
| 引用 | quote_container包装内部text、标题或列表；部分取消可能拆包装 | [S03](../03-single-block-conversion/03-reachability-and-properties.md)、[S04](../04-multi-block-conversion/04-structures-history-and-persistence.md) |
| 层级 | 标题级别不自动形成DOM父子；显式嵌套与大纲归属分开 | [S05层级合同](../05-nesting-and-combinations/05-headings-and-ranges.md) |
| 正文缩进 | 首次Tab可能只加text-indent，已有该属性再Tab才嵌套；菜单与按键分别验收 | [S05同前置双轮](../05-nesting-and-combinations/05-headings-and-ranges.md) |
| 标题嵌套 | 已测H9内保留H9、H1内保留H1，不因升级降级自动扁平化 | [S05](../05-nesting-and-combinations/05-headings-and-ranges.md)；不外推任意深度 |
| 硬换段 | 新增逻辑块、分配文字与新落点；首中尾和空块各有分支 | [S02分段](../02-creation-and-editing/02-verification-matrix.md) |
| 软换行 | 同块新增ace-line；不能只数BR或视觉行判断 | [S02](../02-creation-and-editing/02-heading-editing.md)、[S09](../09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| 折叠 | 隐藏后代仍是逻辑内容；复制、删除、查找、导出分别判断范围 | [S06](../06-numbering-folding-and-outline/06-verification-matrix.md) |
| 行内格式 | 显式run属性与块默认字号/字重分开，未选文字保持 | [S03格式](../03-single-block-conversion/03-format-preservation.md)、[S08格式](../08-deletion-movement-formatting-and-clipboard/08-formatting-contracts.md) |

这里只列已观察的合法代表结构；不通过框架Schema存在与否臆造飞书合法集合。
引用、后代、选区跨界的实际作用域须回到具体原JSON，不自动全部递归转换。

## 3 按能力回放时的断言

| 能力 | 最少可执行检查 | 原合同 |
| --- | --- | --- |
| 创建与输入 | 固定空叶/非空落点，输入后核对文字叶、范围外标题及逐步历史 | [S02矩阵](../02-creation-and-editing/02-verification-matrix.md) |
| 单块转换 | 先固定实际来源，再执行目标命令，比较类型/编号/包装及Undo/Redo | [169格来源](./11-coverage-and-conversion.md) |
| 多块转换 | 固定正反Range、末端偏移0、空块和父子范围，核对未选前后缀 | [S04边界](../04-multi-block-conversion/04-selection-boundaries.md) |
| 嵌套与缩进 | 对比结构父级和text-indent；恢复时同时核对外部兄弟 | [S05矩阵](../05-nesting-and-combinations/05-verification-matrix.md) |
| 编号与目录 | 比较不可编辑标记、起点/续号、锚点和隐藏后代；不把编号混入正文 | [S06矩阵](../06-numbering-folding-and-outline/06-verification-matrix.md) |
| 菜单与快捷键 | 固定焦点和输入源，核对可信事件、入口互斥、禁用与取消后的正文 | [S07矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| 删除与替换 | 比较保留前后缀、类型/格式来源、隐藏后代、额外空段及有效落点 | [S08选区](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md) |
| 拖动 | 固定一次按下、按住移动、松开或Escape，比较落点与完整历史 | [S08重新验证](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md) |
| 复制粘贴 | 分别核对plain/HTML/私有载荷、目标结构、批注来源及继续输入 | [S08剪贴板](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) |
| 历史 | 比较每个中间态及范围外数据；时间间隔、采样/重选和输入法均为前置 | [S09合同](../09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| 查找替换 | 读取真实INPUT值、计数、定位、高亮、关闭和正文Undo，不只看paste事件 | [S10](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) |
| 批注修订 | 同时核对文字锚点、标识、卡片和接受/拒绝后的历史，草稿与发布分开 | [S10](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) |
| 保存协同 | 两端固定动作和版本，独立读取并验证本地Undo保留远端内容 | [专项方法](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md) |
| 导出 | 固定设置及源DOM，保存实际文件、解析结构并渲染全页；导入另验 | [S10导出核对](../10-related-features-and-edge-cases/10-export-mixed-inspection.json) |

## 4 属性与数值的来源限制

S03默认代表样例：正文16px/400/26px，H1为26px/500/36.4px，H9为16px/500/22.4px。
这些是[原属性表](../03-single-block-conversion/dom/C08-attribute-summary.json)中的font-size/font-weight/line-height，不是跨平台容差或所有状态的统一样式。
H2–H8级别自身的默认样式有S02独立来源；共同行为推断不能据此制造逐级转换实测。
列表起点、引用内原类型、显式对齐、颜色、链接及首行缩进均按对应具体合同继承，不能统一重置默认值。
项目参数4层列表、部分缩进0–8、正文460000、plain粘贴100000来自总清单的源码登记；不是飞书上限或项目运行结果。
性能p95、长任务/内存容差、视觉容差、浏览器/辅助技术支持范围尚未冻结，不填推测值。

## 5 后续逐条检查的完成条件

每个source key都须关联完整验收包，或明确解释其继承字段和未验证边界。
关联原矩阵时记录精确用例行和有效配对；有R1/R2文件但条件不同仍排除。
原来源目录保留首轮semanticFieldReview=pending；当前逐条状态以[语义复核表](./11-semantic-review.json)为准，不能用关键词检查批量标已审。
核心语义缺失时继续查原始前后状态、必要mutation和焦点，而不是仅引用阶段“已完成”。
所有项目运行栏保持未执行，直到获得真实项目验收证据。

## 6 当前逐条复核进度

[语义复核表](./11-semantic-review.json)保存每条前置、动作、内容/DOM、焦点、菜单/快捷键、历史恢复、配对资格和限制。
当前389个REQ标题中已审389个，尚余0个；13个OBS中已审13个。
另审34个未编号规则，不把它们混入原REQ标题覆盖率；未编号规则清单仍非穷举。
原目录pending是首轮词法索引；当前逐条状态以语义表为准，不以关键词或文件名R1/R2自动通过。
已审表示字段按原语义拆解，不表示每个断言已有双轮，也不表示项目运行通过。
同文件重号按行号/精确标题定位，摘要绑定原段落及明确继承范围。

| 已审来源 | 编号章节数 | 使用边界 |
| --- | --- | --- |
| [01-baseline-and-dom.md](../01-baseline-and-dom/01-baseline-and-dom.md) | 9 | R4/R5是真正同焦点输入；单链/失焦/无监控结果不升级双轮 |
| [02-composition-editing.md](../02-creation-and-editing/02-composition-editing.md) | 3 | H1/H9提交文字不同；远端组合有独立未溢出时间线 |
| [02-creation-and-editing.md](../02-creation-and-editing/02-creation-and-editing.md) | 29 | 主文单链、H5两类历史、列表/引用有效配对分别登记 |
| [02-creation-entries.md](../02-creation-and-editing/02-creation-entries.md) | 16 | 键入/粘贴/菜单的身份、焦点和残留不同；T菜单Escape仍在 |
| [02-format-inheritance.md](../02-creation-and-editing/02-format-inheritance.md) | 3 | 原bold保留，新9恢复默认；共同八键历史显式继承 |
| [02-heading-editing.md](../02-creation-and-editing/02-heading-editing.md) | 15 | 各级/首中尾分别；H2旧实测保留，空H9临时hidden焦点单列 |
| [02-list-adjacency.md](../02-creation-and-editing/02-list-adjacency.md) | 3 | 相邻续2.与bullet中断后1.分开，范围外项保持 |
| [02-navigation-editing.md](../02-creation-and-editing/02-navigation-editing.md) | 4 | 跨块只R1/R3同起点；Down可新增块；软行AX不冒充LF |
| [02-persistence-editing.md](../02-creation-and-editing/02-persistence-editing.md) | 1 | 七记录67/678独立读取与八记录Chrome再加载分开 |
| [02-quote-editing.md](../02-creation-and-editing/02-quote-editing.md) | 9 | 同文件重号不合并；续段/退出、内转换/外插入分开 |
| [02-selection-editing.md](../02-creation-and-editing/02-selection-editing.md) | 12 | 稳定跨块/HTML采用后续有效窗口；历史越空不当受控清理 |
| [02-unicode-editing.md](../02-creation-and-editing/02-unicode-editing.md) | 8 | 005–009是五分支合并标题；合成é与x重音删除不同 |
| [03-format-preservation.md](../03-single-block-conversion/03-format-preservation.md) | 9 | 格式/父级/对齐按源前置；富格式接续历史可合并 |
| [03-reachability-and-properties.md](../03-single-block-conversion/03-reachability-and-properties.md) | 3 | 30异类/6同类实际与其余授权推断分开；页标题命令限制 |
| [03-single-block-conversion.md](../03-single-block-conversion/03-single-block-conversion.md) | 27 | 新包装/内转换/属性命令/下方插入不同；有效配对及后补记录明确 |
| [04-homogeneous-matrix.md](../04-multi-block-conversion/04-homogeneous-matrix.md) | 6 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [04-multi-block-conversion.md](../04-multi-block-conversion/04-multi-block-conversion.md) | 18 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [04-selection-boundaries.md](../04-multi-block-conversion/04-selection-boundaries.md) | 5 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [04-structures-history-and-persistence.md](../04-multi-block-conversion/04-structures-history-and-persistence.md) | 5 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [05-complex-history-and-persistence.md](../05-nesting-and-combinations/05-complex-history-and-persistence.md) | 6 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [05-headings-and-ranges.md](../05-nesting-and-combinations/05-headings-and-ranges.md) | 8 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [05-nesting-and-combinations.md](../05-nesting-and-combinations/05-nesting-and-combinations.md) | 8 | 全部22章已审；文本缩进与结构父子分开，已有无固定上限决定保持 |
| [06-numbering-folding-and-outline.md](../06-numbering-folding-and-outline/06-numbering-folding-and-outline.md) | 11 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [07-menus-and-shortcuts.md](../07-menus-and-shortcuts/07-menus-and-shortcuts.md) | 1 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [07-verified-contracts.md](../07-menus-and-shortcuts/07-verified-contracts.md) | 20 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-clipboard-contracts.md](../08-deletion-movement-formatting-and-clipboard/08-clipboard-contracts.md) | 32 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-deletion-movement-formatting-and-clipboard.md](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md) | 21 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-formatting-contracts.md](../08-deletion-movement-formatting-and-clipboard/08-formatting-contracts.md) | 19 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-full-verification-matrix.md](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md) | 16 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-movement-observations.md](../08-deletion-movement-formatting-and-clipboard/08-movement-observations.md) | 10 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-nested-deletion.md](../08-deletion-movement-formatting-and-clipboard/08-nested-deletion.md) | 6 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-selection-deletion.md](../08-deletion-movement-formatting-and-clipboard/08-selection-deletion.md) | 14 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [08-supplemental-contracts.md](../08-deletion-movement-formatting-and-clipboard/08-supplemental-contracts.md) | 3 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [09-undo-redo-and-history-boundaries.md](../09-undo-redo-and-history-boundaries/09-undo-redo-and-history-boundaries.md) | 22 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |
| [10-related-features-and-edge-cases.md](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md) | 20 | 逐条字段及限制见语义复核表，不把章节数当功能通过数 |

未编号补证覆盖S01、S02、S06和S10的具体规则；各来源范围与资格见语义表，不是新增实测。
监控累计限制按[限制报告](./11-monitoring-limits-audit.json)逐例核对，不能宣称全部旧窗口overflow为0。
