import db from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import "./latestNews.css";

export const revalidate = 60;

type NewsItem = {
  id: number;
  title: string;
  title_slug: string;
  summary: string;
  image_mid: string;
};

export default async function LatestNewsDesktop() {
  let newsItems: NewsItem[] = [];

  try {
    const [results] = await db.execute(
      "SELECT id, title, title_slug, summary, image_mid FROM posts ORDER BY id DESC LIMIT 4"
    );

    newsItems = Array.isArray(results) ? (results as NewsItem[]) : [];
  } catch (e) {
    console.error("LatestNewsDesktop DB error:", e);
  }

  return (
    <div className="container-fluid py-4 m-2">
      <div className="row">
        {newsItems.map((item) => (
          <div className="col-md-6 mb-4" key={item.id}>
            <div className="border-bottom pb-2">
              <div className="row g-2 align-items-center">
                <div className="col-lg-7">
                  <h6 className="fw-semibold mb-1 latest-title">{item.title}</h6>
                  <p className="mb-0 small latest-summary">{item.summary}</p>
                </div>

                <div className="col-lg-5">
                  <Link href={`/post/${item.title_slug}`}>
                    <div
                      className="latest-image"
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                      }}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_mid}`}
                        alt={item.title}
                        fill
                        className="rounded"
                        style={{ objectFit: "cover" }}
                        quality={60}
                        sizes="(max-width: 992px) 50vw, 260px"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
