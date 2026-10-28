import Link from "next/link";

import { contact, navLinks, site } from "@/content/site-data";
import { icons } from "@/lib/icons";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Link href="/" className="font-display text-lg font-bold">
            {site.name}
            <span className="text-brand">.</span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Freelance developer building fast, AI-powered web experiences — from
            idea to production.
          </p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
          <nav className="flex flex-col gap-2" aria-label="Footer">
            <span className="text-sm font-semibold">Navigate</span>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Elsewhere</span>
            <div className="flex gap-2">
              {contact.socials.map((social) => {
                const Icon = icons[social.icon];
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target={
                      social.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      social.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    aria-label={social.label}
                    className="flex size-10 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground"
                  >
                    <Icon className="size-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="container flex h-14 items-center justify-center text-xs text-muted-foreground">
          © {year} {site.name}. Built with Next.js & Three.js.
        </div>
      </div>
    </footer>
  );
}
