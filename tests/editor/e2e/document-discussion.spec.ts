import { expect } from "@playwright/test";
import { test, sharedAvailable, origin, login, create, grant, activate, firstBlock, saved, documentAction } from "./shared-document-fixture";
import { pasteClipboard } from "./editor-clipboard";
import { block, handle } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");
test.setTimeout(100_000);

test("CO-01 and CO-03 document comments, block anchors and selection threads have independent lifecycles", async ({ provision }) => {
  const owner = await provision("comments-owner");
  const reader = await provision("comments-reader");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "评论位置与互动");
  await grant(owner.page, reader.email, "view");
  await activate(owner.page);
  await pasteClipboard(owner.page.locator(".tiptap"), { text: "Anchor text\nNeighbor text" });
  await expect(saved(owner.page)).toBeVisible();
  await login(reader.page, reader.email, path);
  const discussion = reader.page.getByRole("dialog", { name: "评论与信息" });
  const close = discussion.getByRole("button", { name: "关闭" });
  const anchor = firstBlock(reader.page).locator("[data-block-text]");
  for (const [scope, label] of [["document", "整篇讨论"], ["block", "块讨论"], ["selection", "词组讨论"]]) {
    await anchor.dblclick({ position: { x: 12, y: 9 } });
    await documentAction(reader.page, "评论与信息");
    await discussion.getByLabel("评论位置").selectOption(scope);
    await discussion.getByLabel("评论内容").fill(label);
    await discussion.getByRole("button", { name: "发表评论" }).click();
    await expect(discussion.getByText(label, { exact: true })).toBeVisible();
    await close.click();
  }
  await documentAction(reader.page, "评论与信息");
  await expect(discussion.getByRole("button", { name: "定位原文" })).toHaveCount(2);
  const thread = discussion.locator('[aria-label="评论列表"] > section').filter({ has: reader.page.getByText("词组讨论", { exact: true }) });
  await thread.getByRole("button", { name: "回复", exact: true }).click();
  await discussion.getByLabel("回复评论").fill("这里不改正文");
  await discussion.getByRole("button", { name: "发送回复" }).click();
  await expect(thread.getByText("这里不改正文", { exact: true })).toBeVisible();
  const reaction = thread.getByRole("article").filter({ hasText: "词组讨论" }).getByRole("button", { name: /👍/ });
  await reaction.click();
  await expect(reaction).toHaveAttribute("aria-pressed", "true");
  await reaction.click();
  await expect(reaction).toHaveAttribute("aria-pressed", "false");
  await thread.getByRole("button", { name: "解决评论" }).click();
  await expect(thread.getByRole("button", { name: "恢复评论" })).toBeVisible();
  await thread.getByRole("button", { name: "恢复评论" }).click();
  await expect(thread.getByRole("button", { name: "解决评论" })).toBeVisible();

  await handle(owner.page, 0).click({ force: true });
  await owner.page.getByRole("button", { name: "下移", exact: true }).click();
  await expect(block(reader.page, 1)).toHaveText("Anchor text");
  await thread.getByRole("button", { name: "定位原文" }).click();
  await expect(discussion).toBeHidden();
  await expect(block(reader.page, 1)).toBeInViewport();
  await expect(firstBlock(owner.page)).not.toContainText("这里不改正文");
  await handle(owner.page, 1).click({ force: true });
  await owner.page.getByRole("button", { name: "删除块", exact: true }).click();
  await expect(reader.page.getByRole("region", { name: "文档正文" })).not.toContainText("Anchor text");
  await documentAction(reader.page, "评论与信息");
  await thread.getByRole("button", { name: "定位原文" }).click();
  await expect(discussion.getByText("原评论位置已失效", { exact: true })).toBeVisible();
});

