/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatDate } from "@/components/Time";
import dynamic from "next/dynamic";
import axios from "axios";
import { Button, Col, Dropdown, Form, Modal, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCheck } from "react-icons/fa";
import { MdClose } from "react-icons/md";

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
const ArticleListV2 = ({ page }: { page: string }) => {
  const router = useRouter();
  const [data, setData] = useState<adminPostList[]>([]);
  const [mainCategory_array, setMainCategory_array] = useState([]);
  const [subCategory_array, setSubCategory_array] = useState([]);
  const [marketArray, setMarketArray] = useState([]);
  const [category_main, setCategory_main] = useState("");
  const [category_sub, setCategory_sub] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState("");
  const [users, setUsers] = useState([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [smShow, setSmShow] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const query = `username=${selectedUsers}&mainCategory=${category_main}&subCategory=${category_sub}&market=${marketValue}&create
At=${scheduledAt}&page=${page || 1}`;

  const handleRemoveAvailable = async (id: number, type: string) => {
    const toastId = toast.loading("Processing...");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/available/${type}`,
        {
          id: id,
        }
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      postApi();
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to remove!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.log(err);
    }
  };

  const handleAddAvailable = async (id: number, type: string) => {
    const toastId = toast.loading("Processing...");
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/add-available/${type}`,
        {
          id: id,
        }
      );
      toast.update(toastId, {
        render: "Successfully Added!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      postApi();
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to Add!",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      console.log(err);
    }
  };

  const postApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/admin-post?${query}`
      );
      setData(res.data.data);
      setTotalCount(res.data.totalPost);
    } catch (err) {
      console.log(err);
    }
  };

  const userApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/post-user`
      );
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const categoryApi = async () => {
    try {
      const mainCategoryRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      setMainCategory_array(mainCategoryRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const marketApi = async () => {
    try {
      const marketRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/market`
      );
      setMarketArray(marketRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const subCategoryApi = async () => {
    if (
      category_main === "none" ||
      category_main === undefined ||
      category_main === ""
    ) {
      setSubCategory_array([]);
      return;
    }

    try {
      const subCategoryRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/parent/${category_main}`
      );
      setSubCategory_array(subCategoryRes.data); // Set subcategory data if API call is successful
    } catch (err) {
      console.log(err); // Handle error
    }
  };

  const handleDelete = async () => {
    setSmShow(false);
    const toastId = toast.loading("Processing...");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/post/delete/${deleteId}`
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      postApi();
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to remove!",
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    postApi();
  }, [page]);

  useEffect(() => {
    categoryApi();
    marketApi();
    userApi();
  }, []);

  useEffect(() => {
    subCategoryApi();
  }, [category_main]);
  //   const value: adminPostList[] = post.data;

  //   const totalCount = post.totalPost;

  return (
    <>
      <Modal
        size="sm"
        show={smShow}
        onHide={() => setSmShow(false)}
        aria-labelledby="example-modal-sizes-title-sm"
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title id="example-modal-sizes-title-sm">
            Delete Confirmation
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this Article?</p>
          <div className="d-flex justify-content-evenly">
            <button
              className="btn btn-secondary"
              onClick={() => setSmShow(false)}
            >
              cancel
            </button>
            <button className="btn btn-warning" onClick={handleDelete}>
              Yes
            </button>
          </div>
        </Modal.Body>
      </Modal>
      <Link href="/admin/article/create">
        <button className="btn btn-primary my-3">Create</button>
      </Link>
      <div className="mb-4">
        <Form>
          <Row className="">
            <Col md={2}>
              <Form.Group controlId="filterUsers">
                <Form.Label className="form-label">Users</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedUsers}
                  onChange={(e) => setSelectedUsers(e.target.value)}
                  required
                >
                  <option value="">None</option>
                  {users.map((item: any) => (
                    <option key={item.user_id} value={item.user_id}>
                      {item.username}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group controlId="filterMainCategory">
                <Form.Label className="form-label">Category</Form.Label>
                <Form.Control
                  as="select"
                  value={category_main}
                  onChange={(e) => setCategory_main(e.target.value)}
                  required
                >
                  <option value="">None</option>
                  {mainCategory_array.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="filterSubCategory">
                <Form.Label className="form-label">Sub Category</Form.Label>
                <Form.Control
                  as="select"
                  value={category_sub}
                  onChange={(e) => setCategory_sub(e.target.value)}
                  required
                >
                  <option value="">None</option>
                  {subCategory_array.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="filterMarketCategory">
                <Form.Label className="form-label">Market</Form.Label>
                <Form.Control
                  as="select"
                  value={marketValue}
                  onChange={(e) => setMarketValue(e.target.value)}
                  required
                >
                  <option value="">None</option>
                  {marketArray.map((item: any) => (
                    <option key={item.id} value={item.id}>
                      {item.title}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group controlId="schedule">
                <Form.Label className="form-label">Date</Form.Label>
                <Form.Control
                  type="month"
                  name="schedule"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="form-input"
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Button
                variant="primary"
                onClick={postApi}
                style={{ marginTop: 32 }}
              >
                Apply Filters
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
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
              <th scope="col">Actions #1</th>
              <th scope="col">Actions #2</th>
            </tr>
          </thead>
          <tbody>
            {data.length == 0 && <p className="text-muted text-center">No posts available for the selected filter.</p>}
            {data.map((item) => (
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
                  <Dropdown>
                    <Dropdown.Toggle variant="info" id="dropdown-basic">
                      Actions
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {item.is_breaking == 1 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleRemoveAvailable(item.id, "is_breaking")
                          }
                        >
                          <FaCheck color="green" /> Breaking
                        </Dropdown.Item>
                      )}
                      {item.is_breaking == 0 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleAddAvailable(item.id, "is_breaking")
                          }
                        >
                          <MdClose size={20} color="red" /> Breaking
                        </Dropdown.Item>
                      )}
                      {item.is_featured == 1 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleRemoveAvailable(item.id, "is_featured")
                          }
                        >
                          <FaCheck color="green" /> Featured
                        </Dropdown.Item>
                      )}
                      {item.is_featured == 0 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleAddAvailable(item.id, "is_featured")
                          }
                        >
                          <MdClose size={20} color="red" /> Featured
                        </Dropdown.Item>
                      )}
                      {item.is_recommended == 1 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleRemoveAvailable(item.id, "is_recommended")
                          }
                        >
                          <FaCheck color="green" /> Exclusive
                        </Dropdown.Item>
                      )}
                      {item.is_recommended == 0 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleAddAvailable(item.id, "is_recommended")
                          }
                        >
                          <MdClose size={20} color="red" /> Exclusive
                        </Dropdown.Item>
                      )}
                      {item.is_slider == 1 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleRemoveAvailable(item.id, "is_slider")
                          }
                        >
                          <FaCheck color="green" /> Slider
                        </Dropdown.Item>
                      )}
                      {item.is_slider == 0 && (
                        <Dropdown.Item
                          onClick={() =>
                            handleAddAvailable(item.id, "is_slider")
                          }
                        >
                          <MdClose size={20} color="red" /> Slider
                        </Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
                </td>
                <td>
                  <Link href={`/admin/article/${item.id}`}>
                    <button className="btn btn-primary mb-1">Edit</button>
                  </Link>{" "}
                  <button
                    className="btn btn-danger mt-1"
                    onClick={() => {
                      setSmShow(true);
                      setDeleteId(item.id);
                    }}
                  >
                    Delete
                  </button>
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

export default ArticleListV2;
