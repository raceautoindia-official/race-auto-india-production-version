export const dynamic = "force-dynamic";

import React from "react";
import PageContent from "./PageContent";
import Navbar from "@/components/Navbar/Navbar";
import BreakingNews from "@/components/BreakingNews/BreakingNews";
import Footer from "@/components/Footer/Footer";
import GreenBar from "@/components/GreenBar/MagazineBar";
import MobileNavNew from "@/components/MobileNavbarNew/MobileNavNew";
import Navbar_V2 from "@/components/Navbar/Navbar_v2";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const categoryName = params.slug;
  const title = `${categoryName} Page`;
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}page/${categoryName}`;

  return {
    title,

    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
    },
  };
}

const page = ({
  params,
}: {
  params: {
    slug: string;
  };
}) => {
  return (
    <>
      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew/>
      <div className="main_content__position">
      <div className="my-3">
        <PageContent slug={params.slug} />
      </div>
      </div>
      <Footer />
      {/* <GreenBar /> */}
    </>
  );
};

export default page;
