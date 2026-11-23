import { expect, test, type Browser, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { createHash, randomUUID } from "node:crypto";

const origin = process.env.EDITOR_TEST_URL ?? "http://localhost:3106";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const local = supabaseUrl && ["localhost", "127.0.0.1"].includes(new URL(supabaseUrl).hostname);
const password = "X2x-dev-" + randomUUID();

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!local || !secret, "Run against an isolated local Supabase stack.");
test.setTimeout(100_000);

async function provision(browser: Browser, role: string) {
  const admin = createClient(supabaseUrl!, secret!, { auth: { autoRefreshToken: false, persistSession: false } });
  const email = role + "." + randomUUID() + "@example.com";
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error || !data.user) throw new Error("Could not provision local test user: " + error?.message);
  const context = await browser.newContext();
  const page = await context.newPage();
  return { email, context, page };
}

async function login(page: Page, email: string, destination = "/editor/shared") {
  await page.goto(origin + destination);
  await page.getByRole("textbox", { name: "邮箱" }).fill(email);
  await page.getByLabel("密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
}

async function documentAction(page: Page, name: string) {
  await page.getByRole("button", { name: "更多操作" }).click();
  await page.getByRole("group", { name: "文档操作" }).getByRole("button", { name, exact: true }).click();
}

async function create(page: Page, title: string) {
  await page.getByRole("textbox", { name: "文档标题" }).fill(title);
  await page.getByRole("button", { name: "创建文档" }).click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("云端已保存", { exact: true })).toBeVisible();
  return new URL(page.url()).pathname;
}

async function grant(page: Page, email: string, role: "view" | "edit") {
  await page.getByRole("button", { name: "分享", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "分享与权限" });
  await dialog.getByRole("textbox", { name: "成员邮箱" }).fill(email);
  await dialog.getByRole("combobox", { name: "成员角色" }).selectOption(role);
  await dialog.getByRole("button", { name: "授权成员" }).click();
  await expect(dialog.getByRole("combobox", { name: email + " 的角色" })).toHaveValue(role);
  await dialog.getByRole("button", { name: "关闭" }).click();
}

function firstBlock(page: Page) {
  return page.getByRole("region", { name: "文档正文" }).locator("#block-1");
}

async function activate(page: Page) {
  await firstBlock(page).locator("[data-block-text]").click({ position: { x: 1, y: 8 } });
  await expect(firstBlock(page).locator(".tiptap")).toBeFocused();
}

test("two accounts merge changes, retry a dropped receipt under the same batch ID, and read back after reload", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const editor = await provision(browser, "editor");
  try {
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
  } finally {
    await owner.context.close();
    await editor.context.close();
  }
});

test("a collaborator caret follows IME commits and arrow keys without becoming part of the document", async ({ browser }) => {
  const owner = await provision(browser, "cursor-owner");
  const editor = await provision(browser, "cursor-editor");
  try {
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
  } finally {
    await owner.context.close();
    await editor.context.close();
  }
});

test("a revoked offline editor retains the outbox but cannot upload changes through the old session", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const editor = await provision(browser, "revoked");
  try {
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
  } finally {
    await owner.context.close();
    await editor.context.close();
  }
});

