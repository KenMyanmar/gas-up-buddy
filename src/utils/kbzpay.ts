export function isKBZPayMiniApp(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('miniapp') === '1') {
    try { localStorage.setItem('anygas_miniapp', '1'); } catch {}
    return true;
  }
  try {
    if (localStorage.getItem('anygas_miniapp') === '1') return true;
  } catch {}
  if (typeof window !== 'undefined' && (window as any).ma) return true;
  return false;
}

export function getOrderSource(): string {
  return isKBZPayMiniApp() ? 'kbzpay_miniapp' : 'customer_app';
}
