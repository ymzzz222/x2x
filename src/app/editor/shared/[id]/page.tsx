import type { Metadata } from "next";
import { SharedDocumentWorkspace } from "@/features/document-editor/collaboration/components/shared-document-workspace";

export const metadata: Metadata = { title: "共享文档 · X2X" };

export default async function SharedDocumentPage({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ version?: string }>;
}) {
  return <SharedDocumentWorkspace id={(await params).id} version={(await searchParams).version} />;
}
