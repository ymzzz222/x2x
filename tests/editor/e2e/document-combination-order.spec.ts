import { expect, test, type Locator, type Page } from "@playwright/test";
import { copyClipboard } from "./editor-clipboard";
import { seedBlank } from "./editor-page";

test.use({ channel: "chrome", viewport: { width: 1440, height: 1200 } });
test.setTimeout(15_000);

const sourceKinds = ["T", "H", "J", "O", "B", "Q"] as const;
type Source = typeof sourceKinds[number];
type Kind = "paragraph" | "ordered" | "bullet" | `H${number}`;
type Command = Kind | "quote" | "callout";
type Setup = "paste" | "live-ordered" | "continuous-ordered" | "live-quote";
type Row = { id: string; text: string; kind: Kind; bold: string; quote: string | null; parent: string | null; number: string; callout: boolean };

const leafSelector = '[data-block-type="paragraph"], [data-heading-level]';
const sourceKind: Record<Source, Kind> = { T: "paragraph", H: "H1", J: "H2", O: "ordered", B: "bullet", Q: "paragraph" };
const shortcut = {
  paragraph: "ControlOrMeta+Alt+0",
  ordered: "ControlOrMeta+Shift+7",
  bullet: "ControlOrMeta+Shift+8",
};
const historyKeys = { undo: "ControlOrMeta+z", redo: "ControlOrMeta+Shift+z" };

function sourceBlock(kind: Source, text: string) {
  switch (kind) {
    case "T": return `<p>${text}</p>`;
    case "H": return `<h2 data-heading-level="1">${text}</h2>`;
    case "J": return `<h3 data-heading-level="2">${text}</h3>`;
    case "O": return `<ol><li><p>${text}</p></li></ol>`;
    case "B": return `<ul><li><p>${text}</p></li></ul>`;
    case "Q": return `<blockquote><p>${text}</p></blockquote>`;
  }
}

function matrixFixture(order: readonly Source[], setup: Setup) {
  const words = order.map((_, index) => `W${String(index).padStart(2, "0")}End`);
  const marked = words.map((word, index) => index ? word : `${word[0]}<strong>${word[1]}</strong>${word.slice(2)}`);
  const blocks: string[] = [];
  for (let index = 0; index < order.length; index += 1) {
    const kind = order[index];
    if (kind === "O" && setup === "continuous-ordered") {
      let end = index + 1;
      while (order[end] === "O") end += 1;
      blocks.push(`<ol>${marked.slice(index, end).map((word) => `<li><p>${word}</p></li>`).join("")}</ol>`);
      index = end - 1;
    } else {
      const createInEditor = (setup === "live-ordered" && kind === "O") || (setup === "live-quote" && kind === "Q");
      blocks.push(sourceBlock(createInEditor ? "T" : kind, marked[index]));
    }
  }
  return { words, html: `<p>BeforeGuard</p>${blocks.join("")}<p>AfterGuard</p>` };
}

function rotations(order: string) {
  return Array.from(order, (_, index) => order.slice(index) + order.slice(0, index));
}

function reversed(order: string) {
  return Array.from(order).reverse().join("");
}

function rotatedPairs(order: string, extra: readonly string[]) {
  return [...new Set([...rotations(order), ...rotations(reversed(order)), ...extra])];
}

const shortOrders = sourceKinds.flatMap((first) => sourceKinds.map((last) => first + last));
const tripleOrders = shortOrders.flatMap((prefix) => sourceKinds.map((last) => prefix + last));
const longerOrders = [
  ...rotatedPairs("THOQ", ["OQOQ", "QOQO"]),
  ...rotatedPairs("THOBQ", ["TTOQT", "TQOTT"]),
  ...rotatedPairs("THJOBQ", ["OOBQQT", "TQQBOO"]),
  ...Array.from({ length: 6 }, (_, index) => "THJOBQTHJOBQ".slice(0, index + 7)).flatMap((order) => [order, reversed(order)]),
];

function selectionLeaf(body: Locator, text: string) {
  return body.locator(leafSelector).and(body.getByText(text, { exact: true }));
}

