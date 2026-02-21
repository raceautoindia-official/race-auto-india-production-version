import React from "react";
import type { Metadata } from "next";

import TagComponent from "./Tag";
import Sidebar from "@/components/Sidebar/Sidebar";

import { buildPageMeta, breadcrumbJsonLd, cleanText } from "@/lib/seo-meta";

export const revalidate = 300; // 5 min cache for tag pages

export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const raw = decodeURIComponent(params.category || "");
  const tagName = cleanText(raw.replace(/-/g, " "));

  return buildPageMeta({
    title: `${tagName} News | Race Auto India`,
    description: `Latest ${tagName} news, updates, launches and insights in India from Race Auto India.`,
    canonicalPath: `/tag/${params.category}`,
    keywords: [
      tagName,
      "automobile news india",
      "car news india",
      "bike news india",
      "commercial vehicle news",
      "ev news india",
      "automotive industry india",
    ],
  });
}

const TagPage = (context: {
  params: { category: string };
  searchParams: { page?: string };
}) => {
  const raw = decodeURIComponent(context.params.category || "");
  const tagName = cleanText(raw.replace(/-/g, " "));
  const page = context.searchParams?.page;

  const breadLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tags", path: "/" }, // if you have a tags index page, change to "/tags"
    { name: tagName, path: `/tag/${context.params.category}` },
  ]);

  return (
    <>
      {/* ✅ Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
      />

      <div className="container mt-3">
        <div className="row my-3">
          <div className="col-12 d-flex justify-content-center">
            <div className="row justify-content-center">
              <div className="col-lg-8 mt-4">
                <TagComponent categoryName={context.params.category} page={page} />
              </div>
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TagPage;
