/* eslint-disable react/prop-types */
import Image from "next/image";
import Link from "next/link";
import styles from "../HomeBanner.module.css";
import { formatDate } from "@/components/Time";

type Feature = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_mid: string;
  summary: string;
  created_at: string; // assume ISO string
};

type Props = {
  item: Feature;
};

const FeatureCard_4 = async ({ item }: Props) => {


  // Format date

  return (
    <div className="col-12 ms-2   ">
      <div className={`row ${styles.featureCardRow} mb-2`}>
        {/* Left: image */}
        <div className="col-md-5 p-0">
          <Link href={`/post/${item.title_slug}`}>
            <div className={styles.imageWrapper}>
              <Image
                src={process.env.NEXT_PUBLIC_S3_BUCKET_URL + item.image_mid}
                alt={item.title}
                fill
                className={styles.featured__image}
                placeholder="blur"
blurDataURL="/images/dummy_600x400_ffffff_cccccc (1).png"
                sizes="(max-width: 768px) 100vw, (min-width: 769px) 50vw"

              />
            </div>
          </Link>
        </div>

        {/* Right: text */}
        <div className="col-md-7 d-flex flex-column justify-content-center">
          <Link
            href={`/post/${item.title_slug}`}
            className="text-decoration-none"
          >
            <p className={styles.featureTitle}>{item.title.slice(0, 30)}...</p>
          </Link>
          {/* <p className={styles.featureSummary}>
            {item.summary.length > 50
              ? item.summary.slice(0, 50) + "…"
              : item.summary}
          </p> */}
          {/* <div className={styles.featureDate}>
            {formatDate(item.created_at)}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard_4;
