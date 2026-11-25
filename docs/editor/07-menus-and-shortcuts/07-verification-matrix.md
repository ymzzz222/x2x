# S07 运行矩阵

当前按约定代表范围完成 G01–G09（9/9）；最终清理及独立刷新证据见阶段记录。
62组候选双轮已逐步对照；其中61组为功能/历史或明确拒绝观察，一组早期长按通道限制不计功能通过。
另保留原会话 Slash Escape R3/R4。计数不代表全组合或生产验收。
H1/H9 共同行为为实测端点，H2–H8 只按既定授权推断。

## 子项和有效窗口

| 子项 | 前置或范围 | 状态 | 证据 |
| --- | --- | --- | --- |
| G01-01 | 单光标、空块块柄/加号 | 已双轮 | 气泡块柄互斥 [R5](./dom/G04-D-bubble-handle-mutual-R5.json)/[R6](./dom/G04-D-bubble-handle-mutual-R6.json)；空块加号历史 [R1](./dom/G01-G03-D-plus-open-history-R1.json)/[R2](./dom/G01-G03-D-plus-open-history-R2.json) |
| G01-02 | 选词气泡控件与当前值 | 已双轮 | 粗体 [R1](./dom/G05-D-browser-bold-R1.json)/[R2](./dom/G05-D-browser-bold-R2.json)；斜体 [R1](./dom/G05-D-browser-italic-R1.json)/[R2](./dom/G05-D-browser-italic-R2.json)；下划线 [R1](./dom/G05-D-browser-underline-R1.json)/[R2](./dom/G05-D-browser-underline-R2.json) |
| G01-03 | 斜杠筛选、类型菜单 | 已双轮 | 斜杠筛选 [R1](./dom/G01-G07-D-slash-filter-R1.json)/[R2](./dom/G01-G07-D-slash-filter-R2.json)；类型悬停链 [R1](./dom/G01-G03-G04-D-hover-chain-R1.json)/[R2](./dom/G01-G03-G04-D-hover-chain-R2.json) |
| G01-04 | 单格式、混合及禁用 | 已双轮 | 混合粗体 [R1](./dom/G01-D-mixed-bold-R1.json)/[R2](./dom/G01-D-mixed-bold-R2.json)；当前H1 [R1](./dom/G01-D-current-H1-R1.json)/[R2](./dom/G01-D-current-H1-R2.json)；当前H9 [R1](./dom/G01-D-current-H9-R1.json)/[R2](./dom/G01-D-current-H9-R2.json)；当前有序 [R1](./dom/G01-D-current-ordered-R1.json)/[R2](./dom/G01-D-current-ordered-R2.json)；当前无序 [R1](./dom/G01-D-current-bullet-R1.json)/[R2](./dom/G01-D-current-bullet-R2.json)；禁用缩进 [R1](./dom/G01-G09-D-disabled-indent-R1.json)/[R2](./dom/G01-G09-D-disabled-indent-R2.json) |
| G01-05 | 页头与正文工具栏区别 | 已双轮 | 页头更多 [R1](./dom/G01-G09-D-header-menu-R1.json)/[R2](./dom/G01-G09-D-header-menu-R2.json)；空块加号历史 [R1](./dom/G01-G03-D-plus-open-history-R1.json)/[R2](./dom/G01-G03-D-plus-open-history-R2.json) |
| G02-01 | 光标B、悬停A作用域 | 已双轮 | 光标B悬停A执行 [R1](./dom/G02-D-hover-A-apply-H1-R1.json)/[R2](./dom/G02-D-hover-A-apply-H1-R2.json) |
| G02-02 | 局部、反向、连续多块 | 已双轮 | 混合粗体 [R1](./dom/G01-D-mixed-bold-R1.json)/[R2](./dom/G01-D-mixed-bold-R2.json)；反向选区 [R1](./dom/G02-D-reverse-selection-R1.json)/[R2](./dom/G02-D-reverse-selection-R2.json)；连续多块 [R1](./dom/G02-D-multi-selection-R1.json)/[R2](./dom/G02-D-multi-selection-R2.json) |
| G02-03 | 跨父子引用选区 | 已双轮 | 跨引用 [R1](./dom/G02-D-cross-quote-selection-R1.json)/[R2](./dom/G02-D-cross-quote-selection-R2.json) |
| G02-04 | 失焦、页面外、阅读模式 | 已双轮 | 只读 [R1](./dom/G02-G06-D-reading-mode-R1.json)/[R2](./dom/G02-G06-D-reading-mode-R2.json)；浏览器焦点 [R1](./dom/G03-G06-native-browser-focus-R1.json)/[R2](./dom/G03-G06-native-browser-focus-R2.json)；窗口切换 [R1](./dom/G03-G06-native-window-switch-R1.json)/[R2](./dom/G03-G06-native-window-switch-R2.json) |
| G03-01 | Slash Escape字符与历史 | 已双轮 | [原会话 R3/R4](./dom/G03-slash-escape.json)及[真实历史](./dom/G03-slash-escape-history.json)；斜杠取消删除续写 [R1](./dom/G07-D-slash-delete-continue-R1.json)/[R2](./dom/G07-D-slash-delete-continue-R2.json) |
| G03-02 | 改选区、切块、重复开启 | 已双轮 | 重复开启外点 [R1](./dom/G03-D-switch-reopen-outside-R1.json)/[R2](./dom/G03-D-switch-reopen-outside-R2.json) |
| G03-03 | 正文外、页外、切窗口 | 已双轮 | 重复开启外点 [R1](./dom/G03-D-switch-reopen-outside-R1.json)/[R2](./dom/G03-D-switch-reopen-outside-R2.json)；浏览器焦点 [R1](./dom/G03-G06-native-browser-focus-R1.json)/[R2](./dom/G03-G06-native-browser-focus-R2.json)；窗口切换 [R1](./dom/G03-G06-native-window-switch-R1.json)/[R2](./dom/G03-G06-native-window-switch-R2.json) |
| G03-04 | 切文档后旧选区失效 | 已双轮，旧根与选区失效 | [R3](./dom/G03-F-document-detached-R3.json)、[R4](./dom/G03-F-document-detached-R4.json)；[合同](./07-verified-contracts.md#req-s07-g03-003-切文档使旧根与选区失效) |
| G04-01 | 父子菜单移动返回 | 已双轮 | 类型悬停链 [R1](./dom/G01-G03-G04-D-hover-chain-R1.json)/[R2](./dom/G01-G03-G04-D-hover-chain-R2.json) |
| G04-02 | 方向键、Enter、Escape | 已双轮 | 方向键确认 [R1](./dom/G04-G09-D-slash-arrow-enter-R1.json)/[R2](./dom/G04-G09-D-slash-arrow-enter-R2.json)；页头更多 [R1](./dom/G01-G09-D-header-menu-R1.json)/[R2](./dom/G01-G09-D-header-menu-R2.json) |
| G04-03 | 滚动、视觉缩放、边缘 | 已双轮 | 滚动缩放 [R3](./dom/G04-G08-D-scroll-scale-R3.json)/[R4](./dom/G04-G08-D-scroll-scale-R4.json)；小视口 [R3](./dom/G04-G08-D-small-viewport-R3.json)/[R4](./dom/G04-G08-D-small-viewport-R4.json) |
| G04-04 | 气泡与块柄互斥 | 已双轮 | 气泡块柄互斥 [R5](./dom/G04-D-bubble-handle-mutual-R5.json)/[R6](./dom/G04-D-bubble-handle-mutual-R6.json) |
| G05-01 | 正文、H1/H9转换 | 已双轮 | H1 [R2](./dom/G05-D-H1-end-R2.json)/[R3](./dom/G05-D-H1-end-R3.json)；H9 [R2](./dom/G05-D-H9-end-R2.json)/[R3](./dom/G05-D-H9-end-R3.json)；H1回正文 [R3](./dom/G05-D-H1-to-text-separated-R3.json)/[R4](./dom/G05-D-H1-to-text-separated-R4.json) |
| G05-02 | 有序、无序、引用 | 已双轮 | 有序 [R2](./dom/G05-D-ordered-end-R2.json)/[R3](./dom/G05-D-ordered-end-R3.json)；无序 [R2](./dom/G05-D-bullet-end-R2.json)/[R3](./dom/G05-D-bullet-end-R3.json)；引用输入规则 [R1](./dom/G05-D-quote-space-R1.json)/[R2](./dom/G05-D-quote-space-R2.json) |
| G05-03 | 行内格式与续写 | 已双轮 | 粗体 [R1](./dom/G05-D-browser-bold-R1.json)/[R2](./dom/G05-D-browser-bold-R2.json)；斜体 [R1](./dom/G05-D-browser-italic-R1.json)/[R2](./dom/G05-D-browser-italic-R2.json)；下划线 [R1](./dom/G05-D-browser-underline-R1.json)/[R2](./dom/G05-D-browser-underline-R2.json)；光标粗体续写 [R1](./dom/G05-D-caret-bold-input-R1.json)/[R2](./dom/G05-D-caret-bold-input-R2.json) |
| G05-04 | 缩进、全选、剪贴板 | 已双轮 | 列表缩进 [R1](./dom/G05-D-list-tab-outdent-R1.json)/[R2](./dom/G05-D-list-tab-outdent-R2.json)；全选保存 [R1](./dom/G05-D-select-all-save-R1.json)/[R2](./dom/G05-D-select-all-save-R2.json)；复制剪切粘贴 [R1](./dom/G05-D-clipboard-roundtrip-R1.json)/[R2](./dom/G05-D-clipboard-roundtrip-R2.json) |
| G05-05 | 保存、查找、换行与历史 | 按键/历史已双轮；[两个保存版本](./07-verified-contracts.md#req-s07-g05-004-两个保存版本的独立读取)已独立读取 | 全选保存 [R1](./dom/G05-D-select-all-save-R1.json)/[R2](./dom/G05-D-select-all-save-R2.json)；查找输入焦点 [R1](./dom/G06-D-platform-find-input-focus-R1.json)/[R2](./dom/G06-D-platform-find-input-focus-R2.json)；换段 [R1](./dom/G05-D-Enter-R1.json)/[R2](./dom/G05-D-Enter-R2.json)；软换行 [R1](./dom/G05-D-softbreak-R1.json)/[R2](./dom/G05-D-softbreak-R2.json) |
| G06-01 | 正文/气泡格式、删除、历史 | 已双轮 | 粗体 [R1](./dom/G05-D-browser-bold-R1.json)/[R2](./dom/G05-D-browser-bold-R2.json)；气泡删除历史 [R1](./dom/G06-D-bubble-delete-history-R1.json)/[R2](./dom/G06-D-bubble-delete-history-R2.json) |
| G06-02 | 链接输入全选、粘贴、确认取消 | 已双轮 | 链接输入焦点 [R1](./dom/G06-D-platform-link-input-focus-R1.json)/[R2](./dom/G06-D-platform-link-input-focus-R2.json)；链接应用历史 [R1](./dom/G06-D-platform-link-commit-history-R1.json)/[R2](./dom/G06-D-platform-link-commit-history-R2.json)；链接实际粘贴 [R1](./dom/G06-D-link-paste-history-R1.json)/[R2](./dom/G06-D-link-paste-history-R2.json) |
| G06-03 | 查找输入快捷键与历史 | 已双轮 | 查找输入焦点 [R1](./dom/G06-D-platform-find-input-focus-R1.json)/[R2](./dom/G06-D-platform-find-input-focus-R2.json) |
| G06-04 | 批注草稿、页外焦点 | 已双轮 | 批注草稿 [R1](./dom/G06-D-comment-focus-history-R1.json)/[R2](./dom/G06-D-comment-focus-history-R2.json)；正文外查找 [R1](./dom/G06-D-outside-focus-find-R1.json)/[R2](./dom/G06-D-outside-focus-find-R2.json) |
| G06-05 | 浏览器实际接收者 | 已双轮 | 浏览器焦点 [R1](./dom/G03-G06-native-browser-focus-R1.json)/[R2](./dom/G03-G06-native-browser-focus-R2.json) |
| G07-01 | 真实IME中的格式键与Slash | 已双轮 | 真实IME [R1](./dom/G07-native-ime-R1.json)/[R2](./dom/G07-native-ime-R2.json)；原生IME历史 [R1](./dom/G07-native-ime-history-R1.json)/[R2](./dom/G07-native-ime-history-R2.json)；组合斜杠 [R1](./dom/G07-native-ime-slash-R1.json)/[R2](./dom/G07-native-ime-slash-R2.json) |
| G07-02 | 修饰键、连续/按住重复 | 已双轮，系统虚拟键盘真实repeat | Ctrl修饰键 [R1](./dom/G07-D-control-b-R1.json)/[R2](./dom/G07-D-control-b-R2.json)；系统虚拟键盘 [R1](./dom/G07-F-keyboard-viewer-held-R1.json)/[R2](./dom/G07-F-keyboard-viewer-held-R2.json)，每轮17次可信repeat=true；早期未重复窗口保留但不计通过 |
| G07-03 | 选词输入替换与历史 | 已双轮 | 选词替换 [R1](./dom/G07-D-selected-replace-R1.json)/[R2](./dom/G07-D-selected-replace-R2.json) |
| G07-04 | Slash取消、删符、续写 | 已双轮 | 斜杠取消删除续写 [R1](./dom/G07-D-slash-delete-continue-R1.json)/[R2](./dom/G07-D-slash-delete-continue-R2.json) |
| G08-01 | 文本图标、当前值与tooltip | 已双轮 | 当前H1 [R1](./dom/G01-D-current-H1-R1.json)/[R2](./dom/G01-D-current-H1-R2.json)；当前H9 [R1](./dom/G01-D-current-H9-R1.json)/[R2](./dom/G01-D-current-H9-R2.json)；当前有序 [R1](./dom/G01-D-current-ordered-R1.json)/[R2](./dom/G01-D-current-ordered-R2.json)；当前无序 [R1](./dom/G01-D-current-bullet-R1.json)/[R2](./dom/G01-D-current-bullet-R2.json)；tooltip热区 [R1](./dom/G08-D-tooltip-hitbox-R1.json)/[R2](./dom/G08-D-tooltip-hitbox-R2.json) |
| G08-02 | 焦点样式、热区、起止计时 | 已双轮，限功能基线n=2 | tooltip热区 [R1](./dom/G08-D-tooltip-hitbox-R1.json)/[R2](./dom/G08-D-tooltip-hitbox-R2.json)；帧计时 [R1](./dom/G08-D-frame-latency-R1.json)/[R2](./dom/G08-D-frame-latency-R2.json)；链接Tab禁用 [R1](./dom/G09-D-link-tab-disabled-R1.json)/[R2](./dom/G09-D-link-tab-disabled-R2.json) |
| G08-03 | 长名称、字体、边缘裁切 | 已双轮，限内置长名称和loaded字体 | 长菜单滚动 [R3](./dom/G08-D-slash-long-scroll-R3.json)/[R4](./dom/G08-D-slash-long-scroll-R4.json)；小视口 [R3](./dom/G04-G08-D-small-viewport-R3.json)/[R4](./dom/G04-G08-D-small-viewport-R4.json) |
| G08-04 | 滚动缩放与恢复 | 已双轮 | 滚动缩放 [R3](./dom/G04-G08-D-scroll-scale-R3.json)/[R4](./dom/G04-G08-D-scroll-scale-R4.json) |
| G09-01 | 入口键盘可达与Tab | 已双轮，按入口和焦点前置分开 | [气泡 R3](./dom/G09-F-bubble-tab-R3.json)/[R4](./dom/G09-F-bubble-tab-R4.json)；[块类型 R1](./dom/G09-F-block-focus-tab-R1.json)/[R2](./dom/G09-F-block-focus-tab-R2.json)；[加号 R1](./dom/G09-F-plus-root-tab-R1.json)/[R2](./dom/G09-F-plus-root-tab-R2.json)；方向键、页头和链接见既有合同 |
| G09-02 | Escape焦点与续写 | 已双轮，验证到拒绝续写 | 链接Escape后续写拒绝 [R1](./dom/G09-D-link-escape-continue-R1.json)/[R2](./dom/G09-D-link-escape-continue-R2.json)；查找Escape后续写拒绝 [R1](./dom/G09-D-find-escape-continue-R1.json)/[R2](./dom/G09-D-find-escape-continue-R2.json) |
| G09-03 | 禁用动作、语义和通知 | 已双轮观察，未做屏幕阅读器语音验收 | 禁用缩进 [R1](./dom/G01-G09-D-disabled-indent-R1.json)/[R2](./dom/G01-G09-D-disabled-indent-R2.json)；链接Tab禁用 [R1](./dom/G09-D-link-tab-disabled-R1.json)/[R2](./dom/G09-D-link-tab-disabled-R2.json)；页头更多 [R1](./dom/G01-G09-D-header-menu-R1.json)/[R2](./dom/G01-G09-D-header-menu-R2.json) |
| G09-04 | 项目改进与实测分离 | 已整理 | [项目改进要求](./07-verified-contracts.md#req-s07-g09-001-已观察的可访问性差异)，未修改业务实现 |

## 排除窗口和解释边界

- C-R1/R2 捕获非请求的 KeyU/中文“画”，来源变化，排除；相关恢复另存。
- C-R3 被早期 D 探查误覆盖，已撤回；原路径仅为撤回标记，C-R4 只算单轮。
- G02 打开专项 R2 实际焦点为 IFRAME，不与根焦点 R1 配对；采用 apply-H1 R1/R2 同时覆盖打开与执行。
- G05 快速 H1→text 旧窗口历史合并、来源不等；采用 separated-R3/R4。
- 原生 G06 旧窗口存在按键未送达及误插入正文，已保留并恢复；有效输入框用例采用 platform 及本文列出的新窗口。
- 互斥 R1/R2 目标块柄不存在；R3/R4 错误预期 Escape 折叠选区，均保留。R5/R6 才是完整有效双轮。
- 长菜单滚动 R1/R2 使用错误后代选择器，第二轮来源尾块已有 `/`；R3/R4 重建空来源后双轮。
- scroll-scale、small-viewport 旧 R2 的尾块残留 `/`，采用来源干净的 R3/R4，不偷换前置。
- 链接/查找 Escape 后续写窗口的超时是“可信 KeyA 已到但正文没变”的预期失败，不是传输缺失；可观察的焦点缺陷与项目目标分开。
- 原生 IME、浏览器焦点、切窗口的真实窗口位于导出文件 inspection；外层 observe 只是导出封套。
- 早期原生长按两轮只有 repeat=false，八秒CUA和System Events探查同样未重复；后续系统虚拟键盘已取得真实repeat双轮，不把旧通道限制写成飞书不支持。
- DOM refs 只在各自文档/监控世界内比较；重载、Apple-world/main-world 和不同浏览器之间不比较对象身份。
- mutation 新值为观察交付时读取值；不推导飞书内部事务、存储或同步协议。
- [证据审计](./07-evidence-audit.json)逐组列出文件、阶段签名和失败；结构签名相同不替代格式、焦点、选区及 UI 语义核对。
- [先前 DevTools 错误摘录](./dom/G00-native-preexisting-console-errors.txt)包含 unload 策略、closest 类型和 caretPositionFromPoint 错误，时间归因未知；帧计时窗口 runtimeErrors 为空不等于全程无错误。
- 19:45 前台导航被系统锁屏拒绝；未执行解锁或绕过，仍可整理本地证据。现有操作授权不需再次确认。

补充审计：`richBodyStageEqual` 同时比较完整逻辑父子层级、行内文本与已捕获格式；62组均一致。新窗口无journal时比较实际前后快照或featureStates，不比较空序列。此值不替代节点身份、焦点和菜单语义。

2026-10-20 续测：真实输入前先用 AX Raise 将研究窗口置前，解决原生输入未送达；旧 JXA 前台保护和隔离投递失败均保留。
重连触发新的 Chrome 完全控制会话提示后已取消，未扩大权限；后续只用现有原生/JXA通道。
G03-F R1 来源不是 Alpha 全文选区，排除；有效切文档使用 F-R3/R4。G09-F bubble R1 没有发送按键，使用 R3/R4。
保存 R1 原生 AX 观察报 -3811，但可信 Cmd+B 与 DOM 已证实送达，后续以实际格式及独立刷新读取判定。
后续通过原生拖动显露入口补齐块类型/加号，系统虚拟键盘补齐真实repeat；没有要求sir手动操作或以接受限制替代实测。
原始plus-tab R1/R5为BODY接收首键，R4为隐藏TEXTAREA；均不与根焦点的有效R2/R3混合。特征窗口保留原始来源SHA256及捕获标签。
