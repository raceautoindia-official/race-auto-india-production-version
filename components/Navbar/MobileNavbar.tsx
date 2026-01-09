import React from "react";
import styles from "@/styles/navbar.module.css";
import Link from "next/link";
import Subcategory from "./Subcategory";
import { mainMenu } from "./Navbar";
import { category } from "@/types/category";
import Image from "next/image";
import { IoMdMenu } from "react-icons/io";
import ThemeToggle from "../NextThemes";
import SearchBarServer from "../SearchBar/SearchBarServer";
import LoginNavButton from "../Navbuttons/LoginNavButton";

const MobileNavbar = ({
  Main_Category,
  morePagefiltered,
  logoData,
}: {
  Main_Category: category[];
  morePagefiltered: mainMenu[];
  logoData: {
    logo: string;
  };
}) => {
  return (
    <>
      <div className={styles.mobile_navbar}>
        <div className={styles.mobile_nav_menu}>
          <Link href="/">
            <Image
              src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData.logo}`}
              alt="logo header"
              width={40}
              height={40}
              className="ms-4 my-2"
            />
          </Link>
          <ThemeToggle />
          <Link href="/subscription">
            <button className={styles.subscribeButton}>Subscribe</button>
          </Link>
          <SearchBarServer />
          <LoginNavButton />

          <IoMdMenu
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasExample"
            aria-controls="offcanvasExample"
            size={25}
            className="me-3"
          />
        </div>

        <div
          className={`${styles.mobile_offcanvas} offcanvas offcanvas-start mt-4`}
          tabIndex={-1}
          id="offcanvasExample"
          aria-labelledby="offcanvasExampleLabel"
        >
          <div className="offcanvas-header">
            <h5 className="offcanvas-title w-100" id="offcanvasLabel"></h5>
            <button
              type="button"
              className="btn-close text-reset"
              data-bs-dismiss="offcanvas"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body small">
            <ul className="navbar-nav mr-auto">

              {Main_Category.map((item: category) => {
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
                  href="/insights"
                >
                  <span>INSIGHTS</span>
                </Link>
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
      </div>
    </>
  );
};

export default MobileNavbar;
