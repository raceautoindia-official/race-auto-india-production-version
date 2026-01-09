"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Container, Card, Button } from "react-bootstrap";

const Authorize = () => {
  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center vh-100 bg-light"
    >
      <Card
        className="text-center shadow-lg p-4"
        style={{ maxWidth: "500px", width: "100%" }}
      >
        <Card.Body>
          <h2 className="text-danger mb-4 fw-bold">Unauthorized Access</h2>
          <div
            style={{
              width: "100%",
              minWidth: 300,
              maxWidth: 400,
              margin: "0 auto",
              position: "relative",
              aspectRatio: "1.8/1",
            }}
          >
            <Image src="/images/auth-page.png" alt="auth page" fill />
          </div>
          <p className="mt-4 text-muted">
            You don’t have permission to access this page.
          </p>
          <Link href="/">
            <Button variant="primary" className="mt-3">
              Go to Home
            </Button>
          </Link>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Authorize;
