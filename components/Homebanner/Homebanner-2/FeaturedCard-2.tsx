import Image from "next/image";
import Link from "next/link";
import styles from "../HomeBanner.module.css";
import getBaseUrl from "@/lib/getbaseurl";
import { formatDate } from "@/components/Time";

type Feature = {
  id: number;
  title: string;
  title_slug: string;
  image_big: string;
  image_mid:string;
  created_at: any;
};

type Proptype = {
  item: Feature;
  key: number;
};

const FeatureCard_2 = async (props: Proptype) => {
  const { item } = props;

  return (
     <div className="col-12 mb-3">
      <Link className="link-style" href={`/post/${item.title_slug}`}>
        <div
          className={`${styles.banner__hover_v3}`}
          style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
        >
          <Image
            src={process.env.NEXT_PUBLIC_S3_BUCKET_URL + `${item.image_mid}`}
            alt={item.title}
            className={styles.featured__image}
            fill
            placeholder="blur"
            blurDataURL="/images/dummy_600x400_ffffff_cccccc (1).png"
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
          />
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              width: "100%",
              height: "25px",
              backgroundColor: "rgba(0, 0, 0, 0.5)", // 50% opacity black background
              display: "flex",
              color: "white",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3, // Place above the image
              textAlign: "center",
              padding: "1rem",
            }}
          >
            <h6 style={{ fontWeight: "bold", margin: 0, fontSize: 12 }}>
              {item.title.length <= 35
                ? item.title
                : `${item.title.slice(0, 35)}...`}
            </h6>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FeatureCard_2;