test("password-protected links enforce viewer access, and disabling a link revokes its redeemed access", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const outsider = await provision(browser, "viewer");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "分享验收");
    await owner.page.getByRole("button", { name: "分享", exact: true }).click();
    const dialog = owner.page.getByRole("dialog", { name: "分享与权限" });
    const sharePassword = createHash("sha256").update(randomUUID()).digest("hex").slice(0, 10);
    await dialog.getByLabel("访问密码（可选）").fill(sharePassword);
    await dialog.getByRole("button", { name: "生成分享链接" }).click();
    const shareLink = dialog.getByRole("textbox", { name: "分享链接" });
    await expect(shareLink).not.toHaveValue("");
    const hash = new URL(await shareLink.inputValue()).hash;

    await login(outsider.page, outsider.email, path);
    await expect(outsider.page.getByText("你没有此文档的访问权限")).toBeVisible();
    await outsider.page.goto(origin + path + hash);
    const input = outsider.page.getByLabel("分享密码");
    await input.fill("wrong");
    await outsider.page.getByRole("button", { name: "打开文档" }).click();
    await expect(outsider.page.getByText("请输入正确的分享密码")).toBeVisible();
    await input.fill(sharePassword);
    await outsider.page.getByRole("button", { name: "打开文档" }).click();
    const mode = outsider.page.getByRole("group", { name: "文档模式" });
    await expect(mode.getByRole("button", { name: "阅读" })).toBeVisible();
    await expect(mode.getByRole("button", { name: "编辑" })).toBeDisabled();
    await expect(outsider.page.getByRole("textbox", { name: "文档标题" })).toHaveCount(0);
    await expect(outsider.page.getByRole("button", { name: "分享", exact: true })).toHaveCount(0);

    await dialog.getByRole("button", { name: "停止链接分享" }).click();
    await expect(dialog.getByRole("button", { name: "生成分享链接" })).toBeVisible();
    await expect(outsider.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
    await outsider.page.goto(origin + path + hash);
    await expect(outsider.page.getByText("此分享链接已停用")).toBeVisible();
  } finally {
    await owner.context.close();
    await outsider.context.close();
  }
});

test("restoring a named version starts a new generation and keeps an older offline draft out of the restored document", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const editor = await provision(browser, "version-editor");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "版本验收");
    await grant(owner.page, editor.email, "edit");
    await activate(owner.page);
    await owner.page.keyboard.insertText("版本一");
    await expect(owner.page.getByText("云端已保存", { exact: true })).toBeVisible();
    const history = owner.page.getByRole("dialog", { name: "版本历史" });
    await documentAction(owner.page, "版本历史");
    await history.getByLabel("版本名称").fill("初稿");
    await history.getByRole("button", { name: "保存版本" }).click();
    await expect(history.getByRole("link", { name: "初稿" })).toBeVisible();
    const versionLink = await history.getByRole("link", { name: "初稿" }).getAttribute("href");
    await history.getByRole("button", { name: "关闭" }).click();

    await firstBlock(owner.page).locator(".tiptap").click();
    await owner.page.keyboard.insertText("后续");
    await expect(owner.page.getByText("云端已保存", { exact: true })).toBeVisible();
    await login(editor.page, editor.email, path);
    await expect(firstBlock(editor.page)).toContainText("后续");
    await activate(editor.page);
    await editor.context.setOffline(true);
    await editor.page.keyboard.insertText("离线草稿");
    await expect(firstBlock(editor.page)).toContainText("离线草稿");

    await documentAction(owner.page, "版本历史");
    await expect(history.getByRole("link", { name: "初稿" })).toBeVisible();
    owner.page.once("dialog", (dialog) => dialog.accept());
    await history.getByRole("button", { name: "还原", exact: true }).click();
    await expect(firstBlock(owner.page)).toHaveText("版本一", { timeout: 20_000 });
    await editor.context.setOffline(false);
    await expect(editor.page.getByText(/本机保留了旧版本修改/)).toBeVisible({ timeout: 20_000 });
    await expect(firstBlock(editor.page)).toHaveText("版本一");
    await owner.page.goto(origin + versionLink);
    await expect(owner.page.getByRole("heading", { name: "版本验收 · 初稿" })).toBeVisible();
    await expect(owner.page.getByRole("group", { name: "文档模式" }).getByRole("button", { name: "编辑" })).toBeDisabled();
  } finally {
    await owner.context.close();
    await editor.context.close();
  }
});

