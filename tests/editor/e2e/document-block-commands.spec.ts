import { expect, test } from "@playwright/test";
import { origin, paragraphSelector, orderedListSelector, bulletListSelector, listItemSelector, file, view, block, handle, seed, caret, activate } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

test("the add button inserts in the same paragraph when it contains only whitespace", async ({ page }) => {
  await seed(page, "<p>Intro</p><p>&nbsp;　</p><p>Next paragraph</p>");
  const row = block(page, 1);
  const id = await row.getAttribute("id");
  await activate(page, 1);
  const add = row.getByRole("button", { name: "在第 2 块插入" });
  await expect(row.getByRole("button")).toHaveCount(1);
  await expect(add.locator('[data-block-icon="add"]')).toBeVisible();
  await add.click({ force: true });
  const menu = page.getByRole("group", { name: "插入块", exact: true });
  await menu.getByRole("button", { name: "标题 2", exact: true }).click();
  await expect(row).toHaveAttribute("id", id!);
  await expect(row.locator('[data-heading-level="2"]')).toBeVisible();
  await expect(block(page, 2)).toHaveText("Next paragraph");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(add.locator('[data-block-icon="add"]')).toBeVisible();
});

test("slash filtering, ordered list keyboard nesting and numbering share one history", async ({ page }) => {
  await seed(page, "<p></p><p>Tail</p>");
  const editor = await activate(page, 0);
  await page.keyboard.type("/ordered");
  await expect(page.getByRole("button", { name: "有序列表", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(editor.locator(`${orderedListSelector} > ${listItemSelector}`)).toHaveCount(1);
  await expect(block(page, 0).getByRole("button")).toHaveCount(1);
  await expect(handle(page, 0).locator('[data-block-icon="orderedList"]')).toHaveCount(1);
  await page.keyboard.type("Alpha");
  await page.keyboard.press("Enter");
  await expect(editor.locator(`${orderedListSelector} > ${listItemSelector}`)).toHaveCount(2);
  await page.keyboard.type("Beta");
  await caret(editor.locator(`${orderedListSelector} > ${listItemSelector}`).nth(1).locator(paragraphSelector));
  await page.keyboard.press("Tab");
  await expect(editor.locator(`${orderedListSelector} ${orderedListSelector} ${listItemSelector}`)).toHaveText("Beta");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor.locator(`${orderedListSelector} ${listItemSelector}`).nth(1)).toHaveText("Beta");
  await expect(editor.locator(`${orderedListSelector} ${orderedListSelector}`)).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(editor.locator(`${orderedListSelector} ${orderedListSelector} ${listItemSelector}`)).toHaveText("Beta");
  await expect(editor).toBeFocused();

  await caret(editor.locator(`${orderedListSelector} ${orderedListSelector} ${paragraphSelector}`));
  await page.keyboard.press("Shift+ArrowRight");
  await expect.poll(() => page.evaluate(() => document.getSelection()?.toString())).toBe("B");
  await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click();
  await page.getByRole("button", { name: "无序列表", exact: true }).click();
  await expect(editor.locator(`${orderedListSelector} ${bulletListSelector} ${listItemSelector}`)).toHaveText("Beta");
  await expect.poll(() => page.evaluate(() => document.getSelection()?.anchorNode?.parentElement?.closest('.ym-block-paragraph')?.textContent)).toBe("Beta");

  await editor.locator(`${orderedListSelector} > ${listItemSelector} > ${paragraphSelector}`).first().click();
  await expect.poll(() => page.evaluate(() => document.getSelection()?.anchorNode?.parentElement?.closest('.ym-block-paragraph')?.textContent)).toBe("Alpha");
  await handle(page, 0).click({ force: true });
  await page.getByRole("spinbutton", { name: "起始编号" }).fill("8");
  await page.getByRole("button", { name: "应用编号" }).click();
  await expect(block(page, 0).locator(orderedListSelector).first()).toHaveAttribute("data-list-start", "8");
  await handle(page, 0).click({ force: true });
  await page.getByRole("combobox", { name: "标记" }).selectOption("i");
  await expect(block(page, 0).locator(orderedListSelector).first()).toHaveCSS("--ym-number-style", "lower-roman");

  await page.getByRole("button", { name: "阅读", exact: true }).click();
  await expect(block(page, 0).locator(`${orderedListSelector} ${bulletListSelector} ${listItemSelector}`)).toHaveText("Beta");
  await expect(block(page, 0).locator(orderedListSelector).first()).toHaveAttribute("data-list-start", "8");
});

test("insert commands stay within a narrow viewport and return keyboard focus to their block", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 620 });
  await page.goto(file + "#block-13");
  const target = view(page).locator("#block-13");
  await expect(target).toBeInViewport();
  await target.evaluate((row) => {
    const scroller = row.closest("[data-scroll-viewport]")!;
    const bottom = scroller.getBoundingClientRect().bottom;
    scroller.scrollTop += row.getBoundingClientRect().top - bottom + 48;
  });
  const insert = target.getByRole("button", { name: "第 13 块操作" });
  await expect(insert).toBeInViewport();
  await insert.press("Enter");
  const commands = page.getByRole("group", { name: "内容块命令" });
  await expect(commands.getByRole("button", { name: "正文", exact: true })).toBeFocused();
  const box = (await commands.boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(620);

  await page.keyboard.press("ArrowDown");
  await expect(commands.getByRole("button", { name: "标题 1", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(commands).toBeHidden();
  await expect(insert).toBeFocused();
  await insert.press("Enter");
  const add = commands.getByRole("button", { name: "在下方添加" });
  await add.press("ArrowRight");
  const submenu = page.getByRole("group", { name: "在下方添加", exact: true });
  await expect(submenu.getByRole("button", { name: "正文", exact: true })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(submenu).toBeHidden();
  await expect(add).toBeFocused();
  await add.press("ArrowRight");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(block(page, 13).locator('[data-heading-level="1"]')).toBeVisible();
  await expect(block(page, 14)).toHaveAttribute("id", "block-14");
});

test("opening another block menu preserves the live caret, and converts only its source block", async ({ page }) => {
  await seed(page, "<p>Alpha</p><p>Beta</p><p>Gamma</p>");
  const beta = await activate(page, 1);
  await caret(beta.locator(paragraphSelector), 2);
  await block(page, 0).hover();
  await handle(page, 0).click();
  const commands = page.getByRole("group", { name: "内容块命令" });
  await expect(commands.getByRole("button", { name: "正文", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(beta).toBeFocused();
  expect(await page.evaluate(() => window.getSelection()?.focusOffset)).toBe(2);
  await expect(view(page).locator("[data-block-selected]")).toHaveCount(0);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(commands).toBeVisible();
  await expect(beta).toBeFocused();

  await commands.getByRole("button", { name: "标题 1", exact: true }).click();
  const alpha = block(page, 0).locator(".tiptap");
  await expect(alpha).toBeFocused();
  await expect(alpha.locator('[data-heading-level="1"]')).toHaveText("Alpha");
  await expect(block(page, 1)).toHaveText("Beta");
  await alpha.press("ControlOrMeta+z");
  await expect(block(page, 0).locator('[data-heading-level]')).toHaveCount(0);
  await expect(block(page, 0)).toHaveText("Alpha");
  await view(page).press("ControlOrMeta+Shift+z");
  await expect(block(page, 0).locator('[data-heading-level="1"]')).toHaveText("Alpha");
  await expect(block(page, 2)).toHaveText("Gamma");
});

test("selection tools and block handles are exclusive, hover submenus preserve the range on return", async ({ page }) => {
  await seed(page, "<p>Alpha</p><p>Beta</p><p>Gamma</p>");
  const editor = await activate(page, 0);
  await caret(editor.locator(paragraphSelector));
  for (let index = 0; index < 5; index++) await page.keyboard.press("Shift+ArrowRight");
  const bubble = page.getByRole("toolbar", { name: "选区工具栏" });
  const type = bubble.getByRole("button", { name: "块类型" });
  const commands = page.getByRole("group", { name: "内容块命令" });
  const more = commands.getByRole("button", { name: "其他标题" });
  const headings = page.getByRole("group", { name: "其他标题", exact: true });

  await expect(bubble).toBeVisible();
  await block(page, 1).hover();
  await expect(handle(page, 1)).toHaveCount(0);
  await type.hover();
  await expect(commands.getByRole("button", { name: "正文", exact: true })).toHaveAttribute("aria-pressed", "true");
  await more.hover();
  await headings.getByRole("button", { name: "标题 9", exact: true }).hover();
  await expect(bubble).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe("Alpha");
  await more.hover();
  await expect(headings).toBeHidden();
  await expect(commands).toBeVisible();
  await type.hover();
  await expect(commands).toBeHidden();

  await page.keyboard.press("Escape");
  await expect(bubble).toBeHidden();
  await expect(editor).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe("Alpha");
  await block(page, 1).hover();
  await expect(handle(page, 1)).toHaveCount(0);
  await page.keyboard.press("ArrowRight");
  await expect(handle(page, 1)).toHaveCount(1);
});

test("empty-line add and slash have distinct insertion and history paths", async ({ page }) => {
  await page.goto(file);
  const first = await activate(page, 0);
  const paragraph = first.locator(paragraphSelector);
  await caret(paragraph, (await paragraph.textContent())!.length);
  await page.keyboard.press("Enter");
  const row = block(page, 1);
  const editor = row.locator(".tiptap");
  await expect(editor).toBeFocused();
  const anchor = await row.getAttribute("id");
  const add = row.getByRole("button", { name: "在第 2 块插入" });
  const commands = page.getByRole("group", { name: "内容块命令" });
  await expect(row.getByRole("button")).toHaveCount(1);
  await expect(add.locator('[data-block-icon="add"]')).toHaveCount(1);
  await add.click({ force: true });
  await expect(editor).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(commands).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(commands).toBeHidden();
  await expect(editor).toBeFocused();
  await add.click({ force: true });
  await commands.getByRole("button", { name: "标题 2", exact: true }).click();
  await expect(row).toHaveAttribute("id", anchor!);
  await expect(row.locator('[data-heading-level="2"]')).toHaveCount(1);
  await expect(row.getByRole("button", { name: /块操作|块插入|选择或拖动/ })).toHaveCount(1);
  await expect(row.getByRole("button", { name: "未命名标题 章节" })).toHaveCount(1);
  await expect(handle(page, 1).locator('[data-block-icon="heading"]')).toHaveCount(1);
  await expect(block(page, 2)).toHaveAttribute("id", "block-2");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(row.locator("[data-heading-level]")).toHaveCount(0);
  await expect(add.locator('[data-block-icon="add"]')).toHaveCount(1);

  const slash = page.getByRole("group", { name: "斜杠命令" });
  await page.keyboard.insertText("/");
  await expect(slash.getByRole("button", { name: "正文", exact: true })).toBeVisible();
  await page.keyboard.insertText("标题");
  await expect(slash.getByRole("button")).toHaveCount(3);
  await page.keyboard.press("Escape");
  await expect(slash).toBeHidden();
  await expect(row).toHaveText("/标题");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(slash).toBeHidden();
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(row).toHaveText("/标题");
  await expect(slash).toBeHidden();
  await page.keyboard.press("ControlOrMeta+z");
  await page.keyboard.type("/x2xunmatched");
  await expect(slash.getByText("没有匹配的命令", { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(slash).toBeHidden();
  await expect(editor).toBeFocused();
  await expect(row).toHaveText("/x2xunmatched");
});

test("Escape closes the only blank block's add menu and keeps the original focus", async ({ page }) => {
  await page.goto(origin + "/editor?new=1");
  const row = block(page, 0);
  const add = row.getByRole("button", { name: "在第 1 块插入" });
  const commands = page.getByRole("group", { name: "内容块命令" });
  const editor = row.locator(".tiptap");
  await row.hover();
  for (const focus of [page.locator("body"), editor]) {
    if (focus === editor) await row.click();
    await expect(focus).toBeFocused();
    await add.click();
    await expect(commands).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(commands).toBeHidden();
    await expect(focus).toBeFocused();
  }
  await expect(row).toHaveText("");
});

test("reading selection offers edit without exposing mutating commands", async ({ page }) => {
  await seed(page, "<p>Alpha</p><p>Beta</p>");
  const mode = page.getByRole("group", { name: "文档模式" });
  await mode.getByRole("button", { name: "阅读" }).click();
  await block(page, 0).locator("[data-block-text]").dblclick({ position: { x: 8, y: 9 } });
  const bubble = page.getByRole("group", { name: "浮动选区格式" });
  await expect(bubble.getByRole("button", { name: "编辑", exact: true })).toBeVisible();
  await expect(bubble.getByRole("button", { name: "粗体" })).toHaveCount(0);
  await bubble.getByRole("button", { name: "编辑", exact: true }).click();
  await expect(mode.getByRole("button", { name: "编辑" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("toolbar", { name: "选区工具栏" })).toBeVisible();
  await expect(block(page, 0)).toHaveText("Alpha");
});
