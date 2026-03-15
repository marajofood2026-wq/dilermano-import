import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Loader2, ArrowRight, Truck, Tag, ShoppingBag, ArrowLeft, CreditCard, MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface ShippingOption {
  service: string;
  price: number;
  original_price: number;
  days: number;
  free: boolean;
}

interface AddressForm {
  zip_code: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

const emptyAddress: AddressForm = {
  zip_code: "", street: "", number: "", complement: "",
  neighborhood: "", city: "", state: "",
};

const CheckoutPage = () => {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [addressLoading, setAddressLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingRegion, setShippingRegion] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string; code: string; discount_type: string; discount_value: number;
  } | null>(null);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [step, setStep] = useState<"address" | "payment">("address");

  const freeShippingThreshold = 299;

  useEffect(() => {
    if (items.length === 0) navigate("/carrinho", { replace: true });
  }, [items, navigate]);

  useEffect(() => {
    if (!user) return;
    // Load saved address
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_default", true)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setAddress({
            zip_code: data.zip_code,
            street: data.street,
            number: data.number,
            complement: data.complement || "",
            neighborhood: data.neighborhood,
            city: data.city,
            state: data.state,
          });
        }
      });
  }, [user]);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  const handleCepLookup = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, "");
    if (clean.length !== 8) return;

    setAddressLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress((prev) => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state,
        }));
      }
    } catch { /* ignore */ }
    setAddressLoading(false);

    // Calculate shipping
    setShippingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-shipping", {
        body: { cep: clean, cartTotal: totalPrice },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setShippingOptions(data.options || []);
      setShippingRegion(data.region || "");
      setSelectedShipping(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao calcular frete");
    }
    setShippingLoading(false);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("id, code, discount_type, discount_value, min_order_value, max_uses, uses_count, is_active, starts_at, expires_at")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) { toast.error("Cupom não encontrado"); return; }

      const now = new Date();
      if (data.starts_at && new Date(data.starts_at) > now) { toast.error("Cupom ainda não está ativo"); return; }
      if (data.expires_at && new Date(data.expires_at) < now) { toast.error("Cupom expirado"); return; }
      if (data.max_uses && data.uses_count !== null && data.uses_count >= data.max_uses) { toast.error("Cupom esgotado"); return; }
      if (data.min_order_value && totalPrice < data.min_order_value) {
        toast.error(`Valor mínimo: ${formatPrice(data.min_order_value)}`);
        return;
      }

      setAppliedCoupon({
        id: data.id, code: data.code,
        discount_type: data.discount_type, discount_value: data.discount_value,
      });
      toast.success(`Cupom ${data.code} aplicado!`);
    } catch {
      toast.error("Erro ao validar cupom");
    } finally {
      setCouponLoading(false);
    }
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "percentage"
      ? totalPrice * (appliedCoupon.discount_value / 100)
      : appliedCoupon.discount_value
    : 0;

  const shippingCost = selectedShipping?.price || 0;
  const orderTotal = Math.max(0, totalPrice - discountAmount + shippingCost);

  const isAddressValid = address.zip_code.replace(/\D/g, "").length === 8 &&
    address.street && address.number && address.neighborhood && address.city && address.state;

  const handleProceedToPayment = () => {
    if (!isAddressValid) {
      toast.error("Preencha todos os campos obrigatórios do endereço");
      return;
    }
    if (!selectedShipping) {
      toast.error("Selecione uma opção de frete");
      return;
    }
    setStep("payment");
  };

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Faça login para continuar");
      navigate("/login");
      return;
    }

    setCheckoutLoading(true);
    try {
      // 1. Create order in DB
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          order_number: "TEMP", // trigger will generate
          subtotal: totalPrice,
          total: orderTotal,
          shipping_cost: shippingCost,
          shipping_carrier: selectedShipping?.service || null,
          shipping_address: address as any,
          discount_amount: discountAmount > 0 ? discountAmount : null,
          coupon_id: appliedCoupon?.id || null,
          payment_method: "stripe",
          status: "pending",
          payment_status: "pending",
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      // 2. Create order items
      const orderItems = items.map((i) => ({
        order_id: order.id,
        product_id: i.productId,
        variant_id: i.variantId || null,
        product_name: i.name,
        variant_name: i.variantName || null,
        quantity: i.quantity,
        unit_price: i.price,
        total_price: i.price * i.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Update coupon usage
      if (appliedCoupon) {
        await supabase.rpc("has_role", { _user_id: user.id, _role: "user" }); // no-op, just to keep connection alive
        await supabase
          .from("coupons")
          .update({ uses_count: (await supabase.from("coupons").select("uses_count").eq("id", appliedCoupon.id).single()).data?.uses_count! + 1 })
          .eq("id", appliedCoupon.id);
      }

      // 4. Save/update address
      const { data: existingAddr } = await supabase
        .from("addresses")
        .select("id")
        .eq("user_id", user.id)
        .eq("zip_code", address.zip_code.replace(/\D/g, ""))
        .maybeSingle();

      if (!existingAddr) {
        await supabase.from("addresses").insert({
          user_id: user.id,
          ...address,
          zip_code: address.zip_code.replace(/\D/g, ""),
          is_default: true,
          label: "Principal",
        });
      }

      // 5. Create Stripe checkout
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          customerEmail: user.email,
          successUrl: `${window.location.origin}/checkout/success?order=${order.id}`,
          cancelUrl: `${window.location.origin}/checkout`,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Erro ao gerar link de pagamento");
      }
    } catch (err: any) {
      toast.error("Erro no checkout: " + (err.message || "Tente novamente"));
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <Link to="/carrinho" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Voltar ao carrinho
        </Link>

        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-foreground">Checkout</h1>

        {/* Steps indicator */}
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={() => setStep("address")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === "address"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            <MapPin size={14} /> 1. Endereço e Frete
          </button>
          <div className="h-px w-8 bg-border" />
          <button
            onClick={() => isAddressValid && selectedShipping && setStep("payment")}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              step === "payment"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground"
            }`}
          >
            <CreditCard size={14} /> 2. Pagamento
          </button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="space-y-6 lg:col-span-2">
            {step === "address" && (
              <>
                {/* Address Form */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <MapPin size={18} />
                    <h2 className="text-lg font-bold">Endereço de Entrega</h2>
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-1">
                      <Label htmlFor="cep">CEP *</Label>
                      <div className="relative mt-1">
                        <Input
                          id="cep"
                          placeholder="00000-000"
                          value={address.zip_code}
                          onChange={(e) => {
                            const formatted = formatCep(e.target.value);
                            setAddress((p) => ({ ...p, zip_code: formatted }));
                            if (formatted.replace(/\D/g, "").length === 8) {
                              handleCepLookup(formatted);
                            }
                          }}
                          maxLength={9}
                        />
                        {addressLoading && (
                          <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        className="mt-1"
                        value={address.street}
                        onChange={(e) => setAddress((p) => ({ ...p, street: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        className="mt-1"
                        value={address.number}
                        onChange={(e) => setAddress((p) => ({ ...p, number: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        className="mt-1"
                        placeholder="Apto, bloco..."
                        value={address.complement}
                        onChange={(e) => setAddress((p) => ({ ...p, complement: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        className="mt-1"
                        value={address.neighborhood}
                        onChange={(e) => setAddress((p) => ({ ...p, neighborhood: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        className="mt-1"
                        value={address.city}
                        onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        className="mt-1"
                        maxLength={2}
                        placeholder="UF"
                        value={address.state}
                        onChange={(e) => setAddress((p) => ({ ...p, state: e.target.value.toUpperCase() }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Options */}
                {shippingOptions.length > 0 && (
                  <div className="rounded-lg border border-border bg-card p-6">
                    <div className="flex items-center gap-2 text-foreground">
                      <Truck size={18} />
                      <h2 className="text-lg font-bold">Frete</h2>
                    </div>
                    {shippingRegion && (
                      <p className="mt-1 text-xs text-muted-foreground">Região: {shippingRegion}</p>
                    )}
                    <div className="mt-4 space-y-2">
                      {shippingOptions.map((opt) => (
                        <button
                          key={opt.service}
                          onClick={() => setSelectedShipping(opt)}
                          className={`flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors ${
                            selectedShipping?.service === opt.service
                              ? "border-primary bg-primary/5"
                              : "border-border hover:bg-muted"
                          }`}
                        >
                          <div>
                            <span className="font-medium text-foreground">{opt.service}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              {opt.days} {opt.days === 1 ? "dia útil" : "dias úteis"}
                            </span>
                          </div>
                          <span className="font-bold text-foreground">
                            {opt.free ? (
                              <span className="text-[hsl(var(--badge-new))]">Grátis</span>
                            ) : (
                              formatPrice(opt.price)
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {shippingLoading && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Calculando frete...
                  </div>
                )}

                <Button
                  onClick={handleProceedToPayment}
                  disabled={!isAddressValid || !selectedShipping}
                  className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90 sm:w-auto"
                >
                  Continuar para Pagamento <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}

            {step === "payment" && (
              <>
                {/* Address summary */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-foreground">
                      <MapPin size={18} />
                      <h2 className="font-bold">Entregar em</h2>
                    </div>
                    <button onClick={() => setStep("address")} className="text-xs text-primary hover:underline">
                      Alterar
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {address.street}, {address.number}
                    {address.complement && ` - ${address.complement}`}
                    <br />
                    {address.neighborhood} - {address.city}/{address.state} - CEP {address.zip_code}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selectedShipping?.service} — {selectedShipping?.days} dias úteis
                  </p>
                </div>

                {/* Coupon */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <Tag size={18} />
                    <h2 className="font-bold">Cupom de Desconto</h2>
                  </div>
                  {appliedCoupon ? (
                    <div className="mt-3 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
                      <div>
                        <span className="text-sm font-medium text-foreground">{appliedCoupon.code}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {appliedCoupon.discount_type === "percentage"
                            ? `${appliedCoupon.discount_value}% off`
                            : `- ${formatPrice(appliedCoupon.discount_value)}`}
                        </span>
                      </div>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="mt-3 flex gap-2">
                      <Input
                        placeholder="Código do cupom"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCode.trim()}
                        variant="outline"
                        size="sm"
                      >
                        {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aplicar"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment */}
                <div className="rounded-lg border border-border bg-card p-6">
                  <div className="flex items-center gap-2 text-foreground">
                    <CreditCard size={18} />
                    <h2 className="font-bold">Pagamento</h2>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Você será redirecionado para a página segura de pagamento via Stripe.
                  </p>
                  <Button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="mt-4 w-full bg-gradient-ocean text-primary-foreground hover:opacity-90"
                  >
                    {checkoutLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando...</>
                    ) : (
                      <>Pagar {formatPrice(orderTotal)} <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24 lg:self-start">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <ShoppingBag size={18} /> Resumo
            </h2>
            <div className="mt-4 max-h-60 space-y-3 overflow-auto">
              {items.map((item) => (
                <div key={item.variantId || item.productId} className="flex gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium text-foreground line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.quantity}x {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal ({totalItems} itens)</span>
                <span className="text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[hsl(var(--badge-new))]">
                  <span>Desconto</span>
                  <span>- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frete</span>
                <span className="text-foreground">
                  {selectedShipping ? (
                    selectedShipping.free ? (
                      <span className="text-[hsl(var(--badge-new))]">Grátis</span>
                    ) : (
                      formatPrice(shippingCost)
                    )
                  ) : (
                    "A calcular"
                  )}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-foreground">{formatPrice(orderTotal)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                ou 10x de {formatPrice(orderTotal / 10)} sem juros
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
