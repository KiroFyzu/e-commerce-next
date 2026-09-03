import { auth, signOut } from "@/lib/auth";
import { getStorefrontCatalog } from "@/lib/catalog-query";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { PromoBanner } from "@/components/site/PromoBanner";
import { ProductCatalogSection } from "@/components/site/ProductCatalogSection";
import { ProductRow } from "@/components/site/ProductRow";
import { Footer } from "@/components/site/Footer";

export default async function HomePage() {
  const [session, { catalog, trending, newArrivals }] = await Promise.all([
    auth(),
    getStorefrontCatalog(),
  ]);

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
          <Hero />

          {trending.length > 0 && (
            <ProductRow
              id="pria"
              eyebrow="Terlaris"
              title="Produk Trending"
              subtitle="Pilihan yang paling banyak dicari minggu ini."
              products={trending}
            />
          )}

          <PromoBanner />

          <ProductCatalogSection products={catalog} />

          {newArrivals.length > 0 && (
            <ProductRow
              id="koleksi-terbaru"
              eyebrow="Baru Tiba"
              title="Koleksi Terbaru"
              subtitle="Item terbaru yang baru saja masuk ke katalog kami."
              products={newArrivals}
            />
          )}
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
