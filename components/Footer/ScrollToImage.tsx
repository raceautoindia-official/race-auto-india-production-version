"use client";
import Image from "next/image";

const ScrollToTopLogo = ({ logoData }: { logoData: any }) => {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      onClick={handleScrollToTop}
      style={{
        background: "none",
        border: "none",
        padding: 0,
        cursor: "pointer",
      }}
    >
      <Image
        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData}`}
        width={130}
        height={152}
        alt="logo_footer"
      />
    </button>
  );
};

export default ScrollToTopLogo;
