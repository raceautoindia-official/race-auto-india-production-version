
"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type Row = {
  id: number;
  post_id: number;
  post_slug: string;
  interaction_type: string;
  visitor_id: string | null;
  user_email: string | null;
  ip: string | null;
  user_agent: string | null;
  referer: string | null;
  meta_json: any;
  created_at: string;
};

export default function LogsClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [postId, setPostId] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [visitorId, setVisitorId] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loggedOnly, setLoggedOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  const fetchLogs = async (p = page) => {
    setLoading(true);
    try {
      const params: any = {
        interaction_type: "flash_reports_click",
        page: p,
        pageSize,
      };
      if (from) params.from = from;
      if (to) params.to = to;
      if (postId) params.post_id = postId;
      if (postSlug) params.post_slug = postSlug;
      if (visitorId) params.visitor_id = visitorId;
      if (userEmail) params.user_email = userEmail;
      if (loggedOnly) params.logged_only = "1";

      const res = await axios.get("/api/admin/post-interactions/logs", { params });
      setRows(res.data.rows || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || p);
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    const q = new URLSearchParams();
    q.set("interaction_type", "flash_reports_click");
    if (from) q.set("from", from);
    if (to) q.set("to", to);
    if (postId) q.set("post_id", postId);
    if (postSlug) q.set("post_slug", postSlug);
    if (visitorId) q.set("visitor_id", visitorId);
    if (userEmail) q.set("user_email", userEmail);
    if (loggedOnly) q.set("logged_only", "1");
    // open download
    window.open(`/api/admin/post-interactions/export?${q.toString()}`, "_blank");
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="container-fluid mt-4">
      <div className="shadow-sm p-3 bg-white rounded border-0">
        <div className="d-flex align-items-center justify-content-between gap-2 flex-wrap">
          <h4 className="mb-0">Flash Reports CTA — Click Logs</h4>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary" onClick={() => fetchLogs(1)} disabled={loading}>
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button className="btn btn-success" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-2 mt-3 align-items-end">
          <div className="col-12 col-md-2">
            <label className="form-label">From</label>
            <input className="form-control" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">To</label>
            <input className="form-control" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">Post ID</label>
            <input className="form-control" value={postId} onChange={(e) => setPostId(e.target.value)} placeholder="e.g. 123" />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">Slug contains</label>
            <input className="form-control" value={postSlug} onChange={(e) => setPostSlug(e.target.value)} placeholder="e.g. toyota" />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">Visitor ID</label>
            <input className="form-control" value={visitorId} onChange={(e) => setVisitorId(e.target.value)} placeholder="vid_xxx" />
          </div>
          <div className="col-12 col-md-2">
            <label className="form-label">Email contains</label>
            <input className="form-control" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="name@" />
          </div>

          <div className="col-12 col-md-3 mt-2">
            <div className="form-check">
              <input
                id="loggedOnly"
                className="form-check-input"
                type="checkbox"
                checked={loggedOnly}
                onChange={(e) => setLoggedOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="loggedOnly">
                Logged users only
              </label>
            </div>
          </div>

          <div className="col-12 col-md-3 mt-2">
            <label className="form-label">Page size</label>
            <select className="form-select" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[10, 25, 50, 100, 200].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-3 mt-2">
            <button
              className="btn btn-primary w-100"
              onClick={() => fetchLogs(1)}
              disabled={loading}
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Pagination */}
        <div className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2">
          <div className="text-muted">
            Total: <b>{total}</b> • Page <b>{page}</b> / <b>{totalPages}</b>
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" disabled={loading || page <= 1} onClick={() => fetchLogs(page - 1)}>
              Prev
            </button>
            <button className="btn btn-outline-primary" disabled={loading || page >= totalPages} onClick={() => fetchLogs(page + 1)}>
              Next
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-responsive mt-3">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th style={{ width: 170 }}>Time</th>
                <th style={{ width: 110 }}>Post ID</th>
                <th>Slug</th>
                <th style={{ width: 200 }}>Visitor ID</th>
                <th style={{ width: 220 }}>Email</th>
                <th style={{ width: 160 }}>IP</th>
                <th style={{ minWidth: 260 }}>User Agent</th>
                <th style={{ minWidth: 260 }}>Referer</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center text-muted">
                    {loading ? "Loading..." : "No results"}
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id}>
                    <td>{r.id}</td>
                    <td>{String(r.created_at).replace("T", " ").slice(0, 19)}</td>
                    <td>{r.post_id}</td>
                    <td style={{ wordBreak: "break-word" }}>{r.post_slug}</td>
                    <td style={{ fontFamily: "monospace" }}>{r.visitor_id || "-"}</td>
                    <td>{r.user_email || "-"}</td>
                    <td>{r.ip || "-"}</td>
                    <td style={{ fontSize: 12, wordBreak: "break-word" }}>{r.user_agent || "-"}</td>
                    <td style={{ fontSize: 12, wordBreak: "break-word" }}>{r.referer || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-muted" style={{ fontSize: 12 }}>
          Note: CSV export is limited to 50,000 rows per download for safety.
        </div>
      </div>
    </div>
  );
}