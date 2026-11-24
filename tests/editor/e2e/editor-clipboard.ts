import type { Locator } from "@playwright/test";

type ClipboardPayload = {
  text?: string;
  html?: string;
};

async function dispatchClipboard(
  target: Locator,
  type: "copy" | "cut" | "paste",
  payload: ClipboardPayload = {},
) {
  return target.evaluate((element, { type, payload }) => {
    const transfer = new DataTransfer();
    if (payload.text !== undefined) {
      transfer.setData("text/plain", payload.text);
    }
    if (payload.html !== undefined) {
      transfer.setData("text/html", payload.html);
    }

    const event = new ClipboardEvent(type, {
      clipboardData: transfer,
      bubbles: true,
      cancelable: true,
    });
    // Firefox discards the supplied DataTransfer for synthetic events.
    if (event.clipboardData !== transfer) {
      Object.defineProperty(event, "clipboardData", { value: transfer });
    }

    element.dispatchEvent(event);
    return {
      text: transfer.getData("text/plain"),
      html: transfer.getData("text/html"),
    };
  }, { type, payload });
}

export function copyClipboard(target: Locator) {
  return dispatchClipboard(target, "copy");
}

export async function cutClipboard(target: Locator) {
  await dispatchClipboard(target, "cut");
}

export async function pasteClipboard(target: Locator, payload: ClipboardPayload) {
  await dispatchClipboard(target, "paste", payload);
}
