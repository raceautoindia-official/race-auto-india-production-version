"use client";
import { magazineCardType } from "@/app/magazine/Magazine";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";

const Magazine_v2 = () => {
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
      <div className="row">
        {data.map((item: magazineCardType) => (
          <div className="col-md-6 mb-3" key={item.id}>
            <div className="card shadow mb-3 shadow-sm">
              <div className="row g-0">
              
                <div className="col-md-4">
                <Link
                      className="link-style"
                      href={`/magazine/${item.title_slug}`}
                    >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16/9",

                      width: "100%",
                    }}
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                      alt={item.title || "Placeholder"}
                      className="img-fluid rounded-start"
                      sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  </Link>
                </div>

                {/* Right: Content */}
                <div className="col-md-8">
                  <div className="card-body d-flex flex-column justify-content-between h-100">
                    {/* Title */}
                    
                      <h6 className="card-title">{item.title}</h6>
                   

                    <div>
                      <button className="btn btn-primary me-3" onClick={() =>
                            router.push(`/admin/magazine/edit/${item.id}`)
                          }>
                        <MdModeEdit
                          size={20}
                          
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
                      <span className="ms-3">Views: {item.magazine_views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Magazine_v2;
