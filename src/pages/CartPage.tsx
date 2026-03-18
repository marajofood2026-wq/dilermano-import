import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Loader2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useFreeShippingThreshold, getFreeShippingStatus } from "@/hooks/useFreeShippingThreshold";

interface ShippingOption {
  service: string;
  price: number;
  original_price: number;
  days: number;
  free: boolean;
}

const CartPage = () => {
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingRegion, setShippingRegion] = useState("");
  const { user } = useAuth();

  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const { threshold: freeShippingThreshold } = useFreeShippingThreshold();
  const { isFree: hasFreeShipping, remaining: remainingForFreeShipping, progress: freeShippingProgress } = getFreeShippingStatus(totalPrice, freeShippingThreshold);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      toast.error("Faça login para continuar");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  const handleCalculateShipping = async () => {
    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      toast.error("Digite um CEP válido (8 dígitos)");
      return;
    }
    setShippingLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("calculate-shipping", {
        body: { cep, cartTotal: totalPrice },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setShippingOptions(data.options || []);
      setShippingRegion(data.region || "");
      setSelectedShipping(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao calcular frete");
    } finally {
      setShippingLoading(false);
    }
  };

  const formatCep = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    if (digits.length > 5) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return digits;
  };

  const shippingCost = selectedShipping?.price || 0;
  const orderTotal = totalPrice + shippingCost;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container flex min-h-[60vh] flex-col items-center justify-center pt-16">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
          <h1 className="mt-4 text-xl font-bold text-foreground">Seu carrinho está vazio</h1>
          <p className="mt-2 text-sm text-muted-foreground">Adicione produtos para continuar</p>
          <Link to="/">
            <Button className="mt-6 bg-gradient-ocean text-primary-foreground hover:opacity-90">
              Continuar Comprando
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Carrinho</h1>
        <p className="mt-1 text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "itens"}</p>

        {/* Free shipping bar */}
        {freeShippingThreshold !== null && !hasFreeShipping && (
          <div className="mt-4 rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">
              Falta <span className="font-semibold text-primary">{formatPrice(remainingForFreeShipping)}</span> para frete grátis!
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-ocean transition-all"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="space-y-4 lg:col-span-2">
            {items.map((item) => (
              <div key={item.variantId || item.productId} className="flex gap-4 rounded-lg border border-border bg-card p-4">
                <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-border">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-medium text-foreground">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                        className="px-2 py-1 text-muted-foreground hover:text-foreground"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                      <button
                        onClick={() => removeItem(item.productId, item.variantId)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="space-y-4">
            {/* Shipping Calculator */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                <h3 className="text-sm font-bold text-foreground">Calcular Frete</h3>
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  maxLength={9}
                  className="flex-1"
                />
                <Button
                  onClick={handleCalculateShipping}
                  disabled={shippingLoading}
                  variant="outline"
                  size="sm"
                >
                  {shippingLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Calcular"}
                </Button>
              </div>
              {shippingRegion && (
                <p className="mt-2 text-xs text-muted-foreground">Região: {shippingRegion}</p>
              )}
              {shippingOptions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {shippingOptions.map((opt) => (
                    <button
                      key={opt.service}
                      onClick={() => setSelectedShipping(opt)}
                      className={`flex w-full items-center justify-between rounded-md border p-3 text-left text-sm transition-colors ${
                        selectedShipping?.service === opt.service
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div>
                        <span className="font-medium text-foreground">{opt.service}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
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
              )}
            </div>

            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6">
              <h2 className="text-lg font-bold text-foreground">Resumo</h2>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-foreground">
                    {selectedShipping ? (
                      selectedShipping.free ? (
                        <span className="text-[hsl(var(--badge-new))]">Grátis</span>
                      ) : (
                        formatPrice(selectedShipping.price)
                      )
                    ) : hasFreeShipping ? (
                      <span className="text-[hsl(var(--badge-new))]">Grátis</span>
                    ) : (
                      "A calcular"
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="text-lg font-bold text-foreground">{formatPrice(orderTotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    ou 10x de {formatPrice(orderTotal / 10)} sem juros
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="mt-6 w-full bg-gradient-ocean text-primary-foreground hover:opacity-90"
              >
                Finalizar Compra <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/" className="mt-3 block text-center text-xs text-primary hover:underline">
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
