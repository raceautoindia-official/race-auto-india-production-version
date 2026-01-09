"use client";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button, Col, Form, Row, Modal } from "react-bootstrap";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
/** -----------------------------
 *  1) MANUAL/UPI PAYMENT FORM
 * -----------------------------
 */
const ManualPaymentForm: React.FC<{
  closeModal: () => void;
}> = ({ closeModal }) => {
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    email: "",
    phone_number: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare form data for submission
    const formDataObj = new FormData();
    formDataObj.append("title", formData.title);
    formDataObj.append("username", formData.username);
    formDataObj.append("email", formData.email);
    formDataObj.append("phone_number", formData.phone_number);
    if (file) {
      formDataObj.append("file", file);
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/payment`,
        formDataObj
      );

      if (response.status === 200) {
        toast.success("Subscription successful!", { position: "top-center" });
        // Reset the form
        setFormData({
          title: "",
          username: "",
          email: "",
          phone_number: "",
        });
        setFile(null);
        closeModal();
      }
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <Form onSubmit={handleManualSubmit}>
      <Row className="mb-3">
        <Col xs={3}>
          <Form.Group controlId="formTitle">
            <Form.Label>Title</Form.Label>
            <Form.Select
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            >
              <option value="">Select...</option>
              <option value="Mr">Mr</option>
              <option value="Ms">Ms</option>
              <option value="Mrs">Mrs</option>
              <option value="Dr">Dr</option>
            </Form.Select>
          </Form.Group>
        </Col>

        <Col xs={9}>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </Form.Group>
        </Col>
      </Row>
      <Form.Group controlId="formEmail" className="mt-3">
        <Form.Label>Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formPhone" className="mt-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel"
          placeholder="Enter your phone number"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
      </Form.Group>
      <Form.Group controlId="formFile" className="mt-3">
        <Form.Label>Upload your payment proof (screenshot or PDF)</Form.Label>
        <Form.Control
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileChange}
          required
        />
      </Form.Group>

      <Button variant="primary" type="submit" className="submit-button mt-3">
        Submit
      </Button>
    </Form>
  );
};

/** -------------------------------------------
 *  2) BANK TRANSFER / NEFT / RTGS / IMPS FORM
 * -------------------------------------------
 */
const BankTransferForm: React.FC<{
  closeModal: () => void;
}> = ({ closeModal }) => {
  const [formData, setFormData] = useState<any>({
    paymentMode: "",
    bankName: "",
    amount: "",
    utrChequeNo: "",
    tdsAmount: "",
    email: "",
    phone_number: "",
    agreeTerms: false,
  });

  const handleChange = (e: any) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev: any) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  const handleBankSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation for terms agreement
    if (!formData.agreeTerms) {
      toast.error("Please agree to the terms and conditions.", {
        position: "top-center",
      });
      return;
    }

    // Prepare form data
    const bankData = new FormData();
    bankData.append("paymentMode", formData.paymentMode);
    bankData.append("bankName", formData.bankName);
    bankData.append("amount", formData.amount);
    bankData.append("utrChequeNo", formData.utrChequeNo);
    bankData.append("tdsAmount", formData.tdsAmount);
    bankData.append("email", formData.email);
    bankData.append("phone_number", formData.phone_number);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/subscription/bank-payment`,
        bankData
      );
      if (response.status === 200) {
        toast.success("Bank payment submitted!", { position: "top-center" });
        // Reset form
        setFormData({
          paymentMode: "",
          bankName: "",
          amount: "",
          utrChequeNo: "",
          tdsAmount: "",
          email: "",
          phone_number: "",
          agreeTerms: false,
        });
        closeModal();
      }
    } catch (error) {
      toast.error(
        "Some of the provided information is incorrect. Please try again.",
        {
          position: "top-center",
        }
      );
    }
  };

  return (
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
        <Form.Control
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Phone Number</Form.Label>
        <Form.Control
          type="tel"
          name="phone_number"
          value={formData.phone_number}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* Terms and Conditions Checkbox */}
      <Form.Group className="mb-3" controlId="agreeTerms">
        <Form.Check
          type="checkbox"
          label="I Agree (By checking, you acknowledge that you have read and understood the Undertaking/Terms & conditions/Privacy)"
          name="agreeTerms"
          checked={formData.agreeTerms}
          onChange={handleChange}
        />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  );
};

