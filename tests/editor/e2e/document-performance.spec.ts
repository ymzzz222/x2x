import { expect, test, type Locator, type Page } from "@playwright/test";
import { origin, view, block } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1280, height: 800 } });

const sampleSize = 500_000;
const sections = [18, 70, 30, 60, 12, 90, 40, 80, 20, 50, 6, 100];
const characters = "abcdefghijkl";

function p95(values: number[]) {
  const sorted = [...values].sort((first, second) => first - second);
  return Math.round(sorted[Math.ceil(0.95 * sorted.length) - 1] * 10) / 10;
}

async function scrollFrameGaps(viewport: Locator) {
  return viewport.evaluate(async (element) => {
    element.scrollTop = 0;
    const gaps: number[] = [];
    await new Promise<void>((resolve) => {
      let start: number | undefined;
      let previous: number | undefined;
      const advance = (now: number) => {
        start ??= now;
        if (previous !== undefined) gaps.push(now - previous);
        previous = now;
        const progress = Math.min((now - start) / 1_200, 1);
        element.scrollTop = 6_000 * progress;
        if (progress < 1) requestAnimationFrame(advance);
        else resolve();
      };
      requestAnimationFrame(advance);
    });
    return gaps;
  });
}

async function measureKeys(page: Page) {
  await block(page, 0).locator("[data-block-text]").click({ position: { x: 2, y: 8 } });
  const editor = block(page, 0).locator(".tiptap");
  await expect(editor).toBeFocused();
  const samples = [];
  for (const character of characters) {
    await editor.evaluate((element: HTMLElement) => {
      const before = element.textContent;
      delete element.dataset.qaKeyMs;
      element.addEventListener("keydown", (event) => {
        if (!event.isTrusted) return;
        const waitForChange = () => {
          if (element.textContent === before) requestAnimationFrame(waitForChange);
          else requestAnimationFrame((now) => { element.dataset.qaKeyMs = String(now - event.timeStamp); });
        };
        requestAnimationFrame(waitForChange);
      }, { once: true });
    });
    await page.keyboard.press(character);
    await expect(editor).toHaveAttribute("data-qa-key-ms", /^\d/, { timeout: 4_500 });
    samples.push(Number(await editor.getAttribute("data-qa-key-ms")));
  }
  return samples;
}

async function measureJumps(page: Page) {
  const outline = page.getByRole("navigation", { name: "文档目录" });
  const samples = [];
  for (const section of sections) {
    const link = outline.getByRole("link", { name: "第 " + section + " 节 · 长文档阅读与编辑", exact: true });
    await link.evaluate((element: HTMLAnchorElement) => {
      const targetId = element.hash.slice(1);
      delete element.dataset.qaJumpMs;
      element.addEventListener("click", (event) => {
        if (!event.isTrusted) return;
        const waitForTarget = (now: number) => {
          const viewport = document.querySelector("[data-scroll-viewport]")!.getBoundingClientRect();
          const target = document.getElementById(targetId)?.getBoundingClientRect();
          if (target && target.top < viewport.bottom && target.bottom > viewport.top) element.dataset.qaJumpMs = String(now - event.timeStamp);
          else requestAnimationFrame(waitForTarget);
        };
        requestAnimationFrame(waitForTarget);
      }, { once: true });
    });
    await link.click();
    await expect(link).toHaveAttribute("data-qa-jump-ms", /^\d/, { timeout: 4_500 });
    samples.push(Number(await link.getAttribute("data-qa-jump-ms")));
  }
  return samples;
}

test("QA-04 50万字 first paint, scrolling, typing and outline jumps meet the fixed P95 limits", async ({ page, context }, testInfo) => {
  test.skip(process.env.EDITOR_BENCH !== "1", "Set EDITOR_BENCH=1 to run the fixed performance suite.");
  test.setTimeout(150_000);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await cdp.send("Network.enable");
  await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
  const modes = [];
  for (const mode of ["full", "virtual"] as const) {
    const ready = [];
    const viewport = mode === "full" ? page.locator("[data-scroll-viewport]") : view(page);
    const rows = mode === "full" ? page.locator('[data-full-document] .tiptap > :is([data-block-type="paragraph"], [data-heading-level])')
      : viewport.locator("[data-block-index]");
    for (let attempt = 0; attempt < 5; attempt++) {
      const start = performance.now();
      await page.goto(origin + "/editor?mode=" + mode + "&size=" + sampleSize, { waitUntil: "domcontentloaded" });
      await expect(rows.first()).toBeVisible();
      if (mode === "full") {
        const count = Number(await page.locator("[data-block-count]").getAttribute("data-block-count"));
        await expect(rows).toHaveCount(count, { timeout: 25_000 });
      } else {
        await block(page, 0).locator("[data-block-text]").click({ position: { x: 2, y: 8 } });
        await expect(block(page, 0).locator(".tiptap")).toBeFocused();
      }
      ready.push(performance.now() - start);
    }
    const mountedRows = await rows.count();
    const frames = await scrollFrameGaps(viewport);
    expect(frames.length).toBeGreaterThan(1);
    modes.push({ mode, mountedRows, readyP95: p95(ready), scrollP95: p95(frames), ready, frameCount: frames.length });
  }

  const rounds = [];
  for (let round = 0; round < 2; round++) {
    await page.goto(origin + "/editor?mode=virtual&size=" + sampleSize);
    const keys = await measureKeys(page);
    const jumps = await measureJumps(page);
    rounds.push({ keys, jumps, keyP95: p95(keys), jumpP95: p95(jumps) });
  }
  await cdp.detach();
  const windowed = modes.find(({ mode }) => mode === "virtual")!;
  const actual = { ready: windowed.readyP95, scroll: windowed.scrollP95, key: Math.max(...rounds.map((round) => round.keyP95)),
    jump: Math.max(...rounds.map((round) => round.jumpP95)) };
  await testInfo.attach("50万字-P95", { body: JSON.stringify({ sampleSize, cpu: 4, actual, modes, rounds }, null, 2), contentType: "application/json" });
  expect.soft(actual.ready, "first row ready P95 in ms").toBeLessThanOrEqual(1_000);
  expect.soft(actual.scroll, "scroll frame gap P95 in ms").toBeLessThanOrEqual(25);
  expect.soft(actual.key, "visible key update P95 in ms").toBeLessThanOrEqual(80);
  expect.soft(actual.jump, "outline target visible P95 in ms").toBeLessThanOrEqual(150);
});
