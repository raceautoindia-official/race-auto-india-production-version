-- Migration: Add business_members table for Business plan seat management
-- Run this once against the race_news database.
-- Internal plan values (bronze/silver/gold/platinum) remain unchanged.
-- gold  => 5 seat limit
-- platinum => 10 seat limit

CREATE TABLE IF NOT EXISTS business_members (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id   INT          NOT NULL,
  member_email    VARCHAR(255) NOT NULL,
  member_user_id  INT          DEFAULT NULL,
  plan_name       VARCHAR(50)  NOT NULL,        -- gold or platinum (matches subscriptions.plan_name)
  status          ENUM('active','removed') NOT NULL DEFAULT 'active',
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_owner_member (owner_user_id, member_email),
  KEY idx_member_email  (member_email),
  KEY idx_owner_user_id (owner_user_id)
);
