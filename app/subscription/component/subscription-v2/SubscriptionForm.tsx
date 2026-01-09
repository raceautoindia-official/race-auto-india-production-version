"use client";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { Button, Modal, Collapse, Card, Row, Col } from "react-bootstrap";

import PlanDetailsForm from "./PlanDetailsForm";
import ManualPaymentForm from "./ManualPaymentForm";
import BankTransferForm from "./BankTranferForm";
import RazorpayPaymentForm from "./razorpayV2Form";
import AuthModal from "@/app/test/components/LoginFormTest";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

interface PlanInfo {
  planTier: string;
  billingCycle: "monthly" | "annual";
  price: number;
}

const SubscriptionForm = ({ plan }: { plan: string }) => {
  const router = useRouter();

  const [showAuth, setShowAuth] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);

  // Track collapse state for Manual/UPI and Bank sections
  const [openManual, setOpenManual] = useState(false);
  const [openBank, setOpenBank] = useState(false);

  // Load auth token (if user is logged in)
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(null);
  const [subcriptionData, setSubcriptionData] = useState<any>([]);

  const subscriptionApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/purchase/${email}`
      );
      setSubcriptionData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const token: any = Cookies.get("authToken");
    if (token) {
      setToken(token);
      const decoded: any = jwtDecode(token);
      setEmail(decoded.email);
    }
  }, []);

  useEffect(() => {
    if (email !== "") {
      subscriptionApi();
    }
  }, [email]);

  const isActivePlan =
    subcriptionData.length !== 0 && new Date(subcriptionData[0].end_date) > new Date();

  // When "Buy Now" is clicked, either prompt login or open modal
  const handleBuyClick = () => {
    if (!token) {
      toast.warn("Please login to subscribe", { position: "top-center" });
      setShowAuth(true);
    } else {
      setShowModal(true);
    }
  };

  // Close modal and reset to step 1
  const handleClose = () => {
    setShowModal(false);
    setStep(1);
    // collapse any opened secondary forms
    setOpenManual(false);
    setOpenBank(false);
  };

  // Called by PlanDetailsForm when user selects a plan & clicks Next
  const handleNext = (
    planTier: string,
    billingCycle: "monthly" | "annual",
    price: number
  ) => {
    setPlanInfo({ planTier, billingCycle, price });
    setStep(2);
  };

  // Go back to step 1 (PlanDetailsForm)
  const handleBack = () => {
    setStep(1);
    // ensure secondary forms are closed
    setOpenManual(false);
    setOpenBank(false);
  };

  return (
    <>
      {/* 1) AUTH MODAL (if user is not logged in) */}
      <AuthModal show={showAuth} onClose={() => setShowAuth(false)} />

      {/* 2) BUY BUTTON */}
      <div className="text-center">
        <Button variant="dark" onClick={handleBuyClick}>
          {isActivePlan ? "Upgarde Now" : "Buy Now"}
        </Button>
      </div>

      {/* 3) SUBSCRIPTION MODAL */}
      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title className="text-center w-100">
            {step === 1 ? "Confirm Subscription" : "Choose Payment"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {step === 1 ? (
            // ----------- STEP 1: PlanDetailsForm -----------
            <PlanDetailsForm onNext={handleNext} plan={plan} />
          ) : (
            // ----------- STEP 2: PAYMENT OPTIONS -----------
            <>
              {/* ======= RAZORPAY CARD (PRIMARY) ======= */}
              <Card className="mb-2 shadow-sm border-0">
                <Card.Body className="py-3">
                  {/* <h5 className="text-center mb-1">Pay with Card (Razorpay)</h5> */}
                  {planInfo && (
                    <RazorpayPaymentForm
                      closeModal={handleClose}
                      planInfo={planInfo}
                    />
                  )}
                </Card.Body>
              </Card>

              {/* ======= SECONDARY OPTION: MANUAL/UPI ======= */}
              <div className="text-center mb-1">
                <small
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenBank(false);
                    setOpenManual((prev) => !prev);
                  }}
                >
                  {openManual ? "Hide Manual/UPI" : "Show Manual/UPI Payment"}
                </small>
              </div>

              <Collapse in={openManual}>
                <div>
                  <Card className="mb-2 shadow-sm border-0">
                    <Card.Body className="py-3">
                      <h6 className="mb-2">Manual / UPI Payment</h6>
                      {planInfo && (
                        <ManualPaymentForm
                          closeModal={handleClose}
                          planInfo={planInfo}
                        />
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>

              {/* ======= SECONDARY OPTION: BANK TRANSFER ======= */}
              <div className="text-center mb-1">
                <small
                  className="text-primary"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setOpenManual(false);
                    setOpenBank((prev) => !prev);
                  }}
                >
                  {openBank ? "Hide Bank Transfer" : "Show Bank Transfer"}
                </small>
              </div>

              <Collapse in={openBank}>
                <div>
                  <Card className="mb-2 shadow-sm border-0">
                    <Card.Body className="py-3">
                      <h6 className="mb-2">Bank Transfer / NEFT / RTGS</h6>
                      {planInfo && (
                        <BankTransferForm
                          closeModal={handleClose}
                          planInfo={planInfo}
                        />
                      )}
                    </Card.Body>
                  </Card>
                </div>
              </Collapse>

              {/* ======= NAVIGATION BUTTONS ======= */}
              <Row className="mt-2">
                <Col className="text-start">
                  <Button variant="secondary" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                </Col>
                <Col className="text-end">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleClose}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SubscriptionForm;
