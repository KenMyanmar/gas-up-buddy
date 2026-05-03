# Grand Plan: Payment State Machine

**Version:** 1.2
**Date:** 2026-05-03
**Author:** Cowork (Claude)
**Reviewers:** Architect (Oldman), Operator (Codex)
**Approver:** CEO (Ken)
**Status:** DRAFT — awaiting Architect final approval, then CEO sign-off
**Risk class:** P0 (production payment path)
**Estimated execution time:** ~30 min (3 SQL blocks + 4 edge function deploys)
**Estimated rollback time:** ~2 min per block (DROP statements + redeploy previous edge function versions)

---

## Changelog from v1.1 (Architect review round 2)

| # | Issue | Source | Fix |
|---|---|---|---|
| 1 | Writer map wrong: said `create-order-intent` writes `pending` | Architect | Corrected: it already writes `draft`. `kbzpay-create-payment` promotes to `new` + `pending`. |
| 2 | OPEN branch left `orders.status = 'draft'` — order invisible to CRM/agents | Architect | Fixed: OPEN branch now explicitly sets `orders.status = 'new'` alongside `payment_status = 'pending'`. |
| 3 | `payments.status` not handled for `abandoned` — split truth possible | Architect | Fixed: TRANSITION branch now explicitly updates `payments.status` for ALL terminal states including `abandoned`. |
| 4 | `updated_at` trigger claim unproven | Architect | Proven FALSE — `set_order_timestamps` only handles `offered_at`/`in_progress_at`/`delivered_at`. RPC now explicitly sets `updated_at = now()`. |

### SQL evidence for Issue 4 (trigger does NOT handle `updated_at`)

```sql
-- Actual trigger function source:
CREATE OR REPLACE FUNCTION public.set_order_timestamps()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NEW.status = 'offered' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.offered_at := COALESCE(NEW.offered_at, now());
  END IF;
  IF NEW.status = 'in_progress' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.in_progress_at := COALESCE(NEW.in_progress_at, now());
    NEW.accepted_at := COALESCE(NEW.accepted_at, now());
  END IF;
  IF NEW.status = 'delivered' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
    NEW.delivered_at := COALESCE(NEW.delivered_at, now());
  END IF;
  RETURN NEW;
END;
$function$
-- Verdict: NO reference to updated_at. RPC must set it explicitly.
```

### SQL evidence for Issue 3 (`payments.status` drift)

```sql
-- Live data: orders.payment_status vs payments.status for dead orders
-- abandoned: 9 orders, ALL have NO payments row (null)
-- expired:  19 orders, ALL have payments.status = 'failed' (not 'expired')
-- failed:   11 orders, ALL have payments.status = 'failed' (aligned)
```

---

## 1. Problem Statement

Five edge functions independently write `orders.payment_status` with no coordinator. One gatekeeper RPC with row locking, transition validation, and an immutable event log fixes this.

### Corrected Writer Map (verified against repo source + live DB)

| # | Edge Function | Version | What it writes | Verified |
|---|---|---|---|---|
| 1 | `create-order-intent` | v5 | `orders.status = 'draft'`, `payment_status = 'draft'` on INSERT | Source: `index.ts:175` |
| 2 | `kbzpay-create-payment` | v40 | Promotes to `orders.status = 'new'`, `payment_status = 'pending'` + INSERTs `payments` row | Source: `index.ts:109` |
| 3 | `kbzpay-webhook` | v34 | `payment_status` → `paid` or `failed` | Deployed v34 |
| 4 | `kbzpay-query-order` | v9 | `payment_status` → `paid`, `failed`, or `expired` | Deployed v9 |
| 5 | `kbzpay-reconcile-cron` | v8 | `payment_status` → `expired` or `abandoned` + `orders.status = 'cancelled'` | Deployed v8 |

### Current Data (live, 2026-05-03)

KBZ Mini App orders (100 total):

| `orders.status` | `payment_status` | `payments.status` | Count | Notes |
|---|---|---|---|---|
| `new` | `paid` | `paid`/`succeeded` | 47 | Paid, awaiting agent pickup |
| `delivered` | `paid` | `paid`/`succeeded` | 12 | Fully completed |
| `cancelled` | `expired` | `failed` | 19 | Split truth: order says `expired`, payment says `failed` |
| `cancelled` | `failed` | `failed` | 11 | Aligned |
| `cancelled` | `abandoned` | `null` (no row) | 9 | No `payments` row ever created |
| `cancelled` | `paid` | `paid` | 2 | Anomaly: paid then manually cancelled |

