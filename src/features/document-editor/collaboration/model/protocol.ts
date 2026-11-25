import type { SampleSize } from "../../model/document-model";
import type { ProtectionPolicy } from "./protection";

export type DocumentCursor = { blockId: string; encoded: string; generation: number };
export type OnlineCollaborator = { id: string; name: string; cursor?: DocumentCursor | null };
export type DocumentCursorUpdate = {
  id: string;
  session: string;
  cursor: DocumentCursor | null;
  revision: number | null;
};
export type DocumentPresenceEntry = DocumentCursorUpdate & { name: string };

const collaboratorColors = ["#1d4ed8", "#6d28d9", "#047857", "#a21caf", "#9a3412", "#be123c"];

export function collaboratorColor(id: string) {
  const hash = id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0);
  return collaboratorColors[hash % collaboratorColors.length];
}

export const sharedSchemaVersion = 1;
export const maximumUpdateBytes = 2_200_000;
export const maximumRealtimeUpdateChars = 65_536;

export type DocumentRole = "view" | "edit" | "manage";

export type DocumentSummary = {
  id: string;
  title: string;
  role: DocumentRole;
  updatedAt: string;
};

export type DocumentPage = { items: DocumentSummary[]; nextCursor: string | null };
export type DocumentCreateInput = { title: string; sample?: SampleSize | "empty"; workspace?: string };

export type CommittedUpdate = { seq: number; data: string };
export type DocumentUpdateNotice = { cursor: number; generation: number; schema: number; data: string };
export type DocumentRead = DocumentSummary & {
  owner: boolean;
  generation: number;
  schema: number;
  head: number;
  cursor: number;
  accessVersion: number;
  realtimeReady?: true;
  presenceProof?: string;
  snapshot: string | null;
  policy?: ProtectionPolicy;
  updates: CommittedUpdate[];
};

export type SavedUpdate = { seq: number; savedAt: string };

export type WorkspaceGroup = { id: string; name: string; kind: "group" | "department"; parent: string | null; members: string[] };

export type Workspace = {
  id: string;
  name: string;
  owner: boolean;
  members: string[];
  groups: WorkspaceGroup[];
  defaultRole: "view" | "edit" | null;
};

export type ShareSettings = {
  members: { email: string; role: DocumentRole }[];
  link: { role: Exclude<DocumentRole, "manage">; protected: boolean } | null;
  workspace: {
    workspace: string | null;
    inheritedRole: "view" | "edit" | null;
    groups: { id: string; name: string; role: "view" | "edit" | null }[];
    requests: { email: string }[];
  };
};

export type OfflineBatch = {
  id: string;
  scope: string;
  generation: number;
  schema: number;
  createdAt: number;
  data: Uint8Array;
};

export function encodeUpdate(bytes: Uint8Array) {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }
  return btoa(binary);
}

export function decodeUpdate(data: string) {
  return Uint8Array.from(atob(data), (character) => character.charCodeAt(0));
}

export const documentRoleLabels: Record<DocumentRole, string> = {
  view: "阅读者",
  edit: "编辑者",
  manage: "管理者",
};

export function canEditDocument(role: DocumentRole) {
  return role === "edit" || role === "manage";
}
