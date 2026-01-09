import React from "react";
import { SearchData } from "./SearchPage";
import Image from "next/image";
import Link from "next/link";
import getBaseUrl from "@/lib/getbaseurl";
import { formatDate } from "@/components/Time";

const SearchCard = async ({ item }: { item: SearchData }) => {
 let blurdata;

  try {
    // Attempt to fetch blur data
    blurdata = item.image_mid
      ? await getBaseUrl(
          `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
        )
      : undefined;
  } catch (error) {
    console.error("Error fetching blur data:", error);
    blurdata = undefined; // Fallback to undefined if there’s an error
  }

  // Use dummy image if blurdata is unavailable or item.image_mid is missing
  const imageSrc = item.image_mid
    ? `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`
    : "/images/placeholderdummy.png";

  return (
    <div className="col-12 mt-3" key={item.id}>
      <Link className="link-style" href={`/post/${item.title_slug}`}>
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
              src={imageSrc}
              fill
              alt={item.title || "Placeholder"}
              priority
              placeholder={blurdata ? "blur" : undefined}
              blurDataURL={blurdata || "/images/placeholderdummy.png"}
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
            />
            </div>
          </div>
          <div className="col-md-8">
            <h4>{item.title}</h4>
            <p>{formatDate(item.created_at)}</p>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SearchCard;
