"use client";

import { Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { MdDelete, MdModeEdit } from "react-icons/md";
import { toast } from "react-toastify";
import Link from "next/link";
import { SubscriptionType } from "@/types/subscription";
import PlanForm from "./createList";
import {
  FaCheck,
  FaTimes,
  FaEyeSlash,
  FaStar,
  FaPlusCircle,
} from "react-icons/fa";

const SubscriptionTable = () => {
  const [data, setData] = useState<SubscriptionType[]>([]);
  const [priceData, setPriceData] = useState<SubscriptionType[]>([]);

  const tableData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription`
      );

      const onlyData = res.data.filter(
        (item: SubscriptionType) =>
          item.plan !== "Monthly price" &&
          item.plan !== "Annual price" &&
          item.plan !== "usd" &&
          item.plan !== "multiplied_price"
      );

      const onlyPrice = res.data.filter(
        (item: SubscriptionType) =>
          item.plan === "Monthly price" ||
          item.plan === "Annual price" ||
          item.plan === "usd" ||
          item.plan === "multiplied_price"
      );

      setData(onlyData);
      setPriceData(onlyPrice);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id: number | string) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/${id}`
      );
      tableData();
      toast.success("Deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (err) {
      console.log(err);
      toast.warn("Error deleting the item. Please try again later.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    tableData();
  }, []);

  const renderPlanValue = (value: number | string, raw: boolean = false) => {
    if (raw) return value;

    switch (value) {
      case 1:
        return <FaCheck color="green" />;
      case 0:
        return <FaTimes color="red" />;
      case 2:
        return <FaEyeSlash color="gray" />;
      case 3:
        return <FaStar color="orange" />;
      case 4:
        return <FaPlusCircle color="blue" />;
      default:
        return value;
    }
  };

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Plan</th>
              <th>Platinum</th>
              <th>Gold</th>
              <th>Silver</th>
              <th>Bronze</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...data, ...priceData].map((item: SubscriptionType) => {
              const isPriceRow = [
                "Monthly price",
                "Annual price",
                "usd",
                "multiplied_price",
              ].includes(item.plan);

              const isRawValue = item.plan === "multiplied_price";

              return (
                <tr key={item.id}>
                  <td>{item.plan}</td>
                  <td>{renderPlanValue(item.platinum, isRawValue)}</td>
                  <td>{renderPlanValue(item.gold, isRawValue)}</td>
                  <td>{renderPlanValue(item.silver, isRawValue)}</td>
                  <td>{renderPlanValue(item.bronze, isRawValue)}</td>
                  <td>
                    <div className="d-flex">
                      <Link href={`/admin/subscription/${item.id}`}>
                        <button className="btn btn-primary me-3">
                          <MdModeEdit size={20} />
                        </button>
                      </Link>
                      {!isPriceRow && (
                        <button
                          className="btn btn-danger me-3"
                          onClick={() => handleDelete(item.id)}
                        >
                          <MdDelete size={20} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            <PlanForm tableData={tableData} />
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default SubscriptionTable;
