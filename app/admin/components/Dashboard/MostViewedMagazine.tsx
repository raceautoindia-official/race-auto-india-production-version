import db from "@/lib/db";
import Image from "next/image";
import React from "react";

const MostViewedMagazine = async () => {
  const [results]: any = await db.execute(
    "SELECT * FROM newsletter ORDER BY magazine_views DESC LIMIT 4"
  );

  return (
    <>
      <div className="row">
        <h5 className="mt-3 mb-2">Most Viewed Magazine</h5>
        {results.map((item: any) => (
          <div className="col-md-3 mb-3" key={item.id}>
            <div className="card">
              <div
                style={{
                  position: "relative",
                  aspectRatio: "1/1",
                  width: "100%",
                }}
              >
                <Image
                  className="img-fluid"
                  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                  alt="image"
                  fill
                />
              </div>
            </div>
            <div className="col-8">
              <div className="">{item.title.slice(0, 40)}</div>
              <div className="my-2">
                <strong className="text-primary">Magazine Views:</strong>{" "}
                {item.magazine_views}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MostViewedMagazine;
