// lib/seo.ts
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://raceautoindia.com")
  .trim()
  .replace(/\/+$/, ""); // remove trailing slash

export function absUrl(path = "/") {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}
