import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description: string;
}

const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
  <div className="rounded-lg border border-border bg-card p-6">
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
    <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    customers: 0,
    revenue: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [productsRes, ordersRes, customersRes] = await Promise.all([
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id, total", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
      ]);

      const revenue = ordersRes.data?.reduce((sum, o) => sum + Number(o.total || 0), 0) || 0;

      setStats({
        products: productsRes.count || 0,
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        revenue,
      });
    };
    fetchStats();
  }, []);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Visão geral do seu e-commerce</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Produtos" value={String(stats.products)} icon={Package} description="Total cadastrado" />
        <StatCard title="Pedidos" value={String(stats.orders)} icon={ShoppingCart} description="Total de pedidos" />
        <StatCard title="Clientes" value={String(stats.customers)} icon={Users} description="Clientes cadastrados" />
        <StatCard title="Receita" value={formatCurrency(stats.revenue)} icon={DollarSign} description="Total de vendas" />
      </div>
    </div>
  );
};

export default Dashboard;
