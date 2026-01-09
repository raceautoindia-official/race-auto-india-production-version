'use client'
import React, { ReactNode } from "react";
import styles from "./styles/NavigationItem.module.css";

interface NavigationItemProps {
  icon: ReactNode;
  label: string;
  className?: string;
}

export function NavigationItem({
  icon,
  label,
  className,
}: NavigationItemProps) {
  return (
    <div className={`${styles.navItem} ${className || ""}`}>
      {icon}
      {label && <span className={styles.navLabel}>{label}</span>}
    </div>
  );
}