async function point(leaf: Locator, offset: number) {
  return leaf.evaluate((element, offset) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    let remaining = offset;
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const length = text.textContent?.length ?? 0;
      if (remaining <= length) {
        range.setStart(text, remaining);
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        return { x: rect.x + 0.2, y: rect.y + rect.height / 2 };
      }
      remaining -= length;
    }
    throw new Error(`No caret at offset ${offset} in ${element.textContent}`);
  }, offset);
}

async function dragRange(page: Page, body: Locator, first: [string, number], last: [string, number], reverse = false) {
  const start = selectionLeaf(body, first[0]);
  const end = selectionLeaf(body, last[0]);
  // The click also mounts the real editor when both endpoints belong to one rendering row.
  await start.click();
  const points = [await point(start, first[1]), await point(end, last[1])];
  const [from, to] = reverse ? points.reverse() : points;
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 8 });
  await page.mouse.up();
}

async function selectedText(body: Locator) {
  const { text } = await copyClipboard(body);
  return text.replace(/^\d+(?:\.\d+)*\. /gm, "").replace(/\n+$/, "");
}

async function selectWords(page: Page, body: Locator, words: readonly string[], reverse: boolean) {
  await dragRange(page, body, [words[0], 1], [words.at(-1)!, words.at(-1)!.length - 1], reverse);
  const expected = [words[0].slice(1), ...words.slice(1, -1), words.at(-1)!.slice(0, -1)].join("\n");
  await expect.poll(() => selectedText(body), { timeout: 1800, message: "The drag must select these characters without either guard" }).toBe(expected);
  return expected;
}

async function readRows(body: Locator): Promise<Row[]> {
  return body.evaluate((region, selector) => {
    const elements = Array.from(region.querySelectorAll<HTMLElement>(selector));
    const firstText = (container: Element | null) => container?.querySelector(selector)?.textContent?.trim() || null;
    function readText(node: Node): string {
      if (node instanceof HTMLBRElement) return node.classList.contains("ProseMirror-trailingBreak") ? "" : "\n";
      return node.nodeType === Node.TEXT_NODE ? node.textContent ?? "" : Array.from(node.childNodes, readText).join("");
    }
    return elements.map((element) => {
      const row = element.closest<HTMLElement>("[data-block-index]");
      const list = element.closest<HTMLElement>('[data-block-type="ordered-list"], [data-block-type="bullet-list"]');
      const item = element.closest('[data-block-type="list-item"]');
      const level = element.dataset.headingLevel;
      const quote = element.closest('[data-quote-group], [data-block-type="quote"]');
      const explicitParent = row?.getAttribute("data-block-parent");
      const parentItem = list?.parentElement?.closest('[data-block-type="list-item"]') ?? null;
      const start = Number(list?.dataset.listStart ?? 1);
      const itemIndex = list && item ? Array.from(list.children).indexOf(item) : 0;
      return {
        id: row?.id ?? "",
        text: readText(element).trim(),
        kind: level ? `H${Number(level)}` : list ? list.dataset.blockType === "ordered-list" ? "ordered" : "bullet" : "paragraph",
        bold: Array.from(element.querySelectorAll("strong")).map((mark) => mark.textContent).join(""),
        quote: firstText(quote),
        parent: firstText(explicitParent ? document.getElementById(explicitParent) : parentItem),
        number: row?.querySelector("[data-heading-number]")?.textContent?.trim() ??
          (list?.dataset.blockType === "ordered-list" ? `${start + itemIndex}.` : ""),
        callout: element.closest("[data-callout]") !== null,
      };
    });
  }, leafSelector);
}

function content(rows: readonly Row[]) {
  return rows.map(({ id, text, bold }) => ({ id, text, bold }));
}

function structure(rows: readonly Row[]) {
  return rows.map(({ text, kind, bold, quote, parent, number, callout }) => ({ text, kind, bold, quote, parent, number, callout }));
}

async function assertHistory(page: Page, body: Locator, before: readonly Row[], after: readonly Row[]) {
  await page.keyboard.press(historyKeys.undo);
  await expect.poll(async () => structure(await readRows(body)), { timeout: 1800 }).toEqual(structure(before));
  await page.keyboard.press(historyKeys.redo);
  await expect.poll(async () => structure(await readRows(body)), { timeout: 1800 }).toEqual(structure(after));
}

