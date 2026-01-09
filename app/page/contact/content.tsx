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

const Content = ({ data }: { data: contactType }) => {
  const [isHide, setIsHide] = useState(false);
  

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
                    <textarea placeholder="Your message" required></textarea>
                  </p>
                </div>
                <div className="side">
                  <p>
                    <input type="text" placeholder="Your name" required />
                  </p>
                  <p>
                    <input type="email" placeholder="Your email" required />
                  </p>
                  <p>
                    <button id="sendLetter" onClick={() => setIsHide(true)}>
                      Send
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
