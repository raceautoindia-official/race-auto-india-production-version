"use client";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const Create_newsLetterCategory = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [color, setColor] = useState("");

  const createApi = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/magazine/category`,
        {
          title,
          color,
        }
      );
      toast.success("Category created!", {
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
        <div className="col-lg-6">
          <div className="shadow-sm p-3 mb-5  mt-5 bg-white rounded border-0">
            <Link href="/admin/magazine/category">
              <button className="btn btn-secondary my-3">Back</button>
            </Link>
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

export default Create_newsLetterCategory;
