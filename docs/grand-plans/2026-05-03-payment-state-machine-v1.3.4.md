# Phase 2.0 Grand Plan: Payment State Machine

**Version:** 1.3.4
**Date:** 2026-05-03
**Author:** Cowork (Claude)
**Reviewers:** Architect (Oldman), Operator (Codex)
**Approver:** CEO (Ken)
**Status:** DRAFT -- awaiting Architect final + CEO sign-off

**Changelog from v1.3.3 (F15 semantics correction):**

| Finding | Severity | Fix |
|---|---|---|
| F15 semantics inversion: v1.3.3 Phase 3 force-expired any `pending` order older than 6h that Phase 2 had NOT verified against KBZ this run. That is the opposite of safe behaviour -- an order Phase 2 could not reach (KBZ down, timeout, network error) is exactly the order we are LEAST sure about, and we must not cancel it. | HIGH | §4 F15 Phase 3 rewritten: only orders Phase 2 successfully verified this run are eligible for force-expire. Orders not verified this run are skipped and counted via `skippedUnchecked` for observability. |

**Prior changelog from v1.3.2 (consensus review -- pseudocode corrections):**

| Finding | Severity | Fix |
|---|---|---|
| F16a: Phase 3 guard had inverted condition (`if (checkedOrderIds.has(order.id)) continue`) -- correct intent is to SKIP rows already handled by Phase 2, but the surrounding rewrite must read clearly as a negative guard. | HIGH | §4 F15 Phase 3 pseudocode rewritten with explicit `if (!checkedOrderIds.has(old.id))` gating block and inline comments. |
| F16b: `checkedOrderIds.add(order.id)` was called unconditionally at the top of the Phase 2 loop, marking orders as "checked" even when the KBZ query failed or threw. That would let Phase 3 skip orders Phase 2 never actually resolved, leaving them stuck in `pending` forever. | HIGH | §4 F15 now has a dedicated Phase 2 pseudocode block. `.add()` is called ONLY inside `if (queryRes.ok)` after a confirmed transition. Network/timeout/non-OK paths must NOT add to the set. |
| F17: Phase 1 and Phase 3 RPC calls used `p_note:` which is not a parameter of `transition_payment_status`. The RPC defines `p_reason`. Calls would fail with `function does not exist` or be silently dropped. | HIGH | §4 F14 and F15 pseudocode now use `p_reason:` matching the Block 3 signature. |
| F18: Phase 1 SELECT lacked `status = 'draft'` filter. `payment_status = 'draft'` is the gate per the writer map, but adding the redundant `orders.status` filter prevents accidents if a future migration changes default values. | LOW | §4 F14 pseudocode now includes `.eq('status', 'draft')` as the first filter. |
| F15 rationale: prior wording emphasised "racing the webhook" which understated the real risk. The dangerous case is force-expiring an order Phase 2 already transitioned to `paid` (the RPC would reject it, but a fresh `payment_events` row noise is undesirable and any future relaxation of the validator could cause a real regression). | LOW | §4 F15 "Why this matters" rewritten to lead with the force-expire-paid scenario. |

**Prior changelog from v1.3.1 (Architect final review -- cron migration guards):**

| Finding | Severity | Fix |
|---|---|---|
| F14: Phase 1 (draft -> abandoned) could sweep non-KBZ drafts | HIGH | §4 Phase 1 now requires explicit `order_source = 'kbzpay_miniapp'` guard. Pseudocode added. Protects R2 (CRM/agent draft orders) from being abandoned by the KBZ cron. |
| F15: Phase 3 (force-expire pending >6h) could double-process same row | MEDIUM | §4 Phase 3 now requires explicit `checkedOrderIds.has(order.id)` guard so any order already touched by Phase 2 (KBZ query reconcile) is skipped. Pseudocode added. Protects R4 (idempotency) and avoids racing the webhook. |

**Prior changelog from v1.3 (Architect final approval + Operator review + Architect F11 finding):**

