"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { Modal, Form, Spinner, ProgressBar } from "react-bootstrap";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  id?: number;
  email?: string;
  username?: string;
};

type VariantType = "compact" | "two-step";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  segment: string;
  message: string;
};

const SEGMENTS = [
  "Passenger Vehicles",
  "Commercial Vehicles",
  "Electric Vehicles",
  "Two-Wheelers",
  "Three-Wheelers",
  "Construction Equipment",
  "Farm Machinery",
  "Tyres",
  "Automotive Components",
  "Multi-Segment / Market Research",
];

// Cooldown + trigger settings
const GUEST_COOLDOWN_KEY = "free_trial_popup_hidden_until";
const GUEST_COOLDOWN_MS = 12 * 60 * 60 * 1000; // ✅ 12h
const SESSION_ATTEMPT_KEY = "free_trial_popup_attempted";
const AB_VARIANT_KEY = "free_trial_popup_variant";
const FORM_DRAFT_KEY = "free_trial_popup_form_draft";
const SUCCESS_AUTO_CLOSE_MS = 4000;

const DELAY_MS = 8000;
const SCROLL_TRIGGER_PERCENT = 35;

declare global {
  interface Window {
    __FREE_TRIAL_POPUP_MOUNTED__?: boolean;
    __FREE_TRIAL_POPUP_OPENED__?: boolean;
  }
}

