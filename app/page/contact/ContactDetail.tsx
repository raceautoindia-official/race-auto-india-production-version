"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaPhoneAlt } from "react-icons/fa";
import { IoLocationSharp } from "react-icons/io5";
import { MdEmail } from "react-icons/md";

type contactType = {
  id: number;
  contact_address: string;
  contact_phone: any;
  contact_email: string;
};

const ContactDetail = () => {
  const [data, setData] = useState([]);

  const contactData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/contact`
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    contactData();
  }, []);
  return (
    <>
      <div className="row g-0 p-5">
        <div className="col-sm-6">
          {data.map((item: contactType, i) => (
            <div className="" key={i}>
              <h2 className="mb-3">Our Office</h2>
              <p>
                <IoLocationSharp className="me-3" size={25} />
                {item.contact_address}
              </p>
              <p>
                <FaPhoneAlt className="me-3" size={25} />
                {item.contact_phone}
              </p>
              <p>
                <MdEmail className="me-3" size={25} />
                {item.contact_email}
              </p>
            </div>
          ))}
        </div>
        <div className="col-sm-6">
          <h2 className="mb-3">Google Map Location</h2>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1990371.292075053!2d80.19782!3d13.007378!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a526748904eb427%3A0x4c776dc7eb205386!2s43a%2C%20Butt%20Rd%2C%20Ramapuram%2C%20Rajeswari%20colony%2C%20St.Thomas%20Mount%2C%20Chennai%2C%20Tamil%20Nadu%20600016%2C%20India!5e0!3m2!1sen!2sus!4v1717992846726!5m2!1sen!2sus"
            width="100%"
            height="300"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </>
  );
};

export default ContactDetail;
