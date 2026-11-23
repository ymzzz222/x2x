import { documentId, documentResponse, documentRpc, readDocumentJson } from "@/features/document-editor/collaboration/server/request";

export function GET(request: Request) {
  return documentResponse(request, (context) => documentRpc(context, "x2x_notifications", { p_read: null }));
}

export function POST(request: Request) {
  return documentResponse(request, async (context) => {
    const body = await readDocumentJson(request);
    return documentRpc(context, "x2x_notifications", { p_read: documentId(body.id) });
  });
}
