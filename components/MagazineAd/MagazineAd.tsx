import Image from "next/image";
import Link from "next/link";

type magazineAd = {
  title: string;
  edition_name: string;
  description: string;
  thumbnail: string;
};
const MagazineAd = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine-ad`,
    { cache: "no-store" }
  );
  const data: magazineAd[] = await res.json();

  return (
    <>
      <div className="row mt-4 justify-content-center align-items-center">
        <div className="col-12 col-lg-8">
          <h6 style={{ fontSize: "3rem", fontWeight: 900 }}>{data[0].title}</h6>
          <p style={{ fontSize: "1rem" }}>{data[0].edition_name}</p>
          <p style={{ fontSize: "1rem" }}>{data[0].description}</p>
        </div>
        <div className="col-lg-4">
          <div
            style={{ width: "100%", position: "relative", aspectRatio: "2.05/1" }}
          >
            <Link href='/magazine'><Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${data[0].thumbnail}`}
              alt="Responsive image"
              quality={75}
              fill
              priority
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 75vw, (max-width: 1200px) 40vw, 25vw"
            /></Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MagazineAd;
