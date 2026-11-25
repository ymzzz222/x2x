# S08 格式与继续编辑合同

状态：2026-10-21，按已确认代表范围及入口限制结束研究交付。只将下列固定条件双轮列为已验证；其他混合格式和完整清格式入口的缺口见[收口清单](./08-closeout-review.md)。
总范围见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)。

## 1 共用前置与判定

来源为指定飞书 Chrome 实测；页标题 Title，正文为 Alpha text、编号 H1 Beta、Gamma text、Quote 引用及末空 bullet。
真实点击 Alpha 文字区建立正文根焦点，Cmd+A 一次选择当前 Alpha:0→5；不是两次 Cmd+A 的全块隐藏输入。
每条格式用例真实执行格式键、Cmd+Z、Cmd+Shift+Z、Cmd+Z，保存可信键位、正文树、必要 mutation、焦点和选区。
使用各键前稳定读数、selectionchange 与最终状态共同核对，首帧不替代最终光标。
正文样式属于实际 DOM 合同，不能只依赖工具栏高亮或原生 AX 中的文字。
外层、内部格式 span 与文字叶分别判定身份，不把“块 ID 保持”说成整个子树保持。
以下各两轮 errors/overflow 均为空；未独立重载，云端提示不代表持久性已验收。
S07 的入口和快捷键证据作为线索保留，不冒充本阶段新操作；H2–H8 共同行为仅在两端实际相同后按既定授权推断。

## 2 REQ-S08-H04-001 选中文字的粗体

状态：同前置双轮已验证。来源：飞书实测。
证据：[R1](./dom/H04-alpha-bold-R1.json)、[R2](./dom/H04-alpha-bold-R2.json)。
Cmd+B 对 Alpha 添加包含 font-weight:bold 的 span，文字保持 Alpha，Range 仍为 0→5。
撤销移除粗体，重做恢复粗体，再撤销去掉；正文类型和块顺序不变。
Alpha 外层 n2309/ID147、编辑区 n2312、行 n2313 保持；格式 span 与文字叶在应用及历史中重建。
例如 R2 应用时 span/文字为 n2844/n2845，末态恢复普通文字为 n2850/n2851，不能声称原文字叶复用。
页标题、编号 H1、Gamma、引用、末空 bullet 保持其文字、类型和外层身份。
验收须同时核对精确范围、文字样式、身份和四步历史；不推断空光标续写或混合范围的开关规则。

## 3 REQ-S08-H04-002 选中文字的斜体

状态：同前置双轮已验证。来源：飞书实测。
证据：[R1](./dom/H04-alpha-italic-R1.json)、[R2](./dom/H04-alpha-italic-R2.json)。
Cmd+I 对 Alpha 添加 font-style:italic，Range 仍覆盖 Alpha 0→5。
撤销去掉、重做恢复、再次撤销去掉斜体，文字、类型及块序始终保持。
Alpha 外层/编辑区/行复用，格式 span 与文字叶重建；R1 首次 n2852/n2853、末态 n2858/n2859，R2 首次 n2860/n2861、末态 n2866/n2867。
相邻块、引用内部结构及页标题保持；不把字符未变与文字对象未变混淆。
验收逐步核对实际 font-style、范围、身份和历史；没有验证与粗体同时存在或清格式。

## 4 REQ-S08-H04-003 选中文字的下划线

状态：同前置双轮已验证。来源：飞书实测。
证据：[R1](./dom/H04-alpha-underline-R1.json)、[R2](./dom/H04-alpha-underline-R2.json)。
Cmd+U 对 Alpha 添加 underline class，style 包含 text-decoration:underline、text-underline-offset:0.2em、text-decoration-skip-ink:none。
真实撤销去掉、重做恢复、再次撤销去掉；文字 Alpha 和 Range 0→5 保持。
Alpha 外层/编辑区/行复用，格式 span 和文字叶重建；R1 首次 n2868/n2869、末态 n2874/n2875，R2 首次 n2876/n2877、末态 n2882/n2883。
其他混合正文与页标题保持，不能将该结果推广为混合下划线选区或不同平台排版相同。
验收读取完整相关样式与范围，并检查历史、原块身份及相邻保护；不能只看是否有一条线。

