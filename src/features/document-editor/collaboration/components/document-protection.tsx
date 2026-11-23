import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { allows, auditLabels, classificationLabels, permissionLabels, permissions, type ProtectionPolicy } from "../model/protection";
import { DocumentAction, DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

export function DocumentProtection({ client, id, title, policy, manage, owner }: {
  client: SupabaseClient; id: string; title: string; policy: ProtectionPolicy | undefined; manage: boolean; owner: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<ProtectionPolicy>();
  const router = useRouter();
  const current = settings ?? policy;
  const path = "/" + id;

  async function save(update: Record<string, unknown>) {
    setBusy(true);
    try {
      setSettings(await documentRequest<ProtectionPolicy>(client, path, { action: "protection", ...update }));
      setMessage("数据保护设置已保存");
    } catch (error) { setMessage(documentErrorMessage(error, "无法保存数据保护设置")); }
    finally { setBusy(false); }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const rules = Object.fromEntries(["view", "edit"].map((role) => [role,
      Object.fromEntries(permissions.map((permission) => [permission, fields.has(role + ":" + permission)])),
    ]));
    void save({ kind: "settings", classification: fields.get("classification"), rules,
      watermark: fields.has("watermark"), externalShare: fields.has("externalShare") });
  }

  async function exportContents(action: "download" | "duplicate") {
    setBusy(true);
    try {
      const result = await documentRequest<{ text?: string; id?: string }>(client, path, { action });
      if (result.id) router.push("/editor/shared/" + result.id);
      if (result.text !== undefined) {
        const blob = URL.createObjectURL(new Blob([result.text], { type: "text/plain;charset=utf-8" }));
        const link = document.createElement("a");
        link.href = blob;
        link.download = title + ".txt";
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(blob), 1000);
      }
    } catch (error) { setMessage(documentErrorMessage(error, "无法完成操作")); }
    finally { setBusy(false); }
  }

  return <>
    <DocumentAction><button type="button" aria-haspopup="dialog" onClick={() => { setSettings(policy); setMessage(""); dialog.current?.showModal(); }}>文档权限</button></DocumentAction>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={heading}>
      <DocumentDialogHeader id={heading}>文档权限</DocumentDialogHeader>
      <p>当前密级 {classificationLabels[current?.classification ?? "normal"]}</p>
      <div className={styles.actions}>
        <button type="button" disabled={busy || !allows(policy, "download")} onClick={() => void exportContents("download")}>下载正文</button>
        <button type="button" disabled={busy || !allows(policy, "duplicate")} onClick={() => void exportContents("duplicate")}>创建副本</button>
        <button type="button" disabled={!allows(policy, "print")} onClick={() => { dialog.current?.close(); window.print(); }}>打印</button>
      </div>
      {manage && current && <form className={styles.form} onSubmit={submit} key={JSON.stringify([current.classification, current.rules, current.watermark, current.externalShare])}>
        <label>设置密级<select name="classification" defaultValue={current.classification}>
          {Object.entries(classificationLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select></label>
        <label><input type="checkbox" name="watermark" defaultChecked={current.watermark} />显示访问者水印</label>
        <label><input type="checkbox" name="externalShare" defaultChecked={current.externalShare} />允许外部分享链接</label>
        {(["view", "edit"] as const).map((role) => <fieldset className={styles.section} key={role}>
          <legend>{role === "view" ? "阅读者" : "编辑者"}</legend>
          {permissions.map((permission) => <label key={permission} className={styles.actions}>
            <input type="checkbox" name={role + ":" + permission} defaultChecked={current.rules[role]?.[permission] ?? true} />
            {permissionLabels[permission]}
          </label>)}
        </fieldset>)}
        <button type="submit" disabled={busy}>保存权限设置</button>
      </form>}
      {current?.approval && <div className={styles.actions}>
        <p>待审批降级为 {classificationLabels[current.approval]}</p>
        {owner && <>
          <button type="button" onClick={() => void save({ kind: "approve" })} disabled={busy}>批准</button>
          <button type="button" onClick={() => void save({ kind: "decline" })} disabled={busy}>拒绝</button>
        </>}
      </div>}
      {manage && current && <section className={styles.section}>
        <h3>访问及审计</h3>
        <p>访问者 {current.accessCount ?? 0} 人</p>
        <ul>{current.audit.map((event) => <li key={event.id}>
          {event.author} · {auditLabels[event.operation] ?? event.operation} · {new Date(event.at).toLocaleString("zh-CN")}
        </li>)}</ul>
      </section>}
      <p role="status">{message}</p>
    </dialog>
  </>;
}
