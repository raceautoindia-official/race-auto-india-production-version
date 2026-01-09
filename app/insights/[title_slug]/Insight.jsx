/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Container, Row, Col, Button } from "react-bootstrap";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { toast } from "react-toastify";
import "./insight.css";
import Link from "next/link";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#00c49f"];
const badWords = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "piss", "cunt", "damn",
  "hell", "crap", "slut", "fag", "retard", "idiot", "moron", "suck", "whore",
  "nigger", "bloody", "bollocks", "bugger", "arse", "wanker", "twat"
];
function sanitize(text) {
  return text.replace(new RegExp(`\\b(${badWords.join("|")})\\b`, "gi"), "***");
}

export default function InsightDetailPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  // Data
  const [insight, setInsight] = useState(null);
  const [thoughts, setThoughts] = useState([]);

  // New comment
  const [newThought, setNewThought] = useState("");
  const [uploadMedia, setUploadMedia] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  // Reply
  const [guestEmail, setGuestEmail] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyMedia, setReplyMedia] = useState([]);
  const [replyPreviews, setReplyPreviews] = useState([]);

  // Edit
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editMedia, setEditMedia] = useState([]);
  const [editPreviews, setEditPreviews] = useState([]);

  // UI controls
  const [showRepliesMap, setShowRepliesMap] = useState({});
  const [visibleCount, setVisibleCount] = useState(10);
  const commentsContainerRef = useRef(null);

  const imageBase = process.env.NEXT_PUBLIC_S3_BUCKET_URL;
  const previewStyle = {
    maxWidth: "150px",
    maxHeight: "150px",
    objectFit: "cover",
    borderRadius: "6px",
    marginRight: "8px",
    marginBottom: "8px",
    cursor: "pointer",
  };

  // Toggle showing replies
  function toggleReplies(commentId) {
    setShowRepliesMap(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  }

  // Handle multiple-file selection & preview
  function handleMultipleMedia(e, setterFiles, setterPreviews) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    for (const f of files) {
      if (f.type.startsWith("image/") && f.size > 300 * 1024) {
        return toast.error(`Image ${f.name} must be under 300KB`);
      }
      if (f.type.startsWith("video/") && f.size > 5 * 1024 * 1024) {
        return toast.error(`Video ${f.name} must be under 5MB`);
      }
    }
    setterFiles(files);
    setterPreviews(files.map(f => URL.createObjectURL(f)));
  }

  // Infinite scroll for comments
  useEffect(() => {
    const container = commentsContainerRef.current;
    if (!container) return;
    const onScroll = () => {
      if (
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50
      ) {
        setVisibleCount(prev =>
          Math.min(prev + 10, parentThoughts.length)
        );
      }
    };
    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, [thoughts]);

  // Initial data load & user detection
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (token) {
      const decoded = jwtDecode(token);
      setUserEmail(decoded.email);
      setEmailConfirmed(true);
      setGuestEmail(decoded.email);
    } else {
      const stored = sessionStorage.getItem("guestEmail");
      if (stored) {
        setGuestEmail(stored);
        setEmailConfirmed(true);
      }
    }
    if (id) {
      fetchInsight();
      fetchThoughts();
    }
  }, [id]);

  async function fetchInsight() {
    const res = await fetch(`/api/admin/insights/${id}`);
    setInsight(await res.json());
  }

  async function fetchThoughts() {
    const res = await fetch(`/api/admin/insights/comments?insight_id=${id}`);
    setThoughts(await res.json());
  }

  // Submit new comment
  async function submitThought(e) {
    e.preventDefault();
    const finalEmail = userEmail || guestEmail.trim();
    if (!finalEmail) return toast.error("Enter your email first.");
    if (!newThought.trim()) return toast.error("Comment cannot be empty.");
    if (!userEmail) {
      sessionStorage.setItem("guestEmail", guestEmail.trim());
      setEmailConfirmed(true);
    }
    const fd = new FormData();
    fd.append("insight_id", id);
    fd.append("user_email", finalEmail);
    fd.append("comment", sanitize(newThought));
    uploadMedia.forEach(f => fd.append("images[]", f));
    await fetch("/api/admin/insights/comments", { method: "POST", body: fd });
    setNewThought("");
    setUploadMedia([]);
    setPreviewUrls([]);
    setVisibleCount(10);
    fetchThoughts();
    toast.success("Posted!");
  }

  // Submit reply
  async function submitReply(parentId) {
    if (!replyText.trim()) return toast.error("Reply cannot be empty.");
    const finalEmail = userEmail || guestEmail.trim();
    if (!finalEmail) return toast.error("Enter your email first.");
    const fd = new FormData();
    fd.append("insight_id", id);
    fd.append("user_email", finalEmail);
    fd.append("comment", sanitize(replyText));
    fd.append("parent_id", parentId);
    replyMedia.forEach(f => fd.append("images[]", f));
    await fetch("/api/admin/insights/comments", { method: "POST", body: fd });
    setReplyText("");
    setReplyMedia([]);
    setReplyPreviews([]);
    setReplyingTo(null);
    setVisibleCount(10);
    fetchThoughts();
    toast.success("Replied!");
  }

  // Submit edit
  async function handleEditSubmit(commentId) {
    if (!editText.trim()) return toast.error("Edit cannot be empty.");
    const fd = new FormData();
    fd.append("id", commentId);
    fd.append("comment", sanitize(editText));
    editMedia.forEach(f => fd.append("images[]", f));
    await fetch("/api/admin/insights/comments", { method: "PUT", body: fd });
    setEditingId(null);
    setEditText("");
    setEditMedia([]);
    setEditPreviews([]);
    fetchThoughts();
    toast.success("Edited!");
  }

  // Delete comment/reply
  async function handleDelete(commentId) {
    if (!confirm("Delete this comment?")) return;
    await fetch("/api/admin/insights/comments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: commentId }),
    });
    fetchThoughts();
    toast.success("Deleted!");
  }

  // Chart renderer
  function renderGraph(chart) {
    switch (chart.type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chart.data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chart.data}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={COLORS[1]} />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chart.data}
                dataKey="value"
                nameKey="name"
                outerRadius={100}
                label
              >
                {chart.data.map((e, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  }

  if (!insight) return <div>Loading...</div>;

  const parentThoughts = thoughts.filter(c => !c.parent_id);
  const getReplies = pid => thoughts.filter(c => c.parent_id === pid);
  const displayedThoughts = parentThoughts.slice(0, visibleCount);

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col md={8}>
          {/* Main Insight Content */}
          <h3 dangerouslySetInnerHTML={{ __html: insight.title }} />
          <Button
            variant="primary"
            className="linkedin-subscribe-btn mb-3"
            onClick={() =>
              window.open(
                "https://www.linkedin.com/newsletters/7108421736664109056/",
                "_blank"
              )
            }
          >
            Subscribe on LinkedIn
          </Button>

          {/* Image/Video Slider */}
          {insight.images?.length > 0 && (
            <div className="mb-4" style={{ borderRadius: 10, overflow: "hidden" }}>
              <Swiper
                modules={[Autoplay, Pagination]}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                pagination={{ clickable: true }}
                loop
              >
                {insight.images.map((file, idx) => (
                  <SwiperSlide key={idx}>
                    <div style={{ width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                      {file.endsWith(".mp4") ? (
                        <video controls style={{ width: "100%", height: "100%", objectFit: "cover" }}>
                          <source src={`${imageBase}${file}`} />
                        </video>
                      ) : (
                        <img
                          src={`${imageBase}${file}`}
                          alt="media"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      )}
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}

          {/* Rich Content */}
          <div
            dangerouslySetInnerHTML={{ __html: insight.content }}
            className="quill-content mb-4"
          />

          {/* Charts */}
          {insight.charts?.map((chart, i) => (
            <div key={i} className="p-3 border rounded bg-light mb-4">
              {chart.heading && <h5 className="mb-2">{chart.heading}</h5>}
              {renderGraph(chart)}
            </div>
          ))}

          {/* Quotes & Notes */}
          {insight.quotes && (
            <blockquote
              className="blockquote px-4 py-3 border-start border-4 border-primary mb-4"
              dangerouslySetInnerHTML={{ __html: insight.quotes }}
            />
          )}
          {insight.notes && <div dangerouslySetInnerHTML={{ __html: insight.notes }} />}
        </Col>

        <Col md={4}>
          {/* Discussion Header */}
          <div className="mb-3 pb-1 border-bottom mt-4">
            <h5>All Discussions</h5>
          </div>
          <Link
            href={`/insights/comment/${insight.title_slug}?id=${insight.id}`}
            key={insight.id}
            className="text-decoration-none text-dark"
          ><p className="text-primary">View Threads</p></Link>
          {/* Comment Form at Top */}
          <form onSubmit={submitThought} className="p-3 bg-light rounded mb-3">
            {!userEmail && !emailConfirmed && (
              <input
                type="email"
                className="form-control mb-2"
                placeholder="Enter your email"
                value={guestEmail}
                onChange={e => setGuestEmail(e.target.value)}
              />
            )}
            <textarea
              className="form-control mb-2"
              rows={3}
              placeholder="Write your thoughts..."
              value={newThought}
              onChange={e => setNewThought(e.target.value)}
            />
            <input
              type="file"
              accept="image/*,video/mp4"
              multiple
              className="form-control mb-2"
              onChange={e => handleMultipleMedia(e, setUploadMedia, setPreviewUrls)}
            />
            {previewUrls.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                {previewUrls.map((url, i) =>
                  uploadMedia[i].type.startsWith("image/") ? (
                    <img
                      key={i}
                      src={url}
                      alt=""
                      style={previewStyle}
                      onClick={() => window.open(url, "_blank")}
                    />
                  ) : (
                    <video
                      key={i}
                      controls
                      src={url}
                      style={previewStyle}
                      onClick={() => window.open(url, "_blank")}
                    />
                  )
                )}
              </div>
            )}
            <Button type="submit" variant="primary">Post</Button>
          </form>

          {/* Scrollable Comment List with Infinite Load */}
          <div
            ref={commentsContainerRef}
            style={{ maxHeight: "90vh", overflowY: "auto" }}
          >
            {displayedThoughts.map(t => {
              const replies = getReplies(t.id);
              return (
                <div key={t.id} className="mb-4 bg-light p-3 rounded">
                  <strong className="text-primary">{t.user_email}</strong>
                  {editingId === t.id ? (
                    <>
                      <textarea
                        className="form-control mb-2 mt-2"
                        rows={2}
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                      />
                      <input
                        type="file"
                        accept="image/*,video/mp4"
                        multiple
                        className="form-control mb-2"
                        onChange={e => handleMultipleMedia(e, setEditMedia, setEditPreviews)}
                      />
                      {editPreviews.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {editPreviews.map((url, i) =>
                            editMedia[i].type.startsWith("image/") ? (
                              <img
                                key={i}
                                src={url}
                                alt=""
                                style={previewStyle}
                                onClick={() => window.open(url, "_blank")}
                              />
                            ) : (
                              <video
                                key={i}
                                controls
                                src={url}
                                style={previewStyle}
                                onClick={() => window.open(url, "_blank")}
                              />
                            )
                          )}
                        </div>
                      )}
                      <div>
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditSubmit(t.id)}
                        >
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="mt-2">{t.comment}</p>
                      {t.images?.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {t.images.map((url, i) =>
                            url.endsWith(".mp4") ? (
                              <video
                                key={i}
                                controls
                                style={previewStyle}
                                onClick={() => window.open(imageBase + url, "_blank")}
                              >
                                <source src={`${imageBase}${url}`} />
                              </video>
                            ) : (
                              <img
                                key={i}
                                src={`${imageBase}${url}`}
                                alt=""
                                style={previewStyle}
                                onClick={() => window.open(imageBase + url, "_blank")}
                              />
                            )
                          )}
                        </div>
                      )}
                      <div className="mt-2">
                        {userEmail !== t.user_email && guestEmail !== t.user_email && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => setReplyingTo(t.id)}
                          >
                            Reply
                          </Button>
                        )}
                        {replies.length > 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleReplies(t.id)}
                          >
                            {showRepliesMap[t.id]
                              ? `Hide Replies (${replies.length})`
                              : `View Replies (${replies.length})`}
                          </Button>
                        )}
                        {(userEmail === t.user_email || guestEmail === t.user_email) && (
                          <>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-warning"
                              onClick={() => {
                                setEditingId(t.id);
                                setEditText(t.comment);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger"
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>

                      {replyingTo === t.id && (
                        <div className="mt-2">
                          <textarea
                            className="form-control mb-2"
                            rows={2}
                            placeholder="Write a reply..."
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                          />
                          <input
                            type="file"
                            accept="image/*,video/mp4"
                            multiple
                            className="form-control mb-2"
                            onChange={e => handleMultipleMedia(e, setReplyMedia, setReplyPreviews)}
                          />
                          {replyPreviews.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                              {replyPreviews.map((url, i) =>
                                replyMedia[i].type.startsWith("image/") ? (
                                  <img
                                    key={i}
                                    src={url}
                                    alt=""
                                    style={previewStyle}
                                    onClick={() => window.open(url, "_blank")}
                                  />
                                ) : (
                                  <video
                                    key={i}
                                    controls
                                    src={url}
                                    style={previewStyle}
                                    onClick={() => window.open(url, "_blank")}
                                  />
                                )
                              )}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="outline-primary"
                            onClick={() => submitReply(t.id)}
                          >
                            Post Reply
                          </Button>
                        </div>
                      )}

                      {showRepliesMap[t.id] &&
                        replies.map(r => (
                          <div
                            key={r.id}
                            className="ms-3 mt-3 ps-3 border-start border-3 border-primary"
                          >
                            <strong>{r.user_email}</strong>
                            <p className="mt-1 mb-2">{r.comment}</p>
                            {r.images?.length > 0 && (
                              <div style={{ display: "flex", flexWrap: "wrap" }}>
                                {r.images.map((url, i) =>
                                  url.endsWith(".mp4") ? (
                                    <video
                                      key={i}
                                      controls
                                      style={previewStyle}
                                      onClick={() => window.open(imageBase + url, "_blank")}
                                    >
                                      <source src={`${imageBase}${url}`} />
                                    </video>
                                  ) : (
                                    <img
                                      key={i}
                                      src={`${imageBase}${url}`}
                                      alt=""
                                      style={previewStyle}
                                      onClick={() => window.open(imageBase + url, "_blank")}
                                    />
                                  )
                                )}
                              </div>
                            )}
                            {(userEmail === r.user_email || guestEmail === r.user_email) && (
                              <div className="mt-2">
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-warning"
                                  onClick={() => {
                                    setEditingId(r.id);
                                    setEditText(r.comment);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger"
                                  onClick={() => handleDelete(r.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
