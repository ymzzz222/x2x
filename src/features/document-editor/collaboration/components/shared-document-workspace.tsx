"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { documentRoleLabels, type Workspace } from "../model/protocol";
import { sampleSizes } from "../../model/document-model";
import { DocumentAccountForm, useDocumentAccount } from "./document-account";
import { DocumentListStatus, useDocumentCreation, useDocumentList } from "./document-list-requests";
import { SharedDocumentEditor } from "./shared-document-editor";
import { DocumentNotifications } from "./document-discussion";
import { WorkspaceManagement } from "./workspace-management";
import { SharedVersion } from "./document-versions";
import styles from "./shared-document.module.css";

export function SharedDocumentWorkspace({ id, version }: { id?: string; version?: string }) {
  const auth = useDocumentAccount();

  if (auth?.session && id) {
    if (version) return <SharedVersion key={auth.session.user.id + id + version} id={id} client={auth.client} version={version}
      email={auth.session.user.is_anonymous ? "admin" : auth.session.user.email} />;
    return <SharedDocumentEditor key={auth.session.user.id + id} id={id} client={auth.client} user={auth.session.user} />;
  }
  return <main className={styles.workspace} lang="zh-CN">
    <nav className={styles.navigation}><Link href="/editor">文档列表</Link><Link href="/editor/shared">共享文档</Link></nav>
    <section className={styles.page} aria-labelledby="workspace-title">
      <h1 id="workspace-title">共享文档</h1>
      {auth === undefined && <p role="status">正在读取登录状态</p>}
      {auth === null && <p role="status">共享文档服务尚未配置。</p>}
      {auth && (auth.session ? <DocumentList key={auth.session.user.id} client={auth.client} session={auth.session} />
        : <DocumentAccountForm client={auth.client} />)}
    </section>
  </main>;
}

function DocumentList({ client, session }: { client: SupabaseClient; session: Session }) {
  const [spaces, setSpaces] = useState<Workspace[]>([]);
  const [message, setMessage] = useState("");
  const actor = session.user.id;
  const documents = useDocumentList(client, actor);
  const creation = useDocumentCreation(client, actor, "workspace");
  const pending = creation.pending;

  useEffect(() => {
    const abort = new AbortController();
    void documentRequest<Workspace[]>(client, "/workspaces", undefined, abort.signal, { actor }).then((workspaces) => {
      if (!abort.signal.aborted) setSpaces(workspaces);
    }, (error) => {
      if (!abort.signal.aborted) setMessage(documentErrorMessage(error, "无法读取工作区"));
    });
    return () => abort.abort();
  }, [client, actor]);

  function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const sample = sampleSizes.find((size) => String(size) === fields.get("sample")) ?? "empty";
    void creation.create({ title: String(fields.get("title") ?? ""), sample, workspace: String(fields.get("workspace") ?? "") });
  }

  return <>
    <p className={styles.account}>{session.user.is_anonymous ? "admin" : session.user.email} <button type="button" onClick={() => void client.auth.signOut()}>退出登录</button></p>
    <DocumentNotifications client={client} />
    <WorkspaceManagement client={client} spaces={spaces} onChange={setSpaces} />
    {pending ? <button type="button" disabled={creation.busy} onClick={() => void creation.create(pending)}>
      {creation.busy ? "正在创建" : `重试创建 ${pending.title}`}
    </button> : <form className={styles.form} onSubmit={create}>
      {spaces.length > 0 && <label>保存到<select name="workspace"><option value="">个人文档</option>
        {spaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name}</option>)}
      </select></label>}
      <label>文档标题<input name="title" required maxLength={120} /></label>
      <label>初始内容<select name="sample" defaultValue="empty">
        <option value="empty">空白文档</option>
        <option value="100000">10 万字样本</option>
        <option value="300000">30 万字样本</option>
        <option value="500000">50 万字样本</option>
      </select></label>
      <button type="submit" className={styles.primary} disabled={creation.busy}>创建文档</button>
    </form>}
    <p role="status">{creation.message || message}</p>
    <ul className={styles.documents} aria-busy={documents.loading}>
      {documents.items.map((item) => <li key={item.id}>
        <Link href={"/editor/shared/" + item.id} prefetch={false}>{item.title}</Link><span>{documentRoleLabels[item.role]}</span>
      </li>)}
    </ul>
    <DocumentListStatus list={documents} />
  </>;
}