/** ----------------------------------------
 *  3) MAIN SUBSCRIPTION FORM WITH TOGGLE
 * ----------------------------------------
 */
const SubscriptionForm = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<
    "UPI" | "BANK"
  >("UPI");
  const [token, setToken] = useState(null);

  const handleShow = () => {
    if (!token) {
      toast.warn("Sign in to unlock your purchase!", {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "colored",
            });
      return router.push("/login");
    }
    setShowModal(true);
  };
  const handleClose = () => setShowModal(false);

  useEffect(() => {
    const cookieToken: any = Cookies.get("authToken");
    setToken(cookieToken);
  }, []);

  return (
    <>
      <Button variant="danger" onClick={handleShow}>
        Subscribe
      </Button>

      <Modal size="lg" show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="text-center">Subscription Form</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* Payment Type Toggle */}
          <div className="mb-4">
            <Form.Check
              inline
              type="radio"
              label="UPI / QR Payment"
              name="paymentToggle"
              id="upi-toggle"
              value="UPI"
              checked={selectedPaymentType === "UPI"}
              onChange={() => setSelectedPaymentType("UPI")}
            />
            <Form.Check
              inline
              type="radio"
              label="Bank Transfer / NEFT / RTGS / IMPS / DD / Cheque"
              name="paymentToggle"
              id="bank-toggle"
              value="BANK"
              checked={selectedPaymentType === "BANK"}
              onChange={() => setSelectedPaymentType("BANK")}
            />
          </div>

          {selectedPaymentType === "UPI" ? (
            <>
              {/* Existing Manual Payment Form */}
              <ManualPaymentForm closeModal={handleClose} />
              <hr />
              <div className="row">
                <div className="col-md-6">
                  <div className="payment-info">
                    <h6>Subscribe using any of the payment methods below:</h6>
                    <p>
                      Account Name:{" "}
                      <span className="text-primary">RACE EDITORIALE LLP</span>
                    </p>
                    <p>
                      Account Number:{" "}
                      <span className="text-primary">218505001886</span>
                    </p>
                    <p>
                      IFSC: <span className="text-primary">ICIC0002185</span>
                    </p>
                    <p>
                      Branch Name:{" "}
                      <span className="text-primary">Saidapet Branch</span>
                    </p>
                  </div>
                  <hr />
                  <div className="payment-info">
                    <p>
                      UPI ID:{" "}
                      <span className="text-primary">
                        raceeditorialellp.9840490241.ibz@icici
                      </span>
                    </p>
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-center">
                  <Image
                    src="/images/upi scanner-uuIYAzO1.png"
                    alt="upi scanner"
                    width={120}
                    height={120}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Bank Transfer / NEFT / RTGS / IMPS Form */}
              <BankTransferForm closeModal={handleClose} />
            </>
          )}

          <hr />
          <p className="text-center m-0">
            NOTE:{" "}
            <span className="text-warning">
              Exclusive new article - content should be provided by you before
              the 20th of every month. Our team will ensure its publishing on
              the website and magazine on priority.
            </span>
          </p>
          <p className="mt-2 m-0 text-center">
            RACE FLASH REPORT: Forecast and analytics package is additional,
            reach us for more details.
          </p>
          <p className="mt-2 m-0 text-center" style={{ fontSize: "1rem" }}>
            For{" "}
            <span className="text-success">
              <b>10-50% discounts</b>
            </span>
            , call 9384857578 / 9962110101 or email raceautoindia@gmail.com.
          </p>
          <p className="mt-2 m-0 text-center" style={{ fontSize: "1rem" }}>
            Bronze package can be availed free in the first month on the
            confirmation of any of the premium packages
          </p>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SubscriptionForm;
