import React from "react";

import Image from "next/image";
import Link from "next/link";
import getBaseUrl from "@/lib/getbaseurl";
import "./event.css";

export type eventType = {
  id: number;
  image_mid: string;
  image_url: string;
  referenceLink: string;
  event_date: any;
  title: string;
  summary: string;
  location: string;
};

const EventCard = async ({ item }: { item: eventType }) => {
  const blurdata = await getBaseUrl(
    `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
  );
  return (
    <div className="col-12 mt-3 shadow-sm p-2" key={item.id}>
      <a
        href={item.referenceLink}
        target="_blank"
        rel="noreferrer"
        style={{ color: "inherit" }}
      >
        <div className="row">
          <div className="col-md-4">
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                position: "relative",
              }}
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                fill
                alt={item.title}
                priority
                placeholder={item.image_mid ? "blur" : undefined}
                blurDataURL={item.image_mid ? blurdata : undefined}
                sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
              />
            </div>
          </div>
          <div className="col-md-8">
            <h6 className="event__date" style={{ fontWeight: 700 }}>
              {item.event_date}
            </h6>
            <h5 className="event__title" style={{ fontWeight: 900 }}>
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

export default EventCard;
