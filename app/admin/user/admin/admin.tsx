"use client";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
// import { ToastContainer, toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";

const AdminTable = () => {
  const [users, setUsers] = useState([]);
  const [show, setShow] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState(null);

  const handleClose = () => setShow(false);
  const handleShow = (id: any) => {
    setUserIdToDelete(id);
    setShow(true);
  };

  const usersData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user/admin`
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
                {/* <th>Date</th> */}
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.avatar ? (
                      <Image
                        src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${user.avatar}`}
                        alt="avatar"
                      />
                    ) : (
                      <FaUserCircle size={35} />
                    )}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
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

export default AdminTable;
