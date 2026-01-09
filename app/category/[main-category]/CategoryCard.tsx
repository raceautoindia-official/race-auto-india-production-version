/* eslint-disable react/prop-types */

import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { CateoryPostType } from "./MainCategory";
import getBaseUrl from "@/lib/getbaseurl";
import { formatDate } from "@/components/Time";

const PostListCard = async ({ item }: { item: CateoryPostType }) => {


  return (
    <div className="mb-3 col-md-6">
      <div className="card shadow bg-transparent">
        <Link className="link-style" href={`/post/${item.title_slug}`}>
          <div className={styles.postList_image_container}>
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
              style={{objectFit:"cover"}}
              fill
              alt={item.title || "Placeholder"}
              priority
              sizes="(max-width: 480px) 50vw, (max-width: 768px) 40vw, (max-width: 1200px) 30vw, 20vw"
            />
          </div>
          <div className="card-body">
            <h6 className="mt-3 card_heading">
              {item.title.length > 40
                ? `${item.title.slice(0, 40)}...`
                : item.title}
            </h6>
            <p className="card-text small">{formatDate(item.created_at)}</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PostListCard;
