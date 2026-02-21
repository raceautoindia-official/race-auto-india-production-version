// lib/seo-meta.ts
import type { Metadata } from "next";
import { absUrl } from "@/lib/seo";

export function cleanText(input?: string | null) {
  return (input || "").replace(/\s+/g, " ").trim();
}

export function pickDescription(...candidates: Array<string | null | undefined>) {
  for (const c of candidates) {
    const t = cleanText(c);
    if (t.length >= 50) return t.slice(0, 160);
    if (t.length > 0) return t;
  }
  return "Race Auto India brings the latest car, bike and commercial vehicle news, reviews, launches, EV updates, and industry insights.";
}

export function ogImages(img?: string | null) {
  if (!img) return undefined;
  const url = img.startsWith("http")
    ? img
    : `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || ""}${img}`;

  return [{ url, width: 1200, height: 630, alt: "Race Auto India" }];
}

export function baseKeywords(extra: string[] = []) {
  const base = [
    "Race Auto India",
    "car news india",
    "bike news india",
    "automobile news india",
    "commercial vehicle news",
    "truck news india",
    "bus news india",
    "ev news india",
    "automotive industry india",
  ];
  return Array.from(new Set([...base, ...extra])).slice(0, 40);
}

export function buildPageMeta(opts: {
  title: string;
  description?: string;
  canonicalPath: string; // "/post/abc"
  keywords?: string[];
  image?: string | null;
  noindex?: boolean;
}): Metadata {
  const canonical = absUrl(opts.canonicalPath);

  return {
    title: cleanText(opts.title),
    description: pickDescription(opts.description),
    alternates: { canonical },
    robots: opts.noindex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      type: "website",
      title: cleanText(opts.title),
      description: pickDescription(opts.description),
      url: canonical,
      images: ogImages(opts.image),
    },
    twitter: {
      card: "summary_large_image",
      title: cleanText(opts.title),
      description: pickDescription(opts.description),
      images: ogImages(opts.image)?.map((x) => x.url),
    },
    keywords: baseKeywords(opts.keywords || []),
  };
}

export function toISO(d?: string | Date | null) {
  if (!d) return new Date().toISOString();
  const dt = typeof d === "string" ? new Date(d) : d;
  return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
}

export function newsArticleJsonLd(opts: {
  urlPath: string;
  headline: string;
  description?: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  section?: string | null;
  keywords?: string[];
  authorName?: string;
}) {
  const url = absUrl(opts.urlPath);
  const imageUrl = opts.image
    ? (opts.image.startsWith("http")
        ? opts.image
        : `${process.env.NEXT_PUBLIC_S3_BUCKET_URL || ""}${opts.image}`)
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: url,
    headline: cleanText(opts.headline),
    description: pickDescription(opts.description),
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: toISO(opts.datePublished),
    dateModified: toISO(opts.dateModified || opts.datePublished),
    articleSection: cleanText(opts.section || undefined),
    keywords: (opts.keywords || []).slice(0, 20).join(", "),
    author: {
      "@type": "Organization",
      name: cleanText(opts.authorName || "Race Auto India Editorial Team"),
    },
    publisher: {
      "@type": "Organization",
      name: "Race Auto India",
      logo: {
        "@type": "ImageObject",
        url: absUrl("/images/white logo.png"), // optional; can replace with S3 logo if you want
      },
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}