---

## 2. Solution: Two-Branch RPC

### Branch contracts

| Branch | Entry condition | CREATE/UPDATE | What it does |
|---|---|---|---|
| OPEN | `payment_status = 'draft'` AND `p_to_status = 'pending'` | CREATE | INSERT `payments` row + UPDATE `orders.status = 'new'` + UPDATE `orders.payment_status = 'pending'` |
| TRANSITION | everything else | UPDATE | Validate against allowlist + UPDATE `orders.payment_status` + UPDATE `payments.status` + conditionally UPDATE `orders.status` |

These branches share **zero** validation logic. Dispatch is deterministic.

### State Machine

```text
         ┌──────────┐
         │  draft   │  (create-order-intent inserts this)
         └────┬─────┘
              │ OPEN branch (+ orders.status → 'new')
              ▼
         ┌──────────┐
         │ pending  │  (kbzpay-create-payment calls OPEN)
         └────┬─────┘
              │ TRANSITION branch
    ┌─────────┼─────────┐
    ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌─────────┐
│  paid  │ │ failed │ │ expired │
│TERMINAL│ └───┬────┘ └────┬────┘
└────────┘     │           │
          ┌────┼────┐      │
          ▼    ▼    ▼      ▼
      (paid)(expired)(abandoned) (paid) ← late webhook rescue
                    │
                    ▼
               ┌─────────┐
               │abandoned│
               │TERMINAL │
               └─────────┘
```

### Complete transition table

| From | To | Branch | Trigger | `orders.status` effect | `payments.status` effect |
|---|---|---|---|---|---|
| draft | pending | OPEN | create-payment | → `new` | INSERT row with `pending` |
| pending | paid | TRANSITION | webhook, query-order | no change | → `paid` |
| pending | failed | TRANSITION | webhook, query-order | → `cancelled` | → `failed` |
| pending | expired | TRANSITION | query-order, cron | → `cancelled` | → `expired` |
| failed | paid | TRANSITION | webhook (late) | → `new` (un-cancel) | → `paid` |
| failed | expired | TRANSITION | cron | no change (already cancelled) | → `expired` |
| failed | abandoned | TRANSITION | cron (>24h) | no change (already cancelled) | → `abandoned` (if row exists) |
| expired | paid | TRANSITION | webhook (very late) | → `new` (un-cancel) | → `paid` |

### Terminal states

`paid`, `abandoned`, `cod` — nothing leaves these.

### `orders.status` scope statement

This RPC manages `orders.status` ONLY for payment-related transitions:
- Payment dies → `cancelled` (with `cancelled_at` and `cancelled_reason`)
- Payment revives from `failed`/`expired` → `new` (un-cancel, return to agent queue)
- OPEN branch → `new` (makes order visible to CRM/agents)
- Normal `paid` from `pending` → no change (stays `new`, agents pick it up)

Order lifecycle (`new → confirmed → in_progress → delivered`) is a separate state machine, **not in scope**.

---

## 3. Schema: SQL Blocks

### Block 1: `payment_events` table

```sql
CREATE TABLE public.payment_events (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id        uuid NOT NULL REFERENCES orders(id),
  from_status     text NOT NULL,
  to_status       text NOT NULL,
  branch          text NOT NULL CHECK (branch IN ('open', 'transition', 'rejected')),
  triggered_by    text NOT NULL,
  actor_type      text NOT NULL DEFAULT 'system',
  actor_id        text,
  reason          text,
  kbz_trade_no    text,
  provider_ref    text,
  raw_payload     jsonb,
  idempotency_key text,
  created_at      timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX idx_payment_events_order_id ON payment_events(order_id);
CREATE INDEX idx_payment_events_created_at ON payment_events(created_at);
CREATE UNIQUE INDEX idx_payment_events_idempotency
  ON payment_events(idempotency_key) WHERE idempotency_key IS NOT NULL;

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
```

