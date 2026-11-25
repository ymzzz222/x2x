# S02 组合输入期间的类型快捷键

状态：[✅] B08完成；基本组合、H1/H9快捷键和远端输入均已各两轮实测，保留环境及记录限制。
基本确认/取消/Enter/Backspace见[阶段需求](./02-creation-and-editing.md)，断言见[矩阵](./02-verification-matrix.md)。

## 环境与有效性条件

- 2026-10-14，指定Chrome/macOS，session=S02-1791940824848。
- 本组最终固定唯一空text n5083/区n5086，原空叶文本n5089。
- 每轮开始n的keydown尚未组合，随后有真实compositionstart/update。
- i及类型快捷键keydown均isComposing=true；通过对应运行events/globalKeys核对，不只看最后compositionActive。
- 操作期间不打开控制台，直到快捷键及Space完成才只读导出。
- 输入源名称/品牌没有独立确认；仅证明本次实际中文组合链。
- compositionstart/update真实标志为true，compositionend实际为false，原因未知，保留原始值。
- 本段19个窗口包含试探、失败、清理及四个有效固定空态运行；overflow=0，不按窗口数计算通过率。

## [✅] REQ S02 B08 004 组合中的H1快捷键

空正文真实n、i形成临时ni，Cmd+Option+1的可信keydown为key=¡/code=Digit1/isComposing=true。
实际compositionupdate变为你¡，compositionend提交你¡；块保持text，没有创建heading1。
后续Space的isComposing=false，作为普通空格输入，最终用户文字为你¡空格。
两轮原块/区和哨兵保持，新增普通文字叶，光标有效；不把类型快捷键当成正常H1转换。
第一次撤销只移除后续空格，第二次撤销移除整个组合提交你¡，回原空叶。
重做两次恢复你¡空格，再撤销两次恢复同一空起点，不逐字符恢复临时n/i。
见[H1 R1](./dom/text-b08-empty-composition-heading1-r1.json)、[R2](./dom/text-b08-empty-composition-heading1-r2.json)。
有效运行编号与早期非空失败编号分开，不能用普通输入的H1转换作第二轮。

## [✅] REQ S02 B08 005 组合中的H9快捷键与实际差异

相同空起点真实n、i；Cmd+Option+9的可信key=ª/code=Digit9/isComposing=true。
实际compositionupdate/end保持并提交ni，没有插入ª或你，块保持text，没有创建heading9。
随后Space为普通用户空格，最终ni空格；两轮文字、类型、事件顺序及历史一致。
撤销空格后为ni，再撤销回原空叶；重做两次回ni空格，再撤销两次恢复空态。
见[H9 R1](./dom/text-b08-empty-composition-heading9-r1.json)、[R2](./dom/text-b08-empty-composition-heading9-r2.json)。
R2开头工具焦点未恢复，重新只读确认空态并点击正文、Right后才输入n/i；该Right不是组合内容。
H1与H9共同保持text，但组合提交内容不同；不能按标题共同行为把你¡和ni平均成同一结果。
H2–H8仅对组合中不执行标题转换的共同规则作推断（sir已授权抽样），不推断输入法提交文字。

## 输入源试探与失败保留

早期普通输入未出现composition事件，不计组合快捷键通过。
见[非空R1](./dom/text-b08-composition-heading1-r1.json)、[R2](./dom/text-b08-composition-heading1-r2.json)、[R4](./dom/text-b08-composition-heading1-r4.json)。
非空R3曾捕获真实组合及你¡空格，但恢复期间失焦，最终不用该轮作为固定空起点重复，见[非空R3](./dom/text-b08-composition-heading1-r3.json)。
输入源候选核对见[候选探针](./dom/text-b08-ime-source-candidate-probe.json)与[正文直接切换探针](./dom/text-b08-empty-ime-direct-source-probe.json)。
空态普通Ni空格及大小写尝试原样保留，见[普通探针](./dom/text-b08-empty-ime-source-probe.json)、[大小写探针](./dom/text-b08-empty-ime-caps-probe.json)。
Ni普通输入存在额外首字母大小写历史：三次撤销仅回n，读取后才第四次撤销空态，不继续猜测次数。
系统输入源菜单读取超时，没有取得品牌或设置内容，不因此伪造已切换为某一命名输入法。
后续有效性只以真实composition链、快捷键的isComposing及最终块/文字判断。

