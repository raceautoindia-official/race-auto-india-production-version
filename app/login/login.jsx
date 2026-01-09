/* eslint-disable react/no-unescaped-entities */
'use client'
import React, { useState } from "react";
import { Form, Button, Alert, InputGroup } from "react-bootstrap";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword, sendEmailVerification, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import GoogleLoginButton from "./GoogleLogin";
import './login.css'
import { PiCheckCircleFill, PiEyeFill, PiEyeSlashFill } from "react-icons/pi";

// Validation schema for form fields
const validationSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
});

const LoginForm = ({ onSuccess }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Handle form submission
  const handleSubmit = async (values, { setSubmitting }) => {
    const authPaths = ["/auth-handler", "/reset-password", "/login", "/register"];
    try {
      setError(""); // Clear previous error messages

      // Call backend login API
      await axios.post("/api/login", values);

      toast.info("Login Success!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      // Redirect after login
      // if (authPaths.includes(pathname)) {
      //   router.push("/"); // ✅ Go to home
      // } else {
      //   setTimeout(() => {
      //     router.back();
      //     router.refresh();
      //   }, 1000);
      // }
      
      onSuccess();
      window.location.reload();
    } catch (err) {
      if (err.response) {
        if (err.response.status === 409) {
          setError("Account already exists.");
        } else if (err.response.status === 404) {
          setError("Account not found. Please check your credentials.");
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else {
        console.error(err);
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (auth.currentUser && !auth.currentUser.emailVerified) {
      try {
        await sendEmailVerification(auth.currentUser);
        setError("Verification email sent! Please check your inbox.");
      } catch (err) {
        setError(err.message);
      }
    } else {
      setError("No user logged in or email already verified.");
    }
  };

  return (

    <div className="login-box px-3 py-2">
      {/* <div className="text-center mb-4">
              <Link href="/">
                <Image src="/images/black logo with text.png" alt="Logo" width={60} height={70} />
              </Link>
              <h2 className="mt-2">Login</h2>
            </div> */}
      {error && <Alert variant="danger">{error}</Alert>}

      <Formik
        initialValues={{ email: "", password: "" }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({
          handleSubmit: formikSubmit,
          handleChange,
          values,
          touched,
          errors,
          isSubmitting
        }) => (
          <Form
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              formikSubmit();
            }}
          >
            <Form.Group
              className="mb-3 position-relative"
              controlId="formEmail"
            >
              <Form.Control
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                isInvalid={touched.email && !!errors.email}
                placeholder="Enter Email"
                style={{ border: '1px solid #000', boxShadow: 'none', }}
              />

              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            {/* Password with show/hide eye icon */}
            <Form.Group className="mb-3" controlId="formPassword">
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={touched.password && !!errors.password}
                  placeholder="Enter Password"
                  style={{ border: '1px solid #000', boxShadow: 'none' }}
                />
                <InputGroup.Text
                  onClick={() => setShowPassword((s) => !s)}
                  style={{
                    cursor: 'pointer',
                    background: 'transparent',
                    border: '1px solid #000', boxShadow: 'none'
                    , borderRadius: '0px 5px 5px 0px'
                  }}
                >
                  {showPassword ? <PiEyeSlashFill /> : <PiEyeFill />}
                </InputGroup.Text>
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <div className="text-end mb-3">
              <Link href="/reset-password" className="text-primary">Forgot Password?</Link>
            </div>

            <Button variant="dark" type="submit" className="w-100" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>

            <p className="text-center text-muted mt-2 mb-1">or</p>
            <div className="d-flex justify-content-center mb-3">
              <GoogleLoginButton />
            </div>

            {/* <div className="text-center mt-3">
                    <span>Don't have an account? </span>
                    <Link href="/register" className="text-primary">Signup</Link>
                  </div> */}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
