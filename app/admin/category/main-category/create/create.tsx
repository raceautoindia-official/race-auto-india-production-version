"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const Create_Main = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    keywords: "",
    block_type: "",
  });
  const [color, setColor] = useState("");
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const createApi = async () => {
    try {
      const apidata = { ...formData, color };
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`,
        apidata
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
            <Link href="/admin/category/main-category">
              <button className="btn btn-secondary mt-3">Back</button>
            </Link>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter name"
                />
              </Form.Group>

              <Form.Group controlId="formDescription">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                />
              </Form.Group>

              <Form.Group controlId="formKeywords">
                <Form.Label>Keywords</Form.Label>
                <Form.Control
                  type="text"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="Enter keywords"
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

              <Form.Group controlId="formBlockType">
                <Form.Label>Block Type</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    label="block-1"
                    name="block_type"
                    value="block-1"
                    checked={formData.block_type === "block-1"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="block-2"
                    name="block_type"
                    value="block-2"
                    checked={formData.block_type === "block-2"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="block-3"
                    name="block_type"
                    value="block-3"
                    checked={formData.block_type === "block-3"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="block-4"
                    name="block_type"
                    value="block-4"
                    checked={formData.block_type === "block-4"}
                    onChange={handleChange}
                  />
                  <Form.Check
                    type="radio"
                    label="block-5"
                    name="block_type"
                    value="block-5"
                    checked={formData.block_type === "block-5"}
                    onChange={handleChange}
                  />
                </div>
              </Form.Group>

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

export default Create_Main;
