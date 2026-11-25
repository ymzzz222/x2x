# S02 按词与跨正文块导航

状态：B09按词移动/扩选、跨正文块、跨软换行及折叠区域导航已按约定样例两轮实测，总项标[✅]。
总进度见[总任务](../ym-research-task.md)，断言见[矩阵](./02-verification-matrix.md)。

## 环境与前置约束

- 2026-10-14，指定飞书Chrome前台，原生粘贴样例与真实平台按键。
- session=S02-1791940824848，segment=navigation-1791949659534。
- 初始唯一空text n1891/区n1894/空叶文本n1897，页标题空。
- 本记录段6个窗口：4个有效操作、1个混合前置观察、1个SETUP恢复，不按窗口数计算通过项。
- Home/End的平台等价键仅验证Cmd+Left/Right；未测实体Home/End。
- 对照使用逐键DOM Selection/selectionContext与实际文字树，不从AX焦点推测块落点。
- 早期Cmd+V双帧可以仍为旧状态，保持原样；后续按键和AX结果用于确认实际样例。

## [✅] REQ S02 B09 001 单行英文按词移动与扩选

唯一空正文粘贴 `one two`，两轮文字文本分别n1899/n1901，正文原块/区/行保持。
两次真实Option+Left落文字4、0，即two首部与one首部。
两次Option+Right落文字3、7，即one尾与two尾；空格参与分词边界但文字不变。
Cmd+Left到0，Shift+Option+Right形成anchor0/focus3的正向one范围，collapsed=false。
随后普通Right将范围折叠在文字3，Cmd+Right到7，没有越入页标题或新建段落。
这些导航只改变选区和相关视图状态，正文始终one two；末次Cmd+Z撤销样例粘贴，回原空叶文本1。

首轮早期Cmd+Right延迟快照仍是粘贴前空叶，不能把该快照描述为已经落文字尾7。
后续Option移动以及扩选后Cmd+Right的稳定文字落点已两轮核对；第二轮初始Cmd+Right也为文字7。
每轮29条mutation/26条事件，页面异常为空；mutation总量包含样例粘贴/撤销和选区视图，不能全部归因给导航。
证据：[按词R1](./dom/text-word-navigation-r1.json)、[R2](./dom/text-word-navigation-r2.json)。

验收只覆盖此英文空格样例及本平台按键；中文分词、标点、多空格、Unicode字素和自动折行没有覆盖。

## [✅] REQ S02 B09 002 跨正文块左右键与最后块Down

从唯一空正文粘贴5/LF/6，两个同父text块；在最后6块真实Cmd+Left到文字0。
Left进入前块5的文字1，Right回最后6块文字0；区与块引用随跨块落点切换，文字顺序仍5/6。
在6块文字0按Down，实际新增一个同父后置空text，并进入新空叶文本偏移1。
Up回6块文字0，Cmd+Right到文字1；尾部新增空块仍保留，导航本身没有删它。
首次有效窗口新块n1902/n1911、Down新增n1920，文字文本n1908/n1917，新空叶文本n1926。
从相同唯一空正文重新执行的窗口为R3：新块n1952/n1961，Down新增n1970，空叶文本n1976。
两次有效运行的左右/Down/Up/行尾角色和偏移一致，不能预设所有方向键都只改变Selection。

首轮Cmd+Z只移除Down新增空块，回6块文字0，原5/6两块保持。
R3补充Cmd+Shift+Z重做新增尾部空块n1977/区n1980/空叶文本n1983偏移1，身份不复用已删n1970。
再次撤销移除新空块，回6块文字0；再撤销才移除样例粘贴，回新唯一空text n1984。
证据：[首轮](./dom/text-cross-block-navigation-r1.json)、[明确空起点复测R3](./dom/text-cross-block-navigation-r3.json)。
首轮35条mutation/22条事件，R3含追加历史54条mutation/34条事件；页面异常为空。

