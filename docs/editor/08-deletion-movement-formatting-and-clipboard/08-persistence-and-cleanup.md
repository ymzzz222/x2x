# S08 独立保存读取与现场清理

状态：2026-10-21，研究交付结束，保留限制。原双浏览器混合版本各两轮及本轮新增后的保存、清空历史、最终空版本刷新与界面恢复均已完成；七项产品差异及代表范围限制已由 sir 确认，见[收口清单](./08-closeout-review.md)。
总状态仍见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)，本记录不代替 H01–H09 功能用例或整项验收。
主端功能证据固定来自 Chrome；夸克只作授权的独立保存读取及必要的折叠展开读回。

## 1 来源、恢复条件与版本

sir 明确允许 Chrome 和夸克前台运行，并将夸克选到指定研究文档后回复“夸克研究页已就绪”。
原生连接确认实际 URL 为 https://research-fixture.example/wiki/QAFixtureDocument02XXXXXXXX 。
本次连接成功，不能继续把上次未知 URL 的控制拒绝写成当前飞书文档不可访问。
Chrome 当日恢复证据见[基线](./dom/H00-20261021-Chrome-resume-checkpoint.json)，原监控 connected=true、无未结束操作。
保存版本为 Title 标题、Alpha 普通正文、编号 H9 Beta、Gamma 普通正文、折叠 ordered IndentParent、Quote 引用父子和末空 ordered。
IndentParent 内有 ordered 子项 IndentChild；折叠时不在渲染树，独立读回需真实展开确认。
测试批注已按授权解决，侧栏为评论（0）；原 Alpha 的已解决 comment-id 类仍可能保留，不能据此声称删除了批注记录。

## 2 夸克 R1/R2 的真实刷新证据

每轮保存刷新前的 performance.timeOrigin，真实 Cmd+R 后重新读取导航类型、加载时间、指定根及完整必要 DOM。
两轮导航类型均为 reload；加载时间均改变，不以同一加载中的同步更新冒充重开。

| 轮次 | 刷新前 timeOrigin | 刷新后 timeOrigin | 有效折叠读取 |
| --- | --- | --- | --- |
| R1 | 1792462848116.9 | 1792547079388.1 | [恢复后的完整读取](./dom/S08-save-mixed-Quark-R1-fold-restored.json) |
| R2 | 1792547079388.1 | 1792547772754 | [重载后读取](./dom/S08-save-mixed-Quark-R2.json)、[恢复折叠](./dom/S08-save-mixed-Quark-R2-fold-restored.json) |

每份保存 URL、浏览器、采集时间、导航、viewport、正文/标题树、块类型与父级、编号按钮、计算样式及语义哈希。
两轮均未发现主观察器 window.__s08；后续只读导出使用独立自建变量，不把该变量当正文观察器。
只在同一加载内用引用区分节点；跨重载不比较 DOM 对象身份或要求本地 data-block-id 字面值保持。

## 3 折叠与隐藏子项完整读回

折叠态两轮均为 7 个可见带 data-block-id 的节点；引用父容器和内部文字分别计数。
编号 H9 Beta、父项 IndentParent、末空 ordered 的实际按钮文字为 1.。
真实展开后两轮均为 8 节点，IndentChild 为 ordered，编号 a.，parent 指向 IndentParent。
有效展开证据：[R1](./dom/S08-save-mixed-Quark-R1-expanded-verified.json)、[R2](./dom/S08-save-mixed-Quark-R2-expanded.json)。
展开只用于读取折叠后代，不将夸克上的辅助操作冒充 Chrome 功能双轮。
读回后均通过真实折叠控件恢复；R2 恢复签名与其刷新后折叠签名一致。

| 状态 | 两轮共同语义 SHA256 | 核对范围 |
| --- | --- | --- |
| 折叠 | c6b6eed5c8b0085b889fb60e1a9f09ec016d526f5dbddb0f6eab527a25b5dc78 | Title、7 节点文字/类型/父级、编号和必要计算样式 |
| 展开 | e5c109894d747c3ceba3d9160fa2b380b8bffbb67f5902e2a377e6de48691a01 | 额外子项、a. 编号、父子关系及上述内容 |

