import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import BreakingNews from "@/components/BreakingNews/BreakingNews";
import GreenBar from "@/components/GreenBar/MagazineBar";
import MobileNavNew from "@/components/MobileNavbarNew/MobileNavNew";

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <BreakingNews />
      <Navbar />
      <MobileNavNew/>
      <div className="main_content__position">{children}</div>
      <Footer />
      {/* <GreenBar/> */}
    </>
  );
}
