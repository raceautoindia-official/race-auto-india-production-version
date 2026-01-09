import React from "react";
import "./aboutus.css"; // Add custom styles for hexagon shapes and background
import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
  return (
        <div
          className="row align-items-center text-white p-5"
          style={{
            backgroundImage: "url('/images/aboutus-banner.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            height: 600,
          }}
        >
          <div className="col-md-6">
            <h1 className="mb-4">Welcome to Race Auto India</h1>
            <p className="mb-4">
              Race Auto India is a B2B publication that offers insightful
              analysis on the latest news, views, and trends in the automotive
              industry and its associated sectors.
            </p>
            <Link href="/magazine"><button className="btn btn-light shadow">
              Read More <span aria-hidden="true">→</span>
            </button></Link>
          </div>
          <div className="col-md-6">
              <img src="/images/abt-hexa.png" alt="abt-hexa" className="img-fluid"/>
          </div>
        </div>

  );
};

export default HeroSection;
