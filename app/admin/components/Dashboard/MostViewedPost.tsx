import db from "@/lib/db";
import React from "react";

const MostViewedPost = async () => {
  const [results]: any = await db.execute(
    "SELECT * FROM posts ORDER BY pageviews DESC LIMIT 4"
  );

  return (
    <>
      <div className="row">
        <h5 className="mt-3 mb-2">Most Viewed Post</h5>
        {results.map((item: any) => (
          <div className="col-md-3 mb-3" key={item.id}>
            <div className="card" style={{ height: "100%" }}>
              <div className="row">
                <div className="col-4">
                  <img
                    className="img-fluid"
                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_small}`}
                    alt="image"
                  />
                </div>
                <div className="col-8">
                  <div className="">{item.title.slice(0, 40)}</div>
                  <div className="my-2">
                    <strong className="text-primary">Page Views:</strong>{" "}
                    {item.pageviews}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MostViewedPost;