## 5 代表范围与已接受的格式限制

混合粗体范围开关已补固定条件双轮（第 16 节）；完整清格式及其他混合格式仍待核对，粗体正文转 H1 后直接续写已补双轮（第 19 节），其他格式、颜色、对齐及列表缩进结果见后文。
未将菜单未打开解释为产品不支持，也没有执行项目生产验收或修改业务代码。

## 6 REQ-S08-H08-001 输入可确认域名后取消链接

状态：同入口双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H08-link-domain-cancel-R1.json)、[R2](./dom/H08-link-domain-cancel-R2.json)。
Alpha:0→5，真实 Cmd+K，出现 edit-link-panel onlyLink edit-link-panel-narrow；INPUT 占位为“粘贴或输入链接”，初始确认按钮 disabled。
逐字输入 example.com，实际 input.value 与原生 AX 均核对为该字符串，确认按钮启用；真实 Escape 关闭未提交的编辑。
原正文和页标题文字、类型、块外层与结构保持，Alpha 没有 A 链接；内部普通文字叶可能重建，不能声称子树全身份保持。
取消后的公开选区为隐藏输入/BODY 的异常承载，不等于保持原可编辑 Range；焦点与 selectionchange 如实保留。
本条没有撤销未知内容历史，未把输入框原生编辑历史当作正文历史。errors/overflow 均为空，未独立重载。
验收核对按钮启用、未提交取消、无链接残留与原内容保护；恢复后的正文继续输入仍需明确点击正文定位。

[早期输入探查](./dom/H08-link-cancel-R1.json)逐字输入漏掉冒号，实际值 https//example.com/s08，确认仍 disabled；不作有效 URL 用例。
[粘贴探查](./dom/H08-link-url-paste-input-probe.json)已收到可信 INPUT paste 和 insertFromPaste beforeinput，载荷为 https://example.com/s08，但 input.value 保持空，不能宣称 URL 写入成功，也未通过权限变更绕过。
两份记录保留为输入通道/场景限制，不泛化成所有 URL 拒绝；有效双轮固定为可达的 example.com 逐字入口。

## 7 REQ-S08-H04-004 域名链接应用与默认协议

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H04-link-domain-apply-history-R1.json)、[R2](./dom/H04-link-domain-apply-history-R2.json)。
Alpha:0→5，Cmd+K，逐字输入 example.com 并核对值/启用按钮，再真实点击“确认”；不导航到该链接。
Alpha 文字包入 outer-u-container/docx-outer-link-container、link-wrapper 和 A，真实 href 为 http://example.com，应用后光标在 Alpha:5。
Cmd+Z 移除链接并恢复原 Range，Cmd+Shift+Z 恢复相同 href，再 Cmd+Z 移除；块外层/编辑区/行保持，链接包装、普通 span 与文字叶按历史重建。
最终正文文字、类型、顺序及相邻混合块保持，errors/overflow 均为空；未独立重载，未验证点击跳转、链接编辑或所有协议限制。
差异 DR-S08-H04-001 已由 sir 于 2026-10-21 确认：飞书该入口默认 http，项目保留现有 Link 配置 defaultProtocol=https；实测结果保持原样，未修改实现或完成项目验收。
验收读取实际 href、包装、光标、范围恢复和完整历史；按钮可用不能代替应用成功，也不能作为 HTML/URL 已可信的依据。

