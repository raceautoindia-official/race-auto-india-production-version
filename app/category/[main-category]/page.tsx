import React from "react";
import type { Metadata } from "next";

import MainCategory from "./MainCategory";
import Sidebar from "@/components/Sidebar/Sidebar";
import db from "@/lib/db";

import { buildPageMeta, breadcrumbJsonLd, cleanText } from "@/lib/seo-meta";
import { absUrl } from "@/lib/seo";

export const revalidate = 300; // 5 min cache for category pages

async function getCategoryDisplayName(slug: string): Promise<string> {
  try {
    const [rows]: any = await db.execute(
      `SELECT name FROM categories WHERE name_slug = ? LIMIT 1`,
      [slug]
    );
    const name = rows?.[0]?.name;
    return cleanText(name || slug.replace(/-/g, " "));
  } catch (e) {
    console.error("Category name fetch error:", e);
    return cleanText(slug.replace(/-/g, " "));
  }
}

async function getCategoryTopPosts(slug: string) {
  // ✅ Optional: used for ItemList schema (top URLs)
  try {
    const [rows]: any = await db.execute(
      `SELECT title_slug, title FROM posts WHERE category_slug = ? ORDER BY id DESC LIMIT 10`,
      [slug]
    );
    return Array.isArray(rows) ? rows : [];
  } catch (e) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { "main-category": string };
}): Promise<Metadata> {
  const slug = params["main-category"];
  const categoryName = await getCategoryDisplayName(slug);

  return buildPageMeta({
    title: `${categoryName} News in India | Race Auto India`,
    description: `Latest ${categoryName} news, launches, reviews, EV updates and industry insights in India from Race Auto India.`,
    canonicalPath: `/category/${slug}`,
    keywords: [
      categoryName,
      `${categoryName} news india`,
      "automobile news india",
      "car news india",
      "bike news india",
      "commercial vehicle news",
      "ev news india",
      "automotive industry india",
    ],
  });
}

const MainCategoryPage = async (context: {
  params: { "main-category": string };
  searchParams: { page?: string };
}) => {
  const categorySlug = context.params["main-category"];
  const page = context.searchParams?.page;

  const categoryName = await getCategoryDisplayName(categorySlug);
  const posts = await getCategoryTopPosts(categorySlug);

  const breadLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Category", path: "/" }, // if you have /categories page, change to "/categories"
    { name: categoryName, path: `/category/${categorySlug}` },
  ]);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} News`,
    url: absUrl(`/category/${categorySlug}`),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        url: absUrl(`/post/${p.title_slug}`),
        name: cleanText(p.title),
      })),
    },
  };

  return (
    <>
      {/* ✅ Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <div className="container mt-3">
        <div className="row my-3">
          <h1 className="" style={{ fontWeight: 700 }}>
            {categoryName.toUpperCase()}
          </h1>

          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <MainCategory categoryName={categorySlug} page={page} />
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainCategoryPage;
