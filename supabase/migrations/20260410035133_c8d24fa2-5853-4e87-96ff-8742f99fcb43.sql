
-- Table for temporary KBZ Pay link tokens
CREATE TABLE public.kbzpay_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE,
  phone_local text NOT NULL,
  candidate_ids text[] NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookup by hash
CREATE INDEX idx_kbzpay_link_tokens_hash ON public.kbzpay_link_tokens (token_hash) WHERE used_at IS NULL;

-- Enable RLS (deny all public access — only service role uses this table)
ALTER TABLE public.kbzpay_link_tokens ENABLE ROW LEVEL SECURITY;

-- Cleanup: auto-delete expired tokens older than 1 hour
-- (relies on pg_cron which is already enabled in production)
SELECT cron.schedule(
  'cleanup-kbzpay-link-tokens',
  '*/15 * * * *',
  $$DELETE FROM public.kbzpay_link_tokens WHERE expires_at < now() - interval '1 hour'$$
);
