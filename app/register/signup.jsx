/* eslint-disable react/no-unescaped-entities */
'use client'
import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import './signup.css'
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import GoogleLoginButton from "../login/GoogleLogin";

// Validation schema for form fields with strong password
const validationSchema = Yup.object().shape({
  username: Yup.string().min(3, "Username must be at least 3 characters").required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(/[@$!%*?&]/, "Password must contain at least one special character: @$!%*?&")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], "Passwords must match")
    .required("Confirm password is required"),
});

const SignupForm = ({ onSuccess }) => {
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError("");
      await axios.post("/api/register", values);

      toast.info("Login success", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      setShowSuccess(true);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 409) {
          setError("Account already exists.");
        } else if (error.response.status === 400) {
          setError("Invalid data. Please check your inputs.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        setError("Network error. Please check your internet connection.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const SuccessUI = () => (
    <div className="text-center p-4 mt-4 border rounded shadow bg-white">
      <div style={{ fontSize: '2.5rem' }}>✅</div>
      <h5 className="fw-semibold mt-3 mb-2">You're all set!</h5>
      <p className="text-muted mb-4" style={{ fontSize: '0.95rem' }}>
        Your account has been created. Choose where to go next.
      </p>
      <div className="d-flex flex-column align-items-center gap-2">
        <Button
          onClick={() => {
            onSuccess();
            window.location.reload();
          }}
          style={{
            background: "#000",
            color: "#fff",
            borderRadius: "6px",
            padding: "10px 20px",
            fontWeight: 500,
            border: "none",
          }}
        >
          Stay here
        </Button>
        <Button
          onClick={() => router.push("https://raceautoanalytics.com/flash-reports")}
          style={{
            border: "1.5px solid #000",
            background: "#fbeec1",
            color: "#000",
            fontWeight: 500,
            padding: "10px 20px",
            borderRadius: "6px",
            transition: "all 0.2s ease-in-out",
          }}
        >
          Explore Reports
        </Button>
      </div>
    </div>
  );


  return (
    <div className="signup-box px-3 py-2">
      {error && <Alert variant="danger">{error}</Alert>}
      {showSuccess ? (
        <SuccessUI />
      ) : (
        <Formik
          initialValues={{ username: "", email: "", password: "", confirmPassword: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ handleSubmit, handleChange, values, touched, errors, isSubmitting }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="formUsername">
                <Form.Control
                  type="text"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  isInvalid={touched.username && errors.username}
                  placeholder="Enter username"
                  style={{ border: '1px solid #000', boxShadow: 'none' }}
                />
                <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formEmail">
                <Form.Control
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={touched.email && errors.email}
                  placeholder="Enter email"
                  style={{ border: '1px solid #000', boxShadow: 'none' }}
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formPassword">
                <Form.Control
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && errors.password}
                  placeholder="Password"
                  style={{ border: '1px solid #000', boxShadow: 'none' }}
                />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </Form.Group>
              <Form.Group className="mb-3" controlId="formConfirmPassword">
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  isInvalid={touched.confirmPassword && errors.confirmPassword}
                  placeholder="Confirm password"
                  style={{ border: '1px solid #000', boxShadow: 'none' }}
                />
                <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
              </Form.Group>
              <Button variant="dark" type="submit" disabled={isSubmitting} className="w-100">
                {isSubmitting ? "Signing up..." : "Sign Up"}
              </Button>
              <p className="text-center text-muted mt-2 mb-1 p-0 m-0">or</p>
              <div className="d-flex justify-content-center mb-3"><GoogleLoginButton /></div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default SignupForm;
