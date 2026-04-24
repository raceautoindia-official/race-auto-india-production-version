"use client";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaUserCircle } from "react-icons/fa";
import ReactPaginate from "react-paginate";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Image from "next/image";
import Link from "next/link";
import { getPlanNameFromCode, getPlanUITitle } from "@/lib/subscriptionPlan";

export type User = {
  id: number;
  avatar: string;
  email: string;
  role: string;
  subscription: number;
};

const UserTable = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [show, setShow] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [itemOffset, setItemOffset] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const headerCheckboxRef = useRef<HTMLInputElement | null>(null);
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = users.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(users.length / itemsPerPage);
  const allCurrentPageSelected =
    currentItems.length > 0 &&
    currentItems.every((user) => selectedUserIds.includes(user.id));
  const someCurrentPageSelected =
    currentItems.some((user) => selectedUserIds.includes(user.id)) &&
    !allCurrentPageSelected;

  // Invoke when user click to request another page.
  const handlePageClick = (event: any) => {
    const newOffset = event.selected * itemsPerPage;
    setItemOffset(newOffset);
  };

  const handleClose = () => setShow(false);
  const handleShow = (id: any) => {
    setIdsToDelete([id]);
    setShow(true);
  };
  const handleBulkDeleteShow = () => {
    if (selectedUserIds.length === 0) return;
    setIdsToDelete(selectedUserIds);
    setShow(true);
  };

  const usersData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user`
      );
      setUsers(res.data);
      setSelectedUserIds([]);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async () => {
    try {
      if (idsToDelete.length === 1) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user/${idsToDelete[0]}`
        );
      } else {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user`, {
          data: { ids: idsToDelete },
        });
      }

      toast.success(
        idsToDelete.length > 1
          ? `${idsToDelete.length} users removed!`
          : "User removed!",
        {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
      );
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

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedUserIds((prev) => {
      if (checked) {
        if (prev.includes(id)) return prev;
        return [...prev, id];
      }
      return prev.filter((selectedId) => selectedId !== id);
    });
  };

  const handleSelectCurrentPage = (checked: boolean) => {
    const pageIds = currentItems.map((user) => user.id);
    setSelectedUserIds((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...pageIds]));
      }
      return prev.filter((id) => !pageIds.includes(id));
    });
  };

  const handleSelectAllRows = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(users.map((user) => user.id));
      return;
    }
    setSelectedUserIds([]);
  };

  useEffect(() => {
    usersData();
  }, []);

  useEffect(() => {
    if (!headerCheckboxRef.current) return;
    headerCheckboxRef.current.indeterminate = someCurrentPageSelected;
  }, [someCurrentPageSelected]);

  useEffect(() => {
    setItemOffset(0);
  }, [itemsPerPage]);

  useEffect(() => {
    if (itemOffset >= users.length && users.length > 0) {
      const lastPageOffset = Math.floor((users.length - 1) / itemsPerPage) * itemsPerPage;
      setItemOffset(lastPageOffset);
    }
  }, [itemOffset, users.length, itemsPerPage]);

  return (
    <>
      <div className="col-12">
        <div className="shadow-sm p-3 mb-5  mt-3 bg-white rounded border-0">
          <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-semibold">Rows per page:</span>
              <select
                className="form-select"
                style={{ width: "90px" }}
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <div className="form-check m-0">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="select-all-rows"
                  checked={users.length > 0 && selectedUserIds.length === users.length}
                  onChange={(e) => handleSelectAllRows(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="select-all-rows">
                  Select all rows
                </label>
              </div>
              <Button
                variant="danger"
                disabled={selectedUserIds.length === 0}
                onClick={handleBulkDeleteShow}
              >
                Delete Selected ({selectedUserIds.length})
              </Button>
            </div>
          </div>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={(e) => handleSelectCurrentPage(e.target.checked)}
                  />
                </th>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(user.id)}
                      onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                    />
                  </td>
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
                  <td>{Number(user.subscription) > 0 ? getPlanUITitle(getPlanNameFromCode(user.subscription)) : "Free"}</td>
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
            <Modal.Body>
              {idsToDelete.length > 1
                ? `Are you sure you want to delete these ${idsToDelete.length} users?`
                : "Are you sure you want to delete this user?"}
            </Modal.Body>
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
