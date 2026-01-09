"use client";
import { Form, Button, Table } from "react-bootstrap";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import './planeditor.css'

// Dynamically import ReactQuill to prevent SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const EditPlan = () => {
  const { id } = useParams();
  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [planTypes, setPlanTypes] = useState({
    platinum: 0,
    gold: 0,
    silver: 0,
    bronze: 0,
  });

  const statusOptions = [
    { value: 0, label: "Not Included" },
    { value: 1, label: "Included" },
    { value: 2, label: "Hidden from UI" },
    { value: 3, label: "Premium Feature" },
    { value: 4, label: "New Feature" },
  ];

  const fetchPlan = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/${id}`
      );
      const data = res.data[0];
      setPlanTypes({
        platinum: Number(data.platinum),
        gold: Number(data.gold),
        silver: Number(data.silver),
        bronze: Number(data.bronze),
      });
      setDescription(data.description || "");
      setPlanName(data.plan);
    } catch (err) {
      console.log(err);
    }
  };

  const updatePlan = async () => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/${id}`,
        { ...planTypes, plan: planName, description }
      );
      toast.success("Updated successfully!", { autoClose: 2000 });
    } catch (err) {
      console.error(err);
      toast.error("Update failed. Try again.", { autoClose: 3000 });
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePlan();
  };

  const handleSelectChange = (key, value) => {
    setPlanTypes((prev) => ({ ...prev, [key]: value }));
  };

  const handleTextChange = (key, value) => {
    setPlanTypes((prev) => ({ ...prev, [key]: value }));
  };

  const isPricingPlan = ["Monthly price", "Annual price", "usd", "multiplied_price"].includes(
    planName
  );

  const renderDropdown = (key) => (
    <Form.Select
      value={planTypes[key]}
      onChange={(e) => handleSelectChange(key, Number(e.target.value))}
    >
      {statusOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Form.Select>
  );

  return (
    <div className="col-12">
      <div className="shadow-sm p-3 mb-5 rounded border-0">
        <Link href="/admin/subscription">
          <button className="btn btn-primary my-3">Back</button>
        </Link>
        <Form onSubmit={handleSubmit}>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Plan</th>
                <th>Platinum</th>
                <th>Gold</th>
                <th>Silver</th>
                <th>Bronze</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>-</td>
                <td style={{ minWidth: "300px" }}>
                  <Form.Control
                    type="text"
                    placeholder="Plan Name"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    className="mb-2"
                  />
                  <ReactQuill
                    value={description}
                    onChange={setDescription}
                    style={{ minHeight: "150px", backgroundColor: "white" }}
                    className="mb-2 my-quill"
                  />
                </td>

                {["platinum", "gold", "silver", "bronze"].map((key) => (
                  <td key={key}>
                    {isPricingPlan ? (
                      <Form.Control
                        type="number"
                        placeholder={key}
                        value={planTypes[key]}
                        onChange={(e) =>
                          handleTextChange(key, parseFloat(e.target.value))
                        }
                      />
                    ) : (
                      renderDropdown(key)
                    )}
                  </td>
                ))}

                <td>
                  <Button type="submit">Submit</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </Form>
      </div>
    </div>
  );
};

export default EditPlan;
