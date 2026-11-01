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
      <nav aria-label="Main" className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-4">
        <Link href="/" className="flex min-h-[44px] items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo-hitch.webp" alt="Hitch" width={720} height={209} className="h-11 w-auto" />
        </Link>
        <div className="hidden flex-1 gap-2 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex min-h-[44px] items-center rounded-buttons px-3 text-[14px] font-[450] text-mist transition-colors hover:text-paper"
            >
              {l.label}
            </Link>
          ))}
        </div>
        <Link
          href="/marketplace/post"
          className="hidden min-h-[44px] items-center rounded-buttons border border-graphite px-4 text-[13px] font-[510] text-mist transition-colors hover:border-smoke md:inline-flex"
        >
          Post an opportunity
        </Link>

        <div className="hidden md:block">
          {user ? (
            <div className="flex items-center gap-4 text-[14px]">
              <Link href="/marketplace/applications" className="flex min-h-[44px] items-center text-mist transition-colors hover:text-paper">
                My applications
              </Link>
              <Link href="/profile" className="flex min-h-[44px] items-center text-mist transition-colors hover:text-paper">
                Profile
              </Link>
              <form action={signOut} className="flex items-center gap-3">
                <span className="text-fog">{user.email}</span>
                <button type="submit" className="min-h-[44px] px-2 text-mist transition-colors hover:text-paper">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Button href="/login" variant="pill" size="lg">
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
