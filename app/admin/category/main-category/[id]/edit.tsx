"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Edit_MainCategory = () => {
  const { id } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [color, setColor] = useState("");
  const [menuOrder, setMenuOrder] = useState<any>(0);
  const [showOnMenu, setShowOnMenu] = useState(false);
  const [showOnHomePage, setShowOnHomePage] = useState(false);
  const [blockType, setBlockType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formDataApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category/${id}`
      );
      setCategoryName(res.data[0].name);
      setDescription(res.data[0].description);
      setKeywords(res.data[0].keywords);
      setColor(res.data[0].color);
      setMenuOrder(res.data[0].category_order);
      setShowOnMenu(res.data[0].show_on_menu === 1);
      setShowOnHomePage(res.data[0].show_at_homepage === 1);
      setBlockType(res.data[0].block_type);
    } catch (err) {
      console.log(err);
    }
  };
  const EditApi = async () => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/category/main-category/${id}`,
        {
          categoryName,
          description,
          keywords,
          color,
          menuOrder,
          show_on_menu: showOnMenu ? 1 : 0,
          show_at_homepage: showOnHomePage ? 1 : 0,
          blockType,
        }
      );
      toast.success("Category updated!", {
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

  useEffect(() => {
    formDataApi();
  }, []);
  const handleSubmit = (e: any) => {
    e.preventDefault();
    EditApi();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <div className="shadow-sm p-3 mb-5  mt-5 bg-white rounded border-0">
          <Link href="/admin/category/main-category">
            <button className="btn btn-secondary mt-3">Back</button>
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
              <label htmlFor="menuOrder" className="form-label">
                Menu Order
              </label>
              <input
                type="number"
                className="form-control"
                id="menuOrder"
                value={menuOrder}
                onChange={(e) => setMenuOrder(e.target.value)}
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
            <div className="mb-3 form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="showOnHomePage"
                checked={showOnHomePage}
                onChange={(e) => setShowOnHomePage(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="showOnHomePage">
                Show on Home Page
              </label>
            </div>
            <div className="mb-3">
              <label className="form-label">Category Block Type</label>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="blockType"
                  id="blockType1"
                  value="block-1"
                  checked={blockType === "block-1"}
                  onChange={(e) => setBlockType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blockType1">
                  Type 1
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="blockType"
                  id="blockType2"
                  value="block-2"
                  checked={blockType === "block-2"}
                  onChange={(e) => setBlockType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blockType2">
                  Type 2
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="blockType"
                  id="blockType3"
                  value="block-3"
                  checked={blockType === "block-3"}
                  onChange={(e) => setBlockType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blockType3">
                  Type 3
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="blockType"
                  id="blockType4"
                  value="block-4"
                  checked={blockType === "block-4"}
                  onChange={(e) => setBlockType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blockType3">
                  Type 4
                </label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="blockType"
                  id="blockType5"
                  value="block-5"
                  checked={blockType === "block-5"}
                  onChange={(e) => setBlockType(e.target.value)}
                />
                <label className="form-check-label" htmlFor="blockType3">
                  Type 5
                </label>
              </div>
              {/* Add more radio buttons as needed */}
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

export default Edit_MainCategory;
