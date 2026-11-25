# S07 已验证的局部合同

本文件只归纳已核对的同条件双轮；不表示 G01–G09 整项完成。
阶段边界、排除窗口与待测清单分别见[阶段记录](./07-menus-and-shortcuts.md)和[矩阵](./07-verification-matrix.md)。

## 输入与证据口径

- 原会话与 B/C/D 会话的节点引用分别解释，不作跨会话身份比较。
- 原生后台键盘使用 CoreGraphics 向 Chrome 进程定向投递，不移动系统指针。
- 文件名前缀 D 不决定输入通道：早期类型快捷键文件实际为 JXA/CoreGraphics（b 引用）；后期菜单/输入框为目标标签 CDP（d 引用）。具体以 driver/session 字段为准。
- 后期目标标签输入复用现有 Chrome 调试会话；原生 IME/浏览器焦点/切窗口另用 CUA。
- D 的浏览器焦点仿真与操作系统前台不同；不能以此证明系统级快捷键冲突或真实输入法行为。
- `Input.insertText` 明确属于文本插入，不算真实输入法组合或剪贴板按键。
- D 记录真实接收事件的 `trusted`，正文树、菜单、选区、焦点和 mutation 对应同一窗口。
- 附加 `blocks.text` 在早期版本仅取第一条 ace-line；软换行必须读取完整正文树中的全部行。
- 文件的 `failure:null` 只表示驱动执行完成，功能结论仍以逐步语义核对为准。

## 共用验收与来源边界

本文件每条合同沿用启动 URL、已登录账号和固定四块来源；例外在条目中明确写出。
每个 evidence 的 before/journal/events/states/after 提供操作编号、时间、正文树、必要 mutation、焦点选区及对应历史；
原生导出封套使用 inspection 中的同名字段。原生读 DOM 与主世界节点引用不互换。
块顺序、层级、未受影响范围和格式须一并断言；未知内部存储机制不作要求。
纯 UI 状态以真实关闭/恢复判断；编辑修改以实际撤销重做和最后来源恢复判断。
各合同只作为飞书观察及复刻行为输入，不等于项目当前实现满足；项目未改代码、未运行构建或生产工作流。
最终保存读取与环境清理在阶段记录单列，不能用某一个代表保存推广到每个入口/格式/权限组合。
同条件双轮的标准是同一入口、目标内容、权限及实际焦点选区；动画瞬时坐标、重做新建节点ID可不同。
没有冻结跨平台视觉容差、长文档性能阈值、全功能快捷键表或辅助技术兼容性。

## REQ-S07-G01-001 选词气泡与当前格式

来源：飞书浏览器实测。用途：让行内格式入口反映当前选区。
固定前置：四个 text 块依次为 Alpha、Beta、Gamma、空尾块；页标题为空。
先点击 Beta，再双击 Alpha；实际选区为 Alpha 文本的 0→5。

[粗体 R1](./dom/G05-D-browser-bold-R1.json) / [R2](./dom/G05-D-browser-bold-R2.json)、
[斜体 R1](./dom/G05-D-browser-italic-R1.json) / [R2](./dom/G05-D-browser-italic-R2.json)、
[下划线 R1](./dom/G05-D-browser-underline-R1.json) / [R2](./dom/G05-D-browser-underline-R2.json)
均保留相应工具栏和选区。
气泡为 `.docx-menu-wrapper.text-toolbar`，文案含“问问豆包”；
类型、对齐、粗体、删除线、斜体、下划线、链接、代码、颜色、更多、分享及评论以图标呈现。

对 Alpha 应用 Cmd+B / Cmd+I / Cmd+U 后，相应控件含 `menu-item-actived`。
正文分别出现 font-weight:bold、font-style:italic、underline 样式；
仍为原四个 text 块，选区保持 Alpha 0→5。
实际 Cmd+Z、Cmd+Shift+Z、Cmd+Z 分别去掉、恢复、再去掉该格式。
验收需同时核对正文样式、选区、块身份与控件状态，不能只检查按钮亮起。
本条不推广到混合格式、空光标、其他系统或项目实现。

## REQ-S07-G02-001 悬停来源优先于另一块的光标

来源与用途：飞书实测；块菜单必须作用于被悬停的来源块。
打开专项 R2 的实际焦点为 IFRAME，不作为同条件双轮；以下执行双轮同时覆盖有效打开。
[执行 R1](./dom/G02-D-hover-A-apply-H1-R1.json) / [R2](./dom/G02-D-hover-A-apply-H1-R2.json)。

