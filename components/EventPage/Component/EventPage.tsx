"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import styles from "./EventPage.module.css";
import EventCard_2 from "./EventCard-2";
import EventSwiper from "./Swiper";

const categories = [
  { id: 1, name: "Car", image: "/images/car.png" },
  { id: 2, name: "Bike", image: "/images/bike.png" },
  { id: 3, name: "CV", image: "/images/truck.png" },
  { id: 4, name: "Farming", image: "/images/agri.png" },
  { id: 5, name: "C & M", image: "/images/CM.png" },
  { id: 6, name: "Components", image: "/images/components.jpg" },
];


const regions = [
  { id: 1, name: "National" },
  { id: 2, name: "International" },
];

const EventPage = () => {
  const [data, setData] = useState<any>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/event?category=${
            selectedCategory || ""
          }&region=${selectedRegion || ""}`
        );

        setData(res.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, [selectedCategory, selectedRegion]);

  const handleCategoryChange = (value: number | null) => {
    setSelectedCategory(value);
  };

  const handleRegionChange = (value: number | null) => {
    setSelectedRegion(value);
  };

  return (
    <div className="container-fluid py-3 bg-dark" style={{color:'black'}}>
      <EventSwiper />

      {/* Mobile Dropdowns */}
      <div className="d-block d-md-none mb-3 px-3">
        <select
          className="form-select mb-2"
          onChange={(e) =>
            handleCategoryChange(parseInt(e.target.value) || null)
          }
          value={selectedCategory || ""}
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          onChange={(e) => handleRegionChange(parseInt(e.target.value) || null)}
          value={selectedRegion || ""}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: Category Image Filters */}
      <div className="row d-none d-md-flex justify-content-center g-3 mx-4 mt-4">
        {categories.map((cat) => (
          <div key={cat.id} className="col-6 col-sm-4 col-md-2 text-center">
            <div
              className={`rounded shadow-sm ${styles.cardWrapper} ${
                selectedCategory === cat.id ? styles.selected : ""
              }`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <Image
                src={cat.image}
                alt={cat.name}
                width={300}
                height={300}
                className="img-fluid rounded"
              />
              <div className={styles.overlayText}>{cat.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Region Select */}
      <div className="d-none d-md-block text-center mt-4 mb-3">
        <select
          className="form-select w-auto d-inline"
          onChange={(e) => handleRegionChange(parseInt(e.target.value) || null)}
          value={selectedRegion || ""}
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Event Cards */}
      <div className="row g-3 mx-4">
        {data.length === 0 ? (
          <div className="text-center text-light mt-4">
            No events found for selected filters.
          </div>
        ) : (
          data.map((item: any) => <EventCard_2 key={item.id} item={item} />)
        )}
      </div>
    </div>
  );
};

export default EventPage;