**Verification:**

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'payment_events' ORDER BY ordinal_position;
-- Expected: 14 columns
```

### Block 2: Transition validation helper

```sql
CREATE OR REPLACE FUNCTION public.is_valid_payment_transition(
  p_from text,
  p_to   text
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF p_from IN ('paid', 'abandoned', 'cod') THEN
    RETURN false;
  END IF;

  RETURN CASE
    WHEN p_from = 'pending' AND p_to IN ('paid', 'failed', 'expired') THEN true
    WHEN p_from = 'failed'  AND p_to IN ('paid', 'expired', 'abandoned') THEN true
    WHEN p_from = 'expired' AND p_to = 'paid' THEN true
    ELSE false
  END;
END;
$$;
```

**Verification:**

```sql
SELECT is_valid_payment_transition('pending', 'paid');     -- true
SELECT is_valid_payment_transition('paid', 'expired');     -- false
SELECT is_valid_payment_transition('expired', 'paid');     -- true
SELECT is_valid_payment_transition('failed', 'abandoned'); -- true
SELECT is_valid_payment_transition('draft', 'pending');    -- false (OPEN branch, not transition)
```

### Block 3: The RPC

```sql
CREATE OR REPLACE FUNCTION public.transition_payment_status(
  p_order_id        uuid,
  p_to_status       text,
  p_triggered_by    text,
  p_reason          text DEFAULT NULL,
  p_actor_type      text DEFAULT 'system',
  p_actor_id        text DEFAULT NULL,
  p_kbz_trade_no    text DEFAULT NULL,
  p_provider_ref    text DEFAULT NULL,
  p_raw_payload     jsonb DEFAULT NULL,
  p_idempotency_key text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_payment_status text;
  v_current_order_status   text;
  v_order_source           text;
  v_total_amount           integer;
  v_is_open_branch         boolean;
  v_new_order_status       text;
BEGIN

  -- ================================================================
  -- STEP 1: Lock the order row (serializes concurrent writers)
  -- ================================================================
  SELECT payment_status, status::text, order_source, total_amount
  INTO v_current_payment_status, v_current_order_status, v_order_source, v_total_amount
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'order_not_found',
      'detail', format('Order %s does not exist', p_order_id)
    );
  END IF;

  -- ================================================================
  -- STEP 2: Idempotency — already at target = no-op
  -- ================================================================
  IF v_current_payment_status = p_to_status THEN
    RETURN jsonb_build_object(
      'ok', true,
      'noop', true,
      'detail', format('Already at %s', p_to_status)
    );
  END IF;

  -- ================================================================
  -- STEP 3: Determine branch
  -- ================================================================
  v_is_open_branch := (v_current_payment_status = 'draft' AND p_to_status = 'pending');

  -- ================================================================
  -- BRANCH A: OPEN (draft → pending)
  -- CREATE semantics: promotes order to visible + creates payment row
  -- ================================================================
  IF v_is_open_branch THEN

    -- Contract: order must be in draft state
    IF v_current_order_status NOT IN ('new', 'draft') THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'invalid_order_state_for_open',
        'detail', format('Cannot open payment: orders.status is %s, expected new or draft', v_current_order_status)
      );
    END IF;

    -- Guard: no active payment already exists
    IF EXISTS (
      SELECT 1 FROM payments
      WHERE order_id = p_order_id AND status IN ('pending', 'paid')
    ) THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'payment_already_open',
        'detail', 'A pending or paid payment already exists'
      );
    END IF;

    -- INSERT payments row
    INSERT INTO payments (order_id, amount, method, status, provider_ref, metadata)
    VALUES (
      p_order_id,
      v_total_amount,
      'kbzpay'::payment_method,
      'pending',
      p_provider_ref,
      COALESCE(p_raw_payload, '{}'::jsonb)
    );

    -- UPDATE order: draft → new (visible) + pending (payment opened)
    UPDATE orders
    SET status = 'new'::order_status,
        payment_status = 'pending',
        payment_method = 'kbzpay',
        updated_at = now()
    WHERE id = p_order_id;

    -- Log event
    INSERT INTO payment_events (
      order_id, from_status, to_status, branch, triggered_by,
      actor_type, actor_id, reason, kbz_trade_no, provider_ref,
      raw_payload, idempotency_key
    ) VALUES (
      p_order_id, 'draft', 'pending', 'open', p_triggered_by,
      p_actor_type, p_actor_id, p_reason, p_kbz_trade_no, p_provider_ref,
      p_raw_payload, p_idempotency_key
    );

    RETURN jsonb_build_object(
      'ok', true,
      'noop', false,
      'branch', 'open',
      'from_status', 'draft',
      'to_status', 'pending',
      'order_status', 'new'
    );

  END IF;

  -- ================================================================
  -- BRANCH B: TRANSITION (pending/failed/expired → target)
  -- UPDATE semantics: validates allowlist, updates existing state
  -- ================================================================

  -- Validate against allowlist
  IF NOT is_valid_payment_transition(v_current_payment_status, p_to_status) THEN
    INSERT INTO payment_events (
      order_id, from_status, to_status, branch, triggered_by,
      actor_type, actor_id, reason, kbz_trade_no, provider_ref,
      raw_payload, idempotency_key
    ) VALUES (
      p_order_id, v_current_payment_status, p_to_status, 'rejected', p_triggered_by,
      p_actor_type, p_actor_id,
      format('REJECTED: %s → %s by %s. %s', v_current_payment_status, p_to_status, p_triggered_by, COALESCE(p_reason, '')),
      p_kbz_trade_no, p_provider_ref, p_raw_payload, p_idempotency_key
    );

    RETURN jsonb_build_object(
      'ok', false,
      'error', 'invalid_transition',
      'detail', format('Cannot transition from %s to %s', v_current_payment_status, p_to_status),
      'current_status', v_current_payment_status
    );
  END IF;

  -- Determine orders.status side-effect
  v_new_order_status := CASE
    WHEN p_to_status IN ('failed', 'expired', 'abandoned')
      AND v_current_order_status != 'cancelled'
      THEN 'cancelled'
    WHEN p_to_status = 'paid'
      AND v_current_payment_status IN ('failed', 'expired')
      AND v_current_order_status = 'cancelled'
      THEN 'new'
    ELSE NULL
  END;

  -- UPDATE orders
  UPDATE orders
  SET payment_status = p_to_status,
      updated_at = now(),
      paid_at = CASE WHEN p_to_status = 'paid' THEN COALESCE(paid_at, now()) ELSE paid_at END,
      status = COALESCE(v_new_order_status::order_status, status),
      cancelled_at = CASE
        WHEN v_new_order_status = 'cancelled' THEN COALESCE(cancelled_at, now())
        ELSE cancelled_at
      END,
      cancelled_reason = CASE
        WHEN v_new_order_status = 'cancelled' AND cancelled_reason IS NULL
        THEN format('Payment %s (auto)', p_to_status)
        ELSE cancelled_reason
      END
  WHERE id = p_order_id;

  -- UPDATE payments.status for ALL terminal states
  IF p_to_status = 'paid' THEN
    UPDATE payments
    SET status = 'paid',
        paid_at = COALESCE(paid_at, now()),
        provider_ref = COALESCE(provider_ref, p_provider_ref),
        transaction_id = COALESCE(transaction_id, p_kbz_trade_no)
    WHERE order_id = p_order_id
      AND status != 'paid';

  ELSIF p_to_status = 'failed' THEN
    UPDATE payments
    SET status = 'failed'
    WHERE order_id = p_order_id
      AND status = 'pending';

  ELSIF p_to_status = 'expired' THEN
    UPDATE payments
    SET status = 'expired'
    WHERE order_id = p_order_id
      AND status IN ('pending', 'failed');

  ELSIF p_to_status = 'abandoned' THEN
    -- Update payments row if one exists (some abandoned orders have none)
    UPDATE payments
    SET status = 'abandoned'
    WHERE order_id = p_order_id
      AND status NOT IN ('paid');

  END IF;

  -- Log event
  INSERT INTO payment_events (
    order_id, from_status, to_status, branch, triggered_by,
    actor_type, actor_id, reason, kbz_trade_no, provider_ref,
    raw_payload, idempotency_key
  ) VALUES (
    p_order_id, v_current_payment_status, p_to_status, 'transition', p_triggered_by,
    p_actor_type, p_actor_id, p_reason, p_kbz_trade_no, p_provider_ref,
    p_raw_payload, p_idempotency_key
  );

  RETURN jsonb_build_object(
    'ok', true,
    'noop', false,
    'branch', 'transition',
    'from_status', v_current_payment_status,
    'to_status', p_to_status,
    'order_status_changed', v_new_order_status IS NOT NULL,
    'new_order_status', COALESCE(v_new_order_status, v_current_order_status)
  );

EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object(
    'ok', true,
    'noop', true,
    'detail', 'Duplicate idempotency key — already processed'
  );
END;
$$;
```

**Verification:**

```sql
SELECT proname, pronargs FROM pg_proc WHERE proname = 'transition_payment_status';
-- Expected: transition_payment_status, 10
```

---

## 4. Edge Function Migration

### Corrected per-function changes

| Function | Current behavior (verified) | After migration |
|---|---|---|
| `create-order-intent` v5 | INSERTs `status='draft'`, `payment_status='draft'` | **No change needed** — already writes `draft` |
| `kbzpay-create-payment` v40 | Promotes to `status='new'`, `payment_status='pending'` + INSERTs `payments` row | Calls RPC OPEN branch (handles INSERT `payments` + UPDATE `orders` atomically) |
| `kbzpay-webhook` v34 | UPDATEs `payment_status` to `paid`/`failed` | Calls RPC TRANSITION branch |
| `kbzpay-query-order` v9 | UPDATEs `payment_status` to `paid`/`failed`/`expired` | Calls RPC TRANSITION branch |
| `kbzpay-reconcile-cron` v8 | UPDATEs `payment_status` + `orders.status='cancelled'` | Calls RPC TRANSITION branch (RPC handles `orders.status` side-effect) |

**Key change from v1.1:** `create-order-intent` needs NO changes. It already writes `draft` correctly. Only **4** functions need patching.

### Migration sequence

1. Deploy schema (Blocks 1–3) — non-destructive
2. Deploy `kbzpay-create-payment` — switches to RPC OPEN branch
3. Deploy `kbzpay-webhook` — switches to RPC TRANSITION branch
4. Deploy `kbzpay-query-order` — switches to RPC TRANSITION branch
5. Deploy `kbzpay-reconcile-cron` — switches to RPC TRANSITION branch
6. Verify `payment_events` populating
7. Monitor 48 hours

Step 2 must deploy first (it's the only OPEN caller). Steps 3–5 can deploy in any order.

---

## 5. Cross-App Impact

**Zero cross-app risk.** The RPC is internal plumbing. No schema changes to `orders` or `payments`. CRM and Agent apps continue unchanged.

---

## 6. Testing Plan

### SQL-level (after Block 3, before edge function deploys)

Tests require a real order in `draft` state. Use an existing test order or create one.

```sql
-- Test 1: OPEN — draft → pending (+ orders.status → new)
-- Test 2: TRANSITION — pending → paid
-- Test 3: ILLEGAL — paid → expired (must return error)
-- Test 4: Idempotency — duplicate call = noop
-- Test 5: payments.status updated for expired
-- Test 6: payments.status updated for abandoned (even if no row — graceful no-op)
-- Test 7: orders.status → cancelled when payment dies
-- Test 8: orders.status → new when payment revives (failed → paid)
```

### Real phone (Ken, after edge function deploys)

- Place order → pay → verify events: `draft→pending` (open) + `pending→paid` (transition)
- Place order → cancel at PIN → verify: `pending→failed` + `orders.status=cancelled`
- Place order → wait 15 min → verify: `pending→expired` + `orders.status=cancelled`

---

## 7. Rollback

Each block is independently reversible:

```sql
DROP TABLE IF EXISTS payment_events;
DROP FUNCTION IF EXISTS is_valid_payment_transition(text, text);
DROP FUNCTION IF EXISTS transition_payment_status(uuid, text, text, text, text, text, text, text, jsonb, text);
```

Edge functions: redeploy previous versions.

---

## 8. Success Criteria

- Zero direct UPDATEs to `orders.payment_status` from edge functions
- Every state change logged in `payment_events` with `branch`, `triggered_by`, `reason`
- Illegal transitions blocked and logged as `branch = 'rejected'`
- OPEN and TRANSITION branches have separate contracts, zero shared validation
- `orders.status` → `cancelled` when payment dies; → `new` when payment revives
- `payments.status` explicitly set for ALL terminal states (`paid`, `failed`, `expired`, `abandoned`)
- `updated_at` explicitly set on every order UPDATE (not relying on trigger)
- Idempotent — duplicates produce one event
- CRM and Agent apps unaffected

---

## 9. What This Plan Does NOT Cover

- CRM/Agent cash payment flows
- Refund handling (Phase 2.1)
- `orders.status` lifecycle state machine (separate plan)
- `payment_attempts` table (deferred — events ledger sufficient)
- Backfilling `payment_events` for existing 100 orders (optional Phase 2.1)
- Frontend changes (already done; may need one-line `draft` filter)

---

## Hand-off note (Lovable → Cowork)

Lovable has landed this plan as draft. SQL Blocks 1–3 and the four edge-function migrations are **Cowork's** to execute, in the order specified in §4. Lovable will pick up the optional `useOrders` draft-filter and tracking-banner sanity check **only after** Cowork confirms `payment_events` is populating and the new `kbzpay-create-payment` is live.

End of Grand Plan v1.2. Addresses all 4 Architect findings with SQL evidence. Ready for final Architect approval.