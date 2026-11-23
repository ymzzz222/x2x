import { expect, test, type Locator, type Page } from "@playwright/test";
import { createDocument } from "../../../src/features/document-editor/model/document-model";

const origin = process.env.EDITOR_TEST_URL ?? "http://127.0.0.1:3100";
const sampleSize = 500_000;
const viewportSelector = "[data-scroll-viewport]";
const blockSelector = "[data-block-index]";
const fullBlockSelector = "[data-full-document] .tiptap > :is(p, [data-heading-level])";

// Run the local prototype first. Test data and peer edits are confined to each page.
test.use({ channel: "chrome", viewport: { width: 1280, height: 800 } });

function viewport(page: Page) {
  return page.locator(viewportSelector);
}

function blockAt(page: Page, index: number) {
  return viewport(page).locator(`[data-block-index="${index}"]`);
}

function textAt(page: Page, index: number) {
  return blockAt(page, index).locator("[data-block-text]");
}

function documentCount(page: Page) {
  return page.locator("[data-block-count]");
}

async function openDocument(page: Page, mode: "virtual" | "full" = "virtual") {
  await page.goto(new URL(`/editor?mode=${mode}&size=${sampleSize}`, origin).href, {
    waitUntil: "domcontentloaded",
  });
  await expect(page.locator("[data-sample-size]")).toHaveAttribute(
    "data-sample-size",
    String(sampleSize),
  );
  await expect(documentCount(page)).toHaveAttribute("data-block-count", /^[1-9]\d+$/);
  const count = Number(await documentCount(page).getAttribute("data-block-count"));
  if (mode === "full") {
    await expect(page.locator(fullBlockSelector)).toHaveCount(count, { timeout: 25_000 });
  } else {
    await expect(blockAt(page, 0)).toBeVisible();
  }
  return count;
}

async function scrollToEdge(page: Page, edge: "first" | "last", lastIndex: number) {
  await viewport(page).evaluate((element, target) => {
    element.scrollTop = target === "last" ? element.scrollHeight : 0;
  }, edge);
  const index = edge === "last" ? lastIndex : 0;
  await expect(blockAt(page, index)).toBeInViewport();
}

