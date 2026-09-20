import ProductCard from "@/components/ProductCard";

type RelatedProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  priceCents: number;
  image: string;
  lookNumber: number;
  inStock: boolean;
};

export default function RelatedProducts({ products }: { products: RelatedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pb-24">
      <h2 className="font-display text-2xl italic mb-8 border-b border-line pb-4">
        Dans la même veine
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} {...p} listName="Produits similaires" />
        ))}
      </div>
    </section>
  );
}
