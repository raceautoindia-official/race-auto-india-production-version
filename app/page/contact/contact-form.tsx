"use client";
import React, { useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import "./contact.css";

const Contact_form = () => {
  const form: any = useRef();

  const sendEmail = (e: any) => {
    e.preventDefault();

    emailjs
      .sendForm("service_ozx53eb", "template_kfrvsrl", form.current, {
        publicKey: "KUwUOlg39l7VrDi7m",
      })
      .then(
        () => {
          toast.success("Message Submitted!", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        },
        (error) => {
          console.log("FAILED...", error.text);
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
      );
  };

  return (
    <div
      className="row align-items-center justify-content-center text-white p-5 g-0"
      style={{
        backgroundImage: "url('/images/contact-banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 728,
      }}
    >
      <div className="text-center">
        <h1>RACE EDITORIALE LLP</h1>
        <h4>we’re here for you</h4>
      </div>
      <div className="col-lg-5">
        <div className="contact-form-container">
          <div className="contact-form-card">
            <h4 className="contact-title">Contact Us</h4>
            <Form ref={form} onSubmit={sendEmail}>
              <Form.Group controlId="formBasicName">
                <Form.Control
                  type="text"
                  name="user_name"
                  placeholder="Enter your Name"
                  className="contact-input"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formBasicEmail">
                <Form.Control
                  type="email"
                  name="user_email"
                  placeholder="Enter Email*"
                  className="contact-input mt-3"
                  required
                />
              </Form.Group>

              <Form.Group controlId="formBasicMessage">
                <Form.Control
                  as="textarea"
                  name="message"
                  rows={3}
                  placeholder="Enter your Message"
                  className="contact-input mt-3"
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="submit-btn">
                Submit
              </Button>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact_form;
