"use client";
import React, { useState } from "react";
import { Row, Col, Form, Button, Card } from "react-bootstrap";
import emailjs from "@emailjs/browser";

function HelpSupport() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    enquiry: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    const emailParams = {
      from_name: formData.name,
      from_email: formData.email,
      enquiry: formData.enquiry,
      message: formData.message,
    };

    try {
      await emailjs.send(
        "service_ozx53eb", // Replace with your Email.js service ID
        "template_kfrvsrl", // Replace with your Email.js template ID
        emailParams,
        "KUwUOlg39l7VrDi7m" // Replace with your Email.js user ID
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

  return (
    <>
      {/* Header Section */}
      <div className="text-center mb-5">
        <h1 className="fw-bold text-light">How can we help you?</h1>
      </div>

      {/* Content Section */}
      <Card className="shadow p-4 border-0 rounded-3">
        <Row>
          {/* Help & Support Text */}
          <Col
            md={6}
            className="d-flex flex-column justify-content-center mb-4 mb-md-0"
          >
            <h4 className="fw-semibold mb-3">Help & Support</h4>
            <p>
              If you encounter any issues on our website, please fill out this
              form. Our technical team will contact you within 24 hours. Thank
              you.
            </p>
          </Col>

          {/* Form Section */}
          <Col md={6}>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your Name"
                  className="rounded p-2"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEmail" className="mb-3">
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter Email*"
                  className="rounded p-2"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formEnquiries" className="mb-3">
                <Form.Control
                  as="select"
                  name="enquiry"
                  value={formData.enquiry}
                  onChange={handleChange}
                  className="rounded p-2"
                  required
                >
                  <option value="">Select Enquiries</option>
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Technical Support">Technical Support</option>
                  <option value="Billing">Billing</option>
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="formMessage" className="mb-3">
                <Form.Control
                  as="textarea"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Enter your Message"
                  className="rounded p-2"
                  required
                />
              </Form.Group>

              <div className="text-center">
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded px-4 py-2"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Submit"}
                </Button>
              </div>

              {successMessage && (
                <div className="mt-3 text-center text-success">
                  {successMessage}
                </div>
              )}
            </Form>
          </Col>
        </Row>
      </Card>
    </>
  );
}

export default HelpSupport;
