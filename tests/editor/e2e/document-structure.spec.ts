import { expect, test } from "@playwright/test";
import { pasteClipboard } from "./editor-clipboard";
import { paragraphSelector, orderedListSelector, listItemSelector, quoteSelector, view, block, handle, insertAfter, seed, seedBlank, caret, activate } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

test("ED-16 fifteen ordered nesting depths retain their item identities and marker cycle", async ({ page }) => {
  const levels = Array.from({ length: 15 }, (_, index) => index + 1);
  const nested = levels.reduceRight((child, level) => `<ol><li><p>Level ${level}</p>${child}</li></ol>`, "");
  const surface = await seedBlank(page, nested + "<p>Tail</p>");
  await page.getByRole("button", { name: "阅读", exact: true }).click();
  const lists = surface.locator(orderedListSelector);
  await expect(lists).toHaveCount(15);
  const levelsRendered = await lists.evaluateAll((containers) => containers.map((element) => ({
    label: element.querySelector(':scope > [data-block-type="list-item"] > [data-block-type="paragraph"]')?.textContent,
    marker: getComputedStyle(element).getPropertyValue("--ym-number-style").trim(),
  })));
  expect(levelsRendered).toEqual(levels.map((level, index) => ({ label: `Level ${level}`, marker: ["decimal", "lower-alpha", "lower-roman"][index % 3] })));
  await expect(surface.getByText("Tail", { exact: true })).toBeVisible();
});

test("continuation numbers follow their ordered group after a move and restart on demand", async ({ page }) => {
  await seed(page, '<ol start="8"><li><p>East</p></li></ol><ol><li><p>West</p></li></ol><p>Tail</p>');
  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "续编", exact: true }).click();
  await expect(block(page, 1).locator(orderedListSelector)).toHaveAttribute("data-list-start", "9");

  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "上移", exact: true }).click();
  await expect(block(page, 0).locator(orderedListSelector)).toHaveText("West");
  await expect(block(page, 0).locator(orderedListSelector)).toHaveAttribute("data-list-start", "1");
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 1).locator(orderedListSelector)).toHaveAttribute("data-list-start", "9");

  await handle(page, 1).click({ force: true });
  await page.getByRole("button", { name: "重新开始", exact: true }).click();
  await expect(block(page, 1).locator(orderedListSelector)).toHaveAttribute("data-list-start", "1");
  await expect(block(page, 0).locator(orderedListSelector)).toHaveAttribute("data-list-start", "8");
});

test("supplementary paragraphs stay inside the item and Enter on an empty item exits the list", async ({ page }) => {
  await seed(page, "<ol><li><p>Parent</p></li><li><p></p></li></ol><p>Tail</p>");
  const editor = await activate(page, 0);
  await caret(editor.locator(listItemSelector).first().locator(paragraphSelector), 6);
  await page.keyboard.press("ControlOrMeta+Enter");
  const parent = editor.locator(listItemSelector).first();
  await expect(parent.locator(paragraphSelector)).toHaveCount(2);
  await page.keyboard.insertText("Details");
  await expect(parent.locator(paragraphSelector)).toHaveText(["Parent", "Details"]);
  await expect(view(page).locator("[data-editor-active]")).toHaveAttribute("data-composing", "false");
  await pasteClipboard(parent.locator(paragraphSelector).last(), { text: " inside" });
  await expect(parent.locator(paragraphSelector).last()).toHaveText("Details inside");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(parent.locator(paragraphSelector).last()).toHaveText("Details");
  await caret(editor.locator(listItemSelector).nth(1).locator(paragraphSelector));
  await page.keyboard.press("Enter");
  await expect(block(page, 0).locator(`${orderedListSelector} > ${listItemSelector}`)).toHaveCount(1);
  await expect(block(page, 1).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("Outside");
  await expect(block(page, 1).locator(`.tiptap ${paragraphSelector}`)).toHaveText("Outside");
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
  await caret(columns.nth(0).locator(paragraphSelector));
  await page.keyboard.insertText("左栏");
  await caret(columns.nth(1).locator(paragraphSelector));
  await page.keyboard.insertText("右栏");

  await insertAfter(page, 2, "高亮块");
  await expect(block(page, 3).locator("aside[data-callout]")).toBeVisible();
  await insertAfter(page, 3, "正文");
  await expect(block(page, 4).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText(">");
  await page.keyboard.press("Space");
  await expect(block(page, 4).locator(`.tiptap ${quoteSelector}`)).toBeVisible();
  await expect(block(page, 4).locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("引用文字");
  await expect(block(page, 4).locator(quoteSelector)).toHaveText("引用文字");
  await insertAfter(page, 4, "分割线");
  await expect(block(page, 5).locator("hr")).toBeVisible();

  await page.getByRole("button", { name: "阅读", exact: true }).click();
  await expect(block(page, 2).locator("[data-column]")).toHaveText(["左栏", "右栏"]);
  await expect(block(page, 4).locator(quoteSelector)).toHaveText("引用文字");
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
  await expect(block(page, 2)).toHaveAttribute("id", chapter!);
  await expect(view(page).getByText("Hidden", { exact: true })).toHaveCount(0);
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 0)).toHaveAttribute("id", chapter!);
});
