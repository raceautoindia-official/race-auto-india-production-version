-- Migration: Add email_notifications table for idempotent email delivery markers.
-- Used for welcome / subscription confirmation / daily expiry reminder dedupe.
-- Run once against the race_news database.

CREATE TABLE IF NOT EXISTS email_notifications (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  event_type    VARCHAR(80)  NOT NULL,
  event_key     VARCHAR(255) NOT NULL,
  user_id       INT          DEFAULT NULL,
  email         VARCHAR(255) DEFAULT NULL,
  meta_json     TEXT         DEFAULT NULL,
  created_at    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY uniq_event_key (event_key),
  KEY idx_event_type (event_type),
  KEY idx_user_id (user_id),
  KEY idx_email (email)
);
