"use client";

import axios from "axios";
import { Button, Modal } from "react-bootstrap";
import { MdCreateNewFolder, MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import Link from "next/link";
import { eventType } from "@/app/page/event/eventCard";
import { useEffect, useState } from "react";
import Image from "next/image";

const Event_v2 = () => {
  const [data, setData] = useState([]);
  const [smShow, setSmShow] = useState(false);
  const [deleteId, setDeleteId] = useState(0);

  const eventList = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event`
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/event/${deleteId}`
      );
      toast.update(toastId, {
        render: "Successfully removed!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      eventList();
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
    eventList();
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
      <div className="col-12">
        <Link href="/admin/event/create">
          <Button variant="primary" className="mt-3">
            Create
          </Button>
        </Link>
        <div className="row">
          {data.map((item: eventType) => (
            <div className="col-md-4 mt-4" key={item.id}>
              <div className="card">
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "16/9",
                    position: "relative",
                  }}
                >
                  <Image
                    src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${item.image_url}`}
                    fill
                    alt={item.title}
                  />
                </div>
                <h6 className="my-3 text-center">{item.event_date}</h6>
                <div className="d-flex justify-content-center mb-3">
                  <Link href={`/admin/event/${item.id}`}>
                    <button className="btn btn-primary me-3">
                      <MdModeEdit size={20} />
                    </button>
                  </Link>
                  <button className="btn btn-danger">
                    <MdDelete
                      size={20}
                      onClick={() => {
                        setSmShow(true);
                        setDeleteId(item.id);
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Event_v2;
