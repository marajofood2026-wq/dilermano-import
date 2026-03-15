import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  brand: string | null;
  tags: string[] | null;
  categories: { name: string } | null;
  product_images: { url: string; alt_text: string | null; is_primary: boolean; sort_order: number }[];
}

const ProductPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, description, short_description, price, original_price, stock_quantity, brand, tags, categories(name), product_images(url, alt_text, is_primary, sort_order)")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();
      setProduct(data as any);
      setLoading(false);
    };
    fetch();
  }, [slug]);

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleAddToCart = () => {
    if (!product) return;
    const image = product.product_images?.[0]?.url || "/placeholder.svg";
    addItem({ productId: product.id, name: product.name, price: product.price, image }, qty);
    toast.success(`${product.name} adicionado ao carrinho!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex min-h-[60vh] items-center justify-center pt-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container flex min-h-[60vh] flex-col items-center justify-center pt-16">
          <p className="text-lg text-muted-foreground">Produto não encontrado</p>
          <Link to="/" className="mt-4 text-sm text-primary hover:underline">Voltar à loja</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = product.product_images?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const mainImage = images[selectedImage]?.url || "/placeholder.svg";
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <Link to="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={14} /> Voltar
        </Link>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div>
            <div className="aspect-square overflow-hidden rounded-lg bg-card">
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-16 w-16 overflow-hidden rounded-md border-2 ${i === selectedImage ? "border-primary" : "border-border"}`}
                  >
                    <img src={img.url} alt={img.alt_text || ""} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {product.categories?.name || product.brand || "Dilermano Import"}
            </p>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-foreground">{formatPrice(product.price)}</span>
              {product.original_price && (
                <>
                  <span className="text-sm text-muted-foreground line-through">{formatPrice(product.original_price)}</span>
                  <span className="rounded-sm bg-[hsl(var(--badge-sale))] px-2 py-0.5 text-xs font-bold text-destructive-foreground">
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              ou 10x de {formatPrice(product.price / 10)} sem juros
            </p>

            {product.description && (
              <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
            )}

            {/* Quantity + Add to cart */}
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center rounded-md border border-border">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center text-sm font-medium text-foreground">{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock_quantity, qty + 1))} className="px-3 py-2 text-muted-foreground hover:text-foreground">
                  <Plus size={16} />
                </button>
              </div>
              <Button
                onClick={handleAddToCart}
                disabled={product.stock_quantity === 0}
                className="flex-1 bg-gradient-ocean text-primary-foreground hover:opacity-90"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {product.stock_quantity === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
              </Button>
            </div>

            <p className="mt-3 text-xs text-muted-foreground">
              {product.stock_quantity > 0 ? `${product.stock_quantity} unidades em estoque` : "Produto esgotado"}
            </p>

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductPage;
