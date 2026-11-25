# S11 需求收口与重构验收索引

交付日期：2026-10-27。sir已明确接受S11研究包交付完成；最终需求继续待收口，项目发布仍阻断。
本阶段按[总清单K01–K08](../ym-research-task.md)执行，不修改业务代码。
本批没有启动项目完整编辑器、浏览器或服务端验收；标题转正文隔离验证确认两例遗漏后代，键盘扩展实际配置/回调另有隔离证据。
S01–S10按各阶段接受范围交付，不自动获得S11逐条复核或项目发布通过状态。

## 1 当前交付与状态

| 条目 | 当前结果 | 后续完成条件 |
| --- | --- | --- |
| K01 范围映射 | 来源分配完成：19项能力、169转换格、8类入口、7个状态维度、7类异常 | 索引不表示状态交叉组合全部实测 |
| K02 每条需求可执行 | 389个REQ、13个OBS均有具体字段，另审34组未编号规则 | 239个原未分配标题已分类，不等于全部无标题条款均穷举审计；核心未定项保持显式限制 |
| K03 跨阶段一致性 | 30项条件差异裁定已登记，已纠正深度决定的遗漏 | 编号合同及共用上下文按入口、属性、时序和实际范围区分；未测组合不宣称一致 |
| K04 项目差异 | 19项能力、436张卡的项目入口、4项对齐差异和7项问题/待核对条件已登记，7项批准保护沿用 | 映射不判每条行为一致；SR05后代遗漏、SR06命令注册缺失保留，完整Editor/UI/服务未运行 |
| K05 证据质量 | 717份旧补丁/1074窗口可展开、436份原哈希匹配；22份监控限制、1项DOM命名映射已登记 | 配对资格逐卡保留；不声称所有监控完整或旧补丁与精简前原件完全等值，私有载荷不作通用规范化保证 |
| K06 索引与统计 | 本页、能力/转换表、逐卡项目入口和来源清单已交付 | 交付统计及资料静态检查已核对，不把目录数作为功能通过数 |
| K07 实现合同 | 编辑/保存/恢复状态、结构属性和真实客户端服务依赖已分列 | 核心服务协议、合法范围、性能/视觉阈值及支持环境仍未冻结 |
| K08 两类验收 | 研究交付与项目发布门禁分别列出 | 研究交付完成；最终规范待收口，项目发布不可判为通过，回退仍未运行 |

进入实现前，须以具体前置、动作、结果和恢复断言确定规则。
不能仅凭本页的阶段完成记录或覆盖数量决定实现行为。

## 2 使用入口

