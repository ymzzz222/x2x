import type { Metadata } from "next";
import { SharedDocumentWorkspace } from "@/features/document-editor/collaboration/components/shared-document-workspace";

export const metadata: Metadata = { title: "共享文档 · X2X" };

export default function SharedDocumentsPage() {
  return <SharedDocumentWorkspace />;
}
