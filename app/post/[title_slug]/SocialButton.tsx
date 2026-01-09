"use client";
import React from "react";
import styles from "./page.module.css";

import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  LinkedinShareButton,
  LinkedinIcon,
  TwitterShareButton,
  TwitterIcon,
  EmailShareButton,
  EmailIcon,
} from "next-share";

import { SiGmail } from "react-icons/si"; // Gmail Icon (via react-icons)

const SocialButton = ({ title_slug }: { title_slug: string }) => {
  const shareUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}post/${title_slug}`;
  const gmailShareUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=&su=Check this out&body=${encodeURIComponent(
    `Here's something interesting I found:\n\n${shareUrl}`
  )}`;

  return (
    <div className={`${styles.logo_buttons_container} mt-2 d-flex gap-2`}>
      <FacebookShareButton url={shareUrl}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>

      <WhatsappShareButton url={shareUrl}>
        <WhatsappIcon size={32} round />
      </WhatsappShareButton>

      <LinkedinShareButton url={shareUrl}>
        <LinkedinIcon size={32} round />
      </LinkedinShareButton>

      <TwitterShareButton url={shareUrl}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>

      <EmailShareButton
        url={shareUrl}
        subject="Check this out!"
        body="Here's something interesting I found:"
      >
        <EmailIcon size={32} round />
      </EmailShareButton>

      <a
        href={gmailShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Share via Gmail"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "#D14836",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SiGmail color="white" size={18} />
        </div>
      </a>
    </div>
  );
};

export default SocialButton;
