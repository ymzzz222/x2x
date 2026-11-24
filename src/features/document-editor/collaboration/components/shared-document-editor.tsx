"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import EditorLab from "../../editor-lab";
import { DocumentSession } from "../../model/document-session";
import { projectCompatibleBlocks } from "../../model/document-projection";
import { documentErrorMessage, documentRequest, readDocument, SharedDocumentError } from "../client/client";
import { DocumentChannel } from "../client/document-channel";
import { DocumentOutbox } from "../client/outbox";
import { canEditDocument, collaboratorColor, decodeUpdate, sharedSchemaVersion, type DocumentRead, type OnlineCollaborator } from "../model/protocol";
import { outboxScope, SharedDocumentSync, type DocumentConnection } from "../client/sync";
import { DocumentSharing } from "./document-sharing";
import { allows } from "../model/protection";
import { insertDocumentReference } from "../model/comment-anchor";
import { DocumentReferences } from "./document-references";
import { DocumentMeeting } from "./document-meeting";
import { DocumentProtection } from "./document-protection";
import { DocumentSuggestions } from "./document-suggestions";
import { DocumentDiscussion, PresentationComments } from "./document-discussion";
import { DocumentVersions } from "./document-versions";
import { DocumentAction } from "../../view/document-header";
import styles from "./shared-document.module.css";

const statusLabels = {
  saving: "正在保存",
  saved: "云端已保存",
  offline: "离线，改动保留在本机",
  retry: "暂未同步，正在重试",
  blocked: "待同步受阻",
  "local-error": "本机保存失败",
};

type CurrentDocument = { session: DocumentSession; connection: DocumentConnection; storageUnavailable?: true };

function DocumentAvatars({ user, peers }: { user: User; peers: readonly OnlineCollaborator[] }) {
  const online = peers.length >= 2;
  const others = online ? peers.filter((peer) => peer.id !== user.id) : [];
  const self = { id: user.id, name: user.is_anonymous ? "admin" : user.email?.split("@")[0] ?? "当前用户" };
  const overflow = others.slice(3);
  const overflowNames = overflow.map((peer) => peer.name).join("、");
  return <div className={styles.avatars} role={online ? "group" : undefined}
    aria-label={online ? "在线协作者" : undefined} aria-description={online ? `${peers.length} 人在线` : undefined}>
    {[self, ...others.slice(0, 3)].map((peer) => {
      const label = peer.id === user.id ? `${peer.name}（本人）` : peer.name;
      return <span key={peer.id} className={styles.avatar} role="img" aria-label={label} title={label}
        style={online ? { "--avatar-color": collaboratorColor(peer.id) } as CSSProperties : undefined}>
        <Image src="/document-avatar.jpg" alt="" width={32} height={32} unoptimized />
      </span>;
    })}
    {overflow.length > 0 && <span className={styles.avatarMore} role="img" aria-label={`其他在线协作者 ${overflowNames}`}
      title={overflowNames}>+{overflow.length}</span>}
  </div>;
}

