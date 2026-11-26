import { expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";
import { test, sharedAvailable, origin, login, create, grant, activate, firstBlock, body, saved, documentAction } from "./shared-document-fixture";
import { copyClipboard, pasteClipboard } from "./editor-clipboard";
import { activate as activateRow, caret, seedBlank } from "./editor-page";
import { createDocument } from "../../../src/features/document-editor/model/document-model";
import { documentPlainText } from "../../../src/features/document-editor/model/document-clipboard";
import { getDocumentOutline } from "../../../src/features/document-editor/model/document-outline";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");

test("S12 keeps a grouped callout through cloud save, read-only open and rich copy", async ({ provision }) => {
  const owner = await provision("s12-callout-owner");
  const reader = await provision("s12-callout-reader");
  const page = owner.page;
  await login(page, owner.email);
  const path = await create(page, "S12 高亮组合");
  await grant(page, reader.email, "view");
  await activate(page);
  const editor = body(page).locator(".tiptap");
  await pasteClipboard(editor, { html: '<h2 data-heading-level="1"><strong>标题</strong></h2><ol start="7"><li><p>甲</p></li><li><p>乙</p></li></ol>' });
  await expect(saved(page)).toBeVisible();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+a");
  await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click();
  await page.getByRole("button", { name: "高亮块", exact: true }).click();

  async function assertCallout(container: ReturnType<typeof body>) {
    const callout = container.locator("aside[data-callout]");
    await expect(callout).toHaveCount(1);
    await expect(callout.locator('[data-heading-level="1"] strong')).toHaveText("标题");
    await expect(callout.locator('[data-block-type="ordered-list"][data-list-start]')).toHaveCount(2);
    await expect(callout.locator('[data-list-start="1"]')).toHaveText("甲");
    await expect(callout.locator('[data-list-start="2"]')).toHaveText("乙");
  }

  await assertCallout(body(page));
  await expect(saved(page)).toBeVisible();
  await login(reader.page, reader.email, path);
  await assertCallout(body(reader.page));
  await page.reload();
  await assertCallout(body(page));
  await body(page).focus();
  await page.keyboard.press("ControlOrMeta+a");
  const copied = await copyClipboard(body(page));
  expect(copied.html).toContain("<aside data-callout");
  const scratch = await owner.context.newPage();
  await assertCallout(await seedBlank(scratch, copied.html));
});

const run = promisify(execFile);
const pdfEnds = `function run(argv) {
  ObjC.import("PDFKit");
  const document = $.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(argv[0]));
  const count = Number(document.pageCount);
  const beginning = Array.from({ length: Math.min(count, 12) }, (_, index) => ObjC.unwrap(document.pageAtIndex(index).string)).join(" ");
  return JSON.stringify([count, beginning, ObjC.unwrap(document.pageAtIndex(count - 1).string)]);
}`;

async function readPdfEnds(path: string): Promise<[number, string, string]> {
  if (process.platform === "darwin") {
    const { stdout } = await run("/usr/bin/osascript", ["-l", "JavaScript", "-e", pdfEnds, path]);
    return JSON.parse(stdout);
  }
  const { stdout } = await run("pdftotext", ["-layout", path, "-"], { maxBuffer: 12_000_000 });
  const pages = stdout.split("\f").filter((page) => page.trim());
  return [pages.length, pages.slice(0, 12).join("\n"), pages.at(-1)!];
}

test("RV-09 and CO-11 document metrics fit both roles while audit entries stay manager-only", async ({ provision }) => {
  const owner = await provision("info-owner");
  const reader = await provision("info-reader");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "信息与审计");
  await grant(owner.page, reader.email, "view");
  await activate(owner.page);
  await owner.page.keyboard.insertText("你好 alpha 😀");
  await expect(saved(owner.page)).toBeVisible();
  await reader.page.setViewportSize({ width: 400, height: 800 });
  await login(reader.page, reader.email, path);
  await expect(firstBlock(reader.page)).toHaveText("你好 alpha 😀");
  await owner.page.reload();
  await expect(firstBlock(owner.page)).toHaveText("你好 alpha 😀");

  for (const account of [owner, reader]) {
    const { page } = account;
    const menu = page.getByRole("button", { name: "更多操作" });
    await menu.press("Enter");
    const trigger = page.getByRole("button", { name: "文档信息", exact: true });
    await trigger.press("Enter");
    const info = page.getByRole("region", { name: "文档信息" });
    await expect(info).toBeVisible();
    await expect(info).toHaveText("总字数 3 · 总字符数 9");
    const bounds = (await info.boundingBox())!;
    const viewport = page.viewportSize()!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(viewport.width);
    expect(bounds.y + bounds.height).toBeLessThanOrEqual(viewport.height);
    await page.keyboard.press("Escape");
    await expect(info).toBeHidden();
    await expect(trigger).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(menu).toBeFocused();
    await documentAction(page, "评论与信息");
    const discussion = page.getByRole("dialog", { name: "评论与信息" });
    const ownerName = owner.email.split("@")[0];
    await expect(discussion.getByText(`创建者 ${ownerName} · 所有者 ${ownerName}`, { exact: false })).toBeVisible();
    await expect(discussion.getByText(/^创建于 .+ · 更新于 /)).toBeVisible();
    await discussion.getByRole("button", { name: "关闭" }).click();
    await documentAction(page, "文档权限");
  }
  const audit = owner.page.getByRole("dialog", { name: "文档权限" });
  await expect(audit.getByRole("heading", { name: "访问及审计" })).toBeVisible();
  await expect(audit.getByText("访问者 1 人")).toBeVisible();
  await expect(audit.getByText(/修改访问权限|更新分享/).first()).toBeVisible();
  await expect(reader.page.getByRole("heading", { name: "访问及审计" })).toHaveCount(0);
});

