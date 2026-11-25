# S06 运行矩阵

状态：F01–F07共7/7已按本阶段代表范围完成。Chrome主测，夸克仅独立读取及必要远程修改。
本表是具体规则与证据的映射，不把文件数当通过数；整项勾选以研究清单标准为准。
有效双轮已连同属性、选区、身份、历史及交叉审计核对；失败及探索记录继续保留，不计通过。
H2–H8 共同行为仅按 sir 授权推断，不计实测。
文件名省略公共目录 dom/ 和 .json；R1/R2 指两份窗口及其相应历史文件。

## F01 列表接续

| 规则 | 当前证据 | 有效范围 |
| --- | --- | --- |
| F01-001 中项转正文 | middle-text R3/R4 | 三个有序项加同一末空段，后项3→2；R1/R2前置不同不拼双轮 |
| F01-002 正文接入有序 | middle-rejoin R1/R2 | 1/无/2→1/2/3，真实历史 |
| F01-003 末项重启 | restart-last R1/R2 | 1/2/3→1/2/1，菜单禁用态与历史 |
| F01-004 恢复续编号 | continue-last R1/R2 | 1/2/1→1/2/3，菜单禁用态与历史 |
| F01-005 H1中断 | plain-heading1-interruption-double | 后续普通列表继续2/3/4 |
| F01-006 H9中断 | plain-heading9-interruption-double | 与H1代表结果一致 |
| F01-007 不同行内属性 | bold-middle-rejoin-double | 加粗中项接入1–5，格式保持 |
| F01-008 自定义起点 | custom-start-seven-double | CCC起点2→7，后项8/9；首轮菜单原已打开 |
| F01-009 无序取消 | bullet-middle-text-double | 其他四项标记保持 |
| F01-010 无序接入 | bullet-middle-rejoin-double | 恢复五项bullet |

## F02 全部受影响标记

| 规则 | 文件前缀 F02- 后的证据 | 实测结果 |
| --- | --- | --- |
| F02-001 中间插空项 | middle-empty-insert-double | 新项2，BBB3，其他后项4–6 |
| F02-002 列表首Backspace | middle-backspace-merge-double | 实际降为正文，文件名不代表合并 |
| F02-003 偏移1拆分 | middle-offset1-split-double | B/BB成为2/3，后项4–6 |
| F02-004 转无序 | ordered-middle-to-bullet-double | BBB改•，后项有序2–4 |
| F02-005 缩进 | middle-indent-double | BBB变AAA子项a.，后续顶层2–4 |
| F02-006 反缩进 | middle-outdent-double | BBB回顶层2，后项3–5 |
| F02-007 正文首删除 | text-middle-delete-merge-double | AAABBB合并，后项2–4 |
| F02-008 整块移动 | cut-paste-move R2/R3 | 剪切粘贴两步历史；R1缺菜单DOM，不计有效双轮 |

## F03 编号标题

| 规则 | 文件前缀 F03- 后的证据 | 实测结果 |
| --- | --- | --- |
| F03-001 ordered→H1/H9 | ordered-to-numbered-heading1/9-double | BBB从列表2改标题1；其他列表1/2/3/4 |
| F03-002 H1/H9加编号 | plain-heading1/9-add-number-double | 添加独立不可编辑编号按钮；不同块数前置分开 |
| F03-003 H9↔H1 | numbered-heading9-to-heading1-double及反向 | 编号1保持；内部壳可重建，外层保持 |
| F03-004 混合跳级 | mixed-headings-level-jump-double | H1 BBB2→H9 1.1，DDD3→2；不补中间级别 |
| F03-005 重启 | heading-restart R1/R2及final-history | BBB2→1，DDD3→2 |
| F03-006 继续 | heading-continue R1/R2及final-history | 恢复BBB2、DDD3 |

## F04 折叠范围与编辑

| 规则 | 文件前缀 F04- 后的证据 | 状态与边界 |
| --- | --- | --- |
| F04-001 父折叠范围 | parent-collapse/expand R1/R2 | 隐藏BBB/CCC，到DDD停止；展开复用原对象 |
| F04-002 嵌套保留 | child-collapse、nested-parent-collapse/expand、child-expand R1/R2 | 父展开保留子折叠，两轮一致 |
| F04-003 H1/H9文字编辑 | folded-heading1/9-paste-edit R1/R2 | 粘贴X及真实历史保持折叠 |
| F04-004 H1/H9转正文 | folded-heading1/9-to-text R1/R2 | 内容展开；undo恢复类型但保持展开 |
| F04-005 H1/H9整块删除 | folded-heading1/9-delete R1/R2及history | 删除隐藏组，历史恢复原组及折叠 |
| F04-006 选区与全选 | folded-select-first-R1；F04-F06-folded-select-all-copy R1/R2 | 首次只选AAA，第二次整块选区含隐藏内容 |
| F04-007 全选删除 | folded-select-all-delete R1/R2及history | 复杂累积样例两轮同前置；清空/恢复 |
| F04-X01 原生单字符异常 | folded-heading9-edit-double | 不通过：x之后Cmd+Z追加z/Z，前置未恢复；后续真实选文粘贴恢复BBB |