test("x2x workspace departments inherit parent group rights and revoke them when membership is removed", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const member = await provision(browser, "group-member");
  try {
    await login(owner.page, owner.email);
    await owner.page.getByRole("button", { name: "工作区管理" }).click();
    const workspace = owner.page.getByRole("dialog", { name: "工作区管理" });
    await workspace.getByLabel("工作区名称").fill("个人工作区");
    await workspace.getByRole("button", { name: "新建工作区" }).click();
    await workspace.getByLabel("工作区成员邮箱").fill(member.email);
    await workspace.getByRole("button", { name: "添加工作区成员" }).click();
    await expect(workspace.getByText(member.email, { exact: true })).toBeVisible();
    await workspace.getByLabel("成员组名称").fill("产品部");
    await workspace.getByLabel("组类型").selectOption("department");
    await workspace.getByRole("button", { name: "创建成员组" }).click();
    await expect(workspace.getByRole("heading", { name: "产品部 · 部门" })).toBeVisible();
    await workspace.getByLabel("成员组名称").fill("设计组");
    await workspace.getByLabel("组类型").selectOption("group");
    await workspace.getByLabel("所属上级").selectOption({ label: "产品部" });
    await workspace.getByRole("button", { name: "创建成员组" }).click();
    const group = workspace.getByRole("heading", { name: "设计组 · 成员组" }).locator("..");
    await group.getByLabel("加入 设计组").selectOption({ label: member.email });
    await group.getByRole("button", { name: "添加组成员" }).click();
    await expect(group.getByRole("listitem").getByText(member.email, { exact: true })).toBeVisible();
    await workspace.getByRole("button", { name: "关闭" }).click();

    await owner.page.getByLabel("保存到").selectOption({ label: "个人工作区" });
    const path = await create(owner.page, "工作区权限验收");
    await owner.page.getByRole("button", { name: "分享", exact: true }).click();
    const sharing = owner.page.getByRole("dialog", { name: "分享与权限" });
    await sharing.getByLabel("产品部 的访问权限").selectOption("edit");
    await expect(sharing.getByText("分享设置已保存")).toBeVisible();
    await login(member.page, member.email, path);
    await expect(member.page.getByRole("group", { name: "文档模式" }).getByRole("button", { name: "编辑" })).toBeEnabled();

    await owner.page.goto(origin + "/editor/shared");
    await owner.page.getByRole("button", { name: "工作区管理" }).click();
    await workspace.getByRole("button", { name: "移出组" }).click();
    await expect(member.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
  } finally {
    await owner.context.close();
    await member.context.close();
  }
});

test("private anchored comments stay visible to their recipient only and can be resolved without changing the document", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const recipient = await provision(browser, "recipient");
  const other = await provision(browser, "other-viewer");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "评论验收");
    await grant(owner.page, recipient.email, "view");
    await grant(owner.page, other.email, "view");
    await activate(owner.page);
    await owner.page.keyboard.insertText("可评论的正文");
    for (let index = 0; index < 3; index++) await owner.page.keyboard.press("Shift+ArrowLeft");
    await documentAction(owner.page, "评论与信息");
    const discussion = owner.page.getByRole("dialog", { name: "评论与信息" });
    await discussion.getByLabel("评论位置").selectOption("selection");
    await discussion.getByLabel("私有评论").check();
    await discussion.getByLabel("可见成员邮箱（可选）").fill(recipient.email);
    await discussion.getByLabel("评论内容").fill("私有讨论 @" + recipient.email);
    await discussion.getByRole("button", { name: "发表评论" }).click();
    await expect(discussion.getByText("私有讨论 @" + recipient.email, { exact: true })).toBeVisible();
    await discussion.getByRole("button", { name: "定位原文" }).click();
    await expect(owner.page.getByRole("region", { name: "文档正文" })).toContainText("可评论的正文");

    await login(recipient.page, recipient.email, path);
    await documentAction(recipient.page, "评论与信息");
    const recipientDiscussion = recipient.page.getByRole("dialog", { name: "评论与信息" });
    await expect(recipientDiscussion.getByText("私有讨论 @" + recipient.email, { exact: true })).toBeVisible();
    await recipientDiscussion.getByRole("button", { name: "回复", exact: true }).click();
    await recipientDiscussion.getByLabel("回复评论").fill("已收到");
    await recipientDiscussion.getByRole("button", { name: "发送回复" }).click();
    await expect(recipientDiscussion.getByText("已收到", { exact: true })).toBeVisible();

    await login(other.page, other.email, path);
    await documentAction(other.page, "评论与信息");
    const otherDiscussion = other.page.getByRole("dialog", { name: "评论与信息" });
    await expect(otherDiscussion.getByText(/所有者/)).toBeVisible();
    await expect(otherDiscussion.getByText(/私有讨论|已收到/)).toHaveCount(0);

    await documentAction(owner.page, "评论与信息");
    await discussion.getByRole("button", { name: "解决评论" }).click();
    await expect(discussion.getByRole("button", { name: "恢复评论" })).toBeVisible();
  } finally {
    await owner.context.close();
    await recipient.context.close();
    await other.context.close();
  }
});

