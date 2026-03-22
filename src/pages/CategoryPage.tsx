import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  tags: string[] | null;
  is_featured: boolean;
  product_images: { url: string; is_primary: boolean }[];
}

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!id) return;
      setLoading(true);

      // Special virtual categories
      if (id === "novidades") {
        setCategoryName("Novidades");
        const { data } = await supabase
          .from("products")
          .select("id, name, price, original_price, tags, is_featured, product_images(url, is_primary)")
          .eq("is_active", true)
          .eq("is_new", true)
          .order("created_at", { ascending: false });
        setProducts((data as any) || []);
        setLoading(false);
        return;
      }

      if (id === "promocoes") {
        setCategoryName("Promoções");
        const { data } = await supabase
          .from("products")
          .select("id, name, price, original_price, tags, is_featured, product_images(url, is_primary)")
          .eq("is_active", true)
          .not("original_price", "is", null)
          .order("created_at", { ascending: false });
        const results = ((data as any) || []).filter((p: Product) => p.original_price && p.original_price > p.price);
        setProducts(results);
        setLoading(false);
        return;
      }

      // Real category by ID
      const { data: cat } = await supabase.from("categories").select("id, name").eq("id", id).maybeSingle();
      if (cat) {
        setCategoryName(cat.name);
        const { data } = await supabase
          .from("products")
          .select("id, name, price, original_price, tags, is_featured, product_images(url, is_primary)")
          .eq("is_active", true)
          .eq("category_id", cat.id)
          .order("created_at", { ascending: false });
        setProducts((data as any) || []);
      } else {
        setCategoryName("");
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
  }, [id]);

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
          {categoryName || "Categoria"}
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
              <Link key={p.id} to={`/produto/${p.id}`}>
                <ProductCard
                  image={getProductImage(p)}
                  name={p.name}
                  price={p.price}
                  originalPrice={p.original_price || undefined}
                  category={categoryName}
                  badge={getBadge(p)}
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