| Finding | Severity | Fix |
|---|---|---|
| F8: expired to abandoned not in legal transitions | CLARIFICATION | `expired` is terminal except for late `paid` rescue. Cron never attempts expired to abandoned. Transition table annotated. |
| F9: Edge function call ordering unclear | CLARIFICATION | Section 4 now states: KBZ precreate API first, RPC OPEN second. If precreate fails, order stays draft, no DB write. |
| F11: Cron Phase 1 draft to abandoned has no RPC path | MEDIUM | **Option D adopted:** Added `draft -> abandoned` to legal transitions in Block 2. Cron Phase 1 now calls RPC TRANSITION branch. Event logged, orders.status side-effect handled by RPC. |
| F12: provider_ref should be merchOrderId not prepay_id | HIGH | **Fixed:** §4 step 4 now passes `merchOrderId` as `p_provider_ref`. prepay_id goes in `p_raw_payload`. Webhook/query-order resolve payments by `provider_ref = merchOrderId`. |
| F13: Frontend needs full cashier payload not just prepay_id | MEDIUM | **Fixed:** §4 step 5 now specifies all 4 fields: `prepay_id`, `orderinfo`, `sign`, `signType`. |
| Block 0 rollback unsafe | LOW | Rollback section rewritten: Block 0 rollback is impractical and unnecessary. |
| Test 5 reset missing paid_at = NULL | LOW | `paid_at = NULL` added to Test 5 reset SQL. |

**Prior changelog (v1.2 to v1.3):**

| Finding | Severity | Fix |
|---|---|---|
| F1: payments.status enum drift | HIGH | Option A adopted: payments.status in {pending, paid, failed} only. |
| F2: succeeded to paid migration missing | HIGH | Block 0 added. |
| F5: EXCEPTION catches all unique_violations | LOW | Exception handler checks constraint name. |
| F7: Tests 1-8 are placeholder comments | MEDIUM | Full runnable SQL with expected outputs. |

**Deferred (per Architect approval):**
- F3: `kbz_pay`/`kbzpay` enum dedup -- Phase 2.1
- F4: `is_valid_payment_transition` naming -- minor, no change
- F6: 1:1 order:tx assumption -- noted for multi-provider future

---

## 1. Problem Statement

*(Unchanged from v1.2 -- see that version for full writer map, current data, and diagnosis.)*

Five edge functions independently write `orders.payment_status` with no coordinator. One gatekeeper RPC with row locking, transition validation, and an immutable event log fixes this.

### Design decision: payments.status scope (F1 resolution)

**`payments.status` remains in {pending, paid, failed}.** Three values only. No new values introduced.

| orders.payment_status | payments.status | Why |
|---|---|---|
| draft | (no row yet) | Payment not attempted |
| pending | pending | Payment attempt open |
| paid | paid | Money moved |
| failed | failed | Payment attempt failed |
| expired | failed | KBZ expired the prepay -- payment failed |
| abandoned | failed | Cron aged out -- payment failed |

**Rationale:** The `payments` table answers one question: "did money move?" The answer is `paid`, `failed`, or `pending`. *Why* it failed (timeout, expiry, abandonment) is captured in `orders.payment_status` and the `payment_events` ledger. Adding `expired`/`abandoned` to `payments.status` would create a second source of truth for failure reasons with no reader.

---

## 2. Solution: Two-Branch RPC

*(State machine diagram, legal transitions table, orders.status scope statement -- unchanged from v1.2.)*

### State Machine

```
     +------------+
     |   draft    |  (create-order-intent inserts this)
     +-----+------+
           |
     +-----+------+
     |             |
     v             v
  OPEN branch   TRANSITION branch
  (-> pending)  (-> abandoned, cron Phase 1, >30min stale)
     |             |
     v             v
  +----------+   +---------+
  | pending  |   |abandoned|
  +----+-----+   |TERMINAL |
       |         +---------+
       | TRANSITION branch
   +---+---+----+
   v       v    v
 +----+ +----+ +-------+
 |paid| |fail| |expired|
 |TERM| +-+--+ +---+---+
 +----+   |        |
       +--+----+   |
       v      v    v
    (paid) <- late webhook
    (paid)(exp)(abandoned)
       |
       +---------+
       |abandoned|
       |TERMINAL |
       +---------+
```

