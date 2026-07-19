import Image from "next/image";
import Link from "next/link";
import React from "react";

async function View() {
  const mostViewedRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/most-views`,
    { cache: "no-store" } // Optional: disable caching for freshness
  );

  const mostViewed = await mostViewedRes.json();

  return (
    <>
      <h3 className="text-center p-2 text-white" style={{ background: "#333" }}>
        Most Viewed News
      </h3>
      <div className="mb-1" style={{ backgroundColor: "#EAEAEA" }}>
        {mostViewed?.length > 0 ? (
          mostViewed.map((item, index) => (
            <Link className="link-style" href={`/post/${item.title_slug}`} key={index}>
              <h6
                key={index}
                className="border-bottom border-1 border-black mb-1 p-2"
              >
                {item.title}
              </h6>
            </Link>
          ))
        ) : (
          <p className="text-muted p-2">No data available.</p>
        )}
      </div>
      <Link href="/subscription">
        <div
          style={{
            position: "relative",
            aspectRatio: "1/1.414",
            width: "100%",
          }}
        >
          <Image
            src="/images/Research & strategies-01.jpg"
            alt="news"
            fill
            className="rounded object-fit-cover"
          />
        </div>
      </Link>
    </>
  );
}

export default View;
