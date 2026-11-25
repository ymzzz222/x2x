# S08 剪贴板载荷与粘贴合同

状态：2026-10-21，H05–H09 按已确认代表范围与限制结束研究交付。只将下列具体双轮列为已验证；拒绝环境、未测组合及项目安全验收继续单列，见[收口清单](./08-closeout-review.md)。
总范围及现场见[阶段文档](./08-deletion-movement-formatting-and-clipboard.md)。

## 1 采集范围与限制

来源为指定飞书 Chrome 研究文档，通过真实 Cmd+C/X/V 及页面输入操作。
被动监听 copy/cut/paste，只在研究操作窗口保存 text/plain、text/html、类型列表、可信标记与事件投递阶段；不读取其他类型的实际私有载荷。
每种文本最多 200000 字符，截断标记明确；未将此采集上限说成产品限制。
复制 HTML 内公开的私有元数据按真实载荷保存，不能因正文只是两个字符就认为 HTML 也仅两个字符。
DOM 标识按总约定规范化，真实 URL 和研究正文保留；不向页面写入 DOM 或调用编辑器内部命令。

本次原生复制会更新系统剪贴板；没有读取、保存或落盘研究前无关用户剪贴板内容，因而不能宣称最终恢复了原剪贴板。
控制台脚本采用原生 paste，工具会恢复调用前的剪贴板；它不同于研究中的真实 Cmd+C/X，不把工具恢复机制当作飞书能力。
clipboardData 在 capture 与 dispatch 后均读取；事件阶段先后不等价于应用内部事务顺序。
保存提示不能代替独立重载读取，后续统一补持久化证据。

## 2 REQ-S08-H05-001 局部文字复制载荷与原文保护

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
从 Alpha:0 逐键右移到 2，再 Shift+Right 两次，真实复制前为正向 Range Alpha:2→4，选中文字 ph。
两轮复制后的下一次粘贴键前，原混合正文和页标题 Title 均保持；无切除或额外正文块。

证据：[R1](./dom/H05-fragment-copy-paste-R1.json)、[R2](./dom/H05-fragment-copy-paste-R2.json)。
[初始载荷探查](./dom/H05-fragment-copy-probe.json)另存，不替代完整操作双轮。
可信 copy 事件 types 包含 docx/text、text/html、text/plain；plain 为 ph。
HTML 包含 UTF-8 meta、标记根、片段 div 与携带私有元数据的 span，isEqualBlockSelection=false、isCut=false。
事件记录 defaultPrevented=true；这是观察到的复制事件状态，不推导浏览器或系统权限配置。

两轮复制窗口正文外层和文字身份保持；本条不对复制动作执行未知历史撤销。
后续粘贴及其独立历史见下一条；复制不是可撤销的正文内容变化，不能把前一项编辑的撤销误归为复制撤销。
errors/overflow 均为空，载荷没有截断；只覆盖普通文字片段，不推断整块、折叠、批注或外部目标。

复刻验收核对真实选择范围、纯文本、HTML 语义、类型、复制后正文保持及无副作用；不要求复刻私有序列化协议或随机 ID 字面值。
私有元数据不是项目 HTML 的信任凭据，安全验收另列隔离环境项目专项。

## 3 REQ-S08-H06-001 同文档片段粘贴到正文末端

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；与上条同一运行编号，保证载荷来源和落点可对应。
真实复制 ph 后，通过当前 DOM 矩形与 AX 把光标放在 Gamma:5，Cmd+V。
paste 事件 types 为 text/plain、text/html、docx/text；plain=ph，HTML 相比 copy 事件可有浏览器包装差异，保留原始两份，不声称字节相同。

粘贴得到正文 text Gammaph:7；Gamma 外层 n1903/ID117、文字 n1909 复用，没有新增正文块或复制来源块 ID。
Alpha、编号 H1 Beta、Quote、空 bullet 与页标题保持，来源 Alpha 仍完整。
Cmd+Z 恢复 Gamma，Cmd+Shift+Z 恢复 Gammaph，再 Cmd+Z 恢复 Gamma；两轮结构、身份和文字结果一致。
实际每步焦点与选区、必要字符 mutation 保留在对应 JSON；不以首帧瞬态代替下一键前的稳定落点。
errors/overflow 均为空，未独立重载；未覆盖纯文本快捷键、多行、HTML 外部来源、选区替换和其他块类型。

复刻验收从相同片段和正文末端开始，核对文字接合、光标、目标身份、来源保护、相邻保护和完整历史。
跨文档可写目的地尚未确认，本条不能推广为跨文档粘贴已通过。

2026-10-20 后续授权更新：sir 明确允许新建一份临时飞书测试文档，完成跨文档用例后移入回收站。此授权不表示跨文档功能已经实测通过；实际文档 URL、双轮证据与回收结果后续单列。

临时文档已通过真实“创建副本”建立于我的文档库，名称 S08 Clipboard TEMP 20261020，URL 为 https://research-fixture.example/wiki/QAFixtureDocument03XXXXXXXX 。
[创建基线](./dom/H00-temp-document-created-baseline.json)与[单段 Target 建样及历史](./dom/H00-temp-target-fixture.json)分别保存。导航后重建观察器和独立会话，不沿用失联的原根节点。
跨文档双轮及身份审计完成后，已停止该页观察器并按 sir 授权移入回收站；[确认提示](./dom/H00-temp-trash-confirmation-AX.txt)显示可恢复、30 天后自动彻底删除，没有执行立即永久删除。
[回首页](./dom/H00-temp-trash-settled-AX.txt)后重新访问同一 URL，实际显示[“该文档已被删除”及“恢复”按钮](./dom/H00-temp-trash-reopen-confirmed-AX.txt)，确认回收已完成；未点击恢复。

## 4 REQ-S08-H05-002 局部文字剪切与范围历史

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；仍为正向 Alpha:2→4 的 ph，真实 Cmd+X。
证据：[R1](./dom/H05-fragment-cut-R1.json)、[R2](./dom/H05-fragment-cut-R2.json)。
可信 cut 事件提供 docx/text、text/html、text/plain，plain=ph，HTML 私有标记 isCut=true；不读取 docx/text 的私有实际载荷。
剪切后 Alpha→Ala，光标同一文字叶 n2315:2；外层 n2309/ID147 及相邻混合块、页标题保持。
Cmd+Z 恢复 Alpha 与原正向 Range 2→4，Cmd+Shift+Z 再剪为 Ala:2，再 Cmd+Z 恢复原文及范围。
文字、结构、身份、每步选区与必要 mutation 保留在同一运行，errors/overflow 均为空，载荷无截断。
本条成功写入剪贴板后发生了剪切，不证明权限拒绝时的处理，也不推断整块或引用容器剪切。
复刻验收必须同时核对剪贴板载荷与被删除的精确范围，恢复原文不等于恢复系统原剪贴板。