**Note on terminal states (F8 clarification):** `paid`, `abandoned`, and `cod` are fully terminal -- no outbound transitions. `expired` is *effectively terminal* with one exception: a late KBZ webhook can rescue expired to paid. The cron job never attempts expired to abandoned because by design, only `failed` orders age into `abandoned` (the cron WHERE clause filters on `payment_status = 'failed'`). This means `is_valid_payment_transition` does not need an expired to abandoned edge, and this is correct by design, not an omission.

### Complete transition table

| From | To | Branch | Trigger | orders.status | payments.status |
|---|---|---|---|---|---|
| `draft` | `pending` | OPEN | create-payment | -> `new` | INSERT `pending` |
| `draft` | `abandoned` | TRANSITION | cron Phase 1 (>30min stale) | -> `cancelled` | no-op (no payments row) |
| `pending` | `paid` | TRANSITION | webhook, query-order | no change | -> `paid` |
| `pending` | `failed` | TRANSITION | webhook, query-order | -> `cancelled` | -> `failed` |
| `pending` | `expired` | TRANSITION | query-order, cron | -> `cancelled` | -> `failed` |
| `failed` | `paid` | TRANSITION | webhook (late) | -> `new` (un-cancel) | -> `paid` |
| `failed` | `expired` | TRANSITION | cron | no change | no change (already `failed`) |
| `failed` | `abandoned` | TRANSITION | cron (>24h) | no change | no change (already `failed`) |
| `expired` | `paid` | TRANSITION | webhook (very late) | -> `new` (un-cancel) | -> `paid` |

*No expired to abandoned row exists because cron only abandons from `failed` -- see F8 note above.*
*draft to abandoned (F11) is for stale drafts that never got a KBZ payment session. No payments row exists, so the payments UPDATE inside TRANSITION is a 0-row no-op.*

### orders.status scope statement

- Payment dies -> `cancelled` (with `cancelled_at`, `cancelled_reason`)
- Payment revives -> `new` (un-cancel)
- OPEN branch -> `new` (visible to CRM/agents)
- Normal paid from pending -> no change

---

## 3. Schema: SQL Blocks

### Block 0: Normalize legacy payments.status (F2 fix)

```sql
-- Block 0: Normalize 'succeeded' -> 'paid' (4,780 rows)
UPDATE payments SET status = 'paid' WHERE status = 'succeeded';
```

Verification:

```sql
SELECT status, count(*) FROM payments GROUP BY status ORDER BY count(*) DESC;
-- EXPECTED: paid ~4841, failed 30, pending 1
-- MUST NOT contain 'succeeded'
```

### Block 1: payment_events table

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

Verification:

```sql
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'payment_events' ORDER BY ordinal_position;
-- EXPECTED: 14 columns (id, order_id, from_status, to_status, branch,
--   triggered_by, actor_type, actor_id, reason, kbz_trade_no,
--   provider_ref, raw_payload, idempotency_key, created_at)
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
    WHEN p_from = 'draft'   AND p_to = 'abandoned' THEN true   -- F11: cron Phase 1 stale draft kill
    WHEN p_from = 'pending' AND p_to IN ('paid', 'failed', 'expired') THEN true
    WHEN p_from = 'failed'  AND p_to IN ('paid', 'expired', 'abandoned') THEN true
    WHEN p_from = 'expired' AND p_to = 'paid' THEN true
    ELSE false
  END;
END;
$$;
```

Verification:

