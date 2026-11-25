# S01 验收矩阵与证据索引

本文件只覆盖 S01 的浏览器基线和证据链。A01–A07 已收口，完整块类型创建与转换矩阵没有开始；拿本文件不能宣称整个编辑器已经满足 1:1 或具备生产可用性。

`[✅]` 表示本项已按注明来源完成；人工接受项明确标注，不能作为自动实测数值。失败、未生效和未执行窗口保留，不计为功能通过。需求正文见 [基线需求](./01-baseline-and-dom.md)，后续范围见 [任务清单](../ym-research-task.md)。

## 来源与判定

| 来源 | 本阶段采用方式 | 限制 |
| --- | --- | --- |
| 真实 Chrome UI、可信事件、DOM 查询 | 飞书实测事实；需求逐项关联下面的用例 | 只适用于记录中的环境与前置状态 |
| MutationObserver、对象池、前后补丁 | 必要节点关系、对象身份和顺序证据 | 属性新值是回调读取值；不能还原未采集的每次中间写值 |
| 原生 DevTools Console AX | 引擎消息、环境基线与故障日志核对 | 工具栏分组计数不是唯一消息数；不复制无关请求内容 |
| sir 的人工确认 | 缩放项接受收口 | 具体百分比未知；不能写成 100% |
| 项目生产要求 | 需要可回放用例、来源追踪、错误恢复和发布门槛 | 本轮没改项目、没验证项目运行或服务器协议 |
| 待后续实测/决策 | 生产协议、全块矩阵、视觉/性能容差、跨平台 | 未确认结果不写成飞书事实 |

## 可执行验收

复测前核对实际 Chrome URL、登录会话、模式、视口、根连接、输入源、正文焦点及监控会话。每个操作有独立编号、前后状态和日志窗口；跨刷新会话不比较同名节点引用的对象身份。

| 用例 | 前置条件 → 用户动作 | 必须观察的结果 | 状态 / 证据 |
| --- | --- | --- | --- |
| S01 A01 页面与环境 | 已打开指定登录页面 → 读取并真实输入/历史恢复 | 当前编辑入口可执行，URL 与窗口匹配；环境来源明确 | [✅] [最终环境](./dom/closeout-final.json) |
| S01 A02 空文档 | 在线编辑，空页标题和正文 → DOM/样式查询 | 两个区、空叶、占位、父子关系及样式可定位 | [✅] [首次基线](./dom/baseline.json)、[会话基线](./dom/session-20261013.json) |
| S01 A03 首字符变更 | 正文空叶 → 物理输入 `1` | 可信输入链；新增文字叶、原空叶保留、选区正确 | [✅] [输入/延迟](./dom/closeout-input-and-timing.json) |
| S01 A03 外部菜单 | 空正文 → `/`、Escape、Cmd+Z，两轮 | 菜单正文外挂载；Escape 保留 `/`；撤销恢复空叶；下轮重建菜单 | [✅] [两轮菜单](./dom/slash-menu-20261013.json) |
| S01 A03 引擎输入 | Console 环境基线分离并清空 → 实际输入 | 目标文档、top、默认级别、空过滤框；结果为 0 条消息 | [✅] [输入日志](./dom/closeout-engine-input.json) |
| S01 A03 引擎历史 | 已有 `1` → 撤销、重做、再次撤销，各自窗口 | 空/1/空对应；新文字节点与空叶身份正确，各操作 Console 为 0 | [✅] [撤销](./dom/closeout-engine-history.json)、[重做](./dom/closeout-engine-redo.json)、[恢复](./dom/closeout-engine-restore.json) |
| S01 A04 静置 | 固定停靠环境与空文档 → 两个 10 秒窗口 | 保存完整前后；DOM/输入/异常/console/overflow 均为 0 | [✅] [完整静置](./dom/closeout-quiet.json) |
| S01 A04 焦点边界 | 正文光标 → Cmd+L | document.hasFocus=false，可仍保留 root 与选区；输入守卫拒绝 | [✅] [焦点历史](./dom/history-and-focus-20261013.json) |
| S01 A04 监控对照 | 同空正文 → 输入/撤销/重做/恢复，完整监控与关闭监听分别做 | 可见文字、必要结构、选区一致；关闭监听时不判零错误 | [✅] [无监控对照](./dom/control-and-scroll-20261013.json) |
| S01 A04 延迟对照 | 同物理按键与轻量探针 → 两组各两次输入/恢复 | 每份首个 rAF 中有真实 `1`；不当成绘制完成或一般性能保证 | [✅] [四份有效样本](./dom/closeout-input-and-timing.json) |
| S01 A04 内部滚动 | 空正文光标 → PageDown | 文字、选区不变；内部容器 scrollTop=64，window scroll 为 0 | [✅] [滚动](./dom/control-and-scroll-20261013.json) |
| S01 A05 样例恢复 | 每份小样 → 逐步撤销至空，核对提示后刷新 | 研究字符/块类型无残留；旧观察器消失，新会话重新核对 | [✅] [首次刷新](./dom/reload-20261013.json)、[最终刷新](./dom/closeout-final.json) |
| S01 A06 同前置历史 | 真正聚焦的空正文 → 输入/撤销/重做/恢复，R4/R5 | 两轮文字与选区一致；原行/空叶保留，重做新建文字节点 | [✅] [正式复测](./dom/validation-20261013.json) |
| S01 A02 真实目录 | 空正文 → `/` 选择 H1，输入 `1`；点击目录链接 | 正文外 `.catalogue` 与标题块关联；导航焦点进入隐藏 textarea | [✅] [目录建样](./dom/closeout-outline-fixture.json)、[目录导航](./dom/closeout-outline-history.json) |
| S01 A02 目录空状态 | H1 `1` → 撤销文字、转换、斜杠 | 文字清空即卸载目录；最终空文本块，不能要求复用旧编辑区 | [✅] [目录恢复](./dom/closeout-outline-history.json) |
| S01 A07 阅读模式 | 编辑模式 → 阅读、按 `1`、切回编辑 | 同根/两区 CE=false；可信 keydown 无写入；恢复 CE=true 与空叶 | [✅] [模式](./dom/closeout-modes.json) |
| S01 A07 可见失败 | 原无节流网络 → DevTools 离线 | online=false，保存栏显示离线，产品说明与引擎失败分开记录 | [✅] [离线基线](./dom/closeout-offline-baseline.json) |
| S01 A07 离线恢复 | 离线正文实际聚焦 → 输入 `1`、恢复原网络、撤销 | 离线可输入；联网提示已保存；撤销为空；最终日志 0 | [✅] [离线恢复](./dom/closeout-offline-history.json) |
| S01 A07 加载与视觉 | 最终空文档 → 真实刷新、关闭 DevTools | loading/无根到 complete/空结构；视口与字体按实际记录 | [✅] [最终基线](./dom/closeout-final.json) |
| S01 A07 缩放 | Chrome 菜单值自动读取受限 → sir 确认可完成 | 仅记录人工接受；数值未知，无推算 | [✅] 人工接受，[来源记录](./dom/closeout-final.json) |

