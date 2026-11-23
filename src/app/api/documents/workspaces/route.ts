import { checkedEmail, documentId, documentResponse, documentRpc, DocumentRequestError, readDocumentJson } from "@/features/document-editor/collaboration/server/request";

export function GET(request: Request) {
  return documentResponse(request, (context) => documentRpc(context, "x2x_workspaces"));
}

export function POST(request: Request) {
  return documentResponse(request, async (context) => {
    const body = await readDocumentJson(request);
    const action = body.action;
    if (action === "screen-rights") {
      return documentRpc(context, "x2x_screen_rights", { p_workspace: documentId(body.workspace), p_email: checkedEmail(body.email) });
    }
    if (action !== "create" && action !== "new-group" && action !== "workspace-member" && action !== "group-member" && action !== "defaults") {
      throw new DocumentRequestError(400, "UNKNOWN_ACTION");
    }
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if ((action === "create" || action === "new-group") && (!name || name.length > 120)) {
      throw new DocumentRequestError(400, "INVALID_TITLE");
    }
    if (action === "new-group" && body.kind !== "group" && body.kind !== "department") {
      throw new DocumentRequestError(400, "INVALID_GROUP");
    }
    if (action === "defaults" && ![null, "view", "edit"].includes(body.role as string | null)) {
      throw new DocumentRequestError(400, "INVALID_ROLE");
    }
    if ((action === "workspace-member" || action === "group-member") && typeof body.enabled !== "boolean") {
      throw new DocumentRequestError(400, "INVALID_MEMBERSHIP");
    }
    const id = await documentRpc(context, "x2x_change_workspace", {
      p_action: action,
      p_workspace: action !== "create" ? documentId(body.workspace) : null,
      p_name: name || null,
      p_kind: action === "new-group" ? body.kind : null,
      p_group: action === "group-member" ? documentId(body.group) : null,
      p_parent: action === "new-group" && body.parent ? documentId(body.parent) : null,
      p_email: action === "workspace-member" || action === "group-member" ? checkedEmail(body.email) : null,
      p_role: action === "defaults" ? body.role : null,
      p_enabled: body.enabled ?? null,
    });
    return { id };
  });
}