## 未通过的远程组合窗口

R1在Chrome真实n/i组合后，辅助夸克同页输入3，主端出现3ni。
随后打开控制台打断组合环境；本地Space没有有效的组合标志，不能作为组合中远程后的确认行为。
部分本地撤销曾保留远程3，但后续重做内容来源和时序未形成稳定重复，不据此收口协同隔离。
原始事件和该限制见[远程R1](./dom/text-b08-composition-remote-r1.json)。
R2已开始真实组合，但辅助窗口截图报SCK-3811，未执行有效远程3。
恢复控制台再次干扰组合，见[远程R2](./dom/text-b08-composition-remote-r2.json)。
两轮均不计矩阵通过项；后续从固定空态重测，不在组合建立与确认之间打开控制台。
切窗的真实focus/composition链必须保留，不能把失焦提交后的输入算作组合并发。

## [✅] REQ S02 B08 006 组合期间远端输入、确认与本地历史

2026-10-15，主端Chrome session=S02-1792027200893，辅助夸克为同一指定飞书文档。
固定唯一空text，业务记录CwC6dPsl3oZYrNxXUKtcLC75nSe；sir人工准备中文拼音输入源。
主端真实n/i建立临时ni，辅助端真实数字3，随后主端Space确认；此段不打开任一控制台。
两轮主端keydown均n/isComposing=false、i和Space/isComposing=true，没有本地数字3按键。
辅助端独立捕获可信3及beforeinput/input；主端compositionupdate最终为你、compositionend为你。
主端临时叶从U+200B+ni变为U+200B+你，组合结束后为你+U+200B，再呈现3你+U+200B。
两轮完整compositionTimeline均表明数字3在compositionend之后才出现在主端正文DOM。
因此只确认组合期间远端已输入、主端结束组合后呈现远端文字，不从DOM推断接收时刻、队列或内部同步协议。
R1还独立读取辅助端3你；两轮主端一次撤销为3、重做为3你、再撤销为3，远端数字保留。
两轮历史恢复后辅助独立快照均为3，与主端相同；R2没有确认瞬间的辅助3你独立快照，不补写该中间读数。
原text记录、类型、父级和唯一正文结构保持；空格用于确认，没有新增普通空格或段落。
主端见[控制R1](./dom/text-b08-remote-composition-controlled-r1.json)、[R2](./dom/text-b08-remote-composition-controlled-r2.json)。
辅助端见[独立记录R1](./dom/text-b08-remote-composition-controlled-peer-r1.json)、[R2](./dom/text-b08-remote-composition-controlled-peer-r2.json)。
辅助完整快照在主端历史恢复为3之后采样；输入时正文见peerSteps/events，不把后采样快照当成组合时截图。

本会话累计mutation数组已达3000上限，两个有效窗口changes为空，不能当成没有DOM变化。
通用audit也已溢出，R1/R2的auditOverflow累计为492/520；export总overflow最终为800。
本组依据独立未溢出的compositionTimeline（27/23条、各overflow=0）、真实组合events、globalKeys、逐键steps和双端快照验收。
完整n/i/Space及三次本地历史共六个按键、五个composition事件均保存；两轮errors/console为空。
不宣称本组已取得逐条原生mutation或完整外围焦点审计；后续复测应按组重新初始化有界监听。
无组合的输入源校准见[首轮](./dom/text-setup-remote-ime-calibration.json)、[次轮](./dom/text-setup-remote-ime-calibration-r2.json)，不计通过。

## [✅] 样例与环境恢复

远端真实选中最后数字3并删除，两端最终恢复同一唯一空text，页标题空。
恢复见[最终窗口](./dom/text-setup-s02-final-restoration.json)，不增加删除行为通过分支。
主端destroy和辅助端stop均返回成功，active/辅助label清空，控制台关闭。
ChatGPT扩展快捷键已恢复原绑定；此前人工开启的夸克Apple事件JavaScript已执行一次菜单切换关闭。
该开关原生AX未暴露勾选值、菜单截图不可用，关闭动作已执行，但没有独立读取关闭值，不伪称设置值已复核。
后续菜单点击导致的失焦/提交需单独记录，快捷键结果不推广到全部入口或其他输入法。
保存提示不等于独立持久化；不修改项目代码、不启动服务、不执行git。
