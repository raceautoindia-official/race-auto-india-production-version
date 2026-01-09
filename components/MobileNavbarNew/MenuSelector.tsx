"use client";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import styles from "./styles/MenuSelector.module.css";
import axios from "axios";
import Image from "next/image";
import { mainMenu } from "../Navbar/Navbar";
import Subcategory from "../Navbar/Subcategory";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MarketDropdown() {
  const router=useRouter();
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const [mainCategory, setMainCategory] = useState([]);
  const [subCategories, setSubCategories] = useState<{ [key: number]: any[] }>(
    {}
  );

  const [moreOption, setMoreOption] = useState<any>([]);

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

  const fetchSubCategory = async (mainCategoryId: number) => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${mainCategoryId}`
      );
      setSubCategories((prev) => ({
        ...prev,
        [mainCategoryId]: res.data,
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
        (item: mainMenu) =>
          item.parent_id == 7 && item.visibility == 1 && item.location == "main"
      );
      setMoreOption(morePagefiltered);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    main_category_api();
    fetchMoreApi();
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

  return (
    <>
      {mainCategory.map((item: any) => (
        <div className={styles.navMenuContainer} key={item.id}>
          <button
            className={styles.menuSelector}
            aria-haspopup="true"
            aria-expanded={openMenus[item.id] || false}
            aria-controls={`menu-${item.id}`}
            onClick={() => toggleMenu(item.id)}
          >
            <span className={styles.menuText}>{item.name}</span>
            <FaChevronDown className={styles.marketIcon} />
          </button>

          <ul
            id={`menu-${item.id}`}
            className={`${styles.marketList} ${
              openMenus[item.id] ? styles.show : styles.hide
            }`}
            role="menu"
          >
            {subCategories[item.id]?.length > 0 ? (
              subCategories[item.id].map((sub: any) => (
                <>
                  <Link
                    href={`/category/${
                      item.name_slug
                    }/${sub.name_slug.toLowerCase()}`}
                  >
                    <li key={sub.id} className={styles.marketItem}>
                      {sub.name}
                    </li>
                  </Link>
                  {sub.id !== Subcategory.length && <hr />}
                </>
              ))
            ) : (
              <li className={styles.marketItem}>Loading...</li>
            )}
          </ul>
        </div>
      ))}
      <div className={styles.navMenuContainer}>
        <button
          className={styles.menuSelector}
          aria-haspopup="true"
          aria-expanded={false}
          aria-controls={`menu-2`}
          onClick={() => toggleMenu(2)}
        >
          <span className={styles.menuText}>More</span>
          <FaChevronDown className={styles.marketIcon} />
        </button>

        <ul
          id={`menu-2`}
          className={`${styles.marketList} ${
            openMenus[2] ? styles.show : styles.hide
          }`}
          role="menu"
        >
          {moreOption?.length > 0 ? (
            moreOption.map((sub: any) => (
              <>
                <li key={sub.id} className={styles.marketItem}>
                  {sub.title}
                </li>
                <hr />
              </>
            ))
          ) : (
            <li className={styles.marketItem}>Loading...</li>
          )}
          <Link href="/page/contact">
          <li className={styles.marketItem}>Contact</li>
        </Link>
        <hr />
        <Link href="/page/terms-conditions">
          <li className={styles.marketItem}>Terms and Conditions</li>
        </Link>
        <hr />
        <Link href="/page/about-us">
          <li className={styles.marketItem}>About us</li>
        </Link>
        </ul>
        
      </div>
      <div className={styles.imageContainer}>
        <Link href="https://www.facebook.com/raceautoindia/">
          <Image
            src="/images/facebook (1) 1.png"
            alt="Brand Logo 1"
            width={35}
            height={35}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 30px, 35px"
            className={styles.brandLogo}
          />
        </Link>
        <Link href="https://x.com/raceautoindia">
          <Image
            src="/images/twitter (1) 1.png"
            alt="Brand Logo 2"
            width={35}
            height={35}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 30px, 35px"
            className={styles.brandLogoCenter}
          />
        </Link>
        <Link href="https://www.instagram.com/race.auto.india/">
          <Image
            src="/images/instagram (1) 1.png"
            alt="Brand Logo 3"
            width={35}
            height={35}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 30px, 35px"
            className={styles.brandLogoTop}
          />
        </Link>
        <Link href="https://www.linkedin.com/company/race-auto-india/">
          <Image
            src="/images/linkedin (1) 1.png"
            alt="Brand Logo 4"
            width={35}
            height={35}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 30px, 35px"
            className={styles.brandLogoMiddle}
          />
        </Link>
        <Link href="https://www.youtube.com/@RaceAutoIndia">
          <Image
            src="/images/youtube (1) 1.png"
            alt="Brand Logo 5"
            width={35}
            height={35}
            sizes="(max-width: 768px) 25px, (max-width: 1200px) 30px, 35px"
            className={styles.brandLogoEnd}
          />
        </Link>
      </div>
    </>
  );
}
