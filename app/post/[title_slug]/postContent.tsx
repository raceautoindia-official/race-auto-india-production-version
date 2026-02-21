/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AuthModal from "@/app/test/components/LoginFormTest";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const badWords = [
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "piss",
  "cunt",
  "damn",
  "hell",
  "crap",
  "slut",
  "fag",
  "retard",
  "idiot",
  "moron",
  "suck",
  "whore",
  "nigger",
  "bloody",
  "bollocks",
  "bugger",
  "arse",
  "wanker",
  "twat",
];

function sanitizeComment(comment: string) {
  const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
  return comment.replace(regex, "***");
}

/** ✅ Step 2.1: anonymous visitor id cookie helpers (safe, no deps) */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function makeVisitorId() {
  return (
    "vid_" + Math.random().toString(16).slice(2) + Date.now().toString(16)
  );
}

const PostContent = ({
  content,
  token,
  is_recommended,
  postId,
  // ✅ Optional: you can pass from parent, not required
  postSlug,
}: {
  content: string;
  token: any;
  is_recommended: any;
  postId: number;
  postSlug?: string;
}) => {
  const pathname = usePathname();

  /** ✅ Step 2.1: derive slug if not passed (keeps parent unchanged) */
  const derivedSlug = useMemo(() => {
    if (postSlug) return postSlug;
    const seg = (pathname || "")
      .split("?")[0]
      .split("#")[0]
      .split("/")
      .filter(Boolean);
    return seg[seg.length - 1] || String(postId || "");
  }, [postSlug, pathname, postId]);

  const [showAuth, setShowAuth] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedComment, setEditedComment] = useState<string>("");
  const [postReactions, setPostReactions] = useState<any>({});
  const [userPostReaction, setUserPostReaction] = useState<string | null>(null);

  const decoded: any = token ? jwtDecode(token) : null;
  const shouldLimitContent = !decoded && is_recommended == 1;

  /** ✅ Step 2.1 CTA config */
  const FLASH_REPORTS_URL = "https://raceautoanalytics.com/flash-reports";

  /** ✅ Step 2.1 new CTA state (does not affect existing flow) */
  const [ctaLoading, setCtaLoading] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  useEffect(() => {
    document.addEventListener("copy", handleCopy);

    // ✅ Step 2.1: ensure anonymous visitor cookie exists (for non-login users)
    try {
      const vid = getCookie("rai_vid");
      if (!vid) setCookie("rai_vid", makeVisitorId(), 365);
    } catch {
      // ignore
    }

    fetchComments();
    fetchPostReactions();
    return () => document.removeEventListener("copy", handleCopy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    const customText =
      "For more details on this content, visit the Race Auto India website.";
    if (event.clipboardData) {
      event.clipboardData.setData("text", customText);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await axios.get(`/api/admin/comments?post_id=${postId}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const fetchPostReactions = async () => {
    try {
      const res = await axios.get(
        `/api/admin/comments/reactions?post_id=${postId}`
      );
      const stats = Object.fromEntries(
        res.data.map((r: any) => [r.reaction_type, r.count])
      );
      setPostReactions(stats);

      if (decoded?.email) {
        const userRes = await axios.get(
          `/api/admin/comments/reactions/user?post_id=${postId}&email=${decoded.email}`
        );
        setUserPostReaction(userRes.data?.reaction_type || null);
      }
    } catch (err) {
      console.error("Failed to fetch reactions", err);
    }
  };

  const handlePostReaction = async (type: string) => {
    if (!decoded?.email) {
      alert("Please log in to react.");
      return;
    }

    try {
      await axios.put("/api/admin/comments/reactions", {
        post_id: postId,
        user_email: decoded.email,
        reaction_type: type,
      });
      fetchPostReactions();
    } catch (err) {
      console.error("Failed to submit reaction", err);
    }
  };

  const handleCommentSubmit = async () => {
    if (!comment.trim()) {
      alert("Please enter a comment");
      return;
    }

    const emailToCheck = decoded?.email;
    setLoading(true);

    try {
      await axios.post("/api/admin/comments", {
        comment: sanitizeComment(comment),
        email: emailToCheck,
        post_id: postId,
      });

      setComment("");
      fetchComments();
    } catch (err) {
      console.error("Comment submission failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (index: number) => {
    setEditingIndex(index);
    setEditedComment(comments[index].comment);
  };

  const handleEditSave = async (commentId: number) => {
    try {
      await axios.put("/api/admin/comments", {
        id: commentId,
        comment: sanitizeComment(editedComment),
      });
      setEditingIndex(null);
      setEditedComment("");
      fetchComments();
    } catch (err) {
      console.error("Edit failed", err);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!decoded?.email) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `/api/admin/comments?id=${commentId}&email=${decoded.email}`
      );
      fetchComments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 5);

  /** ✅ Step 2.1: reliable tracking (includes visitor_id for non-login users) */
  const trackInteractionReliable = async (
    interaction_type: string,
    meta?: any
  ) => {
    const visitor_id = getCookie("rai_vid");
    const payload = {
      post_id: postId,
      post_slug: derivedSlug,
      interaction_type,
      visitor_id,
      meta: meta ?? null,
    };

    // best-effort beacon
    try {
      if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
        const blob = new Blob([JSON.stringify(payload)], {
          type: "application/json",
        });
        (navigator as any).sendBeacon("/api/post/interaction", blob);
        return;
      }
    } catch {
      // ignore and fallback
    }

    try {
      await axios.post("/api/post/interaction", payload);
    } catch (e: any) {
      setTrackingError("Tracking failed (safe to ignore).");
      console.error("interaction tracking failed:", e?.message || e);
    }
  };

  /** ✅ CTA click -> track + navigate */
  const handleFlashReportsClick = async () => {
    if (ctaLoading) return;
    setCtaLoading(true);
    setTrackingError(null);

    await trackInteractionReliable("flash_reports_click", {
      source: "post_page_cta",
      destination: FLASH_REPORTS_URL,
    });

    window.open(FLASH_REPORTS_URL, "_blank", "noopener,noreferrer");
    setCtaLoading(false);
  };

  return (
    <>
      {/* Reactions UI */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "10px",
          marginBottom: "16px",
          flexWrap: "wrap",
        }}
      >
        {["like", "dislike", "angry", "sad", "wow"].map((type) => (
          <button
            key={type}
            onClick={() => handlePostReaction(type)}
            style={{
              background: userPostReaction === type ? "#007bff" : "#f0f0f0",
              color: userPostReaction === type ? "#fff" : "#000",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "1rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            {type === "like" && "👍"}
            {type === "dislike" && "👎"}
            {type === "angry" && "😡"}
            {type === "sad" && "😢"}
            {type === "wow" && "😮"} {postReactions[type] || 0}
          </button>
        ))}
      </div>

      {/* ✅ CTA (navigate to Flash Reports + track) */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "14px",
          marginBottom: "14px",
          background: "#fff",
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div>
            <div style={{ fontSize: "13px", color: "#6b7280" }}>
              Want a quick snapshot?
            </div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#111827" }}>
              View Flash Reports and insights for this market.
            </div>
            <div style={{ marginTop: "4px", fontSize: "13px", color: "#4b5563" }}>
              Click to explore interactive charts & trends.
            </div>

            {trackingError ? (
              <div style={{ marginTop: "6px", fontSize: "12px", color: "#dc2626" }}>
                {trackingError}
              </div>
            ) : null}
          </div>

          <button
            onClick={handleFlashReportsClick}
            onMouseEnter={() => setCtaHovered(true)}
            onMouseLeave={() => setCtaHovered(false)}
            disabled={ctaLoading}
            type="button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: ctaLoading ? "#111" : "#0b1220",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              cursor: ctaLoading ? "not-allowed" : "pointer",
              fontWeight: 800,
              fontSize: "14px",
              whiteSpace: "nowrap",
              boxShadow: ctaHovered
                ? "0 10px 24px rgba(0,0,0,0.18)"
                : "0 4px 12px rgba(0,0,0,0.12)",
              transform: ctaLoading
                ? "scale(0.99)"
                : ctaHovered
                ? "translateY(-1px) scale(1.02)"
                : "translateY(0px) scale(1)",
              transition: "all 180ms ease",
              opacity: ctaLoading ? 0.9 : 1,
            }}
            aria-label="Open Flash Reports"
            title="Open Flash Reports"
          >
            <span
              style={{
                width: 22,
                height: 22,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background: "rgba(255,255,255,0.12)",
              }}
            >
              📊
            </span>

            {ctaLoading ? "Opening..." : "View Insights"}

            <span
              style={{
                marginLeft: 2,
                opacity: 0.9,
                transform: ctaHovered ? "translateX(2px)" : "translateX(0px)",
                transition: "transform 180ms ease",
              }}
            >
              ↗
            </span>
          </button>
        </div>
      </div>

      {/* Banner */}
      <div
        className="position-relative my-2 d-none d-md-block"
        style={{ width: "100%", aspectRatio: "3.56/1" }}
      >
        <Link href="/subscription" passHref>
          <Image
            src="/images/SUBCRIBE BANNER.jpg"
            alt="Subscribe – desktop"
            fill
            style={{ objectFit: "cover" }}
            sizes="(min-width: 768px) 100vw"
            quality={75}
            priority
          />
        </Link>
      </div>

      {/* Main content */}
      <div
        style={{
          userSelect: "text",
          maxHeight: shouldLimitContent ? "200px" : "none",
          overflow: "hidden",
        }}
      >
        <div
          style={{ opacity: shouldLimitContent ? 0.7 : 1 }}
          dangerouslySetInnerHTML={{
            __html: shouldLimitContent ? content.slice(0, 1000) + "..." : content,
          }}
        />
      </div>

      {shouldLimitContent && (
        <div style={{ textAlign: "center", padding: "20px", marginTop: "5px" }}>
          <h3 style={{ fontWeight: "bold" }}>
            Please Log In to Access the Full Article
          </h3>
          <button
            onClick={() => setShowAuth(true)}
            style={{
              background: "#007bff",
              color: "#fff",
              padding: "12px 24px",
              borderRadius: "8px",
            }}
          >
            Log In
          </button>
        </div>
      )}

      {/* Comment input - only for logged-in users */}
      <div style={{ marginTop: "40px", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <h4>Leave a Response</h4>
        {!decoded ? (
          <div style={{ textAlign: "center" }}>
            <p>You must be logged in to respond.</p>
            <button
              onClick={() => setShowAuth(true)}
              style={{
                background: "#007bff",
                color: "#fff",
                padding: "10px 20px",
                borderRadius: "6px",
              }}
            >
              Log In to Comment
            </button>
          </div>
        ) : (
          <>
            <textarea
              placeholder="Write your response here..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
            ></textarea>

            <button
              onClick={handleCommentSubmit}
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "#007bff",
                color: "#fff",
                borderRadius: "6px",
              }}
            >
              {loading ? "Submitting..." : "Submit Response"}
            </button>
          </>
        )}
      </div>

      {/* Comment list */}
      <div style={{ marginTop: "30px" }}>
        <h4>Responses</h4>
        {comments.length === 0 ? (
          <p>No responses yet. Be the first!</p>
        ) : (
          <>
            {displayedComments.map((c, i) => (
              <div
                key={i}
                style={{
                  marginBottom: "15px",
                  borderBottom: "1px solid #eee",
                  paddingBottom: "10px",
                }}
              >
                <strong>{c.email}</strong>
                {editingIndex === i ? (
                  <>
                    <textarea
                      value={editedComment}
                      onChange={(e) => setEditedComment(e.target.value)}
                      style={{ width: "100%", marginBottom: "5px" }}
                    />
                    <button
                      onClick={() => handleEditSave(c.id)}
                      style={{
                        background: "green",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        marginRight: "5px",
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      style={{
                        background: "#ccc",
                        padding: "6px 12px",
                        borderRadius: "4px",
                      }}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p>{sanitizeComment(c.comment)}</p>
                    {decoded?.email === c.email && (
                      <div style={{ display: "flex", gap: "10px" }}>
                        <button
                          onClick={() => handleEditStart(i)}
                          style={{
                            background: "transparent",
                            color: "#007bff",
                            border: "none",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{
                            background: "transparent",
                            color: "red",
                            border: "none",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            {comments.length > 5 && (
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                style={{
                  marginTop: "10px",
                  background: "transparent",
                  color: "#007bff",
                  border: "none",
                }}
              >
                {showAllComments
                  ? "Hide responses"
                  : `View ${comments.length - 5} more response${
                      comments.length - 5 > 1 ? "s" : ""
                    }`}
              </button>
            )}
          </>
        )}
      </div>

      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
};

export default PostContent;
