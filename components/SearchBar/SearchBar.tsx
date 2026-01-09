"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { IoSearch } from "react-icons/io5";
import styles from "@/styles/navbar.module.css";
import { useRouter } from "next/navigation";
import React from "react";

const SearchBar = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [smShow, setSmShow] = useState(false);
  const handleKeyDown = (e: any) => {
    if (e.key === "Enter" && search.trim() !== "") {
      const searchItem = search.replace(/\s+/g, "-");
      return router.push(`/search/${searchItem}`);
    }
  };
  const handleSearchClick = () => {
    if (search.trim() !== "") {
      const searchItem = search.replace(/\s+/g, "-");
      return router.push(`/search/${searchItem}`);
    }
  };

  return (
    <>
      <IoSearch
        size={25}
        className={"mx-3"}
        onClick={() => setSmShow(!smShow)}
        style={{ cursor: "pointer" }}
      />
      <div
        className={`${styles.search_bar} d-flex justify-content-center ${
          smShow ? styles.visible : ""
        }`}
        style={{ maxWidth: 300 }}
      >
        <div>
          <input
            type="search"
            className="form-control rounded-0"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search here..."
            onKeyDown={handleKeyDown}
          />
        </div>
        <button
          className="btn"
          style={{ borderRadius: 0 }}
          onClick={handleSearchClick}
        >
          <FaSearch color="white" size={20} />
        </button>
      </div>
    </>
  );
};

export default SearchBar;
