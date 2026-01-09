"use client";
import React from 'react';
import Image from 'next/image';

const defaultImages = [
  '/race/6.png',
  '/race/7.png',
  '/race/8.png',
  '/race/9.png',
  '/race/10.png',
];

function Slider({ image }) {
  const images = image && image.length > 0 ? image : defaultImages;

  return (
    <div className="container-fluid mt-5 border-bottom border-2">
      <div
        id="magazineCarousel"
        className="carousel slide"
        data-bs-ride="carousel"
      >
        <div className="carousel-inner">
          {images.map((src, index) => (
            <div
              key={index}
              className={`carousel-item ${index === 0 ? 'active' : ''}`}
            >
              <div className="d-flex justify-content-center align-items-center flex-column">
                <div className="magazine-wrapper">
                  <Image
                    src={src}
                    alt={`Magazine ${index + 1}`}
                    width={300}
                    height={450}
                    className="img-fluid magazine-image"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#magazineCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" />
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#magazineCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" />
        </button>
      </div>

      <style jsx>{`
        .carousel-inner {
          overflow: visible;
        }

        .carousel-item {
          text-align: center;
          transition: transform 0.5s ease;
          min-height: 500px;
        }

        .magazine-wrapper {
          transition: transform 0.5s ease;
        }

        .carousel-item.active .magazine-wrapper {
          transform: scale(1.2);
        }

        .magazine-image {
          border: 2px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          width: 100%;
          height: auto;
          max-width: 300px;
        }
      `}</style>
    </div>
  );
}

export default Slider;
