# S03 单块转换运行矩阵

当前仅列真实执行窗口；C02初批为快捷键、C03含同类型入口、C07-case为菜单、C08为标题编号。起点以各JSON为准，不能把相同类型但编号或选区不同的窗口混为重复。每个动作的时间、可信按键、前后DOM、选区、mutation与历史状态见JSON。C07-case为真实事件编号及采样状态导出的独立窗口，不是重放模拟；H2–H8不计实测。

| 用例 | 运行数 | 转换后类型 | mutation / 事件 | 证据 |
| --- | --- | --- | --- | --- |
| C00-completion-fixtures-1792060063191-part01 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 52 / 24 | [JSON](./dom/C00-completion-fixtures-1792060063191-part01.json) |
| C00-completion-fixtures-1792060063191-part02 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 43 / 32 | [JSON](./dom/C00-completion-fixtures-1792060063191-part02.json) |
| C00-completion-fixtures-1792060063191-part03 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 67 / 26 | [JSON](./dom/C00-completion-fixtures-1792060063191-part03.json) |
| C00-completion-fixtures-1792060063191-part04 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 132 / 52 | [JSON](./dom/C00-completion-fixtures-1792060063191-part04.json) |
| C00-completion-fixtures-1792060063191-part05 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 53 / 23 | [JSON](./dom/C00-completion-fixtures-1792060063191-part05.json) |
| C00-completion-fixtures-1792060063191-part06 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 17 / 12 | [JSON](./dom/C00-completion-fixtures-1792060063191-part06.json) |
| C00-completion-fixtures-1792060063191-part07 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 32 / 21 | [JSON](./dom/C00-completion-fixtures-1792060063191-part07.json) |
| C00-completion-fixtures-1792060063191-part08 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 46 / 35 | [JSON](./dom/C00-completion-fixtures-1792060063191-part08.json) |
| C00-completion-fixtures-1792060063191-part09 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 14 / 10 | [JSON](./dom/C00-completion-fixtures-1792060063191-part09.json) |
| C00-completion-fixtures-1792060063191-part10 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 27 / 15 | [JSON](./dom/C00-completion-fixtures-1792060063191-part10.json) |
| C00-completion-fixtures-1792060063191-part11 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 15 / 5 | [JSON](./dom/C00-completion-fixtures-1792060063191-part11.json) |
| C00-completion-fixtures-1792060063191-part12 | 1 | 见动作序列（末态不能冒充转换态） | 15 / 10 | [JSON](./dom/C00-completion-fixtures-1792060063191-part12.json) |
| C00-completion-fixtures-1792063694454-part01 | 1 | 见动作序列（末态不能冒充转换态） | 16 / 12 | [JSON](./dom/C00-completion-fixtures-1792063694454-part01.json) |
| C00-completion-fixtures-1792063809225-part01 | 1 | 见动作序列（末态不能冒充转换态） | 16 / 12 | [JSON](./dom/C00-completion-fixtures-1792063809225-part01.json) |
| C00-completion-fixtures-1792063920007-part01 | 1 | 见动作序列（末态不能冒充转换态） | 16 / 12 | [JSON](./dom/C00-completion-fixtures-1792063920007-part01.json) |
| C00-completion-fixtures-1792064028237-part01 | 1 | 见动作序列（末态不能冒充转换态） | 16 / 12 | [JSON](./dom/C00-completion-fixtures-1792064028237-part01.json) |
| C00-completion-fixtures-1792064155379-part01 | 1 | 见动作序列（末态不能冒充转换态） | 9 / 12 | [JSON](./dom/C00-completion-fixtures-1792064155379-part01.json) |
| C00-container-fixtures | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 67 / 37 | [JSON](./dom/C00-container-fixtures.json) |
| C00-content-boundaries | 4 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 57 / 34 | [JSON](./dom/C00-content-boundaries.json) |
| C00-fold-repeat-fresh | 1 | 见动作序列（末态不能冒充转换态） | 34 / 19 | [JSON](./dom/C00-fold-repeat-fresh.json) |
| C00-indent-precondition | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 37 / 21 | [JSON](./dom/C00-indent-precondition.json) |
| C00-indented-ordered-source | 1 | 见动作序列（末态不能冒充转换态） | 17 / 12 | [JSON](./dom/C00-indented-ordered-source.json) |
| C00-nonempty-slash-source | 1 | 见动作序列（末态不能冒充转换态） | 58 / 18 | [JSON](./dom/C00-nonempty-slash-source.json) |
| C00-persist-nested-heading9-cycle2-source | 1 | 见动作序列（末态不能冒充转换态） | 29 / 17 | [JSON](./dom/C00-persist-nested-heading9-cycle2-source.json) |
| C00-progress-checkpoint-cleanup | 1 | 见动作序列（末态不能冒充转换态） | 14 / 13 | [JSON](./dom/C00-progress-checkpoint-cleanup.json) |
| C00-resume-parent-fixture-cleanup | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 81 / 41 | [JSON](./dom/C00-resume-parent-fixture-cleanup.json) |
| C00-resume-right-fixtures | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 36 / 31 | [JSON](./dom/C00-resume-right-fixtures.json) |
| C00-resume-title-fixtures | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 13 / 8 | [JSON](./dom/C00-resume-title-fixtures.json) |
| C00-rich-format-fixture | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 159 / 95 | [JSON](./dom/C00-rich-format-fixture.json) |
| C00-s03-final-cleanup | 1 | 见动作序列（末态不能冒充转换态） | 27 / 10 | [JSON](./dom/C00-s03-final-cleanup.json) |
| C00-setup-and-menu-recovery | 5 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 94 / 76 | [JSON](./dom/C00-setup-and-menu-recovery.json) |
| C00-text-noop-fixtures | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 19 / 8 | [JSON](./dom/C00-text-noop-fixtures.json) |
| C00-whole-block-fixtures | 5 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 81 / 2 | [JSON](./dom/C00-whole-block-fixtures.json) |
| C01-title-empty-and-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 42 / 37 | [JSON](./dom/C01-title-empty-and-quote.json) |
| C01-title-history-boundary | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 30 / 22 | [JSON](./dom/C01-title-history-boundary.json) |
| C01-title-menu | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 25 / 37 | [JSON](./dom/C01-title-menu.json) |
| C01-title-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 0 / 10 | [JSON](./dom/C01-title-shortcuts.json) |
| C02-bullet-heading1 | 2 | heading1 / heading1 | 96 / 40 | [JSON](./dom/C02-bullet-heading1.json) |
| C02-bullet-heading9 | 3 | heading9 / heading9 / heading9 | 108 / 47 | [JSON](./dom/C02-bullet-heading9.json) |
| C02-bullet-ordered | 2 | ordered / ordered | 90 / 40 | [JSON](./dom/C02-bullet-ordered.json) |
| C02-bullet-text | 2 | text / text | 88 / 40 | [JSON](./dom/C02-bullet-text.json) |
| C02-heading1-bullet | 2 | bullet / bullet | 96 / 40 | [JSON](./dom/C02-heading1-bullet.json) |
| C02-heading1-heading9 | 2 | heading9 / heading9 | 104 / 40 | [JSON](./dom/C02-heading1-heading9.json) |
| C02-heading1-ordered | 2 | heading1 / heading1 | 6 / 2 | [JSON](./dom/C02-heading1-ordered.json) |
| C02-heading1-text | 2 | text / text | 96 / 42 | [JSON](./dom/C02-heading1-text.json) |
| C02-heading9-bullet | 4 | bullet / bullet / bullet / bullet | 156 / 68 | [JSON](./dom/C02-heading9-bullet.json) |
| C02-heading9-heading1 | 2 | heading1 / heading1 | 104 / 40 | [JSON](./dom/C02-heading9-heading1.json) |
| C02-heading9-ordered | 2 | heading9 / heading9 | 6 / 2 | [JSON](./dom/C02-heading9-ordered.json) |
| C02-heading9-text | 2 | text / text | 96 / 40 | [JSON](./dom/C02-heading9-text.json) |
| C02-menu-text-quote | 3 | 见动作序列（末态不能冒充转换态） / quote_container,text / quote_container,text | 69 / 73 | [JSON](./dom/C02-menu-text-quote.json) |
| C02-ordered-bullet | 2 | bullet / bullet | 88 / 41 | [JSON](./dom/C02-ordered-bullet.json) |
| C02-ordered-heading1 | 2 | heading1 / heading1 | 96 / 41 | [JSON](./dom/C02-ordered-heading1.json) |
| C02-ordered-heading9 | 2 | heading9 / heading9 | 96 / 41 | [JSON](./dom/C02-ordered-heading9.json) |
| C02-ordered-text | 2 | text / text | 88 / 44 | [JSON](./dom/C02-ordered-text.json) |
| C02-quote-child-bullet | 2 | quote_container,bullet / quote_container,bullet | 88 / 40 | [JSON](./dom/C02-quote-child-bullet.json) |
| C02-quote-child-heading1 | 2 | quote_container,heading1 / quote_container,heading1 | 96 / 41 | [JSON](./dom/C02-quote-child-heading1.json) |
| C02-quote-child-heading9 | 2 | quote_container,heading9 / quote_container,heading9 | 96 / 42 | [JSON](./dom/C02-quote-child-heading9.json) |
| C02-quote-child-ordered | 2 | quote_container,ordered / quote_container,ordered | 90 / 40 | [JSON](./dom/C02-quote-child-ordered.json) |
| C02-quote-child-text | 2 | quote_container,text / quote_container,text | 0 / 2 | [JSON](./dom/C02-quote-child-text.json) |
| C02-text-bullet | 2 | bullet / bullet | 88 / 45 | [JSON](./dom/C02-text-bullet.json) |
| C02-text-heading1 | 2 | heading1 / heading1 | 96 / 42 | [JSON](./dom/C02-text-heading1.json) |
| C02-text-heading9 | 2 | heading9 / heading9 | 96 / 41 | [JSON](./dom/C02-text-heading9.json) |
| C02-text-ordered | 2 | ordered / ordered | 90 / 43 | [JSON](./dom/C02-text-ordered.json) |
| C03-bullet | 2 | text / text | 88 / 40 | [JSON](./dom/C03-bullet.json) |
| C03-case-menu-bullet | 2 | text / text | 88 / 44 | [JSON](./dom/C03-case-menu-bullet.json) |
| C03-case-menu-heading1 | 2 | text / text | 96 / 44 | [JSON](./dom/C03-case-menu-heading1.json) |
| C03-case-menu-heading9 | 2 | text / text | 96 / 47 | [JSON](./dom/C03-case-menu-heading9.json) |
| C03-case-menu-ordered | 2 | text / text | 88 / 44 | [JSON](./dom/C03-case-menu-ordered.json) |
| C03-text | 4 | text / text / text / text | 0 / 8 | [JSON](./dom/C03-text.json) |
| C03-heading1 | 2 | text / text | 96 / 40 | [JSON](./dom/C03-heading1.json) |
| C03-heading9 | 2 | text / text | 96 / 40 | [JSON](./dom/C03-heading9.json) |
| C03-ordered | 2 | text / text | 88 / 40 | [JSON](./dom/C03-ordered.json) |
| C03-quote-menu | 2 | text / text | 48 / 46 | [JSON](./dom/C03-quote-menu.json) |
| C03-text-noop-history | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 36 / 14 | [JSON](./dom/C03-text-noop-history.json) |
| C04-case-bullet-heading9-all-reverse | 2 | heading9 / heading9 | 104 / 50 | [JSON](./dom/C04-case-bullet-heading9-all-reverse.json) |
| C04-case-bullet-heading9-head | 2 | heading9 / heading9 | 100 / 43 | [JSON](./dom/C04-case-bullet-heading9-head.json) |
| C04-case-bullet-heading9-middle | 2 | heading9 / heading9 | 100 / 46 | [JSON](./dom/C04-case-bullet-heading9-middle.json) |
| C04-case-bullet-heading9-partial-forward | 2 | heading9 / heading9 | 108 / 52 | [JSON](./dom/C04-case-bullet-heading9-partial-forward.json) |
| C04-case-bullet-heading9-tail | 2 | heading9 / heading9 | 100 / 46 | [JSON](./dom/C04-case-bullet-heading9-tail.json) |
| C04-case-heading1-bullet-all-reverse | 2 | bullet / bullet | 104 / 50 | [JSON](./dom/C04-case-heading1-bullet-all-reverse.json) |
| C04-case-heading1-bullet-head | 2 | bullet / bullet | 100 / 44 | [JSON](./dom/C04-case-heading1-bullet-head.json) |
| C04-case-heading1-bullet-middle | 2 | bullet / bullet | 100 / 46 | [JSON](./dom/C04-case-heading1-bullet-middle.json) |
| C04-case-heading1-bullet-partial-forward | 2 | bullet / bullet | 108 / 52 | [JSON](./dom/C04-case-heading1-bullet-partial-forward.json) |
| C04-case-heading1-bullet-tail | 2 | bullet / bullet | 100 / 46 | [JSON](./dom/C04-case-heading1-bullet-tail.json) |
| C04-case-heading9-bullet-all-reverse | 2 | bullet / bullet | 104 / 50 | [JSON](./dom/C04-case-heading9-bullet-all-reverse.json) |
| C04-case-heading9-bullet-head | 2 | bullet / bullet | 100 / 43 | [JSON](./dom/C04-case-heading9-bullet-head.json) |
| C04-case-heading9-bullet-middle | 2 | bullet / bullet | 100 / 46 | [JSON](./dom/C04-case-heading9-bullet-middle.json) |
| C04-case-heading9-bullet-partial-forward | 2 | bullet / bullet | 108 / 52 | [JSON](./dom/C04-case-heading9-bullet-partial-forward.json) |
| C04-case-heading9-bullet-tail | 2 | bullet / bullet | 100 / 46 | [JSON](./dom/C04-case-heading9-bullet-tail.json) |
| C04-case-ordered-bullet-all-reverse | 2 | bullet / bullet | 96 / 50 | [JSON](./dom/C04-case-ordered-bullet-all-reverse.json) |
| C04-case-ordered-bullet-head | 2 | bullet / bullet | 92 / 44 | [JSON](./dom/C04-case-ordered-bullet-head.json) |
| C04-case-ordered-bullet-middle | 2 | bullet / bullet | 92 / 46 | [JSON](./dom/C04-case-ordered-bullet-middle.json) |
| C04-case-ordered-bullet-partial-forward | 2 | bullet / bullet | 100 / 52 | [JSON](./dom/C04-case-ordered-bullet-partial-forward.json) |
| C04-case-ordered-bullet-tail | 2 | bullet / bullet | 92 / 46 | [JSON](./dom/C04-case-ordered-bullet-tail.json) |
| C04-case-text-heading1-all-reverse | 2 | heading1 / heading1 | 104 / 50 | [JSON](./dom/C04-case-text-heading1-all-reverse.json) |
| C04-case-text-heading1-head | 2 | heading1 / heading1 | 100 / 44 | [JSON](./dom/C04-case-text-heading1-head.json) |
| C04-case-text-heading1-middle | 2 | heading1 / heading1 | 100 / 45 | [JSON](./dom/C04-case-text-heading1-middle.json) |
| C04-case-text-heading1-partial-forward | 3 | heading1 / heading1 / 见动作序列（末态不能冒充转换态） | 108 / 52 | [JSON](./dom/C04-case-text-heading1-partial-forward.json) |
| C04-case-text-heading1-tail | 2 | heading1 / heading1 | 100 / 46 | [JSON](./dom/C04-case-text-heading1-tail.json) |
| C04-empty-case-bullet-heading9 | 2 | heading9 / heading9 | 100 / 40 | [JSON](./dom/C04-empty-case-bullet-heading9.json) |
| C04-empty-case-heading1-bullet | 2 | bullet / bullet | 100 / 40 | [JSON](./dom/C04-empty-case-heading1-bullet.json) |
| C04-empty-case-heading9-bullet | 2 | bullet / bullet | 95 / 40 | [JSON](./dom/C04-empty-case-heading9-bullet.json) |
| C04-empty-case-ordered-bullet | 2 | bullet / bullet | 88 / 40 | [JSON](./dom/C04-empty-case-ordered-bullet.json) |
| C04-empty-case-quote-bullet | 2 | quote_container,bullet / quote_container,bullet | 88 / 40 | [JSON](./dom/C04-empty-case-quote-bullet.json) |
| C04-empty-case-quote-heading1 | 2 | quote_container,heading1 / quote_container,heading1 | 100 / 40 | [JSON](./dom/C04-empty-case-quote-heading1.json) |
| C04-empty-case-quote-heading9 | 2 | quote_container,heading9 / quote_container,heading9 | 100 / 40 | [JSON](./dom/C04-empty-case-quote-heading9.json) |
| C04-empty-case-quote-ordered | 2 | quote_container,ordered / quote_container,ordered | 90 / 40 | [JSON](./dom/C04-empty-case-quote-ordered.json) |
| C04-empty-case-quote-text | 2 | quote_container,text / quote_container,text | 0 / 2 | [JSON](./dom/C04-empty-case-quote-text.json) |
| C04-empty-case-text-heading1 | 2 | heading1 / heading1 | 100 / 40 | [JSON](./dom/C04-empty-case-text-heading1.json) |
| C04-softbreak-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 88 / 40 | [JSON](./dom/C04-softbreak-bullet.json) |
| C04-text-heading1-head | 2 | heading1 / heading1 | 98 / 43 | [JSON](./dom/C04-text-heading1-head.json) |
| C04-text-heading1-middle | 2 | heading1 / heading1 | 102 / 47 | [JSON](./dom/C04-text-heading1-middle.json) |
| C04-text-heading1-tail | 2 | heading1 / heading1 | 98 / 46 | [JSON](./dom/C04-text-heading1-tail.json) |
| C04-unicode-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C04-unicode-heading9.json) |
| C04-whitespace-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C04-whitespace-heading9.json) |
| C04-whole-block-bullet-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 120 / 0 | [JSON](./dom/C04-whole-block-bullet-heading9.json) |
| C04-whole-block-heading1-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 120 / 0 | [JSON](./dom/C04-whole-block-heading1-bullet.json) |
| C04-whole-block-heading9-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 120 / 0 | [JSON](./dom/C04-whole-block-heading9-bullet.json) |
| C04-whole-block-ordered-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 112 / 0 | [JSON](./dom/C04-whole-block-ordered-bullet.json) |
| C04-whole-block-text-heading1 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 127 / 8 | [JSON](./dom/C04-whole-block-text-heading1.json) |
| C05-case-colored-quote | 2 | quote_container,text / quote_container,text | 52 / 44 | [JSON](./dom/C05-case-colored-quote.json) |
| C05-case-colored-shortcuts-bullet | 2 | bullet / bullet | 88 / 40 | [JSON](./dom/C05-case-colored-shortcuts-bullet.json) |
| C05-case-colored-shortcuts-heading1 | 2 | heading1 / heading1 | 96 / 39 | [JSON](./dom/C05-case-colored-shortcuts-heading1.json) |
| C05-case-colored-shortcuts-heading9 | 2 | heading9 / heading9 | 96 / 40 | [JSON](./dom/C05-case-colored-shortcuts-heading9.json) |
| C05-case-colored-shortcuts-ordered | 2 | ordered / ordered | 90 / 40 | [JSON](./dom/C05-case-colored-shortcuts-ordered.json) |
| C05-case-text-shortcuts-bullet | 2 | bullet / bullet | 88 / 40 | [JSON](./dom/C05-case-text-shortcuts-bullet.json) |
| C05-case-text-shortcuts-heading1 | 2 | heading1 / heading1 | 96 / 42 | [JSON](./dom/C05-case-text-shortcuts-heading1.json) |
| C05-case-text-shortcuts-heading9 | 2 | heading9 / heading9 | 96 / 40 | [JSON](./dom/C05-case-text-shortcuts-heading9.json) |
| C05-case-text-shortcuts-ordered | 2 | ordered / ordered | 90 / 40 | [JSON](./dom/C05-case-text-shortcuts-ordered.json) |
| C05-comment-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 128 / 40 | [JSON](./dom/C05-comment-heading9.json) |
| C05-comment-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 52 / 40 | [JSON](./dom/C05-comment-quote.json) |
| C05-indented-ordered-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 60 / 40 | [JSON](./dom/C05-indented-ordered-quote.json) |
| C05-indented-ordered-to-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 88 / 40 | [JSON](./dom/C05-indented-ordered-to-bullet.json) |
| C05-indented-ordered-to-heading1 | 2 | ordered,heading1 / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C05-indented-ordered-to-heading1.json) |
| C05-indented-ordered-to-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C05-indented-ordered-to-heading9.json) |
| C05-indented-ordered-to-text | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 88 / 40 | [JSON](./dom/C05-indented-ordered-to-text.json) |
| C05-left-text-heading1 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C05-left-text-heading1.json) |
| C05-resume-indent-refusal | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 15 / 23 | [JSON](./dom/C05-resume-indent-refusal.json) |
| C05-resume-right-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 370 / 160 | [JSON](./dom/C05-resume-right-shortcuts.json) |
| C05-rich-colored-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 66 / 77 | [JSON](./dom/C05-rich-colored-quote.json) |
| C05-rich-heading1-bullet-continue | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 166 / 60 | [JSON](./dom/C05-rich-heading1-bullet-continue.json) |
| C05-rich-quote-heading9-partial | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 96 / 40 | [JSON](./dom/C05-rich-quote-heading9-partial.json) |
| C05-right-menu-source-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 370 / 160 | [JSON](./dom/C05-right-menu-source-shortcuts.json) |
| C05-right-text-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 52 / 40 | [JSON](./dom/C05-right-text-quote.json) |
| C05-right-text-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 230 / 108 | [JSON](./dom/C05-right-text-shortcuts.json) |
| C06-bullet-middle-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 52 / 40 | [JSON](./dom/C06-bullet-middle-quote.json) |
| C06-case-ordered-middle-quote-bubble | 2 | ordered,quote_container,ordered,ordered,text,text / ordered,quote_container,ordered,ordered,text,text | 70 / 46 | [JSON](./dom/C06-case-ordered-middle-quote-bubble.json) |
| C06-folded-heading1-bullet | 4 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 113 / 47 | [JSON](./dom/C06-folded-heading1-bullet.json) |
| C06-folded-heading1-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 149 / 47 | [JSON](./dom/C06-folded-heading1-heading9.json) |
| C06-folded-heading1-quote | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 84 / 40 | [JSON](./dom/C06-folded-heading1-quote.json) |
| C06-folded-parent-fresh-repeat | 1 | 见动作序列（末态不能冒充转换态） | 87 / 38 | [JSON](./dom/C06-folded-parent-fresh-repeat.json) |
| C06-folded-parent-to-text | 2 | text,heading9,text,heading1 / 见动作序列（末态不能冒充转换态） | 85 / 41 | [JSON](./dom/C06-folded-parent-to-text.json) |
| C06-heading-descendants-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 51 / 64 | [JSON](./dom/C06-heading-descendants-quote.json) |
| C06-heading-descendants-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 335 / 174 | [JSON](./dom/C06-heading-descendants-shortcuts.json) |
| C06-manual-ordered-middle | 1 | 见动作序列（末态不能冒充转换态） | 94 / 77 | [JSON](./dom/C06-manual-ordered-middle.json) |
| C06-ordered-middle | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 432 / 160 | [JSON](./dom/C06-ordered-middle.json) |
| C06-ordered-middle-quote | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 49 / 39 | [JSON](./dom/C06-ordered-middle-quote.json) |
| C06-ordered-middle-quote-bubble | 1 | 见动作序列（末态不能冒充转换态） | 47 / 38 | [JSON](./dom/C06-ordered-middle-quote-bubble.json) |
| C06-ordered-parent-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 68 / 40 | [JSON](./dom/C06-ordered-parent-quote.json) |
| C06-ordered-parent-text | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 136 / 40 | [JSON](./dom/C06-ordered-parent-text.json) |
| C06-quote-middle-shortcuts | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 376 / 170 | [JSON](./dom/C06-quote-middle-shortcuts.json) |
| C06-quote-middle-toggle | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 140 / 89 | [JSON](./dom/C06-quote-middle-toggle.json) |
| C06-resume-parent-heading-quote | 2 | quote_container,heading1,heading9,text,heading1 / 见动作序列（末态不能冒充转换态） | 79 / 45 | [JSON](./dom/C06-resume-parent-heading-quote.json) |
| C07-block-add-below-heading1 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 37 / 26 | [JSON](./dom/C07-block-add-below-heading1.json) |
| C07-block-menu-text-heading1 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 112 / 44 | [JSON](./dom/C07-block-menu-text-heading1.json) |
| C07-case-bullet-heading1 | 2 | heading1 / heading1 | 96 / 44 | [JSON](./dom/C07-case-bullet-heading1.json) |
| C07-case-bullet-heading9 | 2 | heading9 / heading9 | 96 / 48 | [JSON](./dom/C07-case-bullet-heading9.json) |
| C07-case-bullet-ordered | 2 | ordered / ordered | 90 / 44 | [JSON](./dom/C07-case-bullet-ordered.json) |
| C07-case-bullet-quote | 2 | quote_container,bullet / quote_container,bullet | 52 / 44 | [JSON](./dom/C07-case-bullet-quote.json) |
| C07-case-bullet-text | 2 | text / text | 88 / 44 | [JSON](./dom/C07-case-bullet-text.json) |
| C07-case-heading1-bullet | 2 | bullet / bullet | 96 / 44 | [JSON](./dom/C07-case-heading1-bullet.json) |
| C07-case-heading1-heading9 | 2 | heading9 / heading9 | 104 / 48 | [JSON](./dom/C07-case-heading1-heading9.json) |
| C07-case-heading1-ordered | 2 | heading1 / heading1 | 22 / 12 | [JSON](./dom/C07-case-heading1-ordered.json) |
| C07-case-heading1-quote | 2 | quote_container,heading1 / quote_container,heading1 | 52 / 44 | [JSON](./dom/C07-case-heading1-quote.json) |
| C07-case-heading1-text | 2 | text / text | 96 / 43 | [JSON](./dom/C07-case-heading1-text.json) |
| C07-case-heading9-bullet | 2 | bullet / bullet | 96 / 44 | [JSON](./dom/C07-case-heading9-bullet.json) |
| C07-case-heading9-heading1 | 2 | heading1 / heading1 | 104 / 44 | [JSON](./dom/C07-case-heading9-heading1.json) |
| C07-case-heading9-ordered | 2 | heading9 / heading9 | 22 / 12 | [JSON](./dom/C07-case-heading9-ordered.json) |
| C07-case-heading9-quote | 2 | quote_container,heading9 / quote_container,heading9 | 52 / 44 | [JSON](./dom/C07-case-heading9-quote.json) |
| C07-case-heading9-text | 2 | text / text | 96 / 44 | [JSON](./dom/C07-case-heading9-text.json) |
| C07-case-ordered-bullet | 2 | bullet / bullet | 88 / 44 | [JSON](./dom/C07-case-ordered-bullet.json) |
| C07-case-ordered-heading1 | 2 | heading1 / heading1 | 96 / 44 | [JSON](./dom/C07-case-ordered-heading1.json) |
| C07-case-ordered-heading9 | 2 | heading9 / heading9 | 96 / 48 | [JSON](./dom/C07-case-ordered-heading9.json) |
| C07-case-ordered-quote | 2 | quote_container,ordered / quote_container,ordered | 52 / 44 | [JSON](./dom/C07-case-ordered-quote.json) |
| C07-case-ordered-text | 2 | text / text | 88 / 43 | [JSON](./dom/C07-case-ordered-text.json) |
| C07-case-quote-bullet | 2 | quote_container,bullet / quote_container,bullet | 88 / 44 | [JSON](./dom/C07-case-quote-bullet.json) |
| C07-case-quote-heading1 | 2 | quote_container,heading1 / quote_container,heading1 | 96 / 44 | [JSON](./dom/C07-case-quote-heading1.json) |
| C07-case-quote-heading9 | 2 | quote_container,heading9 / quote_container,heading9 | 96 / 48 | [JSON](./dom/C07-case-quote-heading9.json) |
| C07-case-quote-ordered | 2 | quote_container,ordered / quote_container,ordered | 90 / 44 | [JSON](./dom/C07-case-quote-ordered.json) |
| C07-case-quote-text | 2 | quote_container,text / quote_container,text | 0 / 6 | [JSON](./dom/C07-case-quote-text.json) |
| C07-case-text-bullet | 2 | bullet / bullet | 88 / 44 | [JSON](./dom/C07-case-text-bullet.json) |
| C07-case-text-heading1 | 2 | heading1 / heading1 | 96 / 44 | [JSON](./dom/C07-case-text-heading1.json) |
| C07-case-text-heading9 | 2 | heading9 / heading9 | 96 / 48 | [JSON](./dom/C07-case-text-heading9.json) |
| C07-case-text-ordered | 2 | ordered / ordered | 90 / 43 | [JSON](./dom/C07-case-text-ordered.json) |
| C07-case-text-quote | 2 | quote_container,text / quote_container,text | 52 / 44 | [JSON](./dom/C07-case-text-quote.json) |
| C07-input-rule-nonempty-heading1 | 3 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 144 / 54 | [JSON](./dom/C07-input-rule-nonempty-heading1.json) |
| C07-input-rule-nonempty-heading9 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 178 / 96 | [JSON](./dom/C07-input-rule-nonempty-heading9.json) |
| C07-nonempty-plus | 1 | 见动作序列（末态不能冒充转换态） | 5 / 1 | [JSON](./dom/C07-nonempty-plus.json) |
| C07-nonempty-slash-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 126 / 56 | [JSON](./dom/C07-nonempty-slash-bullet.json) |
| C07-nonempty-slash-head | 2 | heading1 / heading1 | 134 / 56 | [JSON](./dom/C07-nonempty-slash-head.json) |
| C07-nonempty-slash-ordered | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 128 / 56 | [JSON](./dom/C07-nonempty-slash-ordered.json) |
| C07-nonempty-slash-quote | 2 | quote_container,text / quote_container,text | 90 / 56 | [JSON](./dom/C07-nonempty-slash-quote.json) |
| C07-nonempty-slash-tail | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 40 / 20 | [JSON](./dom/C07-nonempty-slash-tail.json) |
| C07-persist-bullet | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 66 / 30 | [JSON](./dom/C07-persist-bullet.json) |
| C07-persist-nested-heading9-cycle1 | 1 | 见动作序列（末态不能冒充转换态） | 36 / 15 | [JSON](./dom/C07-persist-nested-heading9-cycle1.json) |
| C07-persist-nested-heading9-cycle2 | 1 | 见动作序列（末态不能冒充转换态） | 36 / 15 | [JSON](./dom/C07-persist-nested-heading9-cycle2.json) |
| C07-persist-ordered | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 68 / 30 | [JSON](./dom/C07-persist-ordered.json) |
| C07-persist-quote | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 40 / 30 | [JSON](./dom/C07-persist-quote.json) |
| C07-resume-persist-heading1 | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 70 / 37 | [JSON](./dom/C07-resume-persist-heading1.json) |
| C07-resume-persist-heading1-second-cycle | 1 | 见动作序列（末态不能冒充转换态） | 36 / 15 | [JSON](./dom/C07-resume-persist-heading1-second-cycle.json) |
| C07-shortcut-text-quote-unblocked | 2 | 见动作序列（末态不能冒充转换态） / 见动作序列（末态不能冒充转换态） | 52 / 40 | [JSON](./dom/C07-shortcut-text-quote-unblocked.json) |
| C08-heading1-number-add | 2 | heading1 / heading1 | 22 / 8 | [JSON](./dom/C08-heading1-number-add.json) |
| C08-heading1-number-remove | 2 | heading1 / heading1 | 20 / 8 | [JSON](./dom/C08-heading1-number-remove.json) |
| C08-heading9-number-add | 2 | heading9 / heading9 | 22 / 8 | [JSON](./dom/C08-heading9-number-add.json) |
| C08-heading9-number-remove | 2 | heading9 / heading9 | 20 / 8 | [JSON](./dom/C08-heading9-number-remove.json) |

