import { isDeepStrictEqual } from "node:util";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { copyClipboard } from "./editor-clipboard";
import { activate, caret, seedBlank } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1440, height: 900 } });

const types = ["paragraph", "H1", "H9", "ordered", "bullet", "quote"] as const;
type Kind = typeof types[number];
type Source = Kind | "mixed";

const command: Record<Kind, string> = {
  paragraph: "ControlOrMeta+Alt+0", H1: "ControlOrMeta+Alt+1", H9: "ControlOrMeta+Alt+9",
  ordered: "ControlOrMeta+Shift+7", bullet: "ControlOrMeta+Shift+8", quote: "ControlOrMeta+Shift+.",
};
const expectedTypes: Record<Kind, readonly string[]> = {
  paragraph: ["paragraph", "H1", "H9", "ordered", "bullet", "quote/paragraph"],
  H1: ["paragraph", "paragraph", "H9", "numbered H1", "bullet", "quote/H1"],
  H9: ["paragraph", "H1", "paragraph", "numbered H9", "bullet", "quote/H9"],
  ordered: ["paragraph", "numbered H1", "numbered H9", "paragraph", "bullet", "quote/ordered"],
  bullet: ["paragraph", "H1", "H9", "ordered", "paragraph", "quote/bullet"],
  quote: ["quote/paragraph", "quote/H1", "quote/H9", "quote/ordered", "quote/bullet", "paragraph"],
};
const mixedTypes = [
  ["paragraph", "paragraph", "paragraph"],
  ["H1", "H1", "H1"],
  ["H9", "H9", "H9"],
  ["numbered H1", "ordered", "ordered"],
  ["bullet", "bullet", "bullet"],
  ["quote/H1", "quote/paragraph", "quote/bullet"],
];

function fixture(source: Source, words: readonly string[]) {
  const inline = words.map((value, index) => index === 0 ? value[0] + "<strong>" + value[1] + "</strong>" + value.slice(2) : value);
  switch (source) {
    case "H1":
      return inline.map((word) => '<h2 data-heading-level="1">' + word + "</h2>").join("");
    case "H9":
      return inline.map((word) => '<div data-heading-level="9">' + word + "</div>").join("");
    case "ordered":
    case "bullet": {
      const list = source === "ordered" ? "ol" : "ul";
      return "<" + list + ">" + inline.map((word) => "<li><p>" + word + "</p></li>").join("") + "</" + list + ">";
    }
    case "quote":
      return "<blockquote>" + inline.map((word) => "<p>" + word + "</p>").join("") + "</blockquote>";
    case "mixed":
      return '<h2 data-heading-level="1">' + inline[0] + "</h2><p>" + inline[1] +
        "</p><ul><li><p>" + inline[2] + "</p></li></ul>";
    default:
      return inline.map((word) => "<p>" + word + "</p>").join("");
  }
}

async function copyStructure(page: Page, body: Locator) {
  let html = "";
  await expect.poll(async () => {
    await body.focus();
    await page.keyboard.press("ControlOrMeta+a");
    ({ html } = await copyClipboard(body));
    return html.length;
  }).toBeGreaterThan(0);
  return body.evaluate((_element, content) => {
    const root = new DOMParser().parseFromString(content, "text/html");
    const paragraphs = [...root.querySelectorAll("p, [data-heading-level]")];
    const blocks = paragraphs.map((element) => {
      const level = element.getAttribute("data-heading-level");
      const quote = element.closest("blockquote") ? "quote/" : "";
      const list = element.closest("li")?.parentElement?.tagName;
      const numbered = element.hasAttribute("data-heading-number-start") ? "numbered " : "";
      const type = level ? numbered + "H" + level : list === "OL" ? "ordered" : list === "UL" ? "bullet" : "paragraph";
      return { type: quote + type, text: element.textContent, bold: element.querySelector("strong")?.textContent ?? "" };
    });
    return { blocks, quotes: root.querySelectorAll("blockquote").length };
  }, html);
}

type Structure = Awaited<ReturnType<typeof copyStructure>>;

async function selectQuoteText(page: Page, body: Locator) {
  const [start, end] = await Promise.all(["111", "333"].map((word) => body.getByText(word, { exact: true }).evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const { left, right, top, height } = range.getBoundingClientRect();
    return { left, right, y: top + height / 2 };
  })));
  await page.mouse.move(start.left, start.y);
  await page.mouse.down();
  await page.mouse.move(end.right + 1, end.y, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => (await copyClipboard(body)).text).toBe("111\n222\n333");
}

async function verifyHistory(page: Page, body: Locator, before: Structure, after: Structure) {
  if (isDeepStrictEqual(before, after)) return;
  await page.keyboard.press("ControlOrMeta+z");
  expect(await copyStructure(page, body)).toEqual(before);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  expect(await copyStructure(page, body)).toEqual(after);
}

for (const source of types) {
  for (const [index, target] of types.entries()) {
    test(`ED-20 ${source} to ${target} affects the single target and preserves the surrounding text`, async ({ page }) => {
      const body = await seedBlank(page, "<p>before</p>" + fixture(source, ["123"]) + "<p>after</p>");
      const before = await copyStructure(page, body);
      expect(before.blocks.map(({ text }) => text)).toEqual(["before", "123", "after"]);
      const editor = await activate(page, 1);
      await caret(editor.getByText("123", { exact: true }));
      await page.keyboard.press(command[target]);

      const type = expectedTypes[source][index];
      const expected = {
        blocks: [before.blocks[0], { text: "123", type, bold: "2" }, before.blocks[2]],
        quotes: Number(type.startsWith("quote/")),
      };
      const after = await copyStructure(page, body);
      expect(after).toEqual(expected);
      await verifyHistory(page, body, before, after);
    });
  }
}

for (const source of [...types, "mixed"] as const) {
  for (const [index, target] of types.entries()) {
    test(`ED-21 ${source} to ${target} converts the whole range and retains the shared quote boundary`, async ({ page }) => {
      const words = ["111", "222", "333"];
      const body = await seedBlank(page, fixture(source, words));
      const before = await copyStructure(page, body);
      expect(before.blocks.map(({ text }) => text)).toEqual(words);
      if (source === "quote") await selectQuoteText(page, body);
      if (source === "quote" && target === "quote") {
        await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click();
        await page.getByRole("group", { name: "内容块命令" }).getByRole("button", { name: "引用", exact: true }).click();
      } else await page.keyboard.press(command[target]);

      const resultTypes = source === "mixed" ? mixedTypes[index] : words.map(() => expectedTypes[source][index]);
      const expected = {
        blocks: words.map((text, position) => ({ text, type: resultTypes[position], bold: position === 0 ? "1" : "" })),
        quotes: Number(resultTypes.some((type) => type.startsWith("quote/"))),
      };
      const after = await copyStructure(page, body);
      expect(after).toEqual(expected);
      if (source === "quote" && target === "paragraph") {
        await page.keyboard.press("ControlOrMeta+z");
        await expect(body.locator("[data-block-index]")).toHaveCount(1);
        await expect(body.getByText("111", { exact: true })).toHaveCount(0);
        await page.keyboard.press("ControlOrMeta+Shift+z");
        expect(await copyStructure(page, body)).toEqual(before);
      } else await verifyHistory(page, body, before, after);
    });
  }
}
