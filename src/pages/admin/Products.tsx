import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductFormDialog, { emptyForm, generateSlug, type ProductFormData } from "@/components/admin/ProductFormDialog";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  original_price: number | null;
  stock_quantity: number;
  is_active: boolean;
  is_new: boolean;
  category_id: string | null;
  sku: string | null;
  categories?: { name: string } | null;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProductFormData>(emptyForm);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, original_price, stock_quantity, is_active, is_new, category_id, sku, categories(name)")
      .order("created_at", { ascending: false });
    setProducts((data as any) || []);
  };

  useEffect(() => { fetchProducts(); }, []);


  const handleEdit = (p: Product) => {
    setEditForm({
      name: p.name,
      slug: p.slug,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : "",
      stock_quantity: String(p.stock_quantity),
      description: "",
      is_active: p.is_active,
      is_new: p.is_new ?? false,
      category_id: p.category_id || "",
      sku: p.sku || "",
    });
    setEditId(p.id);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditForm(emptyForm);
    setEditId(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Produto excluído!"); fetchProducts(); }
  };

  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q));
  });

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Produtos</h1>
          <p className="mt-1 text-sm text-muted-foreground">{products.length} produtos cadastrados</p>
        </div>
        <Button onClick={handleNew} className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar produtos..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="mt-4 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Estoque</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.categories?.name || "Sem categoria"}</p>
                      </div>
                      {p.is_new && (
                        <span className="rounded-sm bg-[hsl(var(--badge-new))] px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
                          NOVO
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{formatPrice(p.price)}</TableCell>
                  <TableCell>
                    <span className={p.stock_quantity <= 5 ? "text-destructive font-medium" : "text-foreground"}>
                      {p.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.is_active ? "bg-[hsl(var(--badge-new))]/20 text-[hsl(var(--badge-new))]" : "bg-muted text-muted-foreground"}`}>
                      {p.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <label className="cursor-pointer rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <ImageIcon size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(p.id, file);
                        }} />
                      </label>
                      <button onClick={() => handleEdit(p)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <ProductFormDialog
        open={dialogOpen}
        onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditId(null); setEditForm(emptyForm); } }}
        editId={editId}
        initialForm={editForm}
        onSaved={fetchProducts}
      />
    </div>
  );
};

export default Products;
