import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Package, ChevronDown, ChevronUp, Truck } from "lucide-react";

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
  tracking_code: string | null;
  shipping_carrier: string | null;
  created_at: string;
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
  pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
  processing: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
  shipped: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  delivered: "bg-green-500/20 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/20 text-red-600 dark:text-red-400",
  refunded: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
};

const MyOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, payment_status, total, subtotal, shipping_cost, tracking_code, shipping_carrier, created_at, order_items(id, product_name, quantity, unit_price, total_price, variant_name)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setOrders((data as any) || []);
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container flex min-h-[60vh] items-center justify-center pt-16">
          <p className="text-muted-foreground">Carregando pedidos...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Meus Pedidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</p>

        {orders.length === 0 ? (
          <div className="mt-12 flex flex-col items-center text-center">
            <Package className="h-16 w-16 text-muted-foreground/30" />
            <h2 className="mt-4 text-lg font-bold text-foreground">Nenhum pedido ainda</h2>
            <p className="mt-2 text-sm text-muted-foreground">Explore nossa loja e faça sua primeira compra!</p>
            <Link to="/" className="mt-6 inline-flex items-center rounded-md bg-gradient-ocean px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Explorar Loja
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-card">
                {/* Order header */}
                <button
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                    <span className="font-mono text-sm font-bold text-foreground">{order.order_number}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(order.created_at)}</span>
                    <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] || ""}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{formatPrice(order.total)}</span>
                    {expandedOrder === order.id ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded details */}
                {expandedOrder === order.id && (
                  <div className="border-t border-border p-4">
                    {/* Tracking */}
                    <div className="mb-4 flex items-center gap-2 rounded-md bg-muted p-3">
                      <Truck size={16} className="text-primary" />
                      <div>
                        {order.tracking_code ? (
                          <>
                            <p className="text-xs text-muted-foreground">
                              {order.shipping_carrier || "Correios"} — Rastreio:
                            </p>
                            <p className="font-mono text-sm font-bold text-foreground">{order.tracking_code}</p>
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">Aguardando código de rastreio</p>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2">
                      {order.order_items?.map((item) => (
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

                    {/* Totals */}
                    <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatPrice(order.subtotal)}</span>
                      </div>
                      {order.shipping_cost != null && order.shipping_cost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Frete</span>
                          <span className="text-foreground">{formatPrice(order.shipping_cost)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold">
                        <span className="text-foreground">Total</span>
                        <span className="text-foreground">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
