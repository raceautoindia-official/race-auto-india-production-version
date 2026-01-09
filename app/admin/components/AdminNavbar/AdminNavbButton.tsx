"use client";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { FaUser } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminNavButton = () => {
  const router = useRouter();
  const signoutapi = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/signout`);

      toast.success("Sign out success", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      router.push('/');
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <DropdownButton
      variant="secondary"
      id="dropdown-basic-button"
      className="me-1"
      title={<FaUser />}
    >
      <Dropdown.Item>
        <Link href="/profile">Profile</Link>
      </Dropdown.Item>

      <Dropdown.Item onClick={signoutapi}>Sign Out</Dropdown.Item>
    </DropdownButton>
  );
};

export default AdminNavButton;