```sql
SELECT is_valid_payment_transition('pending', 'paid');      -- EXPECTED: true
SELECT is_valid_payment_transition('paid', 'expired');      -- EXPECTED: false
SELECT is_valid_payment_transition('expired', 'paid');      -- EXPECTED: true
SELECT is_valid_payment_transition('failed', 'abandoned');  -- EXPECTED: true
SELECT is_valid_payment_transition('draft', 'pending');     -- EXPECTED: false (OPEN branch handles this)
SELECT is_valid_payment_transition('draft', 'abandoned');   -- EXPECTED: true (F11: cron Phase 1 stale draft kill)
SELECT is_valid_payment_transition('expired', 'abandoned'); -- EXPECTED: false (F8: cron never does this)
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
  -- STEP 2: Idempotency -- already at target = no-op
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
  -- BRANCH A: OPEN (draft -> pending)
  -- CREATE semantics: promotes order to visible + creates payment row
  -- ================================================================
  IF v_is_open_branch THEN

    IF v_current_order_status NOT IN ('new', 'draft') THEN
      RETURN jsonb_build_object(
        'ok', false,
        'error', 'invalid_order_state_for_open',
        'detail', format('Cannot open payment: orders.status is %s, expected new or draft', v_current_order_status)
      );
    END IF;

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

    -- INSERT payments row (status = 'pending')
    INSERT INTO payments (order_id, amount, method, status, provider_ref, metadata)
    VALUES (
      p_order_id,
      v_total_amount,
      'kbzpay'::payment_method,
      'pending',
      p_provider_ref,
      COALESCE(p_raw_payload, '{}'::jsonb)
    );

    -- UPDATE order: draft->new (visible) + draft->pending (payment opened)
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
  -- BRANCH B: TRANSITION (draft/pending/failed/expired -> target)
  -- UPDATE semantics: validates allowlist, updates existing state
  -- Note: draft -> abandoned (F11) has no payments row, so payments
  -- UPDATE is a 0-row no-op. orders.status side-effect handles cancel.
  -- ================================================================

  IF NOT is_valid_payment_transition(v_current_payment_status, p_to_status) THEN
    INSERT INTO payment_events (
      order_id, from_status, to_status, branch, triggered_by,
      actor_type, actor_id, reason, kbz_trade_no, provider_ref,
      raw_payload, idempotency_key
    ) VALUES (
      p_order_id, v_current_payment_status, p_to_status, 'rejected', p_triggered_by,
      p_actor_type, p_actor_id,
      format('REJECTED: %s -> %s by %s. %s', v_current_payment_status, p_to_status, p_triggered_by, COALESCE(p_reason, '')),
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

  -- UPDATE payments.status (F1 resolution: map to {pending, paid, failed} only)
  IF p_to_status = 'paid' THEN
    -- Payment succeeded
    UPDATE payments
    SET status = 'paid',
        paid_at = COALESCE(paid_at, now()),
        provider_ref = COALESCE(provider_ref, p_provider_ref),
        transaction_id = COALESCE(transaction_id, p_kbz_trade_no)
    WHERE order_id = p_order_id
      AND status != 'paid';

  ELSIF p_to_status IN ('failed', 'expired', 'abandoned') THEN
    -- Payment died (any reason) -> payments.status = 'failed'
    -- WHY it died is in orders.payment_status and payment_events
    UPDATE payments
    SET status = 'failed'
    WHERE order_id = p_order_id
      AND status NOT IN ('paid', 'failed');

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
  -- F5 fix: only catch idempotency key violations, re-raise others
  IF SQLERRM LIKE '%idx_payment_events_idempotency%' THEN
    RETURN jsonb_build_object(
      'ok', true,
      'noop', true,
      'detail', 'Duplicate idempotency key -- already processed'
    );
  ELSE
    RAISE;
  END IF;
END;
$$;
```

Verification:

```sql
SELECT proname, pronargs FROM pg_proc WHERE proname = 'transition_payment_status';
-- EXPECTED: transition_payment_status, 10
```

---

## 4. Edge Function Migration

*(create-order-intent needs no change -- it writes draft and that is correct.)*

Four edge functions will be patched to call the RPC instead of direct UPDATEs:

