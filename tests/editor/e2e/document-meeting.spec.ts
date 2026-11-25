import { expect } from "@playwright/test";
import { test, sharedAvailable, login, create, grant, firstBlock, body, saved, documentAction } from "./shared-document-fixture";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");
test.setTimeout(100_000);

test("a meeting attendee can follow, browse freely, rejoin a deep anchor and send a live annotation", async ({ provision }) => {
  const owner = await provision("owner");
  const viewer = await provision("attendee");
  await login(owner.page, owner.email);
  await owner.page.getByLabel("初始内容").selectOption("100000");
  const path = await create(owner.page, "演示跟随验收");
  await grant(owner.page, viewer.email, "view");
  await login(viewer.page, viewer.email, path);
  for (const participant of [owner, viewer]) {
    await documentAction(participant.page, "演示协作");
  }
  await expect(viewer.page.getByRole("button", { name: "共享当前位置" })).toHaveCount(0);
  await expect(viewer.page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
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

  const presented = owner.page.locator("#block-180");
  await presented.locator("[data-block-text]").click({ position: { x: 3, y: 7 } });
  await expect(presented.locator(".tiptap")).toBeFocused();
  await owner.page.keyboard.insertText("〔会议里的正文编辑〕");
  await expect(saved(owner.page)).toBeVisible();
  await expect(viewer.page.locator("#block-180")).toContainText("〔会议里的正文编辑〕");

  await viewer.page.getByRole("button", { name: "会中标注" }).click();
  await viewer.page.getByLabel("当前位置的标注").fill("这段需要复核");
  await viewer.page.getByRole("button", { name: "发送标注" }).click();
  await owner.page.getByRole("button", { name: "会中标注" }).click();
  await expect(owner.page.getByRole("region", { name: "会中标注" }).getByText(/这段需要复核/)).toBeVisible();
  await expect(body(owner.page)).not.toContainText("这段需要复核");
  await owner.page.getByRole("button", { name: "退出演示协作" }).click();
  await expect(viewer.page.getByText(/正在共享/)).toHaveCount(0, { timeout: 15_000 });
});