async function chooseType(page: Page, command: Command, menu = false) {
  if (menu || command === "quote" || command === "callout") {
    const label = command === "quote" ? "引用" : command === "callout" ? "高亮块" :
      command === "paragraph" ? "正文" : command === "ordered" ? "有序列表" : command === "bullet" ? "无序列表" : `标题 ${command.slice(1)}`;
    await page.getByRole("toolbar", { name: "选区工具栏" }).getByRole("button", { name: "块类型", exact: true }).click({ timeout: 2500 });
    await page.getByRole("group", { name: "内容块命令" }).getByRole("button", { name: label, exact: true }).click({ timeout: 2500 });
  } else {
    await page.keyboard.press(command in shortcut ? shortcut[command as keyof typeof shortcut] : `ControlOrMeta+Alt+${command.slice(1)}`);
  }
}

async function openOrder(page: Page, order: string, setup: Setup = "paste") {
  const signs = Array.from(order) as Source[];
  const fixture = matrixFixture(signs, setup);
  const body = await seedBlank(page, fixture.html);
  for (const [index, sign] of signs.entries()) {
    if (setup === "live-ordered" && sign === "O") {
      await selectionLeaf(body, fixture.words[index]).click();
      await chooseType(page, "ordered");
    }
    if (setup === "live-quote" && sign === "Q") {
      const leaf = selectionLeaf(body, fixture.words[index]);
      await leaf.click();
      await leaf.dblclick();
      await chooseType(page, "quote");
      await selectionLeaf(body, "AfterGuard").click();
    }
  }
  const before = await readRows(body);
  expect(before.map(({ text }) => text)).toEqual(["BeforeGuard", ...fixture.words, "AfterGuard"]);
  expect(before.slice(1, -1).map(({ kind, quote }) => [kind, quote !== null])).toEqual(signs.map((sign) => [sourceKind[sign], sign === "Q"]));
  expect(before[1].bold).toBe("0");
  return { body, before, words: fixture.words, signs };
}

for (const [index, order] of [...shortOrders, ...tripleOrders, ...longerOrders].entries()) {
  const offset = order.length === 2 ? 0 : order.length === 3 ? shortOrders.length : shortOrders.length + tripleOrders.length;
  const id = order.length < 4 ? `C${order.length}${String(index - offset).padStart(3, "0")}` : `L${String(index - offset).padStart(3, "0")}`;
  test(`S12-H2 ${id} ${order} preserves text, marks, quote ownership and guards`, async ({ page }) => {
    const { body, before, words } = await openOrder(page, order);
    await selectWords(page, body, words, order.length > 3 && (index - offset) % 2 === 1);
    await chooseType(page, "H2");
    const after = await readRows(body);
    expect.soft(content(after)).toEqual(content(before));
    expect.soft(after.map(({ quote }) => quote)).toEqual(before.map(({ quote }) => quote));
    expect.soft(after.map(({ kind }) => kind)).toEqual(["paragraph", ...words.map(() => /^J+$/.test(order) ? "paragraph" : "H2"), "paragraph"]);
    if (order.length >= 7 || (order.length > 3 && (index - offset) % 3 === 0)) await assertHistory(page, body, before, after);
  });
}

const targetOrders = ["TO", "OT", "HO", "OH", "TQ", "QT", "OQ", "QO", "TOQ", "QOT", "OBO", "BOO", "OOB", "HJQ", "QJH", "JHJ"];

function expectedQuotes(words: readonly string[], signs: readonly Source[]) {
  let group: string | null = null;
  return words.map((word, index) => {
    if (signs[index] === "Q") {
      group = null;
      return word;
    }
    group ??= word;
    return group;
  });
}

