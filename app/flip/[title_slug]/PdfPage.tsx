import React from "react";

import { cookies } from "next/headers";
import FlipBookMagazine from "../FlipBook_v2";
import { log } from "console";

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
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/commercial-vehicle-january-2025-edition`
  );

  const response = await pdfRes.json(); // Add this to parse JSON
  const pdfData = response?.[0]?.pdf_url; // Safely access pdf_url
  console.log(pdfData);


  return (
    <>
    
        <FlipBookMagazine  pdfData={pdfData} />
    </>
  );
};

export default PdfPage;
