import Image from "next/image";
import React from "react";
import { eventType } from "./eventCard";
import getBaseUrl from "@/lib/getbaseurl";

const EventCard_2 = async ({ item }: { item: eventType }) => {
  const blurdata = await getBaseUrl(
    `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
  );
  return (
    <div className="col-md-6 p-4">
      <a href={`${item.referenceLink}`} target="_blank">
      <div className="card" style={{height:'100%'}}>
        <div
          style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
        >
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
              alt={item.title}
              fill
              style={{ objectFit: "cover" }}
              placeholder={item.image_mid ? "blur" : undefined}
              blurDataURL={item.image_mid ? blurdata : undefined}
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
            />
        </div>
        <div className="card-body">
          <h5 className="event__title text-primary" style={{ fontWeight: 900 }}>
            {item.title}
          </h5>
          <p className="event__summary">{item.summary}</p>
          <p className="event__location">Location: {item.location}</p>
        </div>
      </div>
      </a>
    </div>
  );
};

export default EventCard_2;
