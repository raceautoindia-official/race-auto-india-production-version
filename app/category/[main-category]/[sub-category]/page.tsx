import React from "react";
import type { Metadata } from "next";

import SubCategory from "./SubCategory";
import Sidebar from "@/components/Sidebar/Sidebar";
import db from "@/lib/db";

import { buildPageMeta, breadcrumbJsonLd, cleanText } from "@/lib/seo-meta";
import { absUrl } from "@/lib/seo";

export const revalidate = 300;

async function getCategoryDisplayName(slug: string): Promise<string> {
  try {
    const [rows]: any = await db.execute(
      `SELECT name FROM categories WHERE name_slug = ? LIMIT 1`,
      [slug]
    );
    const name = rows?.[0]?.name;
    return cleanText(name || slug.replace(/-/g, " "));
  } catch (e) {
    console.error("SubCategory name fetch error:", e);
    return cleanText(slug.replace(/-/g, " "));
  }
}

async function getTopPostsForSubCategory(slug: string) {
  // ✅ Optional for schema (top links)
  try {
    const [rows]: any = await db.execute(
      `SELECT title_slug, title FROM posts WHERE sub_category_slug = ? ORDER BY id DESC LIMIT 10`,
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
  params: { "sub-category": string };
}): Promise<Metadata> {
  const slug = params["sub-category"];
  const name = await getCategoryDisplayName(slug);

  return buildPageMeta({
    title: `${name} News in India | Race Auto India`,
    description: `Latest ${name} news, launches, reviews and EV updates in India from Race Auto India.`,
    canonicalPath: `/sub-category/${slug}`, // ✅ change if your route is different
    keywords: [
      name,
      `${name} news india`,
      "automobile news india",
      "car news india",
      "bike news india",
      "commercial vehicle news",
      "ev news india",
      "automotive industry india",
    ],
  });
}

const SubCategoryPage = async (context: {
  params: { "sub-category": string };
  searchParams: { page?: string };
}) => {
  const slug = context.params["sub-category"];
  const page = context.searchParams?.page;

  const displayName = await getCategoryDisplayName(slug);
  const posts = await getTopPostsForSubCategory(slug);

  const breadLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Category", path: "/" }, // if you have a categories list, update path
    { name: displayName, path: `/sub-category/${slug}` }, // ✅ change if route differs
  ]);

  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${displayName} News`,
    url: absUrl(`/sub-category/${slug}`), // ✅ change if route differs
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
      />

      <div className="container mt-3">
        <div className="row my-3">
          <h1 className="" style={{ fontWeight: 700 }}>
            {displayName.toUpperCase()}
          </h1>

          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <SubCategory categoryName={slug} page={page} />
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SubCategoryPage;
