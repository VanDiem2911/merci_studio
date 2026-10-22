import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GalleryViewer } from "@/components/sites/merci/gallery-viewer";
import { adjacentConcepts, CONCEPTS, getConcept } from "@/data/concepts";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bo-suu-tap/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return {};
  return { title: `${concept.name} | Bộ sưu tập ảnh`, description: concept.tagline };
}

export default async function GalleryViewerPage({ params }: PageProps<"/bo-suu-tap/[slug]">) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();
  const { prev, next } = adjacentConcepts(concept.slug);
  return <GalleryViewer concept={concept} prev={prev} next={next} />;
}
