import { expect, test, type Locator, type Page } from "@playwright/test";
import { copyClipboard, pasteClipboard } from "./editor-clipboard";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const text = "111\n222\n333";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

async function openBlocks(page: Page, html: string, count = 3) {
  await page.goto(origin + "/editor?new=1");
  const view = page.getByRole("region", { name: "文档正文" });
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await pasteClipboard(view, { html, text });
  await expect(view.locator("[data-block-index]")).toHaveCount(count);
  await expect(view.locator(".tiptap")).toBeFocused();
  return view;
}

async function selectBody(page: Page, view: Locator, expected = text) {
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await expect.poll(async () => (await copyClipboard(view)).text).toBe(expected);
}

async function chooseQuote(page: Page) {
  await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click();
  await page.getByRole("group", { name: "内容块命令" }).getByRole("button", { name: "引用", exact: true }).click();
}

test("moves a selected paragraph and its native bold node into the quote", async ({ page }) => {
  const view = await openBlocks(page, "<p><strong>Alpha</strong></p>", 1);
  const editor = view.locator("#block-1 .tiptap");
  await expect(editor).toBeFocused();
  const paragraph = await editor.locator('[data-block-type="paragraph"]').elementHandle();
  const word = await editor.locator("strong").elementHandle();
  for (let i = 0; i < 5; i++) await page.keyboard.press("Shift+ArrowLeft");
  const selected = () => page.evaluate(() => document.getSelection()?.toString());
  await expect.poll(selected).toBe("Alpha");
  await chooseQuote(page);
  await expect(view.locator("blockquote[data-quote-group] strong")).toHaveText("Alpha");
  expect(await paragraph?.evaluate((node) => node.closest("blockquote") !== null)).toBe(true);
  expect(await word?.evaluate((node) => node.closest("blockquote") !== null)).toBe(true);
  await expect(editor).toBeFocused();
  await expect.poll(selected).toBe("Alpha");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(view.locator("blockquote[data-quote-group]")).toHaveCount(0);
  expect(await paragraph?.evaluate((node) => node.isConnected)).toBe(true);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(view.locator("blockquote[data-quote-group] strong")).toHaveText("Alpha");
  expect(await word?.evaluate((node) => node.closest("blockquote") !== null)).toBe(true);
});

test("includes the final empty row when whole-document selection wraps all six blocks", async ({ page }) => {
  const view = await openBlocks(page, "<p></p><p>111</p><p></p><p> </p><p>222<br>223</p><p></p>", 6);
  const rowIds = await view.locator("[data-block-index]").evaluateAll((nodes) => nodes.map((node) => node.id));
  await view.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+Shift+.");
  const quote = view.locator("blockquote[data-quote-group]");
  await expect(quote.locator("[data-block-index]")).toHaveCount(6);
  expect(await quote.locator("[data-block-index]").evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual(rowIds);
  expect((await copyClipboard(view)).html).toMatch(/<p><\/p><\/blockquote>$/);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote).toHaveCount(0);
  await expect(view.locator("[data-block-index]")).toHaveCount(6);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(quote.locator("[data-block-index]")).toHaveCount(6);
});

test("wraps the same DOM rows in one quote, keeps their marks and selection, and unwraps with history", async ({ page }) => {
  const view = await openBlocks(page, "<p><strong>111</strong></p><p>222</p><p><em>333</em></p>");
  const rows = view.locator("[data-block-index]");
  await selectBody(page, view);
  const originals = await rows.elementHandles();
  const inline = await view.getByText("111", { exact: true }).elementHandle();

  await chooseQuote(page);
  const quote = view.locator("blockquote[data-quote-group]");
  await expect(quote).toHaveCount(1);
  await expect(quote.locator("[data-block-index]")).toHaveText(["111", "222", "333"]);
  await expect(view).toBeFocused();
  expect(await page.evaluate((previous) => previous.every((row) => row instanceof Element && document.getElementById(row.id) === row), originals)).toBe(true);
  expect(await inline?.evaluate((element) => element.isConnected && element.closest("blockquote") !== null)).toBe(true);
  const clipboard = await copyClipboard(view);
  expect(clipboard.text).toBe(text);
  expect(clipboard.html).toBe("<blockquote><p><strong>111</strong></p><p>222</p><p><em>333</em></p></blockquote>");

  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote).toHaveCount(0);
  expect((await copyClipboard(view)).text).toBe(text);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(quote.locator("[data-block-index]")).toHaveCount(3);

  await page.keyboard.press("ControlOrMeta+Alt+1");
  await expect(quote.locator("[data-heading-level='1']")).toHaveCount(3);
  await page.keyboard.press("ControlOrMeta+Alt+1");
  await expect(quote.locator("[data-heading-level]")).toHaveCount(0);
  await expect(quote.locator("[data-block-index]")).toHaveText(["111", "222", "333"]);
  await page.keyboard.press("ControlOrMeta+Shift+.");
  await expect(quote).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote.locator("[data-block-index]")).toHaveCount(3);
  expect(await page.evaluate((previous) => previous.every((row) => row instanceof Element && document.getElementById(row.id) === row), originals)).toBe(true);
});

