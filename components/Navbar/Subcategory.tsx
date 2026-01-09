import React from "react";
import styles from "@/styles/navbar.module.css";
import Link from "next/link";

type proptype = {
  id: number;
  main: string;
};

type Category = {
  id: number;
  name: string;
  name_slug: string;
  show_on_menu: number;
  category_order: number;
};

const Subcategory = async (props: proptype) => {
  const { id, main } = props;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${id}`
  );
  const data = await res.json();

  const filteredData = data.filter((item:Category)=>item.show_on_menu == 1)

  return (
    <div
      className={`${styles.dropdown_menu_custom} dropdown-menu`}
      aria-labelledby="navbarDropdown"
    >
      <Link
        className={`${styles.dropdown_item} dropdown-item`}
        href={`/category/${main.toLowerCase()}`}
      >
        All
      </Link>
      {filteredData.map((item: Category) => (
        <Link
          key={item.id}
          className={`${styles.dropdown_item} dropdown-item`}
          href={`/category/${main}/${item.name_slug.toLowerCase()}`}
        >
          {item.name}
        </Link>
      ))}
    </div>
  );
};

export default Subcategory;