export function SharedDocumentEditor({ client, user, id }: { client: SupabaseClient; user: User; id: string }) {
  const [current, setCurrent] = useState<CurrentDocument | null>(null);
  const [message, setMessage] = useState("");
  const [canRequestAccess, setCanRequestAccess] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState<string | undefined>();
  const [attempt, setAttempt] = useState(0);
  const actor = user.id;
  const syncRef = useRef<SharedDocumentSync>(null);
  const peers = current?.connection.peers;
  const collaborators = useMemo(() => peers?.filter((peer) => peer.id !== actor && peer.cursor), [actor, peers]);

  useEffect(() => {
    function onShareLink() {
      if (!new URLSearchParams(window.location.hash.slice(1)).has("share")) return;
      setCurrent(null);
      setPassword(undefined);
      setMessage("");
      setAttempt((previous) => previous + 1);
    }
    window.addEventListener("hashchange", onShareLink);
    return () => window.removeEventListener("hashchange", onShareLink);
  }, []);

  useEffect(() => {
    const abort = new AbortController();
    const cursorSession = crypto.randomUUID();
    let disposed = false;
    const timeout = window.setTimeout(() => abort.abort(), 30_000);
    let accessTimer: number | undefined;
    let readOnlyChannel: DocumentChannel | undefined;
    let outbox: DocumentOutbox | undefined;
    let session: DocumentSession | undefined;
    let sync: SharedDocumentSync | undefined;

    function reload() {
      setCurrent(null);
      setAttempt((previous) => previous + 1);
    }

    function watchReadOnly(meta: DocumentRead) {
      let running = false;
      let queued = false;
      let delay = 1_000;
      async function revalidate() {
        if (abort.signal.aborted) return;
        if (running) { queued = true; return; }
        running = true;
        window.clearTimeout(accessTimer);
        try {
          const next = await readDocument(client, id, meta.generation, meta.cursor, abort.signal, actor);
          if (abort.signal.aborted) return;
          if (next.generation !== meta.generation || next.schema !== meta.schema || next.head !== meta.head ||
              next.accessVersion !== meta.accessVersion || next.role !== meta.role || next.title !== meta.title) {
            readOnlyChannel?.stop();
            readOnlyChannel = undefined;
            reload();
          } else {
            delay = 1_000;
            readOnlyChannel?.update(next);
          }
        } catch (error) {
          if (abort.signal.aborted) return;
          if (error instanceof SharedDocumentError && [401, 403, 404].includes(error.status)) {
            readOnlyChannel?.stop();
            readOnlyChannel = undefined;
            setCurrent(null);
            setCanRequestAccess(error.code === "ACCESS_DENIED");
            setMessage("文档访问权限已撤回");
          } else if (navigator.onLine && document.visibilityState === "visible") {
            accessTimer = window.setTimeout(() => void revalidate(), delay);
            delay = Math.min(delay * 2, 8_000);
          }
        } finally {
          running = false;
          if (queued) {
            queued = false;
            if (readOnlyChannel) void revalidate();
          }
        }
      }
      readOnlyChannel = new DocumentChannel({ client, refresh: () => void revalidate() });
      readOnlyChannel.start(meta);
    }

    async function load() {
      try {
        const token = new URLSearchParams(window.location.hash.slice(1)).get("share");
        if (token) {
          await documentRequest(client, "/" + id, { action: "redeem", token, password }, abort.signal, { actor });
          if (abort.signal.aborted) return;
          window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);
        }
        let meta = await readDocument(client, id, 0, -1, abort.signal, actor, cursorSession);
        const schema = meta.schema;
        if (schema < sharedSchemaVersion) throw new SharedDocumentError(409, "DOCUMENT_SCHEMA_UNSUPPORTED");
        if (!meta.snapshot) throw new Error("Missing document snapshot");
        const updates = [decodeUpdate(meta.snapshot)];
        const generation = meta.generation;
        const initialHead = meta.head;
        for (;;) {
          updates.push(...meta.updates.map((update) => decodeUpdate(update.data)));
          const cursor = meta.updates.at(-1)?.seq ?? meta.cursor;
          if (cursor >= initialHead) {
            meta = { ...meta, cursor, snapshot: null, updates: [] };
            break;
          }
          meta = await readDocument(client, id, generation, cursor, abort.signal, actor, cursorSession);
          if (meta.generation !== generation || meta.snapshot || meta.schema !== schema) {
            throw new SharedDocumentError(409, "DOCUMENT_VERSION_CHANGED");
          }
          const next = meta.updates[0];
          if (!next || meta.cursor !== cursor || next.seq !== cursor + 1) throw new SharedDocumentError(409, "DOCUMENT_BUSY");
        }
        if (disposed) return;
        if (abort.signal.aborted) throw new Error("Document load timed out");
        if (schema > sharedSchemaVersion) {
          const blocks = projectCompatibleBlocks(updates);
          if (!blocks.length) throw new SharedDocumentError(409, "DOCUMENT_SCHEMA_UNSUPPORTED");
          session = new DocumentSession(blocks);
          setRequiresPassword(false);
          setCurrent({ session, connection: { meta, status: "saved", peers: [], accessLost: false, previousEdits: false } });
          watchReadOnly(meta);
          return;
        }
        outbox = new DocumentOutbox();
        const waiting = await outbox.read(outboxScope(actor, id)).catch(() => undefined);
        if (disposed) return;
        if (abort.signal.aborted) throw new Error("Document load timed out");
        session = DocumentSession.fromUpdates(updates);
        if (!waiting) {
          setRequiresPassword(false);
          setCurrent({ session, storageUnavailable: true,
            connection: { meta, status: "local-error", peers: [], accessLost: false, previousEdits: false } });
          watchReadOnly(meta);
          return;
        }
        if (canEditDocument(meta.role)) session.applySharedUpdates(waiting.filter((entry) =>
          entry.generation === meta.generation && entry.schema === meta.schema).map((entry) => entry.data));
        setRequiresPassword(false);
        setCurrent({ session, connection: { meta, status: "saving", peers: [], accessLost: false, previousEdits: false } });
        sync = new SharedDocumentSync({
          client, actor, meta, session, outbox, cursorSession,
          isComposing: () => Boolean(document.querySelector('[data-composing="true"]')),
          report: (connection) => setCurrent((current) => current && { ...current, connection }),
          reload,
        });
        syncRef.current = sync;
        sync.start();
      } catch (error) {
        if (disposed) return;
        setRequiresPassword(error instanceof SharedDocumentError && error.code === "LINK_PASSWORD_REQUIRED");
        setCanRequestAccess(error instanceof SharedDocumentError && error.code === "ACCESS_DENIED");
        setMessage(documentErrorMessage(error, "无法打开文档"));
      } finally {
        window.clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      window.clearTimeout(accessTimer);
      abort.abort();
      readOnlyChannel?.stop();
      if (syncRef.current === sync) syncRef.current = null;
      if (sync) { sync.stop(); sync.closeOutbox(); }
      else outbox?.close();
      session?.destroy();
    };
  }, [client, actor, id, password, attempt]);

  function redeem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setPassword(String(new FormData(event.currentTarget).get("password")));
    setAttempt((previous) => previous + 1);
  }

  async function rename(title: string) {
    const sync = syncRef.current;
    try {
      if (!sync) throw new Error();
      await sync.rename(title);
    } catch (error) {
      throw new Error(documentErrorMessage(error, "无法保存标题，请重试"));
    }
  }

  if (!current || current.connection.accessLost) {
    return <main className={styles.workspace}>
      <nav className={styles.navigation}><Link href="/editor">文档列表</Link><Link href="/editor/shared">共享文档</Link></nav>
      <section className={styles.page}>
        {requiresPassword && <form className={styles.form} onSubmit={redeem}>
          <label>分享密码<input name="password" type="password" autoComplete="off" required /></label>
          <button type="submit" className={styles.primary}>打开文档</button>
        </form>}
        {canRequestAccess && <button type="button" onClick={() => {
          void documentRequest(client, "/" + id, { action: "request-access" })
            .then(() => { setCanRequestAccess(false); setMessage("访问申请已提交"); }, () => setMessage("无法提交访问申请"));
        }}>申请访问</button>}
        {message && !requiresPassword && !canRequestAccess && !current?.connection.accessLost && <button type="button"
          onClick={() => { setMessage(""); setAttempt((previous) => previous + 1); }}>重试打开</button>}
        <p role="status">{current?.connection.accessLost ? "文档访问权限已撤回 · 待同步受阻" : message || "正在读取文档"}</p>
      </section>
    </main>;
  }
  const { connection, session } = current;
  if (connection.meta.schema > sharedSchemaVersion || current.storageUnavailable) {
    const { meta } = connection;
    return <EditorLab key={id + ":" + meta.generation + ":" + meta.schema} mode="window" size={500000} shared={{
      session, title: meta.title, role: "view", id,
      copyAllowed: allows(meta.policy, "copy"), printAllowed: allows(meta.policy, "print"),
      watermark: meta.policy?.watermark ? (user.is_anonymous ? "admin" : user.email) : undefined,
      controls: <span role="status" className={styles.saveStatus}>{current.storageUnavailable
        ? "本地存储不可用，已只读打开云端文档" : "文档采用较新结构，已以只读方式打开"}</span>,
    }} />;
  }
  return <EditorLab key={id + ":" + connection.meta.generation} mode="window" size={500000} shared={{
    session, title: connection.meta.title, role: connection.meta.role, id, rename,
    collaborators,
    onCursor: (position) => syncRef.current?.setCursor(position),
    copyAllowed: allows(connection.meta.policy, "copy"), printAllowed: allows(connection.meta.policy, "print"),
    watermark: connection.meta.policy?.watermark ? (user.is_anonymous ? "admin" : user.email) : undefined,
    avatars: <DocumentAvatars user={user} peers={connection.peers} />,
    presentationComments: <PresentationComments client={client} id={id} />,
    discussion: (selection, locate, jump, onInsert) => <>
      {canEditDocument(connection.meta.role) && <DocumentReferences client={client} id={id} saved={connection.status === "saved"}
        insert={(text, url) => {
          const inserted = insertDocumentReference(session, selection, text, url);
          if (inserted) onInsert(inserted.position);
          return inserted?.position.blockId;
        }} />}
      <DocumentMeeting client={client} id={id} canPresent={canEditDocument(connection.meta.role)}
        canAnnotate={allows(connection.meta.policy, "comment")} jump={jump} />
      <DocumentDiscussion client={client} id={id} session={session} selection={selection} locate={locate}
        canComment={allows(connection.meta.policy, "comment")} />
      <DocumentSuggestions client={client} id={id} session={session} selection={selection}
        generation={connection.meta.generation} canWrite={canEditDocument(connection.meta.role)} saved={connection.status === "saved"} />
    </>,
    controls: <>
      <span role="status" className={styles.saveStatus}>{statusLabels[connection.status]}
        {connection.previousEdits && " · 本机保留了旧版本修改"}</span>
      {connection.meta.role === "manage" && <DocumentSharing client={client} id={id} owner={connection.meta.owner} />}
    </>,
    documentActions: <>
      <DocumentAction><Link href="/editor/shared" data-document-action-link="">共享文档</Link></DocumentAction>
      <DocumentProtection client={client} id={id} title={connection.meta.title} policy={connection.meta.policy}
        manage={connection.meta.role === "manage"} owner={connection.meta.owner} />
      <DocumentVersions client={client} id={id} canWrite={canEditDocument(connection.meta.role)} saved={connection.status === "saved"} />
    </>,
  }} />;
}