for (const level of [1, 9]) {
  test(`normalizes a mixed selection to H${level}, then toggles all its headings in one undo step`, async ({ page }) => {
    const view = await openBlocks(page, `<h2 data-heading-level="${level}">111</h2><p>222</p><p>333</p>`);
    const headings = view.locator(`[data-heading-level="${level}"]`);
    const key = "ControlOrMeta+Alt+" + level;
    await selectBody(page, view);
    await page.keyboard.press(key);
    await expect(headings).toHaveCount(3);
    await page.keyboard.press(key);
    await expect(headings).toHaveCount(0);
    expect((await copyClipboard(view)).text).toBe(text);
    await page.keyboard.press("ControlOrMeta+z");
    await expect(headings).toHaveCount(3);
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(headings).toHaveCount(0);
    await expect(view.locator("[data-block-index]")).toHaveText(["111", "222", "333"]);
  });
}

test("quotes a folded heading and its hidden descendants without including the next heading at offset zero", async ({ page }) => {
  const view = await openBlocks(page, '<h2 data-heading-level="1">111</h2><h6 data-heading-level="9">222</h6><h2 data-heading-level="1">333</h2>');
  await view.getByRole("button", { name: "111 章节" }).click();
  await expect(view.getByText("222", { exact: true })).toHaveCount(0);
  const start = await view.getByText("111", { exact: true }).boundingBox();
  const end = await view.getByText("333", { exact: true }).boundingBox();
  expect(start && end).toBeTruthy();
  await page.mouse.move(start!.x, start!.y + start!.height / 2);
  await page.mouse.down();
  await page.mouse.move(end!.x, end!.y + end!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await copyClipboard(view)).text).toBe("111\n222\n");

  await chooseQuote(page);
  const quote = view.locator("blockquote[data-quote-group]");
  await expect(quote.locator("[data-block-index]")).toHaveText(["111"]);
  await expect(view.getByText("333", { exact: true })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote).toHaveCount(0);
  await expect(view.getByText("222", { exact: true })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(quote.locator("[data-block-index]")).toHaveText(["111"]);
  await expect(view.getByText("222", { exact: true })).toHaveCount(0);
  await view.getByRole("button", { name: "111 章节" }).click();
  await expect(quote.locator("[data-block-index]")).toHaveText(["111", "222"]);
});

