"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Image from "next/image";
import Link from "next/link";

export type User = {
  id: number;
  avatar: string;
  email: string;
  role: string;
  subscription: number;
};

const UserTable = () => {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 10;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = users.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(users.length / itemsPerPage);

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = (event.selected * itemsPerPage) % users.length;

    setItemOffset(newOffset);
  };

  const handleClose = () => setShow(false);
  const handleShow = (id: any) => {
    setUserIdToDelete(id);
    setShow(true);
  };

  const usersData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user`
      );
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user/${userIdToDelete}`
      );
      toast.success("User removed!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      usersData();
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
    handleClose();
  };

  useEffect(() => {
    usersData();
  }, []);

  return (
    <>
      <div className="col-12">
        <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Avatar</th>
                <th>Email</th>
                <th>Role</th>
                <th>Subscription</th>
                {/* <th>Date</th> */}
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user: User) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.avatar ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.avatar}`}
                        alt="avatar"
                        width={50}
                        height={50}
                      />
                    ) : (
                      <FaUserCircle size={35} />
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    {user.subscription == 1
                      ? "Silver"
                      : user.subscription == 2
                      ? "Gold"
                      : user.subscription == 3
                      ? "Platinum"
                      : "Bronze"}
                  </td>
                  {/* <td>{user.created_date}</td> */}
                  <td>
                    <Link href={`/admin/user/${user.id}`}>
                      <Button variant="warning">Edit</Button>
                    </Link>{" "}
                    <Button
                      variant="danger"
                      onClick={() => handleShow(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <div className="d-flex justify-content-center">
            <ReactPaginate
              previousLabel={<GrFormPrevious />}
              nextLabel={<GrFormNext />}
              pageClassName="page-item"
              pageLinkClassName="page-link"
              previousClassName="page-item"
              previousLinkClassName="page-link"
              nextClassName="page-item"
              nextLinkClassName="page-link"
              breakLabel="..."
              breakClassName="page-item"
              breakLinkClassName="page-link"
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={handlePageClick}
              containerClassName="pagination"
              activeClassName="active"
            />
          </div>
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this user?</Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default UserTable;
