import { expect, test, type Locator, type Page } from "@playwright/test";
import { copyClipboard, cutClipboard, pasteClipboard } from "./editor-clipboard";
import { seedBlank, block, handle, activate } from "./editor-page";
import { createDocument } from "../../../src/features/document-editor/model/document-model";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const file = origin + "/editor?size=500000";
const sample = createDocument(500_000);
const original = sample.map(({ text }) => text).join("\n");

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

function body(page: Page) {
  return page.getByRole("region", { name: "文档正文" });
}

function count(page: Page) {
  return page.locator("main[data-block-count]");
}

async function paste(target: Locator, text: string, html = "") {
  await pasteClipboard(target, { text, html: html || undefined });
}

test("ED-25 a denied system clipboard write leaves the cut block intact", async ({ page }) => {
  await page.addInitScript(() => {
    const deny = () => Promise.reject(new DOMException("QA denied write", "NotAllowedError"));
    Object.defineProperties(navigator.clipboard, { write: { value: deny }, writeText: { value: deny } });
  });
  const surface = await seedBlank(page, "<p>Keep this block</p><p>Keep its neighbor</p>");
  await handle(page, 0).click({ force: true });
  await page.getByRole("button", { name: "剪切块", exact: true }).click();
  await expect(page.getByText("无法写入剪贴板", { exact: true })).toBeVisible();
  await expect(surface.locator("[data-block-index]")).toHaveCount(2);
  await expect(block(page, 0)).toContainText("Keep this block");
  await expect(block(page, 1)).toContainText("Keep its neighbor");
});

test("ED-26 foreign HTML preserves supported marks without importing annotation identity", async ({ page }) => {
  const surface = await seedBlank(page, "<p>Before</p>");
  const editor = surface.locator(".tiptap");
  await editor.press("End");
  await pasteClipboard(editor, { html: '<p><mark data-comment-id="foreign-note"><strong>批注文字</strong></mark></p><p><em>第二段</em></p>' });
  await expect(surface.locator("strong")).toHaveText("批注文字");
  await expect(surface.locator("em")).toHaveText("第二段");
  await expect(surface.locator("[data-comment-id]")).toHaveCount(0);
  await surface.press("ControlOrMeta+a");
  await surface.press("ControlOrMeta+a");
  const copied = await copyClipboard(surface);
  expect(copied.text).toBe("Before\n批注文字\n第二段");
  expect(copied.html).not.toContain("foreign-note");
});

for (const length of [99_999, 100_000, 100_001]) {
  test(`ED-27 pastes ${length} characters without truncation and restores the whole operation`, async ({ page }) => {
    const surface = await seedBlank(page, "<p>边界</p>");
    const title = await page.getByRole("heading").first().textContent();
    const editor = surface.locator(".tiptap");
    await editor.press("ControlOrMeta+a");
    const payload = "a".repeat(length - 1) + "z";
    await pasteClipboard(editor, { text: payload });
    await expect.poll(() => block(page, 0).evaluate((row) => {
      const text = row.querySelector(".tiptap, [data-block-text]")?.textContent ?? "";
      return [text.length, text.at(-1)];
    })).toEqual([length, "z"]);
    await surface.press("ControlOrMeta+z");
    await expect(block(page, 0)).toContainText("边界");
    await surface.press("ControlOrMeta+Shift+z");
    await expect.poll(() => block(page, 0).evaluate((row) =>
      row.querySelector(".tiptap, [data-block-text]")?.textContent?.length)).toBe(length);
    await expect(page.getByRole("heading").first()).toHaveText(title!);
  });
}

