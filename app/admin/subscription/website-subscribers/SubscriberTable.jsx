'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function SubscriberList() {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const res = await axios.get('/api/admin/subscriber');
        setSubscribers(res.data);
      } catch (err) {
        console.error("Error fetching subscriber list", err);
      }
    };

    fetchSubscribers();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Subscriber List</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>ID</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Name</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Email</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((sub) => (
            <tr key={sub.id}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.id}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.name}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.email}</td>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>{sub.phone_number}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
