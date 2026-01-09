/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import React from "react";
import "./aboutus.css";
const MiddleSection = () => {
  return (
    <>
      <div className="row mt-5">
        <div className="col-12">
          <h1 className="text-center mb-5">WHO WE ARE</h1>
          <p className="text-justified">
            With over 10 years of experience in the field of Commercial
            Vehicles, Logistics, and Market Research, the team at Race Auto
            India comprises distinguished experts who have a proven track record
            of delivering high-quality researched content.
          </p>

          <p className="text-justified">
            Our team of journalists have extensive experience in reporting on
            the latest news, views, and trends in the automotive industry,
            strive to provide our readers with comprehensive insights that
            enable them to make informed business decisions and stay ahead of
            the competition. In addition to our team's expertise, Race Auto
            India also features exclusive content from industry leaders,
            interviews with top executives, and in-depth quantitative researched
            data. This allows us to offer a unique perspective on the commercial
            vehicle industry and its associated sectors, providing our readers
            with unparalleled insights and analysis.
          </p>
        </div>
      </div>
      <div className="row my-5 gx-5">
        <div className="col-sm-8">
          <div className="row">
            <div className="col-12">
              <h3 className="mb-4">
                <span className="about_us_border">Our Mission</span>
              </h3>
              <p className="text-justified">
                Our mission is to engage the largest and most desirable audience
                through our broadcast and digital platforms, empowering our
                clients and partners to achieve their business and strategic
                objectives with our innovative products and services.
              </p>
            </div>
            <div className="col-12 mt-3">
              <h3 className="mb-4">
                <span className="about_us_border">Our Vision</span>
              </h3>
              <p className="text-justified">
                Transforming digital media leadership through research-driven
                analytics and real-time market insights for strategic
                decision-making.​
              </p>
            </div>
          </div>
        </div>
        <div className="col-sm-4">
            <div className="d-flex justify-content-center">
            <img src='/images/abt-business.png' alt='abt-business' className="img-fluid"/>
            </div>
        </div>
      </div>
    </>
  );
};

export default MiddleSection;
