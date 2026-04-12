"use client";

import React, { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import emailjs from "@emailjs/browser";
import styles from "../profile.module.css";

function HelpSupport() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enquiry: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");

    const emailParams = {
      from_name: formData.name,
      from_email: formData.email,
      enquiry: formData.enquiry,
      message: formData.message,
    };

    try {
      await emailjs.send(
        "service_ozx53eb",
        "template_kfrvsrl",
        emailParams,
        "KUwUOlg39l7VrDi7m"
      );

      setSuccessMessage("Your message has been sent successfully!");
      setFormData({
        name: "",
        email: "",
        enquiry: "",
        message: "",
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      setSuccessMessage("Failed to send your message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const isError = successMessage.toLowerCase().includes("failed");

  return (
    <div className={styles.mainStack}>
      <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
        <Card.Body className="p-0">
          <div className={styles.sectionHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Help & Support</h2>
              <p className={styles.sectionDescription}>
                Share your issue or billing question and the support team can follow up with the right context.
              </p>
            </div>
          </div>

          <div className={styles.supportGrid}>
            <div className={styles.supportPanel}>
              <h3 className={styles.sectionTitle} style={{ color: "#ffffff" }}>We are here to help</h3>
              <p>
                If you encounter any issue on the platform, please submit the form with clear details. The technical team will review the request and respond as quickly as possible.
              </p>
            </div>

            <div className={styles.supportCard}>
              <Form onSubmit={handleSubmit}>
                <div className={styles.formField}>
                  <Form.Group controlId="formName" className="mb-3">
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                    />
                  </Form.Group>
                </div>

                <div className={styles.formField}>
                  <Form.Group controlId="formEmail" className="mb-3">
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                    />
                  </Form.Group>
                </div>

                <div className={styles.formField}>
                  <Form.Group controlId="formEnquiries" className="mb-3">
                    <Form.Select
                      name="enquiry"
                      value={formData.enquiry}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select enquiry type</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Billing">Billing</option>
                    </Form.Select>
                  </Form.Group>
                </div>

                <div className={styles.formField}>
                  <Form.Group controlId="formMessage" className="mb-3">
                    <Form.Control
                      as="textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Describe your issue or request"
                      required
                    />
                  </Form.Group>
                </div>

                <Button type="submit" className={styles.primaryButton} disabled={loading}>
                  {loading ? "Sending..." : "Submit Request"}
                </Button>

                {successMessage && (
                  <div className={isError ? styles.errorText : styles.successText}>
                    {successMessage}
                  </div>
                )}
              </Form>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default HelpSupport;
