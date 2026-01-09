import React from "react";
import InsightBlogPage from "./comment";
import BreakingNews from "@/components/BreakingNews/BreakingNews";
import Navbar_V2 from "@/components/Navbar/Navbar_v2";
import MobileNavNew from "@/components/MobileNavbarNew/MobileNavNew";
import Footer from "@/components/Footer/Footer";

const page = () => {
  return (
    <>
      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew />
      <InsightBlogPage />
      <Footer />
    </>
  );
};

export default page;
