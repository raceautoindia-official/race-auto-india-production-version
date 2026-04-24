"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PendingMembership = {
  owner_email: string;
  plan_name: string;
  status: string;
} | null;

export default function AcceptBusinessMemberInvitePage() {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [pendingMembership, setPendingMembership] = useState<PendingMembership>(null);

  useEffect(() => {
    let active = true;

    const loadPendingMembership = async () => {
      try {
        const res = await fetch("/api/business-members/accept", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = await res.json();
        if (!active) return;

        if (res.status === 401) {
          setSuccess(false);
          setPendingMembership(null);
          setMessage("Please sign in with the invited account to review this membership request.");
          return;
        }

        if (!res.ok) {
          setSuccess(false);
          setPendingMembership(null);
          setMessage(data?.error || "Unable to load membership request.");
          return;
        }

        const nextPendingMembership = data?.pendingMembership ?? null;
        setPendingMembership(nextPendingMembership);
        setSuccess(false);
        setMessage(
          nextPendingMembership
            ? ""
            : "No pending membership request was found for this account."
        );
      } catch {
        if (!active) return;
        setSuccess(false);
        setPendingMembership(null);
        setMessage("Unable to load your membership request right now. Please try again.");
      } finally {
        if (active) {
          setPageLoading(false);
        }
      }
    };

    loadPendingMembership();

    return () => {
      active = false;
    };
  }, []);

  const acceptInvite = async () => {
    if (!pendingMembership) {
      setSuccess(false);
      setMessage("No pending membership request was found for this account.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/business-members/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setSuccess(false);
        setMessage(data?.error || "Unable to accept this invitation.");
        return;
      }

      setSuccess(true);
      setPendingMembership(null);
      setMessage("Membership approved successfully. You can now access your shared plan benefits.");
    } catch {
      setSuccess(false);
      setMessage("Unable to process your invitation right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light px-3">
      <div className="card shadow-sm border-0" style={{ maxWidth: 640, width: "100%" }}>
        <div className="card-body p-4 p-md-5">
          <h1 className="h3 mb-2">Shared Membership Invitation</h1>
          <p className="text-muted mb-4">
            Sign in with the invited account, then accept to activate shared access from your account.
          </p>

          {pageLoading && (
            <div className="alert alert-secondary" role="alert">
              Checking your membership request...
            </div>
          )}

          {!pageLoading && pendingMembership && !success && (
            <div className="alert alert-info" role="alert">
              <strong>{pendingMembership.owner_email}</strong> invited you to join a shared{" "}
              <strong>{pendingMembership.plan_name}</strong> plan.
            </div>
          )}

          {message && (
            <div className={`alert ${success ? "alert-success" : "alert-warning"}`} role="alert">
              {message}
            </div>
          )}

          <div className="d-flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={acceptInvite}
              disabled={pageLoading || loading || !pendingMembership || success}
            >
              {loading ? "Accepting..." : "Accept Membership"}
            </button>
            <Link href="/profile" className="btn btn-outline-secondary">
              Go to Profile
            </Link>
            {success && (
              <button type="button" className="btn btn-success" onClick={() => router.push("/profile")}>
                Go to Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
