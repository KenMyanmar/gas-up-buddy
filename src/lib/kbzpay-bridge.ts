import type { SupabaseClient } from "@supabase/supabase-js";

// ── Landmark keywords for address masking ────────────────────────
export const LANDMARK_KEYWORDS = [
  "City", "Tower", "Condo", "Residence", "Plaza", "Park",
  "Garden", "Square", "Heights", "View", "Complex", "Estate",
  "Junction", "Mall",
] as const;

// ── Platform detection ───────────────────────────────────────────
export function isInKbzPay(): boolean {
  if (typeof window === "undefined") return false;
  // URL param (sticky via localStorage)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("miniapp") === "1") {
    try { localStorage.setItem("anygas_miniapp", "1"); } catch {}
    return true;
  }
  try {
    if (localStorage.getItem("anygas_miniapp") === "1") return true;
  } catch {}
  // KBZ JSSDK markers
  if ((window as any).__majs_environment) return true;
  if ((window as any).ma) return true;
  return false;
}

// Strict runtime check: bridge is actually usable (has getAuthCode function)
export function isKbzPayRuntime(): boolean {
  if (typeof window === "undefined") return false;
  const ma = (window as any).ma;
  if (!ma || typeof ma !== "object") return false;
  return typeof ma.getAuthCode === "function";
}

// ── JSSDK: getAuthCode ───────────────────────────────────────────
export function getAuthCode(): Promise<string> {
  return new Promise((resolve, reject) => {
    const ma = (window as any).ma;
    console.log("[KBZ-DIAG] getAuthCode() invoked, ma type:", typeof ma, "getAuthCode type:", typeof ma?.getAuthCode);
    if (!ma?.getAuthCode) {
      console.log("[KBZ-DIAG] getAuthCode FAIL: bridge not available");
      return reject(new Error("KBZ Pay JSSDK not available"));
    }
    const timer = setTimeout(() => {
      console.log("[KBZ-DIAG] getAuthCode TIMEOUT after 60s");
      reject(new Error("getAuthCode timed out"));
    }, 60_000);
    ma.getAuthCode({
      scopes: ["AUTH_BASE", "PLAINTEXT_MOBILE_PHONE", "USER_NICKNAME"],
      success: (res: { authCode?: string }) => {
        clearTimeout(timer);
        console.log("[KBZ-DIAG] getAuthCode SUCCESS:", JSON.stringify(res));
        if (res?.authCode) resolve(res.authCode);
        else reject(new Error("No authCode in response"));
      },
      fail: (err: any) => {
        clearTimeout(timer);
        console.log("[KBZ-DIAG] getAuthCode FAIL:", JSON.stringify(err));
        reject(new Error(err?.errorMessage || "getAuthCode failed"));
      },
    });
  });
}

// ── JSSDK: openSetting ───────────────────────────────────────────
// Opens KBZ Mini App settings so user can toggle scope authorizations.
export function openSettings(): Promise<void> {
  return new Promise((resolve, reject) => {
    const ma = (window as any).ma;
    if (!ma?.callNativeAPI) {
      reject(new Error("KBZ bridge not available"));
      return;
    }
    try {
      ma.callNativeAPI("openSetting", {}, (res: any) => {
        console.log("[KBZ-DIAG] openSetting result:", JSON.stringify(res));
        resolve();
      }, (err: any) => {
        console.log("[KBZ-DIAG] openSetting fail:", JSON.stringify(err));
        resolve();
      });
    } catch (e: any) {
      console.log("[KBZ-DIAG] openSetting threw:", e?.message);
      resolve();
    }
  });
}

// ── JSSDK: startPay ──────────────────────────────────────────────
export interface StartPayParams {
  prepayId: string;
  orderInfo: string;
  sign: string;
  signType: string;
}

export function startPay(params: StartPayParams): Promise<any> {
  return new Promise((resolve, reject) => {
    const ma = (window as any).ma;
    const perf = (window as any).__perf;
    perf?.("kbz-startPay-start", { hasBridge: !!ma?.callNativeAPI });
    if (!ma?.callNativeAPI) {
      perf?.("kbz-startPay-end", { ok: false, reason: "no-bridge" });
      return reject(new Error("KBZ Pay JSSDK not available"));
    }
    const timer = setTimeout(() => {
      perf?.("kbz-startPay-end", { ok: false, reason: "timeout" });
      reject(new Error("startPay timed out"));
    }, 60_000);
    ma.callNativeAPI("startPay", {
      prepayId: params.prepayId,
      orderInfo: params.orderInfo,
      sign: params.sign,
      signType: params.signType,
      useMiniResultFlag: true,
    }, (res: any) => {
      clearTimeout(timer);
      const result_is_null = res === null || res === undefined;
      const result_keys = res && typeof res === "object" ? Object.keys(res) : [];
      perf?.("kbz-startPay-end", {
        ok: true,
        result_is_null,
        resultCode: res?.resultCode,
        result_keys,
      });
      resolve(res);
    }, (err: any) => {
      clearTimeout(timer);
      perf?.("kbz-startPay-end", {
        ok: false,
        reason: "fail-cb",
        resultCode: err?.resultCode,
        result_keys: err && typeof err === "object" ? Object.keys(err) : [],
      });
      reject(new Error(err?.errorMessage || "startPay failed"));
    });
  });
}

// ── Poll order payment status ────────────────────────────────────
export async function pollOrderUntilPaid(
  supabase: SupabaseClient,
  orderId: string,
  timeoutMs = 120_000,
): Promise<"paid" | "failed" | "timeout"> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { data } = await supabase
      .from("orders")
      .select("payment_status")
      .eq("id", orderId)
      .single();
    if (data?.payment_status === "paid") return "paid";
    if (data?.payment_status === "failed") return "failed";
    await new Promise((r) => setTimeout(r, 2000));
  }
  return "timeout";
}

// ── Address masking (landmark-preserving) ────────────────────────
export function maskAddress(fullAddress: string, township?: string): string {
  if (!fullAddress) return "***";
  const parts = fullAddress.split(",").map((s) => s.trim());

  // Find landmark parts (keep them)
  const kept: string[] = [];
  const lower = fullAddress.toLowerCase();
  for (const kw of LANDMARK_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      const part = parts.find((p) => p.toLowerCase().includes(kw.toLowerCase()));
      if (part && !kept.includes(part)) kept.push(part);
    }
  }

  // Always include township if present
  if (township && !kept.some((k) => k.toLowerCase().includes(township.toLowerCase()))) {
    kept.push(township);
  }

  if (kept.length === 0) {
    // No landmarks — show first and last part only
    if (parts.length <= 2) return "***" + (township ? `, ${township}` : "");
    return `***, ${parts[parts.length - 1]}`;
  }

  return kept.join(", ");
}
