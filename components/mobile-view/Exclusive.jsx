import React from "react";
import Image from "next/image";
import Link from "next/link";

const Exclusive = ({ value }) => {
  const truncateTitle = (text, maxLength = 60) =>
    text && text.length > maxLength ? text.slice(0, maxLength) + "..." : text;

  return (
    <>
      <h2 className="py-2 text-center bg-dark text-white">Exclusive News</h2>

      <div
        className="container-fluid py-3"
        style={{ backgroundColor: "#EAEAEA" }}
      >

        <div className="row g-3">
          {value?.slice(0, 4).map((item, index, array) => {
            const title = truncateTitle(item.title || "Untitled News");
            const title_slug = item.title_slug;
            const imageSrc = item.image_mid
              ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
              : "/default.png";
            return (
              <Link href={`/post/${title_slug}`} key={index}>
                <div className="col-12">
                  <div className="row g-0 align-items-center border rounded">
                    <div className="col-6">
                      <h6 className="mb-0 pe-3" style={{ fontWeight: 700 }}>{title}</h6>
                    </div>
                    <div className="col-6">
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "16/9",
                          position: "relative",
                        }}
                      >
                        <Image
                          src={imageSrc}
                          alt={item.title || "news image"}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          style={{ objectFit: "cover" }}
                          className="rounded"
                          unoptimized={false}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Add a divider below each post except the last one */}
                  {index < array.length - 1 && (
                    <hr style={{ borderTop: "2px solid #333", margin: "0" }} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
        <hr style={{ borderTop: "2px solid #333", margin: "0" }} />
      </div>
    </>
  );
};

export default Exclusive;
