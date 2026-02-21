import Link from "next/link";

export const metadata = {
  title: "Why Subscribe / Trial Request | Race Auto India",
  description:
    "Why Race Auto India asks for your details when requesting access to premium automotive market intelligence.",
};

export default function WhySubscribePage() {
  return (
    <main style={{ background: "#0b0f14", minHeight: "100vh", color: "#e5e7eb" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          padding: "40px 16px 60px",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 999,
            border: "1px solid rgba(251,191,36,.18)",
            background: "rgba(251,191,36,.08)",
            color: "#fcd34d",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          Race Auto India • Access Policy
        </div>

        <h1
          style={{
            fontSize: "clamp(1.6rem, 2.5vw, 2.2rem)",
            lineHeight: 1.15,
            margin: "0 0 10px",
            color: "#f9fafb",
            fontWeight: 800,
          }}
        >
          Why do we ask for your details?
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: 15,
            lineHeight: 1.7,
            marginBottom: 22,
            maxWidth: 760,
          }}
        >
          We ask for basic details when you request a free trial so our team can review the request,
          understand your market segment interest, and provide relevant access to the right automotive
          intelligence content. This helps us maintain quality access and support genuine business users.
        </p>

        <section
          style={{
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 16,
            background: "rgba(255,255,255,.02)",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "#fde68a", fontSize: 18, margin: "0 0 10px" }}>
            What we use your details for
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#d1d5db", lineHeight: 1.7 }}>
            <li>To review your free trial request</li>
            <li>To identify the segment/data category you are interested in</li>
            <li>To contact you if your request is approved</li>
            <li>To prevent duplicate or misuse of trial access</li>
          </ul>
        </section>

        <section
          style={{
            border: "1px solid rgba(255,255,255,.06)",
            borderRadius: 16,
            background: "rgba(255,255,255,.02)",
            padding: 16,
            marginBottom: 16,
          }}
        >
          <h2 style={{ color: "#fde68a", fontSize: 18, margin: "0 0 10px" }}>
            What we do not do
          </h2>
          <ul style={{ margin: 0, paddingLeft: 18, color: "#d1d5db", lineHeight: 1.7 }}>
            <li>We do not charge you when you submit a trial request</li>
            <li>We do not require payment to review your request</li>
            <li>We do not ask for unnecessary personal information in this form</li>
          </ul>
        </section>

        <section
          style={{
            border: "1px solid rgba(251,191,36,.14)",
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(251,191,36,.06), rgba(255,255,255,.02))",
            padding: 16,
          }}
        >
          <h2 style={{ color: "#f9fafb", fontSize: 18, margin: "0 0 10px" }}>
            Why segment selection matters
          </h2>
          <p style={{ margin: 0, color: "#d1d5db", lineHeight: 1.7 }}>
            Segment selection helps us understand whether you are looking for Passenger Vehicles,
            Commercial Vehicles, EVs, Two-Wheelers, Construction Equipment, Farm Machinery, or broader
            multi-segment market research. This enables a faster and more relevant review.
          </p>
        </section>

        <div style={{ marginTop: 22 }}>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: 42,
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid rgba(251,191,36,.25)",
              background: "linear-gradient(135deg, #fde68a 0%, #f59e0b 60%, #d97706 100%)",
              color: "#111827",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}