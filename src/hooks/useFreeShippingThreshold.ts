import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useFreeShippingThreshold = () => {
  const [threshold, setThreshold] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("promo_banner")
      .select("value, is_active")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setThreshold(data?.value ?? null);
        setLoading(false);
      });
  }, []);

  return { threshold, loading };
};

export const getFreeShippingStatus = (subtotal: number, threshold: number | null) => {
  if (threshold === null) return { isFree: false, remaining: 0, progress: 0 };
  const isFree = subtotal >= threshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);
  return { isFree, remaining, progress };
};
