"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/Button";

const LINKS = [
  { href: "/marketplace", label: "Opportunities" },
  { href: "/demo", label: "See a demo" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function MobileNav({
  userEmail,
  signOutAction,
}: {
  userEmail: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-buttons text-mist transition-colors hover:text-paper"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full border-b-[0.5px] border-graphite bg-void px-6 py-4">
          <div className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-buttons px-3 py-2 text-[15px] font-[450] text-mist transition-colors hover:text-paper"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/marketplace/post"
              onClick={() => setOpen(false)}
              className="rounded-buttons px-3 py-2 text-[15px] font-[450] text-mist transition-colors hover:text-paper"
            >
              Post an opportunity
            </Link>
          </div>

          <div className="mt-3 border-t-[0.5px] border-graphite pt-3">
            {userEmail ? (
              <div className="flex flex-col gap-1">
                <Link
                  href="/marketplace/applications"
                  onClick={() => setOpen(false)}
                  className="rounded-buttons px-3 py-2 text-[15px] font-[450] text-mist transition-colors hover:text-paper"
                >
                  My applications
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-buttons px-3 py-2 text-[15px] font-[450] text-mist transition-colors hover:text-paper"
                >
                  Profile
                </Link>
                <form action={signOutAction} className="mt-1 flex items-center justify-between px-3 py-2">
                  <span className="text-caption text-fog">{userEmail}</span>
                  <button type="submit" className="text-[13px] text-mist transition-colors hover:text-paper">
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="px-3">
                <Button href="/login" variant="pill" size="sm" onClick={() => setOpen(false)}>
                  Sign in
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
