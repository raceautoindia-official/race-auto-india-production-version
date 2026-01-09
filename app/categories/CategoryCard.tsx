/* eslint-disable react/prop-types */
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import { formatDate } from "@/components/Time";
import { CateoryPostType } from "../category/[main-category]/MainCategory";

const PostListCard = ({ item }: { item: CateoryPostType }) => {
  return (
    <div className="card shadow-sm border-0 h-100">
      <Link href={`/post/${item.title_slug}`} className="link-style text-decoration-none text-dark">
        <div className={styles.postList_image_container} style={{ position: "relative", height: "250px" }}>
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
            alt={item.title || "Post thumbnail"}
            fill
            style={{ objectFit: "cover" }}
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            priority
          />
        </div>

        <div className="card-body">
          <h6 className="fw-semibold mb-1" style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}>
            {item.title}
          </h6>

          <p className="text-muted small mb-1">{formatDate(item.created_at)}</p>

          {item.summary && (
            <p className="text-secondary small mb-0" style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}>
              {item.summary}
            </p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default PostListCard;
