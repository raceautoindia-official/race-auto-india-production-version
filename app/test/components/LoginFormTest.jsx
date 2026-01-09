// app/components/AuthModal.jsx
"use client";
import React, { useState } from "react";
import { Modal, Button, CloseButton } from "react-bootstrap";
import LoginForm from "@/app/login/login";
import SignupForm from "@/app/register/signup";

export default function AuthModal({ show, onClose }) {
    const [mode, setMode] = useState("login");

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            size="sm"
        >
            <Modal.Body className="position-relative">
                {/* Custom close button inside body */}
                <div className="position-absolute top-0 end-0 m-2">
                    <CloseButton onClick={onClose} />
                </div>

                {/* Toggle buttons with spacing and styles */}
                <div className="d-flex justify-content-center mb-3 ">
                    <div className="btn-group me-3" role="group" >
                        <button

                            className={`btn ${mode === 'login' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                            onClick={() => setMode('login')}
                        >
                            Login
                        </button>
                        <button
                            className={`btn ${mode === 'register' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
                            onClick={() => setMode('register')}
                        >
                            Signup
                        </button>
                    </div>
                </div>

                {/* Forms */}
                {mode === "login" ? (
                    <LoginForm onSuccess={onClose} />
                ) : (
                    <SignupForm onSuccess={onClose} />
                )}
            </Modal.Body>
        </Modal>
    );
}
