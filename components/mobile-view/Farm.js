import React from 'react';
import Image from 'next/image';

const Farm = ({ data = [] }) => {
  const fallbackImage = '/default-vehicle.png'; // Place this in your /public directory

  // If no props are passed, use sample data for fallback
  const newsItems = data.length > 0 ? data : [
    {
      title: 'TIL Limited Rolls out 400th Hyster-TIL ReachStacker',
      subtitle:
        'Kolkata – material handling equipment manufacturer, has unveiled its 400th Hyster-TIL ReachStacker,…',
      image: '/race/image-7.png',
    },
    {
      title: 'TIL Limited Rolls out 400th Hyster-TIL ReachStacker',
      subtitle:
        'Kolkata – material handling equipment manufacturer, has unveiled its 400th Hyster-TIL ReachStacker,…',
     image: '/race/image-7.png',
    },
    {
      title: 'TIL Limited Rolls out 400th Hyster-TIL ReachStacker',
      subtitle:
        'Kolkata – material handling equipment manufacturer, has unveiled its 400th Hyster-TIL ReachStacker,…',
      image: '/race/image-7.png',
    },
  ];

  return (
    <div className="container-fluid py-2">
      <h3 className="fw-bold mb-4">Farm EQ</h3>
      <div className="row g-3">
        {newsItems.map((item, index) => (
          <div key={index} className="col-12">
            <div className="row g-0 align-items-center bg-white rounded p-2 shadow-sm">
              
              <div className="col">
                <h6 className="mb-1 fw-bold">{item.title}</h6>
                <p className="mb-0 text-muted small">{item.subtitle}</p>
              </div>
              <div className="col-auto">
                <div style={{ width: 100, height: 80, position: 'relative' }}>
                  <Image
                    src={item.image || fallbackImage}
                    alt="Vehicle Image"
                    fill
                    className="rounded object-fit-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Farm;