test("RV-11 the downloaded TXT and native PDF include folded and offscreen content", async ({ provision }, testInfo) => {
  test.setTimeout(150_000);
  const owner = await provision("output-long");
  await login(owner.page, owner.email);
  await create(owner.page, "长文完整输出", "500000");
  const { page } = owner;
  const sample = createDocument(500_000);
  const last = sample.at(-1)!;
  const chapterTitle = "第 1 节 · 长文档阅读与编辑";
  const chapterLink = page.getByRole("navigation", { name: "文档目录" }).getByRole("link", { name: chapterTitle, exact: true });
  const chapterId = await chapterLink.getAttribute("href");
  await chapterLink.click();
  const chapter = body(page).locator(chapterId!);
  await activateRow(page, Number(await chapter.getAttribute("data-block-index")));
  await page.keyboard.press("ControlOrMeta+Shift+7");
  await expect(chapter.locator("[data-heading-number]")).toHaveText("1.");
  await expect(saved(page)).toBeVisible();
  const fold = chapter.getByRole("button", { name: /章节$/ });
  await expect(fold).toBeInViewport();
  await fold.click();
  await expect(body(page).locator("#block-72")).toHaveCount(0);
  await expect(body(page).locator("#" + last.id)).toHaveCount(0);

  await documentAction(page, "文档权限");
  const policy = page.getByRole("dialog", { name: "文档权限" });
  const downloading = page.waitForEvent("download");
  await policy.getByRole("button", { name: "下载正文" }).click();
  const downloaded = await downloading;
  expect(downloaded.suggestedFilename()).toBe("长文完整输出.txt");
  const text = await readFile((await downloaded.path())!, "utf8");
  const expected = documentPlainText(sample, getDocumentOutline(sample).sections).replace(chapterTitle, "1. " + chapterTitle);
  expect(text === expected, "TXT preserves the heading number and every sample row and newline").toBe(true);

  // Exercise the product print action without leaving a blocking system dialog open.
  await page.evaluate(() => { window.print = () => { document.documentElement.dataset.qaPrint = "requested"; }; });
  await policy.getByRole("button", { name: "打印", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-qa-print", "requested");
  const path = testInfo.outputPath("长文正文.pdf");
  const pdf = await page.pdf({ path, format: "A4" });
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  const [pages, first, end] = await readPdfEnds(path);
  const compact = (text: string) => text.normalize("NFKC").replace(/\s/gu, "");
  expect(pages).toBeGreaterThan(100);
  expect(compact(first)).toContain("长文完整输出");
  expect(compact(first)).toContain(compact(sample[0].text.slice(0, 24)));
  expect(compact(first)).toContain("1." + compact(chapterTitle));
  expect(compact(end)).toContain(compact(last.text.slice(-24)));
});

test("RV-12 a duplicate keeps rich body content and has an independent sharing and edit history", async ({ provision }) => {
  const owner = await provision("duplicate-owner");
  await login(owner.page, owner.email);
  const original = await create(owner.page, "副本来源");
  await activate(owner.page);
  await pasteClipboard(owner.page.locator(".tiptap"), { html: '<h2 data-heading-level="1">结构标题</h2><p><strong>原文粗体</strong></p>' });
  await expect(saved(owner.page)).toBeVisible();
  await documentAction(owner.page, "评论与信息");
  await owner.page.getByLabel("评论内容").fill("来源文档的评论");
  await owner.page.getByRole("button", { name: "发表评论" }).click();
  await expect(owner.page.getByText("来源文档的评论", { exact: true })).toBeVisible();
  await owner.page.getByRole("dialog", { name: "评论与信息" }).getByRole("button", { name: "关闭" }).click();
  await documentAction(owner.page, "文档权限");
  await owner.page.getByRole("dialog", { name: "文档权限" }).getByRole("button", { name: "创建副本" }).click();
  await expect(owner.page.getByRole("heading", { name: "副本来源 的副本" })).toBeVisible();
  expect(new URL(owner.page.url()).pathname).not.toBe(original);
  await expect(body(owner.page).locator('[data-heading-level="1"]')).toHaveText("结构标题");
  await expect(body(owner.page).locator("strong")).toHaveText("原文粗体");
  await documentAction(owner.page, "评论与信息");
  const discussion = owner.page.getByRole("dialog", { name: "评论与信息" });
  await expect(discussion.getByText(/^创建者 /)).toBeVisible();
  await expect(discussion.getByText("来源文档的评论", { exact: true })).toHaveCount(0);
  await discussion.getByRole("button", { name: "关闭" }).click();
  await owner.page.getByRole("button", { name: "编辑", exact: true }).click();
  const paragraph = body(owner.page).locator("[data-block-index]").filter({ hasText: "原文粗体" });
  const editor = await activateRow(owner.page, Number(await paragraph.getAttribute("data-block-index")));
  await caret(editor.locator("strong"), "原文粗体".length);
  await owner.page.keyboard.insertText("只改副本");
  await expect(body(owner.page)).toContainText("只改副本");
  await expect(saved(owner.page)).toBeVisible();
  await owner.page.goto(origin + original);
  await expect(body(owner.page).locator("strong")).toHaveText("原文粗体");
  await expect(body(owner.page)).not.toContainText("只改副本");
});
