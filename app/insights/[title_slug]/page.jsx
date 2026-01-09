import React from 'react'

import BreakingNews from '@/components/BreakingNews/BreakingNews'
import Navbar_V2 from '@/components/Navbar/Navbar_v2'
import MobileNavNew from '@/components/MobileNavbarNew/MobileNavNew'
import Footer from '@/components/Footer/Footer'
import InsightDetailPage from './Insight'

export async function generateMetadata({ searchParams }) {
  const id = searchParams?.id;
  if (!id) return notFound();

  const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/insights/${id}`);
  if (!res.ok) return notFound();

  const data = await res.json();

  const imageUrl =
    data.images?.[0] 
      ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data.images[0]}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/default-insight.jpg`;

  return {
    title: data.title || "Insight",
    description: data.notes?.substring(0, 160) || "",
    keywords: data.keywords?.split(",") || [],
    openGraph: {
      title: data.title,
      description: data.notes,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 600,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title,
      description: data.notes,
      images: [imageUrl],
    },
  };
}

const page = () => {
  return (
    <>

      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew />
      <div className="main_content__position"><InsightDetailPage /></div>
      <Footer />
    </>
  )
}

export default page