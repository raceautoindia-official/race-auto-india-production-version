/* eslint-disable react/no-unescaped-entities */
"use client";

import { Card, Col, Form, Row } from "react-bootstrap";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPen,
  FaRegAddressCard,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import Link from "next/link";
import { formatDate } from "@/components/Time";
import {
  getActivePlanName,
  getPlanLabel,
  getPlanTextClass,
  isBusinessPlan,
  getPlanUITitle,
  normalizePlanName,
} from "@/lib/subscriptionPlan";
import styles from "./profile.module.css";

type DecodedToken = { email?: string; role?: string };

type SocialItemProps = {
  title: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
};

function normalizeUrl(url: string) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function SocialItem({ title, value, icon: Icon }: SocialItemProps) {
  const trimmed = value?.trim();
  const href = normalizeUrl(trimmed);

  return (
    <div className={styles.socialItem}>
      <Icon className={styles.socialIcon} />
      <div className={styles.socialContent}>
        <span className={styles.socialTitle}>{title}</span>
        {trimmed ? (
          <a href={href} target="_blank" rel="noreferrer" className={styles.socialLink}>
            {trimmed}
          </a>
        ) : (
          <span className={styles.socialMuted}>Not added yet</span>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const hasValue = Boolean(value?.trim());

  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <div className={`${styles.infoValue} ${!hasValue ? styles.infoValueMuted : ""}`}>
        {hasValue ? value : "Not added yet"}
      </div>
    </div>
  );
}

function ProfileDashboard({ token }: { token: string }) {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [aboutme, setAboutme] = useState<string>("");
  const [instagram, setInstagram] = useState<string>("");
  const [facebook, setFacebook] = useState<string>("");
  const [linkedin, setLinkedin] = useState<string>("");
  const [twitter, setTwitter] = useState<string>("");
  const [subscription, setSubscription] = useState<any[]>([]);
  const [subscriptionPack, setSubscriptionPack] = useState<any[]>([]);
  const [plan, setPlan] = useState<any[]>([]);
  const [membershipData, setMembershipData] = useState<any | null>(null);
  const [pendingMembershipRequest, setPendingMembershipRequest] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [seatLimit, setSeatLimit] = useState(0);
  const [memberEmailInput, setMemberEmailInput] = useState("");
  const [memberActionMsg, setMemberActionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const decoded: DecodedToken = token ? jwtDecode<DecodedToken>(token) : { email: "", role: "user" };

  const subscriptionApi = async () => {
    const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription`);
    setSubscription(res.data);
  };

  const packApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/subscription/${decoded.email}`
      );
      setSubscriptionPack(res.data);
    } catch (err) {
      console.log(err);
      setSubscriptionPack([]);
    }
  };

  const effectiveApi = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/subscription/effective/${decoded.email}`
      );
      setMembershipData(res.data?.membership ?? null);
      setPendingMembershipRequest(res.data?.pendingMembership ?? null);
    } catch {
      setMembershipData(null);
      setPendingMembershipRequest(null);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/business-members?ownerEmail=${encodeURIComponent(decoded.email || "")}`,
        { withCredentials: true }
      );
      setMembers(res.data?.members ?? []);
      setPendingInvites(res.data?.pendingInvites ?? []);
      setSeatLimit(res.data?.seatLimit ?? 0);
    } catch {
      setMembers([]);
      setPendingInvites([]);
    }
  };

  const handleAddMember = async () => {
    setMemberActionMsg(null);
    const memberEmail = memberEmailInput.trim();
    if (!memberEmail) return;

    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/business-members`,
        { memberEmail },
        { withCredentials: true }
      );
      setMemberEmailInput("");
      setMemberActionMsg({
        text:
          res.data?.message ||
          "Membership request created. Ask the member to log in and accept the membership from their profile.",
        ok: true,
      });
      fetchMembers();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to add member.";
      setMemberActionMsg({ text: msg, ok: false });
    }
  };

  const handleAcceptPendingMembership = async () => {
    setMemberActionMsg(null);
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/business-members/accept`,
        {},
        { withCredentials: true }
      );
      setMemberActionMsg({ text: res.data?.message || "Membership approved successfully.", ok: true });
      await effectiveApi();
      await packApi();
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to accept membership.";
      setMemberActionMsg({ text: msg, ok: false });
    }
  };

  const effectivePlan = getActivePlanName(subscriptionPack);
  const isOwnActive = effectivePlan !== "none";
  const isExpired = subscriptionPack[0]?.status === "expired";
  const isMember = membershipData !== null;
  const hasPendingMembershipRequest = pendingMembershipRequest !== null;
  const membershipPlan = isMember ? normalizePlanName(membershipData.plan_name) : "none";
  const resolvedPlanForDetails = isOwnActive ? effectivePlan : membershipPlan;
  const isBusinessOwner = isOwnActive && isBusinessPlan(effectivePlan);

  const userInfo = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile/${decoded.email}`);
      setEmail(res.data[0]?.email || "");
      setName(res.data[0]?.username || "");
      setAboutme(res.data[0]?.about_me || "");
      setInstagram(res.data[0]?.instagram_url || "");
      setFacebook(res.data[0]?.facebook_url || "");
      setLinkedin(res.data[0]?.linkedin_url || "");
      setTwitter(res.data[0]?.twitter_url || "");
    } catch (err) {
      console.log(err);
    }
  };

  // Existing profile data loaders are intentionally run on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    userInfo();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Existing profile subscription loaders are intentionally run on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    subscriptionApi();
    packApi();
    effectiveApi();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (subscription.length !== 0) {
      if (resolvedPlanForDetails === "none") {
        setPlan([]);
        return;
      }
      const filteredPlan = subscription.filter((item: any) => item[resolvedPlanForDetails] === 1);
      setPlan(filteredPlan);
    }
  }, [resolvedPlanForDetails, subscription]);

  // Existing business owner member list loader is intentionally triggered by owner eligibility.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (isBusinessOwner) {
      fetchMembers();
    }
  }, [isBusinessOwner]); // eslint-disable-line react-hooks/exhaustive-deps

  const usedSeats = members.length;
  const remainingSeats = Math.max(0, seatLimit - usedSeats);

  const planDetailItems = useMemo(
    () => plan.filter((item: any) => item.plan !== "usd").map((item: any) => item.plan),
    [plan]
  );

  const accessTypeLabel = isOwnActive
    ? "Direct Membership"
    : isMember
      ? "Shared Membership"
      : isExpired
        ? "Expired Membership"
        : "Free Account";

  const planTitle = isOwnActive
    ? getPlanLabel(effectivePlan)
    : isMember
      ? getPlanUITitle(membershipPlan)
      : isExpired
        ? "Expired"
        : "No Active Plan";

  const statusChipClass = isOwnActive || isMember
    ? styles.activeBadge
    : isExpired
      ? styles.mutedBadge
      : styles.infoBadge;

  const accessDateLabel = isOwnActive
    ? formatDate(subscriptionPack[0]?.end_date)
    : membershipData?.end_date
      ? formatDate(membershipData.end_date)
      : "—";

  return (
    <div className={styles.mainStack}>
      <Card className={`${styles.surfaceCard} ${styles.heroCard}`}>
        <Card.Body className="p-0">
          <div className={styles.heroTop}>
            <div>
              <h2 className={styles.heroTitle}>Welcome back{name ? `, ${name}` : ""}</h2>
              <p className={styles.heroSubtitle}>
                Keep your profile polished, review your current access, and manage your plan details from a cleaner and more responsive workspace.
              </p>
              <div className={styles.badgeRow}>
                <span className={styles.infoBadge}>{accessTypeLabel}</span>
                <span className={statusChipClass}>
                  {isOwnActive || isMember ? "Active Access" : isExpired ? "Plan Expired" : "Free Tier"}
                </span>
              </div>
            </div>
            <Link href="/user/settings" className={styles.primaryButton}>
              <FaPen />
              Edit Profile
            </Link>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Current Access</span>
              <div className={`${styles.statValue} ${isOwnActive || isMember ? getPlanTextClass(isOwnActive ? effectivePlan : membershipPlan) : ""}`}>
                {planTitle}
              </div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Account Email</span>
              <div className={styles.statValue}>{email || decoded.email || "Not available"}</div>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Access Until</span>
              <div className={styles.statValue}>{accessDateLabel}</div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col xl={6}>
          <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
            <Card.Body className="p-0">
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Subscription Overview</h3>
                  <p className={styles.sectionDescription}>
                    Your current ownership or shared access status is shown here without changing any existing subscription logic.
                  </p>
                </div>
                <Link href="/subscription" className={styles.secondaryButton}>
                  {isOwnActive ? "Upgrade Plan" : "Buy a Plan"}
                </Link>
              </div>

              <div className={styles.infoList}>
                {isOwnActive && (
                  <>
                    <InfoRow label="Current Plan" value={getPlanLabel(effectivePlan)} />
                    <InfoRow label="Start Date" value={formatDate(subscriptionPack[0]?.start_date)} />
                    <InfoRow label="End Date" value={formatDate(subscriptionPack[0]?.end_date)} />
                  </>
                )}

                {!isOwnActive && isExpired && (
                  <InfoRow label="Status" value="Your plan has expired." />
                )}

                {!isOwnActive && !isExpired && !isMember && (
                  <InfoRow label="Status" value="You do not have an active paid plan right now." />
                )}

                {!isOwnActive && isMember && (
                  <InfoRow label="Current Access" value={`Shared membership via ${getPlanUITitle(membershipPlan)}`} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
            <Card.Body className="p-0">
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Plan Details</h3>
                  <p className={styles.sectionDescription}>
                    Included access and plan-level features based on your direct plan or inherited membership.
                  </p>
                </div>
              </div>

              {planDetailItems.length > 0 ? (
                <ul className={styles.featureList}>
                  {planDetailItems.map((item, index) => (
                    <li key={`${item}-${index}`} className={styles.featureItem}>
                      <span className={styles.featureBullet} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`${styles.infoItem} ${styles.featureEmpty}`}>
                  No active plan details available.
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {isMember && (
        <Card className={`${styles.surfaceCard} ${styles.noticeCard}`}>
          <Card.Body className="p-0">
            <div className={styles.badgeRow}>
              <span className={styles.infoBadge}>Shared Membership</span>
              <span className={styles.activeBadge}>Active</span>
            </div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Business Shared Access</h3>
                <p className={styles.sectionDescription}>
                  You are currently using shared membership access provided by a business account. Your available features follow the owner's active subscription.
                </p>
              </div>
              <Link href="/subscription" className={styles.ghostButton}>
                Buy Your Own Plan
              </Link>
            </div>

            <div className={styles.tableGrid}>
              <div className={styles.tableLabel}>Plan</div>
              <div className={`${styles.tableValue} ${getPlanTextClass(membershipPlan)}`}>{getPlanUITitle(membershipPlan)}</div>

              {membershipData.owner_email && (
                <>
                  <div className={styles.tableLabel}>Provided by</div>
                  <div className={styles.tableValue}>{membershipData.owner_email}</div>
                </>
              )}

              {membershipData.start_date && (
                <>
                  <div className={styles.tableLabel}>Access from</div>
                  <div className={styles.tableValue}>{formatDate(membershipData.start_date)}</div>
                </>
              )}
              {membershipData.end_date && (
                <>
                  <div className={styles.tableLabel}>Access until</div>
                  <div className={styles.tableValue}>{formatDate(membershipData.end_date)}</div>
                </>
              )}
            </div>

            <p className={styles.noticeText} style={{ marginTop: 20 }}>
              You can still purchase your own subscription at any time. When that happens, your personal plan becomes your primary access plan.
            </p>
          </Card.Body>
        </Card>
      )}

      {hasPendingMembershipRequest && !isMember && (
        <Card className={`${styles.surfaceCard} ${styles.noticeCard}`}>
          <Card.Body className="p-0">
            <div className={styles.badgeRow}>
              <span className={styles.infoBadge}>Membership Invitation</span>
              <span className={styles.infoBadge}>Pending Approval</span>
            </div>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Membership Invitation</h3>
                <p className={styles.sectionDescription}>
                  You have been invited to join a shared {getPlanUITitle(pendingMembershipRequest.plan_name)} plan.
                  Accept the invitation to activate shared access.
                </p>
              </div>
              <button className={styles.primaryButton} type="button" onClick={handleAcceptPendingMembership}>
                Accept Membership
              </button>
            </div>

            <div className={styles.tableGrid}>
              <div className={styles.tableLabel}>Plan</div>
              <div className={styles.tableValue}>{getPlanUITitle(pendingMembershipRequest.plan_name)}</div>
              <div className={styles.tableLabel}>Invited by</div>
              <div className={styles.tableValue}>{pendingMembershipRequest.owner_email || "-"}</div>
              <div className={styles.tableLabel}>Requested on</div>
              <div className={styles.tableValue}>{formatDate(pendingMembershipRequest.invited_at)}</div>
            </div>
          </Card.Body>
        </Card>
      )}

      {isBusinessOwner && (
        <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
          <Card.Body className="p-0">
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Team Access</h3>
                <p className={styles.sectionDescription}>
                  Add members to your <strong>{getPlanUITitle(effectivePlan)}</strong> plan. Members receive access only after they log in and accept the membership from their profile.
                </p>
              </div>
            </div>

            <div className={styles.membersHeader}>
              <div className={styles.memberStat}>
                <span className={styles.statLabel}>Total Seats</span>
                <div className={styles.statValue}>{seatLimit}</div>
              </div>
              <div className={styles.memberStat}>
                <span className={styles.statLabel}>Used Seats</span>
                <div className={styles.statValue}>{usedSeats}</div>
              </div>
              <div className={styles.memberStat}>
                <span className={styles.statLabel}>Remaining</span>
                <div className={styles.statValue}>{remainingSeats}</div>
              </div>
            </div>

            <div className={styles.memberForm}>
              <div className={`${styles.memberInput} flex-grow-1`}>
                <Form.Control
                  type="email"
                  placeholder="member@example.com"
                  value={memberEmailInput}
                  onChange={(e) => setMemberEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddMember()}
                />
              </div>
              <button
                className={styles.primaryButton}
                onClick={handleAddMember}
                disabled={usedSeats >= seatLimit}
                type="button"
              >
                Add Member
              </button>
            </div>

            {memberActionMsg && (
              <p className={memberActionMsg.ok ? styles.messageOk : styles.messageError}>
                {memberActionMsg.text}
              </p>
            )}

            {members.length === 0 ? (
              pendingInvites.length === 0 ? (
                <div className={styles.infoItem}>
                  <span className={styles.infoValueMuted}>No members added yet.</span>
                </div>
              ) : null
            ) : null}

            {(members.length > 0 || pendingInvites.length > 0) && (
              <div className={styles.memberList}>
                {members.map((m: any) => (
                  <div key={`active-${m.id}`} className={styles.memberListItem}>
                    <span className={styles.memberEmail}>{m.member_email}</span>
                    <span className={styles.successBadge}>Approved</span>
                  </div>
                ))}

                {pendingInvites.map((invite: any) => (
                  <div key={`pending-${invite.id}`} className={styles.memberListItem}>
                    <div className={styles.memberMeta}>
                      <span className={styles.memberEmail}>{invite.member_email}</span>
                      <span className={styles.pendingCaption}>Ask the member to log in and accept from Profile</span>
                    </div>
                    <div className={styles.memberActions}>
                      <span className={styles.infoBadge}>Pending Approval</span>
                      <span className={styles.pendingCaption}>In-app approval only</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      <Row className="g-4">
        <Col xl={6}>
          <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
            <Card.Body className="p-0">
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Profile Details</h3>
                  <p className={styles.sectionDescription}>
                    A cleaner read-only view of your primary account information.
                  </p>
                </div>
                <Link href="/user/settings" className={styles.ghostButton}>
                  <FaRegAddressCard />
                  Update Details
                </Link>
              </div>

              <div className={styles.infoList}>
                <InfoRow label="Full Name" value={name} />
                <InfoRow label="Email Address" value={email || decoded.email || ""} />
                <InfoRow label="About Me" value={aboutme} />
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className={`${styles.surfaceCard} ${styles.sectionCard}`}>
            <Card.Body className="p-0">
              <div className={styles.sectionHeader}>
                <div>
                  <h3 className={styles.sectionTitle}>Social Media</h3>
                  <p className={styles.sectionDescription}>
                    Review the public links connected to your account profile.
                  </p>
                </div>
                <Link href="/user/settings" className={styles.ghostButton}>
                  <FaPen />
                  Edit Links
                </Link>
              </div>

              <div className={styles.socialList}>
                <SocialItem title="Facebook" value={facebook} icon={FaFacebook} />
                <SocialItem title="Instagram" value={instagram} icon={FaInstagram} />
                <SocialItem title="X / Twitter" value={twitter} icon={FaXTwitter} />
                <SocialItem title="LinkedIn" value={linkedin} icon={FaLinkedin} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default ProfileDashboard;