async function copyDocumentSelection(scroller: Locator) {
  return scroller.evaluate((element) => {
    const data = new DataTransfer();
    const event = new ClipboardEvent("copy", { clipboardData: data, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return data.getData("text/plain");
  });
}

test("unmounts offscreen nodes and preserves the paragraph anchor on resize", async ({ page }) => {
  test.setTimeout(60_000);
  const total = await openDocument(page, "full");
  const baseline = page.locator(fullBlockSelector);
  const finalText = await baseline.last().textContent();
  expect(finalText).toBeTruthy();
  const baselineCount = await baseline.count();

  expect(await openDocument(page)).toBe(total);
  const virtualRows = viewport(page).locator(blockSelector);
  const mountedAtStart = await virtualRows.count();
  expect(mountedAtStart).toBeLessThan(baselineCount / 4);

  await scrollToEdge(page, "last", total - 1);
  await expect(blockAt(page, 0)).toHaveCount(0);
  await expect(textAt(page, total - 1)).toHaveText(finalText!);
  expect(await virtualRows.count()).toBeLessThan(baselineCount / 4);

  const middleIndex = Math.floor(total / 2);
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("spinbutton", { name: "段落编号" }).fill(String(middleIndex + 1));
  await page.getByRole("button", { name: "跳转", exact: true }).click();
  await expect(blockAt(page, middleIndex)).toBeInViewport();
  await page.setViewportSize({ width: 820, height: 720 });
  await expect(blockAt(page, middleIndex)).toBeInViewport();
  await scrollToEdge(page, "first", total - 1);
  await expect(blockAt(page, total - 1)).toHaveCount(0);
  expect(await virtualRows.count()).toBeLessThan(baselineCount / 4);

  const heading = "第 70 节";
  await page.getByRole("button", { name: "查找替换", exact: true }).click();
  await page.getByRole("searchbox", { name: "查找文字" }).fill(heading);
  const result = blockAt(page, 70 * 36 - 1);
  await expect(result).toBeInViewport();
  await expect(result.locator("mark")).toHaveText(heading);
});

test("mirrors body folding into the outline while outline disclosure stays local", async ({ page }) => {
  await openDocument(page);
  const outline = page.getByRole("navigation", { name: "文档目录" });
  const title = (n: number) => `第 ${n} 节 · 长文档阅读与编辑`;
  const link = (n: number) => outline.getByRole("link", { name: title(n), exact: true });
  const outlineToggle = (n: number) => outline.getByRole("button", { name: title(n) + " 子目录", exact: true });
  const bodyToggle = (n: number) => viewport(page).getByRole("button", { name: title(n) + " 章节", exact: true });
  const target = page.locator("#block-108");

  await expect(target).toHaveCount(0);
  await link(3).press("Enter");
  await expect(page).toHaveURL(/#block-108$/);
  await expect(target.getByRole("heading", { name: title(3), level: 4 })).toBeInViewport();
  const paragraph = page.locator("#block-109");
  await expect(paragraph).toBeInViewport();
  const paragraphBefore = await paragraph.innerText();
  await paragraph.locator("[data-block-text]").click({ position: { x: 1, y: 10 } });
  const editor = paragraph.locator(".tiptap");
  await expect(editor).toBeFocused();
  await page.keyboard.insertText("〔折叠验证〕");
  await expect(editor).toHaveText("〔折叠验证〕" + paragraphBefore);

  await outlineToggle(2).press("Space");
  await expect(link(3)).toHaveCount(0);
  await expect(target).toBeInViewport();
  await outlineToggle(2).press("Space");
  await expect(link(3)).toBeVisible();

  await link(2).click();
  await bodyToggle(2).press("Enter");
  await expect(bodyToggle(2)).toHaveAttribute("aria-expanded", "false");
  await expect(target).toHaveCount(0);
  await expect(paragraph).toHaveCount(0);
  await expect(outlineToggle(2)).toHaveAttribute("aria-expanded", "false");
  await expect(link(3)).toHaveCount(0);
  await bodyToggle(2).press("Enter");
  await expect(outlineToggle(2)).toHaveAttribute("aria-expanded", "true");
  await expect(link(3)).toBeVisible();

  await bodyToggle(2).press("Enter");
  await outlineToggle(2).press("Space");
  await expect(link(3)).toBeVisible();
  await expect(bodyToggle(2)).toHaveAttribute("aria-expanded", "false");
  await expect(target).toHaveCount(0);
  await link(3).click();
  await expect(paragraph).toBeInViewport();
  await expect(paragraph).toHaveText("〔折叠验证〕" + paragraphBefore);

  await link(2).click();
  await bodyToggle(2).press("Enter");
  await link(1).click();
  await bodyToggle(1).press("Enter");
  await expect(outlineToggle(1)).toHaveAttribute("aria-expanded", "false");
  await expect(link(3)).toHaveCount(0);

  await page.evaluate(() => { window.location.hash = "#block-109"; });
  await expect(paragraph).toBeInViewport();
  await expect(paragraph).toHaveText("〔折叠验证〕" + paragraphBefore);
  await expect(outlineToggle(1)).toHaveAttribute("aria-expanded", "true");
  await expect(outlineToggle(2)).toHaveAttribute("aria-expanded", "true");

  await page.evaluate(() => window.history.replaceState(window.history.state, "", location.pathname + location.search));
  await page.reload();
  await link(1).click();
  await expect(bodyToggle(1)).toHaveAttribute("aria-expanded", "false");
  await expect(outlineToggle(1)).toHaveAttribute("aria-expanded", "false");
  await expect(link(3)).toHaveCount(0);
  await bodyToggle(1).press("Enter");
  await expect(bodyToggle(1)).toHaveAttribute("aria-expanded", "true");
  await expect(outlineToggle(2)).toHaveAttribute("aria-expanded", "false");
  await expect(link(3)).toHaveCount(0);
  await link(2).click();
  await expect(bodyToggle(2)).toHaveAttribute("aria-expanded", "false");
});

test("copies a stable chapter link and reopens it from a narrow viewport", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openDocument(page);
  const outline = page.getByRole("navigation", { name: "文档目录" });
  const title = "第 18 节 · 长文档阅读与编辑";
  const target = page.locator("#block-648");

  await expect(target).toHaveCount(0);
  await outline.getByRole("button", { name: "复制章节链接：" + title, exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("已复制章节链接");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(copied).hash).toBe("#block-648");

  await textAt(page, 0).click({ position: { x: 1, y: 10 } });
  const firstEditor = blockAt(page, 0).locator(".tiptap");
  await expect(firstEditor).toBeFocused();
  await page.getByRole("button", { name: "复制块链接", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("已复制块链接");
  expect(new URL(await page.evaluate(() => navigator.clipboard.readText())).hash).toBe("#block-1");
  await firstEditor.press("Enter");
  await expect(page.locator("#inserted-1 .tiptap")).toBeFocused();
  await outline.getByRole("link", { name: title, exact: true }).click();
  await expect(target).toBeInViewport();
  await expect(target).toHaveAttribute("data-block-index", "648");
  const deepHeading = target.getByRole("heading", { name: title, level: 10 });
  await expect(deepHeading).toHaveAttribute("data-heading-level", "9");
  await deepHeading.click({ position: { x: 1, y: 10 } });
  await expect(target.locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("〔九级〕");
  await expect(outline.getByRole("link", { name: "〔九级〕" + title, exact: true })).toBeVisible();
  await expect(target.locator('.tiptap [data-heading-level="9"]')).toContainText("〔九级〕");

  const opened = await context.newPage();
  await opened.setViewportSize({ width: 820, height: 720 });
  await opened.goto(copied);
  const narrowOutline = opened.getByRole("navigation", { name: "文档目录" });
  await expect(opened.locator("#block-648")).toBeInViewport();
  await expect(narrowOutline).toBeHidden();
  await opened.getByRole("button", { name: "文档目录", exact: true }).press("Enter");
  await expect(narrowOutline).toBeVisible();
  await narrowOutline.getByRole("link", { name: "第 1 节 · 长文档阅读与编辑", exact: true }).click();
  await expect(opened.locator("#block-36")).toBeInViewport();
  await opened.goBack({ waitUntil: "commit" });
  await expect(opened.locator("#block-648")).toBeInViewport();
});

test("copies, deletes, and undoes a selection with endpoints in different viewport windows", async ({ page }) => {
  test.setTimeout(60_000);
  const total = await openDocument(page, "full");
  const baseline = await page.locator(fullBlockSelector).allTextContents();

  await openDocument(page);
  const scroller = viewport(page);
  const firstCharacter = { x: 1, y: 10 };
  await textAt(page, 0).click({ position: firstCharacter });
  await expect(page.locator("[data-editor-active] .tiptap")).toBeFocused();
  await scrollToEdge(page, "last", total - 1);
  await expect(blockAt(page, 1)).toHaveCount(0);
  await textAt(page, total - 1).click({ position: firstCharacter, modifiers: ["Shift"] });
  await expect(scroller).toBeFocused();
  expect(await copyDocumentSelection(scroller)).toBe(`${baseline.slice(0, -1).join("\n")}\n`);

  await page.keyboard.press("Delete");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", "1");
  await expect(textAt(page, 0)).toHaveText(baseline[total - 1]);

  await scroller.focus();
  await page.keyboard.press("ControlOrMeta+z");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total));
  await expect(textAt(page, 0)).toHaveText(baseline[0]);
  await scrollToEdge(page, "last", total - 1);
  await expect(textAt(page, total - 1)).toHaveText(baseline[total - 1]);
  await expect(blockAt(page, 0)).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+a");
  expect(await copyDocumentSelection(scroller)).toBe(baseline.join("\n"));
});

test("joins the previous paragraph from the start and restores both paragraphs on undo", async ({ page }) => {
  const total = await openDocument(page);
  const previous = await textAt(page, 0).innerText();
  const current = await textAt(page, 1).innerText();
  const firstCharacter = { x: 1, y: 10 };

  await textAt(page, 0).click({ position: firstCharacter });
  await expect(blockAt(page, 0).locator(".tiptap")).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total));
  await expect(blockAt(page, 0).locator(".tiptap")).toHaveText(previous);

  await textAt(page, 1).click({ position: firstCharacter });
  await expect(blockAt(page, 1).locator(".tiptap")).toBeFocused();
  await scrollToEdge(page, "last", total - 1);
  await expect(blockAt(page, 0)).toHaveCount(0);
  await page.keyboard.press("Backspace");

  const mergedEditor = page.locator("#block-1 .tiptap");
  const joined = previous + current;
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total - 1));
  await expect(mergedEditor).toBeFocused();
  await expect(mergedEditor).toBeInViewport();
  await expect(mergedEditor).toHaveText(joined);
  await page.keyboard.insertText("〔接缝〕");
  await expect(mergedEditor).toHaveText(previous + "〔接缝〕" + current);

  await page.keyboard.press("ControlOrMeta+z");
  await expect(mergedEditor).toHaveText(joined);
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total - 1));
  await page.keyboard.press("ControlOrMeta+z");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total));
  await expect(textAt(page, 0)).toHaveText(previous);
  const restoredEditor = page.locator("#block-2 .tiptap");
  await expect(restoredEditor).toBeFocused();
  await expect(restoredEditor).toHaveText(current);
  await page.keyboard.insertText("〔段首〕");
  await expect(restoredEditor).toHaveText("〔段首〕" + current);
});

