import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";

const CartPage = () => {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { user } = useAuth();

  const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const freeShippingThreshold = 299;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - totalPrice);

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
        {remainingForFreeShipping > 0 && (
          <div className="mt-4 rounded-lg bg-card p-3">
            <p className="text-sm text-muted-foreground">
              Falta <span className="font-semibold text-primary">{formatPrice(remainingForFreeShipping)}</span> para frete grátis!
            </p>
            <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-ocean transition-all"
                style={{ width: `${Math.min(100, (totalPrice / freeShippingThreshold) * 100)}%` }}
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
                  {totalPrice >= freeShippingThreshold ? (
                    <span className="text-[hsl(var(--badge-new))]">Grátis</span>
                  ) : (
                    "A calcular"
                  )}
                </span>
              </div>
              <div className="border-t border-border pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">{formatPrice(totalPrice)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  ou 10x de {formatPrice(totalPrice / 10)} sem juros
                </p>
              </div>
            </div>
            <Button className="mt-6 w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
              Finalizar Compra <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link to="/" className="mt-3 block text-center text-xs text-primary hover:underline">
              Continuar comprando
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CartPage;
