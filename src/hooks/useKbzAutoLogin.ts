import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isInKbzPay, getAuthCode } from "@/lib/kbzpay-bridge";

export type KbzAutoLoginStatus =
  | "idle"
  | "authenticating"
  | "linked"
  | "linked_select"
  | "link_pending"
  | "new_account"
  | "error"
  | "not-in-kbz";

export interface KbzCandidate {
  customer_id: string;
  name: string;
  address_masked: string;
  last_order_date: string | null;
  total_orders: number;
  member_since: string | null;
  has_auth_account: boolean;
}

interface KbzAutoLoginResult {
  status: KbzAutoLoginStatus;
  candidates: KbzCandidate[];
  temporaryToken: string | null;
  customerId: string | null;
  error: string | null;
  selectCandidate: (customerId: string | null) => Promise<void>;
  selecting: boolean;
}

export function useKbzAutoLogin(): KbzAutoLoginResult {
  const [status, setStatus] = useState<KbzAutoLoginStatus>("idle");
  const [candidates, setCandidates] = useState<KbzCandidate[]>([]);
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!isInKbzPay()) {
      setStatus("not-in-kbz");
      return;
    }

    (async () => {
      setStatus("authenticating");
      try {
        const authCode = await getAuthCode();

        const { data, error: fnErr } = await supabase.functions.invoke("kbzpay-auto-login", {
          body: { authCode },
        });

        if (fnErr) throw fnErr;
        const res = data as any;

        if (res.access_token && res.refresh_token) {
          await supabase.auth.setSession({
            access_token: res.access_token,
            refresh_token: res.refresh_token,
          });
        }

        if (res.temporary_token) setTemporaryToken(res.temporary_token);
        if (res.candidates) setCandidates(res.candidates);
        if (res.customer_id) setCustomerId(res.customer_id);

        setStatus(res.status || "error");
      } catch (err: any) {
        console.error("KBZ auto-login error:", err);
        setError(err?.message || "Auto-login failed");
        setStatus("error");
      }
    })();
  }, []);

  const selectCandidate = async (selectedCustomerId: string | null) => {
    if (!temporaryToken) return;
    setSelecting(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("kbzpay-link-customer", {
        body: {
          temporary_token: temporaryToken,
          selected_customer_id: selectedCustomerId,
        },
      });

      if (fnErr) throw fnErr;
      const res = data as any;

      if (res.access_token && res.refresh_token) {
        await supabase.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        });
      }

      setCustomerId(res.customer_id || null);

      if (res.status === "new_account" || res.is_new_link) {
        setStatus("new_account");
      } else {
        setStatus("linked");
      }
    } catch (err: any) {
      console.error("KBZ link error:", err);
      setError(err?.message || "Linking failed");
      setStatus("error");
    } finally {
      setSelecting(false);
    }
  };

  return { status, candidates, temporaryToken, customerId, error, selectCandidate, selecting };
}
