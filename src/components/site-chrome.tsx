import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Twitter, Wallet, X, Youtube } from "lucide-react";
import { Brand } from "@/components/brand";

export const SOCIAL_LINKS = [
  { label: "Facebook", href: "https://facebook.com/saconnect", icon: Facebook },
  { label: "Instagram", href: "https://instagram.com/saconnect", icon: Instagram },
  { label: "YouTube", href: "https://youtube.com/@saconnect", icon: Youtube },
  { label: "X", href: "https://x.com/saconnect", icon: Twitter },
];

const MESSAGES = [
  "Welcome to S&A Connect — chat, share, create",
  "Level up to 1000 and unlock unique badges",
  "Find friends by @username or from your contacts",
  "Sell and buy in the Marketplace",
  "Earn with S&A Connect — coming soon",
];

export function Marquee() {
  const items = [...MESSAGES, ...MESSAGES];
  return (
    <div className="marquee glass text-xs font-medium text-muted-foreground" aria-label="Announcements">
      <div className="marquee-track">
        {items.map((m, i) => (
          <span key={i} className="flex items-center gap-3" aria-hidden={i >= MESSAGES.length}>
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />{m}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-glass-border glass px-6 py-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-3"><Brand /><p className="max-w-xs text-xs text-muted-foreground">Your world, connected.</p></div>
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <Link to="/feed" className="hover:text-foreground">Feed</Link>
          <Link to="/marketplace" className="hover:text-foreground">Marketplace</Link>
          <Link to="/contacts" className="hover:text-foreground">Find friends</Link>
          <Link to="/income" className="hover:text-foreground">Income</Link>
        </nav>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Follow us</span>
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Follow S&A Connect on ${label}`} className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} S&A Connect</p>
    </footer>
  );
}

export function IncomePopup() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!sessionStorage.getItem("income-popup")) {
      const t = setTimeout(() => setShow(true), 2500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);
  if (!show) return null;
  const close = () => { sessionStorage.setItem("income-popup", "1"); setShow(false); };
  return (
    <div role="dialog" aria-label="Income coming soon" className="fixed bottom-20 right-4 z-50 w-72 rounded-md border border-glass-border glass p-4 shadow-[var(--shadow-glow)] lg:bottom-6">
      <button onClick={close} aria-label="Close" className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
      <p className="flex items-center gap-2 font-semibold"><Wallet className="h-5 w-5 text-primary" /> Income</p>
      <p className="mt-1 text-sm text-muted-foreground">Earn from your content on S&A Connect. Coming soon!</p>
      <Link to="/income" onClick={close} className="mt-3 inline-block text-sm font-medium text-primary">Learn more →</Link>
    </div>
  );
}