## 5 REQ-S08-H05-003 混合全文复制的结构与编号前缀

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
Gamma:0 连续两次 Cmd+A 选择五个顶层正文块，Cmd+C；页标题 Title 不属于可见正文选区。
证据：[R1](./dom/H05-whole-copy-paste-empty-bullet-focused-history-R1.json)、[R2](./dom/H05-whole-copy-paste-empty-bullet-focused-history-R2.json)。
复制事件类型为 docx/record、text/html、text/plain，与普通片段的 docx/text 不同。
plain 精确为 `Alpha\n1. Beta\nGamma\nQuote\n- `，末尾为空 bullet 的 `- `，没有页标题或额外末尾换行。
HTML 对应 div Alpha、ol/start=1 内 li/h1 Beta、div Gamma、blockquote 内 div Quote、ul/li 空内容；同时附公开私有元数据。
可见 HTML 正文不包含 Title，但私有元数据的页面快照可能携带页标题，不能以“可见选区排除页标题”推断载荷绝不包含页标题。
isEqualBlockSelection=true、isCut=false；仅记录公开 HTML，未解码 docx/record 实际私有类型。
复制后、粘贴前的原文、页标题、类型及原块身份保持，载荷未截断，errors/overflow 均为空。
本条不推断折叠或批注的复制范围；项目对外复制应单独制定最小元数据合同。

## 6 REQ-S08-H06-002 混合结构粘贴替换末空列表及焦点历史

状态：固定焦点步骤双轮已验证，包含立即撤销无变化的限制。来源：指定飞书 Chrome 实测。
与上条同一操作：复制五个顶层块后，真实点击唯一空 bullet 的文字区，再 Cmd+V。
原末空 bullet 被移除，新增 Alpha text、编号 H1 Beta、Gamma text、含内部 Quote text 的引用、末空 bullet；原前四顶层块及引用内部块保持。
新增五个顶层块/六个带 ID 节点与来源身份不同，不能重复来源块 ID；新 Beta 的展示编号按当前位置续为 2.，不是照贴源 1.。
正文可见文字与块类型均保留；引用作为容器仍存在，不把 plain 的一行 Quote 当作引用结构证据。

粘贴后处于全块选择的隐藏 TEXTAREA，立即 Cmd+Z 两轮均无正文变化；真实键确已投递到该隐藏输入。
随后点击页标题后 Cmd+Z，才移除所有新增块并恢复原末空 bullet；点击标题后 Cmd+Shift+Z 重建整组；再点击标题后 Cmd+Z 恢复原混合正文。
新增组每次重做重新生成身份，恢复的末空 bullet 也新建身份；原 Alpha、Beta、Gamma、引用与页标题保持。每次选区、活动元素及 mutation 见 JSON。
R2 粘贴前空 bullet n2555/168，首次新增 Alpha n2571/174、H1 n2580/173、Gamma n2597/172、引用 n2606/170、内部 Quote n2613/171、空 bullet n2625/169；最终恢复空 bullet n2717/182。

[早期历史探查](./dom/H05-whole-copy-paste-empty-bullet-history-probe.json)保留立即撤销无变化，[恢复](./dom/H00-whole-paste-recovery.json)通过实际标题聚焦后撤销完成；不将探查充作完整双轮。
长证据曾因控制台虚拟化缺失最早可见分段，已改为每批 24 段读取并完整拼接、解压和精确快照校验；未重复编辑制造证据，也未截去未见部分。
errors/overflow 均为空，未独立重载。差异 DR-S08-H06-001 已由 sir 于 2026-10-21 确认保留项目历史保护合同：粘贴后在原编辑焦点即可撤销，无需先聚焦标题；未修改实现或完成项目验收。
复刻验收区分立即撤销与主动聚焦后的恢复，核对原块保护、末空块替换、编号续排、引用结构及身份生命周期。

## 7 REQ-S08-H06-003 外部多行纯文本在正文末尾的插入

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H06-text-tail-multiline-plain-R1.json)、[R2](./dom/H06-text-tail-multiline-plain-R2.json)。
真实光标 Gamma:5，原生文本剪贴板粘贴 One 换行 Two；paste 事件只有 text/plain，plain 精确为 One\nTwo，HTML 为空。
Gamma 保持完整，随后插入独立 text One、text Two，再接原 Quote 引用；未将 One 接在 Gamma 文字末尾。
原 Gamma 外层/文字、其余混合块和页标题保持；新增两段均有新 DOM/ID，重做再次新建身份，不能重用源身份或首轮新增身份。
每次历史前主动点击页标题，Cmd+Z 移除新增两段，Cmd+Shift+Z 恢复，再 Cmd+Z 移除；这只证明明确焦点路径的历史，不宣称粘贴后隐藏选择下直接撤销成功。
点击标题会改变光标，因此下一撤销键前的标题光标不能写成粘贴后原始落点；粘贴即时及 selectionchange 证据仍保留于 JSON。
两轮 errors/overflow 均为空，未独立重载；本条不推广到单行、块中、选区替换或其他目标类型。
复刻核对真实载荷、精确目标、独立段落行为、相邻保护、身份与完整历史，不凭换行字符想当然实现首行拼接。

## 8 REQ-S08-H06-004 编号标题末尾多行纯文本

来源：指定飞书 Chrome 实测；H1/H9 各同前置双轮已验证。
证据：[H1 R1](./dom/H06-numbered-H1-tail-multiline-R1.json)、[H1 R2](./dom/H06-numbered-H1-tail-multiline-R2.json)。
H9 证据：[建样](./dom/H00-numbered-H9-paste-fixture.json)、[R1](./dom/H06-numbered-H9-tail-multiline-R1.json)、[R2](./dom/H06-numbered-H9-tail-multiline-R2.json)。
编号 1. 的 H1 Beta:4，真实粘贴仅含 text/plain 的 One\nTwo；新增独立 text One、text Two，位于 Beta 与原 Gamma 之间。
原 Beta 的 heading1、编号 1.、文字叶与外层身份保持，未将新增两段变成标题或编号项；其余正文/引用及页标题保持。
每步历史前主动点击页标题，撤销移除新增两段、重做新建恢复、再撤销移除；新增身份每次重建，原块保持。
两轮 errors/overflow 均为空，未独立重载；实际粘贴后选区与历史焦点分别见 JSON，不用点击标题后的光标替代粘贴落点。
验收核对精确文字落点、原标题级别/编号保留、插入正文类型、身份、相邻保护和已实测焦点路径的历史。
H9 同样在 Beta:4 粘贴，新 One/Two 为独立 text；原 heading9 与编号 1.、外层 n2164/ID132 保持，其他块保持，历史路径和身份重建规则相同。
H2–H8 的此共同行为仅为推断（sir 已授权抽样），不计实测；不由此推导中间级别字号或其他落点。

