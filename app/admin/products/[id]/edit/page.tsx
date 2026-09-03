import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getProductById } from "@/lib/admin/products-query";
import { ProductForm } from "../../ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <>
      <AdminHeader
        title="Edit Produk"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin" },
          { label: "Produk", href: "/admin/products" },
          { label: product.name },
        ]}
      />
      <main className="flex-1 p-4 sm:p-6">
        <div className="mx-auto max-w-4xl">
          <ProductForm mode="edit" initialProduct={product} />
        </div>
      </main>
    </>
  );
}
