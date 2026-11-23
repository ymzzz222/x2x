import { expect, test, type Locator, type Page } from "@playwright/test";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const file = origin + "/editor?size=500000";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

const body = (page: Page) => page.getByRole("region", { name: "文档正文" });
const formats = (page: Page) => page.getByRole("toolbar", { name: "选区工具栏" });
const firstCharacter = { x: 1, y: 10 };

async function jump(page: Page, index: number) {
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("spinbutton", { name: "段落编号" }).fill(String(index));
  await page.getByRole("button", { name: "跳转", exact: true }).click();
  await expect(body(page).locator("#block-" + index)).toBeInViewport();
}

async function move(page: Page, key: string, count: number) {
  for (let i = 0; i < count; i++) await page.keyboard.press(key);
}

async function selectPrefix(editor: Locator, length: number) {
  await editor.evaluate((element, end) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const first = walker.nextNode()!;
    let last = first;
    while (end > last.textContent!.length) {
      end -= last.textContent!.length;
      last = walker.nextNode()!;
    }
    document.getSelection()!.setBaseAndExtent(first, 0, last, end);
    document.dispatchEvent(new Event("selectionchange"));
  }, length);
}

async function typeAtStart(page: Page, text: string) {
  await page.goto(file);
  await body(page).locator("#block-1 [data-block-text]").click({ position: firstCharacter });
  const editor = body(page).locator("#block-1 .tiptap");
  await expect(editor).toBeFocused();
  await page.keyboard.insertText(text);
  return editor;
}

test("mixed bold, toggles and colors preserve selection history and render in reading, find and presentation", async ({ page }) => {
  const editor = await typeAtStart(page, "Alpha");
  const tools = formats(page);
  const bold = tools.getByRole("button", { name: "粗体" });
  await move(page, "Shift+ArrowLeft", 3);
  await expect(bold).toHaveAttribute("aria-disabled", "false");
  await page.keyboard.press("ControlOrMeta+b");
  await expect(editor.locator("strong")).toHaveText("pha");
  await selectPrefix(editor, 5);
  await expect(bold).toHaveAttribute("aria-pressed", "false");
  await bold.click();
  await expect(editor.locator("strong")).toHaveText("Alpha");
  await expect(bold).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor.locator("strong")).toHaveText("pha");
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(editor.locator("strong")).toHaveText("Alpha");
  await page.keyboard.press("ControlOrMeta+b");
  await expect(editor.locator("strong")).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+b");
  await expect(editor.locator("strong")).toHaveText("Alpha");

  for (const [button, tag] of [["斜体", "em"], ["下划线", "u"], ["删除线", "s"]] as const) {
    await tools.getByRole("button", { name: button }).click();
    await expect(editor.locator(tag)).toHaveText("Alpha");
  }

  await tools.getByRole("button", { name: "文字与背景颜色" }).click();
  const text = page.getByRole("combobox", { name: "文字颜色" });
  const background = page.getByRole("combobox", { name: "背景颜色" });
  await background.selectOption({ label: "黄色" });
  await expect(editor.locator("[data-background-color]")).toHaveCSS("background-color", "rgb(255, 233, 40)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(editor.locator("[data-background-color]")).toHaveCSS("color", "rgb(24, 24, 27)");
  await page.emulateMedia({ colorScheme: "light" });
  await text.selectOption({ label: "蓝色" });
  await expect(editor.locator("[data-color]")).toHaveCSS("color", "rgb(36, 91, 219)");
  await background.selectOption({ label: "默认" });
  await expect(editor.locator("[data-background-color]")).toHaveCount(0);
  await expect(editor.locator("strong")).toHaveText("Alpha");
  await page.getByRole("button", { name: "完成" }).click();

  await page.getByRole("button", { name: "阅读", exact: true }).click();
  const preview = body(page).locator("#block-1 [data-block-text]");
  await expect(preview.locator("strong")).toHaveText("Alpha");
  await expect(preview.locator("[data-color]")).toHaveCSS("color", "rgb(36, 91, 219)");
  await page.getByRole("button", { name: "查找", exact: true }).click();
  await page.getByRole("searchbox", { name: "查找文字" }).fill("lph");
  const matched = preview.locator("[data-find-current]");
  await expect(matched).toHaveCount(1);
  await expect(matched.locator("strong")).toHaveText("lph");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "演示", exact: true }).click();
  const slide = page.getByRole("region", { name: "演示正文" }).locator('[data-block-id="block-1"]');
  await expect(slide.locator("strong")).toHaveText("Alpha");
  await page.getByRole("button", { name: "退出演示" }).click();
});

test("cross-window formatting reaches unmounted paragraphs and is undone as one document action", async ({ page }) => {
  await page.goto(file);
  const view = body(page);
  const modes = page.getByRole("group", { name: "文档模式" });
  await modes.getByRole("button", { name: "阅读" }).click();
  await view.locator("#block-1 [data-block-text]").click({ position: firstCharacter });
  await modes.getByRole("button", { name: "编辑" }).click();
  await jump(page, 182);
  await expect(view.locator("#block-1")).toHaveCount(0);
  await view.locator("#block-182 [data-block-text]").click({ position: firstCharacter, modifiers: ["Shift"] });
  await expect(view).toBeFocused();
  await page.keyboard.press("ControlOrMeta+b");
  await expect(view.locator("#block-181 strong")).toBeVisible();
  expect(await view.locator("[data-block-index]").count()).toBeLessThan(60);
  await jump(page, 1);
  await expect(view.locator("#block-1 strong")).toBeVisible();
  await jump(page, 85);
  await expect(view.locator("#block-85 strong")).toBeVisible();
  await view.focus();
  await page.keyboard.press("ControlOrMeta+z");
  await jump(page, 1);
  await expect(view.locator("#block-1 strong")).toHaveCount(0);
  await jump(page, 85);
  await expect(view.locator("#block-85 strong")).toHaveCount(0);
});

test("toolbar keyboard navigation, link validation, and inline code work with a native selection", async ({ page }) => {
  const editor = await typeAtStart(page, "Link");
  const toolbar = formats(page);
  await selectPrefix(editor, 4);
  await expect(toolbar.getByRole("button", { name: "链接", exact: true })).toHaveAttribute("aria-disabled", "false");
  await toolbar.getByRole("button", { name: "粗体" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(toolbar.getByRole("button", { name: "斜体" })).toBeFocused();
  await toolbar.getByRole("button", { name: "链接", exact: true }).click();
  const input = page.getByRole("textbox", { name: "链接地址" });
  const apply = page.getByRole("button", { name: "应用", exact: true });
  await expect(input).toBeFocused();
  await input.fill("invalid address");
  await expect(apply).toBeDisabled();
  await page.keyboard.press("Escape");
  await expect(input).toHaveCount(0);
  await expect(editor.locator("a")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(toolbar).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+k");
  await expect(input).toBeFocused();
  await input.fill("example.com");
  await apply.click();
  await expect(editor.locator("a")).toHaveAttribute("href", "https://example.com");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(editor.locator("a")).toHaveCount(0);
  await expect.poll(() => editor.evaluate(() => document.getSelection()?.toString())).toBe("Link");
  await toolbar.getByRole("button", { name: "行内代码" }).click();
  await expect(editor.locator("code")).toHaveText("Link");
});
