import { expect, test } from "@playwright/test";
import { file, block } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

test("document title, icon, cover and info visibility persist per sample", async ({ page }) => {
  await page.goto(file);
  await page.getByText("文档外观", { exact: true }).click();
  await page.getByRole("textbox", { name: "文档标题" }).fill("项目评审");
  await page.getByRole("combobox", { name: "标题图标" }).selectOption("📘");
  await page.getByRole("combobox", { name: "封面" }).selectOption({ label: "苔绿" });
  await page.getByRole("checkbox", { name: "显示文档信息" }).uncheck();
  await expect(page.getByRole("heading", { level: 1, name: "项目评审" })).toBeVisible();
  await expect(page.locator('[data-cover="2"]')).toBeVisible();
  await expect(page.getByText(/段 · 挂载/)).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "项目评审" })).toBeVisible();
  await expect(page.locator('[data-cover="2"]')).toBeVisible();
  await expect(page.getByText(/段 · 挂载/)).toHaveCount(0);
  await page.getByText("预览设置", { exact: true }).click();
  await page.getByRole("link", { name: "30 万字", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "长文档原型" })).toBeVisible();
});

test("RV-08 title bounds and restoring appearance leave the sample body unchanged", async ({ page }) => {
  await page.goto(file);
  await page.getByText("文档外观", { exact: true }).click();
  const first = block(page, 0).locator("[data-block-text]");
  const source = await first.textContent();
  const title = page.getByRole("textbox", { name: "文档标题" });
  const icon = page.getByRole("combobox", { name: "标题图标" });
  const cover = page.getByRole("combobox", { name: "封面" });
  const details = page.getByRole("checkbox", { name: "显示文档信息" });
  const heading = page.getByRole("heading", { level: 1 });
  await title.clear();
  await expect(heading).toHaveText("无标题文档");
  await title.fill("x".repeat(121));
  await expect(title).toHaveValue("x".repeat(120));
  await title.fill("长文档原型");
  await icon.selectOption("📘");
  await cover.selectOption("2");
  await details.uncheck();
  await icon.selectOption("");
  await cover.selectOption("0");
  await details.check();
  await page.reload();
  await expect(heading).toHaveText("长文档原型");
  await expect(page.locator("[data-cover]")).toHaveCount(0);
  await expect(first).toHaveText(source!);
});
