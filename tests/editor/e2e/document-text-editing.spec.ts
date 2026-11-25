import { expect, test } from "@playwright/test";
import { paragraphSelector, view, block, handle, seed, seedBlank, caret, activate } from "./editor-page";
import { copyClipboard } from "./editor-clipboard";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

for (const [kind, empty] of [["paragraph", "<p></p>"], ["quote", "<blockquote><p></p></blockquote>"]]) {
  test(`focusing a trailing soft break does not move the next block in a ${kind}`, async ({ page }) => {
    await seed(page, "<p>Intro</p>" + empty + "<p>Next paragraph</p>");
    const row = block(page, 1);
    const preview = row.locator("[data-block-text]");
    const nextOffset = async () => {
      const [current, next] = await Promise.all([row.boundingBox(), block(page, 2).boundingBox()]);
      return next!.y - current!.y;
    };

    await expect(preview).toBeVisible();
    const emptyOffset = await nextOffset();
    const editor = await activate(page, 1);
    await expect.poll(nextOffset).toBe(emptyOffset);

    await page.keyboard.press("Shift+Enter");
    await expect.poll(nextOffset).toBeGreaterThan(emptyOffset);
    if (kind === "paragraph") {
      await expect(row.getByRole("button", { name: "在第 2 块插入" }).locator('[data-block-icon="add"]')).toBeVisible();
    } else {
      await expect(handle(page, 1).locator('[data-block-icon="blockquote"]')).toBeVisible();
    }
    const softBreakOffset = await nextOffset();
    await activate(page, 2);
    await expect(preview).toHaveJSProperty("textContent", "\n");
    await expect.poll(nextOffset).toBe(softBreakOffset);

    const { height } = (await preview.boundingBox())!;
    await preview.click({ position: { x: 2, y: height - 4 } });
    await expect(editor).toBeFocused();
    await expect.poll(nextOffset).toBe(softBreakOffset);
    await page.keyboard.insertText("在第二行");
    await expect.poll(() => editor.locator(paragraphSelector).evaluate((paragraph) =>
      paragraph.querySelector("br")?.nextSibling?.textContent)).toBe("在第二行");
    if (kind === "paragraph") await expect(handle(page, 1).locator('[data-block-icon="paragraph"]')).toBeVisible();
  });
}

test("floating selection formats and whole-block cut and copy use the normal clipboard", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await seed(page, "<p>Alpha</p><p>Beta</p><p>Gamma</p>");
  const editor = await activate(page, 0);
  const floating = page.getByRole("toolbar", { name: "选区工具栏" });
  await expect(page.getByRole("toolbar")).toHaveCount(0);
  const text = await editor.locator(paragraphSelector).evaluate((paragraph) => {
    const range = document.createRange();
    range.selectNodeContents(paragraph);
    const { left, right, top, bottom } = range.getBoundingClientRect();
    return { left, right, top, y: (top + bottom) / 2 };
  });
  await page.mouse.move(text.left + 1, text.y);
  await page.mouse.down();
  await page.mouse.move(text.right + 2, text.y, { steps: 6 });
  await expect(floating).toHaveCount(0);
  await page.mouse.up();
  await expect(floating).toBeVisible();
  const bounds = (await floating.boundingBox())!;
  expect(bounds.y + bounds.height).toBeLessThan(text.top);
  await floating.getByRole("button", { name: "粗体" }).click();
  await expect(editor.locator("strong")).toHaveText("Alpha");

  await page.keyboard.press("ArrowRight");
  await expect(floating).toBeHidden();
  await expect(block(page, 0).getByRole("button")).toHaveCount(1);
  await expect(handle(page, 0).locator('[data-block-icon="paragraph"]')).toHaveCount(1);
  await handle(page, 0).click({ force: true });
  await page.getByRole("button", { name: "选中块", exact: true }).click();
  await expect(block(page, 0)).toHaveAttribute("data-block-selected");
  await handle(page, 1).click({ force: true, modifiers: ["Shift"] });
  await expect(view(page).locator("[data-block-selected]")).toHaveCount(2);
  await view(page).press("ControlOrMeta+c");
  await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe("Alpha\nBeta");
  await view(page).press("ControlOrMeta+x");
  await expect(view(page).locator("[data-block-index]")).toHaveCount(1);
  await expect(block(page, 0)).toContainText("Gamma");
  await view(page).press("ControlOrMeta+z");
  await expect(block(page, 0).locator("strong")).toHaveText("Alpha");
  await expect(block(page, 1)).toContainText("Beta");
});