- **kbzpay-create-payment** -- calls OPEN branch (draft -> pending)
- **kbzpay-webhook** -- calls TRANSITION branch (pending -> paid/failed)
- **kbzpay-query-order** -- calls TRANSITION branch (pending -> paid/failed/expired)
- **kbzpay-reconcile-cron** -- calls TRANSITION branch for three paths:
  - Phase 1: draft -> abandoned (stale drafts >30min, F11)
  - Phase 2/3: pending -> expired (KBZ expired or force-expire >6h)
  - Phase 2: failed -> abandoned (stale failed >24h)

### F14: Phase 1 must guard on `order_source = 'kbzpay_miniapp'` (R2 protection)

The Phase 1 sweep (`draft -> abandoned` for stale drafts >30min) MUST NOT touch draft orders created by the CRM, agent app, or any non-KBZ flow. Those orders use the `draft` payment_status legitimately and have their own lifecycle. Without an explicit guard, the KBZ cron would silently abandon them.

**Required SELECT guard:**

```ts
// kbzpay-reconcile-cron, Phase 1
const { data: staleDrafts } = await supabase
  .from('orders')
  .select('id, order_source, payment_status, created_at')
  .eq('status', 'draft')                          // F18: belt-and-suspenders, orders.status guard
  .eq('payment_status', 'draft')
  .eq('order_source', 'kbzpay_miniapp')          // F14: hard guard, KBZ-only
  .lt('created_at', new Date(Date.now() - 30 * 60_000).toISOString());

for (const order of staleDrafts ?? []) {
  // Defensive belt-and-suspenders re-check before RPC
  if (order.order_source !== 'kbzpay_miniapp') continue;   // F14
  await supabase.rpc('transition_payment_status', {
    p_order_id: order.id,
    p_to_status: 'abandoned',
    p_triggered_by: 'kbzpay-reconcile-cron:phase1',
    p_reason: 'Phase 1: stale KBZ draft >30min, never received precreate',  // F17: RPC param is p_reason
  });
}
```

**Why this matters:** R2 in the writer map covers CRM/agent-created orders. Those orders may sit in `draft` for hours while a dispatcher prepares them. If Phase 1 swept them, they would flip to `cancelled` (the RPC side-effect for `abandoned`) and confuse both the CRM UI and the agent app. The `order_source` filter is the single line that keeps the two worlds apart.

### F15: Phase 3 must only force-expire orders Phase 2 verified this run (v1.3.4 semantics correction)

Two invariants govern this guard:

1. **Phase 2 marks the set only after a confirmed KBZ result.** A network error, timeout, non-OK HTTP response, or thrown exception MUST NOT add the order id to `checkedOrderIds` (F16b, unchanged from v1.3.3). If we marked optimistically, Phase 3 could force-expire orders Phase 2 never actually resolved.
2. **Phase 3 force-expires ONLY orders Phase 2 successfully verified this run.** The condition is `if (!checkedOrderIds.has(old.id))` -- if the order is NOT in the set, skip it, count it via `skippedUnchecked`, and let the next cron tick try again. Only orders present in the set (i.e. Phase 2 got a confirmed KBZ response this run) are eligible for force-expire.

**Why this matters:** A pending order older than 6h whose KBZ status we could not verify this run might still be `paid` upstream. Flipping it to `expired/cancelled` based on age alone would risk losing a real customer payment if the validator is ever relaxed or if KBZ catches up between cron ticks. Requiring a successful KBZ verification this run before force-expire makes the operation safe-by-construction. The `skippedUnchecked` counter surfaces persistent KBZ outages in cron logs so operators can react before the backlog grows.

**Required Phase 2 pseudocode (F16b: set populated only on success):**

