"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./styles/SearchBar.module.css";
import { FaSearch } from "react-icons/fa";

export const SearchInput: React.FC = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      const searchItem = search.trim().replace(/\s+/g, "-");
      router.push(`/search/${searchItem}`);
    }
  };

  const handleSearchClick = () => {
    if (search.trim() !== "") {
      const searchItem = search.trim().replace(/\s+/g, "-");
      router.push(`/search/${searchItem}`);
    }
  };

  return (
    <div className={styles.searchWrapper}>
      <div className={styles.searchContainer}>
        <FaSearch className={styles.searchIcon} onClick={handleSearchClick} style={{ cursor: "pointer" }} />
        <input
          type="text"
          className={styles.searchPlaceholder}
          placeholder="Search here"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};
