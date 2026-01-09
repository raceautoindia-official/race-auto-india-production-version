"use client";
/* eslint-disable react/prop-types */
import { Form, Button } from "react-bootstrap";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PlanForm = ({ tableData }: { tableData: any }) => {
  const [planName, setPlanName] = useState("");
  const [planTypes, setPlanTypes] = useState({
    platinum: false,
    gold: false,
    silver: false,
    bronze: false,
  });

  const handleInputChange = (e: any) => {
    const { value, checked, type } = e.target;
    if (type === "checkbox") {
      setPlanTypes((prevPlanTypes) => ({
        ...prevPlanTypes,
        [value]: checked,
      }));
    } else {
      setPlanName(value);
    }
  };

  const createTable = async () => {
    const formdata = { ...planTypes, plan: planName };
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription`,
        formdata
      );
      toast.success("Created success!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
      console.log(err);
    }
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    createTable();
    tableData();
    setPlanName("");
    setPlanTypes({
      ...planTypes,
      platinum: false,
      gold: false,
      silver: false,
      bronze: false,
    });
  };
  return (
    <>
      <tr>
        <td>
          <Form.Group controlId="formPlanName">
            <Form.Control
              type="text"
              placeholder="Plan Name"
              value={planName}
              onChange={handleInputChange}
            />
          </Form.Group>
        </td>
        <td>
          <Form.Check
            type="checkbox"
            name="planType"
            value="platinum"
            checked={planTypes.platinum}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <Form.Check
            type="checkbox"
            name="planType"
            value="gold"
            checked={planTypes.gold}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <Form.Check
            type="checkbox"
            name="planType"
            value="silver"
            checked={planTypes.silver}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <Form.Check
            type="checkbox"
            name="planType"
            value="bronze"
            checked={planTypes.bronze}
            onChange={handleInputChange}
          />
        </td>
        <td>
          <Form.Group>
            <Button onClick={handleSubmit}>Submit</Button>
          </Form.Group>
        </td>
      </tr>
    </>
  );
};

export default PlanForm;
