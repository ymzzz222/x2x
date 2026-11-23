import { expect, test, type Locator, type Page } from "@playwright/test";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const file = origin + "/editor?size=500000";
test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

function view(page: Page) { return page.getByRole("region", { name: "文档正文" }); }
function block(page: Page, index: number) { return view(page).locator('[data-block-index="' + index + '"]'); }
function handle(page: Page, index: number) { return block(page, index).getByRole("button", { name: "第 " + (index + 1) + " 块操作" }); }

async function insertAfter(page: Page, index: number, name: string) {
  await handle(page, index).click({ force: true });
  await page.getByRole("button", { name: "在下方添加" }).click();
  await page.getByRole("group", { name: "在下方添加", exact: true }).getByRole("button", { name, exact: true }).click();
}


async function seed(page: Page, html: string) {
  await page.goto(file);
  await expect(block(page, 0)).toBeInViewport();
  await view(page).press("ControlOrMeta+a");
  await view(page).evaluate((element, html) => {
    const data = new DataTransfer();
    data.setData("text/html", html);
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  }, html);
}

async function caret(target: Locator, offset = 0) {
  const editor = target.locator("xpath=ancestor::*[contains(concat(' ',@class,' '),' tiptap ')][1]");
  await editor.focus();
  await target.evaluate((element, offset) => {
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode() ?? element;
    document.getSelection()!.collapse(text, offset);
    document.dispatchEvent(new Event("selectionchange"));
  }, offset);
}

async function activate(page: Page, index: number) {
  const row = block(page, index);
  await row.locator("[data-block-text]").first().click({ position: { x: 1, y: 10 } });
  const editor = row.locator(".tiptap");
  await expect(editor).toBeFocused();
  return editor;
}

for (const [kind, empty] of [["paragraph", "<p></p>"], ["quote", "<blockquote><p></p></blockquote>"]]) {
  test(`focusing a trailing soft break does not move the next block in a ${kind}`, async ({ page }) => {
    await seed(page, "<p>Intro</p>" + empty + "<p>Next paragraph</p>");
    const row = block(page, 1);
    const preview = row.locator("[data-block-text]");
    const nextOffset = () => row.evaluate((element) =>
      element.nextElementSibling!.getBoundingClientRect().top - element.getBoundingClientRect().top);

    await expect(preview).toBeVisible();
    const emptyOffset = await nextOffset();
    const editor = await activate(page, 1);
    await expect.poll(nextOffset).toBe(emptyOffset);

    await page.keyboard.press("Shift+Enter");
    await expect.poll(nextOffset).toBeGreaterThan(emptyOffset);
    if (kind === "paragraph") {
      await expect(row.getByRole("button", { name: "在第 2 块插入" }).locator('[data-block-icon="add"]')).toBeVisible();
    } else {
      await expect(handle(page, 1).locator('[data-block-icon="blockquote"]')).toBeVisible();
    }
    const softBreakOffset = await nextOffset();
    await activate(page, 2);
    await expect(preview).toHaveJSProperty("textContent", "\n");
    await expect.poll(nextOffset).toBe(softBreakOffset);

    const { height } = (await preview.boundingBox())!;
    await preview.click({ position: { x: 2, y: height - 4 } });
    await expect(editor).toBeFocused();
    await expect.poll(nextOffset).toBe(softBreakOffset);
    await page.keyboard.insertText("在第二行");
    await expect.poll(() => editor.locator("p").evaluate((paragraph) =>
      paragraph.querySelector("br")?.nextSibling?.textContent)).toBe("在第二行");
    if (kind === "paragraph") await expect(handle(page, 1).locator('[data-block-icon="paragraph"]')).toBeVisible();
  });
}

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
  await page.keyboard.insertText("/ordered");
  await expect(page.getByRole("button", { name: "有序列表", exact: true })).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(editor.locator("ol > li")).toHaveCount(1);
  await expect(block(page, 0).getByRole("button")).toHaveCount(1);
  await expect(handle(page, 0).locator('[data-block-icon="orderedList"]')).toHaveCount(1);
  await page.keyboard.insertText("Alpha");
  await page.keyboard.press("Enter");
  await expect(editor.locator("ol > li")).toHaveCount(2);
  await page.keyboard.insertText("Beta");
  await caret(editor.locator("ol > li").nth(1).locator("p"));
  await page.keyboard.press("Tab");
  await expect(editor.locator("ol ol li")).toHaveText("Beta");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor.locator("ol li").nth(1)).toHaveText("Beta");
  await expect(editor.locator("ol ol")).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(editor.locator("ol ol li")).toHaveText("Beta");

  await caret(editor.locator("ol ol p"));
  await page.keyboard.press("Shift+ArrowRight");
  await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click();
  await page.getByRole("button", { name: "无序列表", exact: true }).click();
  await expect(editor.locator("ol ul li")).toHaveText("Beta");
  await expect.poll(() => page.evaluate(() => document.getSelection()?.anchorNode?.parentElement?.closest("p")?.textContent)).toBe("Beta");

  await editor.locator("ol > li > p").first().click();
  await expect.poll(() => page.evaluate(() => document.getSelection()?.anchorNode?.parentElement?.closest("p")?.textContent)).toBe("Alpha");
  await handle(page, 0).click({ force: true });
  await page.getByRole("spinbutton", { name: "起始编号" }).fill("8");
  await page.getByRole("button", { name: "应用编号" }).click();
  await expect(block(page, 0).locator("ol").first()).toHaveAttribute("start", "8");
  await handle(page, 0).click({ force: true });
  await page.getByRole("combobox", { name: "标记" }).selectOption("i");
  await expect(block(page, 0).locator("ol").first()).toHaveCSS("list-style-type", "lower-roman");

  await page.getByRole("button", { name: "阅读", exact: true }).click();
  await expect(block(page, 0).locator("ol ul li")).toHaveText("Beta");
  await expect(block(page, 0).locator("ol").first()).toHaveAttribute("start", "8");
});

