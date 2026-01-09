import React from "react";
import Link from "next/link";
import { MenuItem, SubMenu } from "@szhsin/react-menu";

type SubcategoryProps = {
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

const Subcategory = async ({ id, main }: SubcategoryProps) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${id}`
  );
  const data: Category[] = await res.json();
  const filteredData = data.filter((item) => item.show_on_menu === 1);

  return (
    <>
      <MenuItem>
        <Link
          className="dropdown-item"
          href={`/category/${main.toLowerCase()}`}
        >
          All
        </Link>
      </MenuItem>
      {filteredData.map((item) => (
        <MenuItem key={item.id}>
          <Link
            className="dropdown-item"
            href={`/category/${main}/${item.name_slug.toLowerCase()}`}
          >
            {item.name}
          </Link>
        </MenuItem>
      ))}
    </>
  );
};

export default Subcategory;
