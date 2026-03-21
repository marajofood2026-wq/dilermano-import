import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogTitle, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const MAX_CATEGORIES = 6;

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  image_url: string | null;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sort_order: "0" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem (JPG ou PNG)");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (categoryId: string): Promise<string | null> => {
    if (!imageFile) return null;
    const ext = imageFile.name.split(".").pop();
    const path = `categories/${categoryId}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, imageFile, { upsert: true });
    if (error) {
      toast.error("Erro ao enviar imagem: " + error.message);
      return null;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Informe o nome da categoria");
      return;
    }

    // Enforce limit when creating new
    if (!editId && categories.length >= MAX_CATEGORIES) {
      toast.error(`Limite máximo de ${MAX_CATEGORIES} categorias atingido`);
      return;
    }

    setSaving(true);
    const payload: any = {
      name: form.name,
      slug: editId ? undefined : generateSlug(form.name),
      sort_order: parseInt(form.sort_order) || 0,
    };
    // Remove undefined keys
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    let error;
    let categoryId = editId;

    if (editId) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", editId));
    } else {
      const { data, error: insertError } = await supabase.from("categories").insert(payload).select("id").single();
      error = insertError;
      categoryId = data?.id || null;
    }

    if (error) { toast.error(error.message); setSaving(false); return; }

    if (imageFile && categoryId) {
      const imageUrl = await uploadImage(categoryId);
      if (imageUrl) {
        await supabase.from("categories").update({ image_url: imageUrl }).eq("id", categoryId);
      }
    }

    toast.success(editId ? "Categoria atualizada!" : "Categoria criada!");
    setDialogOpen(false);
    resetForm();
    fetchCategories();
    setSaving(false);
  };

  const resetForm = () => {
    setEditId(null);
    setForm({ name: "", sort_order: "0" });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria excluída!");
    fetchCategories();
  };

  const openEdit = (c: Category) => {
    setForm({ name: c.name, sort_order: String(c.sort_order) });
    setEditId(c.id);
    setImageFile(null);
    setImagePreview(c.image_url || null);
    setDialogOpen(true);
  };

  const canCreate = categories.length < MAX_CATEGORIES;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} / {MAX_CATEGORIES} categorias</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild>
            <Button
              disabled={!canCreate && !editId}
              className="bg-gradient-ocean text-primary-foreground hover:opacity-90"
            >
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="flex max-h-[90vh] max-w-sm flex-col gap-0 overflow-hidden p-0 [&>button:last-child]:hidden">
            <div className="flex items-center justify-between border-b border-border bg-background px-6 py-4">
              <DialogTitle>{editId ? "Editar" : "Nova"} Categoria</DialogTitle>
              <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                <X className="h-4 w-4" />
                <span className="sr-only">Fechar</span>
              </DialogClose>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Ordem</label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Imagem de Capa</label>
                  <p className="mb-2 text-xs text-muted-foreground">
                    📐 Recomendado: <strong>800×1000 px</strong> (proporção 4:5) · JPG ou PNG · ~300 KB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative mt-2">
                      <img src={imagePreview} alt="Preview" className="h-40 w-full rounded-md border border-border object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        className="absolute right-2 top-2 rounded-full bg-background/80 p-1 text-foreground hover:bg-background"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-2 flex h-32 w-full items-center justify-center rounded-md border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Upload size={20} />
                        <span className="text-xs">Clique para enviar</span>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-border bg-background px-6 py-4">
              <Button onClick={handleSave} disabled={saving} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!canCreate && (
        <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          Limite máximo de {MAX_CATEGORIES} categorias atingido. Exclua uma para criar outra.
        </div>
      )}

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">Nenhuma categoria</TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {c.image_url ? (
                      <img src={c.image_url} alt={c.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">—</div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="text-foreground">{c.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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
    </div>
  );
};

export default Categories;
