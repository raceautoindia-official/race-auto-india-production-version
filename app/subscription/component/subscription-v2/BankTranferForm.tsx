"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface BankTransferFormProps {
  closeModal: () => void;
  planInfo: {
    planTier: string;
    billingCycle: "monthly" | "annual";
    price: number;
  } | null;
}

const BankTransferForm: React.FC<BankTransferFormProps> = ({
  closeModal,
  planInfo,
}) => {
  const [formData, setFormData] = useState({
    paymentMode: "",
    bankName: "",
    amount: "",
    utrChequeNo: "",
    tdsAmount: "",
    phone_number: "",
    agreeTerms: false,
  });
  const [token, setToken] = useState<string | null>(null);
  const decoded: any = token ? jwtDecode(token) : { email: "" };
  const email = decoded.email;

  useEffect(() => {
    setToken(Cookies.get("authToken") || null);
  }, []);

  useEffect(() => {
    if (email) {
      axios
        .get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`
        )
        .then((res) =>
          setFormData((f) => ({
            ...f,
            phone_number: res.data[0]?.phone_number || "",
          }))
        )
        .catch(console.error);
    }
  }, [email]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bankData = new FormData();
    Object.entries(formData).forEach(([key, val]) => {
      bankData.append(key, String(val));
    });
    bankData.append(email, "email");


    try {
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/bank-payment`,
        bankData
      );
      if (resp.status === 200) {
        toast.success("Bank payment submitted!", { position: "top-center" });
        closeModal();
      }
    } catch (err) {
      toast.error(
        "Some of the provided information is incorrect. Please try again.",
        { position: "top-center" }
      );
      console.error(err);
    }
  };

  return (
    <>
      {planInfo && (
        <div className="border p-3 mt-3 mb-3 bg-light rounded">
          <h6 className="mb-2">Plan Summary:</h6>
          <p className="mb-1">
            <strong>Tier:</strong> {planInfo.planTier}
          </p>
          <p className="mb-1">
            <strong>Billing:</strong> {planInfo.billingCycle}
          </p>
          <p className="mb-0">
            <strong>Price:</strong> ₹{planInfo.price}
          </p>
        </div>
      )}

      <Form onSubmit={handleBankSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Payment Mode</Form.Label>
          <Form.Select
            name="paymentMode"
            value={formData.paymentMode}
            onChange={handleChange}
            required
          >
            <option value="">Select Payment Mode</option>
            <option value="Bank Transfer/NEFT/RTGS/IMPS">
              Bank Transfer/NEFT/RTGS/IMPS
            </option>
            <option value="DD/Cheque">DD/Cheque</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Bank Name</Form.Label>
          <Form.Control
            type="text"
            name="bankName"
            value={formData.bankName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>UTR/Cheque/DD No.</Form.Label>
          <Form.Control
            type="text"
            name="utrChequeNo"
            value={formData.utrChequeNo}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>TDS Amount</Form.Label>
          <Form.Control
            type="number"
            name="tdsAmount"
            value={formData.tdsAmount}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={email} />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone Number</Form.Label>
          <Form.Control
            type="tel"
            name="phone_number"
            value={formData.phone_number}
          />
        </Form.Group>



        <Button variant="primary" type="submit">
          Submit
        </Button>
      </Form>
    </>
  );
};

export default BankTransferForm;
