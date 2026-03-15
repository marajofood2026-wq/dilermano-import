import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const CheckoutSuccess = () => {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container flex min-h-[60vh] flex-col items-center justify-center pt-16 text-center">
        <CheckCircle className="h-16 w-16 text-[hsl(var(--badge-new))]" />
        <h1 className="mt-4 text-2xl font-bold text-foreground">Pedido Confirmado!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Obrigado pela sua compra. Você receberá um email com os detalhes do pedido.
        </p>
        <Link to="/">
          <Button className="mt-6 bg-gradient-ocean text-primary-foreground hover:opacity-90">
            Voltar à Loja
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutSuccess;
