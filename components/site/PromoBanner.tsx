import Image from "next/image";

export function PromoBanner() {
  return (
    <section id="sale" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl bg-ink">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=70"
            alt=""
            fill
            className="object-cover opacity-40"
          />
        </div>
        <div className="relative flex flex-col items-start gap-5 px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <span className="rounded-full bg-gold px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
            Waktu Terbatas
          </span>
          <h2 className="max-w-lg font-serif text-3xl text-white sm:text-4xl lg:text-5xl">
            End of Season Sale, Diskon hingga 50%
          </h2>
          <p className="max-w-md text-sm text-white/80 sm:text-base">
            Berlaku untuk koleksi pakaian &amp; sepatu pilihan, selama
            persediaan masih ada. Jangan sampai kehabisan.
          </p>
          <a
            href="#produk-unggulan"
            className="mt-2 inline-flex items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
          >
            Belanja Diskon
          </a>
        </div>
      </div>
    </section>
  );
}
