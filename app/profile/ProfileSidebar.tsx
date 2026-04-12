"use client";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { FaCog, FaQuestionCircle, FaUser } from "react-icons/fa";
import { HiBellAlert } from "react-icons/hi2";
import { usePathname } from "next/navigation";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import styles from "./profile.module.css";

type DecodedToken = {
  username?: string;
  email?: string;
};

function ProfileCard() {
  const pathname = usePathname();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [initial, setInitial] = useState<string>("U");
  const [username, setUsername] = useState<string>("Your Account");
  const [email, setEmail] = useState<string>("Manage your profile settings");

  useEffect(() => {
    const pic = Cookies.get("profilePic");
    const token = Cookies.get("authToken");

    if (pic) {
      setProfilePic(decodeURIComponent(pic));
    }

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const nextName = decoded?.username?.trim() || "Your Account";
        const nextEmail = decoded?.email?.trim() || "Manage your profile settings";
        setUsername(nextName);
        setEmail(nextEmail);
        const nextInitial = nextName.charAt(0).toUpperCase();
        if (nextInitial) setInitial(nextInitial);
      } catch (err) {
        console.error("JWT decode error:", err);
      }
    }
  }, []);

  const links = useMemo(
    () => [
      { href: "/profile", label: "My Profile", icon: FaUser },
      { href: "/profile/support", label: "Help & Support", icon: FaQuestionCircle },
      { href: "/profile/subscription", label: "Subscription", icon: HiBellAlert },
      { href: "/user/settings", label: "Account Settings", icon: FaCog },
    ],
    []
  );

  return (
    <div className={styles.sidebarCard}>
      <div className={styles.sidebarTop}>
        <div className={styles.avatarFrame}>
          {profilePic ? (
            <img src={profilePic} alt="profile" className={styles.avatarImage} />
          ) : (
            <div className={styles.avatarFallback}>{initial}</div>
          )}
        </div>
        <h2 className={styles.sidebarTitle}>{username}</h2>
        <p className={styles.sidebarText}>{email}</p>
      </div>

      <nav className={styles.sidebarNav}>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = href === "/profile"
            ? pathname === "/profile"
            : pathname?.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
            >
              <Icon className={styles.navIcon} />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default ProfileCard;