固定前置为上述四块，Beta 文本偏移 2 的折叠光标。
真实移动至 Alpha，再点击其类型图标，出现 toolbox 块菜单。
仅悬停和打开时，正文光标仍报告 Beta 偏移 2；菜单锚点位于 Alpha 一侧。
点击菜单中的 H1 图标后，只有 Alpha/ID 5 变为 heading1；Beta、Gamma、空块不转换。
两轮的撤销、重做、再次撤销均只在 Alpha 的 text/heading1 之间往返。
原 Alpha 外层对象 d4 保留；不能把菜单打开时的 DOM 光标直接当作命令目标。

验收应重建“光标 B / 悬停 A”的不同来源，并检查未悬停块保持。
本条不覆盖跨嵌套、多块、只读或权限降级。

## REQ-S07-G04-001 类型菜单的悬停往返

来源：飞书实测；目标是父子菜单可连续操作且不改变文字选区。
[双轮 R1](./dom/G01-G03-G04-D-hover-chain-R1.json) / [R2](./dom/G01-G03-G04-D-hover-chain-R2.json)。

1. 双击 Alpha 得到 0→5 选区和气泡。
2. 移至 TextOutlined 控件，打开类型子菜单。
3. 移至“其他标题”，打开四级至九级标题的第二级子菜单。
4. 移至九级标题行，三个菜单层同时保留，Alpha 选区不变。
5. 移回“其他标题”行后，九级所在子菜单关闭，保留气泡和类型菜单。
6. 移回气泡的类型控件后，类型子菜单关闭，仅保留气泡。
7. Escape 关闭气泡，Alpha 文字和选区保持。
8. ArrowRight 折叠选区；点击 Beta、再悬停 Alpha，可重新显示块柄。

正文当前项在类型子菜单显示“正文”、`menu-item-actived` 与 DoneOutlined。
子菜单还有 H1/H2/H3、其他标题、有序/无序、任务、代码块、引用、高亮块、同步块。
此处只观察 H2–H8 的菜单文案，不能据此增加它们的转换实测数。
两轮菜单语义与层级一致，动画阶段的非稳定矩形不当最终位置。
验收只约束上述实际移动路径，不推导未测的对角轨迹容差或性能阈值。

## REQ-S07-G05-001 类型快捷键与历史

来源：飞书 macOS 原生后台按键；不是从提示文案或源码注册推断。
固定前置：上述四个纯 text 块，Alpha 末端偏移 5，编辑根持有 DOM 焦点。

| 目标 | 真实按键 | 有效两轮 |
| --- | --- | --- |
| H1 | Cmd+Option+1 | [R2](./dom/G05-D-H1-end-R2.json)、[R3](./dom/G05-D-H1-end-R3.json) |
| H9 | Cmd+Option+9 | [R2](./dom/G05-D-H9-end-R2.json)、[R3](./dom/G05-D-H9-end-R3.json) |
| 有序 | Cmd+Shift+7 | [R2](./dom/G05-D-ordered-end-R2.json)、[R3](./dom/G05-D-ordered-end-R3.json) |
| 无序 | Cmd+Shift+8 | [R2](./dom/G05-D-bullet-end-R2.json)、[R3](./dom/G05-D-bullet-end-R3.json) |

目标类型依次为 heading1、heading9、ordered、bullet。
只改变 Alpha 的类型，文字 Alpha、原外层 b4/ID 5、其余三块及块顺序保持。
内部编辑壳和文字对象重建，光标仍为新文字节点偏移 5；编辑根 b39 保留焦点。
每轮实际 Cmd+Z → Cmd+Shift+Z → Cmd+Z 得到 text → 目标 → text。
不能因文字相同而宣称内部文字节点复用；具体引用见每个 before/after。

H1 回正文用 Cmd+Option+0：
[分隔历史 R3](./dom/G05-D-H1-to-text-separated-R3.json) / [R4](./dom/G05-D-H1-to-text-separated-R4.json)。
先建 H1，再转换 text；撤销回 H1，重做 text，再撤销 H1，最后撤销建样回纯 text。
快速连续 H1→text 的早期 R1/R2 撤销曾合并两步，且来源文字不等价；
它们只作历史分组探查，不代替分隔历史双轮，不判为 Cmd+Option+0 无效。
本合同不覆盖所有类型组合、系统级全局冲突或独立保存重载。

## REQ-S07-G05-002 普通换行与软换行

