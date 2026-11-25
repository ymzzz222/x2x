# S02 分段与软换行格式继承

本组补齐B06在目标类型中的加粗继承，属于基本编辑，不替代后续完整格式阶段。
普通文字与各类型首中尾、空态退出已由阶段文档及标题/引用补测记录。
本组统一固定已有单字符加粗，光标段尾；真实Enter或Shift+Enter后输入9。
每类型、每操作各两轮，H2–H8只按sir授权推断共同规则，不逐级重复。

## 样例与动作

样例来自两次重载后八个记录的复合文档，不另建项目功能代码。
首段1/7、另一个H1=8、未操作的列表及引用保持原位置。
H1=2、H9=3、bullet=4、ordered=5、引用内text=6分别用真实范围加粗。
每次先选中精确单字符，范围守卫匹配后才发送Cmd+B；Right收拢到段尾。
所有观察器只读DOM及记录事件，不调用业务编辑方法。

| 固定样例 | 证据 |
| --- | --- |
| H1加粗源 | [SETUP](./dom/text-setup-h1-bold-fixture.json) |
| H9加粗源 | [SETUP](./dom/text-setup-h9-bold-fixture.json) |
| 无序加粗源 | [SETUP](./dom/text-setup-bullet-bold-fixture.json) |
| 有序加粗源 | [SETUP](./dom/text-setup-ordered-bold-fixture.json) |
| 引用加粗源 | [SETUP](./dom/text-setup-quote-bold-fixture.json) |

## [✅] REQ S02 B06 008 标题两端分段与加粗继承

H1=2、H9=3加粗均为字重700；段尾Enter生成后置普通text，9没有加粗行内样式。
新正文默认字重400，原标题加粗字符与记录保持；未把加粗继续到新段。
Shift+Enter在原heading块内新增逻辑行，9没有加粗行内样式，恢复标题默认字重500。
原行的2或3继续保留font-weight:bold，不能通过整体清除样式实现续写默认值。
H2–H8的同一共同规则为推断（sir已授权抽样），不计实测数量。

## [✅] REQ S02 B06 009 列表续项与软换行的加粗继承

bullet和ordered段尾Enter都新增同类型同父项，原加粗字符不变，新9无加粗行内样式。
ordered原标记1.，新项按已有续号合同生成2.；身份和标记见各窗口DOM。
Shift+Enter只在原项新增逻辑行，9无加粗行内样式，保持该类型默认字重400。
撤销新增项后原有下一个异类型块保持，不把列表样例与相邻块意外合并。

## [✅] REQ S02 B06 010 引用内分段与软换行的加粗继承

引用内加粗6段尾Enter新增同容器下的text，9为普通字重400，容器继续保持。
Shift+Enter在同一子text中新增逻辑行，原6加粗保持，第二行9没有加粗行内样式。
本组不是引用退出；不向容器外插入新段，不改动引用前的有序列表。

## 两轮证据

| 类型与操作 | 第一轮 | 第二轮 |
| --- | --- | --- |
| H1 Enter | [R1](./dom/text-b06-h1-bold-enter-r1.json) | [R2](./dom/text-b06-h1-bold-enter-r2.json) |
| H1 Shift+Enter | [R1](./dom/text-b06-h1-bold-softbreak-r1.json) | [R2](./dom/text-b06-h1-bold-softbreak-r2.json) |
| H9 Enter | [R1](./dom/text-b06-h9-bold-enter-r1.json) | [R2](./dom/text-b06-h9-bold-enter-r2.json) |
| H9 Shift+Enter | [R1](./dom/text-b06-h9-bold-softbreak-r1.json) | [R2](./dom/text-b06-h9-bold-softbreak-r2.json) |
| 无序 Enter | [R1](./dom/text-b06-bullet-bold-enter-r1.json) | [R2](./dom/text-b06-bullet-bold-enter-r2.json) |
| 无序 Shift+Enter | [R1](./dom/text-b06-bullet-bold-softbreak-r1.json) | [R2](./dom/text-b06-bullet-bold-softbreak-r2.json) |
| 有序 Enter | [R1](./dom/text-b06-ordered-bold-enter-r1.json) | [R2](./dom/text-b06-ordered-bold-enter-r2.json) |
| 有序 Shift+Enter | [R1](./dom/text-b06-ordered-bold-softbreak-r1.json) | [R2](./dom/text-b06-ordered-bold-softbreak-r2.json) |
| 引用 Enter | [R1](./dom/text-b06-quote-bold-enter-r1.json) | [R2](./dom/text-b06-quote-bold-enter-r2.json) |
| 引用 Shift+Enter | [R1](./dom/text-b06-quote-bold-softbreak-r1.json) | [R2](./dom/text-b06-quote-bold-softbreak-r2.json) |

## 历史、身份与验收

每轮八个真实键依次为换行、9、撤销9、撤销换行、重做换行、重做9、撤销9、撤销换行。
逐键被动快照保留逻辑行、文字、显式样式、记录身份、父类型、选区和必要mutation。
Python对20轮逐项断言：八步齐全，撤销换行与最终恢复等于起点，重做结构与文字等于首次结果。
同时断言新9没有加粗行内样式、硬分段新增一个合法目标块、软换行不增加块。
最终所有原有块的记录ID、文字、显式格式和父类型与该轮起点一致。
H1软换行R2重做字符后原生显示菜单失效，取消菜单并恢复只读查询确认2/9，再继续恢复。
该次失败没有重复发送重做键；原始步骤、额外恢复checkpoint与事件保留，不隐藏控制波动。
未把两轮功能成功当作性能或其他输入法覆盖；链接、颜色等完整属性组合按后续格式阶段处理。
B06约定的基本分段、软换行、退出、代表性格式继承和组合Enter范围已完成。
