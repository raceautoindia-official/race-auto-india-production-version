"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Card, ListGroup } from "react-bootstrap";
import {
  FaUser,
  FaQuestionCircle,
  FaCog,
} from "react-icons/fa";
import { HiBellAlert } from "react-icons/hi2";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

function ProfileCard() {
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [emailInitial, setEmailInitial] = useState<string>("U");

  useEffect(() => {
    const pic = Cookies.get("profilePic");
    const token = Cookies.get("authToken");

    if (pic) {
      setProfilePic(decodeURIComponent(pic));
    }

    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const initial = decoded?.username?.charAt(0)?.toUpperCase();
        if (initial) setEmailInitial(initial);
      } catch (err) {
        console.error("JWT decode error:", err);
      }
    }
  }, []);

  return (
    <Card style={{ borderRadius: "1rem" }} className="text-center shadow mb-3">
      <Card.Body>
        <div style={{ position: "relative", display: "inline-block" }}>
          {profilePic ? (
            <img
              src={profilePic}
              alt="profile"
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: "50%",
                backgroundColor: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "64px",
                fontWeight: 600,
                color: "#fff",
              }}
            >
              {emailInitial}
            </div>
          )}
        </div>
      </Card.Body>

      <ListGroup variant="flush" className="text-start">
        <Link href="/profile">
          <ListGroup.Item action>
            <FaUser className="me-2 my-3" /> My Profile
          </ListGroup.Item>
        </Link>
        <Link href="/profile/support">
          <ListGroup.Item action>
            <FaQuestionCircle className="me-2 my-3" /> Help & Support
          </ListGroup.Item>
        </Link>
        <Link href="/profile/subscription">
          <ListGroup.Item action>
            <HiBellAlert className="me-2 my-3" /> Subscribe
          </ListGroup.Item>
        </Link>
        <Link href="/user/settings">
          <ListGroup.Item action>
            <FaCog className="me-2 my-3" /> Account Setting
          </ListGroup.Item>
        </Link>
      </ListGroup>
    </Card>
  );
}

export default ProfileCard;
