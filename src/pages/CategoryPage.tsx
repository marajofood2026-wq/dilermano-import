import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  tags: string[] | null;
  is_featured: boolean;
  product_images: { url: string; is_primary: boolean }[];
}

const categoryMap: Record<string, string> = {
  novidades: "novo",
  masculino: "Camisetas",
  feminino: "Feminino",
  acessorios: "Acessórios",
  promocoes: "sale",
};

const titleMap: Record<string, string> = {
  novidades: "Novidades",
  masculino: "Masculino",
  feminino: "Feminino",
  acessorios: "Acessórios",
  promocoes: "Promoções",
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase
        .from("products")
        .select("id, name, slug, price, original_price, tags, is_featured, category_id, categories(name, slug), product_images(url, is_primary)")
        .eq("is_active", true);

      if (slug === "novidades") {
        query = query.contains("tags", ["novo"]);
      } else if (slug === "promocoes") {
        query = query.contains("tags", ["sale"]);
      } else if (slug) {
        // Filter by category slug
        const { data: cat } = await supabase.from("categories").select("id").eq("slug", slug).maybeSingle();
        if (cat) {
          query = query.eq("category_id", cat.id);
        }
      }

      const { data } = await query.order("created_at", { ascending: false });
      setProducts((data as any) || []);
      setLoading(false);
    };
    fetchProducts();
  }, [slug]);

  const getProductImage = (p: Product) => {
    const primary = p.product_images?.find((img) => img.is_primary);
    return primary?.url || p.product_images?.[0]?.url || "/placeholder.svg";
  };

  const getBadge = (p: Product): "novo" | "sale" | undefined => {
    if (p.original_price && p.original_price > p.price) return "sale";
    if (p.tags?.includes("novo")) return "novo";
    return undefined;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          {titleMap[slug || ""] || slug}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} produtos encontrados
        </p>

        {loading ? (
          <div className="mt-12 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-primary hover:underline">
              Voltar à loja
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <Link key={p.id} to={`/produto/${p.slug}`}>
                <ProductCard
                  image={getProductImage(p)}
                  name={p.name}
                  price={p.price}
                  originalPrice={p.original_price || undefined}
                  badge={getBadge(p)}
                  category={(p as any).categories?.name || ""}
                />
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
