"use client";

import { useEffect, useState } from "react";
import axios from "axios";

type Lead = {
  id: number;
  user_id: number | null;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  segment: string;
  message: string | null;
  review_status: "pending" | "reviewed" | "contacted" | "rejected";
  created_at: string;
};

export default function TrialLeadsTable() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const fetchLeads = async (status = "") => {
    setLoading(true);
    try {
      const url = status
        ? `/api/admin/free-trial-leads?review_status=${encodeURIComponent(status)}`
        : `/api/admin/free-trial-leads`;

      const res = await axios.get(url);
      setLeads(res.data || []);
    } catch (err) {
      console.error("Error fetching trial leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(filter);
  }, [filter]);

  const updateStatus = async (id: number, review_status: Lead["review_status"]) => {
    try {
      await axios.patch(`/api/admin/free-trial-leads/${id}/review-status`, {
        review_status,
      });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, review_status } : l))
      );
    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Free Trial Leads</h2>

      <div style={{ marginBottom: 12 }}>
        <label style={{ marginRight: 8 }}>Filter:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: 6 }}
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="contacted">Contacted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1200 }}>
            <thead>
              <tr style={{ background: "#f0f0f0" }}>
                {[
                  "ID",
                  "User ID",
                  "Name",
                  "Email",
                  "Phone",
                  "Company",
                  "Segment",
                  "Message",
                  "Status",
                  "Created",
                  "Action",
                ].map((h) => (
                  <th key={h} style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ padding: 12, textAlign: "center" }}>
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.id}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>
                      {lead.user_id ?? "-"}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.full_name}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.email}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.phone || "-"}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>
                      {lead.company_name || "-"}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.segment}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8, maxWidth: 280 }}>
                      <div style={{ whiteSpace: "pre-wrap" }}>{lead.message || "-"}</div>
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>{lead.review_status}</td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td style={{ border: "1px solid #ccc", padding: 8 }}>
                      <select
                        value={lead.review_status}
                        onChange={(e) =>
                          updateStatus(lead.id, e.target.value as Lead["review_status"])
                        }
                        style={{ padding: 4 }}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="contacted">Contacted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}