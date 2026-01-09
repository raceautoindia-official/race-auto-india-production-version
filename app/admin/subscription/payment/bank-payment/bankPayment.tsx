'use client';

import { useEffect, useState } from 'react';
import Table from 'react-bootstrap/Table';
import axios from 'axios';

export default function SubscriptionPayments() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/bank-payment`) // Adjust the API route
      .then(response => {
        setPayments(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Subscription Bank Payments</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Payment Mode</th>
            <th>Bank Name</th>
            <th>Amount</th>
            <th>UTR/Cheque No</th>
            <th>TDS Amount</th>
            <th>Email</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {payments.length > 0 ? (
            payments.map((payment: any, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{payment.payment_mode}</td>
                <td>{payment.bank_name}</td>
                <td>{payment.amount}</td>
                <td>{payment.utr_cheque_no}</td>
                <td>{payment.tds_amount}</td>
                <td>{payment.email}</td>
                <td>{payment.phone_number}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center">No data available</td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}
