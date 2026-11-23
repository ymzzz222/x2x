import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const origin = process.env.EDITOR_TEST_URL;
const publicOrigin = process.env.EDITOR_PUBLIC_TEST_URL;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

function loopback(value: string | undefined) {
  return value && ["localhost", "127.0.0.1"].includes(new URL(value).hostname);
}

test.use({ channel: "chrome" });
test.skip(!loopback(url) || !secret, "Run against an isolated local Supabase stack.");

test("a lost create response can be recovered after reload without creating a second document", async ({ page }) => {
  test.skip(!loopback(origin), "Requires the local application with public documents disabled.");
  const password = "X2x-dev-" + randomUUID();
  const email = `list.${randomUUID()}@example.com`;
  const admin = createClient(url!, secret!, { auth: { autoRefreshToken: false, persistSession: false } });
  const { error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  expect(error).toBeNull();
  await page.goto(origin + "/editor");
  await page.getByRole("textbox", { name: "邮箱" }).fill(email);
  await page.getByLabel("密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
  await expect(page.getByText("暂无文档", { exact: true })).toBeVisible();

  const writes: { key: string | undefined; id: string }[] = [];
  await page.route(/\/api\/documents$/, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") { await route.continue(); return; }
    const response = await route.fetch();
    expect(response.status()).toBe(201);
    writes.push({ key: request.headers()["idempotency-key"], id: (await response.json()).id });
    if (writes.length === 1) await route.abort();
    else await route.fulfill({ response });
  });

  await page.getByRole("button", { name: "新增", exact: true }).evaluate((button: HTMLButtonElement) => {
    button.click();
    button.click();
  });
  const retry = page.getByRole("button", { name: "重试新增", exact: true });
  await expect(retry).toBeVisible();
  expect(writes).toHaveLength(1);
  await page.reload();
  await retry.click();
  await expect(page.getByRole("heading", { name: "无标题文档" })).toBeVisible();
  expect(writes).toHaveLength(2);
  expect(writes[0].key).toMatch(/^[0-9a-f-]{36}$/);
  expect(writes[1]).toEqual(writes[0]);

  const body = page.getByRole("region", { name: "文档正文" });
  await body.locator("#block-1").click();
  await expect(body.locator(".tiptap")).toBeFocused();
  await page.keyboard.insertText("创建后持久化正文");
  await expect(page.getByText("云端已保存", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "返回文档列表" }).click();
  const details = page.getByRole("link", { name: "无标题文档详情" });
  await expect(details).toHaveCount(1);
  const documentUrl = `**/api/documents/${writes[0].id}?generation=0&after=-1`;
  await page.route(documentUrl, async (route) => {
    await route.fulfill({ status: 503, json: { error: "DATABASE_UNAVAILABLE" } });
  }, { times: 1 });
  await details.click();
  await page.getByRole("button", { name: "重试打开" }).click();
  await expect(body).toContainText("创建后持久化正文");
  await page.getByRole("link", { name: "返回文档列表" }).click();
  await page.getByRole("button", { name: "退出登录" }).click();
  await expect(page.getByRole("button", { name: "登录", exact: true })).toBeVisible();
  await expect(details).toHaveCount(0);
});

test("public visitors have independent sessions and manage the same script", async ({ browser }) => {
  test.skip(!loopback(publicOrigin), "Requires an isolated application configured for public documents.");
  const [first, second] = await Promise.all([browser.newContext(), browser.newContext()]);
  try {
    const [writer, reader] = await Promise.all([first.newPage(), second.newPage()]);
    async function enter(page: typeof writer, failFirst = false) {
      let fail = failFirst;
      if (failFirst) await page.route((url) => url.pathname.endsWith("/auth/v1/signup"), async (route) => {
        if (!fail || route.request().method() !== "POST") { await route.continue(); return; }
        fail = false;
        await route.fulfill({ status: 429, headers: { "Access-Control-Allow-Origin": "*" },
          json: { code: "over_request_rate_limit", message: "Temporary rate limit" } });
      });
      const signedIn = page.waitForResponse((response) => response.request().method() === "POST" &&
        new URL(response.url()).pathname.endsWith("/auth/v1/signup") && response.ok());
      await page.goto(publicOrigin + "/editor");
      if (failFirst) await page.getByRole("button", { name: "重试连接" }).click();
      await expect(page.getByRole("button", { name: "新增", exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "登录", exact: true })).toHaveCount(0);
      return (await (await signedIn).json()).user;
    }

    let writerSignIns = 0;
    writer.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).pathname.endsWith("/auth/v1/signup")) writerSignIns++;
    });
    const firstUser = await enter(writer, true);
    await writer.reload();
    await expect(writer.getByRole("button", { name: "新增", exact: true })).toBeVisible();
    expect(writerSignIns).toBe(2);
    const created = writer.waitForResponse((response) => new URL(response.url()).pathname === "/api/documents" && response.status() === 201);
    await writer.getByRole("button", { name: "新增", exact: true }).click();
    const { id } = await (await created).json();
    await expect(writer.getByRole("heading", { name: "无标题文档" })).toBeVisible();
    await expect(writer.getByRole("group", { name: "在线协作者" })).toHaveCount(0);
    await expect(writer.getByRole("img", { name: "admin（本人）" })).toBeVisible();

    const secondUser = await enter(reader);
    expect(firstUser.is_anonymous && secondUser.is_anonymous).toBe(true);
    expect(firstUser.id).not.toBe(secondUser.id);
    await reader.locator(`a[href="/editor/shared/${id}"]`).click();
    await expect(reader.getByRole("heading", { name: "无标题文档" })).toBeVisible();
    const online = writer.getByRole("group", { name: "在线协作者" });
    await expect(online).toHaveAccessibleDescription("2 人在线", { timeout: 20_000 });
    await expect(online.getByRole("img")).toHaveCount(2);

    const writerBody = writer.getByRole("region", { name: "文档正文" });
    const readerBody = reader.getByRole("region", { name: "文档正文" });
    await writerBody.locator("#block-1").click();
    await expect(writerBody.locator(".tiptap")).toBeFocused();
    await writer.keyboard.insertText("第一位访客的内容");
    await expect(readerBody).toContainText("第一位访客的内容");
    await readerBody.locator("#block-1").click();
    await expect(readerBody.locator(".tiptap")).toBeFocused();
    await reader.keyboard.insertText("第二位访客的内容");
    await expect(writerBody).toContainText("第二位访客的内容");
  } finally {
    await Promise.all([first.close(), second.close()]);
  }
});
