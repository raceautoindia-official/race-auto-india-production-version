export const dynamic = "force-dynamic";

import React from "react";
import Magazine_v2 from "./Magazine-v2";
import BreakingNews from "@/components/BreakingNews/BreakingNews";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import MobileNavNew from "@/components/MobileNavbarNew/MobileNavNew";
import GreenBar from "@/components/GreenBar/MagazineBar";
import PageViewTracker from "../pageTracker";
import Navbar_V2 from "@/components/Navbar/Navbar_v2";

const page = () => {
  return (
    <>
      <PageViewTracker page="magazine" />
      <BreakingNews />
      <Navbar_V2 />
      <MobileNavNew />
      <div className="main_content__position">
        <Magazine_v2 />
      </div>
      <Footer />
      {/* <GreenBar /> */}
    </>
  );
};

export default page;
