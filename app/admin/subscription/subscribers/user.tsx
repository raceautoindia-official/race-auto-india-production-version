"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import ReactPaginate from "react-paginate";
import { GrFormNext, GrFormPrevious } from "react-icons/gr";
import Link from "next/link";

export type User = {
  id: number;
  avatar: string;
  email: string;
  role: string;
  subscription: number;
  phone_number:string;
};

const SubscriberTable = () => {
  const [users, setUsers] = useState([]);
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

  const usersData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user`
      );
      const sortedData = res.data.sort(
        (a: any, b: any) => b.subscription - a.subscription
      );
      setUsers(sortedData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    usersData();
  }, []);

  return (
    <>
      <div className="col-12">
        <div className="shadow-sm p-3 mb-5 mt-3 bg-white rounded border-0">
          <Table striped bordered hover>
            <thead>
              <tr>
                {/* <th>ID</th> */}
                <th>Email</th>
                <th>Phone Number</th>
                <th>Subscription</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user: User) => (
                <tr key={user.id}>
                  {/* <td>{user.id}</td> */}
                  <td>{user.email}</td>
                  <td>{user.phone_number}</td>
                  <td>
                    {user.subscription == 1
                      ? "Silver"
                      : user.subscription == 2
                      ? "Gold"
                      : user.subscription == 3
                      ? "Platinum"
                      : "Bronze"}
                  </td>
                  
                  <td>
                    <Link href={`/admin/subscription/subscribers/${user.id}`}>
                      <Button variant="warning">Edit</Button>
                    </Link>
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
        </div>
      </div>
    </>
  );
};

export default SubscriberTable;
