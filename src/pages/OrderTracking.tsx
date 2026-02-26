import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Phone, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

// Fix Leaflet default marker icon issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const agentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const customerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface OrderData {
  id: string;
  status: string;
  cylinder_type: string | null;
  total_amount: number | null;
  quantity: number;
  order_type: string | null;
  township: string;
  address: string;
  supplier_id: string | null;
  agent_id: string | null;
  created_at: string;
}

interface AgentProfile {
  owner_name: string;
  shop_name: string;
  safety_score: number | null;
  avatar_url: string | null;
}

interface AgentLocation {
  lat: number;
  lng: number;
  speed: number | null;
  heading: number | null;
  captured_at: string;
}

function MapBounds({ agentPos, customerPos }: {
  agentPos: [number, number] | null;
  customerPos: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (agentPos && customerPos) {
      map.fitBounds(L.latLngBounds([agentPos, customerPos]), { padding: [50, 50] });
    } else if (agentPos) {
      map.setView(agentPos, 15);
    } else if (customerPos) {
      map.setView(customerPos, 15);
    }
  }, [agentPos, customerPos, map]);

  return null;
}

const statusSteps = [
  { key: "new", label: "Order Placed", icon: "📝" },
  { key: "confirmed", label: "Agent Assigned", icon: "✓" },
  { key: "dispatched", label: "On the Way", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "✅" },
];

