import React from "react";
import Image from "next/image";
import Link from "next/link";

function Main({ contentList }) {
  const truncateSummary = (text, maxLength = 60) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  const truncateTitle = (text, maxLength = 40) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <div className="container-fluid border-bottom border-2">
      <h4 className="mb-2">
        Latest Updates on Automobiles, Agriculture & Construction
      </h4>

      {contentList?.slice(0, 4).map((item, index) => {
        const title = truncateTitle(item.title || "Default Title");
        const summary = truncateSummary(
          item.summary || "No summary available."
        );
        const title_slug = item.title_slug;
        const imageSrc = item.image_mid
          ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
          : "/default.png";

        return (
          <Link href={`/post/${title_slug}`} key={index}>
            <div className="row mb-2">
              <div className="col-6 pe-2">
                <h5 className="fs-6 mb-1" style={{ fontWeight: 600 }}>
                  <small>{title}</small>
                </h5>
                <p className="text-muted fs-7 mb-0">
                  <small>{summary}</small>
                </p>
              </div>
              <div className="col-6 ps-0">
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                  }}
                >
                  <Image
                    src={imageSrc}
                    alt={item.title || "news image"}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover" }}
                    className="rounded"
                    unoptimized={false} // Let Next optimize if remote image is configured properly
                  />
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Main;