test("moves the caret across paragraphs and keeps editing history when focus moves", async ({ page }) => {
  const total = await openDocument(page);
  const first = await textAt(page, 0).innerText();
  const second = await textAt(page, 1).innerText();
  const firstEditor = page.locator("#block-1 .tiptap");
  const secondEditor = page.locator("#block-2 .tiptap");
  const firstCharacter = { x: 1, y: 10 };

  await expect(page.locator("[data-number]")).toHaveCount(0);
  await textAt(page, 1).click({ position: firstCharacter });
  await expect(secondEditor).toBeFocused();
  await page.keyboard.press("ArrowLeft");
  await expect(firstEditor).toBeFocused();
  await page.keyboard.insertText("〔第一段〕");
  await expect(firstEditor).toHaveText(first + "〔第一段〕");
  await page.keyboard.press("ArrowRight");
  await expect(secondEditor).toBeFocused();
  await page.keyboard.insertText("〔第二段〕");
  await expect(secondEditor).toHaveText("〔第二段〕" + second);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(secondEditor).toHaveText(second);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(firstEditor).toBeFocused();
  await expect(firstEditor).toHaveText(first);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(firstEditor).toHaveText(first + "〔第一段〕");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(firstEditor).toHaveText(first);

  await page.keyboard.press("ArrowDown");
  await expect(secondEditor).toBeFocused();
  await page.keyboard.press("ArrowUp");
  await expect(firstEditor).toBeFocused();

  await textAt(page, 1).click({ position: firstCharacter });
  await expect(secondEditor).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  const inserted = page.locator("#inserted-1 .tiptap");
  await expect(inserted).toBeFocused();
  await expect(textAt(page, 1)).toHaveText(second.slice(0, 1));
  await expect(inserted).toHaveText(second.slice(1));
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total + 1));
  await page.keyboard.press("ControlOrMeta+z");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total));
  await expect(secondEditor).toBeFocused();
  await expect(secondEditor).toHaveText(second);
});

