import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isKbzPayRuntime, getAuthCode, openSettings } from "@/lib/kbzpay-bridge";

export type KbzAutoLoginStatus =
  | "idle"
  | "authenticating"
  | "linked"
  | "linked_select"
  | "link_pending"
  | "new_account"
  | "retry_needed"
  | "authorization_rejected"
  | "error";

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
  retry: () => void;
  handleOpenSettings: () => Promise<void>;
}

export function useKbzAutoLogin(): KbzAutoLoginResult {
  const [status, setStatus] = useState<KbzAutoLoginStatus>("idle");
  const [candidates, setCandidates] = useState<KbzCandidate[]>([]);
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);
  const running = useRef(false);
  const mounted = useRef(true);
  const acRef = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      acRef.current?.abort();
    };
  }, []);

  const safeSet = useCallback(<T,>(setter: (v: T) => void, v: T) => {
    if (mounted.current) setter(v);
  }, []);

  const runAutoLogin = useCallback(async () => {
    if (running.current) return;
    running.current = true;
    acRef.current?.abort();
    acRef.current = new AbortController();
    safeSet(setStatus, "authenticating" as KbzAutoLoginStatus);
    safeSet(setError, null as string | null);
    const ma = (typeof window !== "undefined" ? (window as any).ma : undefined);
    console.log("[KBZ-DIAG] window.ma type:", typeof ma);
    console.log("[KBZ-DIAG] ma.getAuthCode type:", typeof ma?.getAuthCode);
    console.log("[KBZ-DIAG] isKbzPayRuntime result:", isKbzPayRuntime());
    try {
      console.log("[KBZ-DIAG] Calling getAuthCode...");
      // Bridge owns the timeout (60s, matches startPay). No outer race.
      const authCode = await getAuthCode().catch((e) => {
        throw Object.assign(new Error(e?.message || "getAuthCode failed"), {
          __bridgeFailure: true,
          __raw: e,
        });
      });

      console.log("[KBZ-DIAG] authCode received, length:", authCode?.length ?? 0);
      console.log("[KBZ-DIAG] Invoking kbzpay-auto-login edge function");
      const { data, error: fnErr } = await supabase.functions.invoke("kbzpay-auto-login", {
        body: { authCode },
      });

      console.log("[KBZ-DIAG] Edge function response status:", (data as any)?.status, "fnErr:", fnErr?.message);
      if (fnErr) throw fnErr;
      const res = data as any;

      if (res.access_token && res.refresh_token) {
        console.log("[KBZ-DIAG] Setting Supabase session");
        await supabase.auth.setSession({
          access_token: res.access_token,
          refresh_token: res.refresh_token,
        });
      }

      if (!mounted.current) {
        console.log("[KBZ-DIAG] Unmounted before applying response — skipping state updates");
        return;
      }
      if (res.temporary_token) setTemporaryToken(res.temporary_token);
      if (res.candidates) setCandidates(res.candidates);
      if (res.customer_id) setCustomerId(res.customer_id);

      const finalStatus = res.status || "error";
      console.log("[KBZ-DIAG] Final status:", finalStatus);
      setStatus(finalStatus);
    } catch (err: any) {
      if (!mounted.current) return;
      // Detect user rejection of consent popup
      const raw = err?.__raw ?? err;
      const msg = (raw?.errorMessage || raw?.message || err?.message || "").toString().toLowerCase();
      const isRejection =
        msg.includes("reject") ||
        msg.includes("deny") ||
        msg.includes("denied") ||
        msg.includes("cancel") ||
        raw?.error === 11 ||
        raw?.error === "USER_DENIED" ||
        raw?.resultCode === 2;
      if (isRejection) {
        console.warn("[KBZ-DIAG] User rejected authorization:", JSON.stringify(raw));
        setStatus("authorization_rejected");
      } else if (err?.__bridgeFailure || !isKbzPayRuntime()) {
        console.log("[KBZ-DIAG] Bridge failure → retry_needed:", err?.message);
        // Diagnostic-only fallback: try getOpenUserInfo to learn more about the bridge
        try {
          const maNow = (window as any).ma;
          if (maNow && typeof maNow.getOpenUserInfo === "function") {
            console.log("[KBZ-DIAG] Attempting getOpenUserInfo fallback (diagnostic only)");
            maNow.getOpenUserInfo({
              scopes: "auth_base",
              success: (r: any) => console.log("[KBZ-DIAG] getOpenUserInfo SUCCESS:", JSON.stringify(r)),
              fail: (r: any) => console.log("[KBZ-DIAG] getOpenUserInfo FAIL:", JSON.stringify(r)),
            });
          } else {
            console.log("[KBZ-DIAG] getOpenUserInfo not available on bridge");
          }
        } catch (diagErr: any) {
          console.log("[KBZ-DIAG] getOpenUserInfo threw:", diagErr?.message);
        }
        setStatus("retry_needed");
      } else {
        console.log("[KBZ-DIAG] Backend error → error:", err?.message);
        setError(err?.message || "Auto-login failed");
        setStatus("error");
      }
    } finally {
      running.current = false;
    }
  }, []);

  const ranOnce = useRef(false);
  useEffect(() => {
    if (ranOnce.current) return;
    ranOnce.current = true;
    console.log("[KBZ-DIAG] useKbzAutoLogin mounted");
    runAutoLogin();
  }, [runAutoLogin]);

  const retry = useCallback(() => {
    runAutoLogin();
  }, [runAutoLogin]);

  const handleOpenSettings = useCallback(async () => {
    try {
      await openSettings();
    } catch (e: any) {
      console.warn("[KBZ-DIAG] openSettings error:", e?.message);
    }
    runAutoLogin();
  }, [runAutoLogin]);

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

  return { status, candidates, temporaryToken, customerId, error, selectCandidate, selecting, retry, handleOpenSettings };
}
