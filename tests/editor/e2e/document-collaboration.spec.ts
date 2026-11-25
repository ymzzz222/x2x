import { expect } from "@playwright/test";
import { test, sharedAvailable, origin, login, create, grant, activate, firstBlock, body, saved, documentAction, documentEndpoint } from "./shared-document-fixture";
import { activate as activateBlock, block } from "./editor-page";
import { pasteClipboard } from "./editor-clipboard";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");
test.setTimeout(100_000);

test("two accounts merge changes, retry a dropped receipt under the same batch ID, and read back after reload", async ({ provision }) => {
  const owner = await provision("owner");
  const editor = await provision("editor");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "协同验收");
  const avatar = owner.page.getByRole("img", { name: owner.email.split("@")[0] + "（本人）" });
  await expect(avatar).toBeVisible();
  const [photo, share, modes, moreButton] = await Promise.all([
    avatar.boundingBox(),
    owner.page.getByRole("button", { name: "分享", exact: true }).boundingBox(),
    owner.page.getByRole("group", { name: "文档模式" }).boundingBox(),
    owner.page.getByRole("button", { name: "更多操作" }).boundingBox(),
  ]);
  expect(photo!.x).toBeGreaterThan(moreButton!.x);
  expect([photo!.y, photo!.height]).toEqual([share!.y, share!.height]);
  expect([photo!.y, photo!.height]).toEqual([modes!.y, modes!.height]);
  await expect(owner.page.getByRole("group", { name: "在线协作者" })).toHaveCount(0);
  await grant(owner.page, editor.email, "edit");
  await login(editor.page, editor.email, path);
  await expect(editor.page.getByText("云端已保存", { exact: true })).toBeVisible();

  const saves: { batch: string; seq: number }[] = [];
  let dropped = false;
  await owner.page.route("**/api/documents/*", async (route) => {
    const request = route.request();
    if (request.method() !== "POST") { await route.continue(); return; }
    const input = request.postDataJSON();
    if (input.action !== "save") { await route.continue(); return; }
    const response = await route.fetch();
    const body = await response.json();
    saves.push({ batch: input.batch, seq: body.seq });
    if (!dropped) { dropped = true; await route.abort(); }
    else await route.fulfill({ response });
  });

  await Promise.all([activate(owner.page), activate(editor.page)]);
  await Promise.all([owner.page.keyboard.insertText("甲端"), editor.page.keyboard.insertText("乙端")]);
  await expect.poll(() => saves.filter((save) => save.batch === saves[0]?.batch).length, { timeout: 20_000 }).toBeGreaterThanOrEqual(2);
  expect(saves.filter((save) => save.batch === saves[0].batch)).toEqual([saves[0], saves[0]]);
  await expect(owner.page.getByText("云端已保存", { exact: true })).toBeVisible();
  await expect(firstBlock(owner.page)).toContainText("乙端");
  await expect(firstBlock(editor.page)).toContainText("甲端");
  const merged = await firstBlock(owner.page).textContent();
  expect(merged).toContain("甲端");
  await expect(firstBlock(editor.page)).toHaveText(merged!);

  await editor.context.setOffline(true);
  await editor.page.keyboard.insertText("离线保留");
  await expect(editor.page.getByText("离线，改动保留在本机", { exact: true })).toBeVisible();
  await expect(firstBlock(owner.page)).not.toContainText("离线保留");
  await editor.context.setOffline(false);
  await expect(firstBlock(owner.page)).toContainText("离线保留", { timeout: 15_000 });
  const afterReconnect = await firstBlock(owner.page).textContent();
  await owner.page.reload();
  await editor.page.reload();
  await expect(firstBlock(owner.page)).toHaveText(afterReconnect!);
  await expect(firstBlock(editor.page)).toHaveText(afterReconnect!);
  const online = owner.page.getByRole("group", { name: "在线协作者" });
  await expect(online).toHaveAccessibleDescription("2 人在线", { timeout: 25_000 });
  await expect(online.getByRole("img", { name: editor.email.split("@")[0] })).toBeVisible();

  const title = editor.page.getByRole("textbox", { name: "文档标题" });
  await title.click();
  await expect(title).toHaveCSS("border-top-width", "0px");
  await title.fill("临时标题");
  await title.press("Escape");
  await expect(title).toHaveValue("协同验收");
  await title.fill("协同改名验收");
  const readMode = editor.page.getByRole("group", { name: "文档模式" }).getByRole("button", { name: "阅读" });
  await readMode.click();
  await expect(readMode).toHaveAttribute("aria-pressed", "true");
  await expect(owner.page.getByRole("heading", { name: "协同改名验收" })).toBeVisible({ timeout: 15_000 });
  await editor.page.reload();
  await expect(editor.page.getByRole("heading", { name: "协同改名验收" })).toBeVisible();

  await editor.page.setViewportSize({ width: 390, height: 740 });
  const more = editor.page.getByRole("button", { name: "更多操作" });
  await more.press("Enter");
  await expect(more).toHaveAttribute("aria-expanded", "true");
  await more.press("Escape");
  await expect(more).toHaveAttribute("aria-expanded", "false");
  await documentAction(editor.page, "版本历史");
  await editor.page.getByRole("dialog", { name: "版本历史" }).getByRole("button", { name: "关闭" }).click();
  await expect(more).toBeFocused();

  await documentAction(editor.page, "查找替换");
  const find = editor.page.getByRole("dialog", { name: "查找与替换" });
  await expect(find.getByRole("tab", { name: "替换", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(find.getByRole("searchbox", { name: "查找文字" })).toBeFocused();
  const panel = (await find.boundingBox())!;
  expect(panel.x).toBeGreaterThanOrEqual(0);
  expect(panel.x + panel.width).toBeLessThanOrEqual(390);
  expect(panel.y + panel.height).toBeLessThanOrEqual(740);
  await find.getByRole("button", { name: "关闭" }).click();
  await expect(find).toHaveCount(0);
  await expect(more).toBeFocused();

  const rename = Promise.withResolvers<void>();
  await editor.page.route("**/api/documents/*", async (route) => {
    const request = route.request();
    if (request.method() === "POST" && request.postDataJSON()?.action === "rename") await rename.promise;
    await route.continue();
  });
  await title.fill("返回前修改标题");
  try {
    await editor.page.getByRole("link", { name: "返回文档列表" }).click();
    await expect(title).toHaveAttribute("readonly", "");
  } finally { rename.resolve(); }
  await expect(editor.page.getByRole("link", { name: "返回前修改标题详情" })).toBeVisible();
});

test("a collaborator caret follows IME commits and arrow keys without becoming part of the document", async ({ provision }) => {
  const owner = await provision("cursor-owner");
  const editor = await provision("cursor-editor");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "光标验收");
  await grant(owner.page, editor.email, "edit");
  await login(editor.page, editor.email, path);
  await expect(editor.page.getByText("云端已保存", { exact: true })).toBeVisible();

  await activate(owner.page);
  const original = "协作者光标跟随当前插入点";
  const observedBlock = firstBlock(editor.page);
  await owner.page.keyboard.insertText(original);
  await expect(observedBlock).toHaveText(original);
  const name = owner.email.split("@")[0];
  const caret = firstBlock(editor.page).locator("[data-collaborator-cursor]");
  await expect(caret).toHaveAttribute("data-collaborator-name", name);
  await expect.poll(() => caret.evaluate((node) => getComputedStyle(node, "::after").content)).toBe(JSON.stringify(name));
  const ime = await owner.context.newCDPSession(owner.page);
  const candidate = "fanfanfufu";
  const committed = "反反复复";
  const active = owner.page.locator("[data-editor-active]");
  await ime.send("Input.imeSetComposition", { text: candidate, selectionStart: candidate.length, selectionEnd: candidate.length });
  await expect(active).toHaveAttribute("data-composing", "true");
  await ime.send("Input.insertText", { text: committed });
  await expect(active).toHaveAttribute("data-composing", "false");

  const text = original + committed;
  await expect(observedBlock).toHaveText(text);
  const lineEnd = await observedBlock.locator("[data-block-text]").last().evaluate((leaf) => {
    const range = document.createRange();
    range.selectNodeContents(leaf);
    return range.getBoundingClientRect().right;
  });
  await expect.poll(async () => Math.abs(((await caret.boundingBox())?.x ?? 0) - lineEnd)).toBeLessThan(1);
  await owner.page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await caret.boundingBox())?.x ?? lineEnd).toBeLessThan(lineEnd);
  await expect(owner.page.locator("[data-collaborator-cursor]")).toHaveCount(0);

  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(caret).toHaveCount(0);
  await expect(observedBlock).toHaveText(text);
  await ime.detach();
});

