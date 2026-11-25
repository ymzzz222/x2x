# S06 证据索引与审计

状态：最终证据审计；完成范围及清理结果见主文档。

当前 dom/ 中有 360 份 JSON。文件数、按键数和 mutation 数不作为通过用例数。
来源为指定 Chrome 页面的原生操作及只读 DevTools 观察；夸克仅辅助独立读取及必要远程修改。
阶段规则、有效双轮选择和失败边界见[主文档](./06-numbering-folding-and-outline.md)。

## 审计范围

- 全部 JSON 可解析，SHA-256 依据当前文件字节计算。
- 352份含正文DOM快照；其余为辅助记录，按evidenceKind区分清理、菜单与访问拒绝，不把缺state解释为空正文。
- 同会话重复seq核对内容一致后去重；检查已有快照的根连接、指定URL及已捕获持久ID的唯一性。
- 20份早期文件含共156条累计按键条目，缺before快照；不套用后期逐键断言，也不把累计条目数当独立按键数。
- 八按键双轮按前置快照核对来源恢复、目标重复、行内样式、可信事件及实际修饰键。
- 菜单、移动及多步历史另按对应文件核对，不能套用八按键断言。
- 早期导出为累计记录，重复 seq 去重；不同监控会话不拼接节点身份。
- 缺 session 的早期文件按正文 b3/n3 引用命名空间分组，推定标签仅用于审计，原文件不改。
- 结构粘贴、隐藏副本回读、H1/H9折叠历史及首次Chrome重载按专用断言审计。
- F04粘贴编辑、转正文、删除与F05剪切粘贴移动另核对逐步全文、标记、样式和历史按键。
- 两轮Chrome重载分别审计；不能代替夸克独立读取或协同，不证明生产验收。
- F07跨位编号、空白/重名标题及导航、隐藏标题和普通列表编号另见boundaries。
- 初轮多出的末空段保留；F01-middle-text 采用 R3/R4，R1/R2 不拼作稳定双轮。
- F02 整块剪切粘贴移动采用 R2/R3，R1 缺正文外菜单 DOM。
- 拖动未改变顺序的尝试不计成功，也不据此判定功能不支持。
- 首次11:12清理是历史记录；最终清理以F00-final系列独立判定。

## 监控区间

| 会话 | 唯一正文 mutation | 首尾 seq | 区间内缺号 |
| --- | --- | --- | --- |
| S06B-1792379834567 | 7160 | [573]–[7732] | [] |
| S06B | 572 | [1]–[572] | [] |
| S06C-P1-1792390490386 | 108 | [1]–[108] | [] |
| S06D-P2-1792391792635 | 2180 | [1]–[2180] | [] |
| S06A (legacy) | 612 | [1]–[612] | [] |
| S06-e2_-1792395668049 | 727 | [1]–[727] | [] |
| S06-q2_-1792395840173 | 776 | [1]–[776] | [] |
| S06-e1_-1792395390775 | 57 | [1]–[57] | [] |
| S06Q0-1792395199164 | 66 | [1]–[66] | [] |
| S06-q1_-1792395550684 | 69 | [1]–[69] | [] |

## F06 专项断言

结果见 06-audit.json 的 crossEffects；只核对已有证据，不补造实测。

结构粘贴两轮、隐藏副本两次回读、H1/H9各两轮折叠历史及首次Chrome重载的现有断言通过。

## F04/F05 多步断言

结果见 06-audit.json 的 foldAndMove；H1删除含末空段，H9删除不含，两类来源分别审计。

H1/H9粘贴编辑、转正文、删除及标题剪切粘贴移动的现有两轮断言通过。

## F07 与第二轮重载断言

结果见 06-audit.json 的 boundaries；输入未生效及恢复采集的额外按键均单列，不计稳定通过。

跨位布局、隐藏标题及普通列表编号、四类锚点导航和第二轮Chrome重载断言通过。

## F06 跨会话断言

结果见06-audit.json的crossSessions：X1/X2独立刷新、Collab R1/R2文字历史、RemoteNumber R1/R3编号历史。R2额外空段为排除异常，另核对恢复，不计成功轮。

11组、81项断言通过；其中1组仅确认已知排除异常及恢复，不是成功用例。

## 最终清理

两边真实刷新后的空正文、空标题、观察器消失及原界面恢复：{"Chrome": true, "Quark": true, "consolesClosed": true, "originalQuarkTabRestored": true}

## 八按键断言异常

F04-folded-heading9-edit-double.json

## 文件清单

