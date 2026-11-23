import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import type { DocumentSelection } from "../../model/document-model";
import type { DocumentSession } from "../../model/document-session";
import { locateComment, makeCommentAnchor, type CommentAnchor } from "../model/comment-anchor";
import { DocumentAction, DocumentDialogHeader, DocumentIcon } from "../../view/document-header";
import headerStyles from "../../view/document-header.module.css";
import styles from "./shared-document.module.css";

type Comment = {
  id: string;
  parent: string | null;
  author: string;
  body: string;
  anchor: CommentAnchor | null;
  resolved: boolean;
  private: boolean;
  createdAt: string;
  reactions: { emoji: string; count: number; mine: boolean }[];
};
type Discussion = { comments: Comment[]; liked: boolean; likes: number; following: boolean; owner: string; creator: string; createdAt: string; updatedAt: string };
type Notice = { id: string; documentId: string; title: string; kind: string; anchor: string | null; blockAnchor?: string; read: boolean };

const emojis = ["👍", "❤️", "🎉", "👀"];

export function DocumentDiscussion({ client, id, session, selection, locate, canComment }: {
  client: SupabaseClient;
  id: string;
  session: DocumentSession;
  canComment: boolean;
  selection: DocumentSelection | null;
  locate: (range: DocumentSelection) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [data, setData] = useState<Discussion>();
  const [reply, setReply] = useState<string>();
  const [status, setStatus] = useState("");
  const [privateComment, setPrivate] = useState(false);
  const [posting, setPosting] = useState(false);
  const [draftRange, setDraftRange] = useState(selection);
  const path = "/" + id;

  useEffect(() => {
    const abort = new AbortController();
    function loadFromLink() {
      const comment = new URLSearchParams(location.hash.slice(1)).get("comment");
      if (!comment) return;
      if (!dialog.current?.open) dialog.current?.showModal();
      void documentRequest<Discussion>(client, path + "?view=discussion", undefined, abort.signal).then((result) => {
        if (abort.signal.aborted) return;
        setData(result);
        requestAnimationFrame(() => {
          const element = document.getElementById("comment-" + comment);
          element?.scrollIntoView({ block: "nearest" });
          element?.focus({ preventScroll: true });
          if (!element && !result.comments.some((item) => item.id === comment)) setStatus("此评论不可访问");
        });
      }).catch((error) => { if (!abort.signal.aborted) setStatus(documentErrorMessage(error, "无法打开评论")); });
    }
    window.addEventListener("hashchange", loadFromLink);
    loadFromLink();
    return () => { abort.abort(); window.removeEventListener("hashchange", loadFromLink); };
  }, [client, path]);

  async function refresh(change?: Record<string, unknown>) {
    setStatus("");
    setPosting(true);
    try {
      if (change) await documentRequest(client, path, { action: "discussion", ...change });
      setData(await documentRequest<Discussion>(client, path + "?view=discussion"));
      return true;
    } catch (error) {
      setStatus(documentErrorMessage(error, "评论或互动未保存"));
      return false;
    } finally { setPosting(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const target = fields.get("target");
    const anchor = target === "document" ? null : makeCommentAnchor(session, draftRange, target === "block");
    if (await refresh({ kind: "comment", text: fields.get("body"), comment: reply, anchor,
      private: privateComment, recipient: fields.get("recipient") })) {
      form.reset();
      setReply(undefined);
      setPrivate(false);
    }
  }

  function copyLink(comment: string) {
    const url = new URL("/editor/shared/" + id, location.origin);
    url.hash = "comment=" + comment;
    void navigator.clipboard.writeText(url.href).then(() => setStatus("已复制评论链接"), () => setStatus("无法复制评论链接"));
  }

  function renderComment(comment: Comment) {
    return <article id={"comment-" + comment.id} key={comment.id} tabIndex={-1} className={styles.comment}>
      <small>{comment.author} · {new Date(comment.createdAt).toLocaleString("zh-CN")}{comment.private && " · 私有评论"}</small>
      <p>{comment.body}</p>
      <div className={styles.actions}>{emojis.map((emoji) => {
        const reaction = comment.reactions.find((entry) => entry.emoji === emoji);
        return <button type="button" key={emoji} disabled={posting} aria-pressed={Boolean(reaction?.mine)}
          onClick={() => void refresh({ kind: "reaction", comment: comment.id, emoji, enabled: !reaction?.mine })}>{emoji} {reaction?.count ?? ""}</button>;
      })}</div>
    </article>;
  }

  return <>
    <DocumentAction><button type="button" aria-haspopup="dialog" onMouseDown={(event) => event.preventDefault()}
      onClick={() => { setDraftRange(selection); dialog.current?.showModal(); void refresh(); }}>评论与信息</button></DocumentAction>
    <dialog ref={dialog} aria-labelledby={title} className={styles.dialog}>
      <DocumentDialogHeader id={title}>评论与信息</DocumentDialogHeader>
      {data && <section className={styles.section}>
        <p>创建者 {data.creator} · 所有者 {data.owner} · {session.getBlocks().reduce((count, block) => count + block.text.length, 0).toLocaleString("zh-CN")} 字</p>
        <p>创建于 {new Date(data.createdAt).toLocaleString("zh-CN")} · 更新于 {new Date(data.updatedAt).toLocaleString("zh-CN")}</p>
        <div className={styles.actions}>
          <button type="button" aria-pressed={data.liked} disabled={posting}
            onClick={() => void refresh({ kind: "like", enabled: !data.liked })}>点赞 {data.likes}</button>
          <button type="button" disabled={posting} onClick={() => void refresh({ kind: "follow", enabled: !data.following })}>
            {data.following ? "取消关注" : "关注文档更新"}</button>
        </div>
      </section>}
      {canComment && <form className={styles.form} onSubmit={submit}>
        <label>{reply ? "回复评论" : "评论内容"}<textarea name="body" required maxLength={4000} rows={3} placeholder="@邮箱 提及协作者" /></label>
        {!reply && <>
          <label>评论位置<select name="target" defaultValue="document">
            <option value="document">全文</option>
            {draftRange && <option value="block">当前内容块</option>}
            {draftRange && (draftRange.anchor.blockId !== draftRange.focus.blockId || draftRange.anchor.offset !== draftRange.focus.offset) &&
              <option value="selection">选中文字</option>}
          </select></label>
          <label className={styles.actions}><input type="checkbox" checked={privateComment} onChange={(event) => setPrivate(event.currentTarget.checked)} />私有评论</label>
          {privateComment && <label>可见成员邮箱（可选）<input type="email" name="recipient" /></label>}
        </>}
        <div className={styles.actions}>
          <button type="submit" disabled={posting}>{reply ? "发送回复" : "发表评论"}</button>
          {reply && <button type="button" onClick={() => setReply(undefined)}>取消回复</button>}
        </div>
      </form>}
      <div className={styles.section} aria-label="评论列表">
        {data?.comments.filter((comment) => !comment.parent).map((comment) => <section key={comment.id} className={styles.section}>
          {renderComment(comment)}
          <div className={styles.actions}>
            {comment.anchor && <button type="button" onClick={() => {
              const range = locateComment(session, comment.anchor!);
              if (range) { dialog.current?.close(); locate(range); } else setStatus("原评论位置已失效");
            }}>定位原文</button>}
            {canComment && <button type="button" onClick={() => setReply(comment.id)}>回复</button>}
            <button type="button" disabled={posting} onClick={() => void refresh({ kind: "resolve", comment: comment.id, enabled: !comment.resolved })}>
              {comment.resolved ? "恢复评论" : "解决评论"}</button>
            <button type="button" onClick={() => copyLink(comment.id)}>复制评论链接</button>
          </div>
          {data.comments.filter((item) => item.parent === comment.id).map(renderComment)}
        </section>)}
      </div>
      <p role="status">{status}</p>
    </dialog>
  </>;
}

export function DocumentNotifications({ client }: { client: SupabaseClient }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const title = useId();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [message, setMessage] = useState("");
  function fetchNotices(id?: string) {
    void documentRequest<Notice[]>(client, "/notifications", id ? { id } : undefined)
      .then(setNotices, (error) => setMessage(documentErrorMessage(error, "无法读取通知")));
  }
  return <>
    <button type="button" aria-haspopup="dialog" onClick={() => { dialog.current?.showModal(); fetchNotices(); }}>通知</button>
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={title}>
      <DocumentDialogHeader id={title}>通知</DocumentDialogHeader>
      {!notices.length && <p>暂无通知</p>}
      <ul>{notices.map((notice) => <li key={notice.id}>
        <Link href={"/editor/shared/" + notice.documentId + (notice.anchor ? "#comment=" + notice.anchor : notice.blockAnchor ? "#" + notice.blockAnchor : "")}
          onClick={() => { fetchNotices(notice.id); dialog.current?.close(); }}>
          {notice.read ? "" : "未读 · "}{notice.title} · {notice.kind === "mentioned" || notice.kind === "block-mention" ? "提及了你" : notice.kind === "replied" ? "回复或分享了评论" : notice.kind === "reviewed" ? "更新了修订" : notice.kind === "access" ? "访问权限已变更" : "更新了正文"}
        </Link>
      </li>)}</ul>
      <p role="status">{message}</p>
    </dialog>
  </>;
}


export function PresentationComments({ client, id }: { client: SupabaseClient; id: string }) {
  const [shown, setShown] = useState(false);
  const [data, setData] = useState<Discussion>();
  const [message, setMessage] = useState("");
  const trigger = useRef<HTMLButtonElement>(null);
  return <div className={styles.meeting}>
    <button type="button" ref={trigger} aria-expanded={shown} onClick={() => {
      setShown(!shown);
      if (!shown) void documentRequest<Discussion>(client, "/" + id + "?view=discussion")
        .then(setData, () => setMessage("无法读取评论"));
    }}>演示评论</button>
    {shown && <section aria-label="演示评论" className={styles.meetingPanel}>
      <header className={styles.row}><h2>演示评论</h2>
        <button type="button" className={headerStyles.iconButton} aria-label="关闭演示评论" title="关闭演示评论"
          onClick={() => { setShown(false); trigger.current?.focus(); }}><DocumentIcon name="close" /></button>
      </header>
      {data?.comments.map((comment) => <p key={comment.id}>{comment.author} · {comment.body}</p>)}
      {data?.comments.length === 0 && <p>暂无评论</p>}
      {message && <p role="status">{message}</p>}
    </section>}
  </div>;
}
