import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Save, Truck } from "lucide-react";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name: string | null;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total: number;
  subtotal: number;
  shipping_cost: number | null;
  discount_amount: number | null;
  tracking_code: string | null;
  shipping_carrier: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  profiles?: { full_name: string } | null;
  order_items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  processing: "Processando",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
  refunded: "Reembolsado",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  processing: "bg-purple-500/20 text-purple-400",
  shipped: "bg-cyan-500/20 text-cyan-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
  refunded: "bg-orange-500/20 text-orange-400",
};

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, payment_status, total, subtotal, shipping_cost, discount_amount, tracking_code, shipping_carrier, payment_method, notes, created_at, profiles:user_id(full_name), order_items(id, product_name, quantity, unit_price, total_price, variant_name)")
      .order("created_at", { ascending: false });
    const orders = (data as any) || [];
    setOrders(orders);
    // Init tracking inputs
    const inputs: Record<string, string> = {};
    orders.forEach((o: Order) => {
      inputs[o.id] = o.tracking_code || "";
    });
    setTrackingInputs(inputs);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

  const saveTrackingCode = async (orderId: string) => {
    setSaving(orderId);
    const code = trackingInputs[orderId]?.trim() || null;
    const { error } = await supabase
      .from("orders")
      .update({ tracking_code: code })
      .eq("id", orderId);
    setSaving(null);
    if (error) {
      toast.error("Erro ao salvar código de rastreio");
    } else {
      toast.success("Código de rastreio salvo!");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, tracking_code: code } : o))
      );
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Pedidos</h1>
      <p className="mt-1 text-sm text-muted-foreground">{orders.length} pedidos</p>

      <div className="mt-6 space-y-3">
        {orders.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">Nenhum pedido</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card">
              {/* Header row */}
              <button
                onClick={() => setExpandedOrder(expandedOrder === o.id ? null : o.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                  <span className="font-mono text-sm font-bold text-foreground">{o.order_number}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(o.created_at)}</span>
                  <span className="text-sm text-foreground">{o.profiles?.full_name || "—"}</span>
                  <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[o.status] || ""}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-foreground">{formatPrice(o.total)}</span>
                  {expandedOrder === o.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                </div>
              </button>

              {/* Expanded details */}
              {expandedOrder === o.id && (
                <div className="border-t border-border p-4 space-y-4">
                  {/* Tracking code input */}
                  <div className="rounded-md bg-muted p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Truck size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-foreground">Código de Rastreio</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: BR123456789"
                        value={trackingInputs[o.id] || ""}
                        onChange={(e) =>
                          setTrackingInputs((prev) => ({ ...prev, [o.id]: e.target.value }))
                        }
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        onClick={() => saveTrackingCode(o.id)}
                        disabled={saving === o.id}
                      >
                        <Save size={14} className="mr-1" />
                        Salvar
                      </Button>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <h4 className="mb-2 text-sm font-semibold text-foreground">Produtos</h4>
                    <div className="space-y-1">
                      {o.order_items?.map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-foreground">{item.product_name}</span>
                            {item.variant_name && <span className="ml-1 text-xs text-muted-foreground">({item.variant_name})</span>}
                            <span className="ml-2 text-xs text-muted-foreground">x{item.quantity}</span>
                          </div>
                          <span className="font-medium text-foreground">{formatPrice(item.total_price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Totals */}
                  <div className="space-y-1 border-t border-border pt-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">{formatPrice(o.subtotal)}</span>
                    </div>
                    {o.shipping_cost != null && o.shipping_cost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frete</span>
                        <span className="text-foreground">{formatPrice(o.shipping_cost)}</span>
                      </div>
                    )}
                    {o.discount_amount != null && o.discount_amount > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Desconto</span>
                        <span className="text-green-500">-{formatPrice(o.discount_amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-foreground">{formatPrice(o.total)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Orders;
