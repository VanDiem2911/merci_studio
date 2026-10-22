import { PanGrid, type GridItem } from "@/components/sites/merci/pan-grid";
import { getCategory } from "@/data/categories";
import { CONCEPTS, coverOf } from "@/data/concepts";
import { SITE } from "@/data/site";

export default function Home() {
  const items: GridItem[] = CONCEPTS.map((c) => ({
    key: c.slug,
    href: `/concept/${c.slug}`,
    name: c.name,
    meta: getCategory(c.category)?.short,
    image: coverOf(c),
  }));
  return (
    <main>
      <h1 className="visually-hidden">
        {SITE.name}, {SITE.descriptor}
      </h1>
      <PanGrid items={items} />
    </main>
  );
}