## 9 REQ-S08-H06-005 引用内部末端多行纯文本

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H06-quote-tail-multiline-R1.json)、[R2](./dom/H06-quote-tail-multiline-R2.json)。
光标为引用内部 Quote:5，原生粘贴 text/plain One\nTwo；Quote 保持完整，One、Two 分别新增为同一引用容器内的 text 子块，没有成为容器外顶层段落。
原 quote_container n1912/ID115、内部 Quote n1919/ID116 及其文字叶保持；新增两段具有 quote-container-render-unit class，实际父子关系见对应正文树。
原 Alpha、编号 H9 Beta、Gamma、末空 bullet 与页标题保持。
每步历史前点击页标题，撤销移除新增内部两段、重做新建恢复、再次撤销移除；原引用容器/内部 Quote 身份复用，新增段重做新身份。
errors/overflow 均为空，未独立重载；本条不推断引用中间、选区替换或跨容器粘贴。
验收同时检查容器归属、文字、类型、身份和历史，不能仅按视觉缩进或 plain 的换行数量判断结构。

## 10 REQ-S08-H06-006 外部 HTML 富格式与撤销残留

状态：同前置双轮已验证实际行为及限制。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H06-external-rich-html-residue-history-R1.json)、[R2](./dom/H06-external-rich-html-residue-history-R2.json)。
Gamma:5，通过原生 HTML 剪贴板粘贴固定 p(B/I/U/S/C/L)、h1 Head、blockquote/p Nested；具体 HTML、text/plain 与类型在 paste 事件中保存。
实际类型含 text/plain、text/html、text/rtf，仅采集前两种实际值；plain 为 BIUSCL\nHead\nNested\n。
新增独立 text BIUSCL、heading1 Head、quote_container 内 text Nested，随后另有一个空 text，再接原 Quote 引用；原 Gamma 和其他混合内容保持。
新增块均有独立新身份，标题 Head 不自动带原 Beta 的编号；来源 HTML 的块结构不能仅由 plain 重建结论。

每次历史前点击页标题：首次撤销移除富格式三组内容，却保留新空 text；重做新建恢复三组，原空 text 复用；再次撤销仍留下空 text。
最后真实点击唯一空 text 后 Backspace 移除残留，回到原混合样例。这个清理是独立内容操作，不把它说成首次撤销已经完整恢复。
R2 残留空 text n3641/ID233，在撤销/重做/再次撤销中保持；富格式首段 n3585/232，重做变 n3648/237。
errors/overflow 均为空，未独立重载。差异 DR-S08-H06-002 已由 sir 于 2026-10-21 确认保留项目历史保护合同：撤销精确恢复粘贴前的内容和结构，不残留额外空段；项目实现未验收。
[早期探查](./dom/H06-external-rich-html-history-probe.json)和[定点恢复](./dom/H00-rich-html-empty-recovery.json)保留排除，不代替完整双轮。

## 11 REQ-S08-H09-001 当前样例的实际保留白名单

状态：以下行均由上一条相同双轮证明，仅适用于固定 HTML 与当前目标；H09 研究已按[收口清单](./08-closeout-review.md)交付，未测输入及项目安全专项不计通过。

| 来源内容 | 实际输出 | 必要核对 |
| --- | --- | --- |
| strong B | span font-weight:bold | 文字 B 不变 |
| em I | span font-style:italic | 文字 I 不变 |
| u U | underline class、underline、offset 0.2em、skip-ink none | 文字 U 不变 |
| s S | strike-through class、line-through | 文字 S 不变 |
| C 的 red/yellow 行内颜色 | textHighlight/text-highlight-background 语义 class | computed color rgb(216, 57, 49)、background rgb(255, 233, 40) |
| a L 的 HTTPS URL | 链接包装及 A href=https://example.com/s08 | 文字 L 不变，不导航 |
| h1 Head | heading1 | 原文 Head，无新增编号 |
| blockquote/p Nested | quote_container 包含 text | 实际父子关系保持 |

颜色由本运行被动 computedDelivery 在新增与重做时采集，不从 class 名猜测色值；重做颜色一致但块 ID 新建。
这张表不是任意 CSS 或 HTML 标签的全局允许清单，不证明私有剪贴板数据可信、协议安全或项目 sanitizer 验收通过。
本条不覆盖任意非目标结构；其余已测降级见后文及[补充合同](./08-supplemental-contracts.md)，未测范围按收口清单保留。项目 HTML 信任边界的隔离环境安全验收属于后续项目专项；没有加载脚本或修改安全权限来制造测试。

## 12 REQ-S08-H06-007 跨文档混合结构粘贴与记录隔离

状态：完整来源→目标流程各双轮已验证。来源：两份已授权飞书文档的 Chrome 实测。
每轮重新加载原研究文档，从 Gamma 连续两次 Cmd+A 后真实 Cmd+C，再加载临时目的地，Target:6 真实 Cmd+V；导航、控制台导出所用原生 paste 会恢复其调用前剪贴板，实际 paste 载荷也与来源对应。
来源：[R1](./dom/H05-cross-document-source-copy-R1.json)、[R2](./dom/H05-cross-document-source-copy-R2.json)；目标：[R1](./dom/H06-cross-document-mixed-R1.json)、[R2](./dom/H06-cross-document-mixed-R2.json)。

来源完整保持；目标 Target 后新增 Alpha text、编号 H9 Beta、Gamma text、Quote 引用及空 bullet，目标页标题保持临时名称。
原 Target 保持，新增 Beta 编号为 1.，没有目标已有标题的续号条件；Quote 包装和内部 text 父子关系保留。
每步历史前主动点击页标题：撤销回唯一 Target，重做重建混合组，再撤销回唯一 Target；原 Target 身份保持，新增组重做新身份。
两轮 errors/overflow 均为空；本条来源与目标均曾真实加载，但没有把复制后已撤销的状态说成独立保存版本验证。

[身份审计](./dom/H06-cross-document-identity-audit.json)从必要 DOM 对照 data-record-id：两轮目标与源均无重叠，目标内部也无重复记录身份。
不同加载的 n 引用、data-block-id 是各自运行上下文，可能出现相同字面值，不能据此说成复用跨文档 DOM 或身份冲突。
真实来源和目标 URL 保留；未推断私有服务协议或把公开剪贴板元数据当作可信身份授权。
验收必须关联每轮来源复制与目标粘贴证据，检查原文保护、目标结构、编号、引用、记录隔离、历史和页标题保护；不能以副本初始内容代替跨文档实际粘贴。

## 13 REQ-S08-H07-001 外部重复 HTML 标识不覆盖原块