test("CO-04 likes are reversible and unfollowing suppresses later save notifications", async ({ provision }) => {
  const owner = await provision("follow-owner");
  const reader = await provision("follower");
  await login(owner.page, owner.email);
  const path = await create(owner.page, "关注通知验收");
  await grant(owner.page, reader.email, "view");
  await login(reader.page, reader.email, path);
  await documentAction(reader.page, "评论与信息");
  const discussion = reader.page.getByRole("dialog", { name: "评论与信息" });
  await discussion.getByRole("button", { name: "点赞 0" }).click();
  await expect(discussion.getByRole("button", { name: "点赞 1" })).toHaveAttribute("aria-pressed", "true");
  await discussion.getByRole("button", { name: "点赞 1" }).click();
  await expect(discussion.getByRole("button", { name: "点赞 0" })).toHaveAttribute("aria-pressed", "false");
  await discussion.getByRole("button", { name: "关注文档更新" }).click();
  await expect(discussion.getByRole("button", { name: "取消关注" })).toBeVisible();
  await activate(owner.page);
  await owner.page.keyboard.insertText("关注时的更新");
  await expect(saved(owner.page)).toBeVisible();

  await reader.page.goto(origin + "/editor/shared");
  await reader.page.getByRole("button", { name: "通知", exact: true }).click();
  const notifications = reader.page.getByRole("dialog", { name: "通知" });
  await notifications.getByRole("link", { name: "未读 · 关注通知验收 · 更新了正文" }).click();
  await expect(firstBlock(reader.page)).toHaveText("关注时的更新");
  await documentAction(reader.page, "评论与信息");
  await discussion.getByRole("button", { name: "取消关注" }).click();
  await expect(discussion.getByRole("button", { name: "关注文档更新" })).toBeVisible();
  await owner.page.keyboard.insertText("和取消后的更新");
  await expect(saved(owner.page)).toBeVisible();
  await discussion.getByRole("button", { name: "关闭" }).click();
  await expect(firstBlock(reader.page)).toHaveText("关注时的更新和取消后的更新");
  await reader.page.goto(origin + "/editor/shared");
  const received = reader.page.waitForResponse((response) => response.url().endsWith("/api/documents/notifications") && response.ok());
  await reader.page.getByRole("button", { name: "通知", exact: true }).click();
  await received;
  await expect(notifications.getByRole("link", { name: "关注通知验收 · 更新了正文", exact: true })).toBeVisible();
  await expect(notifications.getByRole("link", { name: "未读 · 关注通知验收 · 更新了正文" })).toHaveCount(0);
});

test("private anchored comments stay visible to their recipient only and can be resolved without changing the document", async ({ provision }) => {
  const owner = await provision("owner");
  const recipient = await provision("recipient");
  const other = await provision("other-viewer");
  await owner.context.grantPermissions(["clipboard-read", "clipboard-write"]);
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
  await discussion.getByRole("button", { name: "复制评论链接" }).click();
  await expect(discussion.getByText("已复制评论链接", { exact: true })).toBeVisible();
  const commentLink = await owner.page.evaluate(() => navigator.clipboard.readText());
  expect(new URL(commentLink).pathname).toBe(path);
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
  await other.page.goto(commentLink);
  await expect(otherDiscussion.getByText("此评论不可访问", { exact: true })).toBeVisible();
  await expect(otherDiscussion.getByText(/私有讨论|已收到/)).toHaveCount(0);

  await documentAction(owner.page, "评论与信息");
  await discussion.getByRole("button", { name: "解决评论" }).click();
  await expect(discussion.getByRole("button", { name: "恢复评论" })).toBeVisible();
});

test("CO-05 a body reference never grants access to the referenced document", async ({ provision }) => {
  const owner = await provision("reference-owner");
  const reader = await provision("reference-reader");
  await login(owner.page, owner.email);
  const permitted = await create(owner.page, "可访问的引用目标");
  await grant(owner.page, reader.email, "view");
  await owner.page.goto(origin + "/editor/shared");
  const restricted = await create(owner.page, "无访问权的引用目标");
  await owner.page.goto(origin + "/editor/shared");
  const source = await create(owner.page, "正文引用来源");
  await grant(owner.page, reader.email, "view");
  await activate(owner.page);
  for (const path of [permitted, restricted]) {
    await documentAction(owner.page, "提及与引用");
    const panel = owner.page.getByRole("dialog", { name: "提及与引用" });
    await panel.getByLabel("引用可访问的文档").selectOption(path.split("/").at(-1)!);
    await panel.getByRole("button", { name: "插入文档引用" }).click();
    await expect(owner.page.getByText("文档引用已插入", { exact: true })).toBeVisible();
    await expect(saved(owner.page)).toBeVisible();
  }
  await login(reader.page, reader.email, source);
  for (const [path, title] of [[permitted, "可访问的引用目标"], [restricted, "无访问权的引用目标"]]) {
    const reference = firstBlock(reader.page).getByRole("link", { name: title, exact: true });
    await expect(reference).toHaveAttribute("href", origin + path);
    const opened = reader.page.waitForEvent("popup");
    await reference.click();
    const target = await opened;
    if (path === permitted) await expect(target.getByRole("heading", { name: title, exact: true })).toBeVisible();
    else await expect(target.getByText("你没有此文档的访问权限", { exact: true })).toBeVisible();
    await target.close();
  }
});

test("a saved body mention notifies an authorized member and opens its referenced block", async ({ provision }) => {
  const owner = await provision("owner");
  const viewer = await provision("mentioned-viewer");
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
});