test("retains a mouse-drag selection after its starting paragraph unmounts", async ({ page }) => {
  const total = await openDocument(page);
  const baseline = createDocument(sampleSize);
  const first = await textAt(page, 0).boundingBox();
  const bounds = await viewport(page).boundingBox();
  if (!first || !bounds) throw new Error("The document body is not rendered");

  await page.mouse.move(first.x + 1, first.y + 10);
  await page.mouse.down();
  await page.mouse.move(first.x + 48, first.y + 10);
  await expect(blockAt(page, 0).locator("mark")).not.toBeEmpty();
  await page.mouse.move(first.x + 48, bounds.y + bounds.height - 4);
  await expect.poll(() => viewport(page).evaluate((element) => element.scrollTop)).toBeGreaterThan(30);
  await scrollToEdge(page, "last", total - 1);
  await expect(blockAt(page, 0)).toHaveCount(0);

  const last = await textAt(page, total - 1).boundingBox();
  if (!last) throw new Error("The selection endpoint is not rendered");
  await page.mouse.move(last.x + 1, last.y + 10);
  const expected = baseline.slice(0, -1).map((block) => block.text).join("\n") + "\n";
  await expect.poll(() => copyDocumentSelection(viewport(page))).toBe(expected);
  await page.mouse.up();
  expect(await copyDocumentSelection(viewport(page))).toBe(expected);
  await page.keyboard.press("Backspace");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", "1");
  await expect(textAt(page, 0)).toHaveText(baseline.at(-1)!.text);
  await page.keyboard.press("ControlOrMeta+z");
  await expect(documentCount(page)).toHaveAttribute("data-block-count", String(total));
  await expect(textAt(page, 0)).toHaveText(baseline[0].text);
});