状态：固定真实载荷双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H07-duplicate-html-identifiers-valid-R1.json)、[R2](./dom/H07-duplicate-html-identifiers-valid-R2.json)。
Gamma:5，原生 HTML 粘贴两个 p：id 均为 s08-dup、data-block-id 均为 2，文字分别 DupA、DupB；来源 HTML 与 plain DupA\nDupB\n 由实际 paste 事件核对。
现有 Alpha 的运行期 data-block-id 也为 2，但它保持不变；新增两个独立 text，分配不同新 data-block-id 和 data-record-id，没有覆盖原块或复制外部 HTML id。
R1 首次新增 data-block-id 21/20，R2 为 25/24；相邻原内容与页标题保持，目标内记录身份无重复。
历史前点击页标题，撤销移除两段且无额外空段，重做以新身份恢复，再撤销移除；不能套用富格式引用样例的空段残留。
两轮 errors/overflow 均为空，未独立重载；不推广为私有内部剪贴板身份或任意 HTML 已经安全。
验收核对实际重复载荷、原块保护、新身份分配、段落顺序及完整历史；项目仍须独立验证自身解析与身份去重。

[错误载荷窗口](./dom/H07-external-duplicate-identifiers-R1.json)实际再次粘贴旧富格式样例，是驱动旧变量引用，保留且排除，不计本条。
[真实载荷历史探查](./dom/H07-duplicate-html-identifiers-history-probe.json)只做首次撤销，证实无残留后才执行上述完整双轮，不混为同前置结果冲突。

## 14 REQ-S08-H06-008 空无序列表接收多行纯文本

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H06-empty-bullet-multiline-R1.json)、[R2](./dom/H06-empty-bullet-multiline-R2.json)。
最后唯一空 bullet 的 U+200B 空叶:0，原生粘贴仅含 text/plain 的 One\nTwo；移除原空 bullet，新增独立 text One、text Two，不继承 • 或列表类型。
原 Alpha、编号 H9、Gamma、Quote 容器及内部块和页标题保持；新增两段身份不同于被替换空列表。
每步历史前点击页标题：撤销重建空 bullet，重做再次替换为新 One/Two，再撤销重建空 bullet；空目标的外层/ID 并不保持。
例如 R2 空 bullet n339/33 最终恢复为 n397/39，首次新段 n350/35、n359/34，其他块身份保持。
两轮 errors/overflow 均为空，无额外空 text 残留，未独立重载；不推断非空 bullet、有序列表或嵌套项。
验收核对空项精确落点、列表被替换为正文、原块保护、历史及身份重建，不能把“列表中粘贴”笼统实现为自动延续列表。

## 15 REQ-S08-H06-009 空有序列表接收多行纯文本

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测。
证据：[建样](./dom/H00-empty-ordered-paste-fixture.json)、[R1](./dom/H06-empty-ordered-multiline-R1.json)、[R2](./dom/H06-empty-ordered-multiline-R2.json)。
最后唯一空 ordered，编号 1.，零宽空叶:0，原生粘贴仅含 text/plain 的 One\nTwo；移除空编号项，新增 text One、text Two，不延续有序列表或编号。
历史前点击页标题，撤销重建空 ordered(1.)，重做新建两段正文，再撤销重建空 ordered；目标外层和 ID 每次恢复新建，其余混合块与页标题保持。
R2 原空项 n465/45 最终恢复 n523/51，首次新增 n476/47、n485/46；实际中间身份及选区见 JSON。
两轮 errors/overflow 均为空，无额外空 text 残留，未独立重载；不推断非空或嵌套 ordered，也不将此规则推广到所有剪贴板类型。
验收分别检查输入载荷、空项类型和编号、替换后的普通正文、原内容保护及历史身份。

## 16 REQ-S08-H07-002 空纯文本剪贴板不修改内容

状态：同前置及已知历史标记双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H07-empty-plaintext-paste-R1.json)、[R2](./dom/H07-empty-plaintext-paste-R2.json)。
先在 Alpha 末真实输入 Tag 作为独立历史标记，再在 Gamma:5 用原生纯文本剪贴板粘贴空字符串。
两轮均收到可信 paste，types=[text/plain]、text 为空、HTML 为空；正文文字、结构、块身份和页标题保持，没有新增空段或移除原文。
随后 Cmd+Z 移除 Tag、Cmd+Shift+Z 恢复 Tag、Cmd+Z 再移除 Tag；没有把无变化粘贴制造为一个可撤销内容操作，也没有撤销未知更早历史。
errors/overflow 均为空，未独立重载；不推断没有任何剪贴板类型、空 HTML、拒绝权限或非折叠选区的空载荷替换。
验收必须核对实际空 payload、可信事件、原文与身份保护及已知历史标记，不能仅凭工具返回成功说成粘贴了内容。

## 17 REQ-S08-H07-003 超长单行纯文本拒绝与原文保护

状态：固定载荷及历史标记双轮已验证拒绝行为，精确累计边界另测。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H07-plaintext-100001-sentinel-R1.json)、[R2](./dom/H07-plaintext-100001-sentinel-R2.json)。
先在 Alpha 末输入 Tag，再在 Gamma:5 原生粘贴 100001 个 ASCII X；实际可信 paste 的 plainLength=100001、types=[text/plain]，defaultPrevented 在 capture/dispatch 后均 true，没有正文 beforeinput 或内容变化。
被动反馈监控两轮均捕获：“该内容块的字符数超出上限（100,000），请拆分部分内容后重试”，实际 toast/role=alert DOM 文案及出现阶段保存。
原 Gamma、混合正文、页标题及块身份保持；随后撤销移除 Tag、重做恢复 Tag、再次撤销移除 Tag，无误删或重复插入。
errors/overflow 均为空，未独立重载；首次[无提示监控探查](./dom/H07-plaintext-100001-nochange-probe.json)保留，不代替双轮反馈证据。
反馈文案针对“内容块”，不能等同项目源码的单次粘贴字符串长度阈值；当前 Gamma 已含 5 个字符，尚不由本条确认 100000 载荷本身可粘贴，也不推断 Unicode 计数或全文上限。
验收同时核对真实载荷长度、产品反馈、阻止后原文/身份/历史保护；动画初始矩形不作稳定位置合同。

## 18 REQ-S08-H07-004 正文累计到 100000 ASCII 字符可粘贴

