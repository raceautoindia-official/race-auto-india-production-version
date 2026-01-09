"use client";
import { category } from "@/types/category";
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Edit_subCategory = () => {
  const { id } = useParams();

  const [categoryName, setCategoryName] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [showOnMenu, setShowOnMenu] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [main_category, setCategory_main] = useState("");
  const [mainCategory_array, setMainCategory_array] = useState([]);
  const formDataApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/${id}`
      );
      setCategoryName(res.data[0].name);
      setDescription(res.data[0].description);
      setKeywords(res.data[0].keywords);
      setShowOnMenu(res.data[0].show_on_menu === 1);
      setColor(res.data[0].color);
      setCategory_main(res.data[0].parent_id);
    } catch (err) {
      console.log(err);
    }
  };

  const EditApi = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/sub-category/${id}`,
        {
          categoryName,
          description,
          keywords,
          show_on_menu: showOnMenu ? 1 : 0,
          color,
          parent_id: main_category,
        }
      );
      toast.success("Updated!", {
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
      setIsSubmitting(false);
    }
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

  useEffect(() => {
    formDataApi();
    Main_CategoryApi();
  }, []);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    EditApi();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="shadow-sm p-3 mb-5  mt-5 bg-white rounded border-0">
          <Link href="/admin/category/sub-category">
            <button className="btn btn-secondary mb-3">Back</button>
          </Link>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="categoryName" className="form-label">
                Category Name
              </label>
              <input
                type="text"
                className="form-control"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="description" className="form-label">
                Description
              </label>
              <input
                className="form-control"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></input>
            </div>
            <div className="mb-3">
              <label htmlFor="keywords" className="form-label">
                Keywords
              </label>
              <input
                type="text"
                className="form-control"
                id="keywords"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
              />
            </div>

            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showOnMenu"
                checked={showOnMenu}
                onChange={(e) => setShowOnMenu(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showOnMenu">
                Show on Menu
              </label>
            </div>
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updated" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Edit_subCategory;
