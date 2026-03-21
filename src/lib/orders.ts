import { supabase } from "@/integrations/supabase/client";

export interface OrderItemSummary {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  variant_name: string | null;
}

export interface OrderSummary {
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
  user_id: string | null;
  customer_name: string | null;
  order_items: OrderItemSummary[];
}

type FetchOrdersOptions = {
  userId?: string;
};

export const fetchOrdersWithDetails = async ({ userId }: FetchOrdersOptions = {}): Promise<OrderSummary[]> => {
  let query = supabase
    .from("orders")
    .select(
      "id, user_id, order_number, status, payment_status, total, subtotal, shipping_cost, discount_amount, tracking_code, shipping_carrier, payment_method, notes, created_at, order_items(id, product_name, quantity, unit_price, total_price, variant_name)"
    )
    .order("created_at", { ascending: false });

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data: ordersData, error: ordersError } = await query;

  if (ordersError) {
    throw ordersError;
  }

  const orders = (ordersData ?? []) as Array<Omit<OrderSummary, "customer_name">>;
  const userIds = [...new Set(orders.map((order) => order.user_id).filter(Boolean))] as string[];

  let customerNames = new Map<string, string | null>();

  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name")
      .in("user_id", userIds);

    if (profilesError) {
      throw profilesError;
    }

    customerNames = new Map(
      (profilesData ?? []).map((profile) => [profile.user_id, profile.full_name || null])
    );
  }

  return orders.map((order) => ({
    ...order,
    customer_name: order.user_id ? customerNames.get(order.user_id) ?? null : null,
  }));
};