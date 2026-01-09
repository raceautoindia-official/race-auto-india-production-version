'use client'
import React from 'react'
import ReactPlayer from 'react-player'

const ReportsVideo = ({url}:{url:string}) => {
  return (
    <ReactPlayer
        url={url}
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
        controls={true}
        loop={true}
        autoplay={true}
      />
  )
}

export default ReportsVideo