状态：同前置双轮已验证接受与历史。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H07-block-total-100000-R1.json)、[R2](./dom/H07-block-total-100000-R2.json)。
Gamma:5，原生粘贴 99995 个 X，实际 paste plainLength=99995，结果为同一 Gamma text 的 Gamma 加 99995 个 X；排除 U+200B 占位后长度精确 100000，没有上限反馈。
Gamma 外层 n38/ID4 与其原文字叶复用，未新增独立正文段；历史前滚回页标题并真实聚焦，撤销回 Gamma，重做恢复精确长串，再撤销回 Gamma。
原 Alpha、编号 H9、引用/内部 Quote、末空 ordered 与页标题在最终恢复时完整，原引用和列表 DOM 身份再次出现。
长段期间触发渲染虚拟化，位于屏幕外的引用/末空项暂时不在 body 树中；此时只能说明渲染缺省，不能说原内容被删除或数量减少。恢复后的必要树及身份已核对。
errors/overflow 均为空，未独立重载；100001 累计拒绝、Unicode/软换行口径及全文上限另测，不以该样例冻结所有计数规则。

这两份长证据仅作无损存储去重：body/title 仍使用 snapshotRef，超过 1024 字符的重复字符串使用 stringRef 和文件内 _stringDictionary；scheme 为 body-title-and-stringRef-v2。
展开 stringRef 后递归展开 snapshotRef，可精确还原规范化原对象；转换前后 normalizedCanonicalSha256 不变，另有 stringRoundtripVerified。两文件由约 3.2M 字符各降到约 0.3M 字符，未删文字、异常或 mutation。
验收读取还原后的内容及真实 payload 长度，不能以去重后的文件大小当正文长度；项目单次粘贴阈值与飞书累计块阈值分别比较。

## 19 REQ-S08-H07-005 累计 100001 字符拒绝及额外无变化撤销

状态：固定载荷、落点和明确历史焦点双轮已验证。来源：指定飞书 Chrome 实测。
证据：[R1](./dom/H07-block-total-100001-focused-R1.json)、[R2](./dom/H07-block-total-100001-focused-R2.json)。
先在 Alpha 末输入 Tag，再在 Gamma:5 粘贴 99996 个 X；载荷本身少于 100000，但累计为 100001，正文未改变，显示与上条相同“内容块”超出 100000 的真实提示。
每次历史前点击页标题：首次 Cmd+Z 不改正文，Tag 仍在；第二次 Cmd+Z 才移除 Tag，Cmd+Shift+Z 恢复 Tag，再 Cmd+Z 移除 Tag，最终混合内容及身份恢复。
只记录“额外一次无变化 Undo”的可观察链，不从 DOM 宣称存在某种内部空事务或历史栈实现；与更长 100001 载荷的前述历史表现分别保存，不平均处理。
[未完成历史探查](./dom/H07-block-total-100001-history-probe.json)与[已知标记恢复](./dom/H00-total-limit-tag-recovery.json)保留排除；有效 R1 在首次无变化后继续完成同一窗口的后续历史，R2 固定相同步骤复测。
两轮 errors/overflow 均为空，原正文、页标题及块身份保持，未独立重载。

结合累计 100000 接受双轮，只确认本环境、单行 ASCII、Gamma:5 的累计块边界；不推广 Unicode、软换行、HTML、多块分配或全文总量。
接受与拒绝的 paste 均可 defaultPrevented=true，不能单独把该标志或 beforeinput 缺省当作失败；必须同时核对内容与实际反馈。
差异 DR-S08-H07-001 已由 sir 于 2026-10-21 确认：保留项目单次 plain 字符串长度大于 100000 拒绝、全文上限配置 460000 的合同，不新增飞书累计块 100000 限制。单次入口当前读取 JavaScript 字符串 length；飞书未测 Unicode/软换行及项目全文计数口径不因此冻结，项目实现未验收。
验收包含输入前既有字符、载荷长度、接受/拒绝两端、提示、无误删/重复和真实历史差异；额外无变化 Undo 仍是独立观察，不推导项目必须新增该历史步骤，其具体分组留待 S09 核对。

## 20 REQ-S08-H05-004 混合全文剪切、载荷与重建历史

状态：同前置双轮已验证。来源：指定飞书 Chrome 实测；页标题 Title，正文为 Alpha、编号 H9 Beta、Gamma、Quote 引用及末空 ordered(1.)。
证据：[R1](./dom/H05-mixed-whole-cut-DOM-history-R1.json)、[R2](./dom/H05-mixed-whole-cut-DOM-history-R2.json)。
从 Gamma 连续两次 Cmd+A，再真实 Cmd+X；cut 提供 docx/record、text/html、text/plain，plain 精确为 Alpha\n1. Beta\nGamma\nQuote\n1. ，末尾编号空项保留前缀和空格。
HTML 私有元数据标记 isCut=true，标题文字可在元数据页面快照中出现，但可见正文选择不含页标题；不把复制载荷 isCut=false 与剪切混用。
剪切后正文 0 块，页标题保持；每步历史前点击页标题，撤销重建原混合结构，重做清空，再撤销重建。各正文块/容器及内部子块身份重新生成，不能要求恢复原 DOM 或运行期块 ID。
每步使用真实 DOM 的类型、完整文字、父块索引及页标题签名核对，不依赖可随焦点变化的原生编辑标签；实际 DOM/mutation/选区仍完整保存。
R2 最终重建 Alpha n1098/103、H9 n1107/102、Gamma n1124/101、引用 n1133/99、内部 Quote n1140/100、ordered n1152/98。
errors/overflow 均为空，未独立重载；没有制造权限拒绝，不能据成功剪切证明拒绝时安全。
[早期标签保护探查](./dom/H05-mixed-whole-cut-history-probe.json)在首次撤销后实际 DOM 已恢复，但原生标签比较报不同，保留排除；不误记为产品丢内容。
验收同时核对载荷、正文清空、标题保护、父子恢复、运行期身份和完整历史；剪贴板保留研究内容不等于恢复研究前无关系统剪贴板。

## 21 REQ-S08-H07-006 定义列表 HTML 降为连续普通文字

状态：固定非目标结构双轮已验证。来源：指定飞书 Chrome 实测；仅研究剪贴板边界，不扩展定义列表编辑功能。
证据：[R1](./dom/H07-definition-list-HTML-R1.json)、[R2](./dom/H07-definition-list-HTML-R2.json)。
Gamma:5 原生 HTML 粘贴 dl/dt Term/dd Definition；事件实际 HTML 为该结构，plain 为 Term\nDefinition\n，types 含 text/plain、text/html、text/rtf。
结果是同一 text 的 GammaTermDefinition，无新块，没有定义列表结构，也没有 Term 与 Definition 之间的换行/空格；不能按 plain 的两行宣称输出两段。
目标外层 n1124/ID101 和文字 n1130 复用；其他混合块、页标题保持。历史前点击页标题，撤销回 Gamma、重做连续文字、再撤销 Gamma。
errors/overflow 均为空，未独立重载；不推广所有非目标标签或任意 CSS。
差异 DR-S08-H07-002 已由 sir 于 2026-10-21 确认保留项目内容保护合同：DL 降级须保留可读的术语/定义边界，不接受本条无分隔拼接；未指定分隔实现，也未验收项目实际结果。
验收同时核对实际 HTML/plain、文字接合、段落类型、无分隔现象、身份及完整历史。

