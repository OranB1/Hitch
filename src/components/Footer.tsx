import Link from "next/link";

const FOOTER_NAV = [
  {
    label: "Opportunities",
    items: [
      { label: "Browse opportunities", href: "/marketplace" },
      { label: "Post an opportunity", href: "/marketplace/post" },
      { label: "See a demo", href: "/demo" },
    ],
  },
  {
    label: "Hitch",
    items: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t-[0.5px] border-graphite bg-void">
      <div className="mx-auto max-w-[1200px] px-6 py-12">
        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {FOOTER_NAV.map((category) => (
            <div key={category.label}>
              <h4 className="text-label font-[510] text-ash">{category.label}</h4>
              <ul className="mt-4 flex flex-col gap-3">
                {category.items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-body-sm text-mist transition-colors hover:text-paper">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-graphite pt-8 sm:flex-row sm:items-center">
          <span className="font-serif text-[17px] text-paper">Hitch</span>
          <p className="text-caption text-ash">© {new Date().getFullYear()} Hitch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
