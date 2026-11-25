import { expect, type Page } from "@playwright/test";
import { test, sharedAvailable, origin, login, create, activate, firstBlock, saved, documentEndpoint } from "./shared-document-fixture";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");
test.setTimeout(60_000);

async function openFromList(page: Page, title: string) {
  await page.getByRole("link", { name: title + "详情", exact: true }).click();
  await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
}

test("SY-01 and SY-06 a save 503 preserves editing and retries the same batch before readback", async ({ provision }) => {
  const owner = await provision("save-503");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "保存重试");
  const attempts: string[] = [];
  const resume = Promise.withResolvers<void>();
  await owner.page.route(documentEndpoint(path), async (route) => {
    const request = route.request();
    if (request.method() !== "POST" || request.postDataJSON()?.action !== "save") return route.continue();
    attempts.push(request.postDataJSON().batch);
    if (attempts.length === 1) return route.fulfill({ status: 503, json: { error: "REQUEST_FAILED" } });
    await resume.promise;
    await route.continue();
  });
  try {
    await activate(owner.page);
    await owner.page.keyboard.insertText("第一次编辑");
    await expect(owner.page.getByText("暂未同步，正在重试", { exact: true })).toBeVisible();
    await owner.page.keyboard.insertText("，继续编辑");
    await expect(firstBlock(owner.page)).toHaveText("第一次编辑，继续编辑");
    await expect.poll(() => attempts.length).toBeGreaterThanOrEqual(2);
    expect(attempts[1]).toBe(attempts[0]);
  } finally {
    resume.resolve();
  }
  await expect(saved(owner.page)).toBeVisible();
  const readback = await owner.context.browser()!.newContext();
  try {
    const page = await readback.newPage();
    await login(page, owner.email, path);
    await expect(firstBlock(page)).toHaveText("第一次编辑，继续编辑");
    await expect(page.getByRole("heading", { name: "保存重试" })).toBeVisible();
  } finally { await readback.close(); }
});

test("SY-07 a saved local outbox survives closing the offline tab and uploads after re-opening", async ({ provision }) => {
  const owner = await provision("offline-close");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "离线关页恢复");
  await activate(owner.page);
  await owner.context.setOffline(true);
  await owner.page.keyboard.insertText("关闭页面后仍存在");
  await expect(owner.page.getByText("离线，改动保留在本机", { exact: true })).toBeVisible();
  await expect.poll(() => owner.page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open("x2x-collaboration");
    request.onsuccess = () => {
      const db = request.result;
      const query = db.transaction("document-outbox").objectStore("document-outbox").count();
      query.onsuccess = () => { db.close(); resolve(query.result); };
      query.onerror = () => { db.close(); reject(query.error); };
    };
    request.onerror = () => reject(request.error);
  }))).toBe(1);
  await owner.page.close();
  await owner.context.setOffline(false);
  const reopened = await owner.context.newPage();
  await reopened.goto(origin + path);
  await expect(firstBlock(reopened)).toHaveText("关闭页面后仍存在");
  await expect(saved(reopened)).toBeVisible();
  await reopened.reload();
  await expect(firstBlock(reopened)).toHaveText("关闭页面后仍存在");
});

test("SY-08 a delayed receipt is scoped to its document during a switch", async ({ provision }) => {
  const owner = await provision("late-save");
  const { page } = owner;
  await login(page, owner.email);
  const first = await create(page, "迟回执甲篇");
  await page.goto(origin + "/editor/shared");
  const second = await create(page, "迟回执乙篇");
  await page.getByRole("link", { name: "返回文档列表" }).click();
  await openFromList(page, "迟回执甲篇");

  let committedStatus: number | undefined;
  const receipt = Promise.withResolvers<void>();
  let hold = true;
  await page.route(documentEndpoint(first), async (route) => {
    const request = route.request();
    if (request.method() !== "POST" || request.postDataJSON()?.action !== "save" || !hold) return route.continue();
    hold = false;
    const response = await route.fetch();
    committedStatus = response.status();
    await receipt.promise;
    await route.fulfill({ response });
  });
  try {
    await activate(page);
    await page.keyboard.insertText("甲篇首笔");
    await expect.poll(() => committedStatus, { timeout: 12_000 }).toBe(200);
    await page.keyboard.insertText("和迟到的第二笔");
    await expect(saved(page)).toHaveCount(0);
    await page.getByRole("link", { name: "返回文档列表" }).click();
    await openFromList(page, "迟回执乙篇");
    await expect(firstBlock(page)).not.toContainText("甲篇首笔");
    await activate(page);
    await page.keyboard.insertText("乙篇独立正文");
  } finally { receipt.resolve(); }
  await expect(saved(page)).toBeVisible();
  await expect(firstBlock(page)).toHaveText("乙篇独立正文");
  await page.goto(origin + first);
  await expect(firstBlock(page)).toHaveText("甲篇首笔和迟到的第二笔");
  await expect(saved(page)).toBeVisible();
  await page.goto(origin + second);
  await expect(firstBlock(page)).toHaveText("乙篇独立正文");
});

test("SY-10 an unavailable outbox opens existing cloud content as read-only", async ({ provision }) => {
  const owner = await provision("outbox-error");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "本机存储故障");
  await activate(owner.page);
  await owner.page.keyboard.insertText("保留的云端正文");
  await expect(saved(owner.page)).toBeVisible();

  const fault = await owner.context.newPage();
  await fault.addInitScript(() => {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (name, version) => {
      if (name === "x2x-collaboration") throw new DOMException("QA denied storage", "SecurityError");
      return open(name, version);
    };
  });
  await fault.goto(origin + path);
  await expect(fault.getByText("本地存储不可用，已只读打开云端文档")).toBeVisible();
  await expect(fault.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
  await firstBlock(fault).click();
  await fault.keyboard.insertText("不应写入");
  await expect(firstBlock(fault)).toHaveText("保留的云端正文");
  await owner.page.reload();
  await expect(firstBlock(owner.page)).toHaveText("保留的云端正文");
});
