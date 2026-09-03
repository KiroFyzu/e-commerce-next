import Link from "next/link";

const FOOTER_NAV = [
  {
    title: "Belanja",
    links: [
      { label: "Pria", href: "#pria" },
      { label: "Wanita", href: "#wanita" },
      { label: "Sepatu", href: "#sepatu" },
      { label: "Koleksi Terbaru", href: "#koleksi-terbaru" },
      { label: "Sale", href: "#sale" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Cara Belanja", href: "#" },
      { label: "Pengiriman", href: "#" },
      { label: "Pengembalian & Tukar Barang", href: "#" },
      { label: "Panduan Ukuran", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
  {
    title: "Perusahaan",
    links: [
      { label: "Tentang Kami", href: "#" },
      { label: "Karier", href: "#" },
      { label: "Kebijakan Privasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "#" },
  { label: "TikTok", href: "#" },
  { label: "Facebook", href: "#" },
  { label: "X", href: "#" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line-soft bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-serif text-2xl font-semibold text-ink">
              LUXE
            </Link>
            <p className="mt-3 max-w-xs text-sm text-ink-soft">
              Destinasi belanja pakaian dan sepatu premium. Kualitas terjamin,
              gaya yang tak lekang oleh waktu.
            </p>
            <div className="mt-5 space-y-1 text-sm text-ink-soft">
              <p>Jl. Fashion Raya No. 10, Jakarta Selatan</p>
              <p>halo@luxe.co.id</p>
              <p>+62 812-3456-7890</p>
            </div>
          </div>

          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-ink-soft hover:text-ink">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-line-soft pt-6 sm:flex-row">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} LUXE. Seluruh hak cipta dilindungi.
          </p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="text-xs font-medium text-ink-soft hover:text-ink"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
