"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Form, Container, Row, Col } from "react-bootstrap";
import { jwtDecode } from "jwt-decode";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

type BillingHistoryEntry = {
  id: string;
  status: "Success" | "Failed";
  planLabel: string;
  amount: number | null;
  paymentReference: string | null;
  createdAt: string | null;
};

const AccountSettingsForm = ({ token }: { token: string }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [aboutMe, setAboutMe] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [avatar, setavatar] = useState<any>([]);
  const [avatarPreview, setAvatarPreview] = useState<any>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryEntry[]>([]);
  const [billingExpanded, setBillingExpanded] = useState(false);

  const decoded: any = jwtDecode(token);
  const userInfo = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/${decoded.email}`
      );

      setEmail(res.data[0].email || "");
      setUsername(res.data[0].username || "");
      setAboutMe(res.data[0].about_me || "");
      setInstagram(res.data[0].instagram_url || "");
      setFacebook(res.data[0].facebook_url || "");
      setLinkedin(res.data[0].linkedin_url || "");
      setTwitter(res.data[0].twitter_url || "");
      setAvatarPreview(
        `${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${res.data[0].avatar}`
      );
    } catch (err) {
      console.log(err);
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/billing-history/${decoded.email}`
      );
      setBillingHistory(Array.isArray(res.data?.history) ? res.data.history : []);
    } catch (err) {
      console.log(err);
      setBillingHistory([]);
    }
  };

  const handleFileChange = (event: any) => {
    const file = event.target.files[0];
    if (file) {
      setavatar(file);
      const reader: any = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const formData = new FormData();

    formData.append("username", username);
    formData.append("email", email);
    formData.append("about_me", aboutMe);
    formData.append("instagram_url", instagram);
    formData.append("facebook_url", facebook);
    formData.append("twitter_url", twitter);
    formData.append("linkedin_url", linkedin);

    if (avatar) {
      formData.append("avatar", avatar);
    }
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/${decoded.email}`,
        formData
      );
      toast.success("Details updated!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  useEffect(() => {
    userInfo();
    fetchBillingHistory();
  }, []);

  const visibleBilling = billingExpanded ? billingHistory : billingHistory.slice(0, 5);

  return (
    <Container className="mt-4">
      <Link href="/">
        <button className="btn btn-secondary mb-3">Back</button>
      </Link>
      <h2>User Account Settings</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="username" className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="email" className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="aboutMe" className="mb-3">
          <Form.Label>About Me</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Tell us about yourself"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="instagram" className="mb-3">
          <Form.Label>Instagram URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter Instagram URL"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="facebook" className="mb-3">
          <Form.Label>Facebook URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter Facebook URL"
            value={facebook}
            onChange={(e) => setFacebook(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="twitter" className="mb-3">
          <Form.Label>Twitter URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter Twitter URL"
            value={twitter}
            onChange={(e) => setTwitter(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="linkedin" className="mb-3">
          <Form.Label>LinkedIn URL</Form.Label>
          <Form.Control
            type="url"
            placeholder="Enter LinkedIn URL"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="avatar" className="mb-3">
          <Form.Label>Upload Avatar</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
        </Form.Group>

        {avatarPreview && (
          <div className="mb">
            <Form.Label>Avatar Preview:</Form.Label>
            <div className="d-flex justify-content-center">
              <Image
                src={avatarPreview}
                alt="Avatar Preview"
                width={150}
                height={150}
              />
            </div>
          </div>
        )}

        <Row>
          <Col className="text-end">
            <button className="btn btn-primary" type="submit">
              Save Changes
            </button>
          </Col>
        </Row>
      </Form>

      <div className="mt-5">
        <h4 className="mb-3">Billing / Payment History</h4>
        {billingHistory.length === 0 ? (
          <div className="alert alert-light border">No billing history available yet.</div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-bordered align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Payment Ref</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleBilling.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <span className={`badge ${entry.status === "Success" ? "bg-success" : "bg-danger"}`}>
                          {entry.status}
                        </span>
                      </td>
                      <td>{entry.planLabel}</td>
                      <td>
                        {typeof entry.amount === "number"
                          ? `INR ${entry.amount.toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                      <td>{entry.paymentReference || "-"}</td>
                      <td>
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleString("en-IN") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {billingHistory.length > 5 && (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setBillingExpanded((prev) => !prev)}
              >
                {billingExpanded ? "Show Less" : "Read More"}
              </button>
            )}
          </>
        )}
      </div>
    </Container>
  );
};

export default AccountSettingsForm;
