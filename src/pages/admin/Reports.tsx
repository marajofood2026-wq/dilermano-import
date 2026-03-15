import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3 } from "lucide-react";

const Reports = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    topProducts: [] as { product_name: string; qty: number }[],
  });

  useEffect(() => {
    const fetch = async () => {
      const { data: orders } = await supabase.from("orders").select("total");
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, quantity");

      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;

      // Aggregate top products
      const productMap: Record<string, number> = {};
      items?.forEach((i) => {
        productMap[i.product_name] = (productMap[i.product_name] || 0) + i.quantity;
      });
      const topProducts = Object.entries(productMap)
        .map(([product_name, qty]) => ({ product_name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      setStats({
        totalOrders,
        totalRevenue,
        avgOrderValue: totalOrders ? totalRevenue / totalOrders : 0,
        topProducts,
      });
    };
    fetch();
  }, []);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral de vendas</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{stats.totalOrders}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Receita Total</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPrice(stats.totalRevenue)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">Ticket Médio</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{formatPrice(stats.avgOrderValue)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Produtos Mais Vendidos</h2>
        <div className="mt-4 space-y-3">
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma venda registrada ainda</p>
          ) : (
            stats.topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                <span className="text-sm font-medium text-foreground">{p.product_name}</span>
                <span className="text-sm text-muted-foreground">{p.qty} vendidos</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
