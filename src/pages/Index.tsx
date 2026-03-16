import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import CategoryCard from "@/components/CategoryCard";

import heroBg from "@/assets/hero-beach.jpg";
import catMens from "@/assets/category-mens.jpg";
import catWomens from "@/assets/category-womens.jpg";
import catAccessories from "@/assets/category-accessories.jpg";

// Fallback images for products without uploaded images
import prodTshirt from "@/assets/product-tshirt-1.jpg";
import prodShorts from "@/assets/product-shorts-1.jpg";
import prodHoodie from "@/assets/product-hoodie-1.jpg";
import prodSunglasses from "@/assets/product-sunglasses-1.jpg";
import prodPants from "@/assets/product-pants-1.jpg";
import prodJacket from "@/assets/product-jacket-1.jpg";
import prodCap from "@/assets/product-cap-1.jpg";
import prodDress from "@/assets/product-dress-1.jpg";

const fallbackImages: Record<string, string> = {
  "camiseta-wave-rider": prodTshirt,
  "bermuda-ocean-stripe": prodShorts,
  "moletom-essential": prodHoodie,
  "oculos-aviador-gold": prodSunglasses,
  "calca-cargo-outdoor": prodPants,
  "jaqueta-denim-classic": prodJacket,
  "bone-snapback-logo": prodCap,
  "vestido-floral-resort": prodDress,
};

const categories = [
  { image: catMens, title: "Masculino", href: "/masculino" },
  { image: catWomens, title: "Feminino", href: "/feminino" },
  { image: catAccessories, title: "Acessórios", href: "/acessorios" },
];

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  tags: string[] | null;
  is_featured: boolean;
  is_new: boolean;
  categories: { name: string } | null;
  product_images: { url: string; is_primary: boolean }[];
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from("products")
        .select("id, name, slug, price, original_price, tags, is_featured, is_new, categories(name), product_images(url, is_primary)")
        .eq("is_active", true)
        .eq("is_featured", true)
        .order("created_at", { ascending: false })
        .limit(8);
      setProducts((data as any) || []);
    };
    fetchProducts();
  }, []);

  const getImage = (p: Product) => {
    const primary = p.product_images?.find((img) => img.is_primary);
    return primary?.url || p.product_images?.[0]?.url || fallbackImages[p.slug] || "/placeholder.svg";
  };

  const getBadge = (p: Product): "novo" | "sale" | undefined => {
    if (p.tags?.includes("novo")) return "novo";
    if (p.tags?.includes("sale") || p.original_price) return "sale";
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative flex min-h-[85vh] items-center pt-16">
        <img src={heroBg} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="bg-hero-overlay absolute inset-0" />
        <div className="container relative z-10">
          <div className="max-w-xl animate-fade-in">
            <span className="mb-4 inline-block rounded-sm bg-gradient-ocean px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
              Nova Coleção 2026
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Estilo que vem<br />
              <span className="text-gradient-ocean">do oceano</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Peças importadas com qualidade premium. Surf, street e lifestyle em um só lugar.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/novidades" className="inline-flex items-center gap-2 rounded-md bg-gradient-ocean px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Explorar Coleção <ArrowRight size={16} />
              </Link>
              <Link to="/promocoes" className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-muted">
                Ver Promoções
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorias</h2>
            <p className="mt-1 text-sm text-muted-foreground">Encontre seu estilo</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {categories.map((cat) => (
            <CategoryCard key={cat.title} {...cat} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Destaques</h2>
            <p className="mt-1 text-sm text-muted-foreground">Os mais procurados da semana</p>
          </div>
          <Link to="/novidades" className="hidden text-sm font-medium text-primary transition-colors hover:text-ocean-glow sm:inline-flex sm:items-center sm:gap-1">
            Ver todos <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} to={`/produto/${product.slug}`}>
              <ProductCard
                image={getImage(product)}
                name={product.name}
                price={product.price}
                originalPrice={product.original_price || undefined}
                badge={getBadge(product)}
                category={product.categories?.name || ""}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="container pb-16">
        <div className="relative overflow-hidden rounded-lg bg-gradient-ocean p-8 sm:p-12">
          <div className="relative z-10 max-w-md">
            <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
              Frete grátis acima de R$ 299
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Aproveite condições especiais em toda a loja. Parcele em até 10x sem juros.
            </p>
            <Link to="/novidades" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90">
              Comprar Agora <ArrowRight size={16} />
            </Link>
          </div>
          <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/10 sm:h-56 sm:w-56" />
          <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-primary-foreground/5 sm:h-40 sm:w-40" />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
