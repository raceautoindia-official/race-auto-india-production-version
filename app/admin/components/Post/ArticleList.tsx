import React from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/components/Time";
import dynamic from "next/dynamic";
const Dropdownbuttons = dynamic(
  () => import("../../components/Post/Dropdownbuttons"),
  { ssr: false }
);
const AdminPaginateArticle = dynamic(() => import("./paginate"), {
  ssr: false,
});

export type adminPostList = {
  title_slug: any;
  image_small: string;
  is_slider: number;
  is_featured: number;
  is_breaking: number;
  is_recommended: number;
  color: string;
  main_category: string;
  sub_category: string;
  username: string;
  pageviews: number;
  id: number;
  title: string;
  created_at: any;
};
const ArticleList = async ({ page }: { page: string }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/admin-post?page=${
      page || 1
    }`,
    { cache: "no-store" }
  );
  const post = await res.json();

  const value: adminPostList[] = post.data;

  const totalCount = post.totalPost;

  return (
    <>
      <Link href="/admin/article/create">
        <button className="btn btn-primary my-3">Create</button>
      </Link>
      <div className="table-responsive">
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Post</th>
              <th scope="col">Category</th>
              <th scope="col">Author</th>
              <th scope="col">Views</th>
              <th scope="col">Date</th>
              <th scope="col">Actions</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminPaginateArticle totalCount={totalCount} />
    </>
  );
};

export default ArticleList;