export default function SubscribeModal() {
  const [mountedAllowed, setMountedAllowed] = useState(false);
  const [show, setShow] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const [eligible, setEligible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [variant, setVariant] = useState<VariantType>("two-step");
  const [step, setStep] = useState<1 | 2>(1);
  const [successScreen, setSuccessScreen] = useState(false);

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    company_name: "",
    segment: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const authToken = typeof window !== "undefined" ? Cookies.get("authToken") : undefined;
  const isLoggedIn = useMemo(() => !!authToken, [authToken]);

  const delayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const successCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggeredRef = useRef(false);
  const cleanupFnsRef = useRef<(() => void)[]>([]);

  // ---------------------------
  // Singleton mount guard
  // ---------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.__FREE_TRIAL_POPUP_MOUNTED__) {
      setMountedAllowed(false);
      return;
    }

    window.__FREE_TRIAL_POPUP_MOUNTED__ = true;
    setMountedAllowed(true);

    return () => {
      window.__FREE_TRIAL_POPUP_MOUNTED__ = false;
    };
  }, []);

  // ---------------------------
  // Prefill from JWT token
  // ---------------------------
  useEffect(() => {
    try {
      if (!authToken) return;
      const decoded = jwtDecode<DecodedToken>(authToken);
      setForm((prev) => ({
        ...prev,
        email: decoded?.email || prev.email,
        full_name: decoded?.username || prev.full_name,
      }));
    } catch {
      // ignore decode error
    }
  }, [authToken]);

  // ---------------------------
  // Restore form draft (sessionStorage)
  // ---------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const raw = sessionStorage.getItem(FORM_DRAFT_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return;

      setForm((prev) => ({
        ...prev,
        full_name: parsed.full_name || prev.full_name,
        email: parsed.email || prev.email,
        phone: parsed.phone || prev.phone,
        company_name: parsed.company_name || prev.company_name,
        segment: parsed.segment || prev.segment,
        message: parsed.message || prev.message,
      }));
    } catch {
      // ignore bad storage
    }
  }, []);

  // ---------------------------
  // Persist form draft while typing
  // ---------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      sessionStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(form));
    } catch {
      // ignore storage errors
    }
  }, [form]);

  // ---------------------------
  // Sticky A/B variant assignment
  // ---------------------------
  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = localStorage.getItem(AB_VARIANT_KEY) as VariantType | null;
    if (existing === "compact" || existing === "two-step") {
      setVariant(existing);
      return;
    }
    const assigned: VariantType = Math.random() < 0.5 ? "compact" : "two-step";
    localStorage.setItem(AB_VARIANT_KEY, assigned);
    setVariant(assigned);
  }, []);

  const setGuestCooldown = () => {
    if (!isLoggedIn && typeof window !== "undefined") {
      localStorage.setItem(GUEST_COOLDOWN_KEY, String(Date.now() + GUEST_COOLDOWN_MS));
    }
  };

  const setSessionAttempted = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_ATTEMPT_KEY, "1");
    }
  };

  const hasGuestCooldown = () => {
    if (typeof window === "undefined") return false;
    const hiddenUntil = Number(localStorage.getItem(GUEST_COOLDOWN_KEY) || "0");
    return hiddenUntil > Date.now();
  };

  const hasSessionAttempted = () => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(SESSION_ATTEMPT_KEY) === "1";
  };

  const tryOpenPopup = (source: string) => {
    if (!eligible) return;
    if (triggeredRef.current) return;
    if (typeof window !== "undefined" && window.__FREE_TRIAL_POPUP_OPENED__) return;

    triggeredRef.current = true;
    setSessionAttempted();

    if (typeof window !== "undefined") {
      window.__FREE_TRIAL_POPUP_OPENED__ = true;
    }

    setShow(true);
    // console.log("Popup source:", source);
  };

  // ---------------------------
  // Eligibility check
  // ---------------------------
  useEffect(() => {
    if (!mountedAllowed) return;

    const run = async () => {
      try {
        if (!isLoggedIn && hasGuestCooldown()) {
          setEligible(false);
          return;
        }

        if (hasSessionAttempted()) {
          setEligible(false);
          return;
        }

        const res = await axios.get("/api/free-trial-leads/eligibility");
        setEligible(!!res?.data?.showPopup);
      } catch (e) {
        console.error("Eligibility check failed:", e);
        setEligible(false);
      } finally {
        setCheckingEligibility(false);
      }
    };

    run();
  }, [mountedAllowed, isLoggedIn]);

  // ---------------------------
  // Triggers: delay + scroll + exit intent
  // ---------------------------
  useEffect(() => {
    if (!mountedAllowed) return;
    if (checkingEligibility) return;
    if (!eligible) return;

    // delayed trigger
    delayTimerRef.current = setTimeout(() => {
      tryOpenPopup("delay");
    }, DELAY_MS);

    // scroll trigger
    const onScroll = () => {
      if (triggeredRef.current) return;
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const scrollHeight = doc.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const percent = (scrollTop / scrollHeight) * 100;
      if (percent >= SCROLL_TRIGGER_PERCENT) {
        tryOpenPopup("scroll");
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    cleanupFnsRef.current.push(() => window.removeEventListener("scroll", onScroll));

    // exit intent (desktop only)
    const isDesktop = window.matchMedia("(min-width: 992px)").matches;
    if (isDesktop) {
      const onMouseOut = (e: MouseEvent) => {
        if (triggeredRef.current) return;
        const related = e.relatedTarget as Node | null;
        if (related) return;
        if (e.clientY <= 8) {
          tryOpenPopup("exit-intent");
        }
      };

      document.addEventListener("mouseout", onMouseOut);
      cleanupFnsRef.current.push(() => document.removeEventListener("mouseout", onMouseOut));
    }

    return () => {
      if (delayTimerRef.current) clearTimeout(delayTimerRef.current);
      cleanupFnsRef.current.forEach((fn) => fn());
      cleanupFnsRef.current = [];
    };
  }, [mountedAllowed, checkingEligibility, eligible]);

  // cleanup success auto-close timer
  useEffect(() => {
    return () => {
      if (successCloseTimerRef.current) clearTimeout(successCloseTimerRef.current);
    };
  }, []);

  const resetModalState = () => {
    setStep(1);
    setSuccessScreen(false);
    setErrors({});
  };

  const closePopup = () => {
    setShow(false);
    setGuestCooldown();
    resetModalState();
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateStep1 = () => {
    const next: Record<string, string> = {};

    if (!form.full_name.trim()) next.full_name = "Full name is required";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!validateEmail(form.email.trim())) next.email = "Invalid email";

    const phoneClean = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (phoneClean.length < 8) next.phone = "Enter a valid phone number";

    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateStep2 = () => {
    const next: Record<string, string> = {};
    if (!form.segment.trim()) next.segment = "Segment is required";
    setErrors((prev) => ({ ...prev, ...next }));
    return Object.keys(next).length === 0;
  };

  const validateCompact = () => {
    const next: Record<string, string> = {};

    if (!form.full_name.trim()) next.full_name = "Full name is required";

    if (!form.email.trim()) next.email = "Email is required";
    else if (!validateEmail(form.email.trim())) next.email = "Invalid email";

    const phoneClean = form.phone.replace(/\D/g, "");
    if (!form.phone.trim()) next.phone = "Phone number is required";
    else if (phoneClean.length < 8) next.phone = "Enter a valid phone number";

    if (!form.segment.trim()) next.segment = "Segment is required";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onContinue = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const submitLead = async () => {
    const payload = {
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      company_name: form.company_name.trim(),
      segment: form.segment.trim(),
      message: form.message.trim(),
    };

    const res = await axios.post("/api/free-trial-leads", payload, {
      headers: { "Content-Type": "application/json" },
    });

    return res?.data;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const valid =
      variant === "two-step"
        ? step === 1
          ? validateStep1()
          : validateStep2()
        : validateCompact();

    if (!valid) return;

    if (variant === "two-step" && step === 1) {
      onContinue();
      return;
    }

    setSubmitting(true);
    try {
      const data = await submitLead();

      if (data?.success) {
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(FORM_DRAFT_KEY);
        }

        setSuccessScreen(true);
        setGuestCooldown();

        if (successCloseTimerRef.current) clearTimeout(successCloseTimerRef.current);
        successCloseTimerRef.current = setTimeout(() => {
          closePopup();
        }, SUCCESS_AUTO_CLOSE_MS);
      } else {
        toast.warn(data?.message || "Unable to submit request.", {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        });
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Something went wrong. Please try again.";
      if (err?.response?.status === 409) {
        toast.warn(msg, { position: "top-right", autoClose: 3000, theme: "colored" });
      } else {
        toast.error(msg, { position: "top-right", autoClose: 3000, theme: "colored" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const progressNow = variant === "compact" ? 100 : step === 1 ? 50 : 100;

  if (!mountedAllowed) return null;
  if (checkingEligibility) return null;

  return (
    <>
      <Modal
        show={show}
        onHide={closePopup}
        centered
        backdrop="static"
        dialogClassName="raiTrialModal"
        contentClassName="raiTrialModalContent"
      >
        <Modal.Header closeButton className="rai-header">
          <button
            type="button"
            className="rai-closeTop"
            aria-label="Close"
            onClick={closePopup}
          >
            ✕
          </button>

          <div className="rai-headerWrap">
            <div className="rai-iconCard" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" className="rai-iconSvg">
                <path
                  d="M4 15L9 10L13 14L20 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M16 7H20V11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="rai-headerText">
              <div className="rai-badge">Race Auto India • Premium Access</div>
              <Modal.Title className="rai-title">Start Your 7-Day Free Trial</Modal.Title>
              
            </div>
          </div>

          {/* <div className="rai-stepWrap">
            <div className="rai-stepTop">
              <span className="rai-stepLabel">
                {variant === "compact" ? "Quick Form" : `Step ${step} of 2`}
              </span>
              <span className="rai-stepPercent">{progressNow}%</span>
            </div>
            <ProgressBar now={progressNow} className="rai-progress" />
          </div> */}
        </Modal.Header>

        <Modal.Body className="rai-body">
          {successScreen ? (
            <div className="rai-successCard">
              <div className="rai-successIcon">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 7L9 18L4 13"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h4>Request Submitted Successfully</h4>
              <p>
                Thank you! Our team will review your request and contact you regarding eligible trial access.
              </p>

              <div className="rai-successHint">
                This window will close automatically in 4 seconds.
              </div>

              <div className="rai-successMeta">
                <div><span>Name:</span> {form.full_name || "-"}</div>
                <div><span>Email:</span> {form.email || "-"}</div>
                <div><span>Segment:</span> {form.segment || "-"}</div>
              </div>

              <button type="button" className="rai-btn rai-btn-gold" onClick={closePopup}>
                Done
              </button>
            </div>
          ) : (
            <Form onSubmit={onSubmit}>
              {variant === "two-step" && (
                <div className="rai-stepsIndicator">
                  <div className={`rai-stepPill ${step === 1 ? "active" : "done"}`}>
                    <span>1</span> Contact Details
                  </div>
                  <div className={`rai-stepPill ${step === 2 ? "active" : ""}`}>
                    <span>2</span> Segment & Requirement
                  </div>
                </div>
              )}

              {(variant === "compact" || step === 1) && (
                <div className="rai-stepPanel show">
                  <div className="rai-grid">
                    <div className="rai-field">
                      <Form.Label>Full Name <span>*</span></Form.Label>
                      <Form.Control
                        name="full_name"
                        value={form.full_name}
                        onChange={onChange}
                        isInvalid={!!errors.full_name}
                        placeholder="Enter your full name"
                        className="rai-input"
                        autoComplete="name"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.full_name}
                      </Form.Control.Feedback>
                    </div>

                    <div className="rai-field">
                      <Form.Label>Email <span>*</span></Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={onChange}
                        isInvalid={!!errors.email}
                        placeholder="Enter your email"
                        className="rai-input"
                        autoComplete="email"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </div>

                    <div className="rai-field">
                      <Form.Label>Phone <span>*</span></Form.Label>
                      <Form.Control
                        name="phone"
                        value={form.phone}
                        onChange={onChange}
                        isInvalid={!!errors.phone}
                        placeholder="+91 98765 43210"
                        className="rai-input"
                        inputMode="tel"
                        maxLength={20}
                        autoComplete="tel"
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.phone}
                      </Form.Control.Feedback>
                    </div>

                    {/* Compact variant keeps company in step 1 */}
                    {variant === "compact" && (
                      <div className="rai-field">
                        <Form.Label>Company Name</Form.Label>
                        <Form.Control
                          name="company_name"
                          value={form.company_name}
                          onChange={onChange}
                          placeholder="Enter company name (optional)"
                          className="rai-input"
                          autoComplete="organization"
                        />
                      </div>
                    )}

                    {variant === "compact" && (
                      <div className="rai-field full">
                        <Form.Label>Segment <span>*</span></Form.Label>
                        <Form.Select
                          name="segment"
                          value={form.segment}
                          onChange={onChange}
                          isInvalid={!!errors.segment}
                          className="rai-input rai-select"
                        >
                          <option value="">Select segment</option>
                          {SEGMENTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </Form.Select>
                        <Form.Control.Feedback type="invalid">
                          {errors.segment}
                        </Form.Control.Feedback>
                      </div>
                    )}

                    {variant === "compact" && (
                      <div className="rai-field full">
                        <Form.Label>Requirement / Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="message"
                          value={form.message}
                          onChange={onChange}
                          placeholder="Tell us what data/segment you are looking for (optional)"
                          className="rai-input rai-textarea"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rai-note">
                    <span className="dot" /> We use this only to review and activate eligible trial access.
                  </div>

                  <div className="rai-helpLinkRow">
                    Not sure why we need these details?{" "}
                    <Link href="/why-subscribe" className="rai-helpLink" target="_blank">
                      Why subscribe?
                    </Link>
                  </div>
                </div>
              )}

              {variant === "two-step" && step === 2 && (
                <div className="rai-stepPanel show">
                  <div className="rai-field">
                    <Form.Label>Segment <span>*</span></Form.Label>
                    <Form.Select
                      name="segment"
                      value={form.segment}
                      onChange={onChange}
                      isInvalid={!!errors.segment}
                      className="rai-input rai-select"
                    >
                      <option value="">Select segment</option>
                      {SEGMENTS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {errors.segment}
                    </Form.Control.Feedback>
                  </div>

                  <div className="rai-field mt-2">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control
                      name="company_name"
                      value={form.company_name}
                      onChange={onChange}
                      placeholder="Enter company name (optional)"
                      className="rai-input"
                      autoComplete="organization"
                    />
                  </div>

                  <div className="rai-field mt-2">
                    <Form.Label>Requirement / Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="message"
                      value={form.message}
                      onChange={onChange}
                      placeholder="Tell us what data, segment, country, or insights you are looking for (optional)"
                      className="rai-input rai-textarea"
                    />
                  </div>

                  <div className="rai-highlight">
                    <div className="rai-highlightTitle">What happens next?</div>
                    <ul className="rai-highlightList">
                      <li>Your request will be reviewed by our team</li>
                      <li>Eligible users are contacted for access activation</li>
                      <li>No payment required for trial request submission</li>
                    </ul>
                  </div>

                  <div className="rai-helpLinkRow">
                    Not sure why we need these details?{" "}
                    <Link href="/why-subscribe" className="rai-helpLink" target="_blank">
                      Why subscribe?
                    </Link>
                  </div>
                </div>
              )}

              <div className="rai-actions">
                {variant === "two-step" ? (
                  step === 1 ? (
                    <>
                      <button
                        type="button"
                        className="rai-btn rai-btn-ghost"
                        onClick={closePopup}
                        disabled={submitting}
                      >
                        Close
                      </button>
                      <button
                        type="submit"
                        className="rai-btn rai-btn-primary"
                        disabled={submitting}
                      >
                        Continue
                        <svg viewBox="0 0 20 20" fill="none" className="rai-btnIcon">
                          <path
                            d="M7 4L13 10L7 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="rai-btn rai-btn-secondary"
                        onClick={() => setStep(1)}
                        disabled={submitting}
                      >
                        <svg viewBox="0 0 20 20" fill="none" className="rai-btnIcon">
                          <path
                            d="M13 4L7 10L13 16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Back
                      </button>

                      <button
                        type="submit"
                        className="rai-btn rai-btn-gold"
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Trial Request
                            <svg viewBox="0 0 20 20" fill="none" className="rai-btnIcon">
                              <path
                                d="M7 4L13 10L7 16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </>
                        )}
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <button
                      type="button"
                      className="rai-btn rai-btn-ghost"
                      onClick={closePopup}
                      disabled={submitting}
                    >
                      Close
                    </button>

                    <button
                      type="submit"
                      className="rai-btn rai-btn-gold"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          Submit Trial Request
                          <svg viewBox="0 0 20 20" fill="none" className="rai-btnIcon">
                            <path
                              d="M7 4L13 10L7 16"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      <style jsx global>{`
        .modal.show .raiTrialModalContent {
          animation: raiModalIn 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }

        @keyframes raiModalIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .raiTrialModal .modal-dialog {
          max-width: 680px;
          margin: 0.75rem auto;
        }

        .raiTrialModal .modal-content.raiTrialModalContent {
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 22px;
          overflow: hidden;
          background:
            radial-gradient(circle at top right, rgba(255, 184, 0, 0.08), transparent 38%),
            radial-gradient(circle at top left, rgba(255, 255, 255, 0.04), transparent 28%),
            linear-gradient(180deg, #0b0f14 0%, #0f141b 100%);
          box-shadow:
            0 30px 80px rgba(0, 0, 0, 0.45),
            0 0 0 1px rgba(255, 255, 255, 0.03) inset;
          color: #e5e7eb;
        }

        .raiTrialModal .modal-header .btn-close {
          display: none !important;
        }

        .rai-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding: 16px 16px 12px;
          background: transparent;
          display: block;
          position: relative;
        }

        .rai-closeTop {
          position: absolute;
          top: 10px;
          right: 10px;
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.03);
          color: #e5e7eb;
          display: grid;
          place-items: center;
          font-size: 16px;
          line-height: 1;
          transition: all 0.18s ease;
          z-index: 2;
        }

        .rai-closeTop:hover {
          background: rgba(255, 255, 255, 0.07);
          color: #fff;
        }

        .rai-headerWrap {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding-right: 42px;
        }

        .rai-iconCard {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          color: #fbbf24;
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.18), rgba(251, 191, 36, 0.06));
          border: 1px solid rgba(251, 191, 36, 0.22);
          box-shadow: 0 10px 24px rgba(251, 191, 36, 0.08);
          flex: 0 0 auto;
        }

        .rai-iconSvg {
          width: 22px;
          height: 22px;
        }

        .rai-headerText {
          flex: 1;
          min-width: 0;
        }

        .rai-badge {
          display: inline-flex;
          align-items: center;
          font-size: 11px;
          font-weight: 700;
          color: #fcd34d;
          background: rgba(251, 191, 36, 0.1);
          border: 1px solid rgba(251, 191, 36, 0.18);
          padding: 6px 10px;
          border-radius: 999px;
          margin-bottom: 9px;
        }

        .rai-title {
          color: #f9fafb;
          font-weight: 700;
          font-size: 1.28rem;
          margin: 0 0 4px;
          line-height: 1.2;
        }

        .rai-subtitle {
          margin: 0;
          color: #9ca3af;
          font-size: 0.9rem;
          line-height: 1.35;
          max-width: 95%;
        }

        .rai-stepWrap {
          margin-top: 12px;
        }

        .rai-stepTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .rai-stepLabel,
        .rai-stepPercent {
          font-size: 12px;
          color: #cbd5e1;
          font-weight: 600;
        }

        .rai-progress {
          height: 7px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.07);
        }

        .rai-progress .progress-bar {
          background: linear-gradient(90deg, #f59e0b 0%, #fcd34d 100%);
          border-radius: 999px;
        }

        .rai-body {
          padding: 14px 16px 16px;
          background: transparent;
          max-height: calc(100vh - 180px);
          overflow-y: auto;
        }

        .rai-stepsIndicator {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .rai-stepPill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 999px;
          padding: 7px 11px;
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.02);
        }

        .rai-stepPill span {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          display: inline-grid;
          place-items: center;
          font-size: 11px;
          background: rgba(255, 255, 255, 0.08);
          color: #e5e7eb;
        }

        .rai-stepPill.active {
          color: #f8fafc;
          border-color: rgba(251, 191, 36, 0.25);
          background: rgba(251, 191, 36, 0.08);
        }

        .rai-stepPill.active span {
          background: linear-gradient(180deg, #f59e0b, #d97706);
          color: #111827;
          font-weight: 700;
        }

        .rai-stepPill.done {
          color: #d1d5db;
          border-color: rgba(251, 191, 36, 0.2);
          background: rgba(251, 191, 36, 0.05);
        }

        .rai-stepPanel.show {
          display: block;
          animation: raiStepIn 0.18s ease;
        }

        @keyframes raiStepIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .rai-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 12px;
        }

        .rai-field.full {
          grid-column: 1 / -1;
        }

        .rai-field label {
          color: #e5e7eb;
          font-size: 0.84rem;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .rai-field label span {
          color: #fca5a5;
        }

        .rai-input {
          min-height: 42px;
          border-radius: 12px !important;
          border: 1px solid rgba(255, 255, 255, 0.09) !important;
          background: rgba(255, 255, 255, 0.03) !important;
          color: #f9fafb !important;
          padding: 10px 12px;
          font-size: 0.93rem;
          box-shadow: none !important;
          transition: all 0.18s ease;
        }

        .rai-input::placeholder {
          color: #9ca3af !important;
        }

        .rai-input:focus {
          border-color: rgba(251, 191, 36, 0.45) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.09) !important;
        }

        .rai-select {
          padding-right: 34px;
        }

        .rai-select option {
          color: #111827;
          background: #fff;
        }

        .rai-textarea {
          min-height: 105px;
          resize: vertical;
        }

        .rai-note {
          margin-top: 10px;
          color: #9ca3af;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .rai-note .dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.12);
          flex: 0 0 auto;
        }

        .rai-helpLinkRow {
          margin-top: 8px;
          font-size: 12px;
          color: #9ca3af;
          line-height: 1.4;
        }

        .rai-helpLink {
          color: #fcd34d !important;
          text-decoration: none;
          font-weight: 600;
          border-bottom: 1px dashed rgba(251, 191, 36, 0.4);
        }

        .rai-helpLink:hover {
          color: #fde68a !important;
          border-bottom-color: rgba(251, 191, 36, 0.8);
        }

        .rai-highlight {
          margin-top: 12px;
          border-radius: 14px;
          padding: 12px;
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.07), rgba(251, 191, 36, 0.02));
          border: 1px solid rgba(251, 191, 36, 0.14);
        }

        .rai-highlightTitle {
          color: #fde68a;
          font-weight: 700;
          font-size: 0.9rem;
          margin-bottom: 6px;
        }

        .rai-highlightList {
          margin: 0;
          padding-left: 16px;
          color: #d1d5db;
          font-size: 0.83rem;
          line-height: 1.45;
        }

        .rai-highlightList li + li {
          margin-top: 4px;
        }

        .rai-actions {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .rai-btn {
          min-height: 42px;
          border-radius: 12px;
          border: 1px solid transparent;
          padding: 0 14px;
          font-size: 0.9rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.18s ease;
          text-decoration: none;
        }

        .rai-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .rai-btnIcon {
          width: 16px;
          height: 16px;
          flex: 0 0 auto;
        }

        .rai-btn-ghost {
          background: rgba(255, 255, 255, 0.02);
          color: #cbd5e1;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .rai-btn-ghost:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .rai-btn-secondary {
          background: rgba(255, 255, 255, 0.04);
          color: #e5e7eb;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .rai-btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.07);
        }

        .rai-btn-primary {
          color: #111827;
          border-color: rgba(251, 191, 36, 0.3);
          background: linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%);
          box-shadow: 0 8px 22px rgba(245, 158, 11, 0.22);
        }

        .rai-btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 26px rgba(245, 158, 11, 0.28);
        }

        .rai-btn-gold {
          color: #111827;
          border-color: rgba(251, 191, 36, 0.35);
          background: linear-gradient(135deg, #fde68a 0%, #f59e0b 60%, #d97706 100%);
          box-shadow: 0 10px 24px rgba(245, 158, 11, 0.24);
        }

        .rai-btn-gold:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 14px 28px rgba(245, 158, 11, 0.3);
        }

        .rai-successCard {
          border-radius: 16px;
          border: 1px solid rgba(251, 191, 36, 0.14);
          background: linear-gradient(180deg, rgba(251, 191, 36, 0.06), rgba(255, 255, 255, 0.02));
          padding: 16px;
          text-align: center;
        }

        .rai-successIcon {
          width: 58px;
          height: 58px;
          margin: 0 auto 12px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          color: #fbbf24;
          border: 1px solid rgba(251, 191, 36, 0.18);
          background: rgba(251, 191, 36, 0.08);
        }

        .rai-successIcon svg {
          width: 28px;
          height: 28px;
        }

        .rai-successCard h4 {
          margin: 0 0 8px;
          color: #f9fafb;
          font-weight: 700;
          font-size: 1.05rem;
        }

        .rai-successCard p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.9rem;
          line-height: 1.45;
        }

        .rai-successHint {
          margin-top: 8px;
          color: #9ca3af;
          font-size: 12px;
        }

        .rai-successMeta {
          margin: 14px 0;
          text-align: left;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 0.86rem;
          color: #d1d5db;
        }

        .rai-successMeta > div + div {
          margin-top: 6px;
        }

        .rai-successMeta span {
          color: #9ca3af;
          min-width: 70px;
          display: inline-block;
        }

        .raiTrialModal .invalid-feedback {
          font-size: 0.78rem;
          margin-top: 4px;
          color: #fca5a5;
        }

        .raiTrialModal .form-control.is-invalid,
        .raiTrialModal .form-select.is-invalid {
          border-color: rgba(239, 68, 68, 0.45) !important;
          background-image: none !important;
        }

        @media (max-width: 767px) {
          .raiTrialModal .modal-dialog {
            max-width: calc(100vw - 10px);
            width: calc(100vw - 10px);
            margin: 5px auto;
          }

          .raiTrialModal .modal-content.raiTrialModalContent {
            border-radius: 14px;
            min-height: auto;
          }

          .rai-header {
            padding: 12px 12px 10px;
          }

          .rai-closeTop {
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            border-radius: 9px;
            font-size: 14px;
          }

          .rai-headerWrap {
            gap: 10px;
            padding-right: 38px;
          }

          .rai-iconCard {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }

          .rai-title {
            font-size: 1.06rem;
            line-height: 1.15;
            margin-top: 1px;
          }

          .rai-subtitle {
            font-size: 0.83rem;
            max-width: 100%;
            line-height: 1.3;
          }

          .rai-stepWrap {
            margin-top: 10px;
          }

          .rai-body {
            padding: 12px;
            max-height: calc(100vh - 150px);
          }

          .rai-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .rai-stepsIndicator {
            gap: 6px;
            margin-bottom: 10px;
          }

          .rai-stepPill {
            font-size: 11px;
            padding: 6px 9px;
          }

          .rai-actions {
            flex-direction: column-reverse;
            gap: 8px;
          }

          .rai-btn {
            width: 100%;
          }

          .rai-input {
            min-height: 40px;
            font-size: 0.92rem;
          }

          .rai-textarea {
            min-height: 88px;
          }

          .rai-successCard {
            padding: 14px;
          }

          .rai-successIcon {
            width: 52px;
            height: 52px;
            border-radius: 14px;
          }

          .rai-successIcon svg {
            width: 24px;
            height: 24px;
          }
        }
      `}</style>
    </>
  );
}