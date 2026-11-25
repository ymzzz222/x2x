import { expect, type Locator, type Page } from "@playwright/test";
import { pasteClipboard } from "./editor-clipboard";

export const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
export const paragraphSelector = 'div[data-block-type="paragraph"]';
export const orderedListSelector = 'div[data-block-type="ordered-list"]';
export const bulletListSelector = 'div[data-block-type="bullet-list"]';
export const listItemSelector = 'div[data-block-type="list-item"]';
export const quoteSelector = 'div[data-block-type="quote"]';
export const file = origin + "/editor?size=500000";

export function view(page: Page) { return page.getByRole("region", { name: "文档正文" }); }
export function block(page: Page, index: number) { return view(page).locator('[data-block-index="' + index + '"]'); }
export function handle(page: Page, index: number) { return block(page, index).getByRole("button", { name: "第 " + (index + 1) + " 块操作" }); }

export async function insertAfter(page: Page, index: number, name: string) {
  await expect(view(page).locator('[data-composing="true"]')).toHaveCount(0);
  await handle(page, index).click({ force: true });
  await page.getByRole("button", { name: "在下方添加" }).click();
  await page.getByRole("group", { name: "在下方添加", exact: true }).getByRole("button", { name, exact: true }).click();
}


export async function seed(page: Page, html: string) {
  await page.goto(file);
  await expect(block(page, 0)).toBeInViewport();
  await view(page).press("ControlOrMeta+a");
  await pasteClipboard(view(page), { html });
}

export async function seedBlank(page: Page, html: string) {
  await page.goto(origin + "/editor?new=1");
  const body = view(page);
  await body.press("ControlOrMeta+a");
  await pasteClipboard(body, { html });
  await expect(body.locator(".tiptap")).toBeFocused();
  return body;
}

export async function caret(target: Locator, offset = 0) {
  const editor = target.locator("xpath=ancestor::*[contains(concat(' ',@class,' '),' tiptap ')][1]");
  await editor.focus();
  await target.evaluate((element, offset) => {
    const text = document.createTreeWalker(element, NodeFilter.SHOW_TEXT).nextNode() ?? element;
    document.getSelection()!.collapse(text, offset);
    document.dispatchEvent(new Event("selectionchange"));
  }, offset);
}

export async function activate(page: Page, index: number) {
  const row = block(page, index);
  await row.locator("[data-block-text]").first().click({ position: { x: 1, y: 10 } });
  const editor = row.locator(".tiptap");
  await expect(editor).toBeFocused();
  return editor;
}