test("a viewer proposes a replacement and an editor applies it once to the anchored content", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const viewer = await provision(browser, "reviewer");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "修订验收");
    await grant(owner.page, viewer.email, "view");
    await activate(owner.page);
    await owner.page.keyboard.insertText("Alpha");
    await expect(owner.page.getByText("云端已保存", { exact: true })).toBeVisible();
    await login(viewer.page, viewer.email, path);
    await firstBlock(viewer.page).locator("[data-block-text]").dblclick({ position: { x: 8, y: 9 } });
    await documentAction(viewer.page, "修订");
    const viewerReview = viewer.page.getByRole("dialog", { name: "修订" });
    await viewerReview.getByLabel("建议替换文字").fill("Beta");
    await viewerReview.getByRole("button", { name: "提交修订" }).click();
    await expect(viewerReview.getByText("Beta", { exact: true })).toBeVisible();
    await expect(viewerReview.getByRole("button", { name: "接受修订" })).toHaveCount(0);
    await expect(firstBlock(owner.page)).toHaveText("Alpha");
    await documentAction(owner.page, "修订");
    const ownerReview = owner.page.getByRole("dialog", { name: "修订" });
    await ownerReview.getByRole("button", { name: "接受修订" }).click();
    await expect(ownerReview.getByRole("heading", { name: /已接受/ })).toBeVisible();
    await expect(ownerReview.getByRole("button", { name: "接受修订" })).toHaveCount(0);
    await expect(firstBlock(owner.page)).toHaveText("Beta");
    await expect(firstBlock(viewer.page)).toHaveText("Beta");
  } finally {
    await owner.context.close();
    await viewer.context.close();
  }
});

test("data protection gates viewer actions, adds a watermark, and requires approval to lower classification", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const viewer = await provision(browser, "protected-viewer");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "密级验收");
    await grant(owner.page, viewer.email, "view");
    await documentAction(owner.page, "文档权限");
    const settings = owner.page.getByRole("dialog", { name: "文档权限" });
    await settings.getByLabel("设置密级").selectOption("restricted");
    await settings.getByLabel("显示访问者水印").check();
    const reader = settings.getByRole("group", { name: "阅读者" });
    await reader.getByLabel("下载正文").uncheck();
    await reader.getByLabel("创建副本").uncheck();
    await reader.getByLabel("打印").uncheck();
    await settings.getByRole("button", { name: "保存权限设置" }).click();
    await expect(settings.getByText("当前密级 受限")).toBeVisible();

    await login(viewer.page, viewer.email, path);
    await expect(viewer.page.getByText(viewer.email, { exact: true })).toBeVisible();
    await documentAction(viewer.page, "文档权限");
    const viewerSettings = viewer.page.getByRole("dialog", { name: "文档权限" });
    await expect(viewerSettings.getByRole("button", { name: "下载正文" })).toBeDisabled();
    await expect(viewerSettings.getByRole("button", { name: "创建副本" })).toBeDisabled();
    await expect(viewerSettings.getByRole("button", { name: "打印", exact: true })).toBeDisabled();

    await settings.getByLabel("设置密级").selectOption("internal");
    await settings.getByRole("button", { name: "保存权限设置" }).click();
    await expect(settings.getByText("待审批降级为 内部")).toBeVisible();
    await expect(settings.getByText("当前密级 受限")).toBeVisible();
    await settings.getByRole("button", { name: "批准", exact: true }).click();
    await expect(settings.getByText("当前密级 内部")).toBeVisible();
    await expect(settings.getByText(/批准密级降低/)).toBeVisible();
  } finally {
    await owner.context.close();
    await viewer.context.close();
  }
});

