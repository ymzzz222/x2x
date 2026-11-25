import { expect, test as base, type BrowserContext, type Page } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const origin = process.env.EDITOR_TEST_URL ?? "http://localhost:3106";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const password = "X2x-dev-" + randomUUID();

function loopback(address?: string) {
  return Boolean(address && ["localhost", "127.0.0.1"].includes(new URL(address).hostname));
}

export const sharedAvailable = loopback(origin) && loopback(supabaseUrl) && Boolean(secret);

type Account = { email: string; context: BrowserContext; page: Page };

export const test = base.extend<{ provision: (role: string) => Promise<Account> }>({
  provision: async ({ browser, viewport }, provide) => {
    if (!sharedAvailable) throw new Error("Expected an isolated local preview and Supabase stack.");
    const admin = createClient(supabaseUrl!, secret!, { auth: { autoRefreshToken: false, persistSession: false } });
    const contexts: BrowserContext[] = [];
    try {
      await provide(async (role) => {
        const email = role + "." + randomUUID() + "@example.com";
        const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
        if (error || !data.user) throw new Error("Could not provision local test user: " + error?.message);
        const context = await browser.newContext({ viewport });
        contexts.push(context);
        return { email, context, page: await context.newPage() };
      });
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  },
});

export async function signIn(page: Page, email: string) {
  await page.getByRole("textbox", { name: "邮箱" }).fill(email);
  await page.getByLabel("密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录", exact: true }).click();
}

export async function login(page: Page, email: string, destination = "/editor/shared") {
  await page.goto(origin + destination);
  await signIn(page, email);
}

export async function documentAction(page: Page, name: string) {
  await page.getByRole("button", { name: "更多操作" }).click();
  await page.getByRole("group", { name: "文档操作" }).getByRole("button", { name, exact: true }).click();
}

export function body(page: Page) {
  return page.getByRole("region", { name: "文档正文" });
}

export function saved(page: Page) {
  return page.getByText("云端已保存", { exact: true });
}

export function documentEndpoint(path: string) {
  return origin + path.replace("/editor/shared/", "/api/documents/");
}

export async function watchDocumentAuthorization(page: Page, path: string) {
  const request = await page.waitForRequest((request) => request.method() === "GET" &&
    request.url().startsWith(documentEndpoint(path) + "?"));
  const authorization = await request.headerValue("authorization");
  if (!authorization) throw new Error("Expected the test document request to have a signed-in session.");
  return { authorization };
}

export async function create(page: Page, title: string, sample?: "100000" | "300000" | "500000") {
  const submit = page.getByRole("button", { name: "创建文档" });
  await expect(submit).toBeVisible();
  await page.getByRole("textbox", { name: "文档标题" }).fill(title);
  if (sample) await page.getByLabel("初始内容").selectOption(sample);
  await submit.click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(saved(page)).toBeVisible();
  return new URL(page.url()).pathname;
}

export function shareDialog(page: Page) {
  return page.getByRole("dialog", { name: "分享与权限" });
}

export async function grant(page: Page, email: string, role: "view" | "edit" | "manage") {
  await page.getByRole("button", { name: "分享", exact: true }).click();
  const dialog = shareDialog(page);
  await dialog.getByRole("textbox", { name: "成员邮箱" }).fill(email);
  await dialog.getByRole("combobox", { name: "成员角色" }).selectOption(role);
  await dialog.getByRole("button", { name: "授权成员" }).click();
  await expect(dialog.getByRole("combobox", { name: email + " 的角色" })).toHaveValue(role);
  await dialog.getByRole("button", { name: "关闭" }).click();
}

export function firstBlock(page: Page) {
  return body(page).locator("#block-1");
}

export async function activate(page: Page) {
  const row = firstBlock(page);
  await row.locator("[data-block-text]").click({ position: { x: 1, y: 8 } });
  await expect(row.locator(".tiptap")).toBeFocused();
}