## 8 REQ-S08-H04-005 选中文字的删除线

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；本次为重新加载后的独立 n 引用会话，末空目标已为 ordered。
证据：[R1](./dom/H04-alpha-strike-R1.json)、[R2](./dom/H04-alpha-strike-R2.json)。
Alpha:0→5，真实 Cmd+Shift+X 添加 strike-through class 及 text-decoration:line-through，文字和 Range 保持。
Cmd+Z 去掉、Cmd+Shift+Z 恢复、Cmd+Z 再去掉删除线；外层 n12/ID2、编辑区与行保持，格式 span/文字叶重建，相邻混合块与页标题保持。
R2 首次格式 span/文字为 n546/n547，实际每步 mutation 与选区见 JSON，末态无 strike-through。
[候选键探查](./dom/H04-strike-key-probe.json)先以实际 DOM 确认候选键生效，再[单独撤销恢复](./dom/H00-strike-probe-recovery.json)，不盲目撤销未知历史；探查不计双轮。
errors/overflow 均为空，未独立重载；验收分别检查范围、样式、身份与完整历史，不推广混合选区或所有入口。

## 9 REQ-S08-H04-006 已有红字黄底组合的快捷键应用

状态：同前置双轮已验证，仅覆盖本次既有颜色组合。来源：飞书 Chrome 实测。
证据：[R1](./dom/H04-alpha-recent-color-key-R1.json)、[R2](./dom/H04-alpha-recent-color-key-R2.json)。
页标题 Title，Alpha text、编号 H9 Beta、Gamma、Quote 引用及末空 ordered；Alpha 初始无显式颜色/背景。
真实点击并定位 Alpha，Cmd+A 一次选择 0→5，再按 Cmd+Option+H；本条件直接应用已有组合，没有打开调色面板。
Alpha 出现 textHighlight-pink-text、textHighlight-ccmtoken-doc-textcolor-red 和 text-highlight-background-yellow-dark-bg；computed color 为 rgb(216, 57, 49)，background-color 为 rgb(255, 233, 40)。
明确点击页标题后分别执行 Undo、Redo、Undo；实际样式依次回到默认文字 rgb(31, 35, 41)/透明背景、恢复组合、回到默认。每步稳定样本均保留 Alpha 的 Range 0→5。
Alpha 外层 n1098/ID103、编辑区 n1101、行 n1102 保持；相邻混合块、引用父子、页标题和末空 ordered 的文字、类型与外层身份保持。
computed 样本在控制台读取，因此另保留其焦点及 UI 取样动作；不把取样后的控制台焦点当作格式命令自身的最终焦点。
errors/overflow 均为空，尚未独立重载。不能由该结果推断颜色组合的持久设置来源、全部调色项或其他平台键位。

[快捷键入口探查](./dom/H04-color-shortcut-probe.json)与[撤销恢复](./dom/H00-color-shortcut-probe-recovery.json)单列，不计双轮。
[颜色面板截图](./dom/H04-color-palette-entry.jpg)、[AX](./dom/H04-color-palette-entry-AX.txt)及[入口 DOM](./dom/H04-color-menu-entry-probe.json)仅证明可见字体色/背景色/恢复默认入口，不证明选色生效。
[未生效的蓝色点击及历史探查](./dom/H04-alpha-blue-text-R1.json)没有出现蓝色，其 Undo 误回退末空 ordered 为 bullet，已[Redo 恢复 ordered](./dom/H00-color-missed-click-history-recovery.json)；保留排除，不计颜色用例通过。

## 10 REQ-S08-H04-007 调色面板单独应用蓝色文字

状态：固定入口双轮已验证。证据：[R1](./dom/H04-palette-blue-text-valid-R1.json)、[R2](./dom/H04-palette-blue-text-valid-R2.json)。
当前 Alpha 为 n3188/ID120，来源是人工拖动分栏序列恢复后的新外层；不能与先前 n1098/ID103 混为同一节点。
原生选中 Alpha:0→5，打开气泡颜色菜单，选择蓝色字体；两轮均取得实际色块 click 与 textHighlight-blue-text/textHighlight-ccmtoken-doc-textcolor-blue。
computed color 为 rgb(36, 91, 219)，背景保持透明；Undo 默认灰色、Redo 蓝色、Undo 默认灰色，Range 保持。
Alpha 外层、编辑区 n3191、行 n3192 保持，格式 span/文字叶重建；相邻混合块与页标题保持。
原生入口包含首次点击未送达时的停留后再次点击，不能将调用次数等同实际 DOM click 次数，也不推广为飞书必须双击色块。
[送达探查](./dom/H04-palette-mouse-delivery-probe.json)保留该入口定位过程及实际颜色历史，不计本条双轮。
errors/overflow 均为空，未独立重载；验收读取实际 class、计算色值、范围与历史，不能只看色块高亮。

