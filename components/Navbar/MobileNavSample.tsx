"use client";

import { useState } from "react";
import "./mobileNav.css";
import styles from "@/styles/navbar.module.css";
import { category } from "@/types/category";
import { mainMenu } from "./Navbar";
import Subcategory from "./Subcategory";
import MobileSubcategory from "./mobileSubCategory";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "../NextThemes";
import SearchBarServer from "../SearchBar/SearchBarServer";
import LoginNavButton from "../Navbuttons/LoginNavButton";

export default function MobileNavbarSample({
  Main_Category,
  morePagefiltered,
  logoData,
}: {
  Main_Category: category[];
  morePagefiltered: mainMenu[];
  logoData: {
    logo: string;
  };
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className={`header ${styles.mobile_navbar}`}>
      <div className="header-bar">
        <Link href="/">
          <Image
            src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData.logo}`}
            alt="logo header"
            width={30}
            height={30}
            className="ms-4"
          />
        </Link>
        <ThemeToggle />
        <SearchBarServer />
        <LoginNavButton />
        <button
          onClick={toggleMenu}
          className="hamburger"
          aria-controls="offCanvas"
          aria-expanded={isMenuOpen}
        >
          ☰
        </button>
      </div>

      {isMenuOpen && (
        <div id="offCanvas" className={`off-canvas ${styles.mobile_offcanvas}`}>
          <button
            onClick={toggleMenu}
            className="close-btn"
            aria-controls="offCanvas"
          >
            ✕
          </button>
          <ul className="category-list">
            {Main_Category.map((item: category) => {
              return (
                <li key={item.id} className={`nav-item dropdown mx-1 my-2`}>
                  <button
                    className={`${styles.dropdown_toggle} ${styles.nav_link} nav-link dropdown-toggle`}
                    id="navbarDropdown"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    {item.name.toUpperCase()}
                  </button>
                  <MobileSubcategory id={item.id} main={item.name_slug} />
                </li>
              );
            })}
            <li
              className={`${styles.dropdown} ${styles.nav_item} nav-item dropdown mx-1`}
            >
              <button
                className={`${styles.dropdown_toggle} ${styles.nav_link} nav-link dropdown-toggle`}
                id="navbarDropdown"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                MORE
              </button>
              <div
                className={`${styles.dropdown_menu_custom} dropdown-menu`}
                aria-labelledby="navbarDropdown"
              >
                {morePagefiltered.map((item: mainMenu) => (
                  <Link
                    key={item.id}
                    className={`${styles.dropdown_item} dropdown-item`}
                    href={`/page/${item.slug}`}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </li>
            <li className={`${styles.nav_item} nav-item`}>
              <Link
                className={`${styles.nav_home_btn} ${styles.nav_link} nav-link mx-2`}
                href="/magazine"
              >
                <span>E-MAGAZINE</span>
              </Link>
            </li>
          </ul>
          <Link href="/subscription">
            <button className={styles.subscribeButton}>Subscribe</button>
          </Link>
        </div>
      )}
    </header>
  );
}