test("a revoked offline editor retains the outbox but cannot upload changes through the old session", async ({ provision }) => {
  const owner = await provision("owner");
  const editor = await provision("revoked");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "撤权验收");
  await grant(owner.page, editor.email, "edit");
  await login(editor.page, editor.email, path);
  await expect(editor.page.getByText("云端已保存", { exact: true })).toBeVisible();
  await activate(editor.page);
  await editor.context.setOffline(true);
  await editor.page.keyboard.insertText("不可提交的离线内容");
  await expect(firstBlock(editor.page)).toHaveText("不可提交的离线内容");
  await expect(editor.page.getByText("离线，改动保留在本机", { exact: true })).toBeVisible();
  await expect.poll(() => editor.page.evaluate(() => new Promise<number>((resolve, reject) => {
    const request = indexedDB.open("x2x-collaboration");
    request.onsuccess = () => {
      const db = request.result;
      const query = db.transaction("document-outbox").objectStore("document-outbox").count();
      query.onsuccess = () => { db.close(); resolve(query.result); };
      query.onerror = () => { db.close(); reject(query.error); };
    };
    request.onerror = () => reject(request.error);
  }))).toBe(1);

  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  const dialog = owner.page.getByRole("dialog", { name: "分享与权限" });
  await dialog.getByRole("button", { name: "撤回 " + editor.email + " 的访问权限" }).click();
  await expect(dialog.getByText("分享设置已保存")).toBeVisible();
  await dialog.getByRole("button", { name: "关闭" }).click();
  await editor.context.setOffline(false);
  await expect(editor.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
  await owner.page.reload();
  await expect(firstBlock(owner.page)).toBeVisible();
  await expect(firstBlock(owner.page)).not.toContainText("不可提交的离线内容");
});

