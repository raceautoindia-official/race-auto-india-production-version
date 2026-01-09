import React from "react";
import Varient1 from "./Varients/Varient 1/V1";
import Varient3 from "./Varients/Varient 3/V3";
import Varient2 from "./Varients/Varient 2/V2";
import Varient5 from "./Varients/Varient 5/Varient5";
import Varient4 from "./Varients/Varient 4/Varient4";
import { catgeorypropType } from "@/types/category";
import Varient6 from "./Varients/Varient 6/V6";
import "@/components/HomeCategories/Varients/Varient.css";
import Image from "next/image";
import Link from "next/link";
import { formatDate } from "../Time";

type varient = {
  id: number;
  title: string;
  title_slug: string;
  image_mid: string;
  summary:string;
  created_at: any;
};

const HomeCategories = async ({ item }: catgeorypropType) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/home-category?main=${item.name_slug}`,
    { cache: "no-store" }
  );

  const rawData = await res.json();

  // Ensure the response is an array
  const data: varient[] = Array.isArray(rawData) ? [...rawData] : [];

  if (!Array.isArray(data)) {
    console.error("API response is not an array:", rawData);
    return null;
  }

  const v3Single = data.slice(0, 1);
  const twoData = data.slice(0, 2);
  const threeData = data.slice(0, 3);
  const v2data = data.slice(0, 6);
  const v3data = data.slice(3, 10);

  return (
    <>
      <div className="d-flex justify-content-between mt-2 align-items-center">
        <h2 className="">
          <span
            className="home-component-heading"
            style={{
              borderLeft: `5px solid ${item.color}`,
              fontWeight: "700",
              fontStyle: "normal",
              padding: 5,
              paddingLeft: 10,
            }}
          >
            {item.name}
          </span>
        </h2>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="row mt-3">
            {item.block_type == "block-1" &&
              threeData.map((item) => <Varient1 key={item.id} item={item} />)}
            {item.block_type == "block-2" && <Varient2 item={v2data} />}

            {item.block_type == "block-3" && <Varient6 item={v2data} />}
            {item.block_type == "block-4" &&
              data
                .map((item) => <Varient4 key={item.id} item={item} />)
                .slice(0, 2)}
            {item.block_type == "block-5" && (
              <Varient5 item={v3data} single={v3Single} three={threeData}/>
            )}
          </div>
        </div>
      </div>
      <div className="w-100 mt-1 mb-1">
    <hr style={{ borderTop: "1px solid #ccc", margin: 0 }} />
  </div>
      {/* <div className="row home_categories_mobile">
        <div className="mb-3 col-12">
          <div className="card card-no-bg" style={{ height: "100%" }}>
            <Link
              className="link-style"
              href={`/post/${v3Single[0].title_slug}`}
            >
              <div className="image-container">
                <Image
                  src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${v3Single[0].image_mid}`}
                  className="varient-image"
                  alt={v3Single[0].title}
                  fill
                  priority
                  sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 25vw, 15vw"
                />
              </div>
              <div className="card-body">
                <p className="mt-3 card-heading">{v3Single[0].title}</p>
                <p className="card-text small">
                  {formatDate(v3Single[0].created_at)}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default HomeCategories;
