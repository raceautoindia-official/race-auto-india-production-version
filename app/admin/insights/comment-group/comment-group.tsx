"use client";

import { useEffect, useState } from "react";
import { Container, Table, Button, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

export default function AdminGroupedCommentsPage() {
  const [grouped, setGrouped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/insights/comments/grouped")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setGrouped(data.groups);
        else toast.error("Failed to load grouped comments");
      })
      .catch((err) => {
        console.error("Error:", err);
        toast.error("Server error");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleDeleteByInsight = async (insight_id: number) => {
    if (!confirm("Delete all comments for this insight?")) return;

    try {
      const res = await fetch("/api/admin/insights/comments/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ insight_id }),
      });

      const result = await res.json();

      if (result.success) {
        toast.success("Deleted all comments for insight");
        setGrouped((prev) => prev.filter((g) => g.insight_id !== insight_id));
      } else {
        toast.error("Delete failed");
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Server error");
    }
  };

  return (
    <Container className="mt-4">
      <h4>Comment Groups by Insight</h4>

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : grouped.length === 0 ? (
        <Alert variant="info">No grouped comments found.</Alert>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>Insight ID</th>
              <th>Title</th>
              <th>Total Comments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {grouped.map((g) => (
              <tr key={g.insight_id}>
                <td>{g.insight_id}</td>
                <td dangerouslySetInnerHTML={{ __html: g.title }} />
                <td>{g.total_comments}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteByInsight(g.insight_id)}
                  >
                    Delete All
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}