for (const [name, first, last, wrapped] of [
  ["paragraph", "<p>", "</p>", false],
  ["H1", '<h2 data-heading-level="1">', "</h2>", false],
  ["H9", '<h6 data-heading-level="9">', "</h6>", false],
  ["ordered", "<ol><li><p>", "</p></li></ol>", true],
  ["bullet", "<ul><li><p>", "</p></li></ul>", true],
  ["quote", "<blockquote><p>", "</p></blockquote>", true],
] as const) {
  for (const offset of [0, 1, 3]) {
    test(`ED-02 ${name} at ${offset} distinguishes Enter and Shift+Enter`, async ({ page }) => {
      const surface = await seedBlank(page, first + "abc" + last + "<p>Tail</p>");
      const tail = surface.getByText("Tail", { exact: true }).locator("xpath=ancestor::*[@data-block-index][1]");
      const tailId = await tail.getAttribute("id");
      async function placeCaret() {
        await activate(page, 0);
        await caret(surface.locator(".tiptap").getByText("abc", { exact: true }), offset);
      }
      async function copyRows() {
        await surface.press("ControlOrMeta+a");
        const { html } = await copyClipboard(surface);
        return page.evaluate((html) => {
          const root = new DOMParser().parseFromString(html, "text/html");
          return Array.from(root.querySelectorAll("p, [data-heading-level]"), (row) => ({
            text: (row.innerHTML.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")),
            kind: row.getAttribute("data-heading-level") ? `H${row.getAttribute("data-heading-level")}`
              : row.closest("blockquote") ? "quote" : row.closest("ol") ? "ordered" : row.closest("ul") ? "bullet" : "paragraph",
          }));
        }, html);
      }
      const left = "abc".slice(0, offset);
      const right = "abc".slice(offset);

      await placeCaret();
      await page.keyboard.press("Shift+Enter");
      await expect(surface.locator(".tiptap")).toBeFocused();
      await page.keyboard.insertText("X");
      await expect(tail).toHaveAttribute("id", tailId!);
      expect(await copyRows()).toEqual([{ text: left + "\nX" + right, kind: name }, { text: "Tail", kind: "paragraph" }]);

      await seedBlank(page, first + "abc" + last + "<p>Tail</p>");
      await placeCaret();
      await page.keyboard.press("Enter");
      await expect(surface.locator(".tiptap")).toBeFocused();
      await page.keyboard.insertText("X");
      await expect(tail).toHaveText("Tail");
      expect(await copyRows()).toEqual([
        { text: left, kind: offset === 0 && !wrapped ? "paragraph" : name },
        { text: "X" + right, kind: offset === 3 && !wrapped ? "paragraph" : name },
        { text: "Tail", kind: "paragraph" },
      ]);
    });
  }
}

for (const key of ["Backspace", "Delete"]) {
  test(`ED-03 ${key} joins adjacent paragraphs without losing bold or caret position`, async ({ page }) => {
    const surface = await seedBlank(page, "<p>甲<strong>粗体</strong></p><p>乙普通</p><p>后续</p>");
    const backward = key === "Backspace";
    const editor = await activate(page, backward ? 1 : 0);
    await caret(editor.getByText(backward ? "乙普通" : "粗体", { exact: true }), backward ? 0 : 2);
    await page.keyboard.press(key);
    await expect(block(page, 0)).toContainText("甲粗体乙普通");
    await expect(block(page, 0).locator("strong")).toHaveText("粗体");
    await expect(block(page, 1)).toContainText("后续");
    await expect(surface.locator("[data-block-index]")).toHaveCount(2);
    await expect(block(page, 0).locator(".tiptap")).toBeFocused();
    await page.keyboard.insertText("X");
    await expect(block(page, 0)).toContainText("甲粗体X乙普通");
    await page.keyboard.press("ControlOrMeta+z");
    await page.keyboard.press("ControlOrMeta+z");
    await expect(block(page, 1)).toContainText("乙普通");
  });
}