来源：飞书浏览器可信输入。固定位置实际为 Alpha 偏移 3，不能按计划名写成末端。
[Enter R1](./dom/G05-D-Enter-R1.json) / [R2](./dom/G05-D-Enter-R2.json)：
Alpha 分为原块 `Alp` 和新增 text 块 `ha`，其余三块顺序保持；光标在新块开头。
撤销合回 Alpha，重做再次拆分，最后撤销恢复四块。
重做新建块的 ID/对象可以变化，不要求与首次创建相同。

[Shift+Enter R1](./dom/G05-D-softbreak-R1.json) / [R2](./dom/G05-D-softbreak-R2.json)：
仍为原四个块，但 Alpha 块含两条 ace-line：`Alp` 与 `ha`，光标在第二行偏移 0。
撤销、重做、再次撤销分别合行、重新分行、合行；完整行树在 body 中。
验收必须区分新增块与同块新增行，不能只比较截图中的换行。

## REQ-S07-G01-002 斜杠筛选、取消和键盘确认

来源：飞书浏览器可信输入。固定前置是末尾唯一空 text/ID 7。
[筛选 R1](./dom/G01-G07-D-slash-filter-R1.json) / [R2](./dom/G01-G07-D-slash-filter-R2.json)：
Slash 输入 `/` 后出现完整插入菜单；插入“标题”后，正文为 `/标题`，菜单只列一级、二级、三级标题。
Escape 关闭菜单但保留 `/标题`；两次撤销依次回 `/` 和空块。
两次重做依次恢复 `/` 与 `/标题`，菜单保持关闭；最后两次撤销恢复空来源。
“标题”的输入方法是浏览器文本插入，不能当作真实中文输入法组合证据。

[方向键 R1](./dom/G04-G09-D-slash-arrow-enter-R1.json) / [R2](./dom/G04-G09-D-slash-arrow-enter-R2.json)：
输入 `/` 后，Down、Up、Down 更新高亮行，Enter 将当前空尾块变为 heading1 并移除 `/`。
撤销回 text `/`，重做回空 heading1，再撤销回 text `/`；另一次撤销清除触发字符。
不能只用 menu-item-hovered 推断当前块类型；类型当前项和键盘高亮是不同状态。

## REQ-S07-G02-002 反向、多块、嵌套与只读

来源：当前 Chrome 实测。以下每个文件名均有同条件 R1/R2，正文和历史逐步核对。

| 前置与入口 | 已观察合同 | 两轮证据 |
| --- | --- | --- |
| Alpha 末端反向拖至开头 | 选区为反向全文；粗体只作用 Alpha，方向不改变作用域；历史恢复 | [R1](./dom/G02-D-reverse-selection-R1.json)、[R2](./dom/G02-D-reverse-selection-R2.json) |
| Alpha 开头拖至 Gamma 末端 | 气泡锚定选区；粗体覆盖三段，空尾块保持；历史恢复 | [R1](./dom/G02-D-multi-selection-R1.json)、[R2](./dom/G02-D-multi-selection-R2.json) |
| Alpha 先变引用，再跨至 Gamma | quote_container 包含原 Alpha；跨父子块选区可加粗；撤销格式及引用后回四个 text | [R1](./dom/G02-D-cross-quote-selection-R1.json)、[R2](./dom/G02-D-cross-quote-selection-R2.json) |
| 阅读模式选 Alpha | 根 contenteditable=false，气泡含“编辑”；格式、文本插入、斜杠、Enter 未改变正文；随后恢复编辑 | [R1](./dom/G02-G06-D-reading-mode-R1.json)、[R2](./dom/G02-G06-D-reading-mode-R2.json) |

局部混合态先对 `Al` 加粗，再选 Alpha；此时粗体控件没有 menu-item-actived，悬停后仅增加 hovered。
历史重做重新选回 Al 时控件才反映该子选区粗体；不把混合来源误记为全段一致粗体。
[混合 R1](./dom/G01-D-mixed-bold-R1.json)、[R2](./dom/G01-D-mixed-bold-R2.json)
保留完整 span 样式与控件 class；撤销重做仅改变 `Al`，不能把混合态当全段格式开关已测。
H1/H9、有序、无序当前类型分别有 `G01-D-current-*-R1/R2`；
以菜单当前项、图标和 DoneOutlined 共同判断，不能把键盘 hover 行当当前类型。

## REQ-S07-G03-002 入口区别与历史边界