for (const order of targetOrders) {
  for (const command of ["ordered", "quote"] as const) {
    test(`S12-${command.toUpperCase()} ${order} preserves order and changes only the selected blocks`, async ({ page }) => {
      const { body, before, words, signs } = await openOrder(page, order, command === "quote" ? "continuous-ordered" : "live-ordered");
      await selectWords(page, body, words, false);
      await chooseType(page, command);
      const after = await readRows(body);
      const selected = after.slice(1, -1);
      expect.soft(content(after)).toEqual(content(before));
      expect.soft([after[0], after.at(-1)]).toEqual([before[0], before.at(-1)]);
      if (command === "quote") {
        expect.soft(selected.map(({ kind }) => kind)).toEqual(signs.map((sign) => sourceKind[sign]));
        expect.soft(selected.map(({ quote }) => quote)).toEqual(expectedQuotes(words, signs));
        if (["OBO", "BOO", "OOB"].includes(order)) {
          expect.soft(selected.filter(({ kind }) => kind === "ordered").map(({ number }) => number)).toEqual(order === "OBO" ? ["1.", "1."] : ["1.", "2."]);
        }
      } else {
        expect.soft(selected.map(({ kind }) => kind)).toEqual(signs.map((sign) => sign === "H" || sign === "J" ? sourceKind[sign] : "ordered"));
        expect.soft(selected.map(({ quote }) => quote)).toEqual(before.slice(1, -1).map(({ quote }) => quote));
        const listNumbers: Record<string, string[]> = { TO: ["1.", "2."], OT: ["1.", "2."], TQ: ["1.", "1."], QT: ["1.", "1."],
          OQ: ["1.", "1."], QO: ["1.", "1."], TOQ: ["1.", "2.", "1."], QOT: ["1.", "1.", "2."],
          OBO: ["1.", "2.", "3."], BOO: ["1.", "2.", "3."], OOB: ["1.", "2.", "3."] };
        if (listNumbers[order]) expect.soft(selected.map(({ number }) => number)).toEqual(listNumbers[order]);
        if (signs.includes("H")) expect.soft(selected.find(({ kind }) => kind === "H1")?.number).toBe(order === "QJH" || order === "JHJ" ? "2." : "1.");
      }
      await assertHistory(page, body, before, after);
    });
  }
}

for (const [order, command] of [["TQ", "H2"], ["QOT", "quote"]] as const) {
  test(`S12-NATIVE ${order} to ${command} keeps the quote created by the toolbar separate`, async ({ page }) => {
    const { body, before, words, signs } = await openOrder(page, order, "live-quote");
    await selectWords(page, body, words, false);
    await chooseType(page, command);
    const after = await readRows(body);
    expect.soft(content(after)).toEqual(content(before));
    expect.soft([after[0], after.at(-1)]).toEqual([before[0], before.at(-1)]);
    const selected = after.slice(1, -1);
    expect.soft(selected.map(({ kind }) => kind)).toEqual(command === "H2" ? wordsGroup("H2", words.length) : signs.map((sign) => sourceKind[sign]));
    expect.soft(selected.map(({ quote }) => quote)).toEqual(command === "H2" ? before.slice(1, -1).map(({ quote }) => quote) : expectedQuotes(words, signs));
    await assertHistory(page, body, before, after);
  });
}

const mixedFixture = '<p>BeforeGuard</p><h2 data-heading-level="1">A<strong>1</strong>aaa</h2><p>B2bbb</p>' +
  '<ol start="7"><li><p>C3ccc</p><ul><li><p>Kid4</p></li></ul></li><li><p>E5eee</p></li></ol>' +
  '<blockquote><p>Q6quote</p><p>Q7quote</p></blockquote><p>AfterGuard</p>';
const mixedCommands: Command[] = ["paragraph", "H1", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "ordered", "bullet", "quote", "callout"];
const boundaryQuote = '<p>BeforeGuard</p><p>OutsideText</p><blockquote><p>QuoteFirst</p><p>QuoteSecond</p></blockquote><p>AfterGuard</p>';
const quoteSubset = '<p>BeforeGuard</p><blockquote><p>QF<strong>irst</strong></p><p>QMiddle</p><p>QLast</p></blockquote><p>AfterGuard</p>';
const foldedFixture = '<p>LeadGuard</p><h2 data-heading-level="1">FoldHead</h2><h3 data-heading-level="2">ChildHead</h3>' +
  '<p>ChildText</p><h2 data-heading-level="1">NextHead</h2><p>AfterGuard</p>';

