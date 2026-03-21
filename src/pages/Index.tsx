import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroCarousel from "@/components/HeroCarousel";
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

interface CategoryRow {
  id: string;
  name: string;
  image_url: string | null;
  sort_order: number | null;
}

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  value: number | null;
  is_active: boolean;
}

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [promoBanner, setPromoBanner] = useState<PromoBanner | null>(null);
  const [dbCategories, setDbCategories] = useState<CategoryRow[]>([]);

  useEffect(() => {
    const fetchPromoBanner = async () => {
      const { data } = await supabase
        .from("promo_banner")
        .select("*")
        .limit(1)
        .single();
      setPromoBanner(data as any);
    };
    fetchPromoBanner();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name, image_url, sort_order")
        .eq("is_active", true)
        .order("sort_order");
      setDbCategories((data as CategoryRow[]) || []);
    };
    fetchCategories();
  }, []);

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
    if (p.original_price && p.original_price > p.price) return "sale";
    if (p.is_new || p.tags?.includes("novo")) return "novo";
    return undefined;
  };

  // Build category list from DB
  const categoryCards = dbCategories.length > 0
    ? dbCategories.map((c) => ({
        image: c.image_url || "/placeholder.svg",
        title: c.name,
        href: `/categoria/${c.id}`,
      }))
    : [
        { image: catMens, title: "Masculino", href: "/categoria/novidades" },
        { image: catWomens, title: "Feminino", href: "/categoria/novidades" },
        { image: catAccessories, title: "Acessórios", href: "/categoria/novidades" },
      ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroCarousel
        fallback={
          <section className="relative flex min-h-[85vh] items-center pt-16">
            <img src={heroBg} alt="Hero" className="absolute inset-0 h-full w-full object-cover" />
            <div className="bg-hero-overlay absolute inset-0" />
            <div className="container relative z-10">
              <div className="max-w-xl animate-fade-in">
                <span className="mb-4 inline-block rounded-sm bg-gradient-ocean px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary-foreground">
                  Nova Coleção 2026
                </span>
                <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Estilo que vem<br />
                  <span className="text-gradient-ocean">do oceano</span>
                </h1>
                <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">
                  Peças importadas com qualidade premium. Surf, street e lifestyle em um só lugar.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/categoria/novidades" className="inline-flex items-center gap-2 rounded-md bg-gradient-ocean px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                    Explorar Coleção <ArrowRight size={16} />
                  </Link>
                  <Link to="/categoria/promocoes" className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20">
                    Ver Promoções
                  </Link>
                </div>
              </div>
            </div>
          </section>
        }
      />

      {/* Categories */}
      <section className="container py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">Categorias</h2>
            <p className="mt-1 text-sm text-muted-foreground">Encontre seu estilo</p>
          </div>
        </div>
        <div className={`grid gap-4 ${categoryCards.length <= 3 ? "sm:grid-cols-3" : categoryCards.length <= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          {categoryCards.map((cat) => (
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
          <Link to="/categoria/novidades" className="hidden text-sm font-medium text-primary transition-colors hover:text-ocean-glow sm:inline-flex sm:items-center sm:gap-1">
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
        {promoBanner?.is_active ? (
          <div className="relative overflow-hidden rounded-lg bg-gradient-ocean p-8 sm:p-12">
            <div className="relative z-10 max-w-md">
              <h2 className="text-2xl font-extrabold tracking-tight text-primary-foreground sm:text-3xl">
                {promoBanner.title}
              </h2>
              {promoBanner.subtitle && (
                <p className="mt-2 text-sm text-primary-foreground/80">
                  {promoBanner.subtitle}
                </p>
              )}
              {promoBanner.button_text && (
                <Link to={promoBanner.button_link || "/categoria/novidades"} className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90">
                  {promoBanner.button_text} <ArrowRight size={16} />
                </Link>
              )}
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary-foreground/10 sm:h-56 sm:w-56" />
            <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-primary-foreground/5 sm:h-40 sm:w-40" />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-muted to-accent p-8 sm:p-12">
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl">🛍️</span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
                Descubra nosso estilo
              </h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Explore peças exclusivas com qualidade premium. Surf, street e lifestyle em um só lugar.
              </p>
              <Link to="/categoria/novidades" className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                Explorar Coleção <ArrowRight size={16} />
              </Link>
            </div>
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/5 sm:h-56 sm:w-56" />
            <div className="absolute -bottom-12 right-16 h-32 w-32 rounded-full bg-primary/5 sm:h-40 sm:w-40" />
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Index;
