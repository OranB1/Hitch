import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { Button } from "@/components/Button";
import MobileNav from "@/components/MobileNav";

const LINKS = [
  { href: "/marketplace", label: "Opportunities" },
  { href: "/demo", label: "See a demo" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default async function NavBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="relative border-b-[0.5px] border-graphite bg-void">
      <nav className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-serif text-[19px] text-paper">
          <svg width={26} height={26} viewBox="0 0 48 48" fill="none" className="shrink-0">
            <path d="M4 4L24 4L24 16L34 16L34 32L24 32L24 44L4 44Z" fill="#1c1712" />
            <path d="M24 4L44 4L44 44L24 44L24 32L34 32L34 16L24 16Z" fill="#3457c9" />
          </svg>
          Hitch
        </Link>
        <div className="hidden flex-1 gap-2 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-buttons px-3 py-2 text-[14px] font-[450] text-mist transition-colors hover:text-paper"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/marketplace/post"
          className="hidden rounded-buttons border border-graphite px-3 py-[7px] text-[13px] font-[510] text-mist transition-colors hover:border-smoke md:block"
        >
          Post an opportunity
        </Link>

        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-4 text-[14px]">
              <Link href="/marketplace/applications" className="text-mist transition-colors hover:text-paper">
                My applications
              </Link>
              <Link href="/profile" className="text-mist transition-colors hover:text-paper">
                Profile
              </Link>
              <form action={signOut} className="flex items-center gap-3">
                <span className="text-fog">{user.email}</span>
                <button type="submit" className="text-mist transition-colors hover:text-paper">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Button href="/login" variant="pill" size="sm">
              Sign in
            </Button>
          )}
        </div>

        <div className="ml-auto md:hidden">
          <MobileNav userEmail={user?.email ?? null} signOutAction={signOut} />
        </div>
      </nav>
    </header>
  );
}