for (const command of mixedCommands) {
  for (const reverse of [false, true]) {
    test(`S12-MIXED ${command} ${reverse ? "reverse" : "forward"} preserves child and surrounding quote`, async ({ page }) => {
      const body = await seedBlank(page, mixedFixture);
      const before = await readRows(body);
      expect(before.map(({ text, kind }) => [text, kind])).toEqual([
        ["BeforeGuard", "paragraph"], ["A1aaa", "H1"], ["B2bbb", "paragraph"], ["C3ccc", "ordered"],
        ["Kid4", "bullet"], ["E5eee", "ordered"], ["Q6quote", "paragraph"], ["Q7quote", "paragraph"], ["AfterGuard", "paragraph"],
      ]);
      expect(before[4].parent).toBe("C3ccc");
      await dragRange(page, body, ["A1aaa", 1], ["E5eee", 3], reverse);
      await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe("1aaa\nB2bbb\nC3ccc\nKid4\nE5e");
      await chooseType(page, command, reverse && (command === "paragraph" || command === "bullet" || command === "H2"));
      const after = await readRows(body);
      expect.soft(after.map(({ text, bold }) => [text, bold])).toEqual(before.map(({ text, bold }) => [text, bold]));
      expect.soft(structure([after[0], ...after.slice(-3)])).toEqual(structure([before[0], ...before.slice(-3)]));
      expect.soft(after.find(({ text }) => text === "Kid4")?.parent).toBe("C3ccc");
      const selected = after.slice(1, 6);
      if (command === "quote" || command === "callout") {
        expect.soft(selected.map(({ kind }) => kind)).toEqual(before.slice(1, 6).map(({ kind }) => kind));
        if (command === "quote") {
          expect.soft(selected.map(({ quote }) => quote)).toEqual(wordsGroup("A1aaa", 5));
          expect.soft(selected.filter(({ kind }) => kind === "ordered").map(({ number }) => number)).toEqual(["1.", "2."]);
        } else await expect.soft(body.locator("[data-callout]")).toHaveCount(1, { timeout: 1200 });
      } else {
        expect.soft(selected.map(({ kind }) => kind)).toEqual(command === "ordered" ? ["H1", "ordered", "ordered", "ordered", "ordered"] : wordsGroup(command, 5));
        if (command === "ordered") expect.soft(selected[0].number).toBe("1.");
        if (command.startsWith("H")) expect.soft(selected.map(({ number }) => number)).toEqual(["", "", "1.", "2.", "3."]);
      }
      await assertHistory(page, body, before, after);
    });
  }
}

function wordsGroup<T>(value: T, count: number) {
  return Array.from({ length: count }, () => value);
}

