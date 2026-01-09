"use client"
import React from "react";
import dynamic from 'next/dynamic'
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });

const Video = () => {
  return (
    <ReactPlayer
      url="https://youtu.be/K11J7kKKeZw"
      controls
      height="325px"
      width="100%"
      playing
      muted
      loop
      config={{
        file: {
          attributes: {
            autoPlay: true,
            muted: true,
          },
        },
      }}
    />
  );
};

export default Video;
