import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConceptDetail } from "@/components/sites/merci/concept-detail";
import { getCategory } from "@/data/categories";
import { adjacentConcepts, CONCEPTS, getConcept } from "@/data/concepts";

export function generateStaticParams() {
  return CONCEPTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/concept/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) return {};
  const category = getCategory(concept.category);
  return {
    title: `${concept.name} | ${category?.name ?? "Concept"}`,
    description: `${concept.tagline}. ${concept.story}`,
    openGraph: { images: [{ url: concept.images[0].src, width: concept.images[0].width, height: concept.images[0].height }] },
  };
}

export default async function ConceptPage({ params }: PageProps<"/concept/[slug]">) {
  const { slug } = await params;
  const concept = getConcept(slug);
  if (!concept) notFound();
  const { prev, next } = adjacentConcepts(concept.slug);
  return <ConceptDetail concept={concept} prev={prev} next={next} />;
}