[重复切换 R1](./dom/G03-D-switch-reopen-outside-R1.json)、[R2](./dom/G03-D-switch-reopen-outside-R2.json)
覆盖改选区、换块、重复开启和正文外点击；每一步锚点和选区以 journal 为准。
[加号 R1](./dom/G01-G03-D-plus-open-history-R1.json)、[R2](./dom/G01-G03-D-plus-open-history-R2.json)
从空尾块 AddOutlined 进入插入菜单；Escape 在此路径没有关闭菜单。
随后 Cmd+Z 撤销此前 Gamma 的 `a`，菜单随历史动作关闭，重做和最终撤销恢复；
纯打开菜单没有形成单独的正文历史项。

[页头更多 R1](./dom/G01-G09-D-header-menu-R1.json)、[R2](./dom/G01-G09-D-header-menu-R2.json)
打开 `.more-menu-popover`，焦点为 SECTION；方向键后 Escape 返回页头 BUTTON。
它与正文类型 toolbox、选词气泡及空块插入菜单分别记录，不共用“Escape 必然关闭”的结论。

## REQ-S07-G05-003 续写、缩进、选择与剪贴板

| 入口 | 已验证行为 | 双轮 |
| --- | --- | --- |
| Alpha 末端 Cmd+B 后插入 x | 新 x 带粗体，原 Alpha 保持；撤销/重做/撤销恢复文本 | [R1](./dom/G05-D-caret-bold-input-R1.json)、[R2](./dom/G05-D-caret-bold-input-R2.json) |
| Alpha/Beta 为有序，Beta 中 Tab | Beta 移入 Alpha 子层；Shift+Tab 回同层；两者均有独立历史往返，最后撤销建样 | [R1](./dom/G05-D-list-tab-outdent-R1.json)、[R2](./dom/G05-D-list-tab-outdent-R2.json) |
| 空尾块输入 > 再 Space | 创建 quote_container 包含原空块；撤销转换回 `> `，重做引用；继续撤销空格及 > 才回空 | [R1](./dom/G05-D-quote-space-R1.json)、[R2](./dom/G05-D-quote-space-R2.json) |
| Cmd+A 一次/两次 | 一次选当前 Beta，两次转为全正文块选择；真实复制所得语义为 Alpha\nBeta\nGamma | [R1](./dom/G05-D-select-all-save-R1.json)、[R2](./dom/G05-D-select-all-save-R2.json) |
| 选 Alpha 真实复制/剪切/粘贴 | 区分复制不改正文、剪切删除和粘贴恢复；真实历史往返 | [R1](./dom/G05-D-clipboard-roundtrip-R1.json)、[R2](./dom/G05-D-clipboard-roundtrip-R2.json) |

对应 `*-backup/check/restore-meta-R1/R2` 仅导出验证元数据，用户剪贴板原值未落盘。
本组命名剪贴板恢复逐类型逐字节相等；不抵消早期旧脚本恢复未证实的历史记录。
Cmd+S 已送达；可见云端保存状态不能单独证明独立持久化。

## REQ-S07-G06-001 输入焦点路由

正文均为固定四块；以下表中输入框历史不得改变正文。

| 真实焦点 | 合同与限制 | 双轮 |
| --- | --- | --- |
| 链接 INPUT | Cmd+A 仅选 URL；Cmd+B 不加粗正文；撤销/重做改输入值；Escape 取消未应用链接 | [R1](./dom/G06-D-platform-link-input-focus-R1.json)、[R2](./dom/G06-D-platform-link-input-focus-R2.json) |
| 链接 INPUT 后 Enter | 将 URL 应用于 Alpha；正文历史撤销/重做/撤销链接 | [R1](./dom/G06-D-platform-link-commit-history-R1.json)、[R2](./dom/G06-D-platform-link-commit-history-R2.json) |
| 链接 INPUT 真实粘贴 | 真实复制 Alpha，粘贴到链接输入；输入历史和正文隔离；取消并恢复剪贴板 | [R1](./dom/G06-D-link-paste-history-R1.json)、[R2](./dom/G06-D-link-paste-history-R2.json) |
| 文内查找 INPUT | Cmd+A、格式键、历史、Enter/Shift+Enter 保持正文；Escape 关闭查找 | [R1](./dom/G06-D-platform-find-input-focus-R1.json)、[R2](./dom/G06-D-platform-find-input-focus-R2.json) |
| 批注编辑区 | Draft 的格式、软换行、删除及其历史留在草稿；最终清空并关闭，未发布批注 | [R1](./dom/G06-D-comment-focus-history-R1.json)、[R2](./dom/G06-D-comment-focus-history-R2.json) |
| 页头按钮 | Cmd+F 打开文内查找，正文保持 | [R1](./dom/G06-D-outside-focus-find-R1.json)、[R2](./dom/G06-D-outside-focus-find-R2.json) |
| 气泡 Alpha 选区 | 删除及真实撤销/重做/撤销恢复该选区文字 | [R1](./dom/G06-D-bubble-delete-history-R1.json)、[R2](./dom/G06-D-bubble-delete-history-R2.json) |

