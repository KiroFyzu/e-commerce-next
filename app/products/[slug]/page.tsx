import { notFound } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog-query";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ProductRow } from "@/components/site/ProductRow";
import { ProductDetail } from "@/components/site/ProductDetail";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [session, product] = await Promise.all([auth(), getProductBySlug(slug)]);
  if (!product) notFound();

  const related = await getRelatedProducts(product.category, product.id);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <StoreProvider>
      <div className="flex min-h-screen flex-col bg-paper">
        <Navbar
          userName={session?.user?.name ?? session?.user?.email ?? "Pengguna"}
          isAdmin={session?.user?.role === "admin"}
          onSignOut={handleSignOut}
        />

        <main className="flex-1">
          <ProductDetail product={product} />

          {related.length > 0 && (
            <ProductRow
              id="produk-terkait"
              eyebrow="Rekomendasi"
              title="Produk Terkait"
              products={related}
            />
          )}
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