for (const rows of [1, 3]) {
  for (const tag of ["ol", "ul"]) {
    test(`toggles three ${tag} items to text in ${rows} rendering rows and restores the range on undo`, async ({ page }) => {
      const items = ["111", "222", "333"].map((label) => `<li><p><strong>${label}</strong></p></li>`);
      const html = rows === 1 ? `<${tag}>${items.join("")}</${tag}>` : items.map((item) => `<${tag}>${item}</${tag}>`).join("");
      const view = await openBlocks(page, html, rows);
      const sourceText = tag === "ol" ? rows === 1 ? "1. 111\n2. 222\n3. 333" : "1. 111\n1. 222\n1. 333" : text;
      await selectBody(page, view, sourceText);
      const listItems = view.locator('[data-block-type="list-item"]');
      await expect(listItems).toHaveCount(3);
      const originalIds = await view.locator("[data-block-index]").evaluateAll((blocks) => blocks.map((block) => block.id));
      await page.keyboard.press(tag === "ol" ? "ControlOrMeta+Shift+7" : "ControlOrMeta+Shift+8");
      await expect(listItems).toHaveCount(0);
      await expect(view.locator("strong")).toHaveText(["111", "222", "333"]);
      expect((await copyClipboard(view)).text).toBe(text);
      await expect(view.locator("#" + originalIds[0])).toHaveCount(1);
      await page.keyboard.press("ControlOrMeta+z");
      await expect(listItems).toHaveCount(3);
      expect((await copyClipboard(view)).text).toBe(sourceText);
      await page.keyboard.press("ControlOrMeta+Shift+z");
      await expect(listItems).toHaveCount(0);
      expect((await copyClipboard(view)).text).toBe(text);
    });
  }
  test(`turns three ordered items in ${rows} rendering rows into one numbered heading sequence`, async ({ page }) => {
    const items = ["111", "222", "333"].map((label) => `<li><p><em>${label}</em></p></li>`);
    const html = rows === 1 ? `<ol>${items.join("")}</ol>` : items.map((item, index) => `<ol start="${index + 1}">${item}</ol>`).join("");
    const view = await openBlocks(page, html, rows);
    const numberedText = "1. 111\n2. 222\n3. 333";
    await selectBody(page, view, numberedText);
    await page.keyboard.press("ControlOrMeta+Alt+9");
    const numbers = view.locator("[data-heading-number]");
    await expect(view.locator('[data-heading-level="9"]')).toHaveCount(3);
    await expect(numbers).toHaveText(["1.", "2.", "3."]);
    await expect(view.locator("em")).toHaveText(["111", "222", "333"]);
    expect((await copyClipboard(view)).text).toBe(numberedText);
    await page.keyboard.press("ControlOrMeta+z");
    await expect(numbers).toHaveCount(0);
    await expect(view.locator('[data-block-type="list-item"]')).toHaveCount(3);
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(numbers).toHaveText(["1.", "2.", "3."]);
    expect((await copyClipboard(view)).text).toBe(numberedText);
  });
}

test("converts a list parent without converting its child or the next sibling", async ({ page }) => {
  const view = await openBlocks(page, "<ol><li><p>PARENT</p><ol><li><p>CHILD</p></li></ol></li><li><p>TAIL</p></li></ol>", 1);
  await view.getByText("PARENT", { exact: true }).click({ position: { x: 1, y: 8 } });
  await expect(view.locator(".tiptap")).toBeFocused();
  const shape = () => view.locator('[data-block-type="paragraph"]').evaluateAll((paragraphs) =>
    paragraphs.map((paragraph) => paragraph.closest('[role="list"]')?.getAttribute("data-block-type")));
  await expect.poll(shape).toEqual(["ordered-list", "ordered-list", "ordered-list"]);
  await page.keyboard.press("ControlOrMeta+Shift+8");
  await expect.poll(shape).toEqual(["bullet-list", "ordered-list", "ordered-list"]);
  await expect(view.locator('#block-1 [data-block-type="bullet-list"] [data-block-type="ordered-list"]')).toHaveText("CHILD");
  await selectBody(page, view, "PARENT\na. CHILD\n1. TAIL");
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(shape).toEqual(["ordered-list", "ordered-list", "ordered-list"]);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect.poll(shape).toEqual(["bullet-list", "ordered-list", "ordered-list"]);
});