test("keeps the composing editor mounted and merges a peer edit exactly once", async ({ page, context }) => {
  const total = await openDocument(page);
  await page.getByText("预览设置", { exact: true }).click();
  await textAt(page, 0).click({ position: { x: 2, y: 8 } });
  const active = page.locator("[data-editor-active]");
  const editor = active.locator(".tiptap");
  await expect(editor).toBeFocused();
  const mountedEditor = await active.elementHandle();
  const before = (await editor.textContent()) ?? "";
  const candidate = "hanzihouxuan";
  const committed = "汉字候选验证";
  const peer = "〔协作者〕";
  const session = await context.newCDPSession(page);

  await session.send("Input.imeSetComposition", {
    text: candidate,
    selectionStart: candidate.length,
    selectionEnd: candidate.length,
  });
  await expect(active).toHaveAttribute("data-composing", "true");
  await page.getByRole("button", { name: "模拟协作者编辑" }).dispatchEvent("click");
  await expect(active).toHaveAttribute("data-peer-converged", "false");
  await scrollToEdge(page, "last", total - 1);
  expect(await mountedEditor?.evaluate((element) => element.isConnected)).toBe(true);
  await expect(active).toHaveAttribute("data-composing", "true");

  await session.send("Input.insertText", { text: committed });
  await expect(active).toHaveAttribute("data-composing", "false");
  await expect(active).toHaveAttribute("data-peer-converged", "true");
  const after = (await editor.textContent()) ?? "";
  expect(after.split(committed)).toHaveLength(2);
  expect(after.split(peer)).toHaveLength(2);
  expect(after.replace(committed, "").replace(peer, "")).toBe(before);

  await scrollToEdge(page, "first", total - 1);
  await textAt(page, 1).click();
  await expect(blockAt(page, 1).locator(".tiptap")).toBeFocused();
  await expect(textAt(page, 0)).toHaveText(after);
  await textAt(page, 0).click();
  await expect(blockAt(page, 0).locator(".tiptap")).toHaveText(after);
  await session.detach();
});

test("reports identical 4x-CPU scroll measurements for each rendering mode", async ({ page, context }, testInfo) => {
  test.skip(process.env.EDITOR_BENCH !== "1", "Set EDITOR_BENCH=1 to collect comparative measurements.");
  test.setTimeout(120_000);
  const session = await context.newCDPSession(page);
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  const measurements = [];

  for (const mode of ["full", "virtual"] as const) {
    let count = 0;
    const readySamples = [];
    for (let attempt = 0; attempt < 5; attempt++) {
      const start = performance.now();
      count = await openDocument(page, mode);
      readySamples.push(Math.round(performance.now() - start));
    }
    const readyP95Ms = Math.max(...readySamples);
    const mountedSelector = mode === "full" ? fullBlockSelector : `${viewportSelector} ${blockSelector}`;
    const mountedBlocks = await page.locator(mountedSelector).count();
    const bodyElements = await viewport(page).locator("*").count();
    const frames = await viewport(page).evaluate(async (element) => {
      const times: number[] = [];
      await new Promise<void>((resolve) => {
        let first: number | undefined;
        let previous: number | undefined;
        const advance = (timestamp: number) => {
          first ??= timestamp;
          if (previous !== undefined) times.push(timestamp - previous);
          previous = timestamp;
          const progress = Math.min((timestamp - first) / 1_200, 1);
          element.scrollTop = Math.min(6_000, element.scrollHeight - element.clientHeight) * progress;
          if (progress < 1) requestAnimationFrame(advance);
          else resolve();
        };
        requestAnimationFrame(advance);
      });
      return times;
    });
    expect(frames.length).toBeGreaterThan(1);
    const sorted = [...frames].sort((a, b) => a - b);
    const p95 = sorted[Math.ceil(0.95 * sorted.length) - 1];
    measurements.push({
      mode,
      sampleSize,
      count,
      mountedBlocks,
      bodyElements,
      readyP95Ms,
      readySamples,
      frameSamples: frames.length,
      scrollFrameGapP95Ms: Math.round(p95 * 10) / 10,
    });
  }

  const report = { browser: "Chrome", cpuThrottle: 4, measurements };
  console.log(JSON.stringify(report));
  await testInfo.attach("scroll-benchmark", {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });
  await session.detach();
});
