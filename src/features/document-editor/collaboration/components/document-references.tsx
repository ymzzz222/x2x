import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import type { DocumentSummary } from "../model/protocol";
import { DocumentAction, DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

export function DocumentReferences({ client, id, saved, insert }: {
  client: SupabaseClient;
  id: string;
  saved: boolean;
  insert: (text: string, url?: string) => string | undefined;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [pending, setPending] = useState<{ email: string; block: string }>();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!saved || !pending) return;
    const abort = new AbortController();
    void documentRequest(client, "/" + id, { action: "mention", ...pending }, abort.signal)
      .then(() => { if (!abort.signal.aborted) { setPending(undefined); setMessage("提及通知已发送"); } },
        (error) => { if (!abort.signal.aborted) { setPending(undefined); setMessage(documentErrorMessage(error, "无法发送提及通知")); } });
    return () => abort.abort();
  }, [client, id, pending, saved]);

  function mention(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim().toLowerCase();
    dialog.current?.close();
    const block = insert("@" + email + " ");
    if (block) { setPending({ email, block }); setMessage("等待正文保存后发送提及"); }
    else setMessage("请先在正文中定位光标");
  }

  function reference(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const document = documents.find((entry) => entry.id === new FormData(event.currentTarget).get("id"));
    if (!document) return;
    dialog.current?.close();
    const inserted = insert(document.title, new URL("/editor/shared/" + document.id, location.origin).href);
    setMessage(inserted ? "文档引用已插入" : "请先在正文中定位光标");
  }

  return <>
    <DocumentAction><button type="button" aria-haspopup="dialog" onMouseDown={(event) => event.preventDefault()} onClick={() => {
      dialog.current?.showModal();
      void documentRequest<DocumentSummary[]>(client).then(setDocuments, () => setMessage("无法读取可引用的文档"));
    }}>提及与引用</button></DocumentAction>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
      <DocumentDialogHeader id={title}>提及与引用</DocumentDialogHeader>
      <form onSubmit={mention} className={styles.form}>
        <label>提及协作者邮箱<input type="email" name="email" required /></label>
        <button type="submit" disabled={!saved || Boolean(pending)}>插入提及</button>
      </form>
      <form onSubmit={reference} className={styles.form}>
        <label>引用可访问的文档<select name="id" required>
          <option value="">选择文档</option>{documents.map((entry) => <option key={entry.id} value={entry.id}>{entry.title}</option>)}
        </select></label>
        <button type="submit">插入文档引用</button>
      </form>
    </dialog>
    {message && <span role="status" className={styles.saveStatus}>{message}</span>}
  </>;
}