test("SY-02 concurrent heading conversion and paragraph edits survive a third independent session", async ({ provision }) => {
  const owner = await provision("structure-owner");
  const editor = await provision("structure-editor");
  const reader = await provision("structure-reader");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "结构并发");
  await grant(owner.page, editor.email, "edit");
  await grant(owner.page, reader.email, "view");
  await activate(owner.page);
  await pasteClipboard(owner.page.locator(".tiptap"), { text: "第一段\n第二段" });
  await expect(block(owner.page, 1)).toHaveText("第二段");
  await expect(saved(owner.page)).toBeVisible();
  await login(editor.page, editor.email, path);
  await expect(block(editor.page, 1)).toHaveText("第二段");

  await activateBlock(owner.page, 0);
  const paragraph = await activateBlock(editor.page, 1);
  await paragraph.press("End");
  await Promise.all([
    owner.page.keyboard.press("ControlOrMeta+Alt+1"),
    editor.page.keyboard.insertText("协作者续写"),
  ]);
  for (const page of [owner.page, editor.page]) {
    await expect(firstBlock(page).locator('[data-heading-level="1"]')).toHaveText("第一段");
    await expect(block(page, 1)).toHaveText("第二段协作者续写");
    await expect(saved(page)).toBeVisible();
  }
  await login(reader.page, reader.email, path);
  await expect(firstBlock(reader.page).locator('[data-heading-level="1"]')).toHaveText("第一段");
  await expect(block(reader.page, 1)).toHaveText("第二段协作者续写");
});