链接存在性需读取后期 semantic body 的 href；早期简化属性导出不含 href，不能以缺省字段判断无链接。
主文档 selection 残留不等于 INPUT/IFRAME 的实际焦点；同时读取 focus、frameFocus 与输入值。

## REQ-S07-G07-001 组合输入与普通输入分流

[IME R1](./dom/G07-native-ime-R1.json)、[R2](./dom/G07-native-ime-R2.json)
的有效原生窗口在 `inspection`：CUA 真正向 Chrome 编辑根输入 h/u/a，
捕获 trusted compositionstart/update，以及 composing=true 的 Meta+B。
预编辑由 hua 变为 `hua b`，Space 提交“花白”；该通道下未执行普通选区的粗体路径。
观测到的 compositionend 为 trusted=false，不能把应用派发的结束事件写成全链路可信。
[历史 R1](./dom/G07-native-ime-history-R1.json)、[R2](./dom/G07-native-ime-history-R2.json)
完成空尾块→花白→空的撤销/重做/撤销。

[组合斜杠 R1](./dom/G07-native-ime-slash-R1.json)、[R2](./dom/G07-native-ime-slash-R2.json)
从同一空尾块输入 hua 后按 Slash：预编辑为 `hua/`，未打开斜杠菜单；
Escape 清空预编辑并恢复空块。R1 中 `/` 键名被工具拒绝，没有发送事件，随后使用 slash 键名；
两轮真正送达的 Slash 事件前置相同。未改变系统输入源设置。

[Ctrl+B R1](./dom/G07-D-control-b-R1.json)、[R2](./dom/G07-D-control-b-R2.json)
与 Cmd+B 分开测量，不将 Ctrl 视作 macOS 格式修饰键。
[选词替换 R1](./dom/G07-D-selected-replace-R1.json)、[R2](./dom/G07-D-selected-replace-R2.json)
验证 Alpha 选词后真实 KeyA 替换为 a，历史恢复。
[取消续写 R1](./dom/G07-D-slash-delete-continue-R1.json)、[R2](./dom/G07-D-slash-delete-continue-R2.json)
覆盖 Slash、Escape、退格删触发符和 KeyA 续写；逐次历史为 a/空/斜杠之间的真实往返。

## REQ-S07-G09-001 已观察的可访问性差异

[链接 Escape 续写 R1](./dom/G09-D-link-escape-continue-R1.json)、[R2](./dom/G09-D-link-escape-continue-R2.json)
关闭后实际焦点为隐藏只读 TEXTAREA；[查找对应 R1](./dom/G09-D-find-escape-continue-R1.json)、
[R2](./dom/G09-D-find-escape-continue-R2.json) 为 BODY。
随后可信 KeyA 已送达，但没有正文 input。驱动等待正文改变超时是此结果的断言失败，
不是“键未发出”；这两个入口不能宣称 Escape 后可立即续写。

[缩进禁用 R1](./dom/G01-G09-D-disabled-indent-R1.json)、[R2](./dom/G01-G09-D-disabled-indent-R2.json)
在普通 text 上增减缩进均禁用，点击不改正文，tooltip 为“无法缩进当前内容块”。
[链接 Tab R1](./dom/G09-D-link-tab-disabled-R1.json)、[R2](./dom/G09-D-link-tab-disabled-R2.json)
空 URL 的确认是原生 disabled 按钮；点击没有应用链接。
实际 Tab/Shift+Tab 后焦点为 BODY 或仍在 INPUT，不据此宣称已实现标准焦点循环。
role、aria、tabIndex、outline 与 live 节点记录在 menusAccessibility、uiTrees 和 live 中；
未取得的属性不补写为支持，未进行屏幕阅读器语音验收。

项目改进要求（设计约束，非飞书实测或项目实现）：菜单入口具备可读名称和键盘入口；
活动项与禁用原因通过语义属性暴露；Escape 恢复有效来源选区和可编辑焦点；
不要将当前观察到的隐藏 TEXTAREA/BODY 续写丢失照搬为项目目标。
纯打开/关闭菜单不进入正文历史；焦点切换不得把输入投递到旧文档、正文外或批注发布。

## REQ-S07-G04-002 互斥、滚动、缩放与边缘

