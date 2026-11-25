import { expect } from "@playwright/test";
import { activate, body, create, firstBlock, login, origin, saved, sharedAvailable, signIn, test } from "./shared-document-fixture";

test.use({ channel: "chrome" });
test.skip(!sharedAvailable, "Run against an isolated local preview and Supabase stack.");

test("EN-01 validates the login form, recovers from wrong credentials and signs out across a reload", async ({ provision }) => {
  const { page, email } = await provision("login");
  await page.goto(origin + "/editor");
  const dialog = page.getByRole("dialog", { name: "登录文档库" });
  const emailInput = dialog.getByLabel("邮箱");
  const password = dialog.getByLabel("密码", { exact: true });
  const submit = dialog.getByRole("button", { name: "登录", exact: true });
  await expect(emailInput).toBeFocused();
  await submit.click();
  expect(await emailInput.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await emailInput.fill(email);
  await submit.click();
  expect(await password.evaluate((input: HTMLInputElement) => input.validity.valueMissing)).toBe(true);
  await password.fill("invalid-local-credential");
  await submit.click();
  await expect(dialog.getByRole("status")).toContainText("登录失败");
  await signIn(page, email);
  await expect(page.getByText("暂无文档", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(dialog).toBeVisible();
  await page.reload();
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "新增", exact: true })).toHaveCount(0);
});

for (const failure of ["unavailable", "timeout"] as const) {
  test(`EN-02 retries the ${failure} list request and restores both saved documents`, async ({ provision }) => {
    const { page, email } = await provision("list");
    await login(page, email);
    await create(page, "加载测试 A");
    await page.goto(origin + "/editor/shared");
    await create(page, "加载测试 B");

    const listUrl = (url: URL) => url.origin === origin && url.pathname === "/api/documents";
    const started = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    if (failure === "timeout") await page.clock.install();
    await page.route(listUrl, async (route) => {
      started.resolve();
      await release.promise;
      if (failure === "unavailable") await route.fulfill({ status: 503, json: { error: "DATABASE_UNAVAILABLE" } });
      else await route.abort().catch(() => {});
    }, { times: 1 });
    try {
      await page.goto(origin + "/editor");
      await started.promise;
      await expect(page.getByText("正在读取文档", { exact: true })).toBeVisible();
      await expect(page.getByText("暂无文档", { exact: true })).toHaveCount(0);
      if (failure === "timeout") await page.clock.fastForward(16_000);
      else release.resolve();
      const retry = page.getByRole("button", { name: "重试读取", exact: true });
      await expect(retry).toBeVisible();
      if (failure === "timeout") release.resolve();
      await retry.click();
      await expect(page.getByRole("link", { name: "加载测试 A详情" })).toHaveCount(1);
      await expect(page.getByRole("link", { name: "加载测试 B详情" })).toHaveCount(1);
    } finally {
      release.resolve();
    }
  });
}

test("DOM-01 DOM-02 withholds the first response and mounts the saved body without exposing an editable shell", async ({ provision }) => {
  const { page, email } = await provision("loading");
  await login(page, email);
  const path = await create(page, "加载中的正文");
  await activate(page);
  await page.keyboard.type("preserved");
  await expect(saved(page)).toBeVisible();

  const requested = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  const api = path.replace("/editor/shared/", "/api/documents/");
  await page.route((url) => url.pathname === api && url.searchParams.get("after") === "-1", async (route) => {
    requested.resolve();
    await release.promise;
    await route.continue();
  }, { times: 1 });
  try {
    await page.reload();
    await requested.promise;
    await expect(page.getByRole("status").filter({ hasText: "正在读取文档" })).toBeVisible();
    await expect(body(page)).toHaveCount(0);
    release.resolve();
    await expect(body(page)).toHaveCount(1);
    await expect(firstBlock(page)).toHaveText("preserved");
    await expect(page.getByRole("textbox", { name: "文档标题" })).toHaveValue("加载中的正文");

    await activate(page);
    await page.keyboard.press("ControlOrMeta+a");
    await page.keyboard.press("Backspace");
    await expect(body(page).locator(".tiptap")).toHaveText("");
    await expect(saved(page)).toBeVisible();
    await page.reload();
    await expect(firstBlock(page)).toHaveText("");
    await activate(page);
    await page.keyboard.type("reopened");
    await expect(firstBlock(page)).toHaveText("reopened");
  } finally {
    release.resolve();
  }
});
