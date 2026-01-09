import Image from "next/image";
import React from "react";
import { viewsCardType } from "./Dashboard";

const MostViews = (item: viewsCardType) => {
  return (
    <div className="card border-0 mb-3 shadow">
      <div className="row">
        <div className="col-6">
          <div
            style={{ position: "relative", aspectRatio: "16/9", width: "100%" }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
              alt={item.title}
              fill
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
        <div className="col-6 p-2">
          <div className="card-body">
            <div className="card-title dashboard-heading">{item.title}</div>
            <div>Total Views: {item.pageviews}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MostViews;
