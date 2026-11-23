import { expect, test, type Locator, type Page } from "@playwright/test";
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
  await target.evaluate((element, { text, html }) => {
    const data = new DataTransfer();
    data.setData("text/plain", text);
    if (html) data.setData("text/html", html);
    element.dispatchEvent(new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }));
  }, { text, html });
}

async function copy(target: Locator) {
  return target.evaluate((element) => {
    const data = new DataTransfer();
    element.dispatchEvent(new ClipboardEvent("copy", { bubbles: true, cancelable: true, clipboardData: data }));
    return { text: data.getData("text/plain"), html: data.getData("text/html") };
  });
}

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
  await page.keyboard.press("ControlOrMeta+a");
  expect((await copy(view)).text === original).toBe(true);
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
  expect((await copy(view)).text === original).toBe(true);
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

  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["G", "One", "Two", "a"]);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(rows).toHaveText(["Gamma"]);
  expect((await copy(view)).text).toBe("amm");
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
  const clipboard = await copy(view);
  expect(clipboard.text).toBe("着重\n分节\n结尾");
  expect(clipboard.html).toContain("<strong>着</strong>");
  expect(clipboard.html).toContain("<em>重</em>");
  expect(clipboard.html).toContain('<h3 data-heading-level="2">分节</h3>');
  await view.evaluate((element) => {
    element.dispatchEvent(new ClipboardEvent("cut", { bubbles: true, cancelable: true, clipboardData: new DataTransfer() }));
  });
  await paste(view, "不会写入");
  await expect(view.locator("[data-block-index]")).toHaveText(["着重", "分节", "结尾"]);

  await editMode.getByRole("button", { name: "编辑" }).click();
  await view.locator("#block-1 [data-block-text]").click();
  await expect(view.locator("#block-1 .tiptap strong")).toHaveText("着");
  await expect(view.locator("#block-1 .tiptap em")).toHaveText("重");
});
