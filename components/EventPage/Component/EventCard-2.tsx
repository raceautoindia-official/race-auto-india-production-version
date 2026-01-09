"use client";

import React from "react";
import Image from "next/image";
import { eventType } from "@/app/page/event/eventCard";

const EventCard_2 = ({ item }: { item: eventType }) => {
  return (
    <div className="col-md-6 col-lg-4 p-4" style={{ color: "black" }}>
      <a href={item.referenceLink} target="_blank" rel="noopener noreferrer">
        <div className="card" style={{ height: "100%" }}>
          <div
            style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
          >
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
              alt={item.title}
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
              priority
            />
          </div>
          <div className="card-body">
            <h5
              className="event__title text-primary"
              style={{ fontWeight: 900 }}
            >
              {item.title}
            </h5>
            <p className="event__summary" style={{ color: "black" }}>
              {item.summary}
            </p>
            <p className="event__location" style={{ color: "black" }}>
              Location: {item.location}
            </p>
          </div>
        </div>
      </a>
    </div>
  );
};

export default EventCard_2;
