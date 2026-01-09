"use client";
import React from "react";
import dynamic from "next/dynamic";
import { Row, Col } from "react-bootstrap";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const Video = () => {
  const mainVideo = "https://youtu.be/bcsHCDUXlLk?si=HKhhVvE6rZYRAhv6";
  const sideVideos = [
    "https://youtu.be/1jAcqciupyg",
    "https://youtu.be/S047CpPdrcI",
  ];

  return (
    <Row className=" g-4">
      <h2 style={{ fontWeight: 700 }}>Race Videos</h2>
      {/* Main Large Video */}
      <Col md={8}>
        <div style={{ position: "relative", paddingTop: "56.25%" }}>
          <ReactPlayer
            url={mainVideo}
            controls
            playing
            muted
            loop
            width="100%"
            height="100%"
            style={{ position: "absolute", top: 0, left: 0 }}
            config={{
              file: {
                attributes: {
                  autoPlay: true,
                  muted: true,
                },
              },
            }}
          />
        </div>
      </Col>

      {/* Side Videos */}
      <Col md={4}>
        {sideVideos.map((url, index) => (
          <div
            key={index}
            style={{
              marginBottom: "1rem",
              position: "relative",
              paddingTop: "56.25%", // 16:9 aspect ratio
            }}
          >
            <ReactPlayer
              url={url}
              controls
              muted
              loop
              width="100%"
              height="100%"
              style={{ position: "absolute", top: 0, left: 0 }}
              config={{
                file: {
                  attributes: {
                    autoPlay: false,
                    muted: true,
                  },
                },
              }}
            />
          </div>
        ))}
      </Col>
    </Row>
  );
};

export default Video;
