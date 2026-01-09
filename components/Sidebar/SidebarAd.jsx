'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import Link from 'next/link';
import Skeleton from 'react-loading-skeleton';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Scrollbar } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/scrollbar';
import 'react-loading-skeleton/dist/skeleton.css';

export default function SidebarAdSwiper() {
  const [ads, setAds]        = useState([]);
  const [isLoading, setLoad] = useState(true);

  useEffect(() => {
    axios
      .get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/adspace/sidebar-ads`)
      .then(res => setAds(res.data))
      .catch(err => console.error('Sidebar ad load failed', err))
      .finally(() => setLoad(false));
  }, []);

  if (isLoading) {
    return (
      <div className="my-4">
        <Skeleton height={0} style={{ paddingTop: '100%' }} baseColor="#e2e8f0" highlightColor="#cbd5e1" />
      </div>
    );
  }

  if (!ads.length) return null;

  return (
    <div
      className="sidebar-ad-swiper my-4"
      style={{
        width: '100%',
        aspectRatio: '1 / 1',   // <-- Force square container
        position: 'relative',    // <-- Ensure Swiper absolutely fills it
      }}
    >
      <Swiper
        modules={[EffectFade, Autoplay]}
        effect="fade"
        loop
        autoplay={{ delay: 3000 }}
        speed={800}
        style={{
          width: '100%',
          height: '100%',       // <-- Fill the square
        }}
      >
        {ads.map(ad => {
          const imageUrl = `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${ad.image_url}`;
          return (
            <SwiperSlide key={ad.id}>
              <Link href={ad.link_url || '#'} target="_blank" legacyBehavior>
                <a
                  style={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    position: 'relative',   // <-- for Next/Image fill
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={`Sidebar Ad #${ad.id}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 600px) 100vw, 100vw"
                  />
                </a>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
