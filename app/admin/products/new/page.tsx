import { AdminHeader } from "@/components/admin/AdminHeader";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <>
      <AdminHeader
        title="Tambah Produk"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produk", href: "/admin/products" },
          { label: "Tambah Produk" },
        ]}
      />
      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <ProductForm mode="create" />
        </div>
      </main>
    </>
  );
}