## 保留的失败窗口

| 记录 | 判定 | 处理与后续边界 |
| --- | --- | --- |
| observations 的 focus-R1/R2、input-R1 | 自动聚焦/输入尝试不能当成成功输入 | 人工真实聚焦后 R2 与正式 R4/R5 已补齐；失败窗口仍保留 |
| history-and-focus 的 focus-R3、focus-navigation-R1/R2 | 自动焦点导航不构成正常快捷键规范；Tab 曾改变缩进 | 已真实撤销恢复，文档级按键监听补齐；完整导航留 S09/S10 |
| baseline 的 quiet-R1 | 缺完整前后快照，不能作为严格重复证据 | quiet-full-R3/R4 已补齐 |
| validation 的 latency-attempt-R2 | 无实际文字输入；15.4/33.5ms 不具备有效时延意义 | 仅用后补的四份有效物理键样本 |
| engine-redo-R1 | 因当前 Chrome 窗口切换，重做未执行 | 原窗口不算通过；engine-redo-R2 已真实完成 |
| outline-pin-R1 | 点击后 data-pin 未变，不能算固定行为验证 | 入口 DOM 已定位；固定/折叠行为留 S06，不能复制此自动化失败 |

## 证据还原与收口

JSON 使用各文件的 baseline、必要 DOM 对象池和 RFC 6902 补丁；旧文件可引用同目录其他 JSON 的 `/baseline`。先递归展开 `$dom`，设置对应 time，再应用 before 的 baselinePatch、after 的 beforePatch。文件内 reconstruction 字段说明局部格式；原始 record 序号与必要变化关系保留。

已核对 20 份 JSON、70 个记录窗口可解码，新增 16 个窗口与精简前必要记录一致，文档链接无缺失；文件均在 50–500 行范围。这个数字包括保留的失败/未执行窗口，不能作为“70 个功能通过”的宣传。

现场收口：在线编辑空页标题/空正文，原网络预设恢复，最终刷新确认无小样残留；DevTools 关闭，监听停止，原 console 方法恢复，active=null、overflow=0。S01 已完成，S02 未启动；项目代码和生产服务未改动。
