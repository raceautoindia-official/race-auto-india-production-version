import React from "react";
import Link from "next/link";
import SubCardV3 from "./Varient3_card2";
import Image from "next/image";
import { varient } from "@/types/varient";
import "../Varient.css";
import { formatDate } from "@/components/Time";
type VarientProps = {
  item: varient[]; // Array of Variant objects
  Three: varient[]; // Array of Variant objects
};

const Varient3 = ({ item, Three }: VarientProps) => {
  const data2 = item.map((item) => <SubCardV3 key={item.id} item={item} />);
  return (
    <>
      <div className="col-md-6">
        <div className="row">
          {Three.map((item) => (
            <div className="col-12" key={item.id}>
              <div className="h-100 card mb-3 card-no-bg">
                <Link className="link-style" href={`/post/${item.title_slug}`}>
                  <div className="image-container">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                      className="varient-image"
                      alt={
                       item.title
                      }
                      fill
                      priority
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
                    />
                  </div>
                  <div className="card-body">
                    <h6 className="mt-3 card-heading">{item.title}</h6>
                    <p className="card-text small">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="col-md-6">{data2}</div>
    </>
  );
};

export default Varient3;