| 文件 | mutation | keys | external | SHA-256 |
| --- | --- | --- | --- | --- |
| [F00-B-before-controlled-fixture-reset.json](./dom/F00-B-before-controlled-fixture-reset.json) | 25 | 0 | 0 | `c4fb2462eac695a3ffe99f9d1b482b0574fdc359b12a6e598ad91dc28eeeb1dd` |
| [F00-B-bold-middle-source.json](./dom/F00-B-bold-middle-source.json) | 134 | 1 | 0 | `3b2d820ec299d5ddcd055911cf33593aaf877c76fad93e79096bd846a3f9a14b` |
| [F00-B-bullet-middle-text-source.json](./dom/F00-B-bullet-middle-text-source.json) | 14 | 1 | 0 | `a47e7b4563e8cdb099fb5914a1383ab859847162517a5c5d6c2dea72056b69a0` |
| [F00-B-controlled-numbered-headings-v2.json](./dom/F00-B-controlled-numbered-headings-v2.json) | 566 | 12 | 0 | `02b582f07057826705f257b7d4ce92f6dc8bda316b52bf5fe62b678609136171` |
| [F00-B-five-bullets-source.json](./dom/F00-B-five-bullets-source.json) | 101 | 3 | 0 | `98e9427132c832c5c9a331d77f3671fa92f022553b137e2ffdd49c646c7acd2b` |
| [F00-B-five-ordered-F02-source.json](./dom/F00-B-five-ordered-F02-source.json) | 98 | 3 | 0 | `a87ac3ab291246784feb23ae95ac118281797ccd58c6bd02ad5399005c70da66` |
| [F00-B-fold-history-expanded-source.json](./dom/F00-B-fold-history-expanded-source.json) | 14 | 1 | 0 | `f6b17944508c338a080d9bdc86485b13904272bbc2b267bdc0f98dc2329219dc` |
| [F00-B-folded-child-edit-source.json](./dom/F00-B-folded-child-edit-source.json) | 19 | 0 | 9 | `0bfc5bb35d6b094696e11c6695d9de21653485f2b0eae4840264b022dfa7e26b` |
| [F00-B-folded-copy-paste-target.json](./dom/F00-B-folded-copy-paste-target.json) | 18 | 1 | 8 | `f0983221429ded1b796f9fb9acb6492d77a66baae76d9d42696ef6f510b9561a` |
| [F00-B-folded-find-source-R1.json](./dom/F00-B-folded-find-source-R1.json) | 23 | 1 | 0 | `bfdc1044aec5720840a6d8398601b071a277ec5c3f684d483de2fa5a848fed85` |
| [F00-B-folded-find-source-R2.json](./dom/F00-B-folded-find-source-R2.json) | 30 | 1 | 3 | `9b90a6e477562a59ab786b79d2633e16be78f328d6f4928cd074db1da8d476bf` |
| [F00-B-folded-parent-edit-source.json](./dom/F00-B-folded-parent-edit-source.json) | 27 | 0 | 9 | `9b164055b9d154a2ffa7f73cb5a2dc7c8d6784d901fabed8f8c72402102bfa9f` |
| [F00-B-folded-select-source.json](./dom/F00-B-folded-select-source.json) | 0 | 0 | 6 | `b2a067f22d53d29f1694a04a17467dcef3901a54d37e1c7db680bfce11994dda` |
| [F00-B-heading-move-source.json](./dom/F00-B-heading-move-source.json) | 25 | 2 | 0 | `c5626af9cd25539c91f339612e1f03ce37e5e63a1f4f518f6ae048a576a0ad12` |
| [F00-B-heading-restarted-source.json](./dom/F00-B-heading-restarted-source.json) | 8 | 0 | 12 | `a35a77df3a10e1cbc5e0d64bf5963f139e451e8e82ab861e16c78db04d67ad6a` |
| [F00-B-heading9-fold-hover-miss.json](./dom/F00-B-heading9-fold-hover-miss.json) | 5 | 0 | 0 | `6ac9f4a02fde483c6111f90a142157ccb8e18943b6929dff3ad0b6783d22609e` |
| [F00-B-indented-source.json](./dom/F00-B-indented-source.json) | 18 | 1 | 0 | `afd4d14bf5d6865775c62b6c4c5e347c1ad814ee4bf6083ef3e25afccdf3f015` |
| [F00-B-middle-text-source.json](./dom/F00-B-middle-text-source.json) | 37 | 1 | 0 | `6621544667a99074a5ca364e9c003209fce8873f8e38c502805d09dfaf0b8b3a` |
| [F00-B-mixed-numbered-headings-clean.json](./dom/F00-B-mixed-numbered-headings-clean.json) | 7 | 1 | 8 | `5d079a22e2fdc048018a70f5a17cd87f851a8be3429360d41c80f95dcc43411d` |
| [F00-B-mixed-numbered-headings-source.json](./dom/F00-B-mixed-numbered-headings-source.json) | 49 | 2 | 12 | `869af090dd5534830dfd4e791d5b2e040f04f91aa4795d750a13a6b65cc55050` |
| [F00-B-move-source.json](./dom/F00-B-move-source.json) | 24 | 1 | 0 | `861b2d5384bc1a8d5b359164d1e3120b31ffc13f3ed0dc579ab170b70ad5b668` |
| [F00-B-nested-fold-source.json](./dom/F00-B-nested-fold-source.json) | 22 | 2 | 10 | `b1bf26ff0e0c1bf36120f3a1511968790d701ca4f7a2c0f8f4c4959a3e2ee501` |
| [F00-B-numbered-heading1-level-source.json](./dom/F00-B-numbered-heading1-level-source.json) | 16 | 1 | 0 | `d444fe672a8b3bd254b9f12a0e8b0ae166e3273adcb56f686434c060717b1cc1` |
| [F00-B-numbered-heading9-level-source.json](./dom/F00-B-numbered-heading9-level-source.json) | 3 | 1 | 0 | `e89f76960073ec5cd4e0215a85ea90d0b2dee6521cd6ff0e2b1dcc135dd1b8ab` |
| [F00-B-ordered-five-fixture.json](./dom/F00-B-ordered-five-fixture.json) | 113 | 4 | 0 | `1676b087a333dbf7f2713bdf0bf585f53dbbf6b03ec71a0edf0a9eb487e8884d` |
| [F00-B-outline-fold-source.json](./dom/F00-B-outline-fold-source.json) | 42 | 1 | 0 | `5f3e3e023359af3d730ca71015e3f0791dc8188996958a29a08de45d763a9701` |
| [F00-B-outline-heading1-source.json](./dom/F00-B-outline-heading1-source.json) | 19 | 1 | 0 | `f416a8fc3dedbf614a99f6f97c6190d57b7d23cbbc6d9333ef0294581d858390` |
| [F00-B-outline-hidden-anchor-source-R2.json](./dom/F00-B-outline-hidden-anchor-source-R2.json) | 23 | 0 | 0 | `4f00e20ead6568fdd3d5e7c13d2e2846d9140b35b48fb321dcb82e7048fff334` |
| [F00-B-outline-level-source.json](./dom/F00-B-outline-level-source.json) | 8 | 0 | 0 | `613d0288bc9c8ca484ed8531fb6385623332e32f7e7675ad7b3c4665fbf6f7f6` |
| [F00-B-plain-heading1-number-source.json](./dom/F00-B-plain-heading1-number-source.json) | 24 | 2 | 0 | `6e01070f6366c4d7acce72a1360edad930b8e246f2333a5cf9eeb48c36d83949` |
| [F00-B-plain-heading9-number-source.json](./dom/F00-B-plain-heading9-number-source.json) | 51 | 1 | 0 | `78b0ce012a12f2c9e16a84b991815a5320281a6addb08906d723c26ec173350e` |
| [F00-B-structured-paste-clean-source.json](./dom/F00-B-structured-paste-clean-source.json) | 29 | 0 | 0 | `e8953e30fb5ab6c02299f080d7e63ec5f331604537edf278dd0f0a69f072d4b3` |
| [F00-B-text-middle-for-delete.json](./dom/F00-B-text-middle-for-delete.json) | 41 | 2 | 0 | `ce6367a7ccf1aed9a53c1ddd34dee1581a5941d3cabe43a002a1beb4c1f24065` |
| [F00-C-resume-Chrome-permitted.json](./dom/F00-C-resume-Chrome-permitted.json) | 37 | 0 | 8 | `7bbd7a3749428d238f8b7d0b004c18f08c34e0924ae063c8d8afb0159931b572` |
| [F00-D-checkpoint-before-access-resolution.json](./dom/F00-D-checkpoint-before-access-resolution.json) | 10 | 0 | 6 | `481f64abc3e0625fab8cf1a13073f89894e3163eea3e09287fa3f476d0cfcd6b` |
| [F00-D-duplicate-heading1-navigation-source.json](./dom/F00-D-duplicate-heading1-navigation-source.json) | 11 | 1 | 10 | `6a595814ef28b8d682bd4d4a3460310baa3ccf399596cb2780c617678b582344` |
| [F00-D-duplicate-heading9-navigation-source.json](./dom/F00-D-duplicate-heading9-navigation-source.json) | 18 | 2 | 13 | `7c2fa7b06ac9e5acdc485b69776bc22698b9a4682d2da1993f39d822d61d7a4d` |
| [F00-D-duplicate-title-source.json](./dom/F00-D-duplicate-title-source.json) | 283 | 10 | 19 | `c20bd1deaa4146eaea09d199e8ed0a4a610c13c01d558ed0a915c01b47e2e34f` |
| [F00-D-empty-heading1-navigation-source.json](./dom/F00-D-empty-heading1-navigation-source.json) | 21 | 2 | 11 | `915e9db37a180dc724f7c117038c978950486da6619e7888e0ac1a8d6d0c5830` |
| [F00-D-empty-heading9-navigation-source.json](./dom/F00-D-empty-heading9-navigation-source.json) | 27 | 2 | 14 | `1010c5840da5a2dfb08019acc946fe09124bb5e01afabfcc80591a87add146f5` |
| [F00-D-hidden-list-expanded-source.json](./dom/F00-D-hidden-list-expanded-source.json) | 277 | 9 | 20 | `b0bc733b66fff9ca12e915341a2a59074f85b17719f96b6bcd31e647c00fee04` |
| [F00-D-hidden-numbering-expanded-source.json](./dom/F00-D-hidden-numbering-expanded-source.json) | 20 | 1 | 7 | `1752f50e8ac14b45fab6b26c124fa78272d596cfaf8386842d605a6b2bc8b2aa` |
| [F00-D-three-heading1-layout-source.json](./dom/F00-D-three-heading1-layout-source.json) | 64 | 3 | 5 | `2f413213c9faba328f623dc3da51f16a033eb350469ba0376040cd4e62df5deb` |
| [F00-D-three-heading9-layout-source.json](./dom/F00-D-three-heading9-layout-source.json) | 67 | 3 | 7 | `a52bbb89393b32ff1f3e869c70ef5b58a8e2bfdad74771dd533ea2ccf54546fa` |
| [F00-D-three-ordered-layout-source.json](./dom/F00-D-three-ordered-layout-source.json) | 182 | 7 | 4 | `b3965686bea0eb0bc7ff4c5a6f90bd499d9a12a462f0d1e6344d91386fdb746c` |
| [F00-Quark-access-review-rejection.json](./dom/F00-Quark-access-review-rejection.json) | 0 | 0 | 0 | `4664ccb3619dd5a347ded2cd3468e622753cb51f8e7b2b41ee71b264d38a3b81` |
| [F00-cleanup-after-refresh.json](./dom/F00-cleanup-after-refresh.json) | 0 | 0 | 0 | `6518af9ab2d57e6501930d44bdaf7e1d3516cc6a00f8c561ca0213642ca99152` |
| [F00-cleanup-before-refresh.json](./dom/F00-cleanup-before-refresh.json) | 43 | 3 | 0 | `ab294380f4f31e65cb812c068f4dffee222b95494250422d5f10781a4a227100` |
| [F00-empty-baseline.json](./dom/F00-empty-baseline.json) | 0 | 0 | 0 | `b823fb7f82871ed73c83085d93c81cd54134a9588832a8f8051c8a85f14c0fed` |
| [F00-final-Chrome-after-refresh.json](./dom/F00-final-Chrome-after-refresh.json) | 0 | 0 | 0 | `c7c49a74bbfec1b3cf0ac7c7d965c9ef3b692a236ba27576f5ed9f5fb097c64c` |
| [F00-final-Chrome-cleared.json](./dom/F00-final-Chrome-cleared.json) | 58 | 3 | 5 | `5bca1878e0092535ded124dd9d7946e91cd1901bd51d5e1d5dd28b2f12007248` |
| [F00-final-Chrome-observer-removed.json](./dom/F00-final-Chrome-observer-removed.json) | 0 | 0 | 0 | `8c104b8e106b9406116bd9ec1e060d7140ac3f34b09b9ea392b8da72ead19bd7` |
| [F00-final-Quark-after-refresh.json](./dom/F00-final-Quark-after-refresh.json) | 0 | 0 | 0 | `bd0a775217832e09830d8290d99d2c4c8db05b86dccb57efda2f8228053ec4a2` |
| [F00-final-Quark-cleared.json](./dom/F00-final-Quark-cleared.json) | 44 | 0 | 7 | `285ce975450860b2e02a4e003cca501250e3d5e8614f2a3f3816f4ad38fc8343` |
| [F00-final-Quark-observer-removed.json](./dom/F00-final-Quark-observer-removed.json) | 0 | 0 | 0 | `d14557b279ee01f6f1bdcf0e694d71ac6454f359555ec4a3c26c6ec1f8845cea` |
| [F00-final-ui-restored.json](./dom/F00-final-ui-restored.json) | 0 | 0 | 0 | `188e8da24bb94e94c379a638d3cd21bbe410f5f2e6b7a210e4ade2cf3148178a` |
| [F00-number-menu-discovery.json](./dom/F00-number-menu-discovery.json) | 0 | 0 | 0 | `73aaeec07e0ee8a6a6a9dd66191d4a8113f77c982c9f56fcb6f9e8910cc37d07` |
| [F00-ordered-fixture-R1.json](./dom/F00-ordered-fixture-R1.json) | 77 | 0 | 0 | `a1c4b54819250375216c11dfffbc5f3df471da78d3c909c6922510c1fd9115d7` |
| [F01-bold-middle-rejoin-double.json](./dom/F01-bold-middle-rejoin-double.json) | 170 | 8 | 0 | `cec5b5532215ef65539c2944155a9303b8e22e85d2854b9b6b1fb2d4c31654b8` |
| [F01-bullet-middle-rejoin-double.json](./dom/F01-bullet-middle-rejoin-double.json) | 112 | 8 | 0 | `d7ae18c71fe79500a8f17701dd96f67af7b6deba8d7aeb59e48082265905b27e` |
| [F01-bullet-middle-text-double.json](./dom/F01-bullet-middle-text-double.json) | 129 | 8 | 0 | `f292d4db106360fd79dc918a57d2dc2388e55d67c02ea1caa9c23ac9c2d400bf` |
| [F01-continue-last-R1.json](./dom/F01-continue-last-R1.json) | 9 | 0 | 8 | `c0ba58dc30cd5c70016edd0c8391b2304bf515c5d3f4a99bd72ec530f5462139` |
| [F01-continue-last-R2.json](./dom/F01-continue-last-R2.json) | 9 | 0 | 8 | `7fbe7f9c5095bc47cbe1f032d50ef75a0d219d9545660647abff01bd4a292c66` |
| [F01-continue-last-redo-R1.json](./dom/F01-continue-last-redo-R1.json) | 5 | 1 | 0 | `abc9085b4851c6967d7010f2c82d2401267c004b81069557906d5ca71a9289b0` |
| [F01-continue-last-redo-R2.json](./dom/F01-continue-last-redo-R2.json) | 5 | 1 | 0 | `bc9f4bd27d7ab3e4e4862448cb7476255c5962c1eafada964e0477ba08374199` |
| [F01-continue-last-restore-R1.json](./dom/F01-continue-last-restore-R1.json) | 5 | 1 | 0 | `6a2cb66ee3dcb8ec930ecc62d6f2b891f990f9bbfc5bbd00403341190b270f22` |
| [F01-continue-last-undo-R1.json](./dom/F01-continue-last-undo-R1.json) | 5 | 1 | 0 | `128ddd20f12cbd0c23e1f86ffd703be80ffaa67f7a6be032b29068c69bdbd733` |
| [F01-continue-last-undo-R2.json](./dom/F01-continue-last-undo-R2.json) | 5 | 1 | 0 | `8696cb93d1dd7185ba083f6b6907d5eca543962e643a91539431de78e3b8d7c3` |
| [F01-custom-start-seven-double.json](./dom/F01-custom-start-seven-double.json) | 68 | 6 | 15 | `c0083b7e5010127def1551b19c92d1c2b6c149447ff39e0da86a05ce974b251a` |
| [F01-middle-rejoin-R1.json](./dom/F01-middle-rejoin-R1.json) | 16 | 8 | 0 | `ebd3b62af19c83c31a0d3afbe30e3e3d8b972fcca6cc7aa4fbe126da6f662192` |
| [F01-middle-rejoin-R2.json](./dom/F01-middle-rejoin-R2.json) | 16 | 12 | 0 | `3d493e52103916ba89af153d4a25b144634e2b7803d612384c9ef3c9f908adfd` |
| [F01-middle-rejoin-redo-R1.json](./dom/F01-middle-rejoin-redo-R1.json) | 16 | 10 | 0 | `ccc2d0751b368e7c83138e97420bdb3e1ccf7838c81761011c887495ba150bf7` |
| [F01-middle-rejoin-redo-R2.json](./dom/F01-middle-rejoin-redo-R2.json) | 16 | 14 | 0 | `e519d98ce75fff4113ecdfc24b1f4e54117779d8a445117c832dcdaf17ba01f3` |
| [F01-middle-rejoin-restore-R1.json](./dom/F01-middle-rejoin-restore-R1.json) | 16 | 11 | 0 | `c799a963dfd3695794aa83e7edb1afa754a5bcbed8f9ad81b383dae7071c1edf` |
| [F01-middle-rejoin-undo-R1.json](./dom/F01-middle-rejoin-undo-R1.json) | 16 | 9 | 0 | `9a60afa542ef872cd692f5a3f52416e5c952479abc55e6f4548ca348fbe2693b` |
| [F01-middle-rejoin-undo-R2.json](./dom/F01-middle-rejoin-undo-R2.json) | 16 | 13 | 0 | `cbaa23262304ab5f914a276871056cb5c2d565cd6a8c30f473209e987ddd28d3` |
| [F01-middle-text-R1.json](./dom/F01-middle-text-R1.json) | 27 | 1 | 0 | `c142f6ff10a345f60b2b9c8ad2a9aefa2f53d767f4d05a85dd720acc2b709706` |
| [F01-middle-text-R2.json](./dom/F01-middle-text-R2.json) | 31 | 5 | 0 | `a74659c301ba820347678364aad85034889dcf8c568c49282b81214233f064d3` |
| [F01-middle-text-R3.json](./dom/F01-middle-text-R3.json) | 22 | 1 | 0 | `0e055c2917694ba1bfc6c86fe3e55edb0eb0f2293ed39e12ed283d58d24893ac` |
| [F01-middle-text-R4.json](./dom/F01-middle-text-R4.json) | 18 | 1 | 0 | `fb12c296fb75425f337f072d553809d9affd6ded22fe3e3b6552fbf9d3ee05df` |
| [F01-middle-text-redo-R1.json](./dom/F01-middle-text-redo-R1.json) | 16 | 3 | 0 | `34bcc848d104c1bbd5c3d34cae47a0a07acba04f6ae0e23b9bc6a896d6f43fe3` |
| [F01-middle-text-redo-R2.json](./dom/F01-middle-text-redo-R2.json) | 16 | 7 | 0 | `cff9dc7fef45c081ccf817c6081db062113c8d7b38ba57ab489b6b57507a7b14` |
| [F01-middle-text-redo-R3.json](./dom/F01-middle-text-redo-R3.json) | 18 | 1 | 0 | `f8e39da66fa515e5703bfb5959a1054d9bbc6b7b56596741270a19cbf657d86c` |
| [F01-middle-text-redo-R4.json](./dom/F01-middle-text-redo-R4.json) | 18 | 1 | 0 | `cc4452b0b7bda173e139e0e904622bb2085ff58af5a395a538503f3f8ec1948b` |
| [F01-middle-text-restore-R1.json](./dom/F01-middle-text-restore-R1.json) | 16 | 4 | 0 | `385be13cd7e86b7dc34b98a91546ad28377bf8fdf3c3b7a770f37968d4ef411d` |
| [F01-middle-text-restore-R3.json](./dom/F01-middle-text-restore-R3.json) | 18 | 1 | 0 | `f6b7fa3232f3ce731391e890f2b2a1278f74db5bb950768cbcd83fd83633f2c4` |
| [F01-middle-text-undo-R1.json](./dom/F01-middle-text-undo-R1.json) | 16 | 2 | 0 | `c018c3c7bf256ac566668c61a530694088e478f02bd60b57351d6f202bfb9423` |
| [F01-middle-text-undo-R2.json](./dom/F01-middle-text-undo-R2.json) | 16 | 6 | 0 | `e7d63f2e0ab0ef6a61ad5adbd2c5d5bc6dc8e3d55d7ce24e53aae1a872e994a3` |
| [F01-middle-text-undo-R3.json](./dom/F01-middle-text-undo-R3.json) | 18 | 1 | 0 | `0d45c5469dd6609e648ae14c87a604d927c659b771c05c7f4333bf6442fb6cc0` |
| [F01-middle-text-undo-R4.json](./dom/F01-middle-text-undo-R4.json) | 18 | 1 | 0 | `cc08bf169008a0f6bcbaac61e5094bb9fbee517900601ddf855415b31be06421` |
| [F01-plain-heading1-interruption-double.json](./dom/F01-plain-heading1-interruption-double.json) | 126 | 8 | 0 | `f8394c067b11bdfb0837d854922764cd6e87d3dc03ecb3a85277dc71242ebc97` |
| [F01-plain-heading9-interruption-double.json](./dom/F01-plain-heading9-interruption-double.json) | 126 | 8 | 0 | `d32268670ecd0efad651c71ec32f40381175a42615594fec03a9785504d5a7ac` |
| [F01-restart-last-R1.json](./dom/F01-restart-last-R1.json) | 25 | 15 | 9 | `7a3557026ee2cd8cc6e41edebd095c17cff447e8bd1238f26e9031acf1647789` |
| [F01-restart-last-R2.json](./dom/F01-restart-last-R2.json) | 11 | 0 | 8 | `984dc519b8b724d422c20be80afeabf742068b69149f6023bd40d9f3297d8db9` |
| [F01-restart-last-redo-R1.json](./dom/F01-restart-last-redo-R1.json) | 9 | 17 | 9 | `5f035aa0470e3c3fc11a21f3cf56c9a8baa55cee3d1a347d01f5585805ce368c` |
| [F01-restart-last-redo-R2.json](./dom/F01-restart-last-redo-R2.json) | 5 | 1 | 0 | `33dcbeb928353a61a9e86c28083ffa35474b74937e54ba9b29aa6e348c571c41` |
| [F01-restart-last-restore-R1.json](./dom/F01-restart-last-restore-R1.json) | 9 | 1 | 0 | `517a01a87742b27d9d5d6c0f2778af940a3c7ccc0a8fb46ebda050fb62ca4bb3` |
| [F01-restart-last-undo-R1.json](./dom/F01-restart-last-undo-R1.json) | 5 | 16 | 9 | `2f6f475325a090ad0785c69c39db6e04d47526cba9a193e45a23a6198ae4cbf5` |
| [F01-restart-last-undo-R2.json](./dom/F01-restart-last-undo-R2.json) | 5 | 1 | 0 | `7a033ca48c9d6d60547af0d234a814a7043ceaca8cb455f213c1936df635654a` |
| [F02-cut-paste-move-R1.json](./dom/F02-cut-paste-move-R1.json) | 99 | 7 | 0 | `1e1da9b9dead8acaa50de9e1d942686efeae1e39f16588ea33706d7076a95f8a` |
| [F02-cut-paste-move-R2.json](./dom/F02-cut-paste-move-R2.json) | 119 | 7 | 4 | `9a676c413a010a905ec1fdf27e56ee1aab25938545ac78abc131eebf77b2bfef` |
| [F02-cut-paste-move-R3.json](./dom/F02-cut-paste-move-R3.json) | 99 | 7 | 5 | `70124334ff79d29507c502789848ba74420fdffa1b8eba09c9e8209c925f9d10` |
| [F02-middle-backspace-merge-double.json](./dom/F02-middle-backspace-merge-double.json) | 160 | 8 | 0 | `0b2dde3851464d5b4eb14ca4680eb567ac0837ac9e0538491351227c43aacadf` |
| [F02-middle-empty-insert-double.json](./dom/F02-middle-empty-insert-double.json) | 113 | 8 | 0 | `fa90f661fd6938d01f13e04b068528787e3d8b51089ccf637b12c49cef4a98c7` |
| [F02-middle-indent-double.json](./dom/F02-middle-indent-double.json) | 142 | 8 | 0 | `5e4ebcb344ed293a56a7013fbe643efcf53cc8fcf41843d253179b0d59f441f1` |
| [F02-middle-offset1-split-double.json](./dom/F02-middle-offset1-split-double.json) | 136 | 12 | 0 | `e163fea493fa88d28b5214af3a8efeaf0c7961f1ef37c237eee187168e4dddca` |
| [F02-middle-outdent-double.json](./dom/F02-middle-outdent-double.json) | 146 | 8 | 0 | `6ebf3598d104da07b873dd31e4b1eb9e4c215d9a22062bd933949fbef68d7128` |
| [F02-ordered-middle-to-bullet-double.json](./dom/F02-ordered-middle-to-bullet-double.json) | 162 | 8 | 0 | `a9d1add0ac6f2c4fcd252b37e7977d268e6566276ef0f720ef8b8f3b7ce105b1` |
| [F02-text-middle-delete-merge-double.json](./dom/F02-text-middle-delete-merge-double.json) | 82 | 8 | 0 | `1309d55a58f01eb35fa0eb3c59bf4efa89746c7ae9886d5f8c038b143f0483eb` |
| [F03-heading-continue-R1.json](./dom/F03-heading-continue-R1.json) | 8 | 0 | 12 | `18b502fd4dce4777dea295d095bf17db03dad59b812824adf2176374969ad032` |
| [F03-heading-continue-R2.json](./dom/F03-heading-continue-R2.json) | 20 | 3 | 15 | `1be6c2cd6bb664fa56958344b24e51c2545337378dda925b45ecb3d7b099f15e` |
| [F03-heading-continue-final-history.json](./dom/F03-heading-continue-final-history.json) | 12 | 3 | 7 | `f2e8ad358cf811f96d6b8b88553c6a158846c0af999fd16a28844c8a7afcf297` |
| [F03-heading-number-menu-first.json](./dom/F03-heading-number-menu-first.json) | 6 | 0 | 1 | `c78f758cb3a8b27247490d21c43201f89194283dcd7685ba80412b524be5e534` |
| [F03-heading-restart-R1.json](./dom/F03-heading-restart-R1.json) | 8 | 0 | 12 | `8b4a7a73e4faaf9956fec2a31ec2df9055a6576bb732ac458943a2451e63edf1` |
| [F03-heading-restart-R2.json](./dom/F03-heading-restart-R2.json) | 20 | 3 | 15 | `52717404855ea18706e287cb52a268cdf7a68974281651f17a63fe1e74e1fdaa` |
| [F03-heading-restart-final-history.json](./dom/F03-heading-restart-final-history.json) | 12 | 3 | 9 | `af43092b0b382a268f1a39815e1d2c0e2f9e591535e444abc3752cb3f0444ecc` |
| [F03-mixed-headings-level-jump-double.json](./dom/F03-mixed-headings-level-jump-double.json) | 149 | 8 | 32 | `caf25c999f0a37d70084b1cc42b4ca01760fd25b394f3ae9e5bc7d0d33144de0` |
| [F03-numbered-heading1-to-heading9-double.json](./dom/F03-numbered-heading1-to-heading9-double.json) | 134 | 8 | 0 | `0d0ac49c364820714e78c668cc32aaf7ba7b98d9167431d8d6039248bbad2d36` |
| [F03-numbered-heading9-to-heading1-double.json](./dom/F03-numbered-heading9-to-heading1-double.json) | 138 | 8 | 0 | `bd50f7ab8dd32d9c69392f0ea47f0aed8b7700056a629211305785a16f2c38d9` |
| [F03-ordered-to-numbered-heading1-double.json](./dom/F03-ordered-to-numbered-heading1-double.json) | 170 | 8 | 0 | `d160faab8f59fb8c1947f52a3901b6f150d5b62ea074aae2257dd3bdbdba7ecd` |
| [F03-ordered-to-numbered-heading9-double.json](./dom/F03-ordered-to-numbered-heading9-double.json) | 168 | 8 | 0 | `920ee3464030965e80c076c92e69cf05b6ec9cdbcecaa9a24ffb0f31886ff8d4` |
| [F03-plain-heading1-add-number-double.json](./dom/F03-plain-heading1-add-number-double.json) | 22 | 8 | 0 | `d617b99217d527e8fd634026a9a072311667669e96eee544ad98668f8c476cae` |
| [F03-plain-heading9-add-number-double.json](./dom/F03-plain-heading9-add-number-double.json) | 22 | 8 | 0 | `41fd43596542ef9dcf1ca978cf11223eac0bd04e5806fdf9725820c08d8a8bbb` |
| [F04-F06-folded-select-all-copy-R1.json](./dom/F04-F06-folded-select-all-copy-R1.json) | 12 | 2 | 6 | `e3dca607291232e44a3bf41d46d183eaeaa91653b0b5eea3ee76909ca87653c0` |
| [F04-F06-folded-select-all-copy-R2.json](./dom/F04-F06-folded-select-all-copy-R2.json) | 28 | 3 | 6 | `7bf73a786e3ab73f6dec3d27c627cea1b11333fe20f0d05a9eb89143c598aeff` |
| [F04-child-collapse-R1.json](./dom/F04-child-collapse-R1.json) | 25 | 0 | 9 | `3c951115a59026aa279557c55578401b2d3e84f5738f4a96b48eebb247cab6c0` |
| [F04-child-collapse-R2.json](./dom/F04-child-collapse-R2.json) | 11 | 0 | 7 | `0a09560120f72118b6e9e1d294dee82fa44a7d6bc126575aae78991f4b4607ff` |
| [F04-child-expand-R1.json](./dom/F04-child-expand-R1.json) | 12 | 0 | 7 | `115465d50b0ff8fee78cf1a0b0d411a8331932b5648377cb925441fbab0182bd` |
| [F04-child-expand-R2.json](./dom/F04-child-expand-R2.json) | 12 | 0 | 7 | `eff5a80e3907f35004a15365b4d374e3b38e4c70edfe55e4f1c311cb7bd5dd51` |
| [F04-edit-history-anomaly-recovery.json](./dom/F04-edit-history-anomaly-recovery.json) | 9 | 1 | 10 | `2392b9693c4830d02f4e3b319d8544d72edd296fa6d89161ddb0e0c6fe9c46d1` |
| [F04-folded-heading1-delete-R1.json](./dom/F04-folded-heading1-delete-R1.json) | 40 | 0 | 13 | `40577b23422ecf36d4c195b5f08b5b9bf0102416dc1d3c6f775e1263f80bf44c` |
| [F04-folded-heading1-delete-R2.json](./dom/F04-folded-heading1-delete-R2.json) | 24 | 0 | 13 | `36cd0858f6d2f13054b3cdb8ec6cdba2f69a3ed23e66e1080c2fb7e9f25b048a` |
| [F04-folded-heading1-delete-history-R1.json](./dom/F04-folded-heading1-delete-history-R1.json) | 59 | 3 | 12 | `d890d2d443ef4cd71e1b60ca75c6137ede36a30815f7d18eada8ecbcfc641c9c` |
| [F04-folded-heading1-delete-history-R2.json](./dom/F04-folded-heading1-delete-history-R2.json) | 59 | 3 | 12 | `2e4064f97b13cbb55588cdffe2882af6598607cecd5ca992f0c413cdc3311690` |
| [F04-folded-heading1-paste-edit-R1.json](./dom/F04-folded-heading1-paste-edit-R1.json) | 24 | 4 | 10 | `3f70ff5038a3042c86a81a348edfe8d3cadb8fffdf2e9768e44c7171c0dec1ec` |
| [F04-folded-heading1-paste-edit-R2.json](./dom/F04-folded-heading1-paste-edit-R2.json) | 22 | 4 | 10 | `ed14b4abcf7af4c159b963ba61c4a28ec7db2ce8dea0552d6b513e123dde249c` |
| [F04-folded-heading1-to-text-R1.json](./dom/F04-folded-heading1-to-text-R1.json) | 67 | 4 | 14 | `30a0d7af929243b1cb970a10ef427021e5a063d518e1f47ac63323b599114458` |
| [F04-folded-heading1-to-text-R2.json](./dom/F04-folded-heading1-to-text-R2.json) | 85 | 4 | 15 | `37a81b3ee3b60b87691c2f7825f6f981cb44416799c6f66689586f2f9dad8070` |
| [F04-folded-heading9-delete-R1.json](./dom/F04-folded-heading9-delete-R1.json) | 43 | 1 | 4 | `7689f551f7135508b8e6e8aa7904e2dc64956e649349a3c42a038697314a1759` |
| [F04-folded-heading9-delete-R2.json](./dom/F04-folded-heading9-delete-R2.json) | 16 | 0 | 4 | `b415c787a583460ffca36cc872b1f1330c0099a48d1f2a5ce6a8bb40d48b8e64` |
| [F04-folded-heading9-delete-history-R1.json](./dom/F04-folded-heading9-delete-history-R1.json) | 45 | 3 | 0 | `5af2c8ca9b46e8465389c2c3e93bfc379bd680291f3812afb4550cdb81fe96fb` |
| [F04-folded-heading9-delete-history-R2.json](./dom/F04-folded-heading9-delete-history-R2.json) | 45 | 3 | 0 | `b075effc2bce45b017629631e5fb6a7c41cad110d13eabd7780273668f854674` |
| [F04-folded-heading9-edit-double.json](./dom/F04-folded-heading9-edit-double.json) | 14 | 8 | 9 | `7e4a143dc1f94f766ef63eec2b2118d64d5c8727251d856deed191b354e4405a` |
| [F04-folded-heading9-paste-edit-R1.json](./dom/F04-folded-heading9-paste-edit-R1.json) | 22 | 4 | 17 | `6ecc5bab2fb756064147a9003ab31c6e1c3633427137bac67470e88c51c5d74c` |
| [F04-folded-heading9-paste-edit-R2.json](./dom/F04-folded-heading9-paste-edit-R2.json) | 22 | 4 | 17 | `6edbc180023021555cd3c0f64c258331c022cd301f8194d67e2ca0c7247d082f` |
| [F04-folded-heading9-to-text-R1.json](./dom/F04-folded-heading9-to-text-R1.json) | 66 | 4 | 14 | `3031bc58b30eab46bdf0de4cf97072528a0d8a3a09dcb00af4c39ba0dcf002db` |
| [F04-folded-heading9-to-text-R2.json](./dom/F04-folded-heading9-to-text-R2.json) | 80 | 4 | 19 | `09ac40d1d159502532bda72a4fbf0aa5dbc045d136f8dc0696efd0a53ecc0901` |
| [F04-folded-select-all-delete-R1.json](./dom/F04-folded-select-all-delete-R1.json) | 135 | 3 | 5 | `e9dc0950b470267f1f0474ce9b71c35531249206f0add2d29236d91dce1bf9bb` |
| [F04-folded-select-all-delete-R2.json](./dom/F04-folded-select-all-delete-R2.json) | 133 | 3 | 0 | `5b722625df1500c15522e7543fe0099555a5222c401ec15ef2a430ef29e4b214` |
| [F04-folded-select-all-delete-history-R1.json](./dom/F04-folded-select-all-delete-history-R1.json) | 143 | 3 | 0 | `857a6f8be8cd8af42a86b3950792cb3c5731ac91b8c3d185e9122031a83f9cb9` |
| [F04-folded-select-all-delete-history-R2.json](./dom/F04-folded-select-all-delete-history-R2.json) | 143 | 3 | 0 | `bc979c83f12ae55a4e98225bc47aa7b5088d7ac1f07884fffc7849f523886572` |
| [F04-folded-select-first-R1.json](./dom/F04-folded-select-first-R1.json) | 7 | 1 | 6 | `f0fed06dc453e181e0eee534f9363b2fab1abb6b20dd7989d2e487805437a993` |
| [F04-nested-parent-collapse-R1.json](./dom/F04-nested-parent-collapse-R1.json) | 18 | 0 | 7 | `4087810f2e2ae239a384284e2bbab01d02931a555ce7e1d9ecf5502ec0902c18` |
| [F04-nested-parent-collapse-R2.json](./dom/F04-nested-parent-collapse-R2.json) | 16 | 0 | 7 | `4d789032f0eca2561c4dd27d859b62e8c6cafde6aa62b5b2c67649e5d6144605` |
| [F04-nested-parent-expand-R1.json](./dom/F04-nested-parent-expand-R1.json) | 11 | 0 | 7 | `a3d3e60ab4ed9ce3402ffa39bc59f044fac1bcb96c65be5818837f894af3b0ad` |
| [F04-nested-parent-expand-R2.json](./dom/F04-nested-parent-expand-R2.json) | 11 | 0 | 7 | `38c1573c534e38eef16289941119f95d5b7bbf688917d8fb809b7a910d964cd8` |
| [F04-parent-collapse-R1.json](./dom/F04-parent-collapse-R1.json) | 22 | 0 | 9 | `618badd6fac8579e5f088cff06f544ed3c4cae6c65be9acbb6e36fa5ee96beb2` |
| [F04-parent-collapse-R2.json](./dom/F04-parent-collapse-R2.json) | 21 | 0 | 7 | `72cff77a9b3d6276874bd15fe363d0394ecb05dab9c8e440cf3a91f1d916016e` |
| [F04-parent-expand-R1.json](./dom/F04-parent-expand-R1.json) | 11 | 0 | 7 | `ebc2d22bfd22b18146dbdc83d2e13ac2e1a7f77797bb825ee3076525abd6c1fd` |
| [F04-parent-expand-R2.json](./dom/F04-parent-expand-R2.json) | 11 | 0 | 7 | `a1f50778beec5c42ae963aea4ea24528f2d710d9ec4f3f71609836188d97ce34` |
| [F05-heading-cut-paste-move-R1.json](./dom/F05-heading-cut-paste-move-R1.json) | 37 | 2 | 6 | `31011955807096ac22e900971cfedb7c42805746e2fcd9cf6dd27b1d21c264ba` |
| [F05-heading-cut-paste-move-R2.json](./dom/F05-heading-cut-paste-move-R2.json) | 32 | 2 | 6 | `ed04c8bece19b30c8411626858704b6e190a34884cd54f92222b037543b2e4cd` |
| [F05-heading-cut-paste-move-history-R1.json](./dom/F05-heading-cut-paste-move-history-R1.json) | 79 | 6 | 0 | `6e5817847b0f6e7c141153d6222d10ff33cfd92cbd7504313de5a6df2805f5bd` |
| [F05-heading-cut-paste-move-history-R2.json](./dom/F05-heading-cut-paste-move-history-R2.json) | 79 | 6 | 0 | `2317db0fa3d8dfc52a3d6b9d8ff90ea559d7f17194b3ea9d590cefe8daa90b55` |
| [F05-heading1-to-heading9-anchor-double.json](./dom/F05-heading1-to-heading9-anchor-double.json) | 144 | 8 | 0 | `a51ab244d4c2b8aa1be47df2df9aba6d3f421c16ad3931a8f6c7aaed05c4e7f7` |
| [F05-heading9-to-heading1-anchor-double.json](./dom/F05-heading9-to-heading1-anchor-double.json) | 154 | 8 | 0 | `44c45f4ce75dc7f6148dd8a7383c6fd11d0b8d6886e4b69e4d44b4b53a8080ff` |
| [F05-outline-chevron-collapse-R1.json](./dom/F05-outline-chevron-collapse-R1.json) | 0 | 0 | 0 | `5d13c356fc67b10f6f9aea96afd921e3ab25437abc393924ad5e1d9ff0b26eca` |
| [F05-outline-chevron-collapse-R2.json](./dom/F05-outline-chevron-collapse-R2.json) | 0 | 0 | 0 | `bd667120fa8223358314ea06b60f52c9c27c903fb6076d23c035aa71fd0128ba` |
| [F05-outline-chevron-expand-R1.json](./dom/F05-outline-chevron-expand-R1.json) | 2 | 0 | 0 | `c125aae8fb6af8b7a8bb58dc1574f9d54b1085fca10ea578ad9ddc00f36fd83a` |
| [F05-outline-chevron-expand-R2.json](./dom/F05-outline-chevron-expand-R2.json) | 0 | 0 | 0 | `39a8ded433ee862424e4f13cf3b6a249e34ec204721a856e39aaa99bd51fff5d` |
| [F05-outline-hidden-anchor-R1.json](./dom/F05-outline-hidden-anchor-R1.json) | 21 | 0 | 0 | `f0a129ca10585850e69c1a6cdba9d2aa57ada5beb9195055210e6a96f52a04b1` |
| [F05-outline-hidden-anchor-R2.json](./dom/F05-outline-hidden-anchor-R2.json) | 21 | 0 | 0 | `b07de81adb78abbf50f112ec5d7ec5cd20b8875ee77e1282b97dc06520ad08ab` |
| [F06-Collab-R1-Chrome-after-remote.json](./dom/F06-Collab-R1-Chrome-after-remote.json) | 23 | 0 | 8 | `2c6b00e522a28885793163aefaeacee5b49696d8a38f3bd2b53896aecd166ec1` |
| [F06-Collab-R1-Chrome-local-history.json](./dom/F06-Collab-R1-Chrome-local-history.json) | 23 | 3 | 6 | `f63439efc7fa79dec6bebaf4afbbb96dd9998fed0f23dfee0912cad125d214bb` |
| [F06-Collab-R1-Chrome-local.json](./dom/F06-Collab-R1-Chrome-local.json) | 7 | 1 | 6 | `d23e5514f6a0cada79fc0e8c8a9bfee08de0d7913adb33c4468ef3c3af51a629` |
| [F06-Collab-R1-Chrome-restored-expanded.json](./dom/F06-Collab-R1-Chrome-restored-expanded.json) | 23 | 0 | 9 | `47d10f9e8dfd962e6229d063649b0e306c8dc0465eabf68b42dc6cbffffb4460` |
| [F06-Collab-R1-Chrome-source.json](./dom/F06-Collab-R1-Chrome-source.json) | 24 | 0 | 8 | `f760b0e9e1202efda94842b06d9aeab5149cea185d2b6a225b3db227dfa16f81` |
| [F06-Collab-R1-Quark-before-own-history.json](./dom/F06-Collab-R1-Quark-before-own-history.json) | 24 | 0 | 8 | `f86a774f7008e7bb563ddb321a8a36c6ae6a515eb79c74a7dfcb17578092c806` |
| [F06-Collab-R1-Quark-expanded-before-remote.json](./dom/F06-Collab-R1-Quark-expanded-before-remote.json) | 19 | 0 | 7 | `966d3d1be9d7aebeeb82ec6c8098f886f92ffc9a65cf67da57a547227a82a5bf` |
| [F06-Collab-R1-Quark-own-history.json](./dom/F06-Collab-R1-Quark-own-history.json) | 21 | 3 | 16 | `ad68ed4a0fac31e3b498984048f7d0502d0303bbb5d0850676f6a82d565a18b7` |
| [F06-Collab-R1-Quark-remote-edit.json](./dom/F06-Collab-R1-Quark-remote-edit.json) | 14 | 1 | 9 | `8b9811923838c2e8f89373a072b8927125442524641a1fa778891549f56ee61d` |
| [F06-Collab-R1-Quark-restored-folded.json](./dom/F06-Collab-R1-Quark-restored-folded.json) | 30 | 0 | 9 | `8c31c9e9b75611694315269d85d5144f6226135a1b0971fd7806942031e64f46` |
| [F06-Collab-R1-Quark-sees-local.json](./dom/F06-Collab-R1-Quark-sees-local.json) | 15 | 0 | 6 | `703abaff0f7c7ad21dad399608c3eedf0f7f49655f36fc8ce5a09eb8b1a1abc8` |
| [F06-Collab-R2-Chrome-after-remote.json](./dom/F06-Collab-R2-Chrome-after-remote.json) | 22 | 0 | 8 | `2f34bc0e8fb6a85ae363f0b3b1590da3503f868830b64474d8d2b3c0cd6235a7` |
| [F06-Collab-R2-Chrome-local-history.json](./dom/F06-Collab-R2-Chrome-local-history.json) | 21 | 3 | 6 | `a925d6b2770cb757423ade86e7f4e1dd8d6da0b4c6d5370d187c9902f3f71934` |
| [F06-Collab-R2-Chrome-local.json](./dom/F06-Collab-R2-Chrome-local.json) | 5 | 1 | 6 | `397f1dc4a8b1dcdd2ba5a74390359aa4bd9dcdd55841981746b738d04751d8b4` |
| [F06-Collab-R2-Chrome-restored-expanded.json](./dom/F06-Collab-R2-Chrome-restored-expanded.json) | 24 | 0 | 9 | `5c147f9f69b653af6d8bb4369eb889ddcb40b8dabf973b4abb08a7fa3424efd0` |
| [F06-Collab-R2-Chrome-restored-folded.json](./dom/F06-Collab-R2-Chrome-restored-folded.json) | 21 | 0 | 7 | `2defee92ab1a39544b909f632780b4e38622316b2c0e30c8a95e3ccde45edb65` |
| [F06-Collab-R2-Chrome-source.json](./dom/F06-Collab-R2-Chrome-source.json) | 16 | 0 | 7 | `6468eedc99f9909d8b1deed2e7f4470b7a663ac2e735a00297b6e374c83d6c2f` |
| [F06-Collab-R2-Quark-before-own-history.json](./dom/F06-Collab-R2-Quark-before-own-history.json) | 21 | 0 | 7 | `026525e1a1c5e7b2ae7a6983aca2354b90e327879c09790bf34b1d8089523463` |
| [F06-Collab-R2-Quark-expanded-before-remote.json](./dom/F06-Collab-R2-Quark-expanded-before-remote.json) | 15 | 0 | 7 | `f7b981af37f46d20b7be557014fa1bca1fbf0ab92dcdb8c91ef0b7f218f83d8b` |
| [F06-Collab-R2-Quark-own-history.json](./dom/F06-Collab-R2-Quark-own-history.json) | 23 | 3 | 15 | `4d0793739b6b262cf360e3f4c7979a4c4a774ee3c664493dd5f79ffed934c6ab` |
| [F06-Collab-R2-Quark-remote-edit.json](./dom/F06-Collab-R2-Quark-remote-edit.json) | 14 | 1 | 9 | `53e4d40a8b5b656e3eb0cba8e976c4c91b210ea3d6ed386833e0dd610d07df79` |
| [F06-Collab-R2-Quark-restored-folded.json](./dom/F06-Collab-R2-Quark-restored-folded.json) | 24 | 0 | 10 | `03f38812dd25c1799fad9e4cb95e1100ede4ac1129e1700a10006a7e816f7a1d` |
| [F06-Collab-R2-Quark-sees-local.json](./dom/F06-Collab-R2-Quark-sees-local.json) | 11 | 0 | 6 | `dfca50fe5255e77daf8fd69491dbdf7bb8dd41d1d80ecaf9df5f740c83597ad9` |
| [F06-P1-Chrome-refold-before-Quark.json](./dom/F06-P1-Chrome-refold-before-Quark.json) | 22 | 0 | 9 | `365f8ecc78c87d73b75aac475cd62356ab8dd85a7ce703d3e0d5aa1954cd1394` |
| [F06-P1-Chrome-reload-expanded-read.json](./dom/F06-P1-Chrome-reload-expanded-read.json) | 15 | 0 | 7 | `4176478202c7ed266cc8ed2514c6115858ba43d491a37995ad3bbc385914dbc7` |
| [F06-P1-Chrome-reload-folded.json](./dom/F06-P1-Chrome-reload-folded.json) | 0 | 0 | 0 | `7b48a082654d079a1361538de51ac2565b56c7611b0298883085c35a2d0bd1dc` |
| [F06-P1-save-folded.json](./dom/F06-P1-save-folded.json) | 25 | 0 | 0 | `6d5c7425f626e60c31604afbbc884189e305820f13f4e31a34cab2adf5ff5f4b` |
| [F06-P1-source-expanded.json](./dom/F06-P1-source-expanded.json) | 18 | 0 | 0 | `a7cb021f5f6659e3121016df0d395cbcc45352f3d53f1274acf01ddd2481eab2` |
| [F06-P2-Chrome-reload-expanded-read.json](./dom/F06-P2-Chrome-reload-expanded-read.json) | 10 | 0 | 7 | `abaaa6e0b6686233a6d695ecd32e533cdda8e0f0d1e4bb0a794074d9f48e46c6` |
| [F06-P2-Chrome-reload-folded.json](./dom/F06-P2-Chrome-reload-folded.json) | 0 | 0 | 0 | `c029db35f4cf7e6e472604a7f0878810a1536d06e08357c4aa26e8db6c76740c` |
| [F06-P2-save-folded.json](./dom/F06-P2-save-folded.json) | 20 | 0 | 7 | `516bdf3de263e5af2e96e07a3882decaaed2536e78a99a00e412b60bbb2b14e1` |
| [F06-P2-source-expanded.json](./dom/F06-P2-source-expanded.json) | 14 | 0 | 7 | `479b74384aa49f0b5e4998dbf6dce291a5bb6a88768805b928075d88e3ad981a` |
| [F06-Q0-permitted-current-folded.json](./dom/F06-Q0-permitted-current-folded.json) | 0 | 0 | 0 | `93953ef2fd612913b3f9813a7ff8e8516da4ef2f4df0fa067b46ed8c8a0e837d` |
| [F06-RemoteNumber-Chrome-clean-expanded-source.json](./dom/F06-RemoteNumber-Chrome-clean-expanded-source.json) | 53 | 0 | 10 | `44af24e3bddc5e7440ce6d1a398d4c360e44fca0883babefef50258f294e6480` |
| [F06-RemoteNumber-R1-Chrome-expanded-target.json](./dom/F06-RemoteNumber-R1-Chrome-expanded-target.json) | 15 | 0 | 7 | `8135a7cb4d9670ba1c546f1067781ea8d42e3875227af59fe2d688249cc15c45` |
| [F06-RemoteNumber-R1-Chrome-folded-target.json](./dom/F06-RemoteNumber-R1-Chrome-folded-target.json) | 13 | 0 | 7 | `f1e8bb4fd6f39fe4e091c8b7c1d8d4cc1fd2e2a2ff1f6b24909fb318de07e9b5` |
| [F06-RemoteNumber-R1-Chrome-restored-folded.json](./dom/F06-RemoteNumber-R1-Chrome-restored-folded.json) | 72 | 0 | 11 | `a8e2005bc5175895add59f1017470f3b114cc128871ddb0445be0c27985852a8` |
| [F06-RemoteNumber-R1-Chrome-source.json](./dom/F06-RemoteNumber-R1-Chrome-source.json) | 2 | 0 | 6 | `f63f4ab5ccf5e4c47a4a6266a18d255366de007f78f31115c0effe97b4d51510` |
| [F06-RemoteNumber-R1-Quark-expanded-target.json](./dom/F06-RemoteNumber-R1-Quark-expanded-target.json) | 16 | 0 | 7 | `c636187918155aa823efa6f5b0150acf321e5a4841c8b1454205b61192b9d8ac` |
| [F06-RemoteNumber-R1-Quark-folded-target.json](./dom/F06-RemoteNumber-R1-Quark-folded-target.json) | 8 | 0 | 9 | `a4aadf19ada5ef9a32760d8914529f1fda1a8aff50d7c9e646a850a4ecc70b42` |
| [F06-RemoteNumber-R1-Quark-history.json](./dom/F06-RemoteNumber-R1-Quark-history.json) | 67 | 6 | 13 | `ecc6e9507b90479c446be8aa9dba417dcfc994dfcbc4e5880cbfb91dea4a1d70` |
| [F06-RemoteNumber-R1-Quark-restored-expanded.json](./dom/F06-RemoteNumber-R1-Quark-restored-expanded.json) | 18 | 0 | 8 | `dc9457b3350ef4cdc4d5b6e40607b1fdd55d4de364f758fa197555c9d0f57037` |
| [F06-RemoteNumber-R1-Quark-restored-folded.json](./dom/F06-RemoteNumber-R1-Quark-restored-folded.json) | 19 | 0 | 8 | `67db7007ceca56dc7c537f728879cf29846f3980646771ae419794320049dce8` |
| [F06-RemoteNumber-R1-Quark-source.json](./dom/F06-RemoteNumber-R1-Quark-source.json) | 8 | 0 | 7 | `7cf2c768c7a3d3fb83cc7531c1f8a4b068bbba175ef55160df78db40b58bdfa6` |
| [F06-RemoteNumber-R2-Chrome-expanded-target.json](./dom/F06-RemoteNumber-R2-Chrome-expanded-target.json) | 14 | 0 | 7 | `50fbc6c7ba7359d609638fc22f1e128137700b9c6c3d1e8032af87b9b366e3dd` |
| [F06-RemoteNumber-R2-Chrome-folded-target.json](./dom/F06-RemoteNumber-R2-Chrome-folded-target.json) | 25 | 0 | 7 | `001920fb119715ed162e1b2f8329c8df5611ed37c7ee7a23af14695641f3b6f0` |
| [F06-RemoteNumber-R2-Chrome-restored-folded.json](./dom/F06-RemoteNumber-R2-Chrome-restored-folded.json) | 71 | 0 | 9 | `ae3bc90476df1a45611aa9ee94ff9d5cb7874d75f3683f5e3c0e9cc5fa1caba3` |
| [F06-RemoteNumber-R2-Chrome-source.json](./dom/F06-RemoteNumber-R2-Chrome-source.json) | 31 | 0 | 8 | `eaf8679dc71d07161d07f7b26232e208327c89a599c595d428a12ec0152f543a` |
| [F06-RemoteNumber-R2-Quark-expanded-target.json](./dom/F06-RemoteNumber-R2-Quark-expanded-target.json) | 28 | 0 | 11 | `6145f2b02f0e979cd7ddd177e053f439d469957d1e0e9ba1f2ca80b066d45bb1` |
| [F06-RemoteNumber-R2-Quark-folded-target.json](./dom/F06-RemoteNumber-R2-Quark-folded-target.json) | 12 | 0 | 10 | `bebe4d726be4b396c30580741afb2dd5206fc607ea7245f170ebb67ae98cbe32` |
| [F06-RemoteNumber-R2-Quark-history.json](./dom/F06-RemoteNumber-R2-Quark-history.json) | 60 | 6 | 13 | `f78822a57f76a7b3314a406626ad7f8de7705b288d6e72550ed4a70d24356695` |
| [F06-RemoteNumber-R2-Quark-source.json](./dom/F06-RemoteNumber-R2-Quark-source.json) | 6 | 0 | 7 | `ad45171d72434c30081283047af03d6ece73ec0715727d1bb9463eaf32aefcba` |
| [F06-RemoteNumber-R2-anomaly-recovery.json](./dom/F06-RemoteNumber-R2-anomaly-recovery.json) | 23 | 2 | 8 | `f481a58cf026ee32235a57877ae5fff51469e4046b6a76e2b9d61f61f516a83f` |
| [F06-RemoteNumber-R2-post-history-prefix-mismatch.json](./dom/F06-RemoteNumber-R2-post-history-prefix-mismatch.json) | 22 | 0 | 9 | `8e85d130ca346d7dd299236df4b61faccfa376f21333a048338a0d69835cbf8c` |
| [F06-RemoteNumber-R3-Chrome-expanded-target.json](./dom/F06-RemoteNumber-R3-Chrome-expanded-target.json) | 14 | 0 | 7 | `d9537595ea860748fc79d27a9155ed21e9e84549b214cc94a82e16c9c8694a1f` |
| [F06-RemoteNumber-R3-Chrome-folded-target.json](./dom/F06-RemoteNumber-R3-Chrome-folded-target.json) | 26 | 0 | 7 | `1d58dc279e0813453a45212e71d92d2991e2c7f6d41647060fbaa138f6fce77a` |
| [F06-RemoteNumber-R3-Chrome-restored-expanded.json](./dom/F06-RemoteNumber-R3-Chrome-restored-expanded.json) | 15 | 0 | 7 | `0ed179d3507e46dc7829b28f5b3cda4fa077ac032844ac9cbe127c5d95b18b66` |
| [F06-RemoteNumber-R3-Chrome-restored-folded.json](./dom/F06-RemoteNumber-R3-Chrome-restored-folded.json) | 67 | 0 | 11 | `a3c55ab93fcf33dffe120e65f42c4edda9818d3503038a850f0636ba887d7906` |
| [F06-RemoteNumber-R3-Chrome-source.json](./dom/F06-RemoteNumber-R3-Chrome-source.json) | 13 | 0 | 7 | `5dc70891eccd098c5f086183229bd8022b49b4f00eefdf35c6ae461922232fa0` |
| [F06-RemoteNumber-R3-Quark-expanded-target.json](./dom/F06-RemoteNumber-R3-Quark-expanded-target.json) | 25 | 0 | 7 | `cdea4e9fb5513c516814a081ff75e62acb2b60e395071c2d707cae90275cc6b4` |
| [F06-RemoteNumber-R3-Quark-folded-target-records.json](./dom/F06-RemoteNumber-R3-Quark-folded-target-records.json) | 16 | 0 | 0 | `84b6741b6c2dd8bf9c5d9cba24fdd0949d30666aa75c038a7ff3fd2f5e1b2450` |
| [F06-RemoteNumber-R3-Quark-folded-target.json](./dom/F06-RemoteNumber-R3-Quark-folded-target.json) | 0 | 0 | 11 | `21440ec9d4658912ee7b44148d254368ac226aab662b93a60ffe548a1e54086f` |
| [F06-RemoteNumber-R3-Quark-history.json](./dom/F06-RemoteNumber-R3-Quark-history.json) | 55 | 6 | 14 | `8bddd8408d42564de4324dc5a2d0581230351667dcaa57b64facd8de68208ab7` |
| [F06-RemoteNumber-R3-Quark-restored-expanded.json](./dom/F06-RemoteNumber-R3-Quark-restored-expanded.json) | 18 | 0 | 7 | `7261ceb6c0ac9339849f6fa9bac7a53f22aa742cca3ac78d98597d9604ce167b` |
| [F06-RemoteNumber-R3-Quark-source.json](./dom/F06-RemoteNumber-R3-Quark-source.json) | 12 | 0 | 11 | `66af520b1bad733ad99fa306455d2c191986ea5313038d0d71518d37d1e69bd8` |
| [F06-RemoteNumber-clean-expanded-source.json](./dom/F06-RemoteNumber-clean-expanded-source.json) | 20 | 0 | 9 | `fe5884761777042379f7de3ba478dee3a17262c4b71ab17400d03660e5b9260f` |
| [F06-RemoteNumber-clean-folded-source.json](./dom/F06-RemoteNumber-clean-folded-source.json) | 23 | 0 | 7 | `4cc91227a8a8f0823ceb34a9ad4c21ff2230810de26be6bdcf33c66b495c3bc9` |
| [F06-X0-Chrome-mixed-expanded-source.json](./dom/F06-X0-Chrome-mixed-expanded-source.json) | 44 | 1 | 12 | `03a550370d4ba4c9ae5274acc26dd7a79c9bec5c627f057419d2ce151acc3eef` |
| [F06-X0-Chrome-mixed-folded-source.json](./dom/F06-X0-Chrome-mixed-folded-source.json) | 17 | 0 | 7 | `232fe7f955b8538614616d7a98d1074b30da792278ec8f9ef47f405bdf73092b` |
| [F06-X1-Chrome-refold-confirmed.json](./dom/F06-X1-Chrome-refold-confirmed.json) | 19 | 0 | 7 | `d807355666e9ae9e714e89502d8f0995d3003094fe7ab51a1f7410c99cee0cde` |
| [F06-X1-Chrome-refold.json](./dom/F06-X1-Chrome-refold.json) | 0 | 0 | 6 | `4af582790fc6449345a26b58caaa056a21385cdf5031aa82fca97a444c869909` |
| [F06-X1-Chrome-reload-expanded.json](./dom/F06-X1-Chrome-reload-expanded.json) | 10 | 0 | 7 | `d637889a07c42293b4c4ce5e9a41a63b01bdc1af9a9348e759eb7d66a8054395` |
| [F06-X1-Chrome-reload-folded.json](./dom/F06-X1-Chrome-reload-folded.json) | 0 | 0 | 0 | `3d8fd7c76ba36f95a4fc7fb0963ee1e7ac9335277ca008f4a8fdd0e295ca5574` |
| [F06-X1-Quark-before-refresh.json](./dom/F06-X1-Quark-before-refresh.json) | 66 | 0 | 13 | `84e70cef48d2afa4834aef8854b5143f04a705895fa4d7212af214ba8b9572eb` |
| [F06-X1-Quark-refold.json](./dom/F06-X1-Quark-refold.json) | 23 | 0 | 9 | `3e13ccf807075278529c534c62c0bd77445aef8fbe8fc3a1aa1712ca7e2d7de3` |
| [F06-X1-Quark-reload-expanded.json](./dom/F06-X1-Quark-reload-expanded.json) | 22 | 0 | 8 | `17c0edbbcca0643bb6cfa3fe018c00f1db490742c384dc8ed1388aaf426c05e8` |
| [F06-X1-Quark-reload-folded.json](./dom/F06-X1-Quark-reload-folded.json) | 0 | 0 | 0 | `1d00cd338399dae49f1d545f2a86adc9c3e23873dc5a7b004b59c63052823cf1` |
| [F06-X2-Chrome-before-refresh.json](./dom/F06-X2-Chrome-before-refresh.json) | 28 | 0 | 11 | `1652bb982d38b60dd9392bb596e56cf06a9e3f20e6e4dd248a8ad18e36083ccf` |
| [F06-X2-Chrome-refold.json](./dom/F06-X2-Chrome-refold.json) | 19 | 0 | 7 | `8b01dbb37194a23b86a4f0051bab6a38e8d08d6a4016550cd91df8b83f19247a` |
| [F06-X2-Chrome-reload-expanded.json](./dom/F06-X2-Chrome-reload-expanded.json) | 10 | 0 | 7 | `4e6bec897915ce50e31d38f90f5285edef160e2e3de7c5c5e493ab387ce537dd` |
| [F06-X2-Chrome-reload-folded.json](./dom/F06-X2-Chrome-reload-folded.json) | 0 | 0 | 0 | `27dd35eca4a6285d91e67099dbfe7e5baad19cf5113f0c0213eb3559ed498b8d` |
| [F06-X2-Quark-before-refresh.json](./dom/F06-X2-Quark-before-refresh.json) | 24 | 0 | 11 | `f1564dae585098121363b596d8cd7f5aed444fb2dd82aa866067770982cdac28` |
| [F06-X2-Quark-refold.json](./dom/F06-X2-Quark-refold.json) | 31 | 0 | 7 | `f4c4a9fc6dcf0acc51d1c65b660e4397d57c670abf292024455006c7b57b06ad` |
| [F06-X2-Quark-reload-expanded.json](./dom/F06-X2-Quark-reload-expanded.json) | 14 | 0 | 7 | `3f567e8d04a9d85876db7778628e450fe42f0aa493da30ae74adb885489465fd` |
| [F06-X2-Quark-reload-folded.json](./dom/F06-X2-Quark-reload-folded.json) | 0 | 0 | 0 | `dc7f6231eac286317f327f48ec898dc9f0020c7762ed88d9b89860641ddac89a` |
| [F06-find-focus-paste-anomaly-and-recovery.json](./dom/F06-find-focus-paste-anomaly-and-recovery.json) | 34 | 2 | 2 | `9a31e3188e1d7318f5d980261010387d7c004ad77aa05e62625e0a079c96b59c` |
| [F06-find-number-marker-R1.json](./dom/F06-find-number-marker-R1.json) | 1 | 0 | 0 | `af1f1c1ba46effc79ea0d5988fa09051a4451f8405011ce34245703d0ffb6e1f` |
| [F06-find-number-marker-R2.json](./dom/F06-find-number-marker-R2.json) | 2 | 0 | 0 | `56d51b34534cecc1c90b8ac889b02780db41d72bc22888534930e2cfab57bf5d` |
| [F06-folded-body-paste-R1.json](./dom/F06-folded-body-paste-R1.json) | 33 | 2 | 10 | `390faf6c83395d02723cbc378389afbdb1ca32e33e0d859eeb38677f2e6634e5` |
| [F06-folded-body-paste-R2.json](./dom/F06-folded-body-paste-R2.json) | 33 | 2 | 10 | `123e413a3f3c33421295305b4845bbfb94b3874b6877147174c4c091a7891a14` |
| [F06-folded-body-paste-R3.json](./dom/F06-folded-body-paste-R3.json) | 42 | 2 | 12 | `17a271568012b56b1c37d3d4fe3a5570bf2a2759d4603e1990d7290d0ad18eb9` |
| [F06-folded-body-paste-expand-R2.json](./dom/F06-folded-body-paste-expand-R2.json) | 9 | 0 | 7 | `818d0df9c473ab7e13304f93d934628ccb95b89d8e292fe45c0c07f13efee0fc` |
| [F06-folded-body-paste-expand-R3.json](./dom/F06-folded-body-paste-expand-R3.json) | 13 | 0 | 7 | `7c836d8c943c4f5056609caf349e59c100fa97a317537836d8d4a657432eb418` |
| [F06-folded-body-paste-history-R1.json](./dom/F06-folded-body-paste-history-R1.json) | 26 | 3 | 10 | `cdfa69ef0c36ec118e31f272c24676ec3af57044a62ff435b9719709ea89e383` |
| [F06-folded-body-paste-history-R2.json](./dom/F06-folded-body-paste-history-R2.json) | 60 | 3 | 12 | `b2f7d26af0f1b6d8da2eb650857cf634c102d7a33fdbc2eb94fdc4a995db07d4` |
| [F06-folded-body-paste-history-R3.json](./dom/F06-folded-body-paste-history-R3.json) | 48 | 3 | 15 | `5335d8a31d8524744b3a2f5cecd0ef432449c4d38dd66d38fe74bc4e30ae14fc` |
| [F06-folded-copy-plain-probe-R1.json](./dom/F06-folded-copy-plain-probe-R1.json) | 0 | 0 | 6 | `768ed2c0ebe17c774b2e189d2e5ede7416d4edc768a357a94bab25dfe12bcb02` |
| [F06-folded-find-BBB-R1.json](./dom/F06-folded-find-BBB-R1.json) | 11 | 0 | 4 | `253a2b50648b31686509ba0386d217cb79faa98c8ac60045637f696161942a2a` |
| [F06-folded-find-BBB-R2.json](./dom/F06-folded-find-BBB-R2.json) | 17 | 0 | 4 | `336a37db53b6f93018cc482190bc409090479bf63442088cbfb5bdc3031186f0` |
| [F06-folded-word-export-settings-R1.json](./dom/F06-folded-word-export-settings-R1.json) | 0 | 0 | 4 | `30e9d8eee6af869405c9b174fd3eb5bb0e60f9f891dde75571ca6dce27089db2` |
| [F06-folded-word-export-settings-R2.json](./dom/F06-folded-word-export-settings-R2.json) | 0 | 0 | 8 | `76de34d02b0e7152fa960cced10516e7823a10850819a96c6717fae9dcdee39b` |
| [F06-folded-word-export-source-R1.json](./dom/F06-folded-word-export-source-R1.json) | 22 | 0 | 4 | `e7d6f8afde18fcb9259022cdb88646f69d3bc8629be5c62eefe3f0310034b855` |
| [F06-heading1-fold-history-R1.json](./dom/F06-heading1-fold-history-R1.json) | 54 | 3 | 0 | `228b60fb552a5c848d3f6a8bd81f3e82c21f9e5449d0aa8c703025be5f71fd2b` |
| [F06-heading1-fold-history-R2.json](./dom/F06-heading1-fold-history-R2.json) | 54 | 3 | 0 | `80b22838ee4b1f6d9f49cf523f5d8c5a9f75daf99b6fe5b452a069a62242504e` |
| [F06-heading9-fold-history-R1.json](./dom/F06-heading9-fold-history-R1.json) | 53 | 3 | 0 | `49cf32a503d969b538c8bfb6bb284f7575757cec1108ad069aba1836c8895cb1` |
| [F06-heading9-fold-history-R2.json](./dom/F06-heading9-fold-history-R2.json) | 48 | 3 | 0 | `5fc0d40628af6918620bd1e3e7ff6583afeb4e226e6bbeaaa6dbe8fda8674c99` |
| [F06-pasted-hidden-content-inspect-R1.json](./dom/F06-pasted-hidden-content-inspect-R1.json) | 41 | 1 | 0 | `5691c4cff09514c05c40bd2bba0cd6c72faee53b537ba99ea3bb351ab930e8d3` |
| [F06-pasted-hidden-content-inspect-R2.json](./dom/F06-pasted-hidden-content-inspect-R2.json) | 41 | 1 | 0 | `d535b55da10631ef8a5f5ef0c4c8e83521443c5d456b16baab29b46d780cb7bc` |
| [F06-pasted-hidden-content-restore-R1.json](./dom/F06-pasted-hidden-content-restore-R1.json) | 40 | 2 | 0 | `e7bf194d5b55a6be30d69868eb8f750d18980bbcb5a583c54fc0316c4e22d743` |
| [F06-pasted-hidden-content-restore-R2.json](./dom/F06-pasted-hidden-content-restore-R2.json) | 39 | 2 | 0 | `af12c46138bb20134c3a9f93a2a2d578d090dd3e6224f35ac647471d55ace5f4` |
| [F06-structured-paste-clean-R1.json](./dom/F06-structured-paste-clean-R1.json) | 64 | 5 | 0 | `fe93cdcf9b411397b55f23f4061d9d73629aced2b734384372bdee6d98dda02b` |
| [F06-structured-paste-clean-history-interruption-R1.json](./dom/F06-structured-paste-clean-history-interruption-R1.json) | 16 | 1 | 0 | `ca607cb7d73afb1b1188ce5caf449f5872209b46c1abc0dbc825026e842ef35a` |
| [F06-structured-paste-continuous-R1.json](./dom/F06-structured-paste-continuous-R1.json) | 103 | 9 | 0 | `57c4c8717abb73b0052aadb3b2e6870ff65207bbfdbde360cfca08bc007718b7` |
| [F06-structured-paste-continuous-R2.json](./dom/F06-structured-paste-continuous-R2.json) | 103 | 9 | 0 | `f25dee3e686ed71c969aee6ac26a0d356590ccbd5ce42dc6c9e4b9e78bba3a18` |
| [F06-structured-paste-delayed-undo-probe.json](./dom/F06-structured-paste-delayed-undo-probe.json) | 14 | 1 | 0 | `69bd02ac1f1cada2a39e712c32f979b87a981e2a57e08445c932281fc11dba9e` |
| [F06-structured-paste-last-tail-undo-probe.json](./dom/F06-structured-paste-last-tail-undo-probe.json) | 26 | 1 | 0 | `96a5364115c6f3bbbe183f199bfc9f715ef7d1d32cfbc5947ad74d254d1ecaf4` |
| [F06-structured-paste-stable-R1.json](./dom/F06-structured-paste-stable-R1.json) | 63 | 5 | 0 | `3b9cd65ca548fe47423f026491fa6ac45497f749412e0c9001f2a30194168843` |
| [F06-structured-paste-stable-R2.json](./dom/F06-structured-paste-stable-R2.json) | 63 | 5 | 0 | `13d8f99b48c96bfd1e34275c96514e44073df0a0a9ea812fcb60bd1637a954a6` |
| [F06-structured-paste-stable-history-R1.json](./dom/F06-structured-paste-stable-history-R1.json) | 32 | 2 | 0 | `91453c3c97d11c5916a73556419098404a3d12183a17ef943c29c96284ebb971` |
| [F06-structured-paste-stable-history-interruption-R2.json](./dom/F06-structured-paste-stable-history-interruption-R2.json) | 2 | 1 | 0 | `2f5ad7925908ff84b0442badb404df67aef3ec7cfdad288548ddeaabf98dfaac` |
| [F06-structured-paste-stable-undo-R1.json](./dom/F06-structured-paste-stable-undo-R1.json) | 12 | 2 | 0 | `1320fafff807e2a3ff4d6517670f7ee8f923813bd254116ce6c12bb7c8b3038b` |
| [F06-word-exports-complete-resumed.json](./dom/F06-word-exports-complete-resumed.json) | 0 | 0 | 1 | `ff8c98949899c13483ccd2ae3d18c9dbb8ba1914ae1dda64e9607c260207fd08` |
| [F07-duplicate-heading1-double.json](./dom/F07-duplicate-heading1-double.json) | 44 | 8 | 24 | `18c8b646fbcd854e9317e83ef655604aca7049791698a8a259beeeb1b23c1cdf` |
| [F07-duplicate-heading1-navigation-R1.json](./dom/F07-duplicate-heading1-navigation-R1.json) | 6 | 0 | 7 | `fab7f439a34df4eefa4a3e1e127d51cd499c6e24e86859237295605423ec7cce` |
| [F07-duplicate-heading1-navigation-R2.json](./dom/F07-duplicate-heading1-navigation-R2.json) | 6 | 0 | 8 | `e85199ffacc2c08503848679d08ba7773f5295fd6e68e2c579c1ba8725919139` |
| [F07-duplicate-heading1-navigation-source-R1.json](./dom/F07-duplicate-heading1-navigation-source-R1.json) | 14 | 0 | 6 | `84c81f38cdb9fccdb8c382af58272fddd2d9aa3d76d6ffb517cb5bb1981a8ee5` |
| [F07-duplicate-heading1-navigation-source-R2.json](./dom/F07-duplicate-heading1-navigation-source-R2.json) | 6 | 0 | 7 | `84a451feb6f45ad3292d0ffbcf9501c22475fcce2016e2d3abc51e98235a5c66` |
| [F07-duplicate-heading9-double.json](./dom/F07-duplicate-heading9-double.json) | 44 | 8 | 24 | `78c508c415525a6f015c3c68ae222802408516749b8d1853714c32d5498983cd` |
| [F07-duplicate-heading9-navigation-R1.json](./dom/F07-duplicate-heading9-navigation-R1.json) | 6 | 0 | 7 | `84fd518d40c31990233cbb4a68ede90b02dec771dba936a8de268f9adbbc6032` |
| [F07-duplicate-heading9-navigation-R2.json](./dom/F07-duplicate-heading9-navigation-R2.json) | 6 | 0 | 7 | `135724622c3bb879d4480274decd6daaeeb71e0d8b03c795cccaa609d508e88c` |
| [F07-duplicate-heading9-navigation-source-R1.json](./dom/F07-duplicate-heading9-navigation-source-R1.json) | 8 | 0 | 7 | `1a1e66f4fda888f7a8b9f807aa6f9ee7a84997a2e18619383a2a7a51cee0843d` |
| [F07-duplicate-heading9-navigation-source-R2.json](./dom/F07-duplicate-heading9-navigation-source-R2.json) | 6 | 0 | 7 | `3f72c415437264991d0fb529d847b4a0b0155196cda72150b14aa7e1fffb0765` |
| [F07-empty-heading1-double.json](./dom/F07-empty-heading1-double.json) | 79 | 8 | 16 | `b09ff2f8023bed10e674301d7ed63a20b1a591e34ce69665cf566677d83dd8a5` |
| [F07-empty-heading1-navigation-R1.json](./dom/F07-empty-heading1-navigation-R1.json) | 6 | 0 | 7 | `5d040b33563d849bff51f1398d81f79f858f95af62298723f93441c57188e49f` |
| [F07-empty-heading1-navigation-R2.json](./dom/F07-empty-heading1-navigation-R2.json) | 6 | 0 | 7 | `15d89ce1cf3dde52b6347c088a7a5d1dc3f4d9de835758de2c5559249ef83dee` |
| [F07-empty-heading1-navigation-source-R1.json](./dom/F07-empty-heading1-navigation-source-R1.json) | 8 | 0 | 7 | `539e1418ad914978f4a5224a77a0bfee854340ac04e45a852e64f9831065c712` |
| [F07-empty-heading1-navigation-source-R2.json](./dom/F07-empty-heading1-navigation-source-R2.json) | 6 | 0 | 7 | `4dc8b5bf222a015ae8ebd6ea29d290066b2eb403852c742dd0cd49117d2094de` |
| [F07-empty-heading9-double.json](./dom/F07-empty-heading9-double.json) | 73 | 8 | 24 | `e7f092a033798bedf486fdeb00dcb1e33ecc68e3f3a6d0a3c3792a42c175b4a5` |
| [F07-empty-heading9-navigation-R1.json](./dom/F07-empty-heading9-navigation-R1.json) | 6 | 0 | 7 | `8af9a2ae8e92f392a7bcfc0327de051dd36c2631bbe1635fe80819d7b16b235a` |
| [F07-empty-heading9-navigation-R2.json](./dom/F07-empty-heading9-navigation-R2.json) | 6 | 0 | 8 | `430f657687c8d3ea6c7f0db33d86f9cb1bc3cbba37101f80d59cad6dc2185bfc` |
| [F07-empty-heading9-navigation-source-R1.json](./dom/F07-empty-heading9-navigation-source-R1.json) | 18 | 0 | 9 | `20444ffefb2476858fbf732bc5d675106fe5c232d36416de22900de59319f33b` |
| [F07-empty-heading9-navigation-source-R2.json](./dom/F07-empty-heading9-navigation-source-R2.json) | 20 | 0 | 6 | `7d471c9f6de374aaefa8a06e77af2cbb386ae228c7da06ebd89715bf9b9a011e` |
| [F07-heading1-nine-ten-eleven-R1.json](./dom/F07-heading1-nine-ten-eleven-R1.json) | 10 | 0 | 9 | `221de763f9a779a9384af751f089e4c4ac90296cac998ed246f179ee5b5e8f77` |
| [F07-heading1-nine-ten-eleven-R2.json](./dom/F07-heading1-nine-ten-eleven-R2.json) | 10 | 0 | 10 | `96e60cfe091ce1e95932043406e90b993eb265bd9ffa60158c29a8f046ac7df7` |
| [F07-heading1-nine-ten-eleven-history-R1.json](./dom/F07-heading1-nine-ten-eleven-history-R1.json) | 18 | 3 | 9 | `eb6f2dae18d18ccb143a1e7abce17835feb269ae6126022b3cca60f6a305a3b1` |
| [F07-heading1-nine-ten-eleven-history-R2.json](./dom/F07-heading1-nine-ten-eleven-history-R2.json) | 18 | 3 | 9 | `495acb4262358b90ddcb36439681c71db7d8a750067b67d386ba4e3fcef04c7c` |
| [F07-heading1-nine-ten-eleven-source-R1.json](./dom/F07-heading1-nine-ten-eleven-source-R1.json) | 11 | 0 | 6 | `4306f9a2d49e32e1031ca0604d76933a1834b3c9f6f098cccf3e3123d51c503a` |
| [F07-heading1-nine-ten-eleven-source-R2.json](./dom/F07-heading1-nine-ten-eleven-source-R2.json) | 0 | 0 | 6 | `e718a79cc6e7317c706a5fbf4b7ff6bfb48977f541f462549a1274768b5453bc` |
| [F07-heading9-nine-ten-eleven-R1.json](./dom/F07-heading9-nine-ten-eleven-R1.json) | 10 | 0 | 10 | `c19a8bb70f68f318a3a098cca294e81ec4abf4ce1acd2a2b77f08e35d644961c` |
| [F07-heading9-nine-ten-eleven-R2.json](./dom/F07-heading9-nine-ten-eleven-R2.json) | 10 | 0 | 10 | `5970218184566aa7df821bd8a0032e14ce1b8822cbd99ce66a10eabe43c80049` |
| [F07-heading9-nine-ten-eleven-history-R1.json](./dom/F07-heading9-nine-ten-eleven-history-R1.json) | 18 | 3 | 9 | `6586a9bb6d36f2854d6b57cfd8771f538a7507bcec44cf464dbc07bd11cdea9d` |
| [F07-heading9-nine-ten-eleven-history-R2.json](./dom/F07-heading9-nine-ten-eleven-history-R2.json) | 18 | 3 | 9 | `8fcdf4daaaaed1d9a96a7eaa765a1a1fd31621ac169cc4f76a1906dd6150822e` |
| [F07-heading9-nine-ten-eleven-source-R1.json](./dom/F07-heading9-nine-ten-eleven-source-R1.json) | 11 | 0 | 6 | `cddb4f7786545a25a1dc117912454003262f787b0e591087981818eecb603b32` |
| [F07-heading9-nine-ten-eleven-source-R2.json](./dom/F07-heading9-nine-ten-eleven-source-R2.json) | 0 | 0 | 6 | `825d434bff3a4b711ad094d287c0379f4052a08b9384c646acdf25473b783830` |
| [F07-hidden-list-expanded-R1.json](./dom/F07-hidden-list-expanded-R1.json) | 17 | 0 | 7 | `9d60c8db1dadb0db7965025778f9d540a09fd20ed8c9bf96ae18220647467998` |
| [F07-hidden-list-expanded-R2.json](./dom/F07-hidden-list-expanded-R2.json) | 15 | 0 | 7 | `66f8dd38d369d61a66466b0946782c0152ae6d23da00ad633f7524dc249dedfe` |
| [F07-hidden-list-folded-R1.json](./dom/F07-hidden-list-folded-R1.json) | 9 | 0 | 12 | `99d7c3677899f34d1348d363265ea57c9a3f4a6d31f6e6d1e8d3dc66a5d474b1` |
| [F07-hidden-list-folded-R2.json](./dom/F07-hidden-list-folded-R2.json) | 7 | 0 | 12 | `ab11441ea2cdcd4eb057e2c0d4204c8e217cacccb3247e460ec1907ab6082fe7` |
| [F07-hidden-list-history-R1.json](./dom/F07-hidden-list-history-R1.json) | 54 | 6 | 9 | `9bd09e3106a0aecfb49c04e387f1c9eb6b0bf9ffac73e30fad90e13f91754e8b` |
| [F07-hidden-list-history-R2.json](./dom/F07-hidden-list-history-R2.json) | 52 | 6 | 9 | `f92dd98619a77df27ffdf42c5eebee2b33436a345ef11a9fcdd71f3408a67888` |
| [F07-hidden-list-source-R1.json](./dom/F07-hidden-list-source-R1.json) | 23 | 0 | 7 | `a72cb8aee6e75b93c1021d2803eb3f3f7de4c256f1a68d5598d5c289e1144796` |
| [F07-hidden-list-source-R2.json](./dom/F07-hidden-list-source-R2.json) | 0 | 0 | 6 | `fb1e354456001f8746d1029e4484c90f7fe42eb98f80672d15d96cb28634551a` |
| [F07-hidden-numbering-AXvalue-no-change.json](./dom/F07-hidden-numbering-AXvalue-no-change.json) | 6 | 0 | 9 | `65189c19a336e90152afcb627bd36881b3bc0064dc923e7cff83b7d3117650b1` |
| [F07-hidden-numbering-native-probe-expanded.json](./dom/F07-hidden-numbering-native-probe-expanded.json) | 17 | 0 | 7 | `41d3fe1eb3ef7604dc14f64daefff6ad19fcd743b765b0083ec36f70140a4927` |
| [F07-hidden-numbering-native-probe-history.json](./dom/F07-hidden-numbering-native-probe-history.json) | 49 | 6 | 12 | `79adb343c0c08610614635f80f086f7b879f242ab8681351accec42a044e0ca0` |
| [F07-hidden-numbering-native-probe.json](./dom/F07-hidden-numbering-native-probe.json) | 6 | 0 | 10 | `740ef64ae77c83ad091964e294dca90b59ff471dbc41e641ef6cb6f8b4768853` |
| [F07-hidden-numbering-paste-blur-R2-expanded.json](./dom/F07-hidden-numbering-paste-blur-R2-expanded.json) | 13 | 0 | 7 | `2345f696aef8d7dc596bd5df7ede4c72951229174733c6c5f57f1e85acbd4fcf` |
| [F07-hidden-numbering-paste-blur-R2-history.json](./dom/F07-hidden-numbering-paste-blur-R2-history.json) | 49 | 7 | 14 | `7535942f2fb565a6fe365e836684a88d856f79bc40ac7d1877c604b87b076743` |
| [F07-hidden-numbering-paste-blur-R2.json](./dom/F07-hidden-numbering-paste-blur-R2.json) | 8 | 0 | 10 | `f37c8f06fa3d020f7bf99a199deb10ff76cc768aa3ac60b332fa156ede6739b5` |
| [F07-hidden-numbering-paste-blur-probe-expanded.json](./dom/F07-hidden-numbering-paste-blur-probe-expanded.json) | 13 | 0 | 7 | `9696b329f4bc168c96e61b6ecd40954e5f6a4e96672b66a52938cd0e8ea3d6c5` |
| [F07-hidden-numbering-paste-blur-probe-history.json](./dom/F07-hidden-numbering-paste-blur-probe-history.json) | 51 | 6 | 12 | `b0978d65e5bf0c4fe9bc140e102b6a0ea6976ad6523b5efe8c69489c52eeb43a` |
| [F07-hidden-numbering-paste-blur-probe.json](./dom/F07-hidden-numbering-paste-blur-probe.json) | 8 | 0 | 10 | `f7cefad3693f54febcd58d1dcc585cf7fca6e0082a37c84a4c296d80a008a167` |
| [F07-hidden-numbering-paste-blur-source-R2.json](./dom/F07-hidden-numbering-paste-blur-source-R2.json) | 2 | 0 | 6 | `5d9abfe2e2847a9c2576eabc3c98e7795d0c32ec9ba5a8d72d30e6cced570186` |
| [F07-hidden-numbering-paste-expanded-R1.json](./dom/F07-hidden-numbering-paste-expanded-R1.json) | 13 | 0 | 7 | `695714d6c9ca03ecec3afc84cde55bf2934bed9af8ead64803aaddff60b89ba1` |
| [F07-hidden-numbering-paste-folded-R1.json](./dom/F07-hidden-numbering-paste-folded-R1.json) | 8 | 0 | 10 | `6c652807231918c1f13473869aa79904f1ffcfbf5e0493b01d94cda8f9ad1951` |
| [F07-hidden-numbering-paste-history-R1.json](./dom/F07-hidden-numbering-paste-history-R1.json) | 51 | 6 | 12 | `d3ce775494315303b328bdf53dd5dd7d06a63ff3727e2d512e9e8f3c55cee0ec` |
| [F07-hidden-numbering-paste-no-change-R2.json](./dom/F07-hidden-numbering-paste-no-change-R2.json) | 8 | 0 | 9 | `6530893f55f4ed34faa1d13ad9dac5d03e9b5146c58e3490780b65cef2e77234` |
| [F07-hidden-numbering-paste-source-R1.json](./dom/F07-hidden-numbering-paste-source-R1.json) | 2 | 0 | 6 | `32ae4874a67dd51b252947b196922cb5bfcd64999e5d5efa8b5065ec3557d3c8` |
| [F07-hidden-numbering-paste-source-R2.json](./dom/F07-hidden-numbering-paste-source-R2.json) | 2 | 0 | 6 | `9dd7ee147337ae7bb93f628b5de31b2094992446e1105fd0845987afa9d629bd` |
| [F07-hidden-numbering-source-R1.json](./dom/F07-hidden-numbering-source-R1.json) | 23 | 0 | 7 | `72b2db468051ada9d9d768c304c7e3f0bf36a7b123a23a0a8263fb699dd9d0db` |
| [F07-list-nine-ten-eleven-R1.json](./dom/F07-list-nine-ten-eleven-R1.json) | 24 | 0 | 5 | `7a0a0e1f5820b04283d0548d1eb1cbaf12c4c25e9ab64941dac23ad7ae62af11` |
| [F07-list-nine-ten-eleven-R2.json](./dom/F07-list-nine-ten-eleven-R2.json) | 11 | 0 | 6 | `3db38183fc71a2c3f79d47dd4fbd1c07e635a14e296304364948db34efb469a8` |
| [F07-list-nine-ten-eleven-R3.json](./dom/F07-list-nine-ten-eleven-R3.json) | 11 | 0 | 6 | `2e90fc871d9bda1118adb9bd1d5fcf96303af4dbf6a0469535343af77bbea4c3` |
| [F07-list-nine-ten-eleven-history-R1.json](./dom/F07-list-nine-ten-eleven-history-R1.json) | 27 | 3 | 0 | `b9ac2c830f6380c9bc7525b3620fcc26254bd26c300a95736db79346652d4ea6` |
| [F07-list-nine-ten-eleven-history-R2.json](./dom/F07-list-nine-ten-eleven-history-R2.json) | 21 | 3 | 0 | `ae01436630329f06f1d0748539c112a74017548d8f49ebb6a22bef5d85f53d3a` |
| [F07-list-nine-ten-eleven-history-R3.json](./dom/F07-list-nine-ten-eleven-history-R3.json) | 21 | 3 | 0 | `a5182edcbd0abeadff69201601053ad1ec0f3d691bb47da879f198ce91f5c373` |
| [F07-list-nine-ten-eleven-source-R2.json](./dom/F07-list-nine-ten-eleven-source-R2.json) | 2 | 0 | 0 | `38861426672710b13cdcc42dc7e118a66c56bc0d14530ec8dbd38a3138c1c9d6` |
| [F07-list-nine-ten-eleven-source-R3.json](./dom/F07-list-nine-ten-eleven-source-R3.json) | 0 | 0 | 0 | `75cf0e5f1db7d5e6eb7b6974e8f3c5b086429d34011a265912fce1b0c3f83573` |
