"use client";
import { magazineCardType } from "@/app/magazine/Magazine";
import { formatDate } from "@/components/Time";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";

const Magazine = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [smShow, setSmShow] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const magazineApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine`
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/magazine/${deleteId}`
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      magazineApi();
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

  useEffect(() => {
    magazineApi();
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
          <p>Are you sure you want to delete this item?</p>
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
      <Link href="/admin/magazine/create">
        <button className="btn btn-primary my-3">Create</button>
      </Link>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Magazine</th>
            <th scope="col">Date</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item: magazineCardType) => (
            <tr key={item.id}>
              <th scope="row">{item.id}</th>
              <td>
                <div className="d-flex">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                    alt={item.title}
                    width={80}
                    height={80}
                    unoptimized
                  />
                  <p className="p-0 ms-5">{item.title}</p>
                </div>
              </td>
              <td>{formatDate(item.created_date)}</td>
              <td>
                <button className="btn btn-primary me-3">
                  <MdModeEdit
                    size={20}
                    onClick={() =>
                      router.push(`/admin/magazine/edit/${item.id}`)
                    }
                  />
                </button>
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
    </>
  );
};

export default Magazine;
