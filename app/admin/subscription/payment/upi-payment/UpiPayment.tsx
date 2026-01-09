'use client';

import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';

interface UpiPayment {
  username: string;
  email: string;
  phone_number: number;
  payment_proof: string;
}

export default function UPIPaymentsPage() {
  const [upiPayments, setUpiPayments] = useState<UpiPayment[]>([]);

  useEffect(() => {

    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/payment`)
      .then((res) => res.json())
      .then((data) => setUpiPayments(data))
      .catch((err) => console.error('Error fetching UPI payments:', err));
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mt-5">UPI Payments</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Phone Number</th>
            <th>Payment Proof</th>
          </tr>
        </thead>
        <tbody>
          {upiPayments.length > 0 ? (
            upiPayments.map((payment, index) => (
              <tr key={index}>
                <td>{payment.username}</td>
                <td>{payment.email}</td>
                <td>{payment.phone_number}</td>
                <td>
                  <a href={`${process.env.NEXT_PUBLIC_S3_BUCKET_URL}${payment.payment_proof}`} target="_blank" rel="noopener noreferrer">
                    View Proof
                  </a>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}