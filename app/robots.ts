import type { MetadataRoute } from "next";
import { absUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/*",
          "/login",
          "/register",
          "/reset-password",
          "/profile/*",
          "/subscription/*",
          "/search",
          "/search/*",
        ],
      },
    ],
    sitemap: absUrl("/sitemap.xml"),
  };
}
