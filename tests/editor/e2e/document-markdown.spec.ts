import { expect, test, type Locator, type Page } from "@playwright/test";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const paragraphSelector = '[data-block-type="paragraph"]';
const listItemSelector = '[data-block-type="list-item"]';

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

async function openEmptyEditor(page: Page) {
  await page.goto(origin + "/editor?new=1");
  const body = page.getByRole("region", { name: "文档正文" });
  const row = body.locator("#block-1");
  await row.locator("[data-block-text]").click({ position: { x: 1, y: 8 } });
  const editor = row.locator(".tiptap");
  await expect(editor).toBeFocused();
  const paragraph = editor.locator(":scope > " + paragraphSelector);
  await expect(paragraph).toHaveJSProperty("textContent", "");
  return { body, editor, paragraph };
}

async function expectCaretInside(block: Locator) {
  await expect(block).toHaveCount(1);
  await expect.poll(() => block.evaluate((element) => {
    const selection = document.getSelection();
    return Boolean(selection?.isCollapsed && element.contains(selection.anchorNode));
  })).toBe(true);
}

for (const level of [1, 2, 3, 4, 5, 6, 7, 8, 9]) {
  const caseId = level === 1 ? "ED-05" : `ED-06-H${level}`;
  test(`${caseId} uses a separate Space key to create H${level} and keep the caret in the heading`, async ({ page }) => {
    const { editor, paragraph } = await openEmptyEditor(page);
    for (let index = 0; index < level; index++) {
      await page.keyboard.press("Shift+Digit3");
    }
    await expect(paragraph).toHaveJSProperty("textContent", "#".repeat(level));
    await expect(editor.locator("[data-heading-level]")).toHaveCount(0);

    await page.keyboard.press("Space");
    const heading = editor.locator(`[data-heading-level="${level}"]`);
    await expect(heading).toHaveJSProperty("textContent", "");
    await expectCaretInside(heading);
    await page.keyboard.press(String(level));
    await expect(heading).toHaveJSProperty("textContent", String(level));
    await expect(page.getByRole("heading", { name: "无标题文档", exact: true })).toBeVisible();
  });
}

test("ED-05-非行首 preserves a hash and a space while typing within a paragraph", async ({ page }) => {
  const { editor, paragraph } = await openEmptyEditor(page);
  await page.keyboard.press("a");
  await page.keyboard.press("Shift+Digit3");
  await page.keyboard.press("Space");

  await expect(paragraph).toHaveJSProperty("textContent", "a# ");
  await expect(editor.locator("[data-heading-level]")).toHaveCount(0);
  await expectCaretInside(paragraph);
});

const listInputs = [
  { name: "无序减号", prefix: "-", keys: ["Minus"], type: "bullet-list" },
  { name: "无序星号", prefix: "*", keys: ["Shift+Digit8"], type: "bullet-list" },
  { name: "有序", prefix: "1.", keys: ["Digit1", "Period"], type: "ordered-list" },
] as const;

for (const { name, prefix, keys, type } of listInputs) {
  test(`ED-07-${name} enters, continues and exits a list through the real keys`, async ({ page }) => {
    const { body, editor, paragraph } = await openEmptyEditor(page);
    for (const key of keys) await page.keyboard.press(key);
    await expect(paragraph).toHaveJSProperty("textContent", prefix);
    await page.keyboard.press("Space");

    const selector = `[data-block-type="${type}"] > ${listItemSelector}`;
    const items = editor.locator(selector);
    await expect(items).toHaveCount(1);
    await expect(items.first()).toHaveJSProperty("textContent", "");
    await expectCaretInside(items.first());
    await page.keyboard.press("Digit1");
    await expect(items.first()).toHaveText("1");
    await page.keyboard.press("Enter");
    await expect(items).toHaveCount(2);
    await expect(items.last()).toHaveJSProperty("textContent", "");
    await expectCaretInside(items.last());

    await page.keyboard.press("Enter");
    const outside = body.locator(".tiptap > " + paragraphSelector);
    await expectCaretInside(outside);
    await page.keyboard.press("Digit2");
    await expect(outside).toHaveText("2");
    await expect(body.locator(selector)).toHaveText(["1"]);
  });
}

test("ED-07-引用 keeps the quoted text when a second Enter exits the empty child", async ({ page }) => {
  const { body, editor, paragraph } = await openEmptyEditor(page);
  await page.keyboard.press("Shift+Period");
  await expect(paragraph).toHaveJSProperty("textContent", ">");
  await page.keyboard.press("Space");

  const quoteSelector = '[data-block-type="quote"]';
  const inside = editor.locator(quoteSelector).locator(paragraphSelector);
  await expect(inside).toHaveJSProperty("textContent", "");
  await expectCaretInside(inside);
  await page.keyboard.press("Digit3");
  await expect(inside).toHaveText("3");
  await page.keyboard.press("Enter");
  await expect(inside).toHaveText(["3", ""]);
  await expectCaretInside(inside.last());
  await page.keyboard.press("Enter");

  const outside = body.locator(".tiptap > " + paragraphSelector);
  await expectCaretInside(outside);
  await page.keyboard.press("Digit4");
  await expect(outside).toHaveText("4");
  await expect(body.locator(quoteSelector)).toHaveText("3");
});

const inlineInputs = [
  { name: "粗体", word: "alpha", delimiter: "**", key: "Shift+Digit8", tag: "strong" },
  { name: "斜体", word: "beta", delimiter: "*", key: "Shift+Digit8", tag: "em" },
  { name: "删除线", word: "gamma", delimiter: "~~", key: "Shift+Backquote", tag: "s" },
  { name: "下划线", word: "omega", delimiter: "~", key: "Shift+Backquote", tag: "u" },
  { name: "行内代码", word: "delta", delimiter: "`", key: "Backquote", tag: "code" },
] as const;

function readInlineState(paragraph: Locator) {
  return paragraph.evaluate((element) => ({
    text: element.textContent,
    marks: Array.from(element.querySelectorAll("strong, em, s, u, code"), (mark) => ({
      tag: mark.localName,
      text: mark.textContent,
    })),
  }));
}

for (const { name, word, delimiter, key, tag } of inlineInputs) {
  test(`ED-08-${name} checks the mark on both sides of the Space key`, async ({ page }) => {
    const { paragraph } = await openEmptyEditor(page);
    for (let index = 0; index < delimiter.length; index++) await page.keyboard.press(key);
    await page.keyboard.type(word);
    for (let index = 0; index < delimiter.length; index++) await page.keyboard.press(key);
    const before = await readInlineState(paragraph);
    await page.keyboard.press("Space");
    await expectCaretInside(paragraph);
    const after = await readInlineState(paragraph);

    const marked = { text: word, marks: [{ tag, text: word }] };
    const literal = { text: delimiter + word + delimiter, marks: [] };
    expect({ before, after }).toEqual({
      before: tag === "code" ? marked : literal,
      after: { ...marked, text: word + " " },
    });
    await page.keyboard.press("KeyX");
    expect(await readInlineState(paragraph)).toEqual({ ...marked, text: word + " x" });
  });
}