## 11 REQ-S08-H04-008 调色面板单独应用黄色背景

状态：固定条件双轮已验证。证据：[R1](./dom/H04-palette-yellow-background-R1.json)、[R2](./dom/H04-palette-yellow-background-R2.json)。
普通 Alpha:0→5，在颜色面板选择深黄色背景，出现 text-highlight-background-yellow-dark-bg，computed background-color 为 rgb(255, 233, 40)。
文字仍为默认 rgb(31, 35, 41)，没有引入文字色；三步历史依次透明、黄底、透明，Range 与外层/编辑区/行身份保持。
R1 的早期选区/菜单前置未就绪时停止色块动作，实际置前并打开面板后才应用；R2 固定置前入口首次实际点击生效。
相邻混合内容、页标题保持，errors/overflow 均为空；未独立保存读取，不推断全部背景色值。

## 12 REQ-S08-H04-009 颜色恢复默认保留粗体

状态：固定条件双轮已验证。证据：[R1](./dom/H04-color-default-keeps-bold-R1.json)、[R2](./dom/H04-color-default-keeps-bold-R2.json)。
[建样](./dom/H00-bold-color-reset-fixture.json)以真实 Cmd+B 和 Cmd+Option+H 建立粗体、默认文字色与黄底并存的 Alpha。
选中 Alpha:0→5，在实际颜色菜单点击“恢复默认”；黄底清除，文字仍为默认色，font-weight:bold/计算 weight 700 保持。
Undo 恢复黄底和粗体，Redo 清背景保留粗体，Undo 再恢复建样；外层及相邻混合正文保持。
该入口不是完整清格式；本条前置没有非默认文字色，不能扩大为所有文字色清除已验证。
[建样清理](./dom/H00-bold-color-reset-fixture-cleanup.json)一次已知 Undo 即同时去掉粗体与黄底并恢复 weight 400；按实际历史停止，没有再盲目 Undo。不能由本次合并推导通用时间阈值。
errors/overflow 均为空，未独立重载；完整清格式的其他可达入口仍待研究。

## 13 REQ-S08-H04-010 左、中、右对齐及实际属性

状态：三个有变化的方向各有效双轮；仅覆盖普通 Alpha 的整词 Range。
居中采用 [R2](./dom/H04-alpha-center-align-R2.json)、[R3](./dom/H04-alpha-center-align-R3.json)，均从显式 text-align:left 到 center。
右对齐采用 [R1](./dom/H04-alpha-right-align-R1.json)、[R2](./dom/H04-alpha-right-align-R2.json)，均从显式 left 到 right。
左对齐采用 [R1](./dom/H04-alpha-left-from-center-R1.json)、[R2](./dom/H04-alpha-left-from-center-R2.json)，均从 center 到 left。
通过实际 TypographyOutlined 图标位置打开菜单，再用新 AX 中的“左对齐/居中对齐/右对齐”文本入口执行，不调用内部编辑命令。
实际 text-align 属性位于编辑区 n3191，行 n3192 的计算值随之变化；Alpha 外层的计算对齐仍为 start，不能只检查外层。
每轮明确页标题焦点后 Undo/Redo/Undo，属性、计算值与原前置精确一致；应用和历史样本 Range 均为 Alpha:0→5。
Alpha 外层、编辑区、行身份及相邻混合块/页标题保持；没有把视觉位置变化当作节点移动。
[居中 R1](./dom/H04-alpha-center-align-R1.json)包含旧菜单遮挡下从默认 start 设为显式 left 的前置调整，保留排除；只以 R2/R3 配对。
[坐标探查](./dom/H04-alignment-coordinate-probe.json)误命中粗体后已[撤销恢复](./dom/H00-alignment-coordinate-probe-recovery.json)；不计对齐通过。
[图标及位置探查](./dom/H04-toolbar-live-rect-probe.json)证明气泡可随选区改变位置，后续使用实际 DOM 控件矩形和新 AX。
[居中建样](./dom/H00-center-for-left-align-fixture.json)导出时原生工具超时；页面操作和观察器已结束，重连后只补导出，没有重放内容操作。
[建样清理](./dom/H00-center-for-left-align-fixture-cleanup.json)已恢复显式 left；未把默认 start 与显式 left 视为同一 DOM 属性前置。
有效轮次 errors/overflow 均为空，未独立重载；不推广标题、列表、引用、多块或混合对齐。