```ts
// kbzpay-reconcile-cron, Phase 2
const checkedOrderIds = new Set<string>();

for (const order of pendingOrders ?? []) {
  let queryRes;
  try {
    queryRes = await runQueryOrderAndTransition(order);   // returns { ok, transitionedTo, ... }
  } catch (err) {
    // F16b: network/timeout/throw -- DO NOT add to checkedOrderIds.
    // Phase 3 (or the next cron tick) must be free to retry this order.
    console.error('phase2: query failed for', order.id, err);
    continue;
  }

  if (queryRes.ok) {
    checkedOrderIds.add(order.id);                        // F16b: mark only on confirmed result
  }
  // else: non-OK KBZ response -- DO NOT add. Same retry rationale.
}
```

**Required Phase 3 pseudocode (v1.3.4: skip-unchecked, only force-expire verified):**

```ts
// kbzpay-reconcile-cron, Phase 3
const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60_000).toISOString();
let skippedUnchecked = 0;
const { data: oldPending } = await supabase
  .from('orders')
  .select('id, payment_status, created_at')
  .eq('payment_status', 'pending')
  .lt('created_at', sixHoursAgo);

for (const old of oldPending ?? []) {
  if (!checkedOrderIds.has(old.id)) {
    skippedUnchecked++;
    results.push({ order_id: old.id, action: 'skipped_unchecked' });
    continue;
  }
  await supabase.rpc('transition_payment_status', {
    p_order_id: old.id,
    p_to_status: 'expired',
    p_triggered_by: 'kbzpay-reconcile-cron:phase3',
    p_reason: 'Phase 3: force-expire pending >6h after successful KBZ verification this run',
  });
  results.push({ order_id: old.id, action: 'expired' });
}
if (skippedUnchecked > 0) {
  console.warn(`[Phase 3] Skipped ${skippedUnchecked} orders not verified against KBZ this run`);
}
```

### F9 clarification: call ordering in kbzpay-create-payment

The OPEN branch call MUST happen AFTER the KBZ precreate API succeeds:

1. Edge function receives order_id from frontend
2. Edge function calls KBZ precreate API via VPS proxy -> gets `prepay_id`, `merchOrderId`, `orderinfo`, `sign`, `signType`
3. If precreate fails: return error to frontend. Order stays draft. No RPC call. No DB write.
4. If precreate succeeds: call `transition_payment_status(order_id, 'pending', 'kbzpay-create-payment', ...)` with **`merchOrderId` as `p_provider_ref`** (NOT `prepay_id` -- webhook and query-order look up payments by `provider_ref = merchOrderId`). Pass full precreate response in `p_raw_payload` (which stores `prepay_id` for audit).
5. Return the full cashier payload to frontend: `{ prepay_id, orderinfo, sign, signType }` -- all four fields are required by the frontend's tradePay bridge call (see `kbzpay-bridge.ts` and `OrderConfirm.tsx`).

**Why this ordering matters:** If the RPC ran first (draft -> pending) but precreate failed, the order would be stuck in pending with no KBZ payment session. The customer would see a spinner and no payment screen. The cron would eventually expire it, but that is 15+ minutes of bad UX. By calling KBZ first, we guarantee that every pending order has a real KBZ payment session behind it.

**Why merchOrderId in provider_ref (not prepay_id):** The existing webhook (`kbzpay-webhook`) and query-order (`kbzpay-query-order`) both resolve the payment row via `payments.provider_ref = merchOrderId`. If we stored `prepay_id` there instead, neither reconciliation path would find the payment. `prepay_id` lives in `p_raw_payload` for audit purposes only.

---

## 5. Testing Plan -- Full Runnable SQL (F7 fix)

### Setup: Create a test order in draft state

```sql
-- Create test order for SQL-level tests
INSERT INTO orders (
  id, customer_phone, township, address, quantity, status,
  payment_status, payment_method, order_source, total_amount
) VALUES (
  '00000000-0000-0000-0000-000000000099',
  '09000000099', 'Test Township', 'Test Address', 1,
  'draft'::order_status, 'draft', 'kbzpay', 'kbzpay_miniapp', 23000
);
```

### Test 1: OPEN -- draft -> pending (+ orders.status -> new)

