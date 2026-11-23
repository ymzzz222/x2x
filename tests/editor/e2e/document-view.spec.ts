import { expect, test, type Page } from "@playwright/test";
import { createDocument } from "../../../src/features/document-editor/model/document-model";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const sample = createDocument(500_000);

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

function body(page: Page) {
  return page.getByRole("region", { name: "文档正文" });
}

function modeButton(page: Page, name: "阅读" | "编辑") {
  return page.getByRole("group", { name: "文档模式" }).getByRole("button", { name, exact: true });
}

function pageWidth(page: Page) {
  return page.getByRole("combobox", { name: "页宽" });
}

async function copySelection(page: Page) {
  return body(page).evaluate((element) => {
    const data = new DataTransfer();
    element.dispatchEvent(new ClipboardEvent("copy", { clipboardData: data, bubbles: true, cancelable: true }));
    return data.getData("text/plain");
  });
}

test("reading mode preserves edits, blocks document mutations and keeps copying and finding available", async ({ page }) => {
  await page.goto(origin + "/editor?size=500000");
  const reader = body(page);
  const first = reader.locator("#block-1");
  const original = sample[0].text;
  const marker = "〔阅读切换〕";

  await expect(modeButton(page, "编辑")).toHaveAttribute("aria-pressed", "true");
  await first.locator("[data-block-text]").click({ position: { x: 1, y: 10 } });
  await expect(first.locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText(marker);
  await expect(first.locator(".tiptap")).toHaveText(marker + original);

  await modeButton(page, "阅读").press("Enter");
  await expect(modeButton(page, "阅读")).toHaveAttribute("aria-pressed", "true");
  await expect(reader.locator("[contenteditable=true]")).toHaveCount(0);
  await expect(first).toBeInViewport();
  await expect(first).toHaveText(marker + original);
  await expect(page.getByRole("button", { name: "模拟协作者编辑" })).toHaveCount(0);
  await first.locator("[data-block-text]").click({ position: { x: 1, y: 10 } });
  await expect(reader).toBeFocused();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.insertText("阅读时的尝试");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Delete");
  await page.keyboard.press("Enter");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(reader.locator("[contenteditable=true]")).toHaveCount(0);
  await expect(page.locator("main[data-block-count]")).toHaveAttribute("data-block-count", String(sample.length));
  expect(await copySelection(page) === marker + sample.map((block) => block.text).join("\n")).toBe(true);

  await page.keyboard.press("ControlOrMeta+f");
  const find = page.getByRole("dialog", { name: "查找", exact: true });
  const search = find.getByRole("searchbox", { name: "查找文字" });
  await expect(search).toBeFocused();
  await search.fill(marker);
  await expect(first.locator("[data-find-current]")).toHaveText(marker);
  await expect(find.getByRole("tab", { name: "替换" })).toHaveCount(0);
  await expect(find.getByRole("textbox", { name: "替换为" })).toHaveCount(0);
  await search.press("Escape");

  await modeButton(page, "编辑").click();
  await expect(modeButton(page, "编辑")).toHaveAttribute("aria-pressed", "true");
  await expect(first).toBeInViewport();
  await reader.focus();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(first).toHaveText(original);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(first).toHaveText(marker + original);
});

test("three page widths preserve a deep reading position and stay scoped to this sample", async ({ page }) => {
  await page.goto(origin + "/editor?size=500000#block-2520");
  const reader = body(page);
  const paper = reader.locator("[data-page-width]");
  const target = reader.locator("#block-2520");
  await expect(target).toBeInViewport();
  const initial = (await paper.boundingBox())!.width;
  await modeButton(page, "阅读").click();
  await expect(target).toBeInViewport();

  await pageWidth(page).selectOption({ label: "较宽" });
  await expect(paper).toHaveAttribute("data-page-width", "wide");
  const wide = (await paper.boundingBox())!.width;
  expect(wide).toBeGreaterThan(initial);
  await expect(target).toBeInViewport();

  await pageWidth(page).selectOption({ label: "全宽" });
  await expect(paper).toHaveAttribute("data-page-width", "full");
  expect((await paper.boundingBox())!.width).toBeGreaterThan(wide);
  await expect(target).toBeInViewport();
  await page.reload();
  await expect(pageWidth(page)).toHaveValue("full");
  await expect(target).toBeInViewport();

  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("link", { name: "30 万字", exact: true }).click();
  await expect(page.locator("main[data-sample-size]")).toHaveAttribute("data-sample-size", "300000");
  await expect(pageWidth(page)).toHaveValue("default");
});

test("preview tools stay behind settings and jumping returns the viewport to the document", async ({ page }) => {
  await page.goto(origin + "/editor?size=500000");
  const settings = page.getByText("预览设置", { exact: true });
  const jump = page.getByRole("spinbutton", { name: "段落编号" });

  await expect(jump).toBeHidden();
  await expect(page.getByRole("toolbar")).toHaveCount(0);
  const top = (await body(page).boundingBox())!.y;

  await settings.press("Enter");
  await expect(jump).toBeVisible();
  await expect(page.getByRole("navigation", { name: "挂载方式" })).toBeVisible();
  expect((await body(page).boundingBox())!.y).toBe(top);

  await jump.fill("2950");
  await jump.press("Enter");
  await expect(jump).toBeHidden();
  await expect(body(page).locator("#block-2950")).toBeInViewport();
});

test.describe("phone viewport", () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });

  test("landscape keeps a long paragraph readable and offscreen paragraphs unmounted", async ({ page }) => {
    await page.goto(origin + "/editor?size=500000#block-53");
    const reader = body(page);
    const long = reader.locator("#block-53");
    await expect(long).toBeInViewport();
    await modeButton(page, "阅读").tap();
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(long).toBeInViewport();
    await pageWidth(page).selectOption("full");
    await expect(long).toBeInViewport();

    const sizes = await reader.evaluate((element) => ({
      viewportFits: element.scrollWidth <= element.clientWidth + 1,
      pageFits: document.documentElement.scrollWidth <= window.innerWidth + 1,
      height: element.clientHeight,
    }));
    expect(sizes).toMatchObject({ viewportFits: true, pageFits: true });
    expect(sizes.height).toBeGreaterThan(140);
    await reader.evaluate((element) => { element.scrollTop = element.scrollHeight; });
    await expect(reader.locator("#" + sample.at(-1)!.id)).toBeInViewport();
    await expect(long).toHaveCount(0);
    expect(await reader.locator("[data-block-index]").count()).toBeLessThan(70);
  });
});
