"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const Create_Market = () => {
  const [title, setTitle] = useState("");
  const [show_on_menu, setShow_on_menu] = useState(false);
  const [color, setColor] = useState("");

  const createApi = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/market`,
        { title, show_on_menu, color }
      );
      toast.success("Market category created!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    createApi();
  };
  return (
    <>
      <div className="row justify-content-center">
        <Link href="/admin/market">
          <button className="btn btn-secondary mb-3">Back</button>
        </Link>
        <div className="col-lg-6">
          <div className="shadow-sm p-3 mb-5  mt-5 bg-white rounded border-0">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter name"
                />
              </Form.Group>

              <div className="mb-3">
                <label htmlFor="color" className="form-label">
                  Color
                </label>
                <input
                  type="color"
                  className="form-control"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="showOnMenu"
                  checked={show_on_menu}
                  onChange={(e) => setShow_on_menu(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showOnMenu">
                  Show on Menu
                </label>
              </div>

              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Create_Market;
