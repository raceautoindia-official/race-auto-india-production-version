import React from "react";

type SubscriberType = {
  id: number;
  organization: string;
  Location: string;
  name: string;
  mobile_number: any;
  email_id: string;
};

const Subscribers = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscriber/excel-subscribers`,
    { cache: "no-store" }
  );

  const data = await res.json();

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Subscribers</h1>
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>#</th>
            <th>Organization</th>
            <th>Location</th>
            <th>Name</th>
            <th>Mobile Number</th>
            <th>Email ID</th>
          </tr>
        </thead>
        <tbody>
          {data.map((subscriber: SubscriberType, i: number) => (
            <tr key={i + 1}>
              <td>{subscriber.id}</td>
              <td>{subscriber.organization}</td>
              <td>{subscriber.Location}</td>
              <td>{subscriber.name}</td>
              <td>{subscriber.mobile_number}</td>
              <td>{subscriber.email_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Subscribers;