| 文件 | 用途 |
| --- | --- |
| [能力、转换、入口、维度与异常](./11-coverage-and-conversion.md) | 从功能范围查合同；转换目标是命令，不保证输出为同名块 |
| [逐条验收方法与结构合同](./11-acceptance-contracts.md) | 补齐每条用例的前置、动作、DOM、菜单、焦点、历史与恢复 |
| [逐条语义复核表](./11-semantic-review.json) | 389个REQ、13个OBS及34组未编号规则的具体字段、配对资格和限制 |
| [来源章节分类](./11-section-coverage.json) | 655个二级标题中416项已绑定；其余239项已按来源与行号分为方法、索引、失败、历史及合同引用，分类不改变功能状态 |
| [DOM标识复核](./11-identifier-review.json) | 2678份JSON的限定字段扫描，仅一项FeishuclipOutlined映射；不改旧证据、URL或正文 |
| [本批交接与未决条件](./11-stage-handoff.md) | 记录已接受的研究交付范围；最终指标冻结与真实项目验收继续开放 |
| [项目当前合同对照](./11-project-contract-comparison.md) | 19项能力、当前4层与既有无固定上限决定、折叠历史、保存/门禁/恢复等具体差异 |
| [逐卡项目验收入口](./11-project-case-map.json) | 436张卡逐个关联项目能力与相关问题，不把关联风险当该卡已失败或已通过 |
| [实际函数隔离证据](./11-heading-text-isolated-probe.json) | 标题转正文控制样例通过，两个后代样例确定遗漏内容；完整UI/协同未运行 |
| [实际键盘配置与回调](./11-keyboard-contract-probe.json) | 首次选全文、自身命令注册缺失及原PM警告；真实Editor命令集和系统按键未运行 |
| [状态与服务合同](./11-state-and-service-contracts.md) | 区分飞书观察、当前客户端调用和项目生产要求；性能/视觉值仍待冻结 |
| [条件差异、保护合同与发布门禁](./11-conflicts-and-release-gates.md) | 查首轮冲突裁定、7项已批准差异、未验证专项及已有失败 |
| [需求来源目录](./11-requirement-catalog.json) | 精确文件/行范围/标题/章节哈希及证据引用，关键词信号仅作待审线索 |
| [转换机器索引](./11-conversion-index.json) | 169格实测/推断状态、实际输出和证据地址 |
| [能力机器索引](./11-capability-map.json) | 总清单19项原能力及各维度来源，不代表项目运行通过 |
| [来源审计](./11-source-audit.json) | 当前文件口径、解析、链接、编码哈希、命名候选及审计边界 |
| [S07原编码复核](./11-legacy-encoding-audit.json) | 238份排序规范JSON原哈希及源文件摘要 |
| [旧差量编码复核](./11-delta-encoding-audit.json) | RFC6902/$dom实际展开与S04/S05的436份原哈希核对，明确两者不同证明范围 |
| [监控累计限制](./11-monitoring-limits-audit.json) | 22份非零限制记录及远端组合输入的替代证据范围 |
| [当前源码摘要与定位](./11-project-source-audit.json) | 当前源码文件摘要与关键风险片段，防止代码变化后沿用旧结论 |
| [来源文件清单](./11-source-manifest.json.gz) | 压缩保存2727份Markdown/JSON的路径、大小与SHA-256 |
| [启动静态检查](./11-startup-audit.json) | 核对新索引、源文件未改及本批检查边界；不是功能测试报告 |
| [本批复核检查](./11-review-progress-audit.json) | 复核卡来源、字段、链接、编码统计及源码摘要的静态核对 |

## 3 阶段合同与证据入口

| 阶段 | 需求与矩阵 |
| --- | --- |
| S01 基线与DOM | [阶段需求](../01-baseline-and-dom/01-baseline-and-dom.md)、[矩阵](../01-baseline-and-dom/01-verification-matrix.md) |
| S02 创建与编辑 | [阶段需求](../02-creation-and-editing/02-creation-and-editing.md)、[矩阵](../02-creation-and-editing/02-verification-matrix.md) |
| S03 单块转换 | [阶段需求](../03-single-block-conversion/03-single-block-conversion.md)、[矩阵](../03-single-block-conversion/03-verification-matrix.md) |
| S04 多块转换 | [阶段需求](../04-multi-block-conversion/04-multi-block-conversion.md)、[矩阵](../04-multi-block-conversion/04-verification-matrix.md) |
| S05 嵌套组合 | [阶段需求](../05-nesting-and-combinations/05-nesting-and-combinations.md)、[矩阵](../05-nesting-and-combinations/05-verification-matrix.md) |
| S06 编号折叠目录 | [阶段需求](../06-numbering-folding-and-outline/06-numbering-folding-and-outline.md)、[矩阵](../06-numbering-folding-and-outline/06-verification-matrix.md) |
| S07 菜单快捷键 | [阶段需求](../07-menus-and-shortcuts/07-menus-and-shortcuts.md)、[矩阵](../07-menus-and-shortcuts/07-verification-matrix.md) |
| S08 删除移动剪贴板 | [阶段需求](../08-deletion-movement-formatting-and-clipboard/08-deletion-movement-formatting-and-clipboard.md)、[后续有效矩阵](../08-deletion-movement-formatting-and-clipboard/08-full-verification-matrix.md) |
| S09 撤销重做 | [阶段需求](../09-undo-redo-and-history-boundaries/09-undo-redo-and-history-boundaries.md)、[历史合同](../09-undo-redo-and-history-boundaries/09-history-contracts.md) |
| S10 关联与异常 | [阶段需求](../10-related-features-and-edge-cases/10-related-features-and-edge-cases.md)、[验收与缺口](../10-related-features-and-edge-cases/10-acceptance-and-gaps.md) |