## 14 REQ-S08-H04-011 有序列表 Tab 增加结构缩进

状态：固定条件双轮已验证。证据：[R1](./dom/H04-ordered-child-tab-indent-R1.json)、[R2](./dom/H04-ordered-child-tab-indent-R2.json)。
[HTML 建样](./dom/H00-indent-list-html-fixture.json)以真实粘贴在 Gamma 后创建顶层 1.IndentParent 和 2.IndentChild，原混合正文保持。
IndentChild 末尾光标，真实 Tab 将其挂到 IndentParent 内，编号由 2. 变为 a.；不是单纯给文字添加空格或 margin。
本窗口渲染 x 从 300.5 到 325.5，宽度减少 25px；这是当前布局读数，不作为所有字体/视口的固定产品常量。
父项 n12348/ID123、子项 n12361/ID122 保持；DOM 的父子关系、标记及必要包装变化单列保存。
明确页标题焦点后 Undo 回到两个顶层项、Redo 嵌套、Undo 恢复；全文内容、结构和必要计算样式均核对，原混合邻居保持。
signatureSamples 对公开渲染块、文字、父子和必要样式生成确定性摘要以检查每步；身份不参与该摘要，须另查完整 state/operation 树。
该摘要只覆盖当前渲染 DOM，不冒充隐藏模型或整份文档存储校验。errors/overflow 为空，未独立重载。

## 15 REQ-S08-H04-012 有序子项 Shift+Tab 减少结构缩进

状态：固定条件双轮已验证。证据：[R1](./dom/H04-ordered-child-shift-tab-outdent-R1.json)、[R2](./dom/H04-ordered-child-shift-tab-outdent-R2.json)。
[嵌套前置](./dom/H00-nested-list-outdent-fixture.json)以已知原生 Redo 恢复上述父子；IndentChild 末尾真实 Shift+Tab。
子项由父内 a. 返回顶层第二项 2.，x 回到 300.5；父子外层身份保持，原混合内容不变。
Undo 恢复嵌套、Redo 顶层、Undo 再恢复嵌套，三步公开 DOM 摘要与对应前置/结果一致。
R1 内容历史已完成，导出阶段工具超时；重连确认 active=null 和完整五阶段样本后仅补导出，没有重复内容操作。
errors/overflow 均为空，未独立重载；前置继续用于后续折叠复制/剪切，不把尚未清理建样写成最终现场恢复完成。

## 16 REQ-S08-H04-013 混合粗体范围统一加粗

状态：同前置双轮及完整历史已验证。来源：指定飞书 Chrome 实测。
建样：[仅 Al 粗体](./dom/H00-half-bold-alpha-fixture.json)；证据：[R1](./dom/H04-mixed-alpha-bold-toggle-R1.json)、[R2](./dom/H04-mixed-alpha-bold-toggle-R2.json)。
页标题 Title，正文为 Alpha、编号 H9 Beta、Gamma、折叠 IndentParent、Quote 引用和末空 ordered。
先在 Alpha 精确选取 Al:0→2，真实 Cmd+B 建立 Al 字重 700、pha 字重 400 的混合前置；无颜色、下划线、链接或块类型改动。
每轮重新选择整个 Alpha，再真实 Cmd+B：结果为 Alpha 全部字重 700，而非将原粗体部分关闭、普通部分打开的逐字符反转。
键前公开 Range 的 anchor 为 Al 叶偏移 0，focus 为 pha 叶偏移 3，选中文字 Alpha；这是逻辑五字符范围，不误写成只选前三字符。

