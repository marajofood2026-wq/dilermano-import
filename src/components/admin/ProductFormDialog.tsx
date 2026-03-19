import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import ProductImageManager from "./ProductImageManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
  initialForm?: ProductFormData;
  onSaved: () => void;
}

export interface ProductFormData {
  name: string;
  slug: string;
  price: string;
  original_price: string;
  stock_quantity: string;
  description: string;
  is_active: boolean;
  is_new: boolean;
  category_id: string;
  sku: string;
}

const MAIN_CATEGORIES = [
  { id: "e8bdb08a-1506-4d9a-979a-6b213a4743c1", label: "Masculino" },
  { id: "2da62689-f251-4591-986d-b6248f849272", label: "Feminino" },
  { id: "39cc08db-787f-4448-880c-f41bf1cd9fb6", label: "Acessórios" },
];

export const emptyForm: ProductFormData = {
  name: "",
  slug: "",
  price: "",
  original_price: "",
  stock_quantity: "",
  description: "",
  is_active: true,
  is_new: false,
  category_id: "",
  sku: "",
};

interface VariantRow {
  id?: string;
  name: string;
  sku: string;
  stock_quantity: number;
  price_override: string;
  attributes: { color?: string; size?: string };
}

export const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const SIZES = ["PP", "P", "M", "G", "GG", "XGG"];
const COLORS = [
  { label: "Preto", value: "#000000" },
  { label: "Branco", value: "#FFFFFF" },
  { label: "Azul", value: "#2563EB" },
  { label: "Vermelho", value: "#DC2626" },
  { label: "Verde", value: "#16A34A" },
  { label: "Amarelo", value: "#EAB308" },
  { label: "Rosa", value: "#EC4899" },
  { label: "Cinza", value: "#6B7280" },
  { label: "Marrom", value: "#92400E" },
  { label: "Bege", value: "#D2B48C" },
];

