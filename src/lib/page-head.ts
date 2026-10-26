export function pageHead(title: string, description: string) {
  return { meta: [{ title: `${title} — S&A Connect` }, { name: "description", content: description }, { property: "og:title", content: `${title} — S&A Connect` }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }] };
}