明确点击页标题后 Undo 恢复 Al 700 / pha 400，Redo 恢复全部 700，再 Undo 回到混合前置。
应用及 Redo 的 Range 为合并后 Alpha 叶 0→5；Undo/最终恢复为跨 Al/pha 两叶的同一全文范围。
外层 n3188/ID120、编辑区 n3191 和行 n3192 保持；Al span/文字 n17711/n17712 被保留并在加粗合并时承载 Alpha，普通 pha 叶被移除。
撤销重新分出 pha，R1 首次 n17825/n17826、最终 n18043/n18044，R2 首次 n18263/n18264、最终 n18481/n18482；不宣称全部文字叶复用或全部重建。
页标题、其余混合块的文字、类型、顺序及外层身份保持；errors/overflow 均为空，未独立重载。

本组 inlineSamples 保存完整相关 DOM、选区和实际计算样式；语义哈希只将相邻相同样式的文字段合并后比较，原 DOM 仍保留零宽占位及原始节点关系。
复刻验收需固定同一混合前置和全文选区，确认一次 Cmd+B 统一为粗体，并逐步比对上述三步历史、跨叶范围、邻块保护与身份边界。
此条不推广到多个段落、混合字体/颜色、反向范围或所有行内格式；项目实现仍需独立验收。

## 17 REQ-S08-H04-014 全部粗体范围关闭

状态：有效双轮为 R1/R3；中断的 R2 单列排除。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H04-all-bold-alpha-toggle-off-R1.json)、[R3](./dom/H04-all-bold-alpha-toggle-off-R3.json)；建样：[初始](./dom/H00-all-bold-alpha-fixture.json)、[通道恢复后](./dom/H00-all-bold-alpha-fixture-after-display-recovery.json)。
同一混合正文，Alpha 全部字重 700、16px，选中文字为 Alpha 单叶 0→5；真实 Cmd+B 后全部为普通字重 400。
每轮明确标题焦点后 Undo/Redo/Undo，依次恢复 700、400、700；相邻块、标题、范围及 Alpha 外层/编辑区/行保持。
R3 在研究窗口移到外接显示器后执行，视口宽由 1152 变为 1207；相关文字字体/大小和格式前置一致，不宣称屏幕位置或全局像素布局完全相同。
[清理](./dom/H00-all-bold-fixture-cleanup.json)通过一次已知建样 Undo 恢复普通 Alpha；errors/overflow 均为空，未独立重载。
验收固定完整粗体 Range，核对一次 Cmd+B 统一关闭粗体及三步历史，不推广混合范围逐字符反转。

[R2 中断](./dom/H04-all-bold-alpha-toggle-off-R2-interrupted.json)的关闭动作已得到 400，但首次标题坐标点击报 windowNotFoundAtPosition，未发送该轮历史键，不能与 R1 配对。
重新绑定、窗口 Raise、窗口菜单定位、AX 文本定位及重建控制会话均未恢复；临时将研究窗口从内建屏移至 24B36HE 后坐标送达恢复。
恢复时发现未监控间隔内新增的末空 text ID153，来源未定；[单独真实 Backspace 清理](./dom/H00-post-display-extra-empty-cleanup.json)仅移除该块，没有用未知历史掩盖差异。
之后重建前置并以 R3 补齐，不把工具错误归为产品拒绝，也不把后来新增空段归因于格式命令。

## 18 可达清格式入口的当前边界

