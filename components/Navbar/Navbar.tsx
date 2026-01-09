import React from "react";
import styles from "@/styles/navbar.module.css";
import Subcategory from "./Subcategory";
import Link from "next/link";
import SearchBarServer from "../SearchBar/SearchBarServer";
import Image from "next/image";
import MobileNavbar from "./MobileNavbar";
import { category } from "@/types/category";
import { marketType } from "@/app/admin/market/market";
import ThemeToggle from "../NextThemes";
import LoginNavButton from "../Navbuttons/LoginNavButton";
import MobileNavbarSample from "./MobileNavSample";
import ForexRates from "../Stocks/Forex";
import ReportsDropdown from './ReportsButton'

export type mainMenu = {
  id: number;
  title: string;
  slug: string;
  parent_id: number;
  visibility: number;
  location: string;
};

const Navbar = async () => {
  const resposne = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`,
    { cache: "no-store" }
  );

  const data: category[] = await resposne.json();

  const logoResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`
  );
  const marketResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/market`
  );

  const marketData = await marketResponse.json();

  const marketFilteredValue = marketData.filter(
    (item: any) => item.show_on_menu == 1
  );

  const logoData = await logoResponse.json();

  const morepageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/pages/main-menu`
  );

  const morePage = await morepageResponse.json();

  const morePagefiltered = morePage.filter(
    (item: mainMenu) =>
      item.parent_id == 7 && item.visibility == 1 && item.location == "main"
  );

  const Main_Category = data
    .filter((item) => item.show_on_menu == 1)
    .sort((a, b) => a.category_order - b.category_order);

  return (
    <div className={styles.navPosition}>
      <nav
        className={`${styles.navbar} ${styles.navbar_expand_lg} ${styles.nav_details} navbar navbar-expand-lg navbar-light`}
      >
        <div className={styles.desktop_nav}>
          <div className={styles.d_navlogo}>
            <Link
              className={`${styles.nav_home_btn} ${styles.nav_link} nav-link mx-2`}
              href="/"
            >
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData[0].logo}`}
                alt="logo header"
                width={40}
                height={40}
                className="ms-4"
              />
            </Link>
            <button
              className="navbar-toggler"
              type="button"
              data-toggle="collapse"
              data-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          </div>
          <div className={styles.navigation_menu}>
            <div
              className="collapse navbar-collapse"
              id="navbarSupportedContent"
            >
              <ul className="navbar-nav mr-auto">
                {/* <li className={`${styles.nav_item} nav-item`}>
                  <Link
                    className={`${styles.nav_home_btn} ${styles.nav_link} nav-link mx-2`}
                    href="/"
                  >
                    <span>Home</span>
                  </Link>
                </li> */}
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
                    MARKET
                  </button>
                  <div
                    className={`${styles.dropdown_menu_custom} dropdown-menu`}
                    aria-labelledby="navbarDropdown"
                  >
                    {marketFilteredValue.map((item: marketType) => (
                      <Link
                        key={item.id}
                        className={`${styles.dropdown_item} dropdown-item`}
                        href={`/market/${item.title_slug.toLowerCase()}`}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </li>
                {Main_Category.map((item) => {
                  return (
                    <li
                      key={item.id}
                      className={`${styles.dropdown} ${styles.nav_item} nav-item dropdown mx-1`}
                    >
                      <button
                        className={`${styles.dropdown_toggle} ${styles.nav_link} nav-link dropdown-toggle`}
                        id="navbarDropdown"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        {item.name.toUpperCase()}
                      </button>
                      <Subcategory id={item.id} main={item.name_slug} />
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
            </div>
          </div>
          <div className={styles.header_icons}>
            <div className="d-flex align-items-center">
              <ThemeToggle />
              <ReportsDropdown/>
              <Link href="/subscription">
                <button className={styles.subscribeButton}>Subscribe</button>
              </Link>
              <SearchBarServer />
              <LoginNavButton />
            </div>
          </div>
        </div>
      </nav>
      {/* <MobileNavbar
        logoData={logoData[0]}
        morePagefiltered={morePagefiltered}
        Main_Category={Main_Category}
      /> */}
      {/* <MobileNavbarSample  logoData={logoData[0]}
        morePagefiltered={morePagefiltered}
        Main_Category={Main_Category}/> */}
      {/* <ForexRates /> */}
    </div>
  );
};

export default Navbar;
