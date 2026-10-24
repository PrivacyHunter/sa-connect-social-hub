import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clapperboard,
  MessagesSquare,
  MonitorPlay,
  Newspaper,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "S&A Connect — Chat, Feed, Reels & Video in one app" },
      {
        name: "description",
        content:
          "S&A Connect unifies messaging, social feeds, short reels and long-form video into one fast, beautiful super-app.",
      },
      { property: "og:title", content: "S&A Connect — Chat, Feed, Reels & Video in one app" },
      {
        property: "og:description",
        content:
          "Messaging, social feeds, short reels and long-form video unified into one seamless super-app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Chat & Channels",
    text: "Direct messages, groups and broadcast channels with voice notes, photos and files.",
  },
  {
    icon: Newspaper,
    title: "Feed & Stories",
    text: "24-hour stories, photo carousels, likes, comments and bookmarks.",
  },
  {
    icon: Clapperboard,
    title: "Reels",
    text: "A full-screen vertical reel feed with music tags and instant reactions.",
  },
  {
    icon: MonitorPlay,
    title: "Video Hub",
    text: "Long-form videos with channels, subscriptions, likes and watch-later.",
  },
];

function LandingPage() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
  }, []);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* ambient glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-gold-deep font-display text-sm font-bold text-primary-foreground shadow-[var(--shadow-glow)]">
            S&A
          </span>
          <span className="font-display text-lg font-bold">
            S&A <span className="text-gradient-brand">Connect</span>
          </span>
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/auth">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link to="/auth">
            <Button>Get started</Button>
          </Link>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20">
        <section className="pt-16 text-center sm:pt-24">
          <p className="mx-auto mb-4 w-fit rounded-full border border-glass-border glass px-4 py-1.5 text-xs font-semibold text-gold">
            One app for everything
          </p>
          <h1 className="mx-auto max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            Chat, share, watch — <span className="text-gradient-brand">all connected.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            S&A Connect brings messaging, your social feed, short reels and long-form video into one
            fast, beautiful app with real accounts and real data.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/auth">
              <Button size="lg" className="shadow-[var(--shadow-glow)]">
                {signedIn ? "Open app" : "Create free account"} <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="secondary">
                I already have an account
              </Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-5 transition-transform hover:-translate-y-1">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-gold-deep/10 text-gold">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-20 rounded-3xl border border-glass-border glass p-8 text-center sm:p-12">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            Your community deserves one home.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground sm:text-base">
            Sign up in seconds — every message, post, reel and video you add is stored in your own
            database, available on every device.
          </p>
          <Link to="/auth" className="mt-6 inline-block">
            <Button size="lg">
              Start free <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="relative border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} S&A Connect — messaging, feed, reels & video, unified.
      </footer>
    </div>
  );
}
