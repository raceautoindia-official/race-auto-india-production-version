/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useState,
  ChangeEvent,
  FormEvent,
  CSSProperties,
  Key,
} from "react";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import "./blog.css";
import Image from "next/image";

const MAX_IMAGE_KB = 300;
const MAX_VIDEO_MB = 5;
const BAD_WORDS = [
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
const sanitize = (text: string) =>
  text.replace(new RegExp(`\\b(${BAD_WORDS.join("|")})\\b`, "gi"), "***");

// thumbnail style
const thumbStyle: CSSProperties = {
  maxWidth: "150px",
  maxHeight: "150px",
  width: "auto",
  height: "auto",
  objectFit: "cover",
  marginRight: "8px",
  marginBottom: "8px",
};

export default function InsightBlogPage() {
  const searchParams = useSearchParams();
  const { title_slug } = useParams();
  const insightId = searchParams.get("id")!;
  const router = useRouter();

  const [insight, setInsight] = useState<{
    title: string;
    content: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [guestEmail, setGuestEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);

  const [posts, setPosts] = useState<any[]>([]);
  const [newPost, setNewPost] = useState("");
  const [uploadMedia, setUploadMedia] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyMedia, setReplyMedia] = useState<File[]>([]);
  const [replyPreviews, setReplyPreviews] = useState<string[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editMedia, setEditMedia] = useState<File[]>([]);
  const [editPreviews, setEditPreviews] = useState<string[]>([]);

  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [likesMap, setLikesMap] = useState<
    Record<number, { cnt: number; liked: boolean }>
  >({});
  const [showRepliesMap, setShowRepliesMap] = useState<Record<number, boolean>>(
    {}
  );

  function toggleReplies(postId: number) {
    setShowRepliesMap((m) => ({ ...m, [postId]: !m[postId] }));
  }

  async function toggleLike(commentId: number) {
    const email = userEmail || guestEmail;
    if (!email) return toast.error("Enter your email to like");
    const res = await fetch("/api/admin/insights/comments/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_id: commentId, user_email: email }),
    });
    const data = await res.json();
    setLikesMap((m) => ({
      ...m,
      [commentId]: { cnt: data.likes, liked: data.liked },
    }));
  }

  async function fetchPosts() {
    const res = await fetch(
      `/api/admin/insights/comments?insight_id=${insightId}`
    );
    const data = await res.json();
    setPosts(data);
    const map: Record<number, { cnt: number; liked: boolean }> = {};
    data.forEach((p: any) => {
      map[p.id] = { cnt: p.like_count, liked: p.liked_by_user };
    });
    setLikesMap(map);
  }

  // handle multiple-file inputs
  function handleMultipleMedia(
    e: ChangeEvent<HTMLInputElement>,
    setterFiles: (f: File[]) => void,
    setterPreviews: (u: string[]) => void
  ) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    for (const f of files) {
      const isImage = f.type.startsWith("image/");
      const isVideo = f.type.startsWith("video/");
      if (isImage && f.size > MAX_IMAGE_KB * 1024) {
        return toast.error(`Max image ${MAX_IMAGE_KB}KB`);
      }
      if (isVideo && f.size > MAX_VIDEO_MB * 1024 * 1024) {
        return toast.error(`Max video ${MAX_VIDEO_MB}MB`);
      }
    }
    setterFiles(files);
    setterPreviews(files.map((f) => URL.createObjectURL(f)));
  }

  async function submitPost(e: FormEvent) {
    e.preventDefault();
    const email = userEmail || guestEmail.trim();
    if (!email) return toast.error("Enter your email");
    if (!newPost.trim()) return toast.error("Cannot be empty");
    if (!userEmail) {
      sessionStorage.setItem("guestEmail", guestEmail.trim());
      setEmailConfirmed(true);
    }
    const fd = new FormData();
    fd.append("insight_id", insightId);
    fd.append("user_email", email);
    fd.append("comment", sanitize(newPost));
    uploadMedia.forEach((file) => fd.append("images[]", file));
    await fetch("/api/admin/insights/comments", { method: "POST", body: fd });
    setNewPost("");
    setUploadMedia([]);
    setPreviewUrls([]);
    fetchPosts();
    toast.success("Posted!");
  }

  async function submitReply(pid: number) {
    if (!replyText.trim()) return toast.error("Cannot be empty");
    const email = userEmail || guestEmail.trim();
    if (!email) return toast.error("Enter your email");
    const fd = new FormData();
    fd.append("insight_id", insightId);
    fd.append("user_email", email);
    fd.append("comment", sanitize(replyText));
    fd.append("parent_id", pid.toString());
    replyMedia.forEach((file) => fd.append("images[]", file));
    await fetch("/api/admin/insights/comments", { method: "POST", body: fd });
    setReplyText("");
    setReplyMedia([]);
    setReplyPreviews([]);
    setReplyTo(null);
    fetchPosts();
    toast.success("Replied!");
  }

  async function submitEdit(id: number) {
    if (!editText.trim()) return toast.error("Cannot be empty");
    const fd = new FormData();
    fd.append("id", id.toString());
    fd.append("comment", sanitize(editText));
    editMedia.forEach((file) => fd.append("images[]", file));
    await fetch("/api/admin/insights/comments", { method: "PUT", body: fd });
    setEditingId(null);
    setEditText("");
    setEditMedia([]);
    setEditPreviews([]);
    fetchPosts();
    toast.success("Edited!");
  }

  const handleDelete = async (commentId: number) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>Delete this comment?</p>
          <button
            onClick={async () => {
              await fetch("/api/admin/insights/comments", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: commentId }),
              });
              fetchPosts();
              toast.dismiss();
              toast.success("Deleted!");
            }}
            className="btn btn-sm btn-danger me-2"
          >
            Yes
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="btn btn-sm btn-secondary"
          >
            Cancel
          </button>
        </div>
      ),
      { autoClose: false }
    );
  };

  useEffect(() => {
    fetch(`/api/admin/insights/${insightId}`)
      .then((r) => r.json())
      .then((data) => setInsight({ title: data.title, content: data.content }));
    fetchPosts();
    const pic = Cookies.get("profilePic");
    const token = Cookies.get("authToken");
    if (token) {
      const decoded: any = jwtDecode(token);
      setUserEmail(decoded.email);
      setEmailConfirmed(true);
      setUserIsAdmin(decoded.role === "admin");
      if (decoded.email) setGuestEmail(decoded.email);
    }
    if (pic) setProfilePic(decodeURIComponent(pic));
    const saved = sessionStorage.getItem("guestEmail");
    if (!token && saved) {
      setGuestEmail(saved);
      setEmailConfirmed(true);
    }
  }, [insightId]);

  const parentPosts = posts.filter((p) => !p.parent_id);
  const repliesFor = (pid: number) => posts.filter((p) => p.parent_id === pid);

  function stripHtml(html: string) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  }

  return (
    <Container fluid className="blog-page p-4">
      <Row className="mb-4">
        <Col>
          <h1 className="insight-title">{insight?.title}</h1>

          <p className="insight-snippet">
            {stripHtml(insight?.content || "").slice(0, 500)}
            {stripHtml(insight?.content || "").length > 500 && (
              <Link
                href={`/insights/${title_slug}?id=${insightId}`}
                className="read-more"
              >
                {" "}
                Read more →
              </Link>
            )}
          </p>
        </Col>
      </Row>
      <Link href="https://www.linkedin.com/newsletters/7108421736664109056/">
        <button className=" my-2 btn btn-primary">Subscribe on LinkedIn</button>
      </Link>
      <Row className="justify-content-center mb-5">
        <Col>
          <Card className="p-4">
            <div className="d-flex mb-3 align-items-center">
              {profilePic ? (
                <Image
                  src={profilePic}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="rounded-circle me-3 user-pic"
                />
              ) : (
                <FaUserCircle size={40} className="me-3 user-icon" />
              )}
              <div>
                <div className="fw-bold" style={{ color: "var(--accent)" }}>
                  {userEmail || guestEmail || "Guest User"}
                </div>
                <small style={{ color: "var(--text-secondary)" }}>
                  Max image {MAX_IMAGE_KB}KB, video {MAX_VIDEO_MB}MB
                </small>
              </div>
            </div>

            {!emailConfirmed && (
              <Form.Control
                type="email"
                placeholder="Your email"
                className="mb-3"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
              />
            )}

            <Form onSubmit={submitPost}>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Share your thoughts..."
                className="mb-3"
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
              />
              <Form.Control
                type="file"
                accept="image/*,video/mp4"
                multiple
                className="mb-3"
                onChange={(e: any) =>
                  handleMultipleMedia(e, setUploadMedia, setPreviewUrls)
                }
              />
              {previewUrls.length > 0 && (
                <div
                  className="preview-container"
                  style={{ display: "flex", flexWrap: "wrap" }}
                >
                  {previewUrls.map((url, i) =>
                    uploadMedia[i].type.startsWith("image/") ? (
                      <img key={i} src={url} alt="preview" style={thumbStyle} />
                    ) : (
                      <video key={i} controls src={url} style={thumbStyle} />
                    )
                  )}
                </div>
              )}
              <div className="text-end">
                <Button type="submit" className="btn-success">
                  Post
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>

      {parentPosts.map((post) => {
        const replyCount = repliesFor(post.id).length;
        const isExpanded = !!showRepliesMap[post.id];

        return (
          <Row key={post.id} className="justify-content-center mb-4">
            <Col>
              <Card className="p-3">
                <div className="d-flex justify-content-between mb-2">
                  <div className="d-flex align-items-center">
                    {post.profile_pic ? (
                      <Image
                        src={post.profile_pic}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-circle me-2 user-pic"
                      />
                    ) : (
                      <FaUserCircle size={32} className="me-2 user-icon" />
                    )}
                    <span
                      className="fw-bold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {post.user_email}
                    </span>
                  </div>
                  {(userIsAdmin ||
                    userEmail === post.user_email ||
                    guestEmail === post.user_email) && (
                    <div>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-secondary"
                        onClick={() => {
                          setEditingId(post.id);
                          setEditText(post.comment);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="link"
                        className="text-danger"
                        onClick={() => handleDelete(post.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === post.id ? (
                  <>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      className="mb-2 bg-input text-primary border-0"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    <Form.Control
                      type="file"
                      accept="image/*,video/mp4"
                      className="mb-2 bg-input text-primary"
                      multiple
                      onChange={(e: any) =>
                        handleMultipleMedia(e, setEditMedia, setEditPreviews)
                      }
                    />
                    {editPreviews.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {editPreviews.map((url, i) =>
                          editMedia[i].type.startsWith("image/") ? (
                            <img
                              key={i}
                              src={url}
                              alt="edit preview"
                              style={thumbStyle}
                            />
                          ) : (
                            <video
                              key={i}
                              controls
                              src={url}
                              style={thumbStyle}
                            />
                          )
                        )}
                      </div>
                    )}
                    <div>
                      <Button
                        size="sm"
                        className="btn-success"
                        onClick={() => submitEdit(post.id)}
                      >
                        Save
                      </Button>{" "}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="post-text">{post.comment}</p>
                    {post.images?.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {post.images.map(
                          (url: string, i: Key | null | undefined) =>
                            url.endsWith(".mp4") ? (
                              <video
                                key={i}
                                controls
                                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${url}`}
                                style={thumbStyle}
                              />
                            ) : (
                              <img
                                key={i}
                                src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${url}`}
                                alt="Uploaded"
                                style={thumbStyle}
                              />
                            )
                        )}
                      </div>
                    )}
                    <div className="d-flex gap-2 mb-2">
                      <Button
                        size="sm"
                        className="btn-outline-light"
                        onClick={() => setReplyTo(post.id)}
                      >
                        Reply
                      </Button>
                      {replyCount > 0 && (
                        <Button
                          size="sm"
                          variant="link"
                          className="text-secondary"
                          onClick={() => toggleReplies(post.id)}
                        >
                          {isExpanded
                            ? `Hide Replies (${replyCount})`
                            : `Show Replies (${replyCount})`}
                        </Button>
                      )}
                    </div>
                  </>
                )}

                {replyTo === post.id && (
                  <Card className="mt-3 p-3 reply-card">
                    {!emailConfirmed && (
                      <Form.Control
                        type="email"
                        placeholder="Your email"
                        className="mb-2"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                      />
                    )}
                    <Form.Control
                      as="textarea"
                      rows={2}
                      className="mb-2 bg-input text-primary border-0"
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                    />
                    <Form.Control
                      type="file"
                      accept="image/*,video/mp4"
                      className="mb-2 bg-input text-primary"
                      multiple
                      onChange={(e: any) =>
                        handleMultipleMedia(e, setReplyMedia, setReplyPreviews)
                      }
                    />
                    {replyPreviews.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {replyPreviews.map((url, i) =>
                          replyMedia[i].type.startsWith("image/") ? (
                            <img
                              key={i}
                              src={url}
                              alt="reply preview"
                              style={thumbStyle}
                            />
                          ) : (
                            <video
                              key={i}
                              controls
                              src={url}
                              style={thumbStyle}
                            />
                          )
                        )}
                      </div>
                    )}
                    <div className="text-end">
                      <Button
                        size="sm"
                        className="btn-success"
                        onClick={() => submitReply(post.id)}
                      >
                        Post Reply
                      </Button>
                    </div>
                  </Card>
                )}

                {isExpanded &&
                  repliesFor(post.id).map((r) => (
                    <Card
                      key={r.id}
                      className="mt-3 p-3 reply-card d-flex flex-column"
                    >
                      <div className="d-flex align-items-center mb-1">
                        <span
                          className="fw-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.user_email}
                        </span>
                        {(userIsAdmin ||
                          userEmail === r.user_email ||
                          guestEmail === r.user_email) && (
                          <div className="reply-actions">
                            <Button
                              size="sm"
                              variant="link"
                              className="text-secondary"
                              onClick={() => {
                                setEditingId(r.id);
                                setEditText(r.comment);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="link"
                              className="text-danger"
                              onClick={() => handleDelete(r.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      {editingId === r.id ? (
                        <>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            className="mb-2 bg-input text-primary border-0"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <Form.Control
                            type="file"
                            accept="image/*,video/mp4"
                            className="mb-2 bg-input text-primary"
                            multiple
                            onChange={(e: any) =>
                              handleMultipleMedia(
                                e,
                                setEditMedia,
                                setEditPreviews
                              )
                            }
                          />
                          {editPreviews.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                              {editPreviews.map((url, i) =>
                                editMedia[i].type.startsWith("image/") ? (
                                  <img
                                    key={i}
                                    src={url}
                                    alt="edit reply preview"
                                    style={thumbStyle}
                                  />
                                ) : (
                                  <video
                                    key={i}
                                    controls
                                    src={url}
                                    style={thumbStyle}
                                  />
                                )
                              )}
                            </div>
                          )}
                          <div>
                            <Button
                              size="sm"
                              className="btn-success"
                              onClick={() => submitEdit(r.id)}
                            >
                              Save
                            </Button>{" "}
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="post-text">{r.comment}</p>
                          {r.images?.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap" }}>
                              {r.images.map(
                                (url: string, i: Key | null | undefined) =>
                                  url.endsWith(".mp4") ? (
                                    <video
                                      key={i}
                                      controls
                                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${url}`}
                                      style={thumbStyle}
                                    />
                                  ) : (
                                    <img
                                      key={i}
                                      src={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${url}`}
                                      alt="reply media"
                                      style={thumbStyle}
                                    />
                                  )
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </Card>
                  ))}
              </Card>
            </Col>
          </Row>
        );
      })}
    </Container>
  );
}