[互斥 R5](./dom/G04-D-bubble-handle-mutual-R5.json)、[R6](./dom/G04-D-bubble-handle-mutual-R6.json)：
Alpha 选词气泡打开后悬停 Beta，块柄不出现；Escape 关闭气泡但保留 Range，
此时仅悬停仍无块柄；ArrowRight 折叠选区后悬停 Beta，块柄恢复。
R1/R2 误以为必有块柄，R3/R4 误以为 Escape 会折叠选区，均保留为失败预期；
有效双轮使用重新建样的 R5/R6，不把旧失败文件数计为通过数。

[滚动缩放 R3](./dom/G04-G08-D-scroll-scale-R3.json)、[R4](./dom/G04-G08-D-scroll-scale-R4.json)：
1152×907 视口中气泡初始 x=12/y=189.25/w=593.125/h=42；
外层滚动 200px 后 y=-10.75，仍挂载且部分越过顶部；回滚恢复 y=189.25。
目标页 visualViewport.scale 1→1.25→1 时 CSS 矩形保持，视觉视口缩至约 921.6×725.6 后恢复。
这是目标页视觉缩放，不能替代浏览器持久 zoom 偏好或其他 DPI 实测。

[650×420 R3](./dom/G04-G08-D-small-viewport-R3.json)、[R4](./dom/G04-G08-D-small-viewport-R4.json)：
气泡缩至 x=6/w=331.125；类型菜单 x=52/y=234.25/w=232/h=159，
其他标题菜单改至 x=6/y=198/w=232/h=210。
[截图 R3](./dom/G04-G08-D-small-viewport-R3.png)、[R4](./dom/G04-G08-D-small-viewport-R4.png)辅助检查裁切；
类型列表缩短并可滚动，未把所有行的 DOM 存在误当每行同时可见。
两轮后恢复原 viewport、scale 与四块来源。

## REQ-S07-G08-001 文案、热区、字体与计时

[tooltip/热区 R1](./dom/G08-D-tooltip-hitbox-R1.json)、[R2](./dom/G08-D-tooltip-hitbox-R2.json)：
粗体提示为“粗体 (⌘ + B)”和 Markdown 说明；在 24px 按钮内部偏移 2/2 点击，
落点在图标外仍可加粗 Alpha，撤销重做恢复。不能据此推广到所有控件热区。
[长菜单 R3](./dom/G08-D-slash-long-scroll-R3.json)、[R4](./dom/G08-D-slash-long-scroll-R4.json)：
`.docx-menu-wrapper.toolbox` 自身是滚动层，232×511；滚动 900px 后
“关联已有多维表格”行从 y=1426.25 到 y=526.25，行宽214；回滚恢复。
字体加载状态 loaded；不是网络字体加载失败、替代字体或任意超长自定义名称的测试。
斜杠取消及撤销恢复空尾块。R1/R2 使用错误的后代选择器停止，且第二轮来源已有斜杠，已排除。

[帧记录 R1](./dom/G08-D-frame-latency-R1.json)、[R2](./dom/G08-D-frame-latency-R2.json)
记录浏览器真实触发事件至首个满足状态的 requestAnimationFrame 观察，窗口1500ms。
双击最后 pointerup→气泡首见分别77.5ms、79.3ms；
粗体悬停→首个 tooltip 观察分别349.8ms、349.9ms；Escape keydown→气泡首个缺省帧分别8.1ms、15.7ms。
对应 frameWindowId 为 R1:7/8/9、R2:18/19/20；这是本样例功能基线 n=2，
不是绘制完成保证、稳定性能统计或项目 SLA。完整帧序列保留，打开与关闭分开核对。
运行窗口新捕获的 runtimeErrors 均为空；DevTools 先前已有错误不能据此抹除。
项目视觉容差、长文档性能上限及辅助技术支持仍属项目验收要求，不计飞书全范围已测。

## REQ-S07-G06-002 浏览器焦点与切窗口

[浏览器焦点 R1](./dom/G03-G06-native-browser-focus-R1.json)、[R2](./dom/G03-G06-native-browser-focus-R2.json)
的原生窗口在 inspection：Alpha 全文 Range、气泡打开，真实 Cmd+L 聚焦 Chrome 地址栏，
随后 Cmd+F 显示浏览器原生“在网页……中查找”及查找栏，而非文内查找 INPUT。
[地址栏 AX R1](./dom/G06-native-addressbar-AX-R1.txt)、[R2](./dom/G06-native-addressbar-AX-R2.txt)与
[浏览器查找 AX R1](./dom/G06-native-browser-find-AX-R1.txt)、[R2](./dom/G06-native-browser-find-AX-R2.txt)
记录实际原生接收者。页面正文、Alpha 选区与气泡保持；Escape 关闭浏览器查找。
不能把 DOM activeElement 的残留根焦点写成浏览器地址栏没有获得焦点。

