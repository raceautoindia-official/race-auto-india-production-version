import Image from "next/image";
import Link from "next/link";
import "./exclusive.css";

const ExclusiveNews = ({ item }: { item: any }) => {
  return (
    <div
      className=""
      style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}
    >
      <Link href={`/post/${item.title_slug}`} replace>
        <Image
          src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_default}`}
          alt={item.title}
          fill
          
        />
      </Link>
      {/* Overlay */}
      {/* <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div> */}

      {/* Title Banner at Bottom */}
    </div>
  );
};

export default ExclusiveNews;
