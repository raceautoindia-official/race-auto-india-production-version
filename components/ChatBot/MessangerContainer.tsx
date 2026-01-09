"use client";
import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import MessengerNonAi from "./MessengerNon-ai";

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
<MessengerNonAi/>

  );
}
