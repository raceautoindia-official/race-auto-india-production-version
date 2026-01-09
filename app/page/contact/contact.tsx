import React from "react";
import Content from "./content";

export type contactType = {
  contact_text: string;
  contact_address: string;
  contact_email: string;
  contact_phone: string;
};

const Contact = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/general-settings/contact`
  );
  const data: contactType[] = await res.json();

  return (
    <>
      <div className="container-fluid">
        <Content data={data[0]} />
      </div>
    </>
  );
};

export default Contact;
