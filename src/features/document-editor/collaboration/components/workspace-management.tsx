import { useId, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { documentRoleLabels, type DocumentRole, type Workspace } from "../model/protocol";
import { DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

export function WorkspaceManagement({ client, spaces, onChange }: {
  client: SupabaseClient;
  spaces: Workspace[];
  onChange: (spaces: Workspace[]) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [screening, setScreening] = useState<{ title: string; id: string; role: DocumentRole | null }[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const workspace = spaces.find((candidate) => candidate.id === selected) ?? spaces[0];

  async function change(update: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      const { id } = await documentRequest<{ id: string }>(client, "/workspaces", { workspace: workspace?.id, ...update });
      onChange(await documentRequest<Workspace[]>(client, "/workspaces"));
      if (update.action === "create") setSelected(id);
      setMessage("工作区设置已保存");
    } catch (error) { setMessage(documentErrorMessage(error, "无法保存工作区设置")); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>, action: string) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    void change({ ...fields, action, enabled: true });
  }

  function screen(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    void documentRequest<typeof screening>(client, "/workspaces", { action: "screen-rights", workspace: workspace?.id, email })
      .then(setScreening, (error) => setMessage(documentErrorMessage(error, "无法筛查工作区权限")));
  }

  return <>
    <button type="button" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}>工作区管理</button>
    <dialog ref={dialog} aria-labelledby={title} className={styles.dialog}>
      <DocumentDialogHeader id={title}>工作区管理</DocumentDialogHeader>
      <form className={styles.form} onSubmit={(event) => submit(event, "create")}>
        <label>工作区名称<input name="name" required maxLength={120} /></label>
        <button type="submit" disabled={busy}>新建工作区</button>
      </form>
      {workspace && <section className={styles.section}>
        <label>当前工作区 <select value={workspace.id} onChange={(event) => { setSelected(event.currentTarget.value); setScreening([]); }}>
          {spaces.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
        </select></label>
        {workspace.owner && <>
          <form className={styles.form} onSubmit={screen}>
            <label>筛查对象邮箱<input name="email" type="email" required /></label>
            <button type="submit">筛查文档权限</button>
          </form>
          <ul aria-label="权限筛查结果">{screening.map((result) => <li key={result.id}>
            {result.title} · {result.role ? documentRoleLabels[result.role] : "无权限"}
          </li>)}</ul>
          <label>新文档的组内默认权限 <select value={workspace.defaultRole ?? ""} disabled={busy}
            onChange={(event) => void change({ action: "defaults", role: event.currentTarget.value || null })}>
            <option value="">仅创建者</option><option value="view">成员可阅读</option><option value="edit">成员可编辑</option>
          </select></label>
          <form className={styles.form} onSubmit={(event) => submit(event, "workspace-member")}>
            <label>工作区成员邮箱<input name="email" type="email" required /></label>
            <button type="submit" disabled={busy}>添加工作区成员</button>
          </form>
          <ul>{workspace.members.map((email) => <li className={styles.row} key={email}>
            <span>{email}</span><button type="button" disabled={busy} onClick={() => void change({ action: "workspace-member", email, enabled: false })}>移除成员</button>
          </li>)}</ul>
          <form className={styles.form} onSubmit={(event) => submit(event, "new-group")}>
            <label>成员组名称<input name="name" required maxLength={120} /></label>
            <label>组类型<select name="kind"><option value="group">成员组</option><option value="department">部门</option></select></label>
            <label>所属上级<select name="parent"><option value="">无上级</option>
              {workspace.groups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
            </select></label>
            <button type="submit" disabled={busy}>创建成员组</button>
          </form>
          {workspace.groups.map((group) => <section className={styles.section} key={group.id}>
            <h3>{group.name} · {group.kind === "department" ? "部门" : "成员组"}</h3>
            <form className={styles.form} onSubmit={(event) => submit(event, "group-member")}>
              <input type="hidden" name="group" value={group.id} />
              <label>加入 {group.name}<select name="email" required>
                <option value="">选择成员</option>{workspace.members.map((email) => <option key={email}>{email}</option>)}
              </select></label>
              <button type="submit" disabled={busy}>添加组成员</button>
            </form>
            <ul>{group.members.map((email) => <li className={styles.row} key={email}>
              <span>{email}</span><button type="button" disabled={busy}
                onClick={() => void change({ action: "group-member", group: group.id, email, enabled: false })}>移出组</button>
            </li>)}</ul>
          </section>)}
        </>}
      </section>}
      <p role="status">{message}</p>
    </dialog>
  </>;
}