test("SY-03 and SY-04 a private channel delivers updates and a disconnected client catches up over HTTP", async ({ provision }) => {
  const owner = await provision("realtime-owner");
  const peer = await provision("realtime-peer");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "实时与回退");
  await grant(owner.page, peer.email, "edit");
  const endpoint = documentEndpoint(path);
  const socketPattern = /\/realtime\/v1\/websocket/;
  const events = new Set<string>();
  peer.page.on("websocket", (socket) => {
    if (!socketPattern.test(socket.url())) return;
    socket.on("framesent", ({ payload }) => {
      const frame = payload.toString();
      if (frame.includes("x2x-doc:") && frame.includes("phx_join") && /"private"\s*:\s*true/.test(frame)) events.add("private join");
    });
    socket.on("framereceived", ({ payload }) => {
      const frame = payload.toString();
      for (const event of ["saved", "cursor"]) if (frame.includes("x2x-doc:") && frame.includes(event)) events.add(event);
    });
  });
  await login(peer.page, peer.email, path);
  const roster = (page: typeof owner.page) => page.getByRole("group", { name: "在线协作者" });
  await expect(roster(peer.page)).toHaveAccessibleDescription("2 人在线", { timeout: 25_000 });
  await expect.poll(() => events.has("private join")).toBe(true);
  await peer.page.route((url) => url.href.startsWith(endpoint), async (route) => {
    if (route.request().method() === "GET") await route.abort();
    else await route.continue();
  });
  await activate(owner.page);
  await owner.page.keyboard.insertText("实时广播正文");
  await expect(firstBlock(peer.page)).toHaveText("实时广播正文", { timeout: 12_000 });
  await expect(firstBlock(peer.page).locator("[data-collaborator-cursor]")).toHaveAttribute("data-collaborator-name", owner.email.split("@")[0]);
  await expect.poll(() => events.has("saved") && events.has("cursor")).toBe(true);

  let blockedSockets = 0;
  await peer.page.routeWebSocket(socketPattern, (socket) => {
    blockedSockets++;
    socket.close({ code: 1011, reason: "QA HTTP fallback" });
  });
  await peer.page.unrouteAll({ behavior: "wait" });
  await peer.page.reload();
  await expect(firstBlock(peer.page)).toHaveText("实时广播正文");
  await expect.poll(() => blockedSockets).toBeGreaterThan(0);
  await expect(roster(peer.page)).toHaveCount(0);
  await expect(firstBlock(peer.page).locator("[data-collaborator-cursor]")).toHaveCount(0);
  const fallback = peer.page.waitForResponse((response) => response.url().startsWith(endpoint + "?") &&
    new URL(response.url()).searchParams.get("generation") !== "0" && response.ok());
  await owner.page.keyboard.insertText("，HTTP 恢复");
  await fallback;
  await expect(firstBlock(peer.page)).toHaveText("实时广播正文，HTTP 恢复", { timeout: 15_000 });

  const restored = await peer.context.newPage();
  await restored.goto(origin + path);
  await expect(roster(restored)).toHaveAccessibleDescription("2 人在线", { timeout: 25_000 });
  await peer.page.close();
  await restored.close();
  await expect(roster(owner.page)).toHaveCount(0, { timeout: 25_000 });
});

test("DOM-08 a real above-viewport remote insert does not replace a composing editor while scrolling", async ({ provision }) => {
  const owner = await provision("scroll-owner");
  const editor = await provision("scroll-editor");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "长文组合输入与远端插入", "100000");
  await grant(owner.page, editor.email, "edit");
  await activate(owner.page);
  await owner.page.keyboard.press("Home");
  await login(editor.page, editor.email, path + "#block-180");
  const surface = body(editor.page);
  const row = surface.locator("#block-180");
  await expect(row).toBeInViewport();
  await row.locator("[data-block-text]").click({ position: { x: 3, y: 8 } });
  const active = row.locator(".tiptap");
  await expect(active).toBeFocused();
  const element = await active.elementHandle();
  const cdp = await editor.context.newCDPSession(editor.page);
  const candidate = "gundong";
  await cdp.send("Input.imeSetComposition", { text: candidate, selectionStart: candidate.length, selectionEnd: candidate.length });
  await expect(surface.locator('[data-composing="true"]')).toHaveCount(1);
  const scroll = await surface.evaluate((element) => element.scrollTop);
  await surface.evaluate((element) => { element.scrollTop += 2_400; });
  await expect.poll(() => surface.evaluate((element) => element.scrollTop)).toBeGreaterThan(scroll + 500);
  expect(await element!.evaluate((node) => node.isConnected)).toBe(true);

  await pasteClipboard(owner.page.locator(".tiptap"), { html: "<p>视口上方的远端插入</p><p></p>" });
  await expect(block(owner.page, 0)).toContainText("视口上方的远端插入");
  await expect(saved(owner.page)).toBeVisible();
  await expect(surface.locator('[data-composing="true"]')).toHaveCount(1);
  expect(await element!.evaluate((node) => node.isConnected)).toBe(true);
  await expect(active).toBeFocused();
  await cdp.detach();
  const readback = await editor.context.newPage();
  await readback.goto(origin + path + "#block-1");
  await expect(block(readback, 0)).toContainText("视口上方的远端插入");
});
