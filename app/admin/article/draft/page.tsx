export const dynamic = "force-dynamic";

import db from "@/lib/db";
import React from "react";
import { adminPostList } from "../../components/Post/ArticleList";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/components/Time";
import { RiFileEditFill } from "react-icons/ri";
import Dropdownbuttons from "../../components/Post/Dropdownbuttons";

const page = async () => {
  const [post] =
    await db.execute(`SELECT posts.id, posts.image_small, posts.title, posts.pageviews, posts.title_slug, posts.created_at, 
         posts.user_id, posts.is_slider, posts.is_breaking, posts.is_featured, 
         posts.category_id, categories.color AS color, categories.name_slug AS name_slug, 
         categories.parent_id AS parent_id, categories.name AS sub_category, 
         users.username AS username 
  FROM posts 
  INNER JOIN users ON posts.user_id = users.id
  INNER JOIN categories ON posts.category_id = categories.id 
  WHERE posts.status = 0`);

  const value = post as adminPostList[];
  if (value.length == 0) {
    return (
      <div
        style={{
          textAlign: "center",
          margin: "20px auto",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
          maxWidth: "400px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <RiFileEditFill
          style={{ fontSize: "3rem", color: "grey", marginBottom: "10px" }}
        />
        <p style={{ fontSize: "1.2rem", color: "#333", fontWeight: "500" }}>
          No posts have been saved in draft
        </p>
      </div>
    );
  }
  return (
    <>
      <div className="">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Post</th>
              <th scope="col">Category</th>
              <th scope="col">Author</th>
              <th scope="col">Views</th>
              <th scope="col">Date</th>
              <th scope="col">Actions #1</th>
              <th scope="col">Actions #2</th>
            </tr>
          </thead>
          <tbody>
            {value.map((item) => (
              <tr key={item.id}>
                <th scope="row">{item.id}</th>
                <td>
                  <div className="d-flex align-items-center">
                    <Link
                      className="link-style"
                      href={`/post/${item.title_slug}`}
                    >
                      <Image
                        src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_small}`}
                        width={80}
                        height={45}
                        alt={item.title}
                      />
                    </Link>
                    <p className="ms-3 text-small p-0 m-0">{item.title}</p>
                  </div>
                  <div>
                    {item.is_slider == 1 && (
                      <span
                        className="mx-1"
                        style={{
                          backgroundColor: "brown",
                          borderRadius: 25,
                          fontSize: 11,
                          padding: 5,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        Slider
                      </span>
                    )}
                    {item.is_featured == 1 && (
                      <span
                        className="mx-1"
                        style={{
                          backgroundColor: "grey",
                          borderRadius: 25,
                          fontSize: 11,
                          padding: 5,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        featured
                      </span>
                    )}
                    {item.is_breaking == 1 && (
                      <span
                        className="mx-1"
                        style={{
                          backgroundColor: "red",
                          borderRadius: 25,
                          fontSize: 11,
                          padding: 5,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        Breaking
                      </span>
                    )}
                    {item.is_recommended == 1 && (
                      <span
                        className="mx-1"
                        style={{
                          backgroundColor: "green",
                          borderRadius: 25,
                          fontSize: 11,
                          padding: 5,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        Exclusive
                      </span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="d-flex table-badge flex-column">
                    <p
                      className="text-small px-2 mb-3"
                      style={{
                        backgroundColor: item.color,
                        borderRadius: 25,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {item.main_category}
                    </p>
                    <p
                      className="text-small px-2 "
                      style={{
                        backgroundColor: item.color,
                        borderRadius: 25,
                        fontSize: 11,
                        fontWeight: 700,
                        color: "white",
                      }}
                    >
                      {item.sub_category}
                    </p>
                  </div>
                </td>
                <td>{item.username}</td>
                <td>{item.pageviews}</td>
                <td>{formatDate(item.created_at)}</td>
                <td>
                  <Dropdownbuttons item={item} />
                </td>
                <td>
                  <Link href={`/admin/article/${item.id}`}>
                    <button className="btn btn-primary mb-1">Edit</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default page;
