/* eslint-disable react/no-unescaped-entities */
'use client'
import React from "react";

import CountUp from 'react-countup';
import SubscriptionForm from "./SubscriptionForm";


const TextArea = () => {
  return (
    <>
    <div className="text-center mt-4">
      <h3 className="my-2">
        We’ve reached <CountUp end={1000000} duration={9} className="text-danger"/> subscribers and counting!"
      </h3>
      <SubscriptionForm/>
    </div>
    </>
  );
};

export default TextArea;