```sql
SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'pending',
  'test-open',
  'Test 1: OPEN branch'
);
-- EXPECTED: {"ok": true, "noop": false, "branch": "open", "from_status": "draft", "to_status": "pending", "order_status": "new"}
```

Verify side-effects:

```sql
SELECT status::text, payment_status, payment_method FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: new, pending, kbzpay

SELECT status, amount, method::text FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: pending, 23000, kbzpay

SELECT branch, from_status, to_status, triggered_by FROM payment_events WHERE order_id = '00000000-0000-0000-0000-000000000099' ORDER BY created_at;
-- EXPECTED: 1 row: open, draft, pending, test-open
```

### Test 2: TRANSITION -- pending -> paid

```sql
SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'paid',
  'test-transition',
  'Test 2: normal payment success',
  'system', NULL, 'TRADE_TEST_001', 'MERCH_TEST_001'
);
-- EXPECTED: {"ok": true, "noop": false, "branch": "transition", "from_status": "pending", "to_status": "paid", "order_status_changed": false, "new_order_status": "new"}
```

Verify:

```sql
SELECT status::text, payment_status, paid_at IS NOT NULL as has_paid_at FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: new, paid, true

SELECT status, transaction_id FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: paid, TRADE_TEST_001
```

### Test 3: ILLEGAL -- paid -> expired (terminal state)

```sql
SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'expired',
  'test-illegal',
  'Test 3: should be rejected'
);
-- EXPECTED: {"ok": false, "error": "invalid_transition", "detail": "Cannot transition from paid to expired", "current_status": "paid"}
```

Verify rejected event logged:

```sql
SELECT branch, from_status, to_status, reason FROM payment_events
WHERE order_id = '00000000-0000-0000-0000-000000000099' AND branch = 'rejected';
-- EXPECTED: 1 row: rejected, paid, expired, 'REJECTED: paid -> expired by test-illegal. Test 3: should be rejected'
```

### Test 4: Idempotency -- already at target = noop

```sql
SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'paid',
  'test-idempotent',
  'Test 4: already paid'
);
-- EXPECTED: {"ok": true, "noop": true, "detail": "Already at paid"}
```

Verify no new event:

```sql
SELECT count(*) FROM payment_events WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: 3 (from tests 1, 2, 3 -- test 4 produces no event)
```

### Test 5: Reset test order, then test expired -> payments.status = 'failed'

```sql
-- Reset: force order back to pending for further tests
UPDATE orders SET payment_status = 'pending', status = 'new'::order_status, paid_at = NULL, cancelled_at = NULL, cancelled_reason = NULL WHERE id = '00000000-0000-0000-0000-000000000099';
UPDATE payments SET status = 'pending', paid_at = NULL, transaction_id = NULL WHERE order_id = '00000000-0000-0000-0000-000000000099';

SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'expired',
  'test-expired',
  'Test 5: payment expired by cron'
);
-- EXPECTED: {"ok": true, "noop": false, "branch": "transition", "from_status": "pending", "to_status": "expired", "order_status_changed": true, "new_order_status": "cancelled"}
```

Verify payments.status maps to failed (F1 resolution):

```sql
SELECT status::text, payment_status, cancelled_reason FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: cancelled, expired, 'Payment expired (auto)'

SELECT status FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: failed (NOT 'expired' -- per F1 Option A)
```

### Test 6: abandoned -> payments.status stays 'failed'

```sql
-- Order is now expired. Transition to abandoned.
UPDATE orders SET payment_status = 'failed', status = 'cancelled'::order_status WHERE id = '00000000-0000-0000-0000-000000000099';

SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'abandoned',
  'test-abandoned',
  'Test 6: cron abandons after 24h'
);
-- EXPECTED: {"ok": true, "noop": false, "branch": "transition", "from_status": "failed", "to_status": "abandoned", "order_status_changed": false, "new_order_status": "cancelled"}
```

Verify:

```sql
SELECT status::text, payment_status FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: cancelled, abandoned

SELECT status FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: failed (stays failed -- per F1 Option A, no new value introduced)
```

