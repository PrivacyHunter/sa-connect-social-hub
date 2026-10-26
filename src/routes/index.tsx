import { createFileRoute } from "@tanstack/react-router";
import { AuthPage } from "./auth";
import scene from "@/assets/brand-scene.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "S&A Connect — Your world, connected" },
    { name: "description", content: "Connect with your people through messages, stories, reels and video on S&A Connect." },
    { property: "og:title", content: "S&A Connect — Your world, connected" },
    { property: "og:description", content: "Your people, moments and community in one place." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
    { property: "og:image", content: scene.url },
    { name: "twitter:image", content: scene.url },
  ] }),
  component: AuthPage,
});
