"use client";

import * as React from "react";
import styles from "./styles/SearchBar.module.css";
import { SearchInput } from "./SearchInput";
import Image from "next/image";
import { IoMdClose } from "react-icons/io";


export const SearchBar: React.FC = () => {
  return (
    <div className={styles.searchBar} role="search">
      <Image src='/images/black logo.png' alt='logo nav' width={35} height={35}/>
      <SearchInput />
      <IoMdClose className={styles.closeButton}/>
    </div>
  );
};

export default SearchBar;
