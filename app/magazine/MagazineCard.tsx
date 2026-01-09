import React from "react";
import { magazineCardType } from "./Magazine";
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";

const MagazineCard = ({ item }: { item: magazineCardType }) => {
  const keywordList = item.keywords.split(",");

  return (
    <>
      <div className="col-12 mt-3 shadow-xl">
        <div className="row g-0">
          <div className="col-md-4">
            <Link href={`/magazine/${item.title_slug.toLowerCase()}`}>
              <div
                className={styles.magazinecardcontainer}
                style={{
                  position: "relative",
                  aspectRatio: "1/1.414",
                  width: "100%",
                }}
              >
                <Image
                  alt={item.title}
                  className={styles.magazinecard}
                  fill
                  priority
                  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
                />
              </div>
            </Link>
          </div>
          <div className="col-md-8">
            <h5 className="card-title text-center my-3">{item.title}</h5>
            <div className="card-text">
              <ul>
                {keywordList.map((keyword, index) => (
                  <li
                    key={index}
                    className="mb-3"
                    style={{ fontSize: "smaller" }}
                  >
                    {keyword.trim()}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MagazineCard;
