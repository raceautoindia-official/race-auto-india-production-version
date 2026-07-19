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

        {/* col-12 keeps phones one-per-row as before; col-md-6 gives tablets
            two balanced cards per row. The grid column is now the Link's
            parent (previously the col-12 was INSIDE the Link, so the row's
            direct children weren't columns and the grid never applied). */}
        <div className="row g-3">
          {value?.slice(0, 4).map((item, index) => {
            const title = truncateTitle(item.title || "Untitled News");
            const title_slug = item.title_slug;
            const imageSrc = item.image_mid
              ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
              : "/default.png";
            return (
              <div className="col-12 col-md-6" key={index}>
                <Link href={`/post/${title_slug}`} className="link-style">
                  <div className="row g-0 align-items-center border rounded h-100">
                    <div className="col-6">
                      <h6 className="mb-0 px-2" style={{ fontWeight: 700 }}>{title}</h6>
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
                          sizes="(max-width: 768px) 50vw, 25vw"
                          style={{ objectFit: "cover" }}
                          className="rounded"
                          unoptimized={false}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <hr style={{ borderTop: "2px solid #333", margin: "0" }} />
      </div>
    </>
  );
};

export default Exclusive;
