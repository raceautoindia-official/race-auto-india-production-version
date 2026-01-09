"use client";

import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import Dropdown from "react-bootstrap/Dropdown";
import { toast } from "react-toastify";
import './profile.css'

const ProfileButton = ({ token }: { token: string }) => {
  const decoded: any = jwtDecode(token);
  const router = useRouter();
  const [profilePic, setProfilePic] = useState<string | null>(null);

  useEffect(() => {
    const pic = Cookies.get("profilePic");
    if (pic) {
      setProfilePic(decodeURIComponent(pic));
    }
  }, []);

  const signoutapi = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/signout`);
      toast.success("Sign out success");
      window.location.reload();
    } catch (err) {
      console.error("Signout error:", err);
    }
  };

  const getInitial = () => decoded?.username?.charAt(0)?.toUpperCase() || "U";

  return (
    <Dropdown align="end">
      {/* Custom Toggle without arrow */}
      <Dropdown.Toggle
  as="div"
  id="custom-profile-toggle" // used for targeting in CSS
  role="button"
  style={{ cursor: "pointer" }}
>
  {profilePic ? (
    <img
      src={profilePic}
      alt="profile"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        backgroundColor: "#6c757d",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: 16,
      }}
    >
      {getInitial()}
    </div>
  )}
</Dropdown.Toggle>


      <Dropdown.Menu>
        <Dropdown.Item onClick={() => router.push("/profile")}>Profile</Dropdown.Item>
        {(decoded.role === "admin" ||
          decoded.role === "ad team" ||
          decoded.role === "moderator") && (
          <Dropdown.Item onClick={() => router.push("/admin")}>Admin</Dropdown.Item>
        )}
        <Dropdown.Divider />
        <Dropdown.Item onClick={signoutapi}>Sign Out</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default ProfileButton;
