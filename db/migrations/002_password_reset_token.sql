-- Migration: Add password_reset_token column to users table
-- Used to store and then invalidate single-use password reset tokens.
-- Run once against the race_news database.

ALTER TABLE users
  ADD COLUMN password_reset_token TEXT DEFAULT NULL;