test("continuation numbers follow their ordered group after a move and restart on demand", async ({ page }) => {
  await seed(page, '<ol start="8"><li><p>East</p></li></ol><ol><li><p>West</p></li></ol><p>Tail</p>');
  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "续编", exact: true }).click();
  await expect(block(page, 1).locator("ol")).toHaveAttribute("start", "9");

  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "上移", exact: true }).click();
  await expect(block(page, 0).locator("ol")).toHaveText("West");
  await expect(block(page, 0).locator("ol")).toHaveJSProperty("start", 1);
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 1).locator("ol")).toHaveAttribute("start", "9");

  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(block(page, 1).locator("ol")).toHaveJSProperty("start", 1);
  await expect(block(page, 0).locator("ol")).toHaveAttribute("start", "8");
});

test("supplementary paragraphs stay inside the item and Enter on an empty item exits the list", async ({ page }) => {
  await seed(page, "<ol><li><p>Parent</p></li><li><p></p></li></ol><p>Tail</p>");
  const editor = await activate(page, 0);
  await caret(editor.locator("li").first().locator("p"), 6);
  await page.keyboard.press("ControlOrMeta+Enter");
  const parent = editor.locator("li").first();
  await expect(parent.locator("p")).toHaveCount(2);
  await page.keyboard.insertText("Details");
  await expect(parent.locator("p")).toHaveText(["Parent", "Details"]);
  await parent.locator("p").last().evaluate((element) => {
    const data = new DataTransfer();
    data.setData("text/plain", " inside");
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });
  await expect(parent.locator("p").last()).toHaveText("Details inside");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(parent.locator("p").last()).toHaveText("Details");
  await caret(editor.locator("li").nth(1).locator("p"));
  await page.keyboard.press("Enter");
  await expect(block(page, 0).locator("ol > li")).toHaveCount(1);
  await expect(block(page, 1).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("Outside");
  await expect(block(page, 1).locator(".tiptap p")).toHaveText("Outside");
  await expect(block(page, 2)).toContainText("Tail");
});

test("block insertion, heading conversion, Markdown, and column and callout structure are visible in read mode", async ({ page }) => {
  await seed(page, "<p>正文</p><p>次段</p>");
  await handle(page, 0).click({ force: true });
  await page.getByRole("button", { name: "其他标题" }).click();
  await page.getByRole("button", { name: "标题 9", exact: true }).click();
  await expect(block(page, 0).locator('[data-heading-level="9"]')).toHaveText("正文");

  await insertAfter(page, 1, "两栏");
  await expect(block(page, 2).locator("[data-column]")).toHaveCount(2);
  const columns = block(page, 2).locator(".tiptap [data-column]");
  await caret(columns.nth(0).locator("p"));
  await page.keyboard.insertText("左栏");
  await caret(columns.nth(1).locator("p"));
  await page.keyboard.insertText("右栏");

  await insertAfter(page, 2, "高亮块");
  await expect(block(page, 3).locator("aside[data-callout]")).toBeVisible();
  await insertAfter(page, 3, "正文");
  await expect(block(page, 4).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText(">");
  await page.keyboard.press("Space");
  await expect(block(page, 4).locator(".tiptap blockquote")).toBeVisible();
  await expect(block(page, 4).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("引用文字");
  await expect(block(page, 4).locator("blockquote")).toHaveText("引用文字");
  await insertAfter(page, 4, "分割线");
  await expect(block(page, 5).locator("hr")).toBeVisible();

  await page.getByRole("button", { name: "阅读", exact: true }).click();
  await expect(block(page, 2).locator("[data-column]")).toHaveText(["左栏", "右栏"]);
  await expect(block(page, 4).locator("blockquote")).toHaveText("引用文字");
  await expect(view(page).getByRole("button", { name: /块操作/ })).toHaveCount(0);
});

test("the block menu and drag move a collapsed section as a unit and undo restores its ID", async ({ page }) => {
  await seed(page, "<h1>Chapter</h1><p>Hidden</p><h1>Other</h1><p>Tail</p>");
  const row = block(page, 0);
  const chapter = await row.getAttribute("id");
  await row.getByRole("button", { name: "Chapter 章节" }).click();
  await expect(view(page).getByText("Hidden", { exact: true })).toHaveCount(0);
  await handle(page, 0).click({ force: true });
  await page.getByRole("button", { name: "下移", exact: true }).click();
  await expect(block(page, 2)).toHaveAttribute("id", chapter!);
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 0)).toHaveAttribute("id", chapter!);

  const drag = await handle(page, 0).boundingBox();
  const target = await block(page, 3).boundingBox();
  await page.mouse.move(drag!.x + 5, drag!.y + 5);
  await page.mouse.down();
  await page.mouse.move(target!.x + 10, target!.y + target!.height - 2, { steps: 12 });
  await page.mouse.up();
  await expect(block(page, 2)).toHaveAttribute("id", chapter!);
  await expect(page.getByRole("group", { name: "内容块命令" })).toHaveCount(0);
  await block(page, 2).getByRole("button", { name: "Chapter 章节" }).click();
  await expect(block(page, 3).getByText("Hidden", { exact: true })).toBeVisible();
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 0)).toHaveAttribute("id", chapter!);
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

test("floating selection formats and whole-block cut and copy use the normal clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await seed(page, "<p>Alpha</p><p>Beta</p><p>Gamma</p>");
  const editor = await activate(page, 0);
  const floating = page.getByRole("toolbar", { name: "选区工具栏" });
  await expect(page.getByRole("toolbar")).toHaveCount(0);
  const text = await editor.locator("p").evaluate((paragraph) => {
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    const { left, right, top, bottom } = range.getBoundingClientRect();
    return { left, right, top, y: (top + bottom) / 2 };
  });
  await page.mouse.move(text.left + 1, text.y);
  await page.mouse.down();
  await page.mouse.move(text.right + 2, text.y, { steps: 6 });
  await expect(floating).toHaveCount(0);
  await page.mouse.up();
  await expect(floating).toBeVisible();
  const bounds = (await floating.boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThan(text.top);
  await floating.getByRole("button", { name: "粗体" }).click();
  await expect(editor.locator("strong")).toHaveText("Alpha");

  await page.keyboard.press("ArrowRight");
  await expect(floating).toBeHidden();
  await expect(block(page, 0).getByRole("button")).toHaveCount(1);
  await expect(handle(page, 0).locator('[data-block-icon="paragraph"]')).toHaveCount(1);
  await handle(page, 0).click({ force: true });
  await page.getByRole("button", { name: "选中块", exact: true }).click();
  await expect(block(page, 0)).toHaveAttribute("data-block-selected");
  await handle(page, 1).click({ force: true, modifiers: ["Shift"] });
  await expect(view(page).locator("[data-block-selected]")).toHaveCount(2);
  await view(page).press("ControlOrMeta+c");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("Alpha\nBeta");
  await view(page).press("ControlOrMeta+x");
  await expect(view(page).locator("[data-block-index]")).toHaveCount(1);
  await expect(block(page, 0)).toContainText("Gamma");
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 0).locator("strong")).toHaveText("Alpha");
  await expect(block(page, 1)).toContainText("Beta");
});

