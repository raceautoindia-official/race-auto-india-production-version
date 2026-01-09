"use client";
import { Navbar, Nav, NavDropdown, Button } from "react-bootstrap";

import SearchBar from "@/app/search/[title]/SearchBar";
import Link from "next/link";
import AdminNavButton from "./AdminNavbButton";

const AdminNavbar = () => {
  return (
    <div className="col-12">
      <Navbar bg="white" variant="white" className="shadow-sm">
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto px-5">
            <div className="d-flex">
            <SearchBar />
            <Link href="/">
              {" "}
              <Button variant="primary" className="me-5 ms-5">
                View Site
              </Button>
            </Link>
            </div>
            <AdminNavButton/>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  );
};

export default AdminNavbar;