## 混合前置观察与恢复

首轮仅撤销一次后误以为空正文已恢复，实际上仍为5/6两块；第二轮在6块文字0再次粘贴5/LF/6。
因此形成5/5/6/6四块，Down进入既有后块6而没有新增空块；此结果不能作为相同前置的第二轮。
原始输入与全部四块证据见[混合前置R2](./dom/text-cross-block-navigation-r2.json)，不抹去或计为新稳定分支。
该轮撤销只移除第二次粘贴；随后单列[空态恢复](./dom/text-setup-navigation-empty-recovery.json)撤销最初粘贴。
恢复后唯一空text n1945/区n1948/空叶文本n1951，再执行上述R3，不串入相邻用例。

## [✅] REQ S02 B09 003 同块跨软换行导航与扩选

独立SETUP真实建立同一text内两行1/2，文字文本n3749/n3756；原块n3717/区n3720保持。
两轮从第二行2尾部Cmd+Left到n3756偏移0；Left到第一行1尾n3749偏移1，Right回第二行首0。
Up到第一行文字0，Down回第二行文字0；Shift+Left形成anchor第二行0/focus第一行1的反向范围。
该范围跨逻辑软换行，AX实际选中文本为U+200B空叶标记，不能把AX返回值改写为LF或据此断言剪贴板格式。
两轮所有正文文字、块/区和两行保持，12条mutation/15条事件主要涉及选区及视图；没有新增正文块。
见[R1](./dom/text-b09-softbreak-navigation-r1.json)、[R2](./dom/text-b09-softbreak-navigation-r2.json)。
第二轮从真实Right收拢范围、Cmd+Right回第二行末端再开始，见[起点恢复](./dom/text-setup-softbreak-navigation-r2-start.json)。
最初按LF匹配AX选区被守卫拒绝，未发送收拢键；读到U+200B后才继续，不把失败当额外导航行为。

## [✅] REQ S02 B09 004 跨折叠后代导航与扩选边界

固定同父四块H1=1、text=2、H1=3、text=4，真实点击第一标题“收起”；隐藏2从当前DOM移除，后同级标题3及4保持可见。
独立点击第一标题文字并Cmd+Right到文字n4765偏移1，两轮相同折叠起点。
Down到后一H1文字n4795偏移1，Up回第一H1文字n4765偏移1；Right到后一H1文字0，Left回第一H1文字1。
四个方向均跳过隐藏正文2，未展开、修改或删除任何文字，当前可见块仍H1/H1/text。
随后Shift+Right保持第一H1尾部折叠光标，没有形成跨折叠区域范围；两轮完全一致，不改写为通常跨块扩选。
见[R1](./dom/text-b09-folded-region-navigation-r1.json)、[R2](./dom/text-b09-folded-region-navigation-r2.json)。
固定样例/真实折叠见[SETUP](./dom/text-setup-folded-region-fixture.json)，第二轮独立重定位见[起点](./dom/text-setup-fold-navigation-r2-start.json)。
之后真实点击“展开”，原text=2块n4766回当前DOM，原H1 n4745/n4775和text=4 n4796保持，见[展开恢复](./dom/text-setup-fold-navigation-unfold.json)。
本轮标题抽样为H1；未把H9不同折叠层级范围假定为同一正文结构，其他折叠组合归后续复杂结构阶段。

## 交付与未完成边界

最终唯一空text n1984/区n1987/空叶文本n1990偏移1，页标题空；active=null/connected=true/overflow=0/compositionActive=false。
已完成小项可作为复测断言；B09约定的按词、跨块、跨软换行/折叠区域完成。其他分词样例、跨平台键位及任意复杂层级不由这组推断为通用算法。
Down新增空块只覆盖当前两正文块末端、文字0的前置，不推广到空块或任意末尾偏移。
保存提示不是独立持久化验证；本轮不修改项目代码、不启动服务、不执行git或进入S03。
