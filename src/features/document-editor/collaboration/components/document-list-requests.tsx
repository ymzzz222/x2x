"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createDocumentRequest, documentErrorMessage, listDocumentPage, SharedDocumentError } from "../client/client";
import type { DocumentCreateInput, DocumentPage } from "../model/protocol";

type PageRequest = { cursor: string | null };
type ListState = DocumentPage & { request: PageRequest; error?: string };

export function useDocumentList(client: SupabaseClient, actor: string) {
  const [request, setRequest] = useState<PageRequest>({ cursor: null });
  const [state, setState] = useState<ListState>();

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    void listDocumentPage(client, actor, request.cursor, controller.signal).then((page) => {
      if (disposed) return;
      setState((previous) => {
        const items = new Map((request.cursor === null ? [] : previous?.items ?? []).map((item) => [item.id, item]));
        for (const item of page.items) items.set(item.id, item);
        return { request, items: [...items.values()], nextCursor: page.nextCursor };
      });
    }, (error: unknown) => {
      if (disposed) return;
      setState((previous) => ({ request, items: previous?.items ?? [], nextCursor: previous?.nextCursor ?? null,
        error: documentErrorMessage(error, "无法读取文档列表") }));
    }).finally(() => window.clearTimeout(timeout));
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [actor, client, request]);

  const loading = state?.request !== request;
  const error = loading ? undefined : state?.error;
  const nextCursor = state?.nextCursor ?? null;
  return {
    items: state?.items ?? [], loading, error, hasMore: nextCursor !== null,
    load: () => setRequest({ cursor: error ? request.cursor : nextCursor }),
  };
}

export function DocumentListStatus({ list, buttonClassName }: {
  list: ReturnType<typeof useDocumentList>;
  buttonClassName?: string;
}) {
  return <>
    {list.loading && <p>正在读取文档</p>}
    <p role="status">
      {list.error ?? (list.loading || list.items.length ? "" : "暂无文档")}
    </p>
    {(list.error || list.hasMore) && <button type="button" className={buttonClassName} disabled={list.loading}
      onClick={list.load}>{list.error ? "重试读取" : "加载更多"}</button>}
  </>;
}

type Creation = { key: string; input: DocumentCreateInput };

function readCreation(scope: string): Creation | null {
  try {
    const data = JSON.parse(sessionStorage.getItem(scope) ?? "null") as Creation | null;
    return typeof data?.key === "string" && typeof data.input?.title === "string" ? data : null;
  } catch { return null; }
}

export function useDocumentCreation(client: SupabaseClient, actor: string, entry: "list" | "workspace") {
  const scope = "x2x:document-create:" + actor + ":" + entry;
  const [pending, setPending] = useState(() => readCreation(scope));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const active = useRef<AbortController | null>(null);
  const router = useRouter();

  useEffect(() => () => {
    active.current?.abort();
    active.current = null;
  }, []);

  function remember(creation: Creation | null) {
    setPending(creation);
    try {
      if (creation) sessionStorage.setItem(scope, JSON.stringify(creation));
      else sessionStorage.removeItem(scope);
    } catch { /* The current view can still retry if storage is unavailable. */ }
  }

  async function create(input: DocumentCreateInput) {
    if (active.current) return;
    const creation = pending ?? { key: crypto.randomUUID(), input };
    const controller = new AbortController();
    active.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 20_000);
    let opened = false;
    remember(creation);
    setBusy(true);
    setMessage("");
    try {
      const { id } = await createDocumentRequest(client, actor, creation.input, creation.key, controller.signal);
      if (active.current !== controller) return;
      remember(null);
      router.push("/editor/shared/" + id);
      opened = true;
    } catch (error) {
      if (active.current !== controller) return;
      const rejected = error instanceof SharedDocumentError && [400, 403, 409, 410, 413, 422].includes(error.status);
      if (rejected) remember(null);
      setMessage(documentErrorMessage(error, rejected ? "无法创建文档" : "暂时无法确认是否已创建，可重试同一次创建"));
    } finally {
      window.clearTimeout(timeout);
      if (!opened && active.current === controller) {
        active.current = null;
        setBusy(false);
      }
    }
  }

  return { create, busy, pending: pending?.input, message };
}
