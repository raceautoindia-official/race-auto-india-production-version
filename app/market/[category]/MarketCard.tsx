/* eslint-disable react/prop-types */

import Image from "next/image";
import Link from "next/link";
import { CateoryPostType } from "./Market";
import getBaseUrl from "@/lib/getbaseurl";
import { formatDate } from "@/components/Time";
import styles from "./page.module.css";

const MarketCard = async ({ item }: { item: CateoryPostType }) => {
  let blurdata;

  try {
    // Attempt to fetch blur data
    blurdata = item.image_big
      ? await getBaseUrl(
          `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_big}`
        )
      : undefined;
  } catch (error) {
    console.error("Error fetching blur data:", error);
    blurdata = undefined; // Fallback to undefined if there’s an error
  }

  // Use dummy image if blurdata is unavailable or item.image_big is missing
  const imageSrc = item.image_big
    ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_big}`
    : "/images/placeholderdummy.png";

  return (
    <div className="col-md-6 mb-3">
      <div className="card shadow mb-3 shadow-sm">
        <div className="row g-0">
          {/* Left: Image */}
          <div className="col-md-6">
            <Link className="link-style" href={`/post/${item.title_slug}`}>
              <div

                className={styles.postList_image_container}
              >
                <Image
                  src={imageSrc}
                  alt={item.title || "Placeholder"}
                  className="img-fluid rounded-start"
                  placeholder={blurdata ? "blur" : undefined}
                  blurDataURL={blurdata || "/images/placeholderdummy.png"}
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                  fill
                  style={{objectFit:'cover'}}
                />
              </div>
            </Link>
          </div>

          {/* Right: Content */}
          <div className="col-md-6">
            <div className="card-body d-flex flex-column justify-content-between h-100">
              {/* Title */}
              <Link className="link-style" href={`/post/${item.title_slug}`}>
                <h6 className="card-title">
                  {item.title.length > 30
                    ? `${item.title.slice(0, 40)}...`
                    : item.title}
                </h6>
              </Link>
              {/* Date */}
              <p className="card-text text-muted small mb-0">
                {formatDate(item.created_at)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
