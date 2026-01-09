"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthModalContextType {
  show: boolean;
  open: () => void;
  close: () => void;
  hasBeenClosed: boolean;
}

const AuthModalContext = createContext<AuthModalContextType | null>(null);

export const AuthModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    const alreadyClosed = sessionStorage.getItem("authModalClosed") === "true";
    if (!alreadyClosed) setShow(true);
    setHasBeenClosed(alreadyClosed);
  }, []);

  const open = () => setShow(true);

  const close = () => {
    setShow(false);
    sessionStorage.setItem("authModalClosed", "true");
    setHasBeenClosed(true);
  };

  return (
    <AuthModalContext.Provider value={{ show, open, close, hasBeenClosed }}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = () => {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
};
