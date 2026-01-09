"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Form } from "react-bootstrap";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/components/Time";

const EditUser = () => {
  const { id } = useParams();

  const [plan, setPlan] = useState<any>(0);
  const [userName, setUserName] = useState("");
  const [currentPlan, setCurrentplan] = useState<any>(0);
  const [planDuration, setPlanDuration] = useState("monthly");
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [currentStartDate, setCurrentStartDate] = useState<any>("");
  const [currentEndDate, setCurrentEndDate] = useState<any>("");
  const [existingPlan, setExistingPlan] = useState(0);
  const [message, setMessage] = useState("");
  const [existingPlanDate, setExistingPlanDate] = useState<any>("");
  const [existingPlanEndDate, setExistingPlanEndDate] = useState<any>("");

  const formatDateCurrrent = (date: any) => {
    const validDate = date instanceof Date ? date : new Date(date);
    const day = String(validDate.getDate()).padStart(2, "0");
    const month = String(validDate.getMonth() + 1).padStart(2, "0");
    const year = validDate.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const calculateDates = (duration: string) => {
    const startDate = new Date();
    const endDate = new Date(startDate);

    if (duration === "monthly") {
      endDate.setMonth(startDate.getMonth() + 1);
    } else if (duration === "annual") {
      endDate.setFullYear(startDate.getFullYear() + 1);
    }

    setCurrentStartDate(formatDateCurrrent(startDate));
    setCurrentEndDate(formatDateCurrrent(endDate));
  };

  const roleData = async () => {
    try {
      const subscriptionRes = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/user_id/${id}`
      );

      setSubscriptionData(subscriptionRes.data);

      if (subscriptionRes.data.length > 0) {
        const date1 = new Date(subscriptionRes.data[0].start_date);
        const date2 = new Date(subscriptionRes.data[0].end_date);

        setExistingPlanDate(subscriptionRes.data[0].start_date);
        setExistingPlanEndDate(subscriptionRes.data[0].end_date);

        // Calculate the difference in milliseconds
        const differenceInMs = date2.getTime() - date1.getTime();

        // Convert milliseconds to days
        const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

        // Determine if it's Monthly (<31 days) or Annual (≥365 days)
        if (differenceInDays < 31) {
          setPlanDuration("monthly");
        } else if (differenceInDays >= 365) {
          setPlanDuration("annual");
        }

        setExistingPlan(0); // Set existing plan flag if data exists
      } else {
        setExistingPlan(1);
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        setExistingPlan(1); // Set existing plan flag to 0 on 404 error
        setMessage(
          "This user is new to subscription, so there is no existing plan"
        );
      }
      console.log(err);
    }
  };

  const formDataApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/user/${id}`
      );
      const data = res.data[0];
      setCurrentplan(data.subscription);
      setPlan(data.subscription);
      setUserName(data.username);
    } catch (err) {
      console.log(err);
    }
  };

  const EditApi = async () => {
    try {
      const planValue =
        plan == 1
          ? "silver"
          : plan == 2
          ? "gold"
          : plan == 3
          ? "platinum"
          : "bronze";

      const formData = {
        plan: planValue,
        duration: planDuration,
        isExisting: existingPlan == 1 ? true : false,
      };
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/user_id/${id}`,
        formData
      );

      toast.success("User value updated!", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } catch (err) {
      console.log(err);
      toast.warn(
        "An error occurred while submitting the form. Please try again later.",
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  useEffect(() => {
    formDataApi();
    roleData();
  }, []);

  useEffect(() => {
    if (existingPlan === 1) calculateDates(planDuration);
  }, [planDuration, existingPlan]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    EditApi();
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <Link href="/admin/subscription/subscribers">
          <button className="btn btn-secondary mt-3">Back</button>
        </Link>
        <div className="shadow-sm p-3 mb-5 mt-5 bg-white rounded border-0">
          <form onSubmit={handleSubmit}>
            <p>User Name: {userName}</p>
            <p>
              Current Plan:{" "}
              <span
                className={
                  currentPlan == 1
                    ? "text-secondary" // Silver
                    : currentPlan == 2
                    ? "text-warning" // Gold
                    : currentPlan == 3
                    ? "text-info" // Platinum
                    : "text-muted" // Bronze
                }
              >
                {currentPlan == 1
                  ? "Silver"
                  : currentPlan == 2
                  ? "Gold"
                  : currentPlan == 3
                  ? "Platinum"
                  : "Bronze"}
              </span>
            </p>

            <Form.Group controlId="Plan" className="mb-3">
              <Form.Label className="">Plan</Form.Label>
              <Form.Control
                as="select"
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
              >
                {[
                  { id: 0, name: "Bronze", value: 0 },
                  { id: 1, name: "Silver", value: 1 },
                  { id: 2, name: "Gold", value: 2 },
                  { id: 3, name: "Platinum", value: 3 },
                ].map((item) => (
                  <option key={item.id} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            <Form.Group controlId="PlanUpdate" className="mb-3">
              <Form.Label className="">Plan Updation</Form.Label>
              <div>
                <Form.Check
                  type="radio"
                  id="existing"
                  label="Existing Plan"
                  value={0}
                  checked={existingPlan === 0}
                  onChange={(e) => setExistingPlan(parseInt(e.target.value))}
                />
                <Form.Check
                  type="radio"
                  id="New"
                  label="New Plan"
                  value={1}
                  checked={existingPlan === 1}
                  onChange={(e) => setExistingPlan(parseInt(e.target.value))}
                />
              </div>
            </Form.Group>
            {existingPlan === 1 && (
              <Form.Group controlId="PlanDuration" className="mb-3">
                <Form.Label className="text-primary">
                  New Plan Duration
                </Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    id="monthly"
                    label="Monthly"
                    value="monthly"
                    checked={planDuration === "monthly"}
                    onChange={(e) => setPlanDuration(e.target.value)}
                  />
                  <Form.Check
                    type="radio"
                    id="annual"
                    label="Annual"
                    value="annual"
                    checked={planDuration === "annual"}
                    onChange={(e) => setPlanDuration(e.target.value)}
                  />
                </div>
              </Form.Group>
            )}
            {existingPlan == 0 && plan !== 0 && (
              <p>
                Current Plan Duration:{" "}
                <span className="text-primary">
                  {formatDateCurrrent(existingPlanDate)} to{" "}
                  {formatDateCurrrent(existingPlanEndDate)}
                </span>
              </p>
            )}

            {existingPlan == 1 && (
              <p className="">
                Plan Duration:{" "}
                <span className="text-primary">
                  {currentStartDate} to {currentEndDate}
                </span>
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
