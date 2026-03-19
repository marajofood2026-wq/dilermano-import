import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMaxInstallments = () => {
  const [installments, setInstallments] = useState(10);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("promo_banner")
        .select("max_installments")
        .limit(1)
        .single();
      if (data && (data as any).max_installments) {
        setInstallments((data as any).max_installments);
      }
    };
    fetch();
  }, []);

  return installments;
};