## 状态口径

S03 C01–C08已按主文档与各条代表范围收口。此矩阵仍保留已观察、建样、失败前置与收尾窗口，不能将每行或运行数全部当作功能通过；各条明确哪些重复有效。215组证据共437个不重复原始窗口，压缩往返精确一致。H1/H9有序命令的编号变化与实际类型分别验收。

- 初批页标题为空；接续非空标题快捷键见 C01-title；正文样例含 `123`、格式样例 `BIUSLC` 和多块 `111/222/333/444`，精确前置见各 JSON。
- 有效双轮、代表持久化及入口差异已逐项审计；失败/中断保留原值，不参与对应双轮。
- JSON的`$dom`递归引用`domObjects`；baselinePatch/beforePatch按RFC 6902重建前后状态。
- 同一session内的n引用表示真实DOM对象身份，不能跨刷新比较。
- 初批快捷键只有显式菜单快照及页面异常；后续enriched窗口增加menuChanges和console字段。字段缺失不能视为没有异常。

## 接续结果与失败口径

已补30个气泡方向、同类、首中尾/局部/全文/真实整块、内容边界、格式/缩进/对齐/批注、列表/引用/折叠后代与各目标代表重载。精确范围以主文档和属性表为准。旧右对齐R2出现未发送的Cmd+A/Backspace，未计有效复测；后续sir确认人工清空的事件不倒推解释旧异常。

