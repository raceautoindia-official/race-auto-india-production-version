"use client";

import "./ComparisonTable.css";
import { Table, Container } from "react-bootstrap";
import axios from "axios";
import { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";

const PricingTable = () => {
  const [data, setData] = useState<any>([]);

  const planData = data.filter(
    (item: any) => item.plan !== "Monthly price" && item.plan !== "Annual price" && item.plan !== "usd"
  );


  const tableData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`
      );
      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    tableData();
  }, []);
  return (
    <>
      <Container className="mt-5">
        <h2 className="mb-4 text-center font-weight-medium text-primary">
        Choose the Perfect Plan for You
        </h2>
        <div className="table-responsive">
          <Table className="pricing-table table-hover">
            <thead>
              <tr>
                <th className="py-3">DETAILS</th>
                <th
                  className="shining py-3"
                  style={{ backgroundColor: "#E5E4E2" }}
                >
                  PLATINUM
                </th>
                <th className="py-3" style={{ backgroundColor: "#FFD700" }}>
                  GOLD
                </th>
                <th className="py-3" style={{ backgroundColor: "#ff5376" }}>
                  SILVER
                </th>
                <th className="py-3" style={{ backgroundColor: "#006db5" }}>
                  BRONZE
                </th>
              </tr>
            </thead>
            <tbody>
              {planData.map((item: any) => (
                <tr key={item.id}>
                  <td>{item.plan}</td>
                  <td>{item.platinum ? <FaCheck color="#28a745" /> : "❌"}</td>
                  <td>{item.gold ? <FaCheck color="#28a745" /> : "❌"}</td>
                  <td>{item.silver ? <FaCheck color="#28a745" /> : "❌"}</td>
                  <td>{item.bronze ? <FaCheck color="#28a745" /> : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Container>
    </>
  );
};

export default PricingTable;