[切窗口 R1](./dom/G03-G06-native-window-switch-R1.json)、[R2](./dom/G03-G06-native-window-switch-R2.json)
以同一 Alpha Range 和气泡作为来源；真实 Cmd+N 新建临时空 Chrome 窗口，
源页 document.hasFocus=false、hidden=false，气泡仍在；Cmd+W 关闭本轮临时窗口后恢复源页。
正文和 Alpha Range 保持，未对用户其他浏览器标签输入。
因此当前路径不能复刻成“窗口失焦必然关闭气泡”。
此处只覆盖 Chrome 原生窗口，不推导系统保留快捷键、跨应用全局钩子或别的平台。

## 早期长按通道限制（后续已补齐）

[长按 R1](./dom/G07-native-held-arrow-R1.json)、[R2](./dom/G07-native-held-arrow-R2.json)
均从 Alpha 偏移0，使用 CUA Right durationMs=1500；实际只有一条可信 ArrowRight keydown，
repeat=false，光标到1，正文不变。按键持续时间已请求，但没有送达系统自动重复事件。
此结果仅说明该输入通道不足；后续系统虚拟键盘的真实重复见下方 G07-002。不得伪造 repeat 字段、用循环点按替代或判飞书不支持。

## REQ-S07-G03-003 切文档使旧根与选区失效

来源：2026-10-20 Chrome 原生 AX 点击与只读 DOM 监控 F。
[来源 R3](./dom/G03-F-document-switch-before-R3.json)、[R4](./dom/G03-F-document-switch-before-R4.json)
均为四块纯正文、Alpha 0→5、气泡可见；实际点击侧栏 B1-first-character-recheck-20261012。
[旧根 R3](./dom/G03-F-document-detached-R3.json)、[R4](./dom/G03-F-document-detached-R4.json)
均从 rootConnected=true/currentRootSame=true 变为 false/false，气泡1→0，Alpha Range 不再存在。
[新文档 R3](./dom/G03-F-document-other-R3.json)、[R4](./dom/G03-F-document-other-R4.json)
取得实际 URL QAFixtureDocument01XXXXXXXX 的新正文，未使用旧根执行命令。
[返回 R3](./dom/G03-F-document-return-R3.json)、[R4](./dom/G03-F-document-return-R4.json)
均保留主研究文档原四段内容；R3 返回后手动重新选 Alpha 才导出，R4 直接读取时无菜单。
切回后的本地块ID重新分配；跨文档或重新安装监控不比较 f 引用的对象身份。
本条只覆盖侧栏切到该既有研究文档并返回；未改另一文档内容，也不推导历史栈跨文档可用。
旧 E-R2、F-R1 的真实来源不是 Alpha Range，及系统锁屏拒绝的 E-R1 均保留为探查，不能配作此双轮。

## REQ-S07-G09-002 气泡中的 Tab 路径

[原生 R3](./dom/G09-F-bubble-tab-R3.json)、[R4](./dom/G09-F-bubble-tab-R4.json)
从 Alpha 全文选区和已打开气泡开始，真实 Tab→Shift+Tab→Escape。
两轮可信 keydown/up 到达编辑根，Tab/反向Tab 后 activeElement 仍为编辑根 DIV，
Alpha Range 与气泡保持；Escape 才关闭气泡，正文和选区保持。
控件 tabIndex、role/aria 与焦点 outline 在 menuFocus、focusStyle 中；
当前路径未观察到 Tab 在气泡控件之间形成焦点顺序，不能宣称键盘可达性已完备。
R1 在前台送达保护中停止，没有发送按键，排除。块菜单与加号的同类路径见下方独立合同。

## REQ-S07-G05-004 两个保存版本的独立读取

