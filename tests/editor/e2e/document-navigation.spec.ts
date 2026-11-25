import { expect } from "@playwright/test";
import { test, sharedAvailable, origin, login, create, grant, activate, saved, body } from "./shared-document-fixture";
import { block, handle, activate as activateRow } from "./editor-page";
import { pasteClipboard } from "./editor-clipboard";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");

test("RV-03 and RV-05 outline levels and copied anchors stay distinct after text edits and above-target insertion", async ({ provision }) => {
  const [owner, viewer, outsider] = await Promise.all(["outline-owner", "outline-reader", "outline-outsider"].map(provision));
  await owner.context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await login(owner.page, owner.email);
  const path = await create(owner.page, "目录与锚点", "100000");
  await grant(owner.page, viewer.email, "view");
  await activate(owner.page);
  await owner.page.keyboard.press("Home");
  await pasteClipboard(owner.page.locator(".tiptap"), {
    html: '<h2 data-heading-level="1">甲章</h2><h4 data-heading-level="3">重复标题</h4>' +
      '<h6 data-heading-level="9">丙节</h6><h2 data-heading-level="1">重复标题</h2><p>锚点所指正文</p><p></p>',
  });
  await expect(saved(owner.page)).toBeVisible();
  const outline = owner.page.getByRole("navigation", { name: "文档目录" });
  const repeated = outline.getByRole("link", { name: "重复标题", exact: true });
  await expect(repeated).toHaveCount(2);
  const base = outline.getByRole("link", { name: "甲章", exact: true });
  const third = outline.getByRole("link", { name: "丙节", exact: true });
  await expect(base.locator("xpath=ancestor::li[1]").getByRole("link", { name: "丙节", exact: true })).toHaveCount(1);
  await expect(repeated.first().locator("xpath=ancestor::li[1]").getByRole("link", { name: "丙节", exact: true })).toHaveCount(1);
  expect(await repeated.first().getAttribute("href")).not.toBe(await repeated.last().getAttribute("href"));

  await third.click();
  const thirdHash = new URL(owner.page.url()).hash;
  await expect(body(owner.page).locator(thirdHash)).toHaveText("丙节");
  await third.hover();
  await outline.getByRole("button", { name: "复制章节链接：丙节", exact: true }).click();
  await expect.poll(() => owner.page.evaluate(() => navigator.clipboard.readText())).toBe(origin + path + thirdHash);
  const paragraph = body(owner.page).getByText("锚点所指正文", { exact: true });
  const row = paragraph.locator("xpath=ancestor::*[@data-block-index][1]");
  const paragraphHash = "#" + await row.getAttribute("id");
  await handle(owner.page, Number(await row.getAttribute("data-block-index"))).click({ force: true });
  await owner.page.getByRole("button", { name: "复制块链接", exact: true }).click();
  await expect.poll(() => owner.page.evaluate(() => navigator.clipboard.readText())).toBe(origin + path + paragraphHash);

  await repeated.first().click();
  const heading = await activateRow(owner.page, Number(await body(owner.page).locator(new URL(owner.page.url()).hash).getAttribute("data-block-index")));
  await heading.press("ControlOrMeta+a");
  await owner.page.keyboard.insertText("修改后的二级目录项");
  await expect(outline.getByRole("link", { name: "修改后的二级目录项", exact: true })).toBeVisible();
  await base.click();
  const firstHeading = await activateRow(owner.page, Number(await body(owner.page).locator(new URL(owner.page.url()).hash).getAttribute("data-block-index")));
  await firstHeading.press("Home");
  await firstHeading.press("Enter");
  await expect(block(owner.page, 0).locator("[data-block-text]")).toHaveText("");
  await expect(saved(owner.page)).toBeVisible();

  await viewer.page.setViewportSize({ width: 400, height: 800 });
  await login(viewer.page, viewer.email, path + paragraphHash);
  await expect(body(viewer.page).locator(paragraphHash)).toBeInViewport();
  await expect(body(viewer.page).locator(paragraphHash)).toHaveText("锚点所指正文");
  await viewer.page.goto(origin + path + thirdHash);
  await expect(body(viewer.page).locator(thirdHash)).toBeInViewport();
  await expect(body(viewer.page).locator(thirdHash)).toHaveText("丙节");
  await login(outsider.page, outsider.email, path + thirdHash);
  await expect(outsider.page.getByText("你没有此文档的访问权限")).toBeVisible();
  await expect(body(outsider.page)).toHaveCount(0);
});
