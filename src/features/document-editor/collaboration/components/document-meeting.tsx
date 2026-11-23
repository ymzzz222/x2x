import { useEffect, useEffectEvent, useRef, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { documentErrorMessage, documentRequest } from "../client/client";
import { getViewportAnchor, type MeetingPosition } from "../../view/document-view-controls";
import { DocumentAction, DocumentIcon } from "../../view/document-header";
import headerStyles from "../../view/document-header.module.css";
import styles from "./shared-document.module.css";

type Meeting = {
  room: string;
  presenter: string;
  ownInstance: boolean;
  position: MeetingPosition;
  annotations: { id: string; author: string; body: string; position: MeetingPosition }[];
};

export function DocumentMeeting({ client, id, canPresent, canAnnotate, jump }: {
  client: SupabaseClient;
  id: string;
  canPresent: boolean;
  canAnnotate: boolean;
  jump: (position: MeetingPosition) => void;
}) {
  const [instance] = useState(() => crypto.randomUUID());
  const [active, setActive] = useState(false);
  const [showAnnotations, setShowAnnotations] = useState(false);
  const [room, setRoom] = useState<Meeting | null>(null);
  const [following, setFollowing] = useState(false);
  const [message, setMessage] = useState("");
  const lastPosition = useRef<MeetingPosition>(null);
  const annotationsTrigger = useRef<HTMLButtonElement>(null);
  const path = "/" + id;

  const received = useEffectEvent((incoming: Meeting | null) => {
    setRoom(incoming);
    if (!incoming || incoming.ownInstance) { setFollowing(false); return; }
    const previous = lastPosition.current;
    if (following && (incoming.position.blockId !== previous?.blockId || incoming.position.withinRow !== previous?.withinRow)) {
      lastPosition.current = incoming.position;
      jump(incoming.position);
    }
  });

  useEffect(() => {
    if (!active) return;
    const abort = new AbortController();
    let requesting = false;
    async function check() {
      if (requesting || document.visibilityState === "hidden") return;
      requesting = true;
      try {
        const update = await documentRequest<Meeting | null>(client, path + "?view=meeting&instance=" + instance, undefined, abort.signal);
        if (!abort.signal.aborted) received(update);
      } catch { if (!abort.signal.aborted) setMessage("无法读取演示状态"); }
      finally { requesting = false; }
    }
    void check();
    const interval = window.setInterval(() => void check(), 1300);
    return () => { abort.abort(); window.clearInterval(interval); };
  }, [active, client, path, instance]);

  const owns = room?.ownInstance;
  useEffect(() => {
    if (!owns) return;
    const abort = new AbortController();
    let timer = 0;
    function publish() {
      const scroller = document.querySelector<HTMLElement>("[data-presentation-viewport]") ?? document.getElementById("document-body");
      const position = getViewportAnchor(scroller);
      if (position) void documentRequest(client, path, { action: "meeting", kind: "move", instance, position }, abort.signal)
        .catch(() => { if (!abort.signal.aborted) setMessage("演示位置暂未同步"); });
    }
    function scroll(event: Event) {
      if (!(event.target instanceof Element) || !event.target.matches("#document-body, [data-presentation-viewport]")) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(publish, 200);
    }
    document.addEventListener("scroll", scroll, { passive: true, capture: true });
    const pulse = window.setInterval(publish, 6500);
    return () => {
      abort.abort();
      document.removeEventListener("scroll", scroll, true);
      window.clearTimeout(timer);
      window.clearInterval(pulse);
    };
  }, [client, instance, owns, path]);

  async function change(kind: "start" | "stop" | "annotate", text?: FormDataEntryValue | null) {
    setMessage("");
    try {
      const position = getViewportAnchor(document.getElementById("document-body"));
      const next = await documentRequest<Meeting | null>(client, path, { action: "meeting", kind, instance, position, text });
      setRoom(next);
    } catch (error) { setMessage(documentErrorMessage(error, "无法更新演示状态")); }
  }

  function annotate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void change("annotate", new FormData(form).get("annotation")).then(() => form.reset());
  }

  return <div className={styles.meeting} aria-label="演示协作">
    {!active ? <DocumentAction><button type="button" onClick={() => setActive(true)}>演示协作</button></DocumentAction> : <>
      <button type="button" onClick={() => {
        if (owns) void change("stop");
        setActive(false); setFollowing(false); setShowAnnotations(false); setRoom(null);
      }}>退出演示协作</button>
      {!room && canPresent && <button type="button" onClick={() => void change("start")}>共享当前位置</button>}
      {room && !owns && <button type="button" aria-pressed={following} onClick={() => {
        if (!following) { lastPosition.current = room.position; jump(room.position); }
        setFollowing(!following);
      }}>{following ? "自由浏览" : "跟随共享者"}</button>}
      {room && <button type="button" ref={annotationsTrigger} aria-expanded={showAnnotations} onClick={() => setShowAnnotations(!showAnnotations)}>会中标注</button>}
      {room && <span>{room.presenter} 正在共享</span>}
      {room && showAnnotations && <section className={styles.meetingPanel} aria-label="会中标注">
        <header className={styles.row}><h2>会中标注</h2>
          <button type="button" className={headerStyles.iconButton} aria-label="关闭会中标注" title="关闭会中标注"
            onClick={() => { setShowAnnotations(false); annotationsTrigger.current?.focus(); }}><DocumentIcon name="close" /></button>
        </header>
        {canAnnotate && <form className={styles.form} onSubmit={annotate}>
          <label>当前位置的标注<textarea name="annotation" rows={2} required maxLength={500} /></label>
          <button type="submit">发送标注</button>
        </form>}
        <ul>{room.annotations.map((note) => <li key={note.id}>
          {note.author} · {note.body} <button type="button" onClick={() => jump(note.position)}>定位</button>
        </li>)}</ul>
      </section>}
    </>}
    {message && <span role="status">{message}</span>}
  </div>;
}
