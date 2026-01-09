import React from "react";
import PdfPage from "./PdfPage";
import "./page.css";

export async function generateMetadata({
  params,
}: {
  params: { title_slug: string };
}) {
  const { title_slug } = params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/${title_slug}`,
    { cache: "no-store" }
  );

  const data = await res.json();

  const { title, keywords, image_url } = data[0];

  return {
    title: title,

    openGraph: {
      title: title,
      keywords: keywords,
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${image_url}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      url: `${process.env.NEXT_PUBLIC_BACKEND_URL}magazine/${title_slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      images: [`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${image_url}`],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_BACKEND_URL}magazine/${title_slug}`,
    },
    other: {
      MetaKeywords: keywords,
    },
  };
}

const page = ({
  params,
}: {
  params: {
    title_slug: string;
  };
}) => {
  return (
    <>
      <div className="magazine-page">
        <PdfPage title={params.title_slug} />
      </div>
    </>
  );
};

export default page;
