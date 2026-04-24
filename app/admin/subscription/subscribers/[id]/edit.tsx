"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPlanUITitle, normalizePlanName } from "@/lib/subscriptionPlan";

type DurationType = "monthly" | "annual" | "custom_days";

const PLAN_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "bronze", label: getPlanUITitle("bronze") },
  { value: "silver", label: getPlanUITitle("silver") },
  { value: "gold", label: getPlanUITitle("gold") },
  { value: "platinum", label: getPlanUITitle("platinum") },
];

const USER_PLAN_CODE_TO_NAME: Record<number, string> = {
  0: "free",
  1: "bronze",
  2: "silver",
  3: "gold",
  4: "platinum",
};

function toDateInput(value: any): string {
  if (!value) return new Date().toISOString().slice(0, 10);
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return new Date().toISOString().slice(0, 10);
  return dt.toISOString().slice(0, 10);
}

function durationDays(type: DurationType, customDays: number) {
  if (type === "annual") return 365;
  if (type === "custom_days") return Math.max(1, Math.floor(customDays || 1));
  return 30;
}

function addDays(startDate: string, days: number): string {
  const dt = new Date(startDate);
  if (Number.isNaN(dt.getTime())) return "-";
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

const EditUser = () => {
  const { id } = useParams();

  const [userName, setUserName] = useState("");
  const [currentPlanCode, setCurrentPlanCode] = useState(0);
  const [currentSubscription, setCurrentSubscription] = useState<any | null>(null);
  const [message, setMessage] = useState("");

  const [selectedPlan, setSelectedPlan] = useState("free");
  const [planUpdateMode, setPlanUpdateMode] = useState<"existing" | "new">("existing");
  const [durationType, setDurationType] = useState<DurationType>("monthly");
  const [customDays, setCustomDays] = useState<number>(7);
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const planDays = useMemo(() => durationDays(durationType, customDays), [durationType, customDays]);
  const previewEndDate = useMemo(() => addDays(startDate, planDays), [startDate, planDays]);

  const loadUserData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user/${id}`
      );
      const data = res.data[0];
      setCurrentPlanCode(Number(data?.subscription || 0));
      setUserName(data?.username || "");
      setSelectedPlan(USER_PLAN_CODE_TO_NAME[Number(data?.subscription || 0)] || "free");
    } catch (err) {
      console.log(err);
    }
  };

  const loadSubscriptionData = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/user_id/${id}`
      );

      const sub = Array.isArray(res.data) && res.data.length > 0 ? res.data[0] : null;
      setCurrentSubscription(sub);

      if (sub) {
        setSelectedPlan(String(sub.plan_name || "free").toLowerCase());
        setStartDate(toDateInput(sub.start_date));
        const start = new Date(sub.start_date);
        const end = new Date(sub.end_date);
        const diffDays = Math.max(
          1,
          Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        );
        if (diffDays === 30) {
          setDurationType("monthly");
        } else if (diffDays === 365) {
          setDurationType("annual");
        } else {
          setDurationType("custom_days");
          setCustomDays(diffDays);
        }
      } else {
        setPlanUpdateMode("new");
        setMessage("This user has no prior subscription record.");
      }
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setPlanUpdateMode("new");
        setMessage("This user has no prior subscription record.");
      }
      console.log(err);
    }
  };

  const submitUpdate = async () => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/user_id/${id}`, {
        plan: selectedPlan,
        isExisting: planUpdateMode === "new",
        durationType,
        customDays,
        startDate,
      });

      toast.success("Subscriber plan updated successfully.", {
        position: "top-right",
        autoClose: 3000,
      });
      loadSubscriptionData();
      loadUserData();
    } catch (err) {
      console.log(err);
      toast.warn("An error occurred while updating this subscriber.", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  };

  useEffect(() => {
    loadUserData();
    loadSubscriptionData();
  }, []);

  const currentUserPlanName = USER_PLAN_CODE_TO_NAME[currentPlanCode] || "free";
  const currentUserPlanLabel = currentUserPlanName === "free"
    ? "Free"
    : getPlanUITitle(normalizePlanName(currentUserPlanName));

  const handleSubmit = (e: any) => {
    e.preventDefault();
    submitUpdate();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-7">
        <Link href="/admin/subscription/subscribers">
          <button className="btn btn-secondary mt-3">Back</button>
        </Link>

        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <form onSubmit={handleSubmit}>
            <p>User Name: {userName}</p>
            <p>
              Current Plan: <span className="text-primary">{currentUserPlanLabel}</span>
            </p>
            {currentSubscription && (
              <p>
                Current Window:{" "}
                <span className="text-primary">
                  {toDateInput(currentSubscription.start_date)} to {toDateInput(currentSubscription.end_date)}
                </span>
              </p>
            )}

            <Form.Group controlId="Plan" className="mb-3">
              <Form.Label>Plan</Form.Label>
              <Form.Control
                as="select"
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
              >
                {PLAN_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="PlanUpdate" className="mb-3">
              <Form.Label>Plan Update Mode</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="existing"
                  label="Update Existing Window"
                  checked={planUpdateMode === "existing"}
                  onChange={() => setPlanUpdateMode("existing")}
                />
                <Form.Check
                  type="radio"
                  id="new"
                  label="Create New Window"
                  checked={planUpdateMode === "new"}
                  onChange={() => setPlanUpdateMode("new")}
                />
              </div>
            </Form.Group>

            {selectedPlan !== "free" && (
              <>
                <Form.Group controlId="StartDate" className="mb-3">
                  <Form.Label>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group controlId="DurationType" className="mb-3">
                  <Form.Label>Duration Type</Form.Label>
                  <div>
                    <Form.Check
                      type="radio"
                      id="monthly"
                      label="Monthly (30 days)"
                      checked={durationType === "monthly"}
                      onChange={() => setDurationType("monthly")}
                    />
                    <Form.Check
                      type="radio"
                      id="annual"
                      label="Annual (365 days)"
                      checked={durationType === "annual"}
                      onChange={() => setDurationType("annual")}
                    />
                    <Form.Check
                      type="radio"
                      id="custom"
                      label="Custom Days"
                      checked={durationType === "custom_days"}
                      onChange={() => setDurationType("custom_days")}
                    />
                  </div>
                </Form.Group>

                {durationType === "custom_days" && (
                  <Form.Group controlId="CustomDays" className="mb-3">
                    <Form.Label>Custom Duration (Days)</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      value={customDays}
                      onChange={(e) => setCustomDays(Number(e.target.value || 1))}
                    />
                  </Form.Group>
                )}

                <p>
                  End Date Preview: <span className="text-primary">{previewEndDate}</span>
                </p>
              </>
            )}

            {selectedPlan === "free" && (
              <p className="text-primary mb-3">
                Saving as Free will remove paid access for this user.
              </p>
            )}

            <p className="text-warning">{message}</p>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