语义签名排除 viewport 尺寸与对象引用；完整 DOM 和原属性仍分别保留。
不能用此签名证明飞书内部存储方式、未渲染节点常驻或项目安全验收通过。

## 4 首轮读取器和折叠恢复探查

[早期折叠读取](./dom/S08-save-mixed-Quark-R1.json)和[早期展开读取](./dom/S08-save-mixed-Quark-R1-expanded.json)的派生 marker 字段未取得数字编号，不能据其派生签名判定完整编号通过。
随后从块内真实编号 BUTTON 读取文字，并保存伪元素 content/counter 样式，在同一已刷新页面补齐完整读取；没有重写原文件。
[带 verified 名称的中间记录](./dom/S08-save-mixed-Quark-R1-verified.json)实际仍为 8 节点展开态；文件名只表示当时意图，不计折叠恢复成功。
最终采用明确 7 节点且含完整编号的 R1-fold-restored，不以相同命名掩盖失败恢复。
展开状态的折叠 SVG 在未悬停时矩形为零；早期点击日志实际落到 page-main 外侧空白，未发生折叠。
行内微小拖选触发悬停并显示箭头后，直接点击可见箭头才成功收起；没有改写 DOM 或调用内部折叠命令。
首轮恢复文件保留定位日志：restoreProbe 10/20 条，visibleProbe 3/10 条，未达到各自上限。
这些日志只解释辅助恢复的实际点击目标，不声称构成完整拖放轨迹或额外功能验证。
只读辅助监听已停止；第二轮重载前的辅助变量随重载销毁。

## 5 早期收尾检查点及后续补齐

Chrome 两轮真实刷新及对应版本读取已补齐，见第 6 节；没有用夸克结果替代。
阶段最终正文/页标题清空、撤销恢复、重做清空及双浏览器刷新确认已执行，见第 7、8 节。
观察器、辅助监听和研究标签调试面板已清理；窗口菜单的显示屏归属推定与未独立读取的显示器标识明确分开。
不关闭用户原有研究标签，不恢复未知的上次受限 URL，也不把其他阶段的空文档记录沿用到本阶段。
最后 Chrome 窗口菜单仅提供“移到 24B36HE”；根据已观察到的内建屏/24B36HE 两屏配置，推定当前已在内建屏，未额外执行迁移，不宣称取得独立显示器标识。

