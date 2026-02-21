import React from "react";
import styles from "@/styles/navbar.module.css";
import Link from "next/link";
import SearchBarServer from "../SearchBar/SearchBarServer";
import Image from "next/image";
import ThemeToggle from "../NextThemes";
import LoginNavButton from "../Navbuttons/LoginNavButton";
import { Menu, MenuItem, SubMenu, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import Subcategory from "./SubcategorySubmenu";
import { FaBolt, FaChevronDown } from "react-icons/fa";
import { BsBarChartLineFill } from "react-icons/bs";
import MonthViewership from "./MonthlyViewrs";

export type mainMenu = {
  id: number;
  title: string;
  slug: string;
  parent_id: number;
  visibility: number;
  location: string;
};

const Navbar_V2 = async () => {
  const resposne = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`,
   {
    next: { revalidate: 600 },
  }
  );
  const data = await resposne.json();

  const logoResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/logo`,{
    next: { revalidate: 3600 },
  }
  );
  const logoData = await logoResponse.json();

  const marketResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/market`,{
    next: { revalidate: 600 },
  }
  );
  const marketData = await marketResponse.json();

  const marketFilteredValue = marketData.filter(
    (item: any) => item.show_on_menu == 1
  );

  const morepageResponse = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/pages/main-menu`,{
    next: { revalidate: 600 },}
  );
  const morePage = await morepageResponse.json();

  const morePagefiltered = morePage.filter(
    (item: mainMenu) =>
      item.parent_id == 7 && item.visibility == 1 && item.location == "main"
  );

  const Main_Category = data
    .filter((item: any) => item.show_on_menu == 1)
    .sort((a: any, b: any) => a.category_order - b.category_order);

  const insightsCategory = Main_Category.find(
    (cat: any) => cat.name_slug === "insights"
  );

  return (
    <div className={styles.navPosition}>
      <nav className={`${styles.navbar} navbar navbar-expand-lg navbar-light`}>
        <div className={styles.desktop_nav}>
          <div className={styles.d_navlogo}>
            <Link className="nav-link mx-2" href="/">
              <Image
                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${logoData[0].logo}`}
                alt="logo header"
                width={40}
                height={40}
                className="ms-4"
              />
            </Link>
          </div>

          <div className={styles.navigation_menu}>
            <ul className="navbar-nav me-auto">
              {/* NEWS Dropdown */}
              <li className="nav-item">
                <Menu
                  menuButton={
                    <MenuButton
                      className="btn btn-link d-flex align-items-center gap-1"
                      style={{
                        fontWeight: 800,
                        fontSize: 14,
                        color: "#5f5952",
                      }}
                    >
                      NEWS <FaChevronDown />
                    </MenuButton>
                  }
                  transition
                  transitionTimeout={100}
                >
                  <MenuItem>
                    <Link href="/categories">All NEWS</Link>
                  </MenuItem>
                  <SubMenu label="Market">
                    {marketFilteredValue.map((item: any) => (
                      <MenuItem key={item.id}>
                        <Link href={`/market/${item.title_slug.toLowerCase()}`}>
                          {item.title}
                        </Link>
                      </MenuItem>
                    ))}
                  </SubMenu>

                  {Main_Category.map((item: any) => (
                    <SubMenu label={item.name} key={item.id}>
                      <Subcategory id={item.id} main={item.name_slug} />
                    </SubMenu>
                  ))}
                </Menu>
              </li>

              {/* INSIGHTS Main Menu */}
             <li className="nav-item" style={{ fontWeight: 800 }}>
                <Link className="nav-link mx-2" href="/insights">
                  INSIGHTS
                </Link>
              </li>
              {/* EVENT Menu (formerly MORE) */}

              <li className="nav-item" style={{ fontWeight: 800 }}>
                <Link className="nav-link mx-2" href="/page/event">
                  EVENTS
                </Link>
              </li>
              <li className="nav-item" style={{ fontWeight: 800 }}>
                <Link className="nav-link mx-2" href="/magazine">
                  E-MAGAZINE
                </Link>
              </li>
              <li className="nav-item" style={{ fontWeight: 800 }}>
                <Link
                  className={`${styles.flash_link} nav-link mx-2`}
                  href="https://raceautoanalytics.com/flash-reports"
                >
                  <FaBolt className={styles.thunder_icon} size={13} />
                  FLASH REPORTS
                </Link>
              </li>
              <li className="nav-item" style={{ fontWeight: 800 }}>
                <Link
                  className={`${styles.flash_link} nav-link mx-2 d-flex align-items-center`}
                  href="https://raceautoanalytics.com/forecast"
                >
                  <BsBarChartLineFill
                    size={16}
                    className={styles.thunder_icon}
                    style={{ marginRight: 6, verticalAlign: "middle" }}
                  />
                  FORECAST
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.header_icons}>
            <div className="d-flex align-items-center">
              {/* <ThemeToggle /> */}
              {/* <MonthViewership /> */}
              <Link href="/subscription">
                <button className={`${styles.flash_link} nav-link mx-2 d-flex align-items-center`}>SUBSCRIBE</button>
              </Link>
              <SearchBarServer />
              <LoginNavButton />
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar_V2;