test("a meeting attendee can follow, browse freely, rejoin a deep anchor and send a live annotation", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const viewer = await provision(browser, "attendee");
  try {
    await login(owner.page, owner.email);
    await owner.page.getByLabel("初始内容").selectOption("100000");
    const path = await create(owner.page, "演示跟随验收");
    await grant(owner.page, viewer.email, "view");
    await login(viewer.page, viewer.email, path);
    for (const participant of [owner, viewer]) {
      await documentAction(participant.page, "演示协作");
    }
    await owner.page.getByRole("button", { name: "共享当前位置" }).click();
    await viewer.page.getByRole("button", { name: "跟随共享者" }).click();
    await owner.page.evaluate(() => { location.hash = "block-75"; });
    await expect(viewer.page.locator("#block-75")).toBeInViewport({ timeout: 15_000 });

    await viewer.page.getByRole("button", { name: "自由浏览" }).click();
    await viewer.page.evaluate(() => { location.hash = "block-1"; });
    await expect(firstBlock(viewer.page)).toBeInViewport();
    await owner.page.evaluate(() => { location.hash = "block-180"; });
    await expect(owner.page.locator("#block-180")).toBeInViewport();
    await expect(firstBlock(viewer.page)).toBeInViewport();
    await viewer.page.getByRole("button", { name: "跟随共享者" }).click();
    await expect(viewer.page.locator("#block-180")).toBeInViewport({ timeout: 15_000 });

    await viewer.page.getByRole("button", { name: "会中标注" }).click();
    await viewer.page.getByLabel("当前位置的标注").fill("这段需要复核");
    await viewer.page.getByRole("button", { name: "发送标注" }).click();
    await owner.page.getByRole("button", { name: "会中标注" }).click();
    await expect(owner.page.getByRole("region", { name: "会中标注" }).getByText(/这段需要复核/)).toBeVisible();
  } finally {
    await owner.context.close();
    await viewer.context.close();
  }
});

test("a saved body mention notifies an authorized member and opens its referenced block", async ({ browser }) => {
  const owner = await provision(browser, "owner");
  const viewer = await provision(browser, "mentioned-viewer");
  try {
    await login(owner.page, owner.email);
    const path = await create(owner.page, "提及验收");
    await grant(owner.page, viewer.email, "view");
    await activate(owner.page);
    await documentAction(owner.page, "提及与引用");
    const panel = owner.page.getByRole("dialog", { name: "提及与引用" });
    await panel.getByLabel("提及协作者邮箱").fill(viewer.email);
    await panel.getByRole("button", { name: "插入提及" }).click();
    await expect(owner.page.getByText("提及通知已发送", { exact: true })).toBeVisible({ timeout: 15_000 });
    await expect(firstBlock(owner.page)).toContainText("@" + viewer.email);
    await login(viewer.page, viewer.email);
    await viewer.page.getByRole("button", { name: "通知", exact: true }).click();
    const notices = viewer.page.getByRole("dialog", { name: "通知" });
    const notification = notices.getByRole("link", { name: /提及验收.*提及了你/ });
    await expect(notification).toHaveAttribute("href", path + "#block-1");
    await notification.click();
    await expect(firstBlock(viewer.page)).toContainText("@" + viewer.email);
  } finally {
    await owner.context.close();
    await viewer.context.close();
  }
});