先前阻塞见[移动记录第 16 节](./08-movement-observations.md#16-助手自行恢复的最新阻塞检查点)，随后已自行恢复原混合版本，见第 17 节；该旧现场不作为当前状态。

## 6 Chrome 两轮独立读取与原观察器停止

[刷新前检查点](./dom/H00-Chrome-pre-reload-observer-stop.json)确认原混合版本，已调用主观察器及五个自建辅助监听的 stop，刷新前没有未结束操作。
health.connected 的实现检查 root/body 是否仍在 DOM，停止后仍为 true；该字段不能当作监听停止状态。随后真实刷新清除所有旧变量与监听，两轮独立读取均确认 window.__s08 不存在。

| 轮次 | 刷新前 timeOrigin | 刷新后 timeOrigin | 完整版本 |
| --- | --- | --- | --- |
| R1 | 1792471664255.7 | 1792556466897.8 | [折叠](./dom/S08-save-mixed-Chrome-R1.json)、[展开](./dom/S08-save-mixed-Chrome-R1-expanded.json)、[折叠恢复](./dom/S08-save-mixed-Chrome-R1-fold-restored.json) |
| R2 | 1792556466897.8 | 1792556561027.8 | [折叠](./dom/S08-save-mixed-Chrome-R2.json)、[展开](./dom/S08-save-mixed-Chrome-R2-expanded.json)、[折叠恢复](./dom/S08-save-mixed-Chrome-R2-fold-restored.json) |

每轮均由真实 Cmd+R 触发，导航类型 reload、加载起点改变；不是原加载内再次取样。
两轮折叠语义签名均为第 3 节的 c6b6eed5…5b5dc78，展开均为 e5c10989…691a01，与夸克有效读取逐字段一致。
页标题 Title、Alpha、编号 H9 Beta、Gamma、父子 ordered 编号 1./a.、Quote 引用及末空 ordered 的文字、父级与必要计算样式保留。
通过真实箭头展开后读取隐藏 IndentChild，再用可见控件恢复折叠；辅助悬停采用行内 1px 原生拖选，不修改正文或调用内部命令。
11 份有效双浏览器读取的导航/编号/结构/样式语义审计通过，原生拖动通道复核另列，不用它替代功能用例。

## 7 真实清空、逐步撤销与重做

证据：[完整七步历史](./dom/S08-final-clear-undo-redo.json)。此为现场清理验证，不是 H01–H09 整项通过。
在独立读取完成后的原混合版本上，真实两次 Cmd+A 后 Backspace 清空正文；再真实选择 Title:0→5 并 Backspace，单独清空页标题。
正文删除键目标为隐藏 TEXTAREA，标题删除键目标为可编辑根，标题真实选区单独记录；没有通过改写 DOM、内部命令或 API 清空。

| 读回步骤 | 标题/正文 | 语义签名 |
| --- | --- | --- |
| before、undo-body | Title、原 7 节点可见混合结构 | c6b6eed5…5b5dc78 |
| body-cleared、undo-title、redo-body | Title、0 正文节点 | 92582c4f…6beb629 |
| both-cleared、redo-title | 空标题、0 正文节点 | b2c824e3…8b42595 |

两次 Cmd+Z 分别恢复标题、正文，两次 Cmd+Shift+Z 分别重做正文清空、标题清空；八个可信内容/历史 keydown 的顺序、范围和每步语义均审计通过。
Undo 后核对可见混合结构与样式；该清理窗口没有另行展开隐藏子项，不能将其说成隐藏 DOM 身份复原。此前双浏览器的完整展开读回另有独立证据。
清理专用被动观察记录 37 条事件、132 条 mutation，两个限额均未触发，导出前 stop 已调用。

## 8 最终空版本、变量与原界面恢复

[Chrome 空版本](./dom/S08-final-empty-Chrome.json)、[夸克刷新前同步态](./dom/S08-final-empty-Quark-before-reload.json)、[夸克空版本](./dom/S08-final-empty-Quark.json)均为同一 b2c824e3…8b42595 语义：页标题为空、正文 0 节点。
两浏览器均真实 Cmd+R 后确认 timeOrigin 改变、导航 reload、旧主/清理/辅助观察器均不存在；不是仅依据“已保存”提示。
为清除只读快照与导出缓存，各又真实刷新一次，用不创建页面变量的标量查询确认没有任何 __s08 前缀变量，见[Chrome 标量终检](./dom/S08-final-empty-Chrome-terminal.json)、[夸克终检](./dom/S08-final-empty-Quark-terminal.json)。
随后关闭研究标签调试面板；夸克恢复本轮接管时选中的原用户标签，其他标签的 Network 调试界面未改动，未猜测或恢复旧阶段的 TDesign 地址。
Chrome 首个终检 AX 实际仍是展开的窗口菜单，截图不可用；该视觉检查被[关闭菜单后的有效终检](./dom/S08-final-empty-Chrome-closed-menu.json)替代。后者确认指定研究 URL、调试面板和窗口菜单均关闭，并保存[最终界面](./dom/S08-final-empty-Chrome.jpg)。
研究标签未关闭，测试评论仍按既有证据解决，临时跨文档副本的回收证据保持；没有把本次现场清理扩大为永久删除评论或项目生产验收。

## 9 继续执行后的最终收尾

sir 随后要求“继续直到结束”，新增[补充合同](./08-supplemental-contracts.md)三个有效双轮，并明确接受[代表范围与限制](./08-closeout-review.md)。前八节是此前版本的有效记录，本节为最后现场。
[刷新前版本及补测观察器停止](./dom/S08-supplement-before-reload.json)记录三段 Alpha、ordered Beta、Gamma；[Chrome 实际刷新](./dom/S08-supplement-Chrome-reload.json)的 timeOrigin 变为 1792560190341.5，语义哈希 935895a7…3b920b6，与刷新前一致。
readback.observerPresent 只检查旧变量 __s08；新补测观察器 __s08R 的停止由同文件 observer.stoppedAt 单列证明，不能用该旧字段单独声称全部观察器已停。

夸克中间读取实际返回 4 块、哈希 45fec815…f01d9、timeOrigin 1792560280530.3；随后发生 ScreenCaptureKit 捕捉失败，完整导出未落盘，不能把该摘要冒充完整 DOM 证据或三段保存一致。
Chrome 后续也读到新增首空 text；来源处于未监控间隔，不归因于粘贴、刷新或产品同步错误。
[首空段恢复](./dom/H00-supplement-unexpected-leading-empty-recovery.json)先完整记录四块，再实际 Backspace 将首块 U+200B 变为空文字，Delete 将 Alpha 合入首空块，恢复三段语义。
该会话中原 Alpha ID2 被移除，首空块 ID6 成为 Alpha；没有声称原 Alpha 身份恢复。Beta、Gamma 内容及所属顶层关系保持，此恢复不计功能双轮。
[恢复后的 Chrome 刷新](./dom/S08-supplement-recovered-Chrome.json)timeOrigin 1792560692179，重新得到相同三段语义哈希；没有把失败的夸克中间读取算作同版本通过。

[最终清空历史](./dom/S08-supplement-final-clear-history.json)保留 before、cleared、undo-restored、redo-cleared 四步：三段 → 0 块 → 三段 → 0 块。
两次 Cmd+A、一次真实 Backspace、一次 Cmd+Z、一次 Cmd+Shift+Z 均为可信事件；页标题保持空占位，正文/标题 mutation 与选择分别留存，日志未达上限且 errors 为空。
补测观察器于 2026-10-21T05:33:09.916Z 调用 stop，后续真实刷新销毁其对象及只读导出缓存。
[Chrome 最终空版本](./dom/S08-supplement-final-empty-Chrome.json)和[夸克最终空版本](./dom/S08-supplement-final-empty-Quark.json)均为 0 块、空页标题，哈希同为 b2c824e3…8b42595。
对应 timeOrigin 分别为 1792560807140.5、1792560839964，均记录导航 reload；夸克恢复控制前的输入及窗口探查未混入功能双轮。

研究标签在控制间隔曾切回原用户标签，URL 守卫中止了后续控制台查询；重新选择指定研究页后才继续，不以该间隔的刷新请求作为研究证据。
各又执行一次已核对 URL 的真实刷新：[Chrome 终检](./dom/S08-supplement-Chrome-terminal.json)为 1792561206971.7，[夸克终检](./dom/S08-supplement-Quark-terminal.json)为 1792561137833.6；两边均是 reload、0 块、空标题、所有 __s08 前缀变量为空。
[界面恢复记录](./dom/S08-supplement-interface-restored.json)确认两个研究控制台已关闭、仍为指定 URL 且显示空正文占位。夸克恢复本轮接管时第 13 个“剧本 · 跳跃视界”标签；该原标签既有 Network 面板保持原状。
Chrome [最终界面](./dom/S08-supplement-final-empty-Chrome.jpg)已保存；没有关闭研究标签或改动浏览器安全权限。
[补充语义审计](./08-supplement-audit.json)的 12 个检查均通过；全阶段 423 份研究 JSON、413 份编码快照哈希和本地链接另见[证据审计](./08-evidence-audit-checkpoint.json)。

## 10 重新验证后的最终保存与清理

2026-10-22 本节为当前最终状态，第 1–9 节均保留其历史时间和版本，不用于替代本次清理。
最终富格式为 Alpha 的 Al 粗斜体、pha 下划线，Beta bullet，Gamma 属于 quote_container，Tailx 为外部普通段，标题空。
[Chrome R1](./dom/S08-full-final-rich-Chrome-R1.json)、[R2](./dom/S08-full-final-rich-Chrome-R2.json)各真实重载，timeOrigin 为 1792668390108.3、1792668423777.8；五块语义哈希 ed3b0ee6…5602847。
[夸克重载前](./dom/S08-full-final-rich-Quark-before-reload.json)、[R1](./dom/S08-full-final-rich-Quark-R1.json)、[R2](./dom/S08-full-final-rich-Quark-R2.json)实际有第六个末空 text；两次重载 timeOrigin 为 1792671225447.8、1792671260850.1，哈希 452872b3…56f41f9。
五块文字、父级与逐字符计算样式完全相同；[后续 Chrome 当前读取](./dom/S08-full-final-rich-Chrome-current.json)也为相同六块及哈希。空段产生在未监控间隔，来源未定，不归因于重载、同步或某次功能输入，也不把原先五块与夸克六块说成完全一致。
本次未为消除差异而改写证据或重复建样；清理前的六块版本是下述真实历史的固定前置。

[最终清空历史](./dom/S08-full-final-cleanup.json)包含 before 六块、applied 零块、undo 六块、redo 零块。
两次 Cmd+A 建立结构选择后，一次可信 Backspace 清空；原生空根点击未建立焦点，历史键未发送。
随后 Chrome 扩展入口向已观察的真实 contenteditable 根发送一次 Meta+z；工具调用超时，但被动监控确认恰好一次可信撤销，完整内容、层级、样式恢复，因此未重复撤销。
最后原生正文焦点后一次 Cmd+Shift+Z 重做清空。两个历史按键目标均为正文 root-block；空页标题树始终相同，errors/overflow 为空。
补测观察器实际 stop 后，以下重载销毁其对象；每份读回另外检查所有研究监控变量，无残留监听对象。

| 浏览器 | 第一轮重载 | 第二轮重载 | 最终语义 |
| --- | --- | --- | --- |
| Chrome | [R1](./dom/S08-full-empty-Chrome-R1.json)，1792671574437.4 | [R2](./dom/S08-full-empty-Chrome-R2.json)，1792671612545.4 | 零块、空标题 |
| 夸克 | [R1](./dom/S08-full-empty-Quark-R1.json)，1792671650921.9 | [R2](./dom/S08-full-empty-Quark-R2.json)，1792671686821.4 | 零块、空标题 |

四次均为实际 reload，时间源不同，哈希均为 b2c824e3a243f733fc30b557ccca815b11b61f54591394ed0581204a18b42595；不是未加载空壳：此前实际保存版本及最终空正文占位、研究 URL 均已核对。
导出后再次删除所有 __s08 前缀临时变量，读回 remaining=[]；研究控制台输出清除并关闭。
[界面恢复](./dom/S08-full-interface-restored.json)确认两边研究 URL、空正文占位和 DevTools 关闭；[Chrome 最终界面](./dom/S08-full-final-empty-Chrome.jpg)保存。
本轮接管时夸克前台已是“流水线 - malt-creative-web - 重庆麦芽传媒有限公司”，最终按该已有标签标题恢复；原标签查询参数已变化，仅记录实际 URL，没有导航恢复旧查询、执行该页控制台或清除其日志。此前“跳跃视界/Network”的恢复记录仅属于前轮。
既有临时跨文档副本已回收、临时批注已解决的证据继续有效，本次未重建副本或新增批注，未永久删除数据或改浏览器安全权限。
[最终审计](./08-final-cleanup-audit.json)42 组均通过，另有短边界 59、混合格式 12、Unicode 21、多块/软行 12、运行矩阵主审计 25 组通过；这些组有重叠，不相加成唯一功能数量。
项目实际粘贴流程仍有一项确定安全失败；自然拒绝不可达与飞书全文极限未知仍不是通过项，详见[运行矩阵](./08-full-verification-matrix.md#28-最终保存清理与交付判定)。

全阶段最终[文件与快照审计](./08-evidence-audit-checkpoint.json)：571 份研究 JSON、560 份编码快照还原哈希（含 17 份长字符串字典）均已核对；解析、引用、哈希、操作错误、轨迹溢出和本地文件链接缺口均为零。原始被排除探查继续留存，文件配对数不当作功能通过数。