[更多菜单探查](./dom/H04-more-format-entry-probe.json)在 Alpha 全文 Range 下真实打开气泡 ToolbarMoreOutlined：可见复制选区链接、翻译、飞书内/网页搜索、转换子文档、保存模板、词典和飞书项目入口。
该菜单未见完整清格式项；打开后读取、关闭后计算样式保持普通字重 400。
只报告本次入口未见，不据此声称飞书全局不支持清格式；颜色“恢复默认”保留粗体的既有结果也不能代替完整清格式。
没有调用内部清格式命令、尝试猜测的未见快捷键或修改项目业务代码。

[帮助快捷键清单探查](./dom/H04-clear-format-shortcut-entry-probe.json)通过可见帮助图标→快捷键，保存完整公开 `.help-siderbar-content` DOM。
清单包含粗体、斜体、下划线、删除线、颜色背景、链接及类型快捷键，没有清除格式项；不猜测未列出的按键组合。
关闭浮层后正文与标题语义签名保持原基线，未执行格式修改或未知 Undo；这仍只证明两个已检查入口未见，不等同全局不支持。
操作期间研究标签被切走两次，第一次在此探查 begin 前、第二次在读取浮层前均因控制台不可达停止，未向其他页面发送内容；切回指定 URL 后继续读取与导出。

## 19 REQ-S08-H04-015 粗体正文转 H1 后直接续写

状态：连续操作有效双轮为 R2/R3；停留后的 R1 作为不同历史节奏单列。
证据：[R2](./dom/H04-bold-text-to-H1-direct-continue-R2.json)、[R3](./dom/H04-bold-text-to-H1-direct-continue-R3.json)；[粗体建样](./dom/H00-bold-alpha-conversion-fixture.json)、[最终清理](./dom/H00-bold-conversion-fixture-cleanup.json)。
前置为原混合正文，Alpha text 全部字重 700、16px，精确光标 Alpha:5；其他格式默认，父项保持折叠。
真实 Cmd+Option+1 转为 heading1，原生 AX 读取确认正文根焦点及新增 Alpha 目录链接；不再定位文本或打开控制台，直接真实输入 Z。
收到可信 Digit1、meta=true、alt=true（本系统 key 为 ¡），再收到可信 Z/insertText；键前 DOM 证明 Z 在 H1 Alpha:5 输入。
最终为 heading1 AlphaZ，字重 700、26px，光标偏移 6；新字符继承粗体和 H1 字号，颜色、背景、斜体及装饰仍为原计算值。
两轮转换键到输入键 keydown 间隔分别为 0.466s/0.450s，包含原生 AX 读取开销；不将其写成工具无间隔或内部时间阈值。

两轮一次 Undo 同时撤销转换与 Z，回到 16px 粗体 text Alpha、光标 5；一次 Redo 同时恢复 H1 AlphaZ/光标 6，再 Undo 恢复粗体正文。
R2 的首个 Undo 样本 phase 名为 undo-typing，实际已合并撤回两项；断言守卫发现差异后停止，没有继续发送误设的第二个 Undo，另以 observed-combined-undo 明确结果。
Alpha 外层 n3188/ID120 保持，data-block-type 在 text/heading1 间变化；Beta ID102、Gamma ID101、折叠父项 ID123、引用 ID148/149、末空 ordered ID109 保持内容与归属。
完整 DOM、必要 mutation、输入与历史前后选区均留证；errors/overflow 为空，未独立重载。
复刻验收须核对继承的实际计算样式、新字符位置、相邻保护及本节连续条件下的一步历史；不能只看工具栏粗体高亮。
只覆盖粗体 text→H1 和本系统入口，不推广所有转换、H9、其他行内样式或固定历史合并常量。

## 20 OBS-S08-H04-016 停留后的转换与输入分成两步历史

