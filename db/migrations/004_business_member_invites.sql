-- Migration: Add pending invite workflow for business shared members
-- New invites are stored as pending and become active only after acceptance.

CREATE TABLE IF NOT EXISTS business_member_invites (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  owner_user_id   INT          NOT NULL,
  invited_user_id INT          DEFAULT NULL,
  member_email    VARCHAR(255) NOT NULL,
  plan_name       VARCHAR(50)  NOT NULL,
  token_hash      VARCHAR(128) NOT NULL,
  status          ENUM('pending','accepted','expired','revoked') NOT NULL DEFAULT 'pending',
  expires_at      DATETIME     NOT NULL,
  accepted_at     DATETIME     DEFAULT NULL,
  last_sent_at    DATETIME     DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_invite_token_hash (token_hash),
  KEY idx_owner_status (owner_user_id, status),
  KEY idx_member_status (member_email, status),
  KEY idx_expires_at (expires_at)
);
