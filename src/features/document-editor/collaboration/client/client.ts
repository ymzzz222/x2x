import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { DocumentCreateInput, DocumentPage, DocumentRead } from "../model/protocol";

export class SharedDocumentError extends Error {
  constructor(readonly status: number, readonly code: string) { super(code); }
}

let client: SupabaseClient | undefined;

export function sharedDocumentClient() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (url && key) client = createClient(url, key, { auth: { flowType: "pkce" } });
  return client;
}

export async function documentRequest<T>(
  client: SupabaseClient,
  path = "",
  body?: Record<string, unknown>,
  signal?: AbortSignal,
  options?: { actor: string; idempotencyKey?: string },
) {
  const { data } = await client.auth.getSession();
  if (!data.session || (options && data.session.user.id !== options.actor)) throw new SharedDocumentError(401, "LOGIN_REQUIRED");
  const response = await fetch("/api/documents" + path, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + data.session.access_token,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(options?.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new SharedDocumentError(response.status, typeof data?.error === "string" ? data.error : "REQUEST_FAILED");
  }
  const json = await response.json();
  return json as T;
}

export async function listDocumentPage(client: SupabaseClient, actor: string, cursor: string | null, signal: AbortSignal) {
  const query = new URLSearchParams({ limit: "30" });
  if (cursor !== null) query.set("cursor", cursor);
  const page = await documentRequest<DocumentPage>(client, "?" + query, undefined, signal, { actor });
  if (!Array.isArray(page?.items) || (page.nextCursor !== null && typeof page.nextCursor !== "string") ||
      (cursor !== null && page.nextCursor === cursor)) throw new SharedDocumentError(502, "INVALID_DOCUMENT_RESPONSE");
  return page;
}

export async function createDocumentRequest(client: SupabaseClient, actor: string, input: DocumentCreateInput,
  idempotencyKey: string, signal: AbortSignal) {
  const result = await documentRequest<{ id: string }>(client, "", input, signal, { actor, idempotencyKey });
  if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/.test(result?.id)) {
    throw new SharedDocumentError(502, "INVALID_DOCUMENT_RESPONSE");
  }
  return result;
}

export function readDocument(client: SupabaseClient, id: string, generation: number, after: number,
  signal?: AbortSignal, actor?: string, presenceSession?: string) {
  const query = new URLSearchParams({ generation: String(generation), after: String(after) });
  if (presenceSession) query.set("presenceSession", presenceSession);
  return documentRequest<DocumentRead>(client, "/" + id + "?" + query,
    undefined, signal, actor ? { actor } : undefined);
}

export const errorMessages: Record<string, string> = {
  LOGIN_REQUIRED: "请登录并验证邮箱后继续",
  ACCESS_DENIED: "你没有此文档的访问权限",
  WRITE_DENIED: "当前权限不允许同步修改",
  MANAGE_DENIED: "当前权限不允许管理分享",
  OWNER_REQUIRED: "这项操作需要文档所有者",
  OWNER_MEMBERSHIP: "所有者的权限可通过转移所有权修改",
  LINK_DISABLED: "此分享链接已停用",
  LINK_PASSWORD_REQUIRED: "请输入正确的分享密码",
  DOCUMENT_VERSION_CHANGED: "文档版本已更新，旧版本的待提交修改已保留在本机",
  DOCUMENT_SCHEMA_UNSUPPORTED: "此文档需要新版编辑器查看",
  SUGGESTION_OUTDATED: "原文字或版本发生了变化，当前修订无法应用",
  SUGGESTION_CLOSED: "此修订已处理",
  DOCUMENT_ACTION_DENIED: "当前权限不允许此操作",
  COMMENT_DENIED: "当前角色没有评论权限",
  EXTERNAL_SHARING_DISABLED: "此文档的密级或策略禁止外部链接",
  WORKSPACE_DENIED: "当前账号没有此工作区的操作权限",
  MENTION_NOT_SAVED: "请先等待正文保存，再发送提及通知",
  MENTION_REQUIRES_ACCESS: "被提及的账号需要先获得此文档的访问权限",
  PRESENTATION_ACTIVE: "已有协作者正在共享此文档",
  DOCUMENT_BUSY: "文档正在被修改，请稍后再试",
  VERSION_NOT_FOUND: "此历史版本不可访问",
  SNAPSHOT_TOO_LARGE: "当前文档超出版本快照大小限制",
  TRANSFER_REQUIRES_MEMBER: "请选择已经可以访问文档的成员",
  SUPABASE_NOT_CONFIGURED: "共享文档服务尚未配置",
  PUBLIC_DOCUMENTS_NOT_CONFIGURED: "公开文档库尚未配置",
  INVALID_TITLE: "请输入 1 至 120 字的文档标题",
  CREATE_KEY_REUSED: "本次创建请求的内容已变化，请重新新增",
  CREATED_DOCUMENT_GONE: "上次创建的文档已不存在",
};

export function documentErrorMessage(error: unknown, fallback: string) {
  return error instanceof SharedDocumentError ? errorMessages[error.code] ?? fallback : fallback;
}
