"use client";
import Image from "next/image";
import React from "react";
import { Card } from "react-bootstrap";
import { magazineCardType } from "./Magazine";
import Link from "next/link";
import styles from "./page.module.css";

function getBoostedPageViews(actualViews: number): number {
  const ranges = [
    { min: 0, max: 100, boostMin: 35000, boostMax: 57000 },
    { min: 101, max: 250, boostMin: 57001, boostMax: 79000 },
    { min: 251, max: 500, boostMin: 89001, boostMax: 92000 },
    { min: 501, max: 750, boostMin: 132001, boostMax: 175000 },
    { min: 751, max: 1000, boostMin: 95001, boostMax: 118000 },
    { min: 1001, max: Infinity, boostMin: 58001, boostMax: 62000 },
  ];

  const match = ranges.find(r => actualViews >= r.min && actualViews <= r.max);
  if (!match) return actualViews;

  // Stable pseudo-random using sin hash
  const seed = actualViews;
  const pseudo = (Math.sin(seed) + 1) / 2;
  const boosted = match.boostMin + pseudo * (match.boostMax - match.boostMin);

  return Math.floor(boosted);
}

const MagazineCard_v2 = ({ item }: { item: magazineCardType }) => {
  const simulatedViews = getBoostedPageViews(item.magazine_views);

  return (
    <div className="col-lg-3">
      <Card className="border-0 shadow-sm">
        <Link href={`/magazine/${item.title_slug}`}>
          <div
            className={styles.magazinecardcontainer}
            style={{
              position: "relative",
              aspectRatio: "1/1.414",
              width: "100%",
              overflow: "hidden",
              borderRadius: "10px 10px 0 0",
            }}
          >
            <Image
              className={styles.magazinecard}
              alt={item.title}
              fill
              priority
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </Link>
        <Card.Body className="text-center">
          <h6 className="fw-bold mb-2" style={{ fontSize: "0.95rem" }}>
            {item.title}
          </h6>
          <div
            className="text-muted"
            style={{
              fontSize: "0.85rem",
              color: "#555",
            }}
          >
            👁️ {simulatedViews.toLocaleString()} views
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MagazineCard_v2;