接续新增 C05-right-menu-source-shortcuts 为菜单确认右对齐的有效两轮；C05-resume-right-shortcuts 实际为 start 对齐，是前置失败。C05-resume-indent-refusal 的 R2/R3 有通知 DOM，R1 未补。C01-title-shortcuts 与 C01-title-history-boundary 为非空页标题限制，各两轮。新旧 session 的 n 引用不能直接比较。

## 最终入口索引

| 类型 | 本轮快捷键 | 菜单/容器入口 |
| --- | --- | --- |
| 正文 | Cmd+Option+0 | C07-case 两轮；同类无变化 |
| H1 | Cmd+Option+1 | C07-case已两轮 |
| H9 | Cmd+Option+9 | C07-case已两轮 |
| H2–H8 | 共同行为按授权抽样推断 | S02 级别入口；S03 共同行为未逐级执行 |
| 有序 | Cmd+Shift+7 | C07-case 两轮；标题来源改编号 |
| 无序 | Cmd+Shift+8 | C07-case 两轮 |
| 引用 | Cmd+Shift+Period解除ChatGPT冲突后双轮成功；原绑定已恢复 | 气泡、快捷键、斜杠及容器范围各有相应双轮 |

无变化与中断不并入完整历史通过。SETUP只建立样例，不能算作对应功能验收。

新增C05-rich-heading1-bullet-continue的有效窗口为R1/R3；R2前置为text、未执行。C06折叠改H9为R1/R2、转无序为R1/R4、引用为R1/R3；其余空窗口不计折叠复测。输入规则H1有效R1/R3，H9有效R1/R2。C04-whole-block动作在hiddenActions，不因普通actions为空漏计真实输入。

有序、无序、引用各两轮保存/刷新共六个转换窗口，十二次独立读取另存C07目标persistence-reads，不计为十二个新转换。H1及嵌套H9的既有两轮分别保留。最终空文档刷新、观察器移除、快捷键绑定恢复和夸克项目标签恢复见主文档末尾；已解决测试评论保留为可恢复记录。
