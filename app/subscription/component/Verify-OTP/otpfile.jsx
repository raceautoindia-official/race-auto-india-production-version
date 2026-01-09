const SubscriptionModal = ({
  show,
  handleClose,
  plan,
  planPricing,
  duration,
  email,
}
) => {
  const router = useRouter();
  const [isChecked, setIsChecked] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [verifiedOtp, setVerifiedOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // To store the timer ID so we can clear it if needed
  const resendTimerRef = useRef(null);

  const handlePhoneChange = (e) => setPhoneNumber(e.target.value);
  const handleCountryCodeChange = (e) => setCountryCode(e.target.value);
  const handleOtpChange = (e) => setOtp(e.target.value);

  const handleChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const setupRecaptcha = () => {
    // Check if recaptchaVerifier already exists to avoid multiple instances.
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        { size: "invisible" }
      );
    }
  };

  const phoneDataApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`
      );
      setPhoneNumber(res.data[0].phone_number);
      const verified = res.data[0].phone_status == 1;
      setVerifiedOtp(verified);
      setIsVerified(verified);
    } catch (err) {
      console.log(err);
    }
  };

  const sendOTP = async () => {
    if (!phoneNumber) return alert("Please enter a phone number.");
    setLoading(true);
    setupRecaptcha();

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        `${countryCode} ${phoneNumber}`,
        window.recaptchaVerifier
      );
      setConfirmationResult(confirmation);
      setMessage("OTP sent successfully!");
      setOtpSent(true);
      // Start a 60-second timer
      setResendTimer(60);
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
      resendTimerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setMessage("Error sending OTP: " + error.message);
    }

    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp) return alert("Please enter the OTP.");
    setLoading(true);

    try {
      const result = await confirmationResult.confirm(otp);
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/auth/phone/${email}`,
        { phone: `${countryCode} ${phoneNumber}` }
      );
      setMessage("Phone verified! User ID: " + result.user.uid);
      setVerifiedOtp(true);
    } catch (error) {
      setMessage("Invalid OTP, try again.");
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (email === "") {
      toast.warn("Sign in to unlock your purchase!", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
      return router.push("/login");
    }

    if (!isChecked) {
      return toast.warn(
        "Before purchasing our product, you must acknowledge and agree to our terms and conditions by selecting the checkbox.",
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
          transition: Bounce,
        }
      );
    }

    try {
      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/create-payment`,
        {
          customer_email: email,
          AMT: planPricing,
        }
      );

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use Public Key
        amount: planPricing * 100,
        currency: "INR",
        name: "Race auto india",
        order_id: data.id,

        handler: async function (response) {
          const verifyRes = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/verify-payment`,
            {
              ...response,
              email: email,
              plan,
              duration,
            }
          );
          if (verifyRes.data.success) {
            const result = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/admin/transactional-email`, { email, plan, duration })
            router.push(
              `/subscription/payment-success?plan=${plan}&duration=${duration}`
            );
          } else {
            router.push(
              `/subscription/payment-failure?plan=${plan}&duration=${duration}`
            );
          }
        },
        prefill: { email: email },
        theme: { color: "#3399cc" },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Subscription Error:", error);
    }
  };

  useEffect(() => {
    phoneDataApi();
    // Cleanup the timer when the component unmounts
    return () => {
      if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    };
  }, []);



  return (
    <Modal show={show} onHide={handleClose} centered className="custom-modal">
      {/* Modal Header with Gradient Background */}
      <Modal.Header
        closeButton
        className={`modal-header-custom ${plan.toLowerCase()}-gradient`}
      >
        <Modal.Title className="d-flex align-items-center">
          <span className={`plan-badge ${plan.toLowerCase()}`}>
            <FaMedal />
          </span>
          <span className="ms-2">{plan.toUpperCase()} PLAN</span>
        </Modal.Title>
      </Modal.Header>

      {/* Modal Body */}
      <Modal.Body>
        <p className="text-muted">
          Unlock all exclusive <strong>{plan}</strong> plan features after
          purchasing.
        </p>

        <div className="price-section">
          <strong>Price: </strong>
          <span className="price-badge">₹{planPricing}</span>
        </div>

        {/* Form Section */}
        <Form>
          <Form.Group className="mt-2 mb-3">
            <Form.Label>Email ID</Form.Label>
            <Form.Control
              type="email"
              value={email}
              required
              disabled
              className="custom-input"
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <div style={{ display: "flex", gap: "8px" }}>
              <Form.Select
                value={countryCode}
                onChange={handleCountryCodeChange}
                className="custom-input"
                style={{ maxWidth: "100px" }}
                disabled={verifiedOtp}
              >
                {["+91", "+1"].map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </Form.Select>
              <Form.Control
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                disabled={verifiedOtp}
                className="custom-input"
                placeholder="Enter phone number"
              />
              {!verifiedOtp && (
                <Button
                  variant="outline-primary"
                  onClick={sendOTP}
                  disabled={!phoneNumber || (otpSent && resendTimer > 0)}
                >
                  {otpSent
                    ? resendTimer > 0
                      ? `Wait (${resendTimer})`
                      : "Resend OTP"
                    : "Verify"}
                </Button>
              )}
            </div>
          </Form.Group>
          {!verifiedOtp && confirmationResult && (
            <>
              <div className="mb-3">
                <label className="form-label">Enter OTP</label>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="form-control"
                  value={otp}
                  onChange={handleOtpChange}
                />
              </div>
              <Button
                onClick={verifyOTP}
                disabled={!otp}
                className="btn btn-success w-100"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </>
          )}
          {message && (
            <p className="text-center text-muted mt-2">{message}</p>
          )}
          {isVerified && (
            <p className="info-text">
              Your email ID and phone number are retrieved from your login
              information
            </p>
          )}

          <Form.Group className="mb-3">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Form.Check
                type="checkbox"
                checked={isChecked}
                onChange={handleChange}
                required
                className="checkbox-custom"
              />
              <Form.Label style={{ margin: 0 }}>
                I agree to the{" "}
                <Link href="/terms-conditions" className="text-primary">terms and conditions</Link>{" "}
                regarding this purchase
              </Form.Label>
            </div>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="outline-secondary"
          onClick={handleClose}
          className="btn-cancel"
        >
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} className="btn-buy">
          Proceed to Payment
        </Button>
      </Modal.Footer>

    </Modal>
  );
};
