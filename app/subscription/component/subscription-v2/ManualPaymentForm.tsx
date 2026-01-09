"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Row, Col, Button } from "react-bootstrap";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface ManualPaymentFormProps {
  closeModal: () => void;
  planInfo: {
    planTier: string;
    billingCycle: "monthly" | "annual";
    price: number;
  } | null;
}

const ManualPaymentForm: React.FC<ManualPaymentFormProps> = ({ closeModal, planInfo }) => {
  const [formData, setFormData] = useState({
    title: "", username: "", phone_number: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const decoded: any = token ? jwtDecode(token) : { email: "" };
  const email = decoded.email;

  useEffect(() => {
    setToken(Cookies.get("authToken") || null);
  }, []);

  useEffect(() => {
    if (email) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`)
        .then(res =>
          setFormData(f => ({ ...f, phone_number: res.data[0]?.phone_number || "" }))
        )
        .catch(console.error);
    }
  }, [email]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append("title", formData.title);
    data.append("username", formData.username);
    data.append("email", email);
    data.append("phone_number", formData.phone_number);
    if (file) data.append("file", file);


    try {
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/payment`,
        data
      );
      if (resp.status === 200) {
        toast.success("Subscription successful!", { position: "top-center" });
        closeModal();
      }
    } catch {
      toast.error("Failed to subscribe. Please try again.", { position: "top-center" });
    }
  };

  return (
    <>
    {planInfo && (
        <div className="border p-3 mt-3 mb-3 bg-light rounded">
          <h6 className="mb-2">Plan Summary:</h6>
          <p className="mb-1"><strong>Tier:</strong> {planInfo.planTier}</p>
          <p className="mb-1"><strong>Billing:</strong> {planInfo.billingCycle}</p>
          <p className="mb-0"><strong>Price:</strong> ₹{planInfo.price}</p>
        </div>
      )}
    
    <Form onSubmit={submit}>
      <Row className="mb-3">
        <Col xs={3}>
          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Select
              name="title" value={formData.title} onChange={handleChange} required
            >
              <option value="">Select...</option>
              {["Mr", "Ms", "Mrs", "Dr"].map(v => <option key={v} value={v}>{v}</option>)}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col xs={9}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text" placeholder="Enter your name"
              name="username" value={formData.username}
              onChange={handleChange} required
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group controlId="formEmail" className="mt-3">
        <Form.Label>Email</Form.Label>
        <Form.Control type="email" value={email} readOnly />
      </Form.Group>

      <Form.Group controlId="formPhone" className="mt-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel" name="phone_number"
          value={formData.phone_number} readOnly
        />
      </Form.Group>

      

      <Form.Group controlId="formFile" className="mt-3">
        <Form.Label>Payment proof (image/PDF)</Form.Label>
        <Form.Control type="file" accept="image/*,.pdf" onChange={handleFile} required />
      </Form.Group>

      <Button variant="primary" type="submit" className="mt-3">
        Submit
      </Button>
    </Form>
    </>
  );
};

export default ManualPaymentForm;
