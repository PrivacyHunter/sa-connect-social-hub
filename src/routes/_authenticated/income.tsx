import { createFileRoute } from "@tanstack/react-router";
import { Wallet } from "lucide-react";
import { pageHead } from "@/lib/page-head";

export const Route = createFileRoute("/_authenticated/income")({
  head: () => pageHead("Income", "Earn from your content on S&A Connect — coming soon."),
  component: Income,
});

function Income() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <Wallet className="mx-auto mb-6 h-14 w-14 text-primary" />
      <p className="text-xs uppercase tracking-widest text-primary">Income</p>
      <h1 className="mt-3 font-display text-4xl font-bold">Coming soon</h1>
      <p className="mt-4 text-muted-foreground">Creators will soon be able to earn from posts, reels, videos and the marketplace. Keep levelling up!</p>
    </div>
  );
}
