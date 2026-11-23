"use client";

import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DocumentAccountDialog, PublicDocumentSignIn, useDocumentAccount } from "../collaboration/components/document-account";
import { DocumentListStatus, useDocumentCreation, useDocumentList } from "../collaboration/components/document-list-requests";
import styles from "./document-list.module.css";

export function DocumentList({ publicAccess }: { publicAccess: boolean }) {
  const auth = useDocumentAccount();
  const session = auth?.session;
  const activeSession = session && (publicAccess || !session.user.is_anonymous) ? session : null;
  return <main className={styles.documentList} lang="zh-CN">
    {auth && activeSession ? <AuthenticatedList key={activeSession.user.id} client={auth.client} actor={activeSession.user.id}
      publicVisitor={activeSession.user.is_anonymous === true} /> : <>
      <header className={styles.listHeader}><h1>文档列表</h1></header>
      {auth === undefined && <p>正在读取登录状态</p>}
      {auth === null && <p role="status">文档服务尚未配置。</p>}
      {auth && (publicAccess ? <PublicDocumentSignIn client={auth.client} buttonClassName={styles.listLink} />
        : <DocumentAccountDialog client={auth.client} buttonClassName={styles.listLink} />)}
    </>}
  </main>;
}

function AuthenticatedList({ client, actor, publicVisitor }: { client: SupabaseClient; actor: string; publicVisitor: boolean }) {
  const documents = useDocumentList(client, actor);
  const creation = useDocumentCreation(client, actor, "list");
  return <>
    <header className={styles.listHeader}>
      <h1>文档列表</h1>
      <div className={styles.listActions}>
        <Link href="/editor/shared" className={styles.listLink} prefetch={false}>共享文档</Link>
        {!publicVisitor && <button type="button" className={styles.listLink} onClick={() => void client.auth.signOut({ scope: "local" })}>退出登录</button>}
        <button type="button" className={`${styles.listLink} ${styles.newLink}`} disabled={creation.busy}
          onClick={() => void creation.create({ title: "无标题文档" })}>
          {creation.busy ? "正在新增" : creation.pending ? "重试新增" : "新增"}
        </button>
      </div>
    </header>
    <p role="status">{creation.message}</p>
    {documents.items.length > 0 && <ul className={styles.sampleList} role="list" aria-busy={documents.loading}>
      {documents.items.map((item) => <li key={item.id} className={styles.listRow}>
        <span>{item.title}</span>
        <Link href={`/editor/shared/${item.id}`} className={styles.listLink} aria-label={`${item.title}详情`} prefetch={false}>
          详情
        </Link>
      </li>)}
    </ul>}
    <DocumentListStatus list={documents} buttonClassName={styles.listLink} />
  </>;
}
