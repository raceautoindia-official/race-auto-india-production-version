-- Migration: Add payment_orders table (Razorpay webhook activation + reconciliation)
-- Run this once against the race_news database.
--
-- Records the purchase INTENT at order-creation time (email + plan + duration +
-- amount) keyed by the Razorpay order id. This lets the Razorpay webhook
-- (payment.captured / order.paid) activate the correct subscription even when the
-- buyer's browser never returns to verify-payment (captured money, no plan).
-- razorpay_order_id is UNIQUE and doubles as the idempotency key: once a row is
-- 'activated', repeat webhooks are no-ops. Rows left in 'created'/'paid' are what
-- a reconciliation job inspects.
--
-- Additive only — no existing table is modified. Safe to run before deploying the
-- webhook/create-payment code (code tolerates the table being absent).

CREATE TABLE IF NOT EXISTS payment_orders (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  razorpay_order_id   VARCHAR(64)   NOT NULL,
  email               VARCHAR(255)  NOT NULL,
  plan_name           VARCHAR(50)   DEFAULT NULL,   -- bronze/silver/gold/platinum (NULL for legacy clients)
  duration            VARCHAR(20)   DEFAULT NULL,   -- monthly | annual
  amount              DECIMAL(12,2) DEFAULT NULL,   -- rupees
  status              ENUM('created','paid','activated','failed') NOT NULL DEFAULT 'created',
  razorpay_payment_id VARCHAR(64)   DEFAULT NULL,
  activated_at        TIMESTAMP     NULL DEFAULT NULL,
  created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  UNIQUE KEY unique_order (razorpay_order_id),
  KEY idx_email  (email),
  KEY idx_status (status)
);
