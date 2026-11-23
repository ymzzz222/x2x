import { useId, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { documentRoleLabels, type DocumentRole, type ShareSettings } from "../model/protocol";
import { DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

export function DocumentSharing({ client, id, owner }: { client: SupabaseClient; id: string; owner: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [settings, setSettings] = useState<ShareSettings | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const path = "/" + id;

  async function request(change?: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      if (change) {
        const result = await documentRequest<{ token?: string | null }>(client, path, change);
        if (change.action === "link") {
          const url = new URL("/editor/shared/" + id, location.origin);
          url.hash = result.token ? "share=" + result.token : "";
          setGeneratedLink(result.token ? url.href : "");
        }
      }
      setSettings(await documentRequest<ShareSettings>(client, path + "?view=sharing"));
      if (change) setMessage("分享设置已保存");
    } catch (error) {
      setMessage(documentErrorMessage(error, "无法更新分享设置"));
    } finally {
      setBusy(false);
    }
  }

  function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void request({ action: "member", email: data.get("email"), role: data.get("role") });
  }

  function submitLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void request({ action: "link", role: data.get("role"), password: data.get("password") });
  }

  function transfer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    if (window.confirm("将文档所有权转给 " + email + "？")) void request({ action: "transfer", email });
  }

  return <>
    <button type="button" className={styles.primary} data-document-share="" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); void request(); }}>分享</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
      <DocumentDialogHeader id={title}>分享与权限</DocumentDialogHeader>
      <section className={styles.section} aria-label="成员权限">
        <h3>成员权限</h3>
        <form className={styles.form} onSubmit={submitMember}>
          <label>成员邮箱<input name="email" type="email" required maxLength={254} autoComplete="off" /></label>
          <label>成员角色<select name="role" defaultValue="view">
            <option value="view">阅读者</option><option value="edit">编辑者</option>
            {owner && <option value="manage">管理者</option>}
          </select></label>
          <button type="submit" disabled={busy}>授权成员</button>
        </form>
        <ul>{settings?.members.map((member) => {
          const canManage = owner || member.role !== "manage";
          return <li key={member.email} className={styles.row}>
            <span>{member.email}</span>
            <select aria-label={member.email + " 的角色"} value={member.role} disabled={busy || !canManage}
              onChange={(event) => void request({ action: "member", email: member.email, role: event.currentTarget.value as DocumentRole })}>
              <option value="view">阅读者</option><option value="edit">编辑者</option>
              {(owner || member.role === "manage") && <option value="manage">管理者</option>}
            </select>
            <button type="button" disabled={busy || !canManage} aria-label={"撤回 " + member.email + " 的访问权限"}
              onClick={() => void request({ action: "member", email: member.email, role: null })}>撤回</button>
          </li>;
        })}</ul>
      </section>
      <section className={styles.section} aria-label="链接分享">
        <h3>链接分享</h3>
        {settings?.link && <p>{documentRoleLabels[settings.link.role]}{settings.link.protected ? " · 密码访问" : " · 登录后访问"}</p>}
        <form className={styles.form} onSubmit={submitLink}>
          <label>链接权限<select name="role" defaultValue="view"><option value="view">可阅读</option><option value="edit">可编辑</option></select></label>
          <label>访问密码（可选）<input name="password" type="password" autoComplete="new-password" maxLength={72} /></label>
          <div className={styles.actions}>
            <button type="submit" disabled={busy}>{settings?.link ? "更新分享链接" : "生成分享链接"}</button>
            {settings?.link && <button type="button" disabled={busy} onClick={() => void request({ action: "link", role: null })}>停止链接分享</button>}
          </div>
        </form>
        {generatedLink && <div className={styles.actions}>
          <input aria-label="分享链接" readOnly value={generatedLink} />
          <button type="button" onClick={() => void navigator.clipboard.writeText(generatedLink).then(
            () => setMessage("已复制分享链接"), () => setMessage("无法复制，请选择链接文字手动复制"),
          )}>复制链接</button>
        </div>}
      </section>
      {settings?.workspace.workspace && <section className={styles.section} aria-label="工作区权限">
        <h3>{settings.workspace.workspace} · 工作区权限</h3>
        <label>继承工作区权限 <select value={settings.workspace.inheritedRole ?? ""} disabled={busy}
          onChange={(event) => void request({ action: "workspace-rights", role: event.currentTarget.value || null })}>
          <option value="">关闭继承</option><option value="view">阅读者</option><option value="edit">编辑者</option>
        </select></label>
        {settings.workspace.groups.map((group) => <label key={group.id}>{group.name} 的访问权限 <select value={group.role ?? ""} disabled={busy}
          onChange={(event) => void request({ action: "workspace-rights", group: group.id, role: event.currentTarget.value || null })}>
          <option value="">未授权</option><option value="view">阅读者</option><option value="edit">编辑者</option>
        </select></label>)}
      </section>}
      {settings?.workspace.requests.length ? <section className={styles.section}>
        <h3>访问申请</h3>
        {settings.workspace.requests.map(({ email }) => <div className={styles.row} key={email}>
          <span>{email}</span><button type="button" disabled={busy}
            onClick={() => void request({ action: "member", email, role: "view" })}>同意阅读</button>
        </div>)}
      </section> : null}
      {owner && <form className={styles.form} onSubmit={transfer}>
        <label>新所有者的邮箱<input name="email" type="email" maxLength={254} required /></label>
        <button type="submit" disabled={busy}>转移所有权</button>
      </form>}
      <p role="status">{message}</p>
    </dialog>
  </>;
}
