import { formatIDR } from "@/lib/catalog-data";
import { FLAT_SHIPPING_COST } from "@/lib/checkout-config";
import type { CartLine } from "@/lib/cart-query";

export function OrderSummary({ cart }: { cart: CartLine[] }) {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const shipping = cart.length > 0 ? FLAT_SHIPPING_COST : 0;
  const total = subtotal + shipping;

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-ink-soft">
        <span>Subtotal</span>
        <span>{formatIDR(subtotal)}</span>
      </div>
      <div className="flex justify-between text-ink-soft">
        <span>Ongkos Kirim</span>
        <span>{formatIDR(shipping)}</span>
      </div>
      <div className="flex justify-between border-t border-line pt-2 text-base font-semibold text-ink">
        <span>Total</span>
        <span>{formatIDR(total)}</span>
      </div>
    </div>
  );
}