for (const reverse of [false, true]) {
  const direction = reverse ? "reverse" : "forward";
  test(`S12-EDGE ordinary offset zero ${direction} preserves the next block`, async ({ page }) => {
    const { body, before, words } = await openOrder(page, "TOH");
    await dragRange(page, body, [words[0], 1], [words[2], 0], reverse);
    await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe(`${words[0].slice(1)}\n${words[1]}`);
    await chooseType(page, "H2");
    const after = await readRows(body);
    expect.soft(content(after)).toEqual(content(before));
    expect.soft(after.map(({ kind }) => kind)).toEqual(["paragraph", "H2", "H2", "H1", "paragraph"]);
    await assertHistory(page, body, before, after);
  });

  test(`S12-EDGE entering a quote ${direction} converts its included children without unwrapping`, async ({ page }) => {
    const body = await seedBlank(page, boundaryQuote);
    const before = await readRows(body);
    await dragRange(page, body, ["OutsideText", 1], ["QuoteFirst", 3], reverse);
    await expect.poll(() => selectedText(body), { timeout: 1800 }).toContain("utsideText\nQuo");
    await chooseType(page, "H2");
    const after = await readRows(body);
    expect.soft(after.map(({ text }) => text)).toEqual(before.map(({ text }) => text));
    expect.soft(after.map(({ kind, quote }) => [kind, quote])).toEqual([
      ["paragraph", null], ["H2", null], ["H2", "QuoteFirst"], ["H2", "QuoteFirst"], ["paragraph", null],
    ]);
    await assertHistory(page, body, before, after);
  });

  test(`S12-EDGE partial quote selection ${direction} unwraps only the selected children`, async ({ page }) => {
    const body = await seedBlank(page, quoteSubset);
    const before = await readRows(body);
    await dragRange(page, body, ["QFirst", 2], ["QMiddle", 4], reverse);
    await expect.poll(async () => (await selectedText(body)) || await page.evaluate(() => document.getSelection()?.toString()), { timeout: 1800 }).toBe("irst\nQMid");
    await chooseType(page, "quote");
    const after = await readRows(body);
    expect.soft(after.map(({ text, bold }) => [text, bold])).toEqual(before.map(({ text, bold }) => [text, bold]));
    expect.soft(after.map(({ quote }) => quote)).toEqual([null, null, null, "QLast", null]);
    await assertHistory(page, body, before, after);
  });

  test(`S12-EDGE folded section through next heading at zero ${direction} includes hidden children`, async ({ page }) => {
    const body = await seedBlank(page, foldedFixture);
    const before = await readRows(body);
    await body.getByRole("button", { name: "FoldHead 章节" }).click();
    await expect(selectionLeaf(body, "ChildHead")).toHaveCount(0);
    await dragRange(page, body, ["LeadGuard", 2], ["NextHead", 0], reverse);
    await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe("adGuard\nFoldHead\nChildHead\nChildText");
    await chooseType(page, "bullet");
    const after = await readRows(body);
    expect.soft(after.map(({ text, kind }) => [text, kind])).toEqual([
      ["LeadGuard", "bullet"], ["FoldHead", "bullet"], ["ChildHead", "bullet"],
      ["ChildText", "bullet"], ["NextHead", "H1"], ["AfterGuard", "paragraph"],
    ]);
    await assertHistory(page, body, before, after);
  });
}

test("S12-EDGE whole document includes the final empty paragraph and preserves a soft line break", async ({ page }) => {
  const body = await seedBlank(page, '<p>First<strong>B</strong></p><p></p><p>Word<br>Soft</p><ol start="12"><li><p>NumTail</p></li></ol><p></p>');
  const before = await readRows(body);
  expect(before.map(({ text }) => text)).toEqual(["FirstB", "", "Word\nSoft", "NumTail", ""]);
  await selectionLeaf(body, "FirstB").click();
  await page.keyboard.press("ControlOrMeta+a");
  await page.keyboard.press("ControlOrMeta+a");
  await chooseType(page, "H2");
  const after = await readRows(body);
  expect.soft(content(after)).toEqual(content(before));
  expect.soft(after.map(({ kind }) => kind)).toEqual(wordsGroup("H2", 5));
  expect.soft(after.find(({ text }) => text === "NumTail")?.number).toBe("1.");
  await assertHistory(page, body, before, after);
});

