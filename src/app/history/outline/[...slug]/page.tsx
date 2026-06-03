import { MdPage } from "@/app/history/_components/md-page";
import { staticParams } from "@/app/history/_lib/fs";

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <MdPage section="outline" slug={slug} />;
}

export function generateStaticParams() {
  return staticParams("outline");
}