const OrderTracking = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [agentLocation, setAgentLocation] = useState<AgentLocation | null>(null);
  const [customerPos, setCustomerPos] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch order
  useEffect(() => {
    if (!orderId) return;
    supabase
      .from("orders")
      .select("id, status, cylinder_type, total_amount, quantity, order_type, township, address, supplier_id, agent_id, created_at")
      .eq("id", orderId)
      .single()
      .then(({ data }) => {
        if (data) setOrder(data as OrderData);
        setLoading(false);
      });
  }, [orderId]);

  // Fetch agent profile
  useEffect(() => {
    if (!order?.supplier_id) return;
    supabase
      .from("suppliers")
      .select("owner_name, shop_name, safety_score, avatar_url")
      .eq("id", order.supplier_id)
      .single()
      .then(({ data }) => {
        if (data) setAgent(data as AgentProfile);
      });
  }, [order?.supplier_id]);

  // Fetch latest agent location
  useEffect(() => {
    if (!order?.supplier_id) return;
    const agentId = order.agent_id || order.supplier_id;
    supabase
      .from("agent_locations")
      .select("lat, lng, speed, heading, captured_at")
      .eq("agent_id", agentId)
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setAgentLocation(data as AgentLocation);
      });
  }, [order?.supplier_id, order?.agent_id]);

  // Realtime: agent location
  useEffect(() => {
    if (!order?.supplier_id) return;
    const agentId = order.agent_id || order.supplier_id;
    const channel = supabase
      .channel(`agent-loc-${agentId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "agent_locations",
        filter: `agent_id=eq.${agentId}`,
      }, (payload) => {
        const loc = payload.new as any;
        setAgentLocation({ lat: loc.lat, lng: loc.lng, speed: loc.speed, heading: loc.heading, captured_at: loc.captured_at });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order?.supplier_id, order?.agent_id]);

  // Realtime: order status
  useEffect(() => {
    if (!orderId) return;
    const channel = supabase
      .channel(`order-st-${orderId}`)
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "orders",
        filter: `id=eq.${orderId}`,
      }, (payload) => {
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
    if (!user) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCustomerPos([pos.coords.latitude, pos.coords.longitude]),
        () => {
          supabase.from("customers").select("gps_lat, gps_lng").eq("auth_user_id", user.id).maybeSingle()
            .then(({ data }) => {
              if (data?.gps_lat && data?.gps_lng) setCustomerPos([Number(data.gps_lat), Number(data.gps_lng)]);
              else setCustomerPos([16.8661, 96.1951]);
            });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, [user]);

  const handleCancel = async () => {
    if (!orderId || !order) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;
    await supabase.from("orders").update({ status: "cancelled" as any }).eq("id", orderId);
    navigate("/orders");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <Skeleton className="mb-4 h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
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
  const canCancel = ["new", "confirmed"].includes(order.status);
  const isActive = ["confirmed", "dispatched", "in_progress"].includes(order.status);
  const agentInitials = agent?.owner_name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="flex items-center justify-between bg-primary px-5 py-4">
        <h1 className="text-lg font-bold text-primary-foreground">
          {order.status === "delivered" ? "Order Delivered ✅" : "Order Tracking"}
        </h1>
        <button onClick={() => navigate("/orders")} className="text-primary-foreground/80">
          <X className="h-5 w-5" />
        </button>
      </header>

      {/* Status Timeline */}
      <div className="bg-card px-5 py-4 shadow-sm">
        <div className="flex items-start justify-between">
          {statusSteps.map((step, i) => {
            const isCompleted = i <= currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step.key} className="relative flex flex-1 flex-col items-center text-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${isCompleted ? "bg-action text-action-foreground" : "bg-secondary text-muted-foreground"} ${isCurrent ? "ring-2 ring-action ring-offset-2" : ""}`}>
                  {isCompleted ? step.icon : i + 1}
                </div>
                <span className={`mt-1.5 text-[11px] font-semibold leading-tight ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.label}
                </span>
                {i < statusSteps.length - 1 && (
                  <div className={`absolute left-[calc(50%+20px)] top-5 h-0.5 w-[calc(100%-40px)] ${i < currentStepIndex ? "bg-action" : "bg-secondary"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Agent Profile Card */}
      {agent && isActive && (
        <div className="mx-5 mt-4 rounded-xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            {agent.avatar_url ? (
              <img src={agent.avatar_url} alt={agent.owner_name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-action text-sm font-bold text-action-foreground">
                {agentInitials}
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-foreground">{agent.owner_name}</p>
              <p className="text-xs text-muted-foreground">
                {agent.safety_score ? `⭐ ${agent.safety_score}/100 · ` : ""}{agent.shop_name}
              </p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <a href="tel:8484" className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-action py-2 text-sm font-bold text-action-foreground">
              <Phone className="h-4 w-4" /> Call 8484
            </a>
          </div>
        </div>
      )}

      {/* Waiting for agent */}
      {order.status === "new" && (
        <div className="mx-5 mt-4 flex flex-col items-center rounded-xl bg-card py-8 shadow-sm">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-action border-t-transparent" />
          <p className="mt-3 font-bold text-foreground">Finding your delivery agent...</p>
          <p className="mt-1 text-sm text-muted-foreground">Usually assigned within 2–3 minutes</p>
        </div>
      )}

      {/* Map */}
      {agentPos && (
        <div className="mx-5 mt-4 overflow-hidden rounded-xl shadow-sm">
          <div className="relative h-[250px]">
            <div className="absolute left-3 top-3 z-[1000] rounded-full bg-card/90 px-3 py-1.5 shadow-sm">
              <span className="text-xs font-semibold text-foreground">
                {order.status === "dispatched" ? "🕐 On the way" : order.status === "confirmed" ? "🔧 Preparing" : "📍 Agent location"}
              </span>
            </div>
            <MapContainer
              center={agentPos}
              zoom={14}
              scrollWheelZoom={false}
              style={{ height: "100%", width: "100%" }}
              attributionControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={agentPos} icon={agentIcon}>
                <Popup>{agent?.owner_name || "Agent"}</Popup>
              </Marker>
              {customerPos && (
                <Marker position={customerPos} icon={customerIcon}>
                  <Popup>Your location</Popup>
                </Marker>
              )}
              {customerPos && (
                <Polyline positions={[agentPos, customerPos]} pathOptions={{ color: "hsl(18, 82%, 50%)", weight: 3, dashArray: "8 8" }} />
              )}
              <MapBounds agentPos={agentPos} customerPos={customerPos} />
            </MapContainer>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="mx-5 mt-4 rounded-xl bg-card p-4 shadow-sm">
        <h2 className="mb-3 font-bold text-foreground">📦 Order Details</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Item</span>
            <span className="font-semibold text-foreground">{order.cylinder_type ?? "?"} · {order.order_type ?? "refill"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span className="font-semibold text-foreground">× {order.quantity}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total</span>
            <span className="font-semibold text-foreground">{(order.total_amount ?? 0).toLocaleString()} MMK</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Deliver to</span>
            <span className="text-right font-semibold text-foreground">{order.address}, {order.township}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment</span>
            <span className="font-semibold text-foreground">Cash on Delivery</span>
          </div>
        </div>
      </div>

      {/* Cancel */}
      {canCancel && (
        <div className="mx-5 mt-4">
          <button onClick={handleCancel} className="w-full rounded-xl border border-destructive py-3 text-sm font-bold text-destructive transition-colors active:bg-destructive/10">
            Cancel Order
          </button>
        </div>
      )}

      {/* Delivered */}
      {order.status === "delivered" && (
        <div className="mx-5 mt-4">
          <button onClick={() => navigate("/orders")} className="w-full rounded-xl bg-action py-3 text-sm font-bold text-action-foreground">
            Back to Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
