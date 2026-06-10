"use client";
import { Courgette } from "next/font/google";
import React, { useState } from "react";
import { contactType } from "./contact";
import "./contact.css";
import { FaLocationArrow} from "react-icons/fa";
import { IoIosMail } from "react-icons/io";
import { MdPhoneIphone } from "react-icons/md";
import ContactDetail from "./ContactDetail";

const courgette = Courgette({
  subsets: ["latin"],
  weight: "400",
});

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim().toLowerCase());

const Content = ({ data }: { data: contactType }) => {
  const [isHide, setIsHide] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Validate, submit to the contact API, then play the "sent" animation only on
  // success so the message is actually delivered (previously the form was
  // decorative and silently discarded submissions).
  const handleSend = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            message: message.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to submit contact form");
      }

      setIsHide(true);
    } catch (err) {
      console.error("Contact form submission failed", err);
      setError("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    
      <div className="row" style={{
        backgroundImage: "url('/images/contact-banner.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: 450,
        
      }}>
        <div className="col-12">
          <div
            className={
              isHide ? `sent ${courgette.className}` : `${courgette.className}`
            }
          >
            <div className="wrapper centered">
              <article className="letter">
                <div className="side">
                  <h1>Contact us</h1>
                  <p>
                    <textarea
                      placeholder="Your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                    ></textarea>
                  </p>
                </div>
                <div className="side">
                  <p>
                    <input
                      type="text"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </p>
                  <p>
                    <input
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </p>
                  {error && (
                    <p
                      className="contact-error"
                      style={{ color: "#d32f2f", fontSize: 13, margin: "0 0 6px" }}
                    >
                      {error}
                    </p>
                  )}
                  <p>
                    <button
                      id="sendLetter"
                      type="button"
                      onClick={handleSend}
                      disabled={submitting}
                    >
                      {submitting ? "Sending..." : "Send"}
                    </button>
                  </p>
                </div>
              </article>
              <div className="envelope front"></div>
              <div className="envelope back"></div>
            </div>
            <p className="result-message text-center">
              Thanks for your message
            </p>
          </div>
          <div
            className={
              isHide
                ? "contact-us default-margin"
                : "contact-us contact-us-move"
            }
          >

          </div>
        </div>
      </div>
      <ContactDetail/>
    </>
  );
};

export default Content;
