"use client";
import { category } from "@/types/category";
import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";

const Create_sub = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    keywords: "",
  });
  const [color, setColor] = useState("");
  const [main_category, setCategory_main] = useState("");
  const [mainCategory_array, setMainCategory_array] = useState([]);
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const Main_CategoryApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category`
      );
      setMainCategory_array(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const createApi = async () => {
    try {
      const apidata = { ...formData, color, parent_name: main_category };
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category`,
        apidata
      );
      toast.success("New Sub-category created!", {
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

  useEffect(() => {
    Main_CategoryApi();
  }, []);
  return (
    <>
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
            <Link href="/admin/category/sub-category">
              <button className="btn btn-secondary mb-3">Back</button>
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

              <div className="mb-3">
                <label htmlFor="mainCategory" className="form-label">
                  Main Category
                </label>
                <select
                  className="form-select"
                  id="mainCategory"
                  value={main_category}
                  onChange={(e) => setCategory_main(e.target.value)}
                >
                  <option value="">Select Main Category</option>
                  {mainCategory_array.map((category: category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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

export default Create_sub;
