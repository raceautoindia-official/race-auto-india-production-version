import Image from "next/image";
import Link from "next/link";
import React from "react";

async function DeskTopView() {
  const mostViewedRes = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/dashboard/most-views`,
    { cache: "no-store" } // Optional: disable caching for freshness
  );

  const mostViewed = await mostViewedRes.json();

  return (
    <>
      <h4 className="text-center p-1 text-white" style={{ background: "#333" }}>
        Most Viewed News
      </h4>
      <div className="mb-1" style={{ backgroundColor: "#EAEAEA" }}>
        {mostViewed?.length > 0 ? (
          mostViewed.map((item, index) => (
            <Link className="link-style" href={`/post/${item.title_slug}`} key={index}>
              <h6
                key={index}
                className="border-bottom border-1 border-black mb-1 p-2 text-dark"
              >
                {item.title}
              </h6>
            </Link>
          ))
        ) : (
          <p className="text-muted p-2">No data available.</p>
        )}
      </div>
    </>
  );
}

export default DeskTopView;
