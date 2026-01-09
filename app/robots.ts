import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/*"], // Disallow all paths under /admin
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_BACKEND_URL}sitemap.xml`,
  };
}
