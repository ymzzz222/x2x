import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest, readDocument } from "../client/client";
import { allows, type ProtectionPolicy } from "../model/protection";
import { decodeUpdate } from "../model/protocol";
import { DocumentSession } from "../../model/document-session";
import EditorLab from "../../editor-lab";
import { DocumentAction, DocumentDialogHeader } from "../../view/document-header";
import styles from "./shared-document.module.css";

type Version = { id: string; name: string; author: string; createdAt: string; generation: number; seq: number };
type Activity = { id: string; author: string; savedAt: string; generation: number; seq: number };
type History = { versions: Version[]; activity: Activity[] };

const versionHref = (id: string, version: string) => "/editor/shared/" + id + "?version=" + version;

export function DocumentVersions({ client, id, canWrite, saved }: { client: SupabaseClient; id: string; canWrite: boolean; saved: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [changes, setChanges] = useState<{ name: string; total: number; rows: { id: string; before: string; after: string }[] }>();
  const [history, setHistory] = useState<History>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const path = "/" + id;

  async function load(change?: Record<string, unknown>) {
    setBusy(true);
    setMessage("");
    try {
      if (change) await documentRequest(client, path, change);
      setHistory(await documentRequest<History>(client, path + "?view=history"));
      if (change) setMessage(change.action === "restore" ? "历史版本已还原" : "版本已保存");
    } catch (error) {
      setMessage(documentErrorMessage(error, "无法读取或更新版本"));
    } finally { setBusy(false); }
  }

  async function compare(version: Version) {
    setBusy(true);
    setMessage("");
    const sessions: DocumentSession[] = [];
    try {
      const [old, first] = await Promise.all([
        documentRequest<{ snapshot: string }>(client, path + "?view=history&version=" + version.id),
        readDocument(client, id, 0, -1),
      ]);
      if (!first.snapshot) throw new Error("Snapshot missing");
      const before = DocumentSession.fromUpdates([decodeUpdate(old.snapshot)]);
      const after = DocumentSession.fromUpdates([decodeUpdate(first.snapshot)]);
      sessions.push(before, after);
      let page = first;
      for (;;) {
        after.applySharedUpdates(page.updates.map((update) => decodeUpdate(update.data)));
        const cursor = page.updates.at(-1)?.seq ?? page.cursor;
        if (cursor >= page.head) break;
        page = await readDocument(client, id, page.generation, cursor);
        if (page.snapshot) throw new Error("Document changed");
      }
      const oldBlocks = new Map(before.getBlocks().map((block) => [block.id, block.text]));
      const newBlocks = new Map(after.getBlocks().map((block) => [block.id, block.text]));
      const changed = [...new Set([...oldBlocks.keys(), ...newBlocks.keys()])].filter((id) => oldBlocks.get(id) !== newBlocks.get(id));
      setChanges({ name: version.name, total: changed.length, rows: changed.slice(0, 20).map((id) => ({
        id, before: oldBlocks.get(id) ?? "", after: newBlocks.get(id) ?? "",
      })) });
    } catch { setMessage("无法比较版本，请稍后重试"); }
    finally { sessions.forEach((session) => session.destroy()); setBusy(false); }
  }

  function nameVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load({ action: "version", name: new FormData(event.currentTarget).get("name") });
  }

  return <>
    <DocumentAction><button type="button" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); void load(); }}>版本历史</button></DocumentAction>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
      <DocumentDialogHeader id={title}>版本历史</DocumentDialogHeader>
      {canWrite && <form className={styles.form} onSubmit={nameVersion}>
        <label>版本名称<input name="name" required maxLength={120} /></label>
        <button type="submit" disabled={busy || !saved}>保存版本</button>
      </form>}
      <ul aria-label="已命名版本">{history?.versions.map((version) => <li key={version.id} className={styles.row}>
        <div>
          <Link href={versionHref(id, version.id)}>{version.name}</Link>
          <small> · {version.author} · {new Date(version.createdAt).toLocaleString("zh-CN")}</small>
        </div>
        <button type="button" disabled={busy} onClick={() => void compare(version)}>比较正文</button>
        <button type="button" onClick={() => void navigator.clipboard.writeText(new URL(versionHref(id, version.id), location.origin).href)
          .then(() => setMessage("已复制版本链接"), () => setMessage("无法复制版本链接"))}>复制版本链接</button>
        {canWrite && <button type="button" disabled={busy || !saved} onClick={() => {
          if (window.confirm("还原到「" + version.name + "」？当前云端内容会先备份。")) void load({ action: "restore", version: version.id });
        }}>还原</button>}
      </li>)}</ul>
      {changes && <section className={styles.section} aria-label="正文版本差异">
        <h3>{changes.name} 与当前正文 · {changes.total} 处变化</h3>
        {changes.total > changes.rows.length && <p>显示前 {changes.rows.length} 处</p>}
        {changes.rows.map((row) => <p className={styles.comment} key={row.id}><del>{row.before}</del><ins>{row.after}</ins></p>)}
      </section>}
      <section className={styles.section}>
        <h3>最近保存</h3>
        <ul>{history?.activity.map((activity) => <li key={activity.generation + ":" + activity.id}>
          {activity.author} · {new Date(activity.savedAt).toLocaleString("zh-CN")}
        </li>)}</ul>
      </section>
      <p role="status">{message}</p>
    </dialog>
  </>;
}

export function SharedVersion({ client, id, version, email }: { client: SupabaseClient; id: string; version: string; email?: string }) {
  const [snapshot, setSnapshot] = useState<{ session: DocumentSession; title: string; policy: ProtectionPolicy }>();
  const [message, setMessage] = useState("正在读取历史版本");

  useEffect(() => {
    const abort = new AbortController();
    let session: DocumentSession | undefined;
    void documentRequest<{ name: string; title: string; snapshot: string; policy: ProtectionPolicy }>(
      client, "/" + id + "?view=history&version=" + encodeURIComponent(version), undefined, abort.signal
    ).then((data) => {
      if (abort.signal.aborted) return;
      session = DocumentSession.fromUpdates([decodeUpdate(data.snapshot)]);
      setSnapshot({ session, title: data.title + " · " + data.name, policy: data.policy });
    }).catch((error) => {
      if (!abort.signal.aborted) setMessage(documentErrorMessage(error, "无法读取历史版本"));
    });
    return () => { abort.abort(); session?.destroy(); };
  }, [client, id, version]);
  if (!snapshot) return <main className={styles.page}><Link href={"/editor/shared/" + id}>回到正文</Link><p role="status">{message}</p></main>;
  return <EditorLab mode="window" size={500000} shared={{
    ...snapshot, id, role: "view", copyAllowed: allows(snapshot.policy, "copy"),
    printAllowed: allows(snapshot.policy, "print"), watermark: snapshot.policy.watermark ? email : undefined, controls: <Link href={"/editor/shared/" + id}>回到正文</Link>,
  }} />;
}
