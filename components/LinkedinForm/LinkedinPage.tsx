/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable jsx-a11y/alt-text */
"use client";

import React from "react";
import SubscribeComponent from "./SubscribeForm";
import "./linkedin.css";
import Image from "next/image";

const LinkedinPage = () => {
  return (
    <>
      <h4 className="text-center mt-5 linkedin-heading">
        <b>
          Register your email, and we'll keep you informed about our latest
          content and events. Unsubscribe anytime.
        </b>
      </h4>

      <div className="row event_subscribe">
        <div className="col-md-4">
          <div className="linkedin-image-container">
            <a
              href="https://www.linkedin.com/company/race-auto-india/"
              target="_blank"
              rel="noreferrer"
              style={{ color: "inherit" }}
            >
              <div
                style={{
                  aspectRatio: "3.13/1",
                  width: "100%",
                  position: "relative",
                }}
              >
                <Image
                  src="/images/LinkedIn-Logo.wine.png"
                  fill
                  alt="linkedin image"
                  className="mt-2"
                />
              </div>
            </a>
          </div>
        </div>

        <div className="col-md-8">
          <SubscribeComponent />
        </div>
      </div>
    </>
  );
};

export default LinkedinPage;