### Test 7: orders.status -> cancelled when payment dies

(Already verified in Test 5 -- pending->expired sets orders.status=cancelled)

### Test 8: Payment revives -- failed -> paid (un-cancel)

```sql
-- Reset to failed + cancelled
UPDATE orders SET payment_status = 'failed', status = 'cancelled'::order_status WHERE id = '00000000-0000-0000-0000-000000000099';
UPDATE payments SET status = 'failed' WHERE order_id = '00000000-0000-0000-0000-000000000099';

SELECT transition_payment_status(
  '00000000-0000-0000-0000-000000000099'::uuid,
  'paid',
  'test-revive',
  'Test 8: late KBZ webhook success',
  'system', NULL, 'TRADE_LATE_001'
);
-- EXPECTED: {"ok": true, "noop": false, "branch": "transition", "from_status": "failed", "to_status": "paid", "order_status_changed": true, "new_order_status": "new"}
```

Verify un-cancel:

```sql
SELECT status::text, payment_status, paid_at IS NOT NULL as has_paid_at FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: new, paid, true (un-cancelled, back in agent queue)

SELECT status, transaction_id FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
-- EXPECTED: paid, TRADE_LATE_001
```

### Cleanup: Remove test order

```sql
DELETE FROM payment_events WHERE order_id = '00000000-0000-0000-0000-000000000099';
DELETE FROM payments WHERE order_id = '00000000-0000-0000-0000-000000000099';
DELETE FROM orders WHERE id = '00000000-0000-0000-0000-000000000099';
```

---

## 6. Rollback

Blocks 3, 2, 1 are cleanly reversible:

```sql
-- Block 3: DROP FUNCTION IF EXISTS transition_payment_status(uuid, text, text, text, text, text, text, text, jsonb, text);
-- Block 2: DROP FUNCTION IF EXISTS is_valid_payment_transition(text, text);
-- Block 1: DROP TABLE IF EXISTS payment_events;
```

Block 0 (succeeded -> paid normalization) is **NOT reversible**. After Block 0 runs, there is no way to distinguish rows that were originally paid from rows that were normalized from succeeded. However, rollback is also unnecessary: the succeeded value was a legacy inconsistency, and paid is the correct canonical value regardless of whether this plan proceeds. All existing code already reads paid; no code path reads succeeded. Leaving Block 0 applied even if Blocks 1-3 are rolled back is safe and correct.

Edge functions: Redeploy previous versions from Git history.

---

## 7. Success Criteria

- Zero direct UPDATEs to orders.payment_status from edge functions
- Every state change logged in payment_events with branch, triggered_by, reason
- Illegal transitions blocked and logged as branch = 'rejected'
- OPEN and TRANSITION branches have separate contracts, zero shared validation
- orders.status -> cancelled when payment dies; -> new when payment revives
- payments.status in {pending, paid, failed} only -- no new values introduced (F1)
- No succeeded values remain in payments.status (F2)
- updated_at explicitly set on every order UPDATE
- Idempotent -- duplicates produce one event
- Exception handler only catches idempotency violations (F5)
- CRM and Agent apps unaffected

---

## 8. What This Plan Does NOT Cover

- CRM/Agent cash payment flows
- Refund handling (Phase 2.1)
- orders.status lifecycle state machine (separate plan)
- payment_attempts table (deferred)
- Backfilling payment_events for existing 100 orders (optional Phase 2.1)
- Frontend changes (may need one-line draft filter)
- kbz_pay/kbzpay enum dedup (Phase 2.1, F3)

---

## Hand-off note (Lovable -> Cowork)

Lovable lands this plan as draft. SQL Blocks 0-3 and the four edge-function migrations are Cowork's to execute. Lovable picks up the optional useOrders draft-filter only after Cowork confirms payment_events is populating.

End of Grand Plan v1.3.4. 20 total findings: 17 addressed in plan, 3 deferred to Phase 2.1. Awaiting Architect+Operator final line-level review and CEO sign-off.
