import Link from "next/link";
import { FaArrowLeftLong } from "react-icons/fa6";
import ProfileCard from "./ProfileSidebar";
import styles from "./profile.module.css";

export default function PostLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.profileShell}>
      <div className={styles.profileContainer}>
        <div className={styles.topBar}>
          <div>
            <span className={styles.pageEyebrow}>Account Center</span>
            <h1 className={styles.pageTitle}>Profile & Membership</h1>
            <p className={styles.pageSubtitle}>
              Review your account details, active access, team membership, and support options in one clean workspace.
            </p>
          </div>
          <Link href="/" className={styles.backButton}>
            <FaArrowLeftLong />
            Back to Home
          </Link>
        </div>

        <div className={`row ${styles.layoutRow}`}>
          <div className="col-lg-4 col-xl-3">
            <div className={styles.sidebarWrap}>
              <ProfileCard />
            </div>
          </div>
          <div className="col-lg-8 col-xl-9">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
