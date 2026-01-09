// import BreakingNews from "@/components/BreakingNews/BreakingNews";
// import Navbar from "@/components/Navbar/Navbar";

export default function MagazineLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* <BreakingNews />
      <Navbar /> */}
      {children}
    </>
  );
}