[直接续写 R1](./dom/H04-bold-text-to-H1-direct-continue-R1.json)在转换后因 AX 表达与预期 heading role 不同而停留；实际 AX 为目录 link Alpha，期间只读 AX，没有重新定位光标或打开控制台。
该轮转换键到 Z 输入键 keydown 相距 33.842s，随后同样得到 26px 粗体 H1 AlphaZ/光标 6。
一次 Undo 只移除 Z、仍为 H1 Alpha；第二次 Undo 才恢复粗体正文 Alpha，依次两步 Redo 再现，最终两步 Undo 复原。
本轮不是连续节奏 R2 的配对，尚未对停留条件做第二轮；不同节奏的实际分组分别保留，不宣称时间差是唯一原因或推断精确阈值。
[先前转换后读计算样式的探查](./dom/H04-bold-conversion-reading-focus-probe.json)因控制台取样改变焦点，在续写前已撤销恢复，单列排除。
内部继承、存储和事务实现机制仍未知；后续 S09 可按固定节奏另行细化。

## 21 REQ-S08-H08-002 无效链接文本的 Enter 门禁与取消

状态：同入口双轮已验证。证据：[R1](./dom/H08-invalid-link-text-enter-R1.json)、[R2](./dom/H08-invalid-link-text-enter-R2.json)。
原混合正文、Alpha 普通格式，选中 Alpha 全文后 Cmd+K；原生逐字输入 not a url，实际 input.value 与原生 AX 均为该字符串，确认按钮 disabled。
重新通过真实输入框点击建立焦点，再按 Enter；链接框仍显示同值且确认仍禁用，正文语义哈希保持，无 A 链接应用。
再在该输入框真实按 Escape，链接面板关闭，Alpha 无 A 节点，标题和全部混合块的文字、类型、顺序及外层身份保持。
没有为无变化命令盲目撤销已有正文历史，也没有用未建立的哨兵证明“不占历史”；只验证本条不提交和取消恢复。
linkDelivery 保留可信输入与 Enter/Escape，正文前后、字段实际值和禁用状态有独立样本；errors/overflow 为空，未独立重载。
复刻验收固定该无效值和输入入口，核对按键真实送达、禁用确认、不误应用或改动正文及关闭后的可继续编辑；不泛化全部无效 URL。

## 22 REQ-S08-H08-003 ASCII javascript 协议门禁

状态：原生 macOS AX 输入框入口双轮已验证；不是逐字键盘入口。证据：[R1](./dom/H08-AX-javascript-scheme-enter-R1.json)、[R2](./dom/H08-AX-javascript-scheme-enter-R2.json)。
同样选中 Alpha 后 Cmd+K，通过 CUA 原生 AX setValue 设置实际可写输入框；未使用浏览器 JS 改写 DOM 或内部编辑命令。
先输入 HTTPS 对照值 https://example.com，稳定样本确认实际值精确、确认按钮启用；再设为精确 ASCII javascript:1，确认按钮禁用。
原生 AX 设值产生可信 input 事件，稳定 AX/DOM 字段值和按钮状态另行核对；input 事件后的微任务样本仍可能是旧按钮状态，不能替代稳定读数。
真实点击该输入框并按 Enter，面板保持 javascript:1/确认禁用，正文语义哈希不变；再按 Escape 关闭，原标题和混合正文保持，未应用链接。
两轮没有导航或执行该协议，没有将 HTTPS 对照值提交到正文；errors/overflow 为空，链接日志未达 300 条限额，未独立重载。
验收必须区分精确 ASCII 协议、实际输入通道、校验状态与正文无副作用；只覆盖该值，不宣称所有 javascript/data/mailto 变体、粘贴 HTML 或项目生产 sanitizer 已安全。

[输入方式探查](./dom/H08-protocol-entry-methods-probe.json)中，原生冒号按键实际形成全角 javascript：1，不能计 ASCII 协议拒绝。
在已有值上真实原生粘贴 javascript:1 收到 INPUT paste，但 input.value 仍保持全角原值；不把送达事件当作写入成功，也不泛化为所有输入框粘贴失效。
其后原生 AX 设值能改变实际值并使 HTTPS 对照启用、javascript:1 禁用；探查已 Escape 恢复，正式双轮固定为上述原生 AX 入口。