for (const reverse of [false, true]) {
  const direction = reverse ? "reverse" : "forward";
  test(`S12-DETAIL ordered boundary at zero ${direction} preserves the unselected item`, async ({ page }) => {
    const body = await seedBlank(page, mixedFixture);
    const before = await readRows(body);
    await dragRange(page, body, ["A1aaa", 1], ["E5eee", 0], reverse);
    await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe("1aaa\nB2bbb\nC3ccc\nKid4");
    await chooseType(page, "H2");
    const after = await readRows(body);
    expect.soft(after.map(({ text, bold }) => [text, bold])).toEqual(before.map(({ text, bold }) => [text, bold]));
    expect.soft(after.slice(1, 6).map(({ kind }) => kind)).toEqual(["H2", "H2", "H2", "H2", "ordered"]);
    expect.soft(after.find(({ text }) => text === "E5eee")?.number).toBe("1.");
    await assertHistory(page, body, before, after);
  });

  test(`S12-DETAIL quote boundary at zero ${direction} includes both quote children`, async ({ page }) => {
    const body = await seedBlank(page, boundaryQuote);
    const before = await readRows(body);
    await dragRange(page, body, ["OutsideText", 1], ["QuoteFirst", 0], reverse);
    expect.soft(await selectedText(body)).toBe("utsideText\nQuoteFirst\nQuoteSecond");
    await chooseType(page, "H2");
    const after = await readRows(body);
    expect.soft(after.map(({ text }) => text)).toEqual(before.map(({ text }) => text));
    expect.soft(after.map(({ kind, quote }) => [kind, quote])).toEqual([
      ["paragraph", null], ["H2", null], ["H2", "QuoteFirst"], ["H2", "QuoteFirst"], ["paragraph", null],
    ]);
    await assertHistory(page, body, before, after);
  });

  test(`S12-DETAIL partial quote to bullets ${direction} retains the whole quote`, async ({ page }) => {
    const body = await seedBlank(page, quoteSubset);
    const before = await readRows(body);
    await dragRange(page, body, ["QFirst", 2], ["QMiddle", 4], reverse);
    await expect.poll(async () => (await selectedText(body)) || await page.evaluate(() => document.getSelection()?.toString()), { timeout: 1800 }).toBe("irst\nQMid");
    await chooseType(page, "bullet");
    const after = await readRows(body);
    expect.soft(after.map(({ text, bold }) => [text, bold])).toEqual(before.map(({ text, bold }) => [text, bold]));
    expect.soft(after.map(({ kind, quote }) => [kind, quote])).toEqual([
      ["paragraph", null], ["bullet", "QFirst"], ["bullet", "QFirst"], ["paragraph", "QFirst"], ["paragraph", null],
    ]);
    await assertHistory(page, body, before, after);
  });

  test(`S12-DETAIL selection ending in the folded heading ${direction} preserves hidden types`, async ({ page }) => {
    const body = await seedBlank(page, foldedFixture);
    const before = await readRows(body);
    await body.getByRole("button", { name: "FoldHead 章节" }).click();
    await expect(selectionLeaf(body, "ChildHead")).toHaveCount(0);
    await dragRange(page, body, ["LeadGuard", 2], ["FoldHead", 4], reverse);
    await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe("adGuard\nFold");
    await chooseType(page, "bullet", !reverse);
    const after = await readRows(body);
    expect.soft(after.map(({ text }) => text)).toEqual(before.map(({ text }) => text));
    expect.soft(after.map(({ kind }) => kind)).toEqual(["bullet", "bullet", "H2", "paragraph", "H1", "paragraph"]);
    await assertHistory(page, body, before, after);
  });
}

test("S12-DETAIL selection past a folded section includes the next heading", async ({ page }) => {
  const body = await seedBlank(page, foldedFixture);
  const before = await readRows(body);
  await body.getByRole("button", { name: "FoldHead 章节" }).click();
  await expect(selectionLeaf(body, "ChildHead")).toHaveCount(0);
  await dragRange(page, body, ["LeadGuard", 2], ["NextHead", 2]);
  await expect.poll(() => selectedText(body), { timeout: 1800 }).toBe("adGuard\nFoldHead\nChildHead\nChildText\nNe");
  await chooseType(page, "bullet");
  const after = await readRows(body);
  expect.soft(after.map(({ text }) => text)).toEqual(before.map(({ text }) => text));
  expect.soft(after.map(({ kind }) => kind)).toEqual([...wordsGroup("bullet", 5), "paragraph"]);
  await assertHistory(page, body, before, after);
});

test("S12-DETAIL Shift+Down twice includes the empty block and stops before the numbered item", async ({ page }) => {
  const body = await seedBlank(page, '<p>Firs<strong>t</strong></p><p></p><p>Word<br>Soft</p><ol start="12"><li><p>NumTail</p></li></ol>');
  const before = await readRows(body);
  const first = selectionLeaf(body, "First");
  await first.click();
  const { x, y } = await point(first, 1);
  await page.mouse.click(x, y);
  await page.keyboard.press("Shift+ArrowDown");
  await page.keyboard.press("Shift+ArrowDown");
  expect.soft(await selectedText(body)).toBe("irst\n\nW");
  await chooseType(page, "H9");
  const after = await readRows(body);
  expect.soft(after.map(({ text, bold }) => [text, bold])).toEqual(before.map(({ text, bold }) => [text, bold]));
  expect.soft(after.map(({ kind, number }) => [kind, number])).toEqual([["H9", ""], ["H9", ""], ["H9", ""], ["ordered", "12."]]);
  await assertHistory(page, body, before, after);
});
