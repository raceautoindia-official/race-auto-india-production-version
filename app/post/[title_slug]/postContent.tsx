/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import AuthModal from "@/app/test/components/LoginFormTest";
import Link from "next/link";
import Image from "next/image";

const badWords = [
  "fuck", "shit", "bitch", "asshole", "bastard", "dick", "piss", "cunt",
  "damn", "hell", "crap", "slut", "fag", "retard", "idiot", "moron",
  "suck", "whore", "nigger", "bloody", "bollocks", "bugger", "arse",
  "wanker", "twat"
];

function sanitizeComment(comment: string) {
  const regex = new RegExp(`\\b(${badWords.join("|")})\\b`, "gi");
  return comment.replace(regex, "***");
}

const PostContent = ({
  content,
  token,
  is_recommended,
  postId,
}: {
  content: string;
  token: any;
  is_recommended: any;
  postId: number;
}) => {
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

  useEffect(() => {
    document.addEventListener("copy", handleCopy);
    fetchComments();
    fetchPostReactions();
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  const handleCopy = (event: ClipboardEvent) => {
    event.preventDefault();
    const customText = "For more details on this content, visit the Race Auto India website.";
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
      const res = await axios.get(`/api/admin/comments/reactions?post_id=${postId}`);
      const stats = Object.fromEntries(res.data.map((r: any) => [r.reaction_type, r.count]));
      setPostReactions(stats);

      if (decoded?.email) {
        const userRes = await axios.get(`/api/admin/comments/reactions/user?post_id=${postId}&email=${decoded.email}`);
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
    const confirmDelete = window.confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/admin/comments?id=${commentId}&email=${decoded.email}`);
      fetchComments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 5);

  return (
    <>
      {/* Reactions UI */}
      <div style={{ display: "flex", gap: "12px", marginTop: '10px', marginBottom: "16px", flexWrap: "wrap" }}>
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

      {/* Banner */}
      <div className="position-relative my-2 d-none d-md-block" style={{ width: "100%", aspectRatio: "3.56/1" }}>
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
      <div style={{ userSelect: "text", maxHeight: shouldLimitContent ? "200px" : "none", overflow: "hidden" }}>
        <div
          style={{ opacity: shouldLimitContent ? 0.7 : 1 }}
          dangerouslySetInnerHTML={{
            __html: shouldLimitContent ? content.slice(0, 1000) + "..." : content,
          }}
        />
      </div>

      {shouldLimitContent && (
        <div style={{ textAlign: "center", padding: "20px", marginTop: "5px" }}>
          <h3 style={{ fontWeight: "bold" }}>Please Log In to Access the Full Article</h3>
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
              <div key={i} style={{ marginBottom: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
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
                      style={{ background: "green", color: "#fff", padding: "6px 12px", borderRadius: "4px", marginRight: "5px" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingIndex(null)}
                      style={{ background: "#ccc", padding: "6px 12px", borderRadius: "4px" }}
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
                          style={{ background: "transparent", color: "#007bff", border: "none" }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          style={{ background: "transparent", color: "red", border: "none" }}
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
                style={{ marginTop: "10px", background: "transparent", color: "#007bff", border: "none" }}
              >
                {showAllComments
                  ? "Hide responses"
                  : `View ${comments.length - 5} more response${comments.length - 5 > 1 ? "s" : ""}`}
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