## F05 目录

| 规则 | 证据 | 结果与后续 |
| --- | --- | --- |
| F05-001 层级锚点 | heading9-to-heading1-anchor-double及反向 | a对象与href保持，层级/前缀同步 |
| F05-002 删除锚点 | F04折叠H1/H9删除两轮 | 对应目录项退出及恢复，含anchors字段 |
| F05-003 标题移动 | heading-cut-paste-move R1/R2及history | 目录顺序与2.1前缀更新，新href；两步历史逐步断言 |
| F05-004 目录折叠 | outline-chevron-expand/collapse R1/R2 | 只改目录，正文仍折叠 |
| F05-005 隐藏锚点导航 | outline-hidden-anchor R1/R2 | 自动展开正文，短样例scrollTop均134 |
| F05-006 空白和重名锚点 | F07-empty/duplicate-heading1/9-navigation source/target R1/R2 | 各两轮对应正确记录、唯一href、active项及重复滚动位置；四块来源单列 |

## F06 交叉影响

| 规则 | 证据 | 当前状态 |
| --- | --- | --- |
| F06-001 复制纯文本 | folded-copy-plain-probe-R1；F04-F06-folded-select-all-copy-R2 | 两次均含隐藏BBB/CCC及编号前缀 |
| F06-002 结构粘贴 | structured-paste-continuous R1/R2；pasted-hidden-content-inspect/restore R1/R2 | 同来源双轮；两次撤销移除、一次重做恢复、一次撤销还原；副本展开回读含BBB3.1/CCC1。早期body-paste累积窗口不计通过 |
| F06-003 隐藏文字查找 | folded-find-BBB R1/R2 | 1/1并展开正文；首次焦点误粘贴已撤销并保留 |
| F06-004 编号查找 | find-number-marker R1/R2 | 当前1.1编号为0/0，BBB为1/1 |
| F06-005 Word导出 | folded-word-export源/设置R1/R2；exports/F06-export-analysis | 两次包含隐藏内容、段落及编号语义一致，随机XML ID不同 |
| F06-006 折叠历史 | heading1/9-fold-history R1/R2 | 各两轮一次undo展开、redo折叠、undo展开；实际全文/标记及可信按键一致 |
| F06-007 协同 | Collab R1/R2；RemoteNumber有效R1/R3及history | 本地/远程文字undo隔离；远端编号9/9.1/10和折叠同步；R2额外空段导致恢复失败，排除并实际恢复 |
| F06-008 保存重载 | P1/P2 Chrome；X1/X2 Chrome/Quark reload-folded/expanded | 两类来源分别完整回读，文字/编号/样式/持久ID/目录一致；同账号折叠保留，内部存储机制未知 |

## F07 边界

| 规则 | 当前状态 | 必需结果 |
| --- | --- | --- |
| F07-001 个位进入多位 | list-nine-ten-eleven R2/R3；heading1/9-nine-ten-eleven R1/R2 | 9/10/11及历史、持久记录、字号/宽度/6px间距已核对；列表R1来源全选仅作探索 |
| F07-002 隐藏编号更新 | hidden-numbering-paste-blur-probe与paste-blur-R2；hidden-list R1/R2 | 标题展开为9.1/9.2，列表展开为10/11；各来源及六步历史一致。仅证明展开回读；未生效输入和额外恢复键另列 |
| F07-003 空标题 | empty-heading1/9-double；各navigation R1/R2 | 空值保留类型、编号、原记录与href；目录仅编号可定位。编辑三块来源、导航四块来源分别判断 |
| F07-004 重复标题 | duplicate-heading1/9-double；各navigation R1/R2 | 同级重名保留独立原记录/href；两轮定位active项与滚动一致 |

所有异常、未执行调用和原始证据均保留；自动审批容量不足/超时不是飞书功能结论。历史夸克访问拒绝后，sir明确要求直接前台调用，同一原生入口已允许并完成上述实操。
最终360份JSON（352正文DOM、8辅助）及两份Word另存；专用语义审计和最终清理断言通过，既有F04按键异常、R2额外空段均排除。详见主文档第18–19节及06-audit.json。
16:34两边真实刷新确认空正文、空标题和无观察器，控制台关闭，夸克恢复TDesign；未修改业务代码或执行项目生产验收。
