'use client';

import { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup } from "react-bootstrap";
import { GiPaperPlane } from "react-icons/gi";
import { FiMail } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ContactModal() {
  const [show, setShow] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const seen = sessionStorage.getItem("hasSeenContactModal");
    if (!seen) {
      const timer = setTimeout(() => {
        setShow(true);
        sessionStorage.setItem("hasSeenContactModal", "true");
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => setShow(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/subscriber", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.status === 409) {
        toast.warn("This email is already subscribed.");
      } else if (res.ok) {
        toast.success("Thanks for subscribing! 🚀");
        handleClose();
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      size="sm"
      centered
      contentClassName="border-0 shadow-lg"
    >
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>Stay in the Loop!</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <p className="text-center text-muted mb-3">
            Subscribe with your email to get the latest updates.
          </p>

          <Form.Group controlId="contactEmail">
            <InputGroup>
              <InputGroup.Text className="bg-white border-end-0">
                <FiMail color="#0d6efd" />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-start-0"
              />
            </InputGroup>
          </Form.Group>
        </Modal.Body>

        <Modal.Footer className="justify-content-between">
          <Button variant="outline-secondary" size="sm" onClick={handleClose}>
            Close
          </Button>
          <Button
            variant="success"
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="d-flex align-items-center gap-1"
          >
            {isSubmitting ? "Sending..." : "Send"}
            <GiPaperPlane />
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
