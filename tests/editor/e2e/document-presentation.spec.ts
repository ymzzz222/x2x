import { expect, test } from "@playwright/test";
import { createDocument } from "../../../src/features/document-editor/model/document-model";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const sample = createDocument(500_000);
const file = origin + "/editor?size=500000";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

test("presentation opens the entire live document while preserving the editor position on exit", async ({ page }) => {
  await page.goto(file);
  const editor = page.getByRole("region", { name: "文档正文" });
  const marker = "〔实时演示〕";
  const original = sample[0].text;
  const editable = editor.locator("#block-1");
  await editable.locator("[data-block-text]").click({ position: { x: 1, y: 10 } });
  await expect(editable.locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText(marker);
  await expect(editable).toHaveText(marker + original);
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("spinbutton", { name: "段落编号" }).fill("2520");
  await page.getByRole("button", { name: "跳转", exact: true }).click();
  await expect(editor.locator("#block-2520")).toBeInViewport();
  const originalTop = await editor.evaluate((element) => element.scrollTop);
  const start = page.getByRole("button", { name: "演示", exact: true });

  await start.click();
  const dialog = page.getByRole("dialog", { name: "文档演示" });
  const view = dialog.getByRole("region", { name: "演示正文" });
  await expect(view).toBeFocused();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
  await expect(dialog.getByRole("button", { name: "连续滚动" })).toHaveAttribute("aria-pressed", "true");
  const first = view.locator('[data-block-id="block-1"]');
  await expect(first).toBeInViewport();
  await expect(first).toHaveText(marker + original);
  await expect(view.locator("[contenteditable=true]")).toHaveCount(0);

  const last = view.locator('[data-block-id="' + sample.at(-1)!.id + '"]');
  await view.press("End");
  await expect(last).toBeInViewport();
  await expect(first).toHaveCount(0);
  expect(await view.locator("[data-block-id]").count()).toBeLessThan(60);

  await dialog.getByRole("button", { name: "分页" }).click();
  await expect(dialog.getByRole("button", { name: "下一页" })).toBeDisabled();
  const bottom = await view.evaluate((element) => element.scrollTop);
  await page.keyboard.press("ArrowLeft");
  await expect.poll(() => view.evaluate((element) => element.scrollTop)).toBeLessThan(bottom - 100);
  await dialog.getByRole("button", { name: "下一页" }).click();
  await expect(last).toBeInViewport();

  await page.evaluate(() => document.exitFullscreen());
  await expect(dialog).toBeHidden();
  await expect(start).toBeFocused();
  await expect(editor.locator("#block-2520")).toBeInViewport();
  expect(Math.abs((await editor.evaluate((element) => element.scrollTop)) - originalTop)).toBeLessThan(2);
});

test("paging includes the middle of an oversized paragraph and that position survives reload", async ({ page }) => {
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => Promise.reject(new DOMException("Fullscreen denied"));
  });
  await page.goto(file);
  const start = page.getByRole("button", { name: "演示", exact: true });
  const resume = page.getByRole("button", { name: "继续上次演示" });
  const dialog = page.getByRole("dialog", { name: "文档演示" });
  const view = dialog.getByRole("region", { name: "演示正文" });
  const pages = dialog.getByRole("button", { name: "分页" });
  const long = view.locator('[data-block-id="block-53"]');
  const next = dialog.getByRole("button", { name: "下一页" });
  const previous = dialog.getByRole("button", { name: "上一页" });
  const positionInParagraph = async () => (await view.boundingBox())!.y - (await long.boundingBox())!.y;

  await expect(resume).toHaveCount(0);
  await start.click();
  expect((await dialog.boundingBox())!.height).toBe(900);
  await pages.click();
  await expect(previous).toBeDisabled();
  await view.hover();
  await page.mouse.wheel(0, 600);
  expect(await view.evaluate((element) => element.scrollTop)).toBe(0);

  for (let attempt = 0; attempt < 16; attempt++) {
    if (await long.count() && await positionInParagraph() > 150) break;
    await next.click();
  }
  await expect(long).toBeInViewport();
  const offset = await positionInParagraph();
  expect(offset).toBeGreaterThan(150);
  await previous.click();
  await next.click();
  await expect.poll(positionInParagraph).toBeCloseTo(offset, 0);

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(start).toBeFocused();
  await expect(resume).toBeVisible();

  await page.reload();
  await resume.click();
  await expect(pages).toHaveAttribute("aria-pressed", "true");
  await expect(long).toBeInViewport();
  await expect.poll(positionInParagraph).toBeCloseTo(offset, 0);
  await dialog.getByRole("button", { name: "退出演示" }).click();
  await expect(resume).toBeFocused();

  await start.click();
  await expect(dialog.getByRole("button", { name: "连续滚动" })).toHaveAttribute("aria-pressed", "true");
  await expect(view.locator('[data-block-id="block-1"]')).toBeInViewport();
});
