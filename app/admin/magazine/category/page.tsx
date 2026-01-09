export const dynamic = "force-dynamic";

import Link from "next/link";
import React from "react";
import { MdDelete, MdModeEdit } from "react-icons/md";

type magazineCategory = {
  id: number;
  title: string;
  color: any;
};

const page = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/category`,
    {
      cache: "no-store",
    }
  );
  const data = await res.json();

  return (
    <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
      <Link href="/admin/magazine/category/create">
        <button className="btn btn-primary my-3">Create</button>
      </Link>
      <table className="table text-center">
        <thead className="bg-light">
          <tr>
            <th>Category Name</th>
            <th>Color</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: magazineCategory) => (
            <tr key={item.id}>
              <td>{item.title}</td>

              <td style={{ backgroundColor: item.color, color: "white" }}>
                {item.color}
              </td>
              <td>
                <Link href={`/admin/magazine/category/edit/${item.id}`}>
                  <button className="btn btn-primary me-3">
                    <MdModeEdit size={20} />
                  </button>
                </Link>
                <button className="btn btn-danger">
                  <MdDelete size={20} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default page;
