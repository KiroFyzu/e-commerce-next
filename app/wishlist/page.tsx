import { auth, signOut } from "@/lib/auth";
import { getStorefrontCatalog } from "@/lib/catalog-query";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { WishlistView } from "@/components/site/WishlistView";

export default async function WishlistPage() {
  const [session, { catalog }] = await Promise.all([auth(), getStorefrontCatalog()]);

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
          <WishlistView products={catalog} />
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
