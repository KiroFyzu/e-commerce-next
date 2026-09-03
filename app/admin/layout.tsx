import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { AdminSidebarDesktop } from "@/components/admin/AdminSidebar";
import { MobileSidebarProvider } from "@/components/admin/MobileSidebarContext";
import { AdminSessionProvider } from "@/components/admin/AdminSessionContext";
import { ToastProvider } from "@/components/admin/ToastProvider";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    redirect("/");
  }

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  const sessionValue = {
    name: session.user?.name ?? session.user?.email ?? "Admin",
    email: session.user?.email ?? "",
    signOutAction,
  };

  return (
    <ToastProvider>
      <AdminSessionProvider value={sessionValue}>
        <MobileSidebarProvider>
          <div className="flex min-h-screen bg-stone-50">
            <AdminSidebarDesktop />
            <div className="flex min-w-0 flex-1 flex-col">{children}</div>
          </div>
        </MobileSidebarProvider>
      </AdminSessionProvider>
    </ToastProvider>
  );
}