test("opening another block menu preserves the live caret, and converts only its source block", async ({ page }) => {
  await seed(page, "<p>Alpha</p><p>Beta</p><p>Gamma</p>");
  const beta = await activate(page, 1);
  await caret(beta.locator("p"), 2);
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
  await caret(editor.locator("p"));
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
  const paragraph = first.locator("p");
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

test("document title, icon, cover and info visibility persist per sample", async ({ page }) => {
  await page.goto(file);
  await page.getByText("文档外观", { exact: true }).click();
  await page.getByRole("textbox", { name: "文档标题" }).fill("项目评审");
  await page.getByRole("combobox", { name: "标题图标" }).selectOption("📘");
  await page.getByRole("combobox", { name: "封面" }).selectOption({ label: "苔绿" });
  await page.getByRole("checkbox", { name: "显示文档信息" }).uncheck();
  await expect(page.getByRole("heading", { level: 1, name: "项目评审" })).toBeVisible();
  await expect(page.locator('[data-cover="2"]')).toBeVisible();
  await expect(page.getByText(/段 · 挂载/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "项目评审" })).toBeVisible();
  await expect(page.locator('[data-cover="2"]')).toBeVisible();
  await expect(page.getByText(/段 · 挂载/)).toHaveCount(0);
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("link", { name: "30 万字", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "长文档原型" })).toBeVisible();
});
