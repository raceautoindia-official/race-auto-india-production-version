/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import styles from "./forex.module.css";

const ForexRates = () => {
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_KEY = "54a14ec157cd41afa1ef8d5228c2e3b2"; // Replace with your Twelve Data API key
  const currencies = [
    { symbol: "USD/INR", name: "USD to INR" },
    { symbol: "EUR/INR", name: "EUR to INR" },
    { symbol: "GBP/INR", name: "GBP to INR" },
    { symbol: "CNY/INR", name: "CNY to INR" },
  ];

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const responses = await Promise.all(
          currencies.map((currency) =>
            axios.get(
              `https://api.twelvedata.com/exchange_rate?symbol=${currency.symbol}&apikey=${API_KEY}`
            )
          )
        );
        const fetchedRates: any = responses.map((response, index) => ({
          ...response.data,
          name: currencies[index].name,
        }));
        setRates(fetchedRates);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return <div className="text-center mt-1">Loading...</div>;
  }

  return (
    <div className={styles.stock_container} style={{ backgroundColor: "white" }}>
      <div className={`d-inline-flex ${styles.tickerContainer}`}>
        <div className={`badge bg-danger ${styles.liveBadge}`}>LIVE</div>
        <Swiper
          direction="vertical"
          slidesPerView={1}
          spaceBetween={0}
          loop={true}
          autoplay={{
            delay: 2000,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          style={{
            height: 25,
          }}
        >
          {rates.map((rate: any, index) => (
            <SwiperSlide key={index}>
              <div className="text-start">
                <span className={styles.currencyName}>{rate.name}</span>
                <span
                  className={`mx-2 ${
                    parseFloat(rate.rate_change) > 0
                      ? styles.positive
                      : styles.negative
                  }`}
                >
                  {parseFloat(rate.rate_change) > 0 ? "▲" : "▼"} {rate.rate}
                </span>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ForexRates;
