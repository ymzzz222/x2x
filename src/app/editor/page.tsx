import type { Metadata } from "next";
import { DocumentList } from "@/features/document-editor/library/document-list";
import { publicDocumentAccessEnabled } from "@/features/document-editor/collaboration/server/request";
import EditorLab from "@/features/document-editor/editor-lab";
import { sampleSizes } from "@/features/document-editor/model/document-model";

type EditorSearchParams = { new?: string; mode?: string; size?: string };
type EditorPageProps = { searchParams: Promise<EditorSearchParams> };

function isSampleRequest({ mode, size }: EditorSearchParams) {
  return mode !== undefined || size !== undefined;
}

export async function generateMetadata({ searchParams }: EditorPageProps): Promise<Metadata> {
  const params = await searchParams;
  if (params.new === "1") return { title: "无标题文档 · X2X" };
  return { title: isSampleRequest(params) ? "长文档原型 · X2X" : "文档列表 · X2X" };
}

export default async function EditorPage({ searchParams }: EditorPageProps) {
  const params = await searchParams;
  if (params.new === "1") return <EditorLab key="new" mode="window" />;
  if (isSampleRequest(params)) {
    const mode = params.mode === "full" ? "full" : "window";
    const size = sampleSizes.find((sample) => sample === Number(params.size)) ?? 500000;
    return <EditorLab key={mode + size} mode={mode} size={size} />;
  }

  return <DocumentList publicAccess={publicDocumentAccessEnabled()} />;
}
