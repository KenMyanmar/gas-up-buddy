// Shared phone normalization for KBZ Pay edge functions.
// Three-field policy: local09 (business), e164 (auth phone), bridgeEmail (auth email).
// Strict: only +959 / 959 / 09 prefixes accepted. Returns null for anything else.
// No boot-time tests, no console output. Test matrix lives in implementation notes.

export interface NormalizedPhone {
  local09: string;       // e.g. "09951123123"
  e164: string;          // e.g. "+959951123123" — Supabase Auth phone field
  e164NoPlus: string;    // e.g. "959951123123" — legacy stored format
  bridgeEmail: string;   // e.g. "09951123123@kbzpay.anygas.local" — Supabase Auth email field
}

export function normalizePhone(raw: string | null | undefined): NormalizedPhone | null {
  if (!raw) return null;
  const cleaned = String(raw).replace(/[\s\-()]/g, "");
  if (!/^\+?\d+$/.test(cleaned)) return null;

  let local09: string | null = null;
  if (cleaned.startsWith("+959")) {
    local09 = "09" + cleaned.slice(4);
  } else if (cleaned.startsWith("959")) {
    local09 = "09" + cleaned.slice(3);
  } else if (cleaned.startsWith("09")) {
    local09 = cleaned;
  } else {
    // No +95 / 95 fallback: prevents garbage like "956504992804" → "06504992804".
    return null;
  }

  if (!local09.startsWith("09")) return null;
  // Myanmar mobile numbers: 09 + 7..10 digits → length 9..12.
  if (local09.length < 9 || local09.length > 12) return null;

  const e164 = "+95" + local09.slice(1);
  const e164NoPlus = e164.slice(1);
  const bridgeEmail = local09 + "@kbzpay.anygas.local";
  return { local09, e164, e164NoPlus, bridgeEmail };
}