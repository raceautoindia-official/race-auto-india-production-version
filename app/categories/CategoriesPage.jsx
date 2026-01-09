"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import ReactPaginate from "react-paginate";
import { Row, Col, Button, Offcanvas } from "react-bootstrap";
import PostCard from "./CategoryCard";
import "./filter.css"; // ✅ Your CSS below must be in this file

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function PostsPage() {
  const [mainCategory_array, setMainCategory_array] = useState([]);
  const [subCategory_array, setSubCategory_array] = useState([]);
  const [marketArray, setMarketArray] = useState([]);

  const [filters, setFilters] = useState({
    mainCategory: "",
    subCategory: "",
    market: "",
  });
  const [tempFilters, setTempFilters] = useState(filters);
  const [posts, setPosts] = useState([]);
  const [totalPost, setTotalPost] = useState(0);
  const [page, setPage] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const limit = 10;
  const totalPages = Math.ceil(totalPost / limit);

  useEffect(() => {
    categoryApi();
    marketApi();
  }, []);

  useEffect(() => {
    if (tempFilters.mainCategory) subCategoryApi();
    else setSubCategory_array([]);
  }, [tempFilters.mainCategory]);

  useEffect(() => {
    fetchPosts();
  }, [filters, page]);

  const categoryApi = async () => {
    try {
      const res = await axios.get(`${BACKEND}api/category/main-category`);
      setMainCategory_array(res.data);
    } catch (err) {
      console.error("Main category fetch error:", err);
    }
  };

  const marketApi = async () => {
    try {
      const res = await axios.get(`${BACKEND}api/category/market`);
      setMarketArray(res.data);
    } catch (err) {
      console.error("Market fetch error:", err);
    }
  };

  const subCategoryApi = async () => {
    try {
      const res = await axios.get(`${BACKEND}api/category/sub-category/parent/${tempFilters.mainCategory}`);
      setSubCategory_array(res.data);
    } catch (err) {
      console.error("Subcategory fetch error:", err);
    }
  };

  const fetchPosts = async () => {
    const params = new URLSearchParams({
      page: (page + 1).toString(),
      mainCategory: filters.mainCategory,
      subCategory: filters.subCategory,
      market: filters.market,
    });

    try {
      const res = await axios.get(`/api/admin/categories-post?${params}`);
      setPosts(res.data.data);
      setTotalPost(res.data.totalPost);
    } catch (err) {
      console.error("Post fetch error:", err);
    }
  };

  const applyFilters = () => {
    setFilters(tempFilters);
    setPage(0);
    setShowFilters(false);
  };

  const handlePageClick = ({ selected }) => {
    setPage(selected);
  };

  const getCategoryName = (id, arr) => arr.find((item) => item.id + "" === id)?.name || "";

  const headingText = () => {
    const main = getCategoryName(filters.mainCategory, mainCategory_array);
    const sub = getCategoryName(filters.subCategory, subCategory_array);
    const market = getCategoryName(filters.market, marketArray);
    const parts = [main, sub, market].filter(Boolean);
    return parts.length ? `Posts: ${parts.join(" / ")}` : "All Posts";
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">{headingText()}</h3>
        <Button variant="primary" onClick={() => setShowFilters(true)}>
          Show Filters
        </Button>
      </div>

      {/* Filter Offcanvas */}
      <Offcanvas show={showFilters} onHide={() => setShowFilters(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {/* Main Category */}
          <div className="mb-4">
            <label className="fw-bold mb-2">Main Category</label>
            <div className="d-flex flex-wrap gap-2">
              {mainCategory_array.map((cat) => {
                const isActive = tempFilters.mainCategory === cat.id;
                return (
                  <span
                    key={cat.id}
                    className={`filter-badge ${isActive ? "active" : ""}`}
                    onClick={() =>
                      setTempFilters((p) => ({
                        ...p,
                        mainCategory: cat.id,
                        subCategory: "",
                      }))
                    }
                  >
                    {cat.name || cat.title}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Sub Category */}
          {subCategory_array.length > 0 && (
            <div className="mb-4">
              <label className="fw-bold mb-2">Sub Category</label>
              <div className="d-flex flex-wrap gap-2">
                {subCategory_array.map((sub) => {
                  const isActive = tempFilters.subCategory === sub.id;
                  return (
                    <span
                      key={sub.id}
                      className={`filter-badge ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setTempFilters((p) => ({
                          ...p,
                          subCategory: sub.id,
                        }))
                      }
                    >
                      {sub.name || sub.title}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Market */}
          <div className="mb-4">
            <label className="fw-bold mb-2">Market</label>
            <div className="d-flex flex-wrap gap-2">
              {marketArray.map((mkt, index) => {
                const id = mkt.id + "";
                const isActive = tempFilters.market === id;
                return (
                  <span
                    key={id}
                    className={`filter-badge ${isActive ? "active" : ""}`}
                    onClick={() =>
                      setTempFilters((p) => ({
                        ...p,
                        market: id,
                      }))
                    }
                  >
                    {mkt.title || mkt}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-grid gap-2">
            <Button variant="primary" onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="outline-secondary"
              onClick={() =>
                setTempFilters({
                  mainCategory: "",
                  subCategory: "",
                  market: "",
                })
              }
            >
              Clear Filters
            </Button>
          </div>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Posts Display */}
      <Row>
        {posts.length === 0 ? (
          <Col>
            <p className="text-center">No posts found for selected filters.</p>
          </Col>
        ) : (
          posts.map((post) => (
            <Col key={post.id} md={6} lg={4} className="mb-4">
              <PostCard item={post} />
            </Col>
          ))
        )}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ReactPaginate
            previousLabel="← Prev"
            nextLabel="Next →"
            pageCount={totalPages}
            onPageChange={handlePageClick}
            containerClassName="pagination"
            pageClassName="page-item"
            pageLinkClassName="page-link"
            previousClassName="page-item"
            previousLinkClassName="page-link"
            nextClassName="page-item"
            nextLinkClassName="page-link"
            activeClassName="active"
            forcePage={page}
          />
        </div>
      )}
    </div>
  );
}
