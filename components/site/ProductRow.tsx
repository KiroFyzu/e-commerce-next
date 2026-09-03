import type { Product } from "@/lib/catalog-data";
import { ProductCard } from "@/components/site/ProductCard";

export function ProductRow({
  id,
  eyebrow,
  title,
  subtitle,
  products,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  products: Product[];
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">{title}</h2>
          {subtitle && <p className="mt-2 max-w-lg text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
