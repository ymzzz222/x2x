import { expect } from "@playwright/test";
import { activate, body, create, login, saved, sharedAvailable, test } from "./shared-document-fixture";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");

test("ED-05 ED-06 persists all nine keyboard-created heading levels and the page title", async ({ browser, provision }) => {
  const owner = await provision("heading-owner");
  const page = owner.page;
  const title = "X2X-QA";
  await login(page, owner.email);
  const path = await create(page, title);
  await activate(page);
  const titleField = page.getByRole("textbox", { name: "文档标题" });
  const levels = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  for (const level of levels) {
    const editor = body(page).locator(`[data-block-index="${level - 1}"] .tiptap`);
    await expect(editor).toBeFocused();
    const paragraph = editor.locator('[data-block-type="paragraph"]');
    await expect(paragraph).toHaveJSProperty("textContent", "");
    for (let digit = 0; digit < level; digit++) await page.keyboard.press("Shift+Digit3");
    await expect(paragraph).toHaveJSProperty("textContent", "#".repeat(level));
    await page.keyboard.press("Space");
    const heading = editor.locator(`[data-heading-level="${level}"]`);
    await expect(heading).toHaveJSProperty("textContent", "");
    await expect.poll(() => heading.evaluate((element) => {
      const selection = document.getSelection();
      return Boolean(selection?.isCollapsed && element.contains(selection.anchorNode));
    })).toBe(true);
    await page.keyboard.press(String(level));
    await expect(heading).toHaveText(String(level));
    await expect(titleField).toHaveValue(title);
    if (level < 9) await page.keyboard.press("Enter");
  }

  await expect(saved(page)).toBeVisible();
  const fresh = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try {
    const reader = await fresh.newPage();
    await login(reader, owner.email, path);
    for (const level of levels) {
      await expect(body(reader).locator(`[data-heading-level="${level}"]`)).toHaveText(String(level));
    }
    await expect(reader.getByRole("textbox", { name: "文档标题" })).toHaveValue(title);
  } finally {
    await fresh.close();
  }
});
