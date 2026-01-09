import Link from "next/link";
import React from "react";
import {
  FaCopyright,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import "./footer.css";
import { FaXTwitter } from "react-icons/fa6";
import ScrollToTopLogo from "./ScrollToImage";

interface LogoData {
  logo_footer: string;
}

interface SettingsData {
  about_footer: string;
  copyright: string;
}

interface SocialData {
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
}

interface PageData {
  id: number;
  title: string;
  slug: string;
  location: string;
  visibility: number;
}

const Footer = async () => {
  const logoResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`
  );
  const logoData: LogoData[] = await logoResponse.json();

  const settingsResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings`
  );
  const settingsData: SettingsData[] = await settingsResponse.json();

  const socialResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/social-media`
  );

  const socialData: SocialData[] = await socialResponse.json();

  const pageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/pages`
  );
  const pageData: PageData[] = await pageResponse.json();
  const pageVisible = pageData.filter(
    (item) => item.location == "footer" && item.visibility == 1
  );

  return (
    <div className="footer mt-5 pb-2">
      <div className="container">
        <div className="row justify-content-center align-items-center mt-4">
          <div className=" col-md-2 mt-3">
            <div className="d-flex justify-content-center">
              <ScrollToTopLogo logoData={logoData[0].logo_footer} />
              {/* <Image
                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData[0].logo_footer}`}
                width={130}
                height={152}
                priority
                alt="logo_footer"
              /> */}
            </div>
          </div>
          <div className="my-3 col-md-7 col-lg-5 px-3 text-align-left">
            <p className="footer-detail">{settingsData[0].about_footer}</p>
          </div>

          <div className="col-md-2 justify-content-center">
            <div className="social-icons-footer">
              <a
                href={socialData[0].facebook_url}
                rel="noreferrer"
                target="_blank"
              >
                <FaFacebook className="fab fa-facebook" />
              </a>
              <a
                href={socialData[0].twitter_url}
                rel="noreferrer"
                target="_blank"
              >
                <FaXTwitter className="fab fa-twitter" />
              </a>
              <a
                href={socialData[0].instagram_url}
                rel="noreferrer"
                target="_blank"
              >
                <FaInstagram className="fab fa-instagram" />
              </a>
              <a
                href={socialData[0].linkedin_url}
                rel="noreferrer"
                target="_blank"
              >
                <FaLinkedin className="fab fa-linkedin" />
              </a>
              <a
                href={socialData[0].youtube_url}
                rel="noreferrer"
                target="_blank"
              >
                <FaYoutube className="fab fa-youtube" />
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-12 mt-2 "></div>
          <hr className="my-2" />
          <div className="row justify-content-center">
            <div className="col-12 col-md-auto ">
              <p className="ms-2 text-center px-1 my-2">
                <FaCopyright className="mb-1" />{" "}
                <b>{settingsData[0].copyright}</b>
              </p>
            </div>
            {pageVisible.map((item) => (
              <div className="col-6 col-md-auto mt-1 text-center" key={item.id}>
                <Link
                  href={`/page/${item.slug}`}
                  className="text-center px-1"
                  style={{
                    cursor: "pointer",
                    fontSize: "smaller",
                    fontWeight: 800,
                  }}
                >
                  {item.title}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
