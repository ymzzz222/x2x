import { expect } from "@playwright/test";
import { createHash, randomUUID } from "node:crypto";
import { test, sharedAvailable, origin, login, create, grant, documentAction, shareDialog, activate, firstBlock, saved, documentEndpoint, watchDocumentAuthorization, body } from "./shared-document-fixture";
import { copyClipboard } from "./editor-clipboard";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");
test.setTimeout(100_000);

test("password-protected links enforce viewer access, and disabling a link revokes its redeemed access", async ({ provision }) => {
  const owner = await provision("owner");
  const outsider = await provision("viewer");
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
  await outsider.page.getByRole("button", { name: "打开文档" }).click();
  expect(await input.evaluate((field: HTMLInputElement) => field.validity.valueMissing)).toBe(true);
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
});

test("x2x workspace departments inherit parent group rights and revoke them when membership is removed", async ({ provision }) => {
  const owner = await provision("owner");
  const member = await provision("group-member");
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
  await sharing.getByLabel("产品部 的访问权限").selectOption("view");
  await expect(sharing.getByText("分享设置已保存")).toBeVisible();
  await login(member.page, member.email, path);
  const mode = member.page.getByRole("group", { name: "文档模式" });
  await expect(mode.getByRole("button", { name: "编辑" })).toBeDisabled();
  await sharing.getByRole("button", { name: "关闭" }).click();
  await grant(owner.page, member.email, "edit");
  await expect(member.page.getByRole("group", { name: "文档模式" }).getByRole("button", { name: "编辑" })).toBeEnabled();

  await owner.page.goto(origin + "/editor/shared");
  await owner.page.getByRole("button", { name: "工作区管理" }).click();
  await workspace.getByRole("button", { name: "移出组" }).click();
  await expect(workspace.getByText("工作区设置已保存")).toBeVisible();
  await member.page.reload();
  await expect(mode.getByRole("button", { name: "编辑" })).toBeEnabled();
  await owner.page.goto(origin + path);
  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  await shareDialog(owner.page).getByRole("button", { name: "撤回 " + member.email + " 的访问权限" }).click();
  await expect(member.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
});

test("data protection gates viewer actions, adds a watermark, and requires approval to lower classification", async ({ provision }) => {
  const owner = await provision("owner");
  const viewer = await provision("protected-viewer");
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
  await settings.getByRole("button", { name: "拒绝", exact: true }).click();
  await expect(settings.getByText("待审批降级为 内部")).toHaveCount(0);
  await expect(settings.getByText("当前密级 受限")).toBeVisible();
  await expect(settings.getByText(/拒绝密级降低/)).toBeVisible();
  await settings.getByLabel("设置密级").selectOption("internal");
  await settings.getByRole("button", { name: "保存权限设置" }).click();
  await expect(settings.getByText("待审批降级为 内部")).toBeVisible();
  await settings.getByRole("button", { name: "批准", exact: true }).click();
  await expect(settings.getByText("当前密级 内部")).toBeVisible();
  await expect(settings.getByText(/批准密级降低/)).toBeVisible();
});

test("SH-01 and SH-05 viewers, editors and managers get distinct rights and a live downgrade blocks writes", async ({ provision }) => {
  const [owner, editor, viewer, manager, outsider] = await Promise.all(
    ["role-owner", "role-editor", "role-viewer", "role-manager", "role-outsider"].map(provision));
  await login(owner.page, owner.email);
  const path = await create(owner.page, "角色矩阵");
  await grant(owner.page, editor.email, "edit");
  await grant(owner.page, manager.email, "manage");
  await login(manager.page, manager.email, path);
  await grant(manager.page, viewer.email, "view");
  await manager.page.getByRole("button", { name: "分享", exact: true }).click();
  await expect(shareDialog(manager.page).getByRole("button", { name: "转移所有权" })).toHaveCount(0);
  await shareDialog(manager.page).getByRole("button", { name: "关闭" }).click();

  const viewerAuth = watchDocumentAuthorization(viewer.page, path);
  await Promise.all([editor, viewer, outsider].map((account) => login(account.page, account.email, path)));
  await expect(outsider.page.getByText("你没有此文档的访问权限")).toBeVisible();
  await expect(outsider.page.getByRole("region", { name: "文档正文" })).toHaveCount(0);
  await expect(editor.page.getByRole("button", { name: "分享", exact: true })).toHaveCount(0);
  await expect(viewer.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
  const denied = await viewer.page.request.post(documentEndpoint(path), {
    headers: await viewerAuth, data: { action: "member", email: outsider.email, role: "view" },
  });
  expect(denied.status()).toBe(403);
  expect(await denied.json()).toEqual({ error: "MANAGE_DENIED" });
  await activate(editor.page);
  await editor.page.keyboard.insertText("降权前已保存");
  await expect(saved(editor.page)).toBeVisible();
  await expect(firstBlock(viewer.page)).toHaveText("降权前已保存");

  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  const sharing = shareDialog(owner.page);
  await sharing.getByRole("combobox", { name: editor.email + " 的角色" }).selectOption("view");
  await expect(editor.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled({ timeout: 15_000 });
  await firstBlock(editor.page).click();
  await editor.page.keyboard.insertText("不应该写入");
  await expect(firstBlock(editor.page)).toHaveText("降权前已保存");
  await sharing.getByRole("button", { name: "撤回 " + editor.email + " 的访问权限" }).click();
  await expect(editor.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
  await editor.page.goto(origin + path);
  await expect(editor.page.getByText("你没有此文档的访问权限")).toBeVisible();
  await owner.page.reload();
  await expect(firstBlock(owner.page)).toHaveText("降权前已保存");
});

test("SH-02 replacing an edit link revokes its grants and the new link grants only view", async ({ provision }) => {
  const owner = await provision("link-owner");
  const editor = await provision("link-editor");
  const viewer = await provision("link-viewer");
  await login(owner.page, owner.email);
  await create(owner.page, "链接角色");
  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  const sharing = shareDialog(owner.page);
  const link = sharing.getByRole("textbox", { name: "分享链接" });
  await sharing.getByLabel("链接权限").selectOption("edit");
  await sharing.getByRole("button", { name: "生成分享链接" }).click();
  await expect(link).not.toHaveValue("");
  const edit = new URL(await link.inputValue());
  await login(editor.page, editor.email, edit.pathname + edit.hash);
  await activate(editor.page);
  await editor.page.keyboard.insertText("链接编辑已保存");
  await expect(saved(editor.page)).toBeVisible();
  await sharing.getByLabel("链接权限").selectOption("view");
  await sharing.getByRole("button", { name: "更新分享链接" }).click();
  await expect(link).not.toHaveValue(edit.href);
  const read = new URL(await link.inputValue());
  expect(read.pathname).toBe(edit.pathname);
  await expect(editor.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
  await editor.page.goto(edit.href);
  await expect(editor.page.getByText("此分享链接已停用")).toBeVisible();
  await login(viewer.page, viewer.email, read.pathname + read.hash);
  await expect(firstBlock(viewer.page)).toHaveText("链接编辑已保存");
  await expect(viewer.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
});

test("SH-04 and SH-07 an approved request receives reader access and only the owner can transfer ownership", async ({ provision }) => {
  const [owner, requester, next] = await Promise.all(["transfer-owner", "applicant", "successor"].map(provision));
  await login(owner.page, owner.email);
  const path = await create(owner.page, "申请与转移");
  await grant(owner.page, next.email, "view");
  const applicantAuth = watchDocumentAuthorization(requester.page, path);
  await login(requester.page, requester.email, path);
  await requester.page.getByRole("button", { name: "申请访问" }).click();
  await expect(requester.page.getByText("访问申请已提交")).toBeVisible();
  await expect(firstBlock(requester.page)).toHaveCount(0);
  const illegalTransfer = await requester.page.request.post(documentEndpoint(path), {
    headers: await applicantAuth, data: { action: "transfer", email: requester.email },
  });
  expect(illegalTransfer.status()).toBe(403);
  expect(await illegalTransfer.json()).toEqual({ error: "OWNER_REQUIRED" });

  await owner.page.getByRole("button", { name: "分享", exact: true }).click();
  const sharing = shareDialog(owner.page);
  await sharing.getByRole("button", { name: "同意阅读" }).click();
  await expect(sharing.getByRole("combobox", { name: requester.email + " 的角色" })).toHaveValue("view");
  await requester.page.reload();
  await expect(firstBlock(requester.page)).toBeVisible();
  await expect(requester.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();

  await sharing.getByLabel("新所有者的邮箱").fill(next.email);
  owner.page.once("dialog", (dialog) => dialog.accept());
  await sharing.getByRole("button", { name: "转移所有权" }).click();
  await expect(sharing.getByRole("button", { name: "转移所有权" })).toHaveCount(0, { timeout: 15_000 });
  await login(next.page, next.email, path);
  await next.page.getByRole("button", { name: "分享", exact: true }).click();
  const newSharing = shareDialog(next.page);
  await expect(newSharing.getByRole("button", { name: "转移所有权" })).toBeVisible();
  await expect(newSharing.getByRole("combobox", { name: owner.email + " 的角色" })).toHaveValue("manage");
  await newSharing.getByRole("button", { name: "撤回 " + requester.email + " 的访问权限" }).click();
  await expect(requester.page.getByText("文档访问权限已撤回 · 待同步受阻")).toBeVisible({ timeout: 15_000 });
});

test("SH-08 defaults apply only to new workspace documents and screening is owner scoped", async ({ provision }) => {
  const owner = await provision("defaults-owner");
  const member = await provision("defaults-member");
  await login(owner.page, owner.email);
  await owner.page.getByRole("button", { name: "工作区管理" }).click();
  const workspace = owner.page.getByRole("dialog", { name: "工作区管理" });
  await workspace.getByLabel("工作区名称").fill("默认权限工作区");
  await workspace.getByRole("button", { name: "新建工作区" }).click();
  const current = workspace.getByLabel("当前工作区");
  await expect(current).not.toHaveValue("");
  const workspaceId = await current.inputValue();
  await workspace.getByLabel("工作区成员邮箱").fill(member.email);
  await workspace.getByRole("button", { name: "添加工作区成员" }).click();
  await expect(workspace.getByText(member.email, { exact: true })).toBeVisible();
  await workspace.getByRole("button", { name: "关闭" }).click();
  await owner.page.getByLabel("保存到").selectOption(workspaceId);
  const older = await create(owner.page, "旧文档");
  await owner.page.goto(origin + "/editor/shared");
  await owner.page.getByRole("button", { name: "工作区管理" }).click();
  await workspace.getByLabel("新文档的组内默认权限").selectOption("view");
  await expect(workspace.getByText("工作区设置已保存")).toBeVisible();
  await workspace.getByRole("button", { name: "关闭" }).click();
  await owner.page.getByLabel("保存到").selectOption(workspaceId);
  const newer = await create(owner.page, "新文档");
  const memberAuth = watchDocumentAuthorization(member.page, newer);
  await login(member.page, member.email, newer);
  await expect(firstBlock(member.page)).toBeVisible();
  await expect(member.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
  const denied = await member.page.request.post(origin + "/api/documents/workspaces", {
    headers: await memberAuth, data: { action: "screen-rights", workspace: workspaceId, email: member.email },
  });
  expect(denied.status()).toBe(403);
  expect(await denied.json()).toEqual({ error: "WORKSPACE_DENIED" });
  await member.page.goto(origin + older);
  await expect(member.page.getByText("你没有此文档的访问权限")).toBeVisible();
  await owner.page.goto(origin + "/editor/shared");
  await owner.page.getByRole("button", { name: "工作区管理" }).click();
  await workspace.getByLabel("筛查对象邮箱").fill(member.email);
  await workspace.getByRole("button", { name: "筛查文档权限" }).click();
  const results = workspace.getByRole("list", { name: "权限筛查结果" });
  await expect(results.getByRole("listitem")).toHaveCount(2);
  await expect(results.getByText("旧文档 · 无权限", { exact: true })).toBeVisible();
  await expect(results.getByText("新文档 · 阅读者", { exact: true })).toBeVisible();
});

for (const blocked of ["view", "edit"] as const) {
  test(`SH-09 ${blocked} restrictions independently gate all five protected actions`, async ({ provision }) => {
    const [owner, reader, editor] = await Promise.all(["policy-owner", "policy-reader", "policy-editor"].map(provision));
    const denied = blocked === "view" ? reader.page : editor.page;
    const allowed = blocked === "view" ? editor.page : reader.page;
    const title = "分角色输出策略";
    const text = "受策略保护的正文";
    await login(owner.page, owner.email);
    const path = await create(owner.page, title);
    await grant(owner.page, reader.email, "view");
    await grant(owner.page, editor.email, "edit");
    await activate(owner.page);
    await owner.page.keyboard.insertText(text);
    await expect(saved(owner.page)).toBeVisible();
    await documentAction(owner.page, "文档权限");
    const policy = owner.page.getByRole("dialog", { name: "文档权限" });
    const blockedGroup = blocked === "view" ? "阅读者" : "编辑者";
    const allowedGroup = blocked === "view" ? "编辑者" : "阅读者";
    for (const label of ["评论", "复制正文", "打印", "下载正文", "创建副本"]) {
      await policy.getByRole("group", { name: blockedGroup }).getByLabel(label, { exact: true }).uncheck();
      await policy.getByRole("group", { name: allowedGroup }).getByLabel(label, { exact: true }).check();
    }
    await policy.getByRole("button", { name: "保存权限设置" }).click();
    await expect(policy.getByText("数据保护设置已保存", { exact: true })).toBeVisible();
    const deniedAuth = watchDocumentAuthorization(denied, path);
    await Promise.all([reader, editor].map((account) => login(account.page, account.email, path)));

    for (const page of [denied, allowed]) {
      await expect(firstBlock(page)).toHaveText(text);
      await body(page).press("ControlOrMeta+a");
    }
    expect((await copyClipboard(body(denied))).text).toBe("");
    expect((await copyClipboard(body(allowed))).text).toBe(text);

    for (const page of [denied, allowed]) await documentAction(page, "文档权限");
    const deniedPolicy = denied.getByRole("dialog", { name: "文档权限" });
    const allowedPolicy = allowed.getByRole("dialog", { name: "文档权限" });
    for (const label of ["打印", "下载正文", "创建副本"]) {
      await expect(deniedPolicy.getByRole("button", { name: label, exact: true })).toBeDisabled();
      await expect(allowedPolicy.getByRole("button", { name: label, exact: true })).toBeEnabled();
    }
    const download = allowed.waitForEvent("download");
    await allowedPolicy.getByRole("button", { name: "下载正文" }).click();
    expect((await download).suggestedFilename()).toBe(title + ".txt");
    await allowed.evaluate(() => { window.print = () => { document.documentElement.dataset.qaPrint = "requested"; }; });
    await allowedPolicy.getByRole("button", { name: "打印", exact: true }).click();
    await expect(allowed.locator("html")).toHaveAttribute("data-qa-print", "requested");
    for (const action of ["download", "duplicate"]) {
      const response = await denied.request.post(documentEndpoint(path), { headers: await deniedAuth, data: { action } });
      expect(response.status()).toBe(403);
      expect(await response.json()).toEqual({ error: "DOCUMENT_ACTION_DENIED" });
    }
    const deniedComment = await denied.request.post(documentEndpoint(path), {
      headers: await deniedAuth, data: { action: "discussion", kind: "comment", text: "应被拒绝" },
    });
    expect(deniedComment.status()).toBe(403);
    expect(await deniedComment.json()).toEqual({ error: "COMMENT_DENIED" });

    await deniedPolicy.getByRole("button", { name: "关闭" }).click();
    for (const page of [denied, allowed]) await documentAction(page, "评论与信息");
    await expect(denied.getByRole("button", { name: "发表评论" })).toHaveCount(0);
    await allowed.getByLabel("评论内容").fill("获得授权的评论");
    await allowed.getByRole("button", { name: "发表评论" }).click();
    await expect(allowed.getByText("获得授权的评论", { exact: true })).toBeVisible();

    await allowed.getByRole("dialog", { name: "评论与信息" }).getByRole("button", { name: "关闭" }).click();
    await documentAction(allowed, "文档权限");
    await allowedPolicy.getByRole("button", { name: "创建副本" }).click();
    await expect(allowed.getByRole("heading", { name: title + " 的副本" })).toBeVisible();
    await expect(firstBlock(allowed)).toHaveText(text);
  });
}
