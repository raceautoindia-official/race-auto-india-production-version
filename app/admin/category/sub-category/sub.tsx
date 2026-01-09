"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { MdCreateNewFolder, MdDelete, MdModeEdit } from "react-icons/md";
import { Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Link from "next/link";
import { category } from "@/types/category";

const Sub_Category = () => {
  const [data, setData] = useState([]);
  const [smShow, setSmShow] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const subCategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    setSmShow(false);
    const toastId = toast.loading("Processing...");
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/${deleteId}`
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 5000,
      });
      subCategoryApi();
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
    subCategoryApi();
  }, []);
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
          <p>Are you sure you want to delete this Category?</p>
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
      <div className="col-12">
        <Link href="/admin/category/sub-category/create">
          <Button variant="primary" className="mt-3">
            Create
          </Button>
        </Link>
        <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
          <table className="table text-center">
            <thead className="bg-light">
              <tr>
                <th>Category Name</th>
                <th>Color</th>
                <th>Parent</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: category) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td style={{ backgroundColor: item.color, color: "white" }}>
                    {item.color}
                  </td>
                  <td>{item.parent}</td>
                  <td>
                    <Link href={`/admin/category/sub-category/${item.id}`}>
                      <button className="btn btn-primary me-3">
                        <MdModeEdit size={20} />
                      </button>
                    </Link>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setSmShow(true);
                        setDeleteId(item.id);
                      }}
                    >
                      <MdDelete size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default Sub_Category;