各阶段原JSON包含建样、失败、探查、恢复及最终窗口，不能按文件数统计有效双轮。
S08较早收口表与后续拖动实测不同的部分，按后续具体有效窗口和实际条件裁定。

## 4 本批统计与证据边界

来源为当前10个阶段目录：49份顶层Markdown、2678份JSON，解析错误为0。
389个REQ标题展开为393次编号出现、385个不带来源的独立编号；另有13个OBS标题。
发现6组重复原编号，包括同文件内重号；必须使用“阶段/文件:行号＋精确标题”定位，不合并规则。
4033个原Markdown本地链接目标存在；本批未验证标题锚点和外部URL。
169转换格为30个异类实测、6个同类实测、126个异类授权推断、7个同类授权推断。
各入口及状态维度有来源分配，不表示完成所有两两组合。
759份规范化快照哈希与238份原编码哈希共997份均匹配。
S07使用排序UTF-8规范JSON，12份还计入标识规范化字段；S08部分文件需递归展开长字符串字典。
初版通用解码器的差异已按原编码口径消解，没有改写原证据，也不把解码器差异记成产品失败。
旧1681份范围本批进一步拆分：717份补丁文件共1074窗口可展开；436份对象编码原哈希匹配；其余528份为其他原始记录或辅助报告。
合计1433份带原/规范摘要的编码文件匹配；717份旧补丁只验证引用与补丁可应用性，不能自证精简前后完全等值。
22份S02记录有非零累计监控限制；组合远端用例有未溢出的独立时间线，但完整mutation和部分瞬间读数仍缺。
完整源文件摘要保存于压缩清单；这不替代有效配对、监控完整性和必要关系的逐条检查。
首轮21组启动检查保留；本批检查报告另核对436张卡、引用继承、标题分类和DOM命名映射，2727份既有来源文件摘要未变。这些是资料静态检查。

## 5 保留项与下一轮复核

I05旧记录仍含data-icon=FeishuclipOutlined；原证据保持不动，复刻映射登记为maiyaclipOutlined。
该限定字段映射已绑定原HTML路径；私有载荷、全部动态选择器及项目输出仍未作通用规范化保证。
S08隔离JSDOM粘贴链存在“外来旧批注身份恢复”确定失败，当前没有关闭证据；详情见BG01；新发现的标题转正文后代遗漏见BG08。
该证据不是生产攻击或真实服务端权限复现，也不能因阶段研究完成而自动改成通过。
真实权限/AI锁、保存协议与会话隔离、迁移回退、性能生命周期和完整项目工作流继续项目专项。
S10的两个空段、窄面板裁切及Word当前渲染器编号差异保留；接受研究限制不等于批准项目照搬异常。
列表无固定上限是S05已有决定；当前4层常量列为重构对齐项，不再当作待sir决策。
编号章节已审完，239项原未分配标题已完成资料角色分类；不据此把方法、旧失败或无标题条款自动判为功能通过。
sir已接受“研究包交付完成，最终需求仍待收口”；K01–K08仅按研究交付及明确限制勾选。性能、视觉、支持环境和核心接口未冻结，项目发布继续阻断。
接受原文及交付前版本摘要见[范围接受记录](./11-scope-acceptance.json)；最终资料检查见[交付审计](./11-final-delivery-audit.json)。
