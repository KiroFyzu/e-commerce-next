import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getCartForUser } from "@/lib/cart-query";
import { getAddressesForUser } from "@/lib/address-query";
import { StoreProvider } from "@/components/site/StoreProvider";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { CheckoutForm } from "@/components/site/CheckoutForm";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [cart, addresses] = await Promise.all([
    getCartForUser(session.user.id),
    getAddressesForUser(session.user.id),
  ]);
  if (cart.length === 0) redirect("/cart");

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
          <CheckoutForm addresses={addresses} />
        </main>

        <Footer />
      </div>
    </StoreProvider>
  );
}
