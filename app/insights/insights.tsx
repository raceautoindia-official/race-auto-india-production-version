"use client";

import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Pagination,
  Accordion,
} from "react-bootstrap";
import Link from "next/link";

const imageBase = process.env.NEXT_PUBLIC_S3_BUCKET_URL;
const ITEMS_PER_PAGE = 9;

export default function InsightsListPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoryMap, setCategoryMap] = useState<Record<number, any[]>>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("/api/admin/insights")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setInsights(data.insights);
        }
      })
      .catch((err) => console.error("Error fetching insights:", err))
      .finally(() => setLoading(false));

    fetch("/api/admin/insights-categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      });
  }, []);

  useEffect(() => {
    const map: Record<number, any[]> = {};
    insights.forEach((insight) => {
      (insight.categories || []).forEach((catId: number) => {
        if (!map[catId]) map[catId] = [];
        map[catId].push(insight);
      });
    });
    setCategoryMap(map);
  }, [insights]);

  useEffect(() => {
    const filtered = insights.filter((insight) =>
      insight.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInsights(filtered);
    setCurrentPage(1); // reset pagination on search
  }, [searchTerm, insights]);

  const totalPages = Math.ceil(filteredInsights.length / ITEMS_PER_PAGE);
  const paginatedData = filteredInsights.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Row>
        {/* Main 8-column area */}
        <Col md={8}>
          <h3 className="mb-3">All Insights</h3>

          <input
            type="text"
            className="form-control mb-4"
            placeholder="Search insights by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {paginatedData.length === 0 ? (
            <p className="text-muted">No matching insights found.</p>
          ) : (
            <Row xs={1} sm={2} md={3} className="g-4">
              {paginatedData.map((insight) => {
                const firstImage = insight.images?.[0];
                const imageUrl = firstImage
                  ? `${imageBase}${firstImage}`
                  : "/no-image.jpg";

                return (
                  <Col key={insight.id}>
                    <Card className="h-100 shadow-sm border-0">
                      <Link
                        href={`/insights/${insight.title_slug}?id=${insight.id}`}
                        className="text-decoration-none text-dark"
                      >
                        <Card.Img
                          variant="top"
                          src={imageUrl}
                          style={{ height: "180px", objectFit: "cover" }}
                          alt="Insight image"
                        />
                        <Card.Body>
                          <Card.Title
                            dangerouslySetInnerHTML={{ __html: insight.title }}
                            style={{ fontSize: "1rem", minHeight: "3rem" }}
                          />
                        </Card.Body>
                      </Link>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center mt-4">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Pagination.Item
                  key={page}
                  active={page === currentPage}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </Col>

        {/* Sidebar 4-column */}
        <Col md={4}>
          <h5 className="mb-3">Top Threads</h5>
          {/* You can enhance this later to show most viewed/commented */}

          <h6 className="mt-4">Browse by Category</h6>
          <Accordion defaultActiveKey="" flush>
            {categories.map((cat) => (
              <Accordion.Item eventKey={String(cat.id)} key={cat.id}>
                <Accordion.Header>{cat.name}</Accordion.Header>
                <Accordion.Body className="p-2">
                  {categoryMap[cat.id]?.length > 0 ? (
                    <div className="d-flex flex-column gap-2">
                      {categoryMap[cat.id].map((insight) => (
                        <Link
                          href={`/insights/comment/${insight.title_slug}?id=${insight.id}`}
                          key={insight.id}
                          className="text-decoration-none text-dark"
                        >
                          <span
                            dangerouslySetInnerHTML={{ __html: insight.title }}
                          />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">No insights yet.</div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
}
