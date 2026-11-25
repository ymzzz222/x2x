import { expect } from "@playwright/test";
import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { promisify } from "node:util";
import * as Y from "yjs";
import { test, sharedAvailable, origin, login, create, activate, firstBlock, body, saved, documentEndpoint, watchDocumentAuthorization } from "./shared-document-fixture";

test.use({ channel: "chrome", viewport: { width: 1360, height: 900 } });
const database = process.env.EDITOR_TEST_DB_CONTAINER;
const disposable = /^supabase_db_x2x-(?:editor-qa(?:-[a-z0-9]+)?|fullqa-[a-z0-9]+)-private$/;
test.skip(!sharedAvailable || !database || !disposable.test(database), "Set EDITOR_TEST_DB_CONTAINER to the disposable local private test database.");
const run = promisify(execFile);

async function sql(statement: string) {
  const { stdout } = await run("docker", ["exec", database!, "psql", "-XAt", "-v", "ON_ERROR_STOP=1",
    "-U", "postgres", "-d", "postgres", "-c", statement]);
  return stdout.trim();
}

function snapshot(future: boolean) {
  const document = new Y.Doc();
  const rows = document.getArray<{ id: string; kind: string }>("order");
  const fragments = document.getMap<Y.XmlFragment>("paragraphs");
  const fields = [{ id: "block-1", kind: "paragraph" }, ...(future ? [{ id: "block-2", kind: "futureBlock" }] : [])];
  for (const field of fields) {
    rows.push([field]);
    const fragment = new Y.XmlFragment();
    fragments.set(field.id, fragment);
    const node = new Y.XmlElement(field.kind);
    if (field.kind === "paragraph") node.insert(0, [new Y.XmlText("旧结构可读正文")]);
    fragment.insert(0, [node]);
  }
  const bytes = Buffer.from(Y.encodeStateAsUpdate(document));
  document.destroy();
  return bytes;
}

async function seedSnapshot(path: string, schema: 1 | 2) {
  const id = path.split("/").at(-1);
  if (!id || !/^[\da-f-]{36}$/.test(id)) throw new Error("Expected a document created in the isolated test database.");
  const where = `where id = '${id}'`;
  const bytes = snapshot(schema === 2);
  const update = await sql(`update x2x_private.documents set schema_version = ${schema}, snapshot = decode('${bytes.toString("hex")}', 'hex') ${where} and head = 0`);
  expect(update).toBe("UPDATE 1");
  return { bytes, row: () => sql(`select schema_version, head, encode(snapshot, 'hex') from x2x_private.documents ${where}`) };
}

test("DOM-09 compatible older data stays editable and newer data stays read-only across document switches", async ({ provision }) => {
  test.setTimeout(65_000);
  const owner = await provision("schema-owner");
  const { page } = owner;
  await login(page, owner.email);
  const old = await create(page, "旧结构样本");
  await seedSnapshot(old, 1);
  await page.goto(origin + "/editor/shared");
  const future = await create(page, "新结构样本");
  const fixture = await seedSnapshot(future, 2);
  const initial = await fixture.row();

  await page.goto(origin + old);
  await expect(firstBlock(page)).toHaveText("旧结构可读正文");
  await activate(page);
  await page.keyboard.press("End");
  await page.keyboard.insertText("：旧文档续写");
  await expect(saved(page)).toBeVisible();
  const authorization = watchDocumentAuthorization(page, future);
  for (let round = 0; round < 3; round++) {
    await page.goto(origin + future);
    await expect(page.getByText("文档采用较新结构，已以只读方式打开")).toBeVisible();
    await expect(body(page)).toContainText("旧结构可读正文");
    await expect(body(page)).toContainText("此内容需要新版编辑器查看");
    await expect(page.getByRole("button", { name: "编辑", exact: true })).toBeDisabled();
    await expect(body(page).locator("[data-block-index]")).toHaveCount(2);
    await page.goto(origin + old);
    await expect(firstBlock(page)).toHaveText("旧结构可读正文：旧文档续写");
    await expect(body(page).locator("[data-block-index]")).toHaveCount(1);
  }
  const rejected = await page.request.post(documentEndpoint(future), {
    headers: await authorization, data: { action: "save", generation: 1, schema: 1, batch: randomUUID(), data: fixture.bytes.toString("base64") },
  });
  expect(rejected.status()).toBe(409);
  expect(await rejected.json()).toEqual({ error: "DOCUMENT_VERSION_CHANGED" });
  expect((await fixture.row()) === initial, "the new schema and snapshot remain unchanged").toBe(true);
});
