import React from "react";
import Post, { postType } from "./post";
import Sidebar from "@/components/Sidebar/Sidebar";
import { cookies } from "next/headers";
import type { Metadata } from "next";

import { absUrl } from "@/lib/seo";
import {
  buildPageMeta,
  newsArticleJsonLd,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo-meta";

export const revalidate = 60; // ✅ ISR for SEO + speed

async function fetchPost(slug: string): Promise<postType | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/post/single-post/${slug}`,
      { next: { revalidate } } // ✅ instead of no-store
    );

    if (!res.ok) return null;

    const data: postType[] = await res.json();
    return data?.[0] || null;
  } catch (e) {
    console.error("fetchPost error:", e);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { title_slug: string };
}): Promise<Metadata> {
  const slug = params.title_slug;
  const post = await fetchPost(slug);

  // Fallback (prevents metadata crash if API fails)
  if (!post) {
    return buildPageMeta({
      title: "Race Auto India",
      description:
        "Race Auto India brings the latest car, bike and commercial vehicle news, reviews, launches, EV updates, and industry insights.",
      canonicalPath: `/post/${slug}`,
      noindex: true,
    });
  }

  const title = cleanText(post.title);
  const description = cleanText(post.summary);
  const image = post.image_mid;

  // keywords from API could be string or array, normalize:
  const kw =
    Array.isArray((post as any).keywords)
      ? ((post as any).keywords as string[])
      : typeof (post as any).keywords === "string"
      ? (post as any).keywords
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean)
      : [];

  return buildPageMeta({
    title: `${title} | Race Auto India`,
    description,
    canonicalPath: `/post/${slug}`,
    keywords: kw,
    image,
  });
}

const PostPage = async ({ params }: { params: { title_slug: string } }) => {
  const slug = params.title_slug;

  const cookieStore = await cookies();
  const token = cookieStore.get("authToken");

  const post = await fetchPost(slug);

  // ✅ JSON-LD only if we have post data
  const articleLd =
    post &&
    newsArticleJsonLd({
      urlPath: `/post/${slug}`,
      headline: post.title,
      description: post.summary,
      image: post.image_mid,
      datePublished: (post as any).created_at || (post as any).published_at,
      dateModified: (post as any).updated_at,
      section: (post as any).category_name || (post as any).category,
      keywords: Array.isArray((post as any).keywords)
        ? ((post as any).keywords as string[])
        : typeof (post as any).keywords === "string"
        ? (post as any).keywords
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      authorName: "Race Auto India Editorial Team",
    });

  const breadLd =
    post &&
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "News", path: "/" },
      { name: cleanText(post.title || "Article"), path: `/post/${slug}` },
    ]);

  return (
    <>
      {/* ✅ Structured data for Google */}
      {articleLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
      )}
      {breadLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadLd) }}
        />
      )}

      <div className="container">
        <div className="row">
          <Post title={slug} is_recommended={post?.is_recommended} />
          <Sidebar />
        </div>
      </div>
    </>
  );
};

export default PostPage;
