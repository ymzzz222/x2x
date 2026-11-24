import { expect, test, type Page } from "@playwright/test";
import { pasteClipboard } from "./editor-clipboard";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const numberSelector = "[data-heading-number]";
test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

function body(page: Page) { return page.getByRole("region", { name: "文档正文" }); }
function numbers(page: Page) { return body(page).locator(numberSelector); }

async function seed(page: Page, html: string) {
  await page.goto(origin + "/editor?new=1");
  await expect(body(page).locator("#block-1")).toBeVisible();
  await body(page).press("ControlOrMeta+a");
  await pasteClipboard(body(page), { html });
}

for (const level of [1, 9]) {
  test(`H${level} numbering toggles outside the editable text and shares its history`, async ({ page }) => {
    await page.goto(origin + "/editor?new=1");
    const row = body(page).locator("#block-1");
    await row.click();
    await page.keyboard.press("ControlOrMeta+Alt+" + level);
    const editor = row.locator(".tiptap");
    await expect(editor).toBeFocused();
    await page.keyboard.insertText("编号标题");
    const original = await editor.elementHandle();
    await page.keyboard.press("ControlOrMeta+Shift+7");
    await expect(numbers(page)).toHaveText(["1."]);
    await expect(row.locator('[data-heading-level="' + level + '"]')).toHaveText("编号标题");
    expect(await editor.evaluate((element, previous) => element === previous, original)).toBe(true);
    await expect(editor).toBeFocused();

    await page.keyboard.press("ControlOrMeta+Shift+7");
    await expect(numbers(page)).toHaveCount(0);
    await page.keyboard.press("ControlOrMeta+z");
    await expect(numbers(page)).toHaveText(["1."]);
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(numbers(page)).toHaveCount(0);
    await expect(editor).toHaveText("编号标题");
  });

  test(`the middle ordered item becomes a numbered H${level} without changing adjacent content`, async ({ page }) => {
    await seed(page, "<ol><li><p>原先甲</p></li><li><p><strong>目标乙</strong></p></li><li><p>末尾丙</p></li></ol>");
    await body(page).getByText("目标乙", { exact: true }).click();
    await expect(body(page).locator(".tiptap")).toBeFocused();
    await page.keyboard.press("ControlOrMeta+Alt+" + level);
    const rows = body(page).locator("[data-block-index]");
    const heading = body(page).locator("#block-1 [data-heading-level]");
    await expect(numbers(page)).toHaveText(["1."]);
    await expect(rows).toHaveText(["原先甲", "1.目标乙", "末尾丙"]);
    await expect(heading).toHaveAttribute("data-heading-level", String(level));
    await expect(heading.locator("strong")).toHaveText("目标乙");
    await page.keyboard.press("ControlOrMeta+z");
    await expect(body(page).locator('[data-block-type="ordered-list"]')).toHaveCount(1);
    await expect(numbers(page)).toHaveCount(0);
    await page.keyboard.press("ControlOrMeta+Shift+z");
    await expect(numbers(page)).toHaveText(["1."]);
    await expect(heading.locator("strong")).toHaveText("目标乙");
  });
}

test("heading numbers skip unused levels and can restart, resume, and cross two digits", async ({ page }) => {
  await seed(page, "<h2>AAA</h2><h2>BBB</h2><p>正文</p><h2>DDD</h2>");
  for (const text of ["AAA", "BBB", "DDD"]) {
    await body(page).getByText(text, { exact: true }).click();
    await page.keyboard.press("ControlOrMeta+Shift+7");
  }
  await expect(numbers(page)).toHaveText(["1.", "2.", "3."]);
  await body(page).getByText("BBB", { exact: true }).click();
  await page.keyboard.press("ControlOrMeta+Alt+9");
  await expect(numbers(page)).toHaveText(["1.", "1.1", "2."]);
  await expect(page.getByRole("navigation", { name: "文档目录" }).getByRole("link", { name: "1.1 BBB" })).toBeVisible();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(numbers(page)).toHaveText(["1.", "2.", "3."]);

  const command = page.getByRole("group", { name: "标题编号", exact: true });
  const middle = body(page).locator("[data-block-index]").filter({ hasText: "BBB" });
  await middle.locator(numberSelector).click();
  await expect(command.getByRole("button", { name: "继续标题编号" })).toBeDisabled();
  await command.getByRole("button", { name: "重新开始编号" }).click();
  await expect(numbers(page)).toHaveText(["1.", "1.", "2."]);
  await middle.locator(numberSelector).click();
  await command.getByRole("button", { name: "继续标题编号" }).click();
  await expect(numbers(page)).toHaveText(["1.", "2.", "3."]);

  await numbers(page).first().press("Enter");
  await command.getByLabel("设置编号的值").fill("9");
  await command.getByRole("button", { name: "应用编号" }).click();
  await expect(numbers(page)).toHaveText(["9.", "10.", "11."]);
});

test("copies visible and folded numbering for whole-document and block copy, with plain partial text", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await seed(page, '<h2 data-heading-number-start="0">AAA</h2><h6 data-heading-level="9" data-heading-number-start="0">BBB</h6>' +
    '<ol start="4"><li><p>CCC</p><ol><li><p>DDD</p></li></ol></li></ol><h2 data-heading-number-start="0">EEE</h2>');
  const view = body(page);
  const fold = view.getByRole("button", { name: "AAA 章节" });
  await fold.click();
  await expect(view.getByText("BBB", { exact: true })).toHaveCount(0);
  await view.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+c");
  const read = () => page.evaluate(() => navigator.clipboard.readText());
  await expect.poll(read).toBe("1. AAA\n1.1 BBB\n4. CCC\na. DDD\n2. EEE");

  const first = view.locator("#block-1");
  await first.getByText("AAA", { exact: true }).click();
  await expect(first.locator(".tiptap")).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("Shift+ArrowRight");
  await page.keyboard.press("ControlOrMeta+c");
  await expect.poll(read).toBe("A");

  await first.getByText("AAA", { exact: true }).click();
  await first.hover();
  await first.getByRole("button", { name: "第 1 块操作" }).click();
  await page.getByRole("button", { name: "复制块", exact: true }).click();
  await expect.poll(read).toBe("1. AAA\n1.1 BBB\n4. CCC\na. DDD");
});
