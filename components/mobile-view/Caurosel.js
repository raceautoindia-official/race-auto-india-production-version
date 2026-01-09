'use client';
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css/bundle'; // includes default Swiper styles

const services = [
  {
    title: 'Content Creation 📌',
    description:
      'Boost your brand with captivating website content that connects and converts. Ready to make an impact? Contact us today!',
  },
  {
    title: 'Advertising 🧃',
    description:
      'Amplify your brand with targeted, AI-driven website advertising that boosts engagement and drives growth. Ready to reach the right audience? Contact us today!',
  },
  {
    title: 'Branding 🎨',
    description:
      'Elevate your brand with dynamic website branding and mass communication powered by our in-house AI tool. Ready to lead the market? Contact us now!',
  },
  {
    title: 'Marketing Development 🧾',
    description:
      'Boost your business with expert digital marketing, lead generation, and website marketing development strategies. Need help growing your business? Contact us today!',
  },
];

function Caurosel() {
  return (
    <div style={{ maxWidth: '380px', margin: '0 auto', padding: '20px' }}>
      <h4 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px' }}>
        Our Services
      </h4>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={20}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        style={{ paddingBottom: '40px' }}
      >
        {services.map((service, idx) => (
          <SwiperSlide key={idx}>
            <div
              style={{
                backgroundColor: '#f8f9fa',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                padding: '16px',
                height: '150px',
              }}
            >
              <h6 style={{ fontWeight: 'bold', marginBottom: '8px' }}>{service.title}</h6>
              <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>{service.description}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default Caurosel;
