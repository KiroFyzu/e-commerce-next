import { auth, signOut } from "@/lib/auth";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CartView } from "@/components/site/CartView";

export default async function CartPage() {
  const session = await auth();

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
          <CartView />
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
