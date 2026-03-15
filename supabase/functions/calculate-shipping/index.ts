import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simulação de tabela de frete baseada em faixas de CEP
// Em produção, substituir pela API real dos Correios
const shippingZones: { cepStart: string; cepEnd: string; region: string; sedex: number; pac: number; days_sedex: number; days_pac: number }[] = [
  { cepStart: "01000", cepEnd: "19999", region: "SP Capital/Interior", sedex: 15.90, pac: 9.90, days_sedex: 2, days_pac: 5 },
  { cepStart: "20000", cepEnd: "28999", region: "RJ", sedex: 19.90, pac: 12.90, days_sedex: 3, days_pac: 7 },
  { cepStart: "29000", cepEnd: "29999", region: "ES", sedex: 22.90, pac: 14.90, days_sedex: 3, days_pac: 8 },
  { cepStart: "30000", cepEnd: "39999", region: "MG", sedex: 21.90, pac: 13.90, days_sedex: 3, days_pac: 7 },
  { cepStart: "40000", cepEnd: "48999", region: "BA", sedex: 28.90, pac: 18.90, days_sedex: 4, days_pac: 10 },
  { cepStart: "49000", cepEnd: "49999", region: "SE", sedex: 29.90, pac: 19.90, days_sedex: 4, days_pac: 10 },
  { cepStart: "50000", cepEnd: "56999", region: "PE", sedex: 30.90, pac: 20.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "57000", cepEnd: "57999", region: "AL", sedex: 31.90, pac: 21.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "58000", cepEnd: "58999", region: "PB", sedex: 32.90, pac: 22.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "59000", cepEnd: "59999", region: "RN", sedex: 33.90, pac: 23.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "60000", cepEnd: "63999", region: "CE", sedex: 34.90, pac: 24.90, days_sedex: 5, days_pac: 13 },
  { cepStart: "64000", cepEnd: "64999", region: "PI", sedex: 35.90, pac: 25.90, days_sedex: 6, days_pac: 14 },
  { cepStart: "65000", cepEnd: "65999", region: "MA", sedex: 36.90, pac: 26.90, days_sedex: 6, days_pac: 14 },
  { cepStart: "66000", cepEnd: "68899", region: "PA", sedex: 38.90, pac: 28.90, days_sedex: 7, days_pac: 15 },
  { cepStart: "69000", cepEnd: "69299", region: "AM", sedex: 42.90, pac: 32.90, days_sedex: 8, days_pac: 18 },
  { cepStart: "69300", cepEnd: "69399", region: "RR", sedex: 45.90, pac: 35.90, days_sedex: 9, days_pac: 20 },
  { cepStart: "69400", cepEnd: "69899", region: "AM Interior", sedex: 44.90, pac: 34.90, days_sedex: 8, days_pac: 18 },
  { cepStart: "69900", cepEnd: "69999", region: "AC", sedex: 46.90, pac: 36.90, days_sedex: 9, days_pac: 20 },
  { cepStart: "70000", cepEnd: "72799", region: "DF", sedex: 20.90, pac: 13.90, days_sedex: 3, days_pac: 7 },
  { cepStart: "72800", cepEnd: "76799", region: "GO", sedex: 24.90, pac: 16.90, days_sedex: 4, days_pac: 9 },
  { cepStart: "76800", cepEnd: "76999", region: "TO", sedex: 32.90, pac: 22.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "77000", cepEnd: "77999", region: "TO", sedex: 32.90, pac: 22.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "78000", cepEnd: "78899", region: "MT", sedex: 30.90, pac: 20.90, days_sedex: 5, days_pac: 12 },
  { cepStart: "78900", cepEnd: "78999", region: "RO", sedex: 38.90, pac: 28.90, days_sedex: 7, days_pac: 15 },
  { cepStart: "79000", cepEnd: "79999", region: "MS", sedex: 26.90, pac: 17.90, days_sedex: 4, days_pac: 9 },
  { cepStart: "80000", cepEnd: "87999", region: "PR", sedex: 18.90, pac: 11.90, days_sedex: 3, days_pac: 6 },
  { cepStart: "88000", cepEnd: "89999", region: "SC", sedex: 19.90, pac: 12.90, days_sedex: 3, days_pac: 7 },
  { cepStart: "90000", cepEnd: "99999", region: "RS", sedex: 21.90, pac: 14.90, days_sedex: 3, days_pac: 8 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cep, cartTotal } = await req.json();

    if (!cep || typeof cep !== "string") {
      throw new Error("CEP é obrigatório");
    }

    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      throw new Error("CEP inválido");
    }

    // Free shipping threshold
    const FREE_SHIPPING_THRESHOLD = 299;
    const isFreeShipping = cartTotal && cartTotal >= FREE_SHIPPING_THRESHOLD;

    // Find zone
    const cepNum = cleanCep.substring(0, 5);
    const zone = shippingZones.find(
      (z) => cepNum >= z.cepStart && cepNum <= z.cepEnd
    );

    if (!zone) {
      throw new Error("CEP não encontrado na tabela de fretes");
    }

    const options = [
      {
        service: "SEDEX",
        price: isFreeShipping ? 0 : zone.sedex,
        original_price: zone.sedex,
        days: zone.days_sedex,
        free: isFreeShipping,
      },
      {
        service: "PAC",
        price: isFreeShipping ? 0 : zone.pac,
        original_price: zone.pac,
        days: zone.days_pac,
        free: isFreeShipping,
      },
    ];

    return new Response(
      JSON.stringify({ options, region: zone.region }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
