# S02 相邻列表创建与编号

状态：B03相邻关系三分支已各两轮实测；结合阶段中既有创建、首中尾及空项退出，B03标[✅]。
总进度见[阶段需求](./02-creation-and-editing.md)，开发断言见[矩阵](./02-verification-matrix.md)。

## 环境与样例

- 2026-10-14，指定飞书Chrome前台，真实平台快捷键与数字键。
- session沿用S02-1791940824848，segment=adjacent-list-and-entries-1791961343492。
- 记录段8窗口：两个SETUP和三分支各两轮；overflow=0。
- 不用文字前缀粘贴模拟独立创建，不调用编辑器内部命令或改写DOM。
- 最初整块清理引用，点击空正文占位建立新text，再创建ordered=1和后置空ordered。
- 基础列表创建和首中尾换行已在阶段需求完成，本文件只补相邻既有列表关系。
- 完整块、标记、父子、身份、选区、真实事件及历史见必要JSON。

## [✅] REQ S02 B03 008 相邻有序项独立创建

前置同父ordered=1和第二个空ordered，原外层n4275/n4294，第二项标记2.。
第二空项Enter退出为text；稳定检查点后Cmd+Shift+7重新创建ordered，真实2输入用户文字。
实际结果为两个同父ordered：第一项标记1./用户文字1，第二项标记2./用户文字2。
第二项虽经过退出和独立创建，仍接续第一项编号，没有自动重新从1开始。
原两个外层保持、第二项编辑区随text/ordered切换重建；标记独立不可编辑。
不把两个相邻DOM块说成已合并为一个外层容器，也不由相邻续号推断内部模型。
撤销三步依次移除2、退回text、恢复原第二空ordered；重做及再撤销一致。
固定前置第二轮重复相同Enter、快捷键、2与历史，不复用不同编号状态。
见[有序R1](./dom/text-b03-adjacent-ordered-create-r1.json)、[R2](./dom/text-b03-adjacent-ordered-create-r2.json)。
最初样例见[SETUP](./dom/text-setup-adjacent-list-fixture.json)，真实整块选区清理与窗口错误均保留。

## [✅] REQ S02 B03 009 相邻无序项独立创建

前置ordered=1、bullet=2、后置空bullet；前两项同父、后空项外层n4459。
空bullet Enter退出text，检查点后Cmd+Shift+8创建bullet，再真实3。
实际三个同父块ordered、bullet、bullet，文字为1、2、3，既有bullet=2保持。
后项外层n4459保持、内部区重建；两个bullet都保留各自标记和文字区。
撤销输入3、创建bullet、退出分别恢复，重做及再撤销回原空bullet起点。
两轮结构、身份角色、选区和历史一致，前面的ordered不被替换或删除。
见[无序R1](./dom/text-b03-adjacent-bullet-create-r1.json)、[R2](./dom/text-b03-adjacent-bullet-create-r2.json)。
混合前置独立通过真实创建建立，见[无序样例SETUP](./dom/text-setup-adjacent-bullet-fixture.json)。

## [✅] REQ S02 B03 010 无序中断后的有序编号

相同ordered=1、bullet=2、后置空bullet；Enter退出最后空项为text。
Cmd+Shift+7创建ordered，再真实3，实际顶层顺序ordered、bullet、ordered。
第一项实际标记1./文字1，最后项也标记1./文字3；中间bullet中断编号续接。
该结果与纯相邻ordered第二项标记2.区分，不把两类列表混合时序号一律累加。
最后项原外层n4459保持，原ordered=1和bullet=2不变；三个块同父。
撤销三步回原最后空bullet，重做恢复有序=3/标记1.，再撤销恢复，两轮一致。
见[混合R1](./dom/text-b03-mixed-adjacent-ordered-r1.json)、[R2](./dom/text-b03-mixed-adjacent-ordered-r2.json)。
R1检查点控制台粘贴未通过文字匹配守卫，没有发送Return；恢复读取后核对只已执行Enter。
工具失焦后按截图点击第三空段、真实Right，确认focusBlock=n4459，才继续快捷键和3。
恢复不改正文、不重复Enter，必要点击/按键与检查点仍包含在R1中。

## 合同与后续边界

本组三种关系均从固定同父起点测试，只有创建入口和相邻类型不同。
编号是读取真实不可编辑标记所得，不以用户文字1/2/3充当序号。
历史单位仅按这组操作与检查点观察；不推定精确合并时限或内部事务边界。
B03约定的首项、续项、空项、首尾插入及相邻关系已完成，阶段主清单只更新进度。
列表嵌套、跨父、重启编号菜单及转换矩阵继续归对应后续阶段，不宣称已全部覆盖。
保存提示不是独立重载；B07仍需持久化，B06其他格式继承与B08组合并发仍在进行。
不修改项目代码、不启动服务、不执行git；已实测需求不等于项目实现或生产验收通过。