test("continues an existing ordered sequence across a converted paragraph and respects an explicit restart", async ({ page }) => {
  const view = await openBlocks(page, "<p>111</p><p>222</p><p>333</p>");
  const ordered = view.locator('[data-block-type="ordered-list"]');
  const starts = () => ordered.evaluateAll((lists) => lists.map((list) => list.getAttribute("data-list-start")));
  await selectBody(page, view);
  await page.keyboard.press("ControlOrMeta+Shift+7");
  await expect.poll(starts).toEqual(["1", "2", "3"]);

  await view.getByText("222", { exact: true }).click();
  await expect(view.locator(".tiptap")).toHaveText("222");
  await page.keyboard.press("ControlOrMeta+Shift+7");
  await expect.poll(starts).toEqual(["1", "2"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect.poll(starts).toEqual(["1", "2", "3"]);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect.poll(starts).toEqual(["1", "2"]);

  const afterGap = view.locator("[data-block-index]").nth(2);
  const menu = afterGap.getByRole("button", { name: "第 3 块操作" });
  await afterGap.hover();
  await menu.click();
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect.poll(starts).toEqual(["1", "1"]);
  await menu.click();
  await page.getByRole("button", { name: "续编", exact: true }).click();
  await expect.poll(starts).toEqual(["1", "2"]);
  await expect(view.locator("[data-block-index]")).toHaveText(["111", "222", "333"]);
});

test("undoes a fold before the preceding body edit and preserves the local action order on redo", async ({ page }) => {
  const view = await openBlocks(page, '<h2 data-heading-level="1">111</h2><h6 data-heading-level="9">222</h6><h2 data-heading-level="1">333</h2>');
  await expect(view.locator(".tiptap")).toBeFocused();
  const fold = view.getByRole("button", { name: "111 章节" });
  await fold.focus();
  await page.keyboard.press("Space");
  await expect(fold).toBeFocused();
  await expect(view.getByText("222", { exact: true })).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(view.getByText("222", { exact: true })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(view.locator("[data-block-index]")).toHaveCount(1);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(view.getByText("222", { exact: true })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(view.getByText("222", { exact: true })).toHaveCount(0);
});

test("undoes a folded heading conversion expanded and restores a deleted section folded", async ({ page }) => {
  const view = await openBlocks(page, '<h2 data-heading-level="1">111</h2><h6 data-heading-level="9">222</h6><h2 data-heading-level="1">333</h2>');
  const first = view.locator("#block-1");
  const fold = first.getByRole("button", { name: "111 章节" });
  await fold.click();
  await first.getByText("111", { exact: true }).click();
  await expect(first.locator(".tiptap")).toBeFocused();
  await page.keyboard.press("ControlOrMeta+Alt+0");
  await expect(view.getByText("222", { exact: true })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(fold).toHaveAttribute("aria-expanded", "true");
  await expect(view.getByText("222", { exact: true })).toBeVisible();
  await fold.click();
  await first.hover();
  await first.getByRole("button", { name: "第 1 块操作" }).click();
  await page.getByRole("button", { name: "删除块", exact: true }).click();
  await expect(view.locator("[data-block-index]")).toHaveText(["333"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(fold).toHaveAttribute("aria-expanded", "false");
  await expect(view.locator("[data-block-index]")).toHaveText(["111", "333"]);
});

test("replaces a whole-document selection with a typed character in one undo step", async ({ page }) => {
  const view = await openBlocks(page, "<p>111</p><p>222</p><p>333</p>");
  await selectBody(page, view);
  await page.keyboard.type("Q");
  await expect(view.locator("[data-block-index]")).toHaveText(["Q"]);
  await expect(view.locator("#block-1 .tiptap")).toBeFocused();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(view.locator("[data-block-index]")).toHaveText(["111", "222", "333"]);
  expect((await copyClipboard(view)).text).toBe(text);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(view.locator("#block-1 .tiptap")).toBeFocused();
  await page.keyboard.type("R");
  await expect(view.locator("[data-block-index]")).toHaveText(["QR"]);
});

test("typing over a reverse range keeps the unselected formatting on both sides", async ({ page }) => {
  const view = await openBlocks(page, "<p><strong>AA</strong><em>111</em></p><p></p><p><em>333</em><u>ZZ</u></p>");
  const start = await view.getByText("ZZ", { exact: true }).boundingBox();
  const end = await view.getByText("111", { exact: true }).boundingBox();
  expect(start && end).toBeTruthy();
  await page.mouse.move(start!.x, start!.y + start!.height / 2);
  await page.mouse.down();
  await page.mouse.move(end!.x, end!.y + end!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await copyClipboard(view)).text).toBe("111\n\n333");

  await page.keyboard.type("Q");
  await expect(view.locator("[data-block-index]")).toHaveText(["AAQZZ"]);
  await expect(view.locator("strong")).toHaveText("AA");
  await expect(view.locator("u")).toHaveText("ZZ");
  await page.keyboard.press("ControlOrMeta+z");
  expect((await copyClipboard(view)).text).toBe("111\n\n333");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(view.locator("[data-block-index]")).toHaveText(["AAQZZ"]);
});

test("keeps the viewport window bounded when thousands of quoted rows share one container", async ({ page }) => {
  await page.goto(origin + "/editor?size=500000");
  const view = page.getByRole("region", { name: "文档正文" });
  await expect(view.locator("#block-1")).toBeVisible();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+Shift+.");
  const quote = view.locator("blockquote[data-quote-group]");
  await expect(quote.locator("#block-1")).toBeVisible();
  const group = await quote.getAttribute("data-quote-group");
  await view.evaluate((element) => { element.scrollTop = 40_000; });
  await expect(quote.locator("#block-1")).toHaveCount(0);
  await expect(quote).toHaveAttribute("data-quote-group", group!);
  expect(await quote.locator("[data-block-index]").count()).toBeLessThan(60);
});
