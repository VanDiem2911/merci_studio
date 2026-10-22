import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConceptBrowser } from "@/components/sites/merci/concept-browser";
import { CATEGORIES, getCategory } from "@/data/categories";
import { conceptsByCategory } from "@/data/concepts";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return { title: category.name, description: category.blurb };
}

export default async function CategoryPage({ params }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const concepts = conceptsByCategory(category.slug);
  return <ConceptBrowser concepts={concepts} title={category.name} blurb={category.blurb} category={category} />;
}
