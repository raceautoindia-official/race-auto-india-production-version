"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

type Totals = {
  total_clicks?: number;
  unique_visitors?: number;
  logged_clicks?: number;
  anon_clicks?: number;
};

type TopPostRow = {
  post_id: number;
  post_slug: string;
  clicks: number;
  uniques: number;
};

type DailyRow = {
  day: string; // date
  clicks: number;
  uniques: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PostInteractions() {
  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [postId, setPostId] = useState("");

  // Data
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [totals, setTotals] = useState<Totals>({});
  const [topPosts, setTopPosts] = useState<TopPostRow[]>([]);
  const [daily, setDaily] = useState<DailyRow[]>([]);

  // Pagination controls (client-side)
  const [topPage, setTopPage] = useState(1);
  const [dailyPage, setDailyPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // apply to both tables

  const topTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil((topPosts?.length || 0) / pageSize));
  }, [topPosts, pageSize]);

  const dailyTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil((daily?.length || 0) / pageSize));
  }, [daily, pageSize]);

  const topSlice = useMemo(() => {
    const p = clamp(topPage, 1, topTotalPages);
    const start = (p - 1) * pageSize;
    return topPosts.slice(start, start + pageSize);
  }, [topPosts, topPage, topTotalPages, pageSize]);

  const dailySlice = useMemo(() => {
    const p = clamp(dailyPage, 1, dailyTotalPages);
    const start = (p - 1) * pageSize;
    return daily.slice(start, start + pageSize);
  }, [daily, dailyPage, dailyTotalPages, pageSize]);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const params: any = { interaction_type: "flash_reports_click" };
      if (from) params.from = from;
      if (to) params.to = to;
      if (postId) params.post_id = postId;

      const res = await axios.get("/api/admin/post-interactions/summary", { params });

      setTotals(res.data?.totals || {});
      setTopPosts(res.data?.topPosts || []);
      setDaily(res.data?.daily || []);

      // Reset pagination to first page after a new fetch (better UX)
      setTopPage(1);
      setDailyPage(1);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.response?.data?.error || e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Optional: set default date range (last 30 days) for nicer first view
  useEffect(() => {
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);

    // only set if empty (don’t override user)
    setFrom((v) => v || toDateInputValue(past));
    setTo((v) => v || toDateInputValue(now));

    // fetch once
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setTimeout(fetchData, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep page number valid if data/pageSize changes
  useEffect(() => {
    setTopPage((p) => clamp(p, 1, topTotalPages));
  }, [topTotalPages]);

  useEffect(() => {
    setDailyPage((p) => clamp(p, 1, dailyTotalPages));
  }, [dailyTotalPages]);

  const resetFilters = () => {
    setPostId("");
    const now = new Date();
    const past = new Date();
    past.setDate(now.getDate() - 30);
    setFrom(toDateInputValue(past));
    setTo(toDateInputValue(now));
  };

  return (
    <div className="container-fluid mt-4">
      <div className="shadow-sm p-3 bg-white rounded border-0">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h4 className="mb-0">Flash Reports CTA Analytics</h4>

          <div className="d-flex align-items-center gap-2">
            <label className="text-muted" style={{ fontSize: 13 }}>
              Rows/page
            </label>
            <select
              className="form-select"
              style={{ width: 110 }}
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              disabled={loading}
            >
              {[5, 10, 20, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button
              className="btn btn-outline-secondary"
              onClick={resetFilters}
              disabled={loading}
            >
              Reset
            </button>

            <button
              className="btn btn-primary"
              onClick={fetchData}
              disabled={loading}
            >
              {loading ? "Loading..." : "Apply"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="row g-2 align-items-end mt-3">
          <div className="col-12 col-md-3">
            <label className="form-label">From</label>
            <input
              className="form-control"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">To</label>
            <input
              className="form-control"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Post ID (optional)</label>
            <input
              className="form-control"
              value={postId}
              onChange={(e) => setPostId(e.target.value)}
              placeholder="e.g. 123"
              disabled={loading}
              inputMode="numeric"
            />
          </div>
          <div className="col-12 col-md-3">
            <div className="text-muted" style={{ fontSize: 12 }}>
              Interaction type: <b>flash_reports_click</b>
            </div>
          </div>
        </div>

        {/* Error */}
        {errorMsg ? (
          <div className="alert alert-danger mt-3 mb-0">
            {errorMsg}
          </div>
        ) : null}

        {/* Totals */}
        <div className="row mt-4 g-3">
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded">
              <div className="text-muted">Total Clicks</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {loading ? "…" : totals.total_clicks ?? 0}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded">
              <div className="text-muted">Unique Visitors</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {loading ? "…" : totals.unique_visitors ?? 0}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded">
              <div className="text-muted">Logged Clicks</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {loading ? "…" : totals.logged_clicks ?? 0}
              </div>
            </div>
          </div>
          <div className="col-12 col-md-3">
            <div className="p-3 border rounded">
              <div className="text-muted">Anonymous Clicks</div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>
                {loading ? "…" : totals.anon_clicks ?? 0}
              </div>
            </div>
          </div>
        </div>

        {/* Top posts */}
        <div className="mt-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Top Posts</h5>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Showing {topSlice.length} of {topPosts.length}
            </div>
          </div>

          <div className="table-responsive mt-2">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Post ID</th>
                  <th>Slug</th>
                  <th>Clicks</th>
                  <th>Uniques</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      Loading…
                    </td>
                  </tr>
                ) : topPosts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted">
                      No data
                    </td>
                  </tr>
                ) : (
                  topSlice.map((p, idx) => (
                    <tr key={`${p.post_id}-${idx}`}>
                      <td>{p.post_id}</td>
                      <td style={{ wordBreak: "break-word" }}>{p.post_slug}</td>
                      <td>{p.clicks}</td>
                      <td>{p.uniques}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Top Posts Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
            <div className="text-muted" style={{ fontSize: 12 }}>
              Page {topPage} / {topTotalPages}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                disabled={loading || topPage <= 1}
                onClick={() => setTopPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-primary"
                disabled={loading || topPage >= topTotalPages}
                onClick={() => setTopPage((p) => Math.min(topTotalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Daily trend */}
        <div className="mt-4">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            <h5 className="mb-0">Daily Trend</h5>
            <div className="text-muted" style={{ fontSize: 12 }}>
              Showing {dailySlice.length} of {daily.length}
            </div>
          </div>

          <div className="table-responsive mt-2">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Clicks</th>
                  <th>Uniques</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      Loading…
                    </td>
                  </tr>
                ) : daily.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center text-muted">
                      No data
                    </td>
                  </tr>
                ) : (
                  dailySlice.map((d, idx) => (
                    <tr key={`${d.day}-${idx}`}>
                      <td>{String(d.day).slice(0, 10)}</td>
                      <td>{d.clicks}</td>
                      <td>{d.uniques}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Daily Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-2 flex-wrap gap-2">
            <div className="text-muted" style={{ fontSize: 12 }}>
              Page {dailyPage} / {dailyTotalPages}
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                disabled={loading || dailyPage <= 1}
                onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </button>
              <button
                className="btn btn-outline-primary"
                disabled={loading || dailyPage >= dailyTotalPages}
                onClick={() => setDailyPage((p) => Math.min(dailyTotalPages, p + 1))}
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}