## 22 REQ-S08-H09-002 当前非目标结构降级表

来源：上一条同一双轮实际粘贴结果，非全局解析白名单。

| 来源结构 | 本场景输出 | 未保留的合同 |
| --- | --- | --- |
| dl 包含 dt Term、dd Definition | 在现有 Gamma 末接入 TermDefinition 普通文字 | 定义列表父子语义、两项间换行/分隔、独立块身份 |

表中只登记实际测试的 dl/dt/dd，不用它代替表格、代码、图片等其他来源的边界，也不表示项目 HTML 安全验收已经完成。

## 23 REQ-S08-H05-005 折叠父项跨引用范围复制包含隐藏子项

状态：固定选区双轮已验证，与下一节共享实际操作证据。
证据：[R1](./dom/H05-folded-parent-through-quote-copy-plain-paste-R1.json)、[R2](./dom/H05-folded-parent-through-quote-copy-plain-paste-R2.json)。
前置为混合正文中新增的有序 IndentParent，内有 a.IndentChild；[真实折叠建样](./dom/H00-folded-list-copy-fixture.json)后子项退出渲染树。
Parent:0 起点，真实 Shift 点击引用开头，应用实际将终点放在引用关闭 SPAN:1，选中整个 Quote 容器；不能写成 Quote 文字偏移 0。
真实 Cmd+C 取得 docx/record、text/html、text/plain，纯文本为 `1. IndentParent\n  1. IndentChild\nQuote`，HTML 长 5768。
隐藏子项包含在载荷中，纯文本使用缩进加 1. 前缀，与此前可见 a. 标记不同；不把纯文本前缀当作原视觉编号的逐字镜像。
复制前后文字、渲染结构、类型和必要样式摘要一致，原父块、引用及其余邻居身份保持；未单独使用哨兵判定复制是否占用无变化历史步。
[选区探查](./dom/H05-folded-parent-range-copy-probe.json)保留实际范围定位；[块菜单悬停探查](./dom/H05-block-menu-hover-probe.json)未建立可靠菜单且未复制，保留排除。
errors/overflow 均为空；尚未验证批注清理，不能将该来源扩大为批注标记已清除。

## 24 REQ-S08-H06-010 实际纯文本粘贴仍可生成编号结构

状态：固定来源和目标双轮已验证，证据同第 23 节。
来源为上述实际 Cmd+C；目标 Gamma:5，真实 Cmd+Shift+V。
两轮 paste 事件均只有 text/plain，HTML 为空，不含 docx/record；载荷精确为上述三行。
Gamma 保持原文字和身份，其后新增顶层 ordered IndentParent、顶层 ordered IndentChild 及普通 text Quote。
两项编号均为 1.，子项的缩进和父子关系没有保留；原引用结构也不保留。这里纯文本入口仍识别编号行，不能笼统断言纯文本粘贴一定只生成 text 块。
例如 R2 首次新增 ID132/131/130，Redo 新建 ID135/134/133；原折叠来源 ID123 和原引用 ID99/100 保持。
明确页标题焦点后 Undo 移除新增三块、Redo 恢复同语义新身份、Undo 回到原折叠来源，未留下额外空段。
每步完整必要 DOM、范围和 clipboard 记录均保留；errors/overflow 为空，未独立保存读取，不推广所有 Markdown 识别语法。

## 25 REQ-S08-H05-006 折叠父项跨引用范围剪切与历史

状态：无额外折叠检查动作的固定序列双轮已验证。
证据：[R1](./dom/H05-folded-through-quote-cut-valid-R1.json)、[R2](./dom/H05-folded-through-quote-cut-valid-R2.json)；R1 的[重新折叠前置](./dom/H00-folded-cut-valid-R1-fixture.json)独立保存。
选区与第 23 节相同，实际 Cmd+X 载荷含同一三行纯文本及 docx/record、text/html；HTML 长 5769。
剪切后父块 ID123 保留为空 ordered，原 Quote 容器及其文字退出正文；末空 ordered 保持，出现两个空有序项。
一次明确页标题焦点 Undo 恢复 Parent 文字、原折叠状态和引用，Redo 再剪切，Undo 再恢复；有效序列的全文结构与样式摘要精确返回原前置。
父块外层保持，引用与被删除后恢复的内部节点重建；例如 R2 引用父/子由 ID142/143 经 Undo 145/146，最终为 148/149，不能声称全身份恢复。
[附加折叠检查探查](./dom/H05-folded-cut-stale-fold-check-probe.json)在剪切后点过残留折叠入口，随后首次 Undo 无可见内容变化、第二次 Undo 恢复展开来源；因多一个视图动作，保留排除。
该探查不能作为“单独剪切导致 Undo 丢失折叠态”的证据；有效 R1/R2 已无该附加动作并恢复折叠。
[独立展开回读](./dom/H00-post-cut-hidden-child-readback.json)实际显示恢复后的 a.IndentChild（n13578/ID150）仍在 Parent 内，随后 Undo 回到折叠基线，不能仅凭恢复后的隐藏 DOM 断言子项存在。
errors/overflow 均为空，本运行未独立重载；运行结束时保留的临时父子列表已在阶段收尾清理，最终保存读取与清理见[收尾记录](./08-persistence-and-cleanup.md)。

## 26 REQ-S08-H09-003 本次纯文本入口的保留与降级

| 实际来源 | Cmd+Shift+V 结果 | 边界 |
| --- | --- | --- |
| 折叠隐藏的 IndentChild | 文字可见且完整 | 来自实际复制载荷，不以当前渲染树缺失推断未复制 |
| 编号前缀 1. 与缩进 | 生成两个顶层 ordered，均显示 1. | 本次两行被识别为编号结构，原父子关系未保留 |
| Quote 引用文字 | 生成普通 text Quote | 原引用容器不保留 |
| HTML 与内部记录类型 | paste 事件未提供这些类型 | 不据此推断所有浏览器或快捷键均如此 |

以上只覆盖第 23–24 节固定样例；HTML 安全、协议拒绝与批注清理仍须各自证据或明确环境边界。

## 27 REQ-S08-H06-011 正文中间选区多行替换后直接续写

状态：连续条件的有效双轮为 R2/R3；较长间隔的 R1 另列历史观察。
证据：[R2](./dom/H06-Gamma-middle-range-multiline-continue-R2.json)、[R3](./dom/H06-Gamma-middle-range-multiline-continue-R3.json)。
前置为原混合正文、普通字重 Gamma，精确选中 Gamma:1→4 的 amm；Cmd+V 键前 Range 与 Undo 恢复范围共同核对。
通过原生文本粘贴真实送达 One\nTwo，paste 载荷只有 text/plain、HTML 为空；不包含 docx/record，不冒充内部富文本粘贴。
粘贴后仅作原生 AX 读取，不打开控制台或重定位光标，直接输入 Z；paste 事件到 Z keydown 两轮均约 0.604s，包含原生工具及读取开销。

目标变为四个顶层 text：G、One、TwoZ、a；不是 GOne / TwoZa 两段，未选前缀和后缀分别保留为独立段。
原 Gamma 外层 n1124/ID101 继续承载 G，新建 One、Two 和后缀 a；可见数据块节点由 7 变 10，引用父子分别计数。
Z 键前光标为 Two:3，输入后 TwoZ:4；TwoZ 计算样式为普通字重 400、16px，颜色及装饰默认。
R2 首次新增 One/Two/a 为 ID162/161/160，重做为 ID165/164/163；R3 首次 ID168/167/166，重做为 ID171/170/169。
这说明新增节点在重做时重新生成身份；原 Gamma ID101、Alpha ID120、Beta ID102、折叠父项 ID123、引用 ID148/149 和末空 ordered ID109 保持。

两轮一次明确标题焦点 Undo 同时撤回粘贴与 Z，恢复 Gamma 及 amm 的 Range 1→4，没有附加空段；一次 Redo 再现四段和 TwoZ:4，再 Undo 恢复。
R2 首次 Undo 的 phase 名仍为 undo-typing，但实际已撤回两项；守卫停止了原先设想的第二次 Undo，没有撤销已知前置以外内容。
主观察器 errors/overflow 为空，尚未独立重载。原生粘贴工具的临时载荷恢复不等于恢复本阶段开始前未知的用户剪贴板。
本组 before-paste 样本读取时产品已经插入 Two，该字段名不能证明早于产品处理；源选择以实际 Cmd+V 键前记录为准。

复刻验收：固定同一来源、精确选区与连续步骤，核对四个独立段、前后缀、可信纯文本载荷、续写位置/样式、身份生命周期、相邻保护及实际一步历史。
只覆盖普通正文中间的该部分 Range，不推广单光标中插、H1/H9/列表/引用范围替换或所有粘贴结构。

## 28 OBS-S08-H06-012 较长间隔时粘贴与续写分开撤销

[R1](./dom/H06-Gamma-middle-range-multiline-continue-R1.json)得到相同四段和普通 TwoZ，但 paste 到 Z keydown 实际相距 2.454s。
一次 Undo 只移除 Z，保持 G、One、Two、a；第二次 Undo 才恢复 Gamma/amm Range，依次两步 Redo 可再现，最终两步 Undo 精确恢复原正文。
R1 的原生 AX 读取耗时与连续 R2/R3 不同，不作为同历史粒度配对；未对该较长间隔条件重复第二轮。
这不是内容随机丢失，也不足以断定时间是唯一分组因素或给出精确合并阈值；后续 S09 分别固定节奏再研究。
## 29 REQ-S08-H06-012 编号 H9 中间选区的多行纯文本替换

状态：固定前置的有效 R2/R3 及完整 Undo/Redo/Undo 已验证。
证据：[R2](./dom/H06-numbered-H9-middle-range-multiline-R2.json)、[R3](./dom/H06-numbered-H9-middle-range-multiline-R3.json)。
来源为编号 1. 的 H9 Beta，原生 AX 精确选择中间 et，真实 Cmd+V 前为 Beta:1→3 的 Range。
原生粘贴的可信 paste 事件仅有 text/plain=`One\nTwo`，HTML 为空；没有通过正文 DOM 写入或内部命令产生结构。
结果依次为编号 H9 B、普通 text One、普通 text Two、普通 text a，然后是原 Gamma；共 7→10 个可见数据块。
原 H9 外层 n1107/ID102 保持类型与编号，只保留前缀 B；后缀 a 另成普通段，不继承 H9 或编号。
One、Two 也为顶层普通正文，不与前缀或后缀拼接；粘贴后光标在 Two:3。
单次 Undo 恢复完整 Beta 及 et:1→3 的 Range，单次 Redo 重现四段结果及 Two:3，再 Undo 恢复。
R2 新增 One/Two/a 的 ID 为 201/200/199，Redo 重建为 204/203/202；R3 为 207/206/205，Redo 重建为 210/209/208。
Alpha ID120、Gamma ID179、折叠列表父项 ID123、引用父子 ID187/149、末空 ordered ID191 及页标题保持。
两轮主观察器 errors/overflow 为空；未独立保存重载，不推广 H1、普通标题、列表或其他范围的行为。
复刻验收固定编号 H9、精确中间 Range 和实际纯文本载荷，核对前缀保留、三个新普通段、身份与邻块保护、光标及完整历史。

## 30 H9 替换的异常前置与恢复

[首轮探查](./dom/H06-numbered-H9-middle-range-multiline-extra-empty-probe.json)操作编号仍保留原 R1，但其粘贴前已有额外末空 text，8→11 节点，不能与正式 7→10 的 R2/R3 配对。
该额外空段在前一清理结束与本轮 begin 之间出现，来源未确定；不能归因于粘贴，也不归为本需求稳定行为。
探查已完成三步历史恢复到其 8 节点前置；通道超时发生在导出末段，重连确认已完成后仅重新导出，没有重复内容操作。
[定点清理](./dom/H00-H9-range-extra-empty-cleanup.json)仅真实删除额外末空 text，恢复 7 节点混合基线后才开始正式轮次。
期间曾出现 ScreenCaptureKit -3811 捕捉错误，随后原生 AX/截图恢复；属于工具通道记录，不作为产品拒绝。
## 31 REQ-S08-H06-013 引用内中间选区的多行纯文本替换

状态：同前置 R1/R2 及 Undo/Redo/Undo 已验证。
证据：[R1](./dom/H06-quote-middle-range-multiline-R1.json)、[R2](./dom/H06-quote-middle-range-multiline-R2.json)。
原生 AX 精确选择 Quote 中间的 uot，实际 Cmd+V 前为 Quote:1→4 的 Range；可信 paste 载荷仅 text/plain=`One\nTwo`、HTML 空。
结果为同一引用容器内的四个 text 子段 Q、One、Two、e；前缀、两行载荷与后缀分别成段，均未提升到顶层。
可见数据块由 7 增至 10，引用父块 n20484/ID187 和原子块 n13598/ID149 保持，原子块只保留前缀 Q。
粘贴后及 Redo 后的光标为 Two:3；单次 Undo 恢复 Quote 及 uot:1→4 Range，再 Redo 复现四段，再 Undo 恢复。
R1 新增 One/Two/e 的 ID 为 213/212/211，Redo 重建为 216/215/214；R2 为 219/218/217，Redo 重建为 222/221/220。
引用外 Alpha、编号 H9 Beta、Gamma、折叠列表父项、末空 ordered 和页标题保持；两轮 errors/overflow 为空。
复刻验收固定单段引用及中间 Range，核对全部新增段仍属原引用、前后缀拆段、原身份与邻块保护、光标及完整历史。
未独立重载，不推广引用内跨段范围、空引用或嵌套引用；原生 UI 被切到其他标签时曾在开始前停止，切回指定 URL 并核对监控后才执行。
## 32 REQ-S08-H06-014 非空有序项中间选区的多行替换

状态：同前置 R1/R2 及完整历史已验证。
证据：[R1](./dom/H06-ordered-middle-range-multiline-R1.json)、[R2](./dom/H06-ordered-middle-range-multiline-R2.json)。
[建样](./dom/H00-ordered-Gamma-range-paste-fixture.json)真实 Cmd+Shift+7 将 Gamma 转为顶层 ordered，显示 1.，后方原折叠 IndentParent 连为 2.。
原生 AX 选择 Gamma 中间 amm，真实粘贴前 Range 为 1→4；可信 paste 载荷仅 text/plain=`One\nTwo`、HTML 空。
结果为 ordered G、text One、text Two、text a；新增三段均为顶层普通段，未继承列表类型，原 G 保留编号 1.。
后方 IndentParent 仍显示 2. 且保持折叠，没有因插入普通段自动重启本轮原有编号；不将此观察推广为所有断开列表的规则。
可见节点 7→10；目标 Gamma 外层 n20252/ID179 在替换及历史间保持 ordered，原前后兄弟和页标题保持。
单次 Undo 恢复 Gamma 及 amm:1→4 Range，Redo 重现四段及 Two:3 光标，再 Undo 恢复。
R1 新增 One/Two/a 的 ID 为 225/224/223，Redo 重建为 228/227/226；R2 为 231/230/229，Redo 重建为 234/233/232。
R2 粘贴后的控制取样超时，重连读到操作仍 active、只有 before 样本，随后只补取实际结果，没有再次粘贴。
两轮主观察器 errors/overflow 为空；未独立重载，不推广无序项、嵌套项或剪贴板 HTML。
[清理](./dom/H00-ordered-Gamma-range-paste-fixture-cleanup.json)在两轮最终恢复后一次已知 Undo 撤销列表建样，Gamma 回普通正文、IndentParent 回编号 1.，精确恢复混合基线。
复刻验收固定原列表编号和后继列表项，核对前缀类型、载荷/后缀新段、邻项编号与折叠、身份和完整历史。
## 33 REQ-S08-H06-015 编号 H1 中间选区的多行纯文本替换

状态：同前置 R1/R2 及 Undo/Redo/Undo 已验证；H9 对照见第 29 节，不把两个级别当成互相复测。
证据：[R1](./dom/H06-numbered-H1-middle-range-multiline-R1.json)、[R2](./dom/H06-numbered-H1-middle-range-multiline-R2.json)。
[建样](./dom/H00-numbered-H1-middle-range-paste-fixture.json)真实 Cmd+Option+1 将原编号 H9 Beta 转为编号 H1；原外层身份和编号保持。
固定 Beta 中间 et:1→3 Range，原生纯文本粘贴 One\nTwo，实际可信 paste 仅 text/plain、HTML 空。
结果为编号 H1 B、普通 text One、普通 text Two、普通 text a，可见块由 7 增至 10；原 H1 外层仍保留，前后缀没有与载荷拼接。
两轮 Undo 均恢复编号 H1 Beta 和 et:1→3 Range；Redo 重现四段及 Two:3 光标，再 Undo 恢复。
新插入三块在 Redo 时重建身份；原 Alpha、Gamma、折叠有序父项、引用父子、末空 ordered 和页标题保持。
两轮主观察器 errors/overflow 为空，未独立重载，不推广 H2–H8 为实测或其他剪贴板类型。
[清理](./dom/H00-numbered-H1-middle-range-paste-fixture-cleanup.json)一次已知 Undo 撤销 H1 建样，恢复编号 H9 和原混合结构签名。
复刻验收同时核对 H1 类型及编号、精确 Range、实际载荷、前缀/载荷/后缀拆段、邻块身份和完整历史。
## 34 REQ-S08-H05-007 带批注文字的复制载荷与粘贴隔离

状态：固定同一已发布批注、同一文字范围和落点的 R1/R2 及粘贴历史已验证。
sir 已明确授权提交“S08 临时批注”并测完解决；[建样](./dom/H00-comment-copy-fixture.json)仅在 Alpha 全文上创建该批注。
证据：[R1](./dom/H05-commented-Alpha-copy-paste-R1.json)、[R2](./dom/H05-commented-Alpha-copy-paste-R2.json)。
原 Alpha 的 span 含 text-comment、comment-id-7698926776193387551；真实 Cmd+C 前精确选择 Alpha:0→5。
可信 copy 的类型为 docx/text、text/html、text/plain，plain=Alpha，不包含批注文字；两轮复制后正文及原批注保持。
复制 HTML 长 1410 字符，可见 ace-line 中只有 Alpha，没有批注高亮 span；但 data-lark-record-data 私有记录的 Attrib 中仍含该 comment-id。
真实 Cmd+V 的 HTML 长 1432 字符，增加浏览器 meta 包装，私有字段仍含原批注 ID；不能把“可见 HTML 无批注样式”写成“全部载荷批注元数据已清除”。
目标 Gamma:5 粘贴后为同一普通段 GammaAlpha，公开 text-editor 中未见 comment-id 标记，侧栏没有新增测试批注副本；原 Alpha 仍有原批注标识。
单次 Undo 恢复 Gamma，Redo 再为 GammaAlpha，再 Undo 恢复；原 Alpha、Gamma 外层、邻块、页标题及来源批注保持。
两轮主观察器 errors/overflow 为空。只覆盖同文档、正文文字 Range，不推广整块、剪切、跨文档或私有序列化机制。
复刻验收分别核对普通文字、可见 HTML、私有元数据和实际目标批注隔离；私有字段不是项目 HTML 的信任凭据，也不要求项目复制其协议。
[解决清理](./dom/H00-comment-copy-fixture-resolve.json)通过卡片的“解决并隐藏”按钮完成，侧栏显示评论（0），随后收起侧栏，原混合结构签名恢复。
解决后原文字 span 仍保留 text-comment/comment-id 类，不把“已解决”声称为 DOM 标识全部删除；未执行未知 Undo 来清理该记录。
测试批注保留为可恢复的已解决记录；正文最终清空与独立保存读取已完成，见[最终收尾](./08-persistence-and-cleanup.md#9-继续执行后的最终收尾)。
