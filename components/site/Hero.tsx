import Image from "next/image";
import { TruckIcon } from "@/components/icons";

export function Hero() {
  return (
    <section className="border-b border-line-soft bg-paper">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-8 lg:py-16">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Koleksi Musim Ini
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-[1.1] text-ink sm:text-5xl lg:text-6xl">
            Gaya yang Bicara
            <br />
            Tanpa Kata
          </h1>
          <p className="mt-5 max-w-md text-base text-ink-soft">
            Pakaian dan sepatu premium untuk gaya sehari-hari yang effortless.
            Material pilihan, jahitan rapi, desain yang tidak pernah lekang
            oleh waktu.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#produk-unggulan"
              className="inline-flex items-center justify-center rounded-full bg-ink px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              Belanja Sekarang
            </a>
            <a
              href="#koleksi-terbaru"
              className="inline-flex items-center justify-center rounded-full border border-line px-8 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
            >
              Lihat Koleksi Terbaru
            </a>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-ink-soft">
            <TruckIcon className="h-5 w-5 text-gold" />
            Gratis ongkir se-Indonesia untuk pembelian di atas Rp500.000
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-line-soft sm:aspect-[16/11] lg:aspect-[4/5]">
            <Image
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Model mengenakan koleksi fashion terbaru"
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
