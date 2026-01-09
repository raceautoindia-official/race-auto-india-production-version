"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { MdCreateNewFolder, MdDelete, MdModeEdit } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

type pageType = {
  id: number;
  title: string;
  location: string;
  visibility: number;
};
const Admin_page = () => {
  const [data, setData] = useState([]);

  const pageApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/pages`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    pageApi();
  }, []);
  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
        <table className="table text-center">
          <thead className="bg-light">
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Visibility</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: pageType) => (
              <tr key={item.id}>
                <td>{item.title}</td>

                <td>{item.location}</td>
                <td>{item.visibility ? <FaEye /> : <FaEyeSlash />}</td>
                <td>
                  <Link href={`/admin/page/${item.id}`}>
                    <button className="btn btn-primary me-3">
                      <MdModeEdit size={20} />
                    </button>
                  </Link>
                  {/* <button className="btn btn-danger">
                    <MdDelete size={20} onClick={() => handleDelete(item.id)} />
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin_page;
