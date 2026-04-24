import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const agentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

interface OrderData {
  id: string; status: string; cylinder_type: string | null; total_amount: number | null;
  quantity: number; order_type: string | null; township: string; address: string;
  supplier_id: string | null; agent_id: string | null; created_at: string;
  payment_status: string | null;
  payment_method: string | null;
}

interface AgentProfile {
  owner_name: string; shop_name: string; safety_score: number | null; avatar_url: string | null;
}

interface AgentLocation {
  lat: number; lng: number; speed: number | null; heading: number | null; captured_at: string;
}

function MapBounds({ agentPos, customerPos }: { agentPos: [number, number] | null; customerPos: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (agentPos && customerPos) map.fitBounds(L.latLngBounds([agentPos, customerPos]), { padding: [50, 50] });
    else if (agentPos) map.setView(agentPos, 15);
    else if (customerPos) map.setView(customerPos, 15);
  }, [agentPos, customerPos, map]);
  return null;
}

const statusSteps = [
  { key: "new", label: "Placed", icon: "📝" },
  { key: "confirmed", label: "Accepted", icon: "✓" },
  { key: "in_progress", label: "On the Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlCustomerId = searchParams.get("cid");
  const cidQs = urlCustomerId ? `?cid=${urlCustomerId}` : "";
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [agentLocation, setAgentLocation] = useState<AgentLocation | null>(null);
  const [customerPos, setCustomerPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;
    supabase.from("orders").select("id, status, cylinder_type, total_amount, quantity, order_type, township, address, supplier_id, agent_id, created_at, payment_status, payment_method")
      .eq("id", orderId).single().then(({ data }) => { if (data) setOrder(data as OrderData); setLoading(false); });
  }, [orderId]);

  // Fetch agent profile
  useEffect(() => {
    if (!order?.supplier_id) return;
    supabase.from("suppliers").select("owner_name, shop_name, safety_score, avatar_url")
      .eq("id", order.supplier_id).single().then(({ data }) => { if (data) setAgent(data as AgentProfile); });
  }, [order?.supplier_id]);

  // Fetch latest agent location
  useEffect(() => {
    if (!order?.supplier_id) return;
    const agentId = order.agent_id || order.supplier_id;
    supabase.from("agent_locations").select("lat, lng, speed, heading, captured_at")
      .eq("agent_id", agentId).order("captured_at", { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setAgentLocation(data as AgentLocation); });
  }, [order?.supplier_id, order?.agent_id]);

  // Realtime: agent location
  useEffect(() => {
    if (!order?.supplier_id) return;
    const agentId = order.agent_id || order.supplier_id;
    const channel = supabase.channel(`agent-loc-${agentId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "agent_locations", filter: `agent_id=eq.${agentId}` },
        (payload) => { const loc = payload.new as any; setAgentLocation({ lat: loc.lat, lng: loc.lng, speed: loc.speed, heading: loc.heading, captured_at: loc.captured_at }); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.supplier_id, order?.agent_id]);

  // Realtime: order status
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase.channel(`order-st-${orderId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          const updated = payload.new as any;
          setOrder((prev) => prev ? { ...prev, ...updated } : prev);
          if (updated.supplier_id && !agent) {
            supabase.from("suppliers").select("owner_name, shop_name, safety_score, avatar_url").eq("id", updated.supplier_id).single()
              .then(({ data }) => { if (data) setAgent(data as AgentProfile); });
          }
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [orderId]);

  // Customer position
  useEffect(() => {
    if (!user && !urlCustomerId) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCustomerPos([pos.coords.latitude, pos.coords.longitude]),
        () => {
          let q = supabase.from("customers").select("gps_lat, gps_lng");
          if (urlCustomerId) q = q.eq("id", urlCustomerId);
          else if (user?.id) q = q.eq("auth_user_id", user.id);
          q.maybeSingle().then(({ data }) => {
            if (data?.gps_lat && data?.gps_lng) setCustomerPos([Number(data.gps_lat), Number(data.gps_lng)]);
            else setCustomerPos([16.8661, 96.1951]);
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [user, urlCustomerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-24 w-full rounded-[20px]" />
        <Skeleton className="h-64 w-full rounded-[20px]" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg font-semibold text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const agentPos: [number, number] | null = agentLocation ? [agentLocation.lat, agentLocation.lng] : null;
  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const showHelpFooter = ["new", "confirmed"].includes(order.status);
  const isActive = ["confirmed", "in_progress"].includes(order.status);
  const agentInitials = agent?.owner_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-b-[28px] gradient-hero px-5 py-5 text-white shadow-hero">
        <div className="absolute inset-0" style={{
          background: "repeating-linear-gradient(-45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)"
        }} />
        <div className="relative z-10 flex items-center justify-between mb-3">
          <h1 className="font-display text-lg font-extrabold">
            {order.status === "delivered" ? "Order Delivered ✅" : "Order Tracking"}
          </h1>
          <button onClick={() => navigate(`/orders${cidQs}`)} className="text-white/80 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/20 px-3.5 py-1.5 text-xs font-bold backdrop-blur-sm">
          {isActive && <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />}
          {order.status === "in_progress" ? "On the Way" : order.status === "delivered" ? "Delivered" : order.status === "confirmed" ? "Accepted" : "Placed"}
        </div>
      </div>

      {/* Status Timeline */}
      <div className="bg-card mx-5 -mt-3 rounded-[20px] px-4 py-4 shadow-sm border border-border relative z-10">
        <div className="flex items-start justify-between">
          {statusSteps.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="relative flex flex-1 flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${isCompleted ? "gradient-action text-white" : "bg-secondary text-muted-foreground"} ${isCurrent ? "ring-2 ring-action ring-offset-2" : ""}`}>
                  {isCompleted ? step.icon : i + 1}
                </div>
                <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {i < statusSteps.length - 1 && (
                  <div className={`absolute left-[calc(50%+20px)] top-5 h-0.5 w-[calc(100%-40px)] ${i < currentStepIndex ? "gradient-action" : "bg-secondary"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Profile Card */}
      {agent && isActive && (
        <div className="mx-5 mt-4 rounded-[20px] border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={agent.owner_name} className="h-[50px] w-[50px] rounded-[16px] object-cover" />
            ) : (
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-[16px] gradient-hero text-lg font-black text-white">
                {agentInitials}
              </div>
            )}
            <div className="flex-1">
              <p className="text-[15px] font-extrabold text-foreground">{agent.owner_name}</p>
              <p className="text-xs font-semibold text-muted-foreground">
                {agent.safety_score ? `⭐ ${agent.safety_score}/100 · ` : ""}{agent.shop_name}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order confirmed banner (no spinner — payment received, agent assignment pending) */}
      {order.status === "new" && (
        <div className="mx-5 mt-4 overflow-hidden rounded-[20px] border border-border bg-card shadow-sm">
          <div className="relative px-5 py-6">
            {/* Soft brand wash background */}
            <div
              className="absolute inset-0 opacity-60"
              style={{
                background:
                  "radial-gradient(120% 80% at 100% 0%, hsl(var(--action) / 0.08), transparent 60%), radial-gradient(120% 80% at 0% 100%, hsl(142 70% 45% / 0.08), transparent 60%)",
              }}
            />
            <div className="relative flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/10 ring-2 ring-green-500/20">
                <CheckCircle2 className="h-7 w-7 text-green-600" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-[17px] font-extrabold text-foreground">
                  Order confirmed!
                </p>
                <p className="mt-1 text-[13px] font-semibold text-green-600">
                  ✓ Payment received via KBZPay
                </p>
                <p className="mt-1.5 text-[13px] text-muted-foreground leading-relaxed">
                  Your delivery agent will be assigned shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map */}
      {agentPos && (
        <div className="mx-5 mt-4 overflow-hidden rounded-[20px] shadow-sm border border-border">
          <div className="relative h-[250px]">
            <div className="absolute left-3 top-3 z-[1000] rounded-full bg-card/90 px-3 py-1.5 shadow-sm backdrop-blur-sm">
              <span className="text-xs font-semibold text-foreground">
                {order.status === "in_progress" ? "🕐 On the way" : order.status === "confirmed" ? "🔧 Preparing" : "📍 Agent location"}
              </span>
            </div>
            <MapContainer center={agentPos} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }} attributionControl={false}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={agentPos} icon={agentIcon}><Popup>{agent?.owner_name || "Agent"}</Popup></Marker>
              {customerPos && <Marker position={customerPos} icon={customerIcon}><Popup>Your location</Popup></Marker>}
              {customerPos && <Polyline positions={[agentPos, customerPos]} pathOptions={{ color: "hsl(27, 85%, 49%)", weight: 3, dashArray: "8 8" }} />}
              <MapBounds agentPos={agentPos} customerPos={customerPos} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="mx-5 mt-4 rounded-[20px] border border-border bg-card p-4 shadow-sm">
        <h2 className="text-[13px] font-extrabold text-foreground mb-3">📦 Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">Item</span>
            <span className="font-bold text-foreground">{order.cylinder_type ?? "?"} · {order.order_type ?? "refill"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">Quantity</span>
            <span className="font-bold text-foreground">× {order.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">Total</span>
            <span className="font-display font-extrabold text-action">{(order.total_amount ?? 0).toLocaleString()} MMK</span>
          </div>
          <div className="h-px bg-divider my-1" />
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">Deliver to</span>
            <span className="text-right font-bold text-foreground">{order.address}, {order.township}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground font-semibold">Payment</span>
            <span className={`font-bold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-foreground'}`}>
              {order.payment_status === 'paid'
                ? `Paid via ${order.payment_method === 'kbzpay' ? 'KBZPay' : order.payment_method === 'wave' ? 'Wave' : order.payment_method === 'cb_pay' ? 'CB Pay' : 'Cash'}`
                : order.payment_status === 'cod' ? 'Cash on Delivery'
                : 'Payment Pending'}
            </span>
          </div>
        </div>
      </div>

      {/* Help footer for early-stage orders */}
      {showHelpFooter && (
        <div className="mx-5 mt-4 rounded-[14px] border border-border bg-surface-warm px-4 py-3 text-center">
          <p className="text-[13px] font-semibold text-muted-foreground">
            Need to change your order? Call <span className="select-all font-bold text-foreground">8484</span>
          </p>
        </div>
      )}

      {/* Delivered */}
      {order.status === "delivered" && (
        <div className="mx-5 mt-4">
          <button onClick={() => navigate(`/orders${cidQs}`)} className="w-full rounded-[14px] gradient-action py-3.5 text-sm font-extrabold text-white shadow-action">
            Back to Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
