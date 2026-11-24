import { expect, test, type Page } from "@playwright/test";
import { copyClipboard, pasteClipboard } from "./editor-clipboard";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const file = origin + "/editor?size=500000";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

const body = (page: Page) => page.getByRole("region", { name: "文档正文" });
const layout = (page: Page) => page.getByRole("group", { name: "选区排版" });
const modes = (page: Page) => page.getByRole("group", { name: "文档模式" });
const firstCharacter = { x: 1, y: 10 };

async function jump(page: Page, index: number) {
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("spinbutton", { name: "段落编号" }).fill(String(index));
  await page.getByRole("button", { name: "跳转", exact: true }).click();
  await expect(body(page).locator("#block-" + index)).toBeInViewport();
}

function preview(page: Page, index: number) {
  return body(page).locator("#block-" + index + " [data-block-text]");
}

test("the selected paragraph supports alignment and the caret keeps the indentation shortcut", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  const original = await preview(page, 1).innerText();
  const buttons = layout(page);
  const align = (name: string) => buttons.getByRole("button", { name });
  const indent = align("首行缩进");
  await expect(buttons).toHaveCount(0);
  await preview(page, 1).click({ position: firstCharacter });

  const editor = view.locator("#block-1 .tiptap");
  const paragraph = editor.locator('div[data-block-type="paragraph"]');
  await expect(editor).toBeFocused();
  await expect(buttons).toHaveCount(0);
  await editor.press("Shift+ArrowRight");
  await expect(align("左对齐")).toHaveAttribute("aria-pressed", "true");
  for (const [label, value] of [["居中对齐", "center"], ["右对齐", "right"], ["左对齐", "left"]] as const) {
    await align(label).click();
    await expect(paragraph).toHaveCSS("text-align", value);
    await expect(buttons.locator('button[aria-pressed="true"]')).toHaveAccessibleName(label);
  }
  await align("居中对齐").click();
  await expect(paragraph).toHaveCSS("text-align", "center");
  await editor.press("ArrowLeft");
  await expect(buttons).toHaveCount(0);
  await editor.press("Tab");
  await expect(paragraph).toHaveCSS("text-indent", "32px");
  await expect(editor).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(editor).not.toBeFocused();
  await editor.press("Shift+Tab");
  await expect(paragraph).toHaveCSS("text-indent", "0px");
  await editor.press("ControlOrMeta+z");
  await expect(paragraph).toHaveCSS("text-indent", "32px");
  await expect(paragraph).toHaveCSS("text-align", "center");
  await editor.press("Shift+ArrowRight");
  await expect(indent).toHaveAttribute("aria-pressed", "true");
  await indent.click();
  await expect(paragraph).toHaveCSS("text-indent", "0px");
  await indent.click();
  await expect(paragraph).toHaveText(original);

  await modes(page).getByRole("button", { name: "阅读" }).click();
  await expect(preview(page, 1)).toHaveCSS("text-indent", "32px");
  await expect(preview(page, 1)).toHaveCSS("text-align", "center");
  await page.getByRole("button", { name: "演示", exact: true }).click();
  const presented = page.getByRole("region", { name: "演示正文" }).locator('[data-block-id="block-1"] [data-block-text]');
  await expect(presented).toHaveCSS("text-indent", "32px");
  await expect(presented).toHaveCSS("text-align", "center");
  await page.getByRole("button", { name: "退出演示" }).click();
});

test("one alignment transaction reaches unmounted paragraphs and excludes the untouched end paragraph", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  await modes(page).getByRole("button", { name: "阅读" }).click();
  await preview(page, 1).click({ position: firstCharacter });
  await modes(page).getByRole("button", { name: "编辑" }).click();
  await jump(page, 182);
  await expect(view.locator("#block-1")).toHaveCount(0);
  await preview(page, 182).click({ position: firstCharacter, modifiers: ["Shift"] });
  await layout(page).getByRole("button", { name: "右对齐" }).click();
  await expect(preview(page, 181)).toHaveCSS("text-align", "right");
  await expect(preview(page, 182)).toHaveCSS("text-align", "start");
  expect(await view.locator("[data-block-index]").count()).toBeLessThan(60);
  await jump(page, 1);
  await expect(preview(page, 1)).toHaveCSS("text-align", "right");
  await jump(page, 85);
  await expect(preview(page, 85)).toHaveCSS("text-align", "right");
  await view.press("ControlOrMeta+z");
  await jump(page, 1);
  await expect(preview(page, 1)).toHaveCSS("text-align", "start");
  await jump(page, 85);
  await expect(preview(page, 85)).toHaveCSS("text-align", "start");
});

test("the quote shortcut wraps formatted text and heading conversion stays inside the quote", async ({ page }) => {
  await page.goto(origin + "/editor?new=1");
  const row = page.locator("#block-1");
  const editor = row.locator(".tiptap");
  await row.click();
  await expect(editor).toBeFocused();
  await page.keyboard.press("ControlOrMeta+b");
  await page.keyboard.insertText("引用样本");
  await page.keyboard.press("Shift+Enter");
  await page.keyboard.insertText("续行");

  const quote = editor.locator('[data-block-type="quote"]');
  await page.keyboard.press("ControlOrMeta+Shift+Period");
  await expect(quote.locator("strong").first()).toContainText("引用样本");
  await expect(quote.locator("br")).toHaveCount(1);
  await page.keyboard.press("ControlOrMeta+Alt+1");
  await expect(quote.locator('[data-heading-level="1"]').locator("strong").first()).toContainText("引用样本");
  await expect(quote.locator("br")).toHaveCount(1);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote.locator('[data-block-type="paragraph"]')).toContainText("续行");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(quote).toHaveCount(0);
  await expect(editor).toContainText("续行");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(quote.locator('[data-heading-level="1"]')).toContainText("续行");
});

test("HTML block paste and copy retain supported layout and keep indentation out of headings", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  await expect(preview(page, 1)).toBeInViewport();
  await view.press("ControlOrMeta+a");
  await pasteClipboard(view, { html: '<p style="text-align:right;text-indent:2em"><strong>正文</strong></p><h2 style="text-align:center">标题</h2>' });
  const headingEditor = view.locator('[data-block-index="1"] .tiptap');
  const heading = headingEditor.getByRole("heading", { level: 3 });
  await expect(heading).toHaveJSProperty("tagName", "DIV");
  await expect(heading).toHaveCSS("text-align", "center");
  await headingEditor.press("Shift+ArrowLeft");
  await expect(layout(page).getByRole("button", { name: "首行缩进" })).toBeDisabled();
  await expect(preview(page, 1).locator("strong")).toHaveText("正文");
  await expect(preview(page, 1)).toHaveCSS("text-align", "right");
  await expect(preview(page, 1)).toHaveCSS("text-indent", "32px");

  await view.press("ControlOrMeta+a");
  const clipboard = await copyClipboard(view);
  const html = await page.evaluate((html) => {
    const result = document.createElement("template");
    result.innerHTML = html;
    const paragraph = result.content.querySelector("p");
    const heading = result.content.querySelector("h3");
    return [paragraph?.style.textAlign, paragraph?.style.textIndent, heading?.style.textAlign];
  }, clipboard.html);
  expect(html).toEqual(["right", "2em", "center"]);
});
