import Link from "next/link";
import "../Varient.css";
import Image from "next/image";
import { varientproptype } from "@/types/varient";
import { formatDate } from "@/components/Time";

const SubcardV2_1 = ({ item }: varientproptype) => {
  return (
    <>
      <div className="mb-3 col-md-6">
        <div className="card card-no-bg">
          <Link className="link-style" href={`/post/${item.title_slug}`}>
            <div className="image-container">
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                className="varient-image"
                alt={item.title}
                fill
                priority
                sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
              />
            </div>
            <div className="card-body">
              <p className="mt-3 card-heading">{item.title}</p>
              <p className="card-text small">{formatDate(item.created_at)}</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default SubcardV2_1;
