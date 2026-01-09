import React from 'react';
import Image from 'next/image';

const videoList = new Array(3).fill({
  thumbnail: '/race/2.png',
  title: 'IT Solution - Race Auto India',
  duration: '1:20',
});

function Vedio() {
  return (
    <>
      <h5 className="fw-bold mb-3">RACE Videos</h5>
      <div className="row">
        <div className="col-md-8 mb-3">
          <div className="ratio ratio-16x9">
            <iframe
              src="https://www.youtube.com/embed/OaMdY8yc2F8"
              title="YouTube video"
              allowFullScreen
            ></iframe>
          </div>
        </div>
        <div className="col-md-4">
          {videoList.map((video, idx) => (
            <div className="d-flex mb-3" key={idx}>
              <div style={{ width: '250px', height: '175px', position: 'relative' }}>
                <Image
                  src={video.thumbnail}
                  alt="thumbnail"
                  fill
                  className="object-fit-cover rounded"
                />
              </div>
              <div className="ms-2">
                <p className="mb-1 small fw-semibold">{video.title}</p>
                <p className="mb-0 small text-muted">{video.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* <div className="mt-4">
        <Image
          src="/race/3.png"
          alt="Footer Banner"
          width={1200}
          height={150}
          className="img-fluid rounded"
        />
      </div> */}
    </>
  );
}

export default Vedio;
