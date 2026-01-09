/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import styles from "./styles/BottomNavigation.module.css";
import Image from "next/image";
import { SearchInput } from "./SearchInput";
import { IoMdClose } from "react-icons/io";
import SearchStyles from "./styles/SearchBar.module.css";
import LoginNavButton from "../Navbuttons/LoginNavButton";
import Link from "next/link";
import { FaCalendarAlt, FaChevronDown } from "react-icons/fa";
import menuStyles from "./styles/MenuSelector.module.css";
import axios from "axios";
import { useRouter } from "next/navigation";
import { FiBarChart2, FiStar, FiCreditCard, FiMenu } from "react-icons/fi";
import { TbChartHistogram } from "react-icons/tb";
import PricingPlans from "../SubscriptionMobile/MobileCardSub";
import subscriptionStyles from "@/components/SubscriptionMobile/styles/subscriptionDropdown.module.css";
import { BiLineChart } from "react-icons/bi"; // Add this at the top

const MobileNavNew = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [subscriptionMenuVisible, setSubscriptionMVisible] = useState(false);

  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const [mainCategory, setMainCategory] = useState<any[]>([]);
  const [market, setMarket] = useState([]);
  const [subCategories, setSubCategories] = useState<{ [key: number]: any[] }>(
    {}
  );
  const [moreOption, setMoreOption] = useState<any[]>([]);
  const router = useRouter();
  const iconColor = "black";
  const iconSize = 28;

  const handleToggle = () => {
    setSubscriptionMVisible(!subscriptionMenuVisible);
  };

  const toggleMenuSlide = () => setMenuVisible((prev) => !prev);

  const main_category_api = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      const Main_Category = res.data
        .filter((item: any) => item.show_on_menu == 1)
        .sort((a: any, b: any) => a.category_order - b.category_order);
      setMainCategory(Main_Category);
    } catch (err) {
      console.log(err);
    }
  };

  const market_api = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/market`
      );
      const marketFilteredValue = res.data!.filter(
        (item: any) => item.show_on_menu == 1
      );
      setMarket(marketFilteredValue);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchSubCategory = async (mainCategoryId: number) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${mainCategoryId}`
      );

      const filteredSubCategories = res.data.filter(
        (item: any) => item.show_on_menu === 1
      );

      setSubCategories((prev) => ({
        ...prev,
        [mainCategoryId]: filteredSubCategories,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const fetchMoreApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/pages/main-menu`
      );
      const morePagefiltered = res.data.filter(
        (item: any) =>
          item.parent_id == 7 &&
          item.visibility == 1 &&
          item.location == "main" &&
          !["contact", "about-us", "terms-conditions"].includes(item.name_slug)
      );
      setMoreOption(morePagefiltered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    main_category_api();
    fetchMoreApi();
    market_api();
  }, []);

  const toggleMenu = (id: number) => {
    setOpenMenus((prev) => {
      const isOpening = !prev[id];
      if (isOpening && !subCategories[id]) {
        fetchSubCategory(id);
      }
      return {
        ...prev,
        [id]: isOpening,
      };
    });
  };

  const handleSubcategoryClick = (mainSlug: string, subSlug: string) => {
    router.push(`/category/${mainSlug}/${subSlug.toLowerCase()}`);
    setMenuVisible(false);
  };

  const handleMorePageClick = (path: string) => {
    router.push(path);
    setMenuVisible(false);
  };

  return (
    <>
      <div className={styles.mobile_navbar} style={{ color: "black" }}>
        <div
          style={{
            position: "fixed",
            zIndex: 9,
            top: 0,
            width: "100%",
            opacity: 0.7,
          }}
        >
          <div className={SearchStyles.searchBar} role="search">
            <Link href="/">
              <Image
                src="/images/black logo.png"
                alt="logo nav"
                width={35}
                height={35}
              />
            </Link>
            <SearchInput />
            <div className="ms-auto">
              <LoginNavButton />
            </div>
          </div>
        </div>

        <div
          className={`${styles.menuslide} ${
            menuVisible ? styles.slideUp : styles.hidden
          }`}
        >
          <div className={SearchStyles.searchBar} role="search">
            <Link href="/">
              <Image
                src="/images/black logo.png"
                alt="logo nav"
                width={35}
                height={35}
              />
            </Link>
            <SearchInput />
            <IoMdClose
              className={SearchStyles.closeButton}
              onClick={() => setMenuVisible(false)}
              style={{ cursor: "pointer" }}
            />
          </div>
          {/* News with All, Market, and Main Categories */}
<div className={menuStyles.navMenuContainer}>
  <button
    className={menuStyles.menuSelector}
    onClick={() => toggleMenu(999)}
  >
    <span className={menuStyles.menuText}>News</span>
    <FaChevronDown className={menuStyles.marketIcon} />
  </button>

  <ul
    className={`${menuStyles.marketList} ${
      openMenus[999] ? menuStyles.show : menuStyles.hide
    }`}
  >
    {/* --- All Categories Link --- */}
    <li
      className={menuStyles.marketItem}
      onClick={() => {
        router.push("/categories");
        setMenuVisible(false);
      }}
    >
      All
      <hr />
    </li>

    {/* --- Market Nested Under News --- */}
    <li>
      <button
        className={`${menuStyles.submenuItem} d-flex justify-content-between w-100`}
        onClick={() => toggleMenu(100)}
      >
        Market
        <FaChevronDown className="ms-auto" />
      </button>
      <ul
        className={`${menuStyles.subSubList} ${
          openMenus[100] ? menuStyles.show : menuStyles.hide
        }`}
      >
        {market.length > 0 ? (
          market.map((sub: any, i) => (
            <li
              key={sub.id}
              className={menuStyles.marketItem}
              onClick={() => {
                router.push(`/market/${sub.title_slug.toLowerCase()}`);
                setMenuVisible(false);
              }}
            >
              {sub.title}
              {i !== market.length - 1 && <hr />}
            </li>
          ))
        ) : (
          <li className={menuStyles.marketItem}>Loading...</li>
        )}
      </ul>
    </li>

    {/* --- Main Categories Nested --- */}
    {mainCategory.map((mainItem) => (
      <li key={mainItem.id}>
        <button
          className={`${menuStyles.submenuItem} d-flex justify-content-between w-100`}
          onClick={() => toggleMenu(mainItem.id)}
        >
          {mainItem.name}
          <FaChevronDown className="ms-auto" />
        </button>

        <ul
          className={`${menuStyles.subSubList} ${
            openMenus[mainItem.id] ? menuStyles.show : menuStyles.hide
          }`}
        >
          {subCategories[mainItem.id]?.map((sub, i) => (
            <li
              key={sub.id}
              className={menuStyles.marketItem}
              onClick={() =>
                handleSubcategoryClick(mainItem.name_slug, sub.name_slug)
              }
            >
              {sub.name}
              {i !== subCategories[mainItem.id].length - 1 && <hr />}
            </li>
          ))}
        </ul>
      </li>
    ))}
  </ul>
</div>

          {/* More Pages */}
          <div className={menuStyles.navMenuContainer}>
            <button
              className={menuStyles.menuSelector}
              onClick={() => toggleMenu(2)}
            >
              <span className={menuStyles.menuText}>More</span>
              <FaChevronDown className={menuStyles.marketIcon} />
            </button>
            <ul
              className={`${menuStyles.marketList} ${
                openMenus[2] ? menuStyles.show : menuStyles.hide
              }`}
            >
              {moreOption.map((sub, i) => (
                <li
                  key={sub.id}
                  className={menuStyles.marketItem}
                  onClick={() => handleMorePageClick(`/page/${sub.slug}`)}
                >
                  {sub.title}
                  {i !== moreOption.length - 1 && <hr />}
                </li>
              ))}
            </ul>
          </div>

          {/* Static Pages as Main Buttons (no dropdown) */}
          <div className={menuStyles.navMenuContainer}>
            <button
              className={menuStyles.menuSelector}
              onClick={() => handleMorePageClick("/insights")}
            >
              <span className={menuStyles.menuText}>Insights</span>
            </button>
          </div>
          <div className={menuStyles.navMenuContainer}>
            <button
              className={menuStyles.menuSelector}
              onClick={() => handleMorePageClick("/magazine")}
            >
              <span className={menuStyles.menuText}>E-Magazine</span>
            </button>
          </div>
          
          <div style={{ textAlign: "center", background: "white" }}>
            <div
              style={{
                display: "inline-flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  textDecoration: "underline",
                }}
                onClick={() => handleMorePageClick("/page/about-us")}
              >
                About Us
              </span>
              <span>|</span>
              <span
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  textDecoration: "underline",
                }}
                onClick={() => handleMorePageClick("/page/terms-conditions")}
              >
                T & C
              </span>
              <span>|</span>
              <span
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  textDecoration: "underline",
                }}
                onClick={() => handleMorePageClick("/page/contact")}
              >
                Contact
              </span>
              <span>|</span>
              <span
                style={{
                  cursor: "pointer",
                  color: "#007bff",
                  textDecoration: "underline",
                }}
                onClick={() => handleMorePageClick("/page/privacy")}
              >
                Privacy
              </span>
            </div>
          </div>

          {/* Social Icons */}
          <div className={menuStyles.imageContainer}>
            <Link href="https://www.facebook.com/raceautoindia/">
              <Image
                src="/images/facebook (1) 1.png"
                alt="Facebook"
                width={35}
                height={35}
                className={menuStyles.brandLogo}
              />
            </Link>
            <Link href="https://x.com/raceautoindia">
              <Image
                src="/images/twitter (1) 1.png"
                alt="Twitter"
                width={35}
                height={35}
                className={menuStyles.brandLogoCenter}
              />
            </Link>
            <Link href="https://www.instagram.com/race.auto.india/">
              <Image
                src="/images/instagram (1) 1.png"
                alt="Instagram"
                width={35}
                height={35}
                className={menuStyles.brandLogoTop}
              />
            </Link>
            <Link href="https://www.linkedin.com/company/race-auto-india/">
              <Image
                src="/images/linkedin (1) 1.png"
                alt="LinkedIn"
                width={35}
                height={35}
                className={menuStyles.brandLogo}
              />
            </Link>
            <Link href="https://www.youtube.com/@RaceAutoIndia">
              <Image
                src="/images/youtube (1) 1.png"
                alt="LinkedIn"
                width={35}
                height={35}
                className={menuStyles.brandLogo}
              />
            </Link>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className={styles.navigation}>
          <Link href="https://raceautoanalytics.com/flash-reports">
            <div className={styles.navItem}>
              <TbChartHistogram
                color={iconColor}
                size={iconSize}
                title="Flash Reports"
              />
              <span className={styles.caption}>Flash Reports</span>
            </div>
          </Link>

          <Link href="https://raceautoanalytics.com/forecast">
            <div className={styles.navItem}>
              <BiLineChart color={iconColor} size={iconSize} title="Forecast" />
              <span className={styles.caption}>Forecast</span>
            </div>
          </Link>

          <div className={styles.navItem} onClick={handleToggle}>
            <FiCreditCard
              color={iconColor}
              size={iconSize}
              title="Subscription"
            />
            <span className={styles.caption}>Subscription</span>
          </div>

          <Link href="/page/event">
            <div className={styles.navItem}>
              <FaCalendarAlt color={iconColor} size={iconSize} title="Events" />
              <span className={styles.caption}>Events</span>
            </div>
          </Link>

          <div
            className={styles.navItem}
            onClick={toggleMenuSlide}
            role="button"
          >
            <FiMenu color={iconColor} size={iconSize} title="Menu" />
            <span className={styles.caption}>Menu</span>
          </div>
        </div>
      </div>
      <div
        className={`${subscriptionStyles.subscription_menu_slide} ${
          subscriptionMenuVisible
            ? subscriptionStyles.subscription_menu_slideUp
            : subscriptionStyles.subscription_menu_hidden
        }`}
      >
        <PricingPlans hide={handleToggle} />
      </div>
    </>
  );
};

export default MobileNavNew;
