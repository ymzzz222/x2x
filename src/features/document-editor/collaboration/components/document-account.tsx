"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { sharedDocumentClient } from "../client/client";
import { DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

export function useDocumentAccount() {
  const [auth, setAuth] = useState<{ client: SupabaseClient; session: Session | null } | null>();
  useEffect(() => {
    const client = sharedDocumentClient();
    if (!client) { queueMicrotask(() => setAuth(null)); return; }
    const { data } = client.auth.onAuthStateChange((_event, session) => setAuth({ client, session }));
    return () => data.subscription.unsubscribe();
  }, []);
  return auth;
}

let publicSignIn: Promise<void> | undefined;

function signInForPublicDocuments(client: SupabaseClient) {
  publicSignIn ??= (async () => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (data.session) return;
    const result = await client.auth.signInAnonymously();
    if (result.error) throw result.error;
    if (!result.data.session) throw new Error("Missing public document session");
  })().finally(() => { publicSignIn = undefined; });
  return publicSignIn;
}

export function PublicDocumentSignIn({ client, buttonClassName }: { client: SupabaseClient; buttonClassName?: string }) {
  const [attempt, setAttempt] = useState(0);
  const [failedAttempt, setFailedAttempt] = useState<number>();

  useEffect(() => {
    let disposed = false;
    void signInForPublicDocuments(client).catch(() => {
      if (!disposed) setFailedAttempt(attempt);
    });
    return () => { disposed = true; };
  }, [attempt, client]);

  const failed = failedAttempt === attempt;
  return <>
    {!failed && <p>正在连接公开文档</p>}
    <p role="status">{failed ? "暂时无法进入公开文档，请重试。" : ""}</p>
    {failed && <button type="button" className={buttonClassName} onClick={() => setAttempt((value) => value + 1)}>重试连接</button>}
  </>;
}

export function DocumentAccountDialog({ client, buttonClassName }: { client: SupabaseClient; buttonClassName?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();

  function open() {
    const element = dialog.current;
    if (!element || element.open) return;
    element.showModal();
    element.querySelector("input")?.focus();
  }

  useEffect(open, []);

  return <>
    <button type="button" aria-haspopup="dialog" className={buttonClassName} onClick={open}>
      登录或注册
    </button>
    <dialog ref={dialog} aria-labelledby={title} className={`${styles.dialog} ${styles.accountDialog}`}>
      <DocumentDialogHeader id={title} closeLabel="关闭登录弹窗">登录文档库</DocumentDialogHeader>
      <DocumentAccountForm client={client} />
    </dialog>
  </>;
}

export function DocumentAccountForm({ client }: { client: SupabaseClient }) {
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email")).trim();
    const password = String(form.get("password"));
    setBusy(true);
    try {
      const response = registering
        ? await client.auth.signUp({ email, password, options: { emailRedirectTo: new URL(window.location.pathname, window.location.origin).href } })
        : await client.auth.signInWithPassword({ email, password });
      setMessage(response.error ? (registering ? "注册失败，请核对邮箱和密码要求。" : "登录失败，请核对账号、密码和邮箱验证状态。")
        : registering && !response.data.session ? "验证邮件已发送，请在邮件中完成验证。" : "");
    } catch { setMessage("暂时无法连接登录服务。"); }
    finally { setBusy(false); }
  }

  return <form className={styles.form} onSubmit={submit}>
    <label>邮箱<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
    <label>密码<input name="password" type="password" autoComplete={registering ? "new-password" : "current-password"}
      required minLength={registering ? 8 : undefined} /></label>
    <div className={styles.actions}>
      <button type="submit" className={styles.primary} disabled={busy}>{registering ? "注册" : "登录"}</button>
      <button type="button" disabled={busy} onClick={() => { setRegistering(!registering); setMessage(""); }}>{registering ? "已有账号" : "注册账号"}</button>
    </div>
    <p role="status">{message}</p>
  </form>;
}
