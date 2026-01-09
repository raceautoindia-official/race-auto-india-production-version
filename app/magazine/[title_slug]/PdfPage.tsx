import React from "react";
import TestMobile from "./flipkv3";
import Test from "./FlipBook_v2";
import "./pdfpage.css";
import { cookies } from "next/headers";

async function incrementPageView(pageUrl: string) {
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/pageincrement/${pageUrl}`,
      {
        method: "PUT",
        cache: "no-store",
      }
    );
  } catch (error) {
    console.error("Error incrementing page view:", error);
  }
}

const PdfPage = async ({ title }: { title: string }) => {
  const cookieStore = await cookies();
  const token: any = cookieStore.get("authToken");
  await incrementPageView(title);

  const pdfRes: any = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/${title}`
  );

  const response = await pdfRes.json(); // Add this to parse JSON
  const pdfData = response?.[0]?.pdf_url; // Safely access pdf_url


  return (
    <>
      <div className="mobile__flipbook">
        <TestMobile token={token?.value} pdfData={pdfData} />
      </div>
      <div className="desktop__flipbook">
        <Test token={token?.value} pdfData={pdfData} />
      </div>
    </>
  );
};

export default PdfPage;
