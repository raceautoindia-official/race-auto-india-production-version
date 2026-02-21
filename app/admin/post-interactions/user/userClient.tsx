"use client";

import React, { useState } from "react";
import axios from "axios";

export default function UserDrilldown() {
  const [identifier, setIdentifier] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!identifier) return;

    setLoading(true);
    try {
      const res = await axios.get(
        "/api/admin/post-interactions/logs",
        {
          params: {
            interaction_type: "flash_reports_click",
            user_email: identifier,
            visitor_id: identifier,
            pageSize: 100
          },
        }
      );
      setRows(res.data.rows || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h4>User / Visitor Drilldown</h4>

      <div className="d-flex gap-2 mt-3">
        <input
          className="form-control"
          placeholder="Enter email OR visitor_id"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
        <button className="btn btn-primary" onClick={search}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th>Date</th>
            <th>Post</th>
            <th>Slug</th>
            <th>IP</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={4}>No records</td></tr>
          ) : (
            rows.map((r) => (
              <tr key={r.id}>
                <td>{r.created_at}</td>
                <td>{r.post_id}</td>
                <td>{r.post_slug}</td>
                <td>{r.ip}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}