来源：2026-10-20 Chrome 原生按键编辑、浏览器真实 reload 与夸克辅助只读。
同一四块来源不改类型与顺序；R1 对 Alpha 实按 Cmd+B，R2 在已保存粗体基础上实按 Cmd+I。
[编辑 R1](./dom/G05-F-persistence-edit-R1.json)、[R2](./dom/G05-F-persistence-edit-R2.json)
保留可信按键、选区及格式 mutation；按键时均选中 Alpha 全文。
R1 的原生 AX 观察出现 ScreenCaptureKit -3811，但事件和 DOM 已证实按键实际送达，不能当未执行。
前置[云端保存 R1](./dom/G05-F-Chrome-before-reload-R1.json)、[R2](./dom/G05-F-Chrome-before-reload-R2.json)
均取得“已经保存到云端”，随后使用 Chromium 原生 Apple-event reload（非修改 DOM、调用业务保存 API）。
[Chrome 刷新 R1](./dom/G05-F-Chrome-after-reload-R1.json)、[R2](./dom/G05-F-Chrome-after-reload-R2.json)与
[夸克独立刷新 R1](./dom/G05-F-Quark-after-reload-R1.json)、[R2](./dom/G05-F-Quark-after-reload-R2.json)
每版的 record、类型、行文字与格式逐项一致；R1 为粗体 Alpha，R2 为粗斜体 Alpha，其他三块保持。
Chrome timeOrigin 在两轮真实加载后不同，各次刷新后无本阶段观察器。
两版不同且第二版是继续编辑后的结果；不能只凭单一提示或旧标签缓存宣称保存成功。
本代表保存不推广为每一入口、历史步骤、权限或网络故障条件均已独立重载。
格式撤销重做另由既有粗体/斜体有效双轮验证；重载后未假定此前本地历史仍可用。

## REQ-S07-G09-003 块类型与空行加号的 Tab 路径

2026-10-20 使用原生拖动显露块柄，再点击真实入口。有效特征窗口从首个 Tab 捕获阶段开始，
前置与来源选择都在同一原始记录中；没有为了配对而补造快照。
[块类型 R1](./dom/G09-F-block-focus-tab-R1.json)、[R2](./dom/G09-F-block-focus-tab-R2.json)
均为 Alpha 末尾光标、编辑根 DIV 焦点、类型菜单已打开。
可信 Tab→Shift+Tab→Escape 后仍为根焦点、同一光标，菜单保持，正文与格式不变。
当前路径未观察到 Tab 在菜单项间移动，也不能宣称 Escape 必然关闭该入口。

[加号 R1](./dom/G09-F-plus-root-tab-R1.json)、[R2](./dom/G09-F-plus-root-tab-R2.json)
来自原始 plus-tab R2/R3：末尾空 text 块光标、编辑根焦点、加号菜单已打开。
Tab 关闭菜单；下一次反向 Tab 和 Escape 前，根焦点与空块光标保持，正文不变。
最终快照可能在页头外点之后，不将它冒充孤立的 Escape 后快照。
恢复原始文件与其扩展规范 SHA256、精确捕获标签均在 derivation 中。
两轮准备中的鼠标动作有差异，但比较窗口的真实入口、焦点、选区及状态相同。

原始 plus-tab R1/R5 的首键接收者为 BODY，R4 为隐藏 TEXTAREA，与上述根焦点前置不同；
它们保留为探查。R1 缺少首键前即时快照，不能与 R5 凑成稳定双轮。
这些不同来源不得混成统一的加号菜单 Tab 合同；role/aria、tabIndex 和 outline 以实际记录为限。

## REQ-S07-G07-002 系统虚拟键盘的真实按住重复

[正式 R1](./dom/G07-F-keyboard-viewer-held-R1.json)、[R2](./dom/G07-F-keyboard-viewer-held-R2.json)
通过系统输入菜单“显示虚拟键盘”打开原有面板；按 AX 实际按钮“▶”的坐标持续鼠标按下两秒，再松开。
脚本只发送一次鼠标按下与松开，没有循环点按、注入 DOM KeyboardEvent 或设置自动重复标志。
虚拟键盘产生系统按键：每轮一次可信 ArrowRight repeat=false，随后 17 次可信 repeat=true，
最终一次可信 keyup；松开后的观察窗口没有新的按下。两轮均从 Alpha 偏移0、编辑根焦点、无菜单开始。
光标越过 Alpha/Beta/Gamma 到末尾空 text 块，最终偏移1；正文层级、文字与行内格式保持。
focused 类随光标换块发生变化，不能将这些必要焦点 mutation 误称为完全没有 DOM 变化。
原始有效窗口位于 inspection；外层记录实际鼠标机制、坐标、起止时间及未设置 repeat 标志。

此结果覆盖本机系统虚拟键盘提供的自动重复，不冒充物理键盘硬件或其他平台验证。
八秒 CUA 长按和 System Events keyDown/keyUp 仍各只产生一次按下，均保留为通道探查；
不得用这些旧限制否定随后确实送达的重复事件。虚拟键盘面板已用原有关闭按钮关闭，未改系统设置。
