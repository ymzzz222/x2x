import { expect, test, type Page } from "@playwright/test";
import { copyClipboard } from "./editor-clipboard";
import { createDocument } from "../../../src/features/document-editor/model/document-model";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const sample = createDocument(500_000);
const pattern = /Web editor/g;
const matchCount = sample.reduce((total, block) => total + [...block.text.matchAll(pattern)].length, 0);
const firstId = sample.find((block) => block.text.includes("Web editor"))!.id;
const lastId = sample.findLast((block) => block.text.includes("Web editor"))!.id;

test.use({ channel: "chrome", viewport: { width: 1280, height: 800 } });

function body(page: Page) {
  return page.getByRole("region", { name: "文档正文" });
}

function row(page: Page, id: string) {
  return body(page).locator("#" + id);
}

function findCount(page: Page) {
  return page.getByLabel("匹配计数", { exact: true });
}

async function openFind(page: Page) {
  await body(page).focus();
  await page.keyboard.press("ControlOrMeta+f");
  const query = page.getByRole("searchbox", { name: "查找文字" });
  await expect(query).toBeFocused();
  return query;
}

async function expectFullText(page: Page, expected: string) {
  const viewport = body(page);
  await viewport.focus();
  await page.keyboard.press("ControlOrMeta+a");
  const { text: value } = await copyClipboard(viewport);
  expect(value === expected).toBe(true);
}

test("search expands folded headings and cycles through unmounted matches in a 500,000 character document", async ({ page }) => {
  await page.goto(origin + "/editor?size=500000#block-36");
  const section = "第 1 节 · 长文档阅读与编辑";
  const child = "第 2 节 · 长文档阅读与编辑";
  const fold = body(page).getByRole("button", { name: section + " 章节", exact: true });
  await expect(fold).toBeInViewport();
  await fold.click();
  await expect(row(page, "block-72")).toHaveCount(0);

  const bodyBeforeFind = await body(page).boundingBox();
  const query = await openFind(page);
  const dialog = page.getByRole("dialog", { name: "查找与替换" });
  await expect(dialog.getByRole("tab", { name: "查找", exact: true })).toHaveAttribute("aria-selected", "true");
  expect(await body(page).boundingBox()).toEqual(bodyBeforeFind);
  await query.fill(child);
  await expect(findCount(page)).toHaveText("1 / 1");
  await expect(row(page, "block-72").locator("[data-find-current]")).toBeInViewport();
  await expect(row(page, "block-72").locator("[data-find-current]")).toHaveText(child);
  const outline = page.getByRole("navigation", { name: "文档目录" });
  await expect(outline.getByRole("link", { name: child, exact: true })).toBeVisible();
  await expect(query).toBeFocused();

  await query.fill("wEb EdItOr");
  await expect(findCount(page)).toHaveText("1 / " + matchCount);
  await expect(row(page, firstId).locator("[data-find-current]")).toBeInViewport();
  await query.press("Shift+Enter");
  await expect(findCount(page)).toHaveText(matchCount + " / " + matchCount);
  await expect(row(page, lastId).locator("[data-find-current]")).toBeInViewport();
  await expect(row(page, firstId)).toHaveCount(0);
  await query.press("Enter");
  await expect(findCount(page)).toHaveText("1 / " + matchCount);
  await expect(row(page, firstId).locator("[data-find-current]")).toBeInViewport();
  await body(page).hover();
  const scrollTop = await body(page).evaluate((element) => element.scrollTop);
  await page.mouse.wheel(0, 400);
  await expect.poll(() => body(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(scrollTop);
  await expect(dialog).toBeVisible();
  await query.fill("不存在的回归测试查询");
  await expect(findCount(page)).toHaveText("0 / 0");
  await expect(body(page).locator("[data-find-match]")).toHaveCount(0);
  await query.press("Escape");
  await expect(query).toHaveCount(0);
  await expect(body(page)).toBeFocused();
  await expect(body(page).locator("[data-find-match]")).toHaveCount(0);
});

test("replaces current and all matches in separate undo steps across the 500,000 character document", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto(origin + "/editor?size=500000");
  const query = await openFind(page);
  await query.fill("Web editor");
  await expect(findCount(page)).toHaveText("1 / " + matchCount);
  const first = sample.find((block) => block.id === firstId)!;
  const last = sample.find((block) => block.id === lastId)!;
  const replacement = "〔新术语〕";
  const dialog = page.getByRole("dialog", { name: "查找与替换" });
  const findTab = dialog.getByRole("tab", { name: "查找", exact: true });
  const replaceTab = dialog.getByRole("tab", { name: "替换", exact: true });
  const replacementField = dialog.getByRole("textbox", { name: "替换为" });
  await findTab.press("ArrowRight");
  await expect(replaceTab).toBeFocused();
  await expect(query).toHaveValue("Web editor");
  await replacementField.fill(replacement);
  await replaceTab.press("ArrowLeft");
  await expect(replacementField).toHaveCount(0);
  await findTab.press("ArrowRight");
  await expect(replacementField).toHaveValue(replacement);

  await page.getByRole("button", { name: "替换当前", exact: true }).click();
  await expect(findCount(page)).toHaveText("1 / " + (matchCount - 1));
  await expect(page.getByLabel("替换结果")).toHaveText("已替换 1 处");

  await page.getByRole("button", { name: "全部替换", exact: true }).click();
  await expect(findCount(page)).toHaveText("0 / 0");
  await expect(page.getByLabel("替换结果")).toHaveText("已替换 " + (matchCount - 1) + " 处");
  await page.keyboard.press("Escape");
  await expect(body(page)).toBeFocused();
  await body(page).evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(row(page, lastId)).toBeInViewport();
  await expect(row(page, lastId)).toHaveText(last.text.replaceAll("Web editor", replacement));
  await expectFullText(page, sample.map((block) => block.text.replaceAll("Web editor", replacement)).join("\n"));

  await page.keyboard.press("ControlOrMeta+z");
  await body(page).evaluate((element) => { element.scrollTop = 0; });
  await expect(row(page, firstId)).toHaveText(first.text.replace("Web editor", replacement));
  await body(page).evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(row(page, lastId)).toHaveText(last.text);

  await page.keyboard.press("ControlOrMeta+z");
  await expect(row(page, firstId)).toBeInViewport();
  await expect(row(page, firstId)).toHaveText(first.text);
  await expectFullText(page, sample.map((block) => block.text).join("\n"));
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(row(page, firstId)).toHaveText(first.text.replace("Web editor", replacement));
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await body(page).evaluate((element) => { element.scrollTop = element.scrollHeight; });
  await expect(row(page, lastId)).toHaveText(last.text.replaceAll("Web editor", replacement));
});