test("ED-29 plain clipboard normalizes Unicode, keeps graphemes and rejects full-width Markdown", async ({ page }) => {
  await page.goto(origin + "/editor?new=1");
  const surface = body(page);
  await surface.press("Enter");
  const editor = surface.locator(".tiptap");
  await expect(editor).toBeFocused();
  await pasteClipboard(editor, { text: "中文e\u0301\t零\u200B宽\u200D😀" });
  await expect(block(page, 0)).toContainText("零宽😀");
  await surface.press("ControlOrMeta+a");
  expect((await copyClipboard(surface)).text).toBe("中文é        零宽😀");
  const active = await activate(page, 0);
  await active.press("End");
  await page.keyboard.press("Backspace");
  await expect(active).toHaveText("中文é 零宽", { useInnerText: true });
  await page.keyboard.press("Enter");
  await expect(block(page, 1).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("＃");
  await page.keyboard.press("Space");
  await page.keyboard.insertText("中文");
  await expect(block(page, 1)).toContainText("＃ 中文");
  await expect(block(page, 1).locator("[data-heading-level]")).toHaveCount(0);
});

test("native cut and paste restore all 50万字 from virtual rows and undo each operation once", async ({ page, context }) => {
  test.setTimeout(60_000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(file);
  const view = body(page);
  await expect(view.locator("#block-1")).toBeInViewport();
  expect(await view.locator("[data-block-index]").count()).toBeLessThan(60);

  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+x");
  await expect(count(page)).toHaveAttribute("data-block-count", "1");
  const destination = view.locator("#block-1 .tiptap");
  await expect(destination).toBeFocused();
  await expect(destination).toHaveText("");
  expect(await page.evaluate(() => navigator.clipboard.readText()) === original).toBe(true);

  await page.keyboard.press("ControlOrMeta+v");
  await expect(count(page)).toHaveAttribute("data-block-count", String(sample.length));
  await expect(view.locator(".tiptap")).toBeFocused();
  expect(await view.locator("[data-block-index]").count()).toBeLessThan(60);
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  expect((await copyClipboard(view)).text === original).toBe(true);
  const headings = view.locator("[data-heading-level]");
  await page.getByRole("navigation", { name: "文档目录" }).getByRole("link", { name: "第 1 节 · 长文档阅读与编辑", exact: true }).click();
  await expect(headings.first()).toHaveText(sample[35].text);

  await view.focus();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(count(page)).toHaveAttribute("data-block-count", "1");
  await expect(destination).toHaveText("");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(count(page)).toHaveAttribute("data-block-count", String(sample.length));
  await expect(view).toBeFocused();
  expect((await copyClipboard(view)).text === original).toBe(true);
});

test("selects the current paragraph before extending to the document", async ({ page }) => {
  await page.goto(origin + "/editor?new=1");
  const view = body(page);
  await expect(view.locator("#block-1")).toBeVisible();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await paste(view, "Alpha\nBeta\nGamma");
  await view.getByText("Beta", { exact: true }).click();
  await expect(view.locator(".tiptap")).toBeFocused();

  await page.keyboard.press("ControlOrMeta+a");
  await expect.poll(() => page.evaluate(() => document.getSelection()?.toString())).toBe("Beta");
  await page.keyboard.press("ControlOrMeta+a");
  expect((await copyClipboard(view)).text).toBe("Alpha\nBeta\nGamma");
});

test("multiline replacement preserves the boundary text and moves the caret to the pasted text", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  await expect(view.locator("#block-1")).toBeInViewport();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await paste(view, "Gamma");
  const edit = view.locator(".tiptap");
  await expect(edit).toBeFocused();
  await expect(edit).toHaveText("Gamma");
  await page.keyboard.press("ArrowLeft");
  for (let index = 0; index < 3; index++) await page.keyboard.press("Shift+ArrowLeft");

  await paste(edit, "");
  await expect(edit).toHaveText("Gamma");
  await paste(edit, "One\r\nTwo");
  const rows = view.locator("[data-block-index]");
  await expect(rows).toHaveText(["G", "One", "Two", "a"]);
  await expect(rows.nth(2).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("🙂");
  await expect(rows).toHaveText(["G", "One", "Two🙂", "a"]);
  await expect(view.locator("[data-editor-active]")).toHaveAttribute("data-composing", "false");

  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["G", "One", "Two", "a"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["Gamma"]);
  expect((await copyClipboard(view)).text).toBe("amm");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(rows).toHaveText(["G", "One", "Two", "a"]);
});

test("cross-block clipboard keeps supported HTML and read mode allows copying only", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  await expect(view.locator("#block-1")).toBeInViewport();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  await paste(view, "着重\n分节\n结尾", '<p><strong>着</strong><em>重</em></p><h2>分节</h2><p>结尾</p>');
  const editMode = page.getByRole("group", { name: "文档模式" });
  await editMode.getByRole("button", { name: "阅读" }).click();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+a");
  const clipboard = await copyClipboard(view);
  expect(clipboard.text).toBe("着重\n分节\n结尾");
  expect(clipboard.html).toContain("<strong>着</strong>");
  expect(clipboard.html).toContain("<em>重</em>");
  expect(clipboard.html).toContain('<h3 data-heading-level="2">分节</h3>');
  await cutClipboard(view);
  await paste(view, "不会写入");
  await expect(view.locator("[data-block-index]")).toHaveText(["着重", "分节", "结尾"]);

  await editMode.getByRole("button", { name: "编辑" }).click();
  await view.locator("#block-1 [data-block-text]").click();
  await expect(view.locator("#block-1 .tiptap strong")).toHaveText("着");
  await expect(view.locator("#block-1 .tiptap em")).toHaveText("重");
});