const ProductFormDialog = ({ open, onOpenChange, editId, initialForm, onSaved }: ProductFormDialogProps) => {
  const [form, setForm] = useState<ProductFormData>(initialForm || emptyForm);
  const [savedProductId, setSavedProductId] = useState<string | null>(editId);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);

  useEffect(() => {
    if (initialForm) setForm(initialForm);
    else setForm(emptyForm);
    setSavedProductId(editId);
  }, [initialForm, open, editId]);

  useEffect(() => {
    if (editId && open) {
      loadVariants(editId);
    } else {
      setVariants([]);
      setSelectedSizes([]);
      setSelectedColors([]);
    }
  }, [editId, open]);

  const loadVariants = async (productId: string) => {
    setLoadingVariants(true);
    const { data } = await supabase
      .from("product_variants")
      .select("*")
      .eq("product_id", productId)
      .order("name");
    if (data) {
      const rows: VariantRow[] = data.map((v: any) => ({
        id: v.id,
        name: v.name,
        sku: v.sku || "",
        stock_quantity: v.stock_quantity,
        price_override: v.price_override ? String(v.price_override) : "",
        attributes: (v.attributes as any) || {},
      }));
      setVariants(rows);
      const sizes = new Set<string>();
      const colors = new Set<string>();
      rows.forEach((r) => {
        if (r.attributes.size) sizes.add(r.attributes.size);
        if (r.attributes.color) colors.add(r.attributes.color);
      });
      setSelectedSizes(Array.from(sizes));
      setSelectedColors(Array.from(colors));
    }
    setLoadingVariants(false);
  };

  const generateVariants = () => {
    if (selectedSizes.length === 0 && selectedColors.length === 0) {
      setVariants([]);
      return;
    }

    const newVariants: VariantRow[] = [];
    const sizesToUse = selectedSizes.length > 0 ? selectedSizes : [""];
    const colorsToUse = selectedColors.length > 0 ? selectedColors : [""];

    for (const size of sizesToUse) {
      for (const color of colorsToUse) {
        const nameParts = [color, size].filter(Boolean);
        const existing = variants.find(
          (v) => v.attributes.size === (size || undefined) && v.attributes.color === (color || undefined)
        );
        newVariants.push(
          existing || {
            name: nameParts.join(" / "),
            sku: "",
            stock_quantity: 0,
            price_override: "",
            attributes: {
              ...(size ? { size } : {}),
              ...(color ? { color } : {}),
            },
          }
        );
      }
    }
    setVariants(newVariants);
  };

  useEffect(() => {
    if (!editId) generateVariants();
  }, [selectedSizes, selectedColors]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSave = async () => {
    const slug = form.slug || generateSlug(form.name);
    if (!form.category_id) {
      toast.error("Selecione o Gênero / Categoria principal.");
      return;
    }
    const payload = {
      name: form.name,
      slug,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      description: form.description || null,
      is_active: form.is_active,
      is_new: form.is_new,
      category_id: form.category_id,
    };

    let error;
    let productId = editId;

    if (editId) {
      ({ error } = await supabase.from("products").update(payload).eq("id", editId));
    } else {
      const res = await supabase.from("products").insert(payload).select("id").single();
      error = res.error;
      productId = res.data?.id || null;
    }

    if (error) {
      toast.error(error.message);
      return;
    }

    // Save variants
    if (productId && variants.length > 0) {
      // Delete old variants if editing
      if (editId) {
        await supabase.from("product_variants").delete().eq("product_id", productId);
      }
      const variantPayloads = variants.map((v) => ({
        product_id: productId!,
        name: v.name,
        sku: v.sku || null,
        stock_quantity: v.stock_quantity,
        price_override: v.price_override ? parseFloat(v.price_override) : null,
        attributes: v.attributes,
        is_active: true,
      }));
      const { error: vError } = await supabase.from("product_variants").insert(variantPayloads);
      if (vError) {
        toast.error("Erro ao salvar variações: " + vError.message);
        return;
      }
    } else if (productId && editId && variants.length === 0) {
      await supabase.from("product_variants").delete().eq("product_id", productId);
    }

    toast.success(editId ? "Produto atualizado!" : "Produto criado!");
    onOpenChange(false);
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editId ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Preço</Label>
              <Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div>
              <Label>Preço original</Label>
              <Input type="number" step="0.01" value={form.original_price} onChange={(e) => setForm({ ...form, original_price: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Estoque (geral)</Label>
            <Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>

          {/* Gênero / Categoria principal */}
          <div>
            <Label className="mb-2 block">Gênero / Categoria principal *</Label>
            <div className="flex flex-wrap gap-2">
              {MAIN_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setForm({ ...form, category_id: cat.id })}
                  className={`rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                    form.category_id === cat.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              <Label>Ativo</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_new} onCheckedChange={(v) => setForm({ ...form, is_new: v })} />
              <Label>Marcar como Novo</Label>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <Label className="mb-2 block">Tamanhos disponíveis</Label>
            <div className="flex flex-wrap gap-2">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedSizes.includes(size)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <Label className="mb-2 block">Cores disponíveis</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  onClick={() => toggleColor(color.label)}
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedColors.includes(color.label)
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className="inline-block h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </button>
              ))}
            </div>
          </div>

          {/* Variants table */}
          {variants.length > 0 && (
            <div>
              <Label className="mb-2 block">Variações ({variants.length})</Label>
              <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-border p-2">
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="min-w-[100px] font-medium text-foreground">{v.name}</span>
                    <Input
                      placeholder="Estoque"
                      type="number"
                      className="h-7 w-20 text-xs"
                      value={v.stock_quantity}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], stock_quantity: parseInt(e.target.value) || 0 };
                        setVariants(updated);
                      }}
                    />
                    <Input
                      placeholder="Preço (opcional)"
                      type="number"
                      step="0.01"
                      className="h-7 w-24 text-xs"
                      value={v.price_override}
                      onChange={(e) => {
                        const updated = [...variants];
                        updated[i] = { ...updated[i], price_override: e.target.value };
                        setVariants(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {editId && (selectedSizes.length > 0 || selectedColors.length > 0) && (
            <Button variant="outline" size="sm" onClick={generateVariants} className="w-full">
              Regerar Variações
            </Button>
          )}

          <Button onClick={handleSave} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
            {editId ? "Salvar Alterações" : "Criar Produto"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;
