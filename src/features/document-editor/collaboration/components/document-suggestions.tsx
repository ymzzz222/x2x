import { useId, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { getSelectedText, type DocumentSelection } from "../../model/document-model";
import type { DocumentSession } from "../../model/document-session";
import { makeCommentAnchor, type CommentAnchor } from "../model/comment-anchor";
import { DocumentAction, DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

type Suggestion = {
  id: string;
  author: string;
  before: string;
  after: string;
  state: "pending" | "accepted" | "rejected" | "withdrawn";
  mine: boolean;
  replies: { id: string; author: string; body: string }[];
};
const states = { pending: "待处理", accepted: "已接受", rejected: "已拒绝", withdrawn: "已撤回" };

export function DocumentSuggestions({ client, id, session, selection, generation, canWrite, saved }: {
  client: SupabaseClient;
  id: string;
  session: DocumentSession;
  selection: DocumentSelection | null;
  generation: number;
  canWrite: boolean;
  saved: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [items, setItems] = useState<Suggestion[]>([]);
  const [draft, setDraft] = useState<{ before: string; anchor: CommentAnchor }>();
  const [form, setForm] = useState<{ suggestion: Suggestion; kind: "reply" | "revise" }>();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const path = "/" + id;

  async function refresh(change?: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      if (change) await documentRequest(client, path, { action: "suggestion", ...change });
      setItems(await documentRequest<Suggestion[]>(client, path + "?view=suggestions"));
      if (change) setMessage("修订已更新");
      return true;
    } catch (error) {
      setMessage(documentErrorMessage(error, "无法更新修订"));
      return false;
    } finally { setBusy(false); }
  }

  function open() {
    const before = selection ? getSelectedText(session.getBlocks(), selection) : "";
    const anchor = before ? makeCommentAnchor(session, selection, false) : null;
    setDraft(anchor && before.length <= 8000 ? { before, anchor } : undefined);
    dialog.current?.showModal();
    void refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const text = new FormData(element).get("text");
    const action = form ? { kind: form.kind, suggestion: form.suggestion.id, text } : { kind: "create", ...draft, generation, text };
    if (await refresh(action)) { element.reset(); setForm(undefined); setDraft(undefined); }
  }

  return <>
    <DocumentAction><button type="button" aria-haspopup="dialog" onMouseDown={(event) => event.preventDefault()} onClick={open}>修订</button></DocumentAction>
    <dialog ref={dialog} aria-labelledby={title} className={styles.dialog}>
      <DocumentDialogHeader id={title}>修订</DocumentDialogHeader>
      {(draft || form) && <form className={styles.form} onSubmit={submit} key={form ? form.kind + form.suggestion.id : "new"}>
        {draft && !form && <p>选区 <del>{draft.before}</del></p>}
        <label>{form?.kind === "reply" ? "回复内容" : "建议替换文字"}
          <textarea name="text" rows={3} maxLength={form?.kind === "reply" ? 4000 : 8000}
            defaultValue={form?.kind === "revise" ? form.suggestion.after : ""} required={form?.kind === "reply"} />
        </label>
        <div className={styles.actions}>
          <button type="submit" disabled={busy || (!form && !saved)}>{form?.kind === "reply" ? "发送修订回复" : "提交修订"}</button>
          {form && <button type="button" onClick={() => setForm(undefined)}>取消</button>}
        </div>
      </form>}
      {!draft && !form && <p>选择正文中的文字后打开修订，可提交替换或删除建议。</p>}
      {items.map((item) => <section key={item.id} className={styles.section}>
        <h3>{item.author} · {states[item.state]}</h3>
        <p className={styles.comment}><del>{item.before}</del><ins>{item.after || "（删除）"}</ins></p>
        {item.replies.map((reply) => <p key={reply.id}>{reply.author} · {reply.body}</p>)}
        {item.state === "pending" && <div className={styles.actions}>
          <button type="button" onClick={() => setForm({ suggestion: item, kind: "reply" })}>回复修订</button>
          {item.mine && <>
            <button type="button" onClick={() => setForm({ suggestion: item, kind: "revise" })}>修改建议</button>
            <button type="button" disabled={busy} onClick={() => void refresh({ kind: "withdraw", suggestion: item.id })}>撤回建议</button>
          </>}
          {canWrite && <>
            <button type="button" disabled={busy || !saved} onClick={() => void refresh({ kind: "accept", suggestion: item.id })}>接受修订</button>
            <button type="button" disabled={busy} onClick={() => void refresh({ kind: "reject", suggestion: item.id })}>拒绝修订</button>
          </>}
        </div>}
      </section>)}
      <p role="status">{message}</p>
    </dialog>
  </>;
}
