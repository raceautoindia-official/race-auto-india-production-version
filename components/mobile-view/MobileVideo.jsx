"use client";
import React from "react";
import dynamic from "next/dynamic";

const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const MobileVideo = () => {
  return (
    <div
      style={{
        position: "relative",
        paddingTop: "56.25%", // 16:9 Aspect Ratio (for responsive height)
      }}
    >
      <ReactPlayer
        url="https://youtu.be/bcsHCDUXlLk?si=HKhhVvE6rZYRAhv6"
        controls
        playing
        muted
        loop
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
        }}
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
  );
};

export default MobileVideo;
