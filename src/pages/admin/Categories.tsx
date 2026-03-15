import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", sort_order: "0" });

  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || generateSlug(form.name),
      sort_order: parseInt(form.sort_order) || 0,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("categories").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("categories").insert(payload));
    }
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Categoria atualizada!" : "Categoria criada!");
    setDialogOpen(false);
    setEditId(null);
    setForm({ name: "", slug: "", sort_order: "0" });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Categoria excluída!");
    fetchCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Categorias</h1>
          <p className="mt-1 text-sm text-muted-foreground">{categories.length} categorias</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditId(null); setForm({ name: "", slug: "", sort_order: "0" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar" : "Nova"} Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Nome</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Slug</label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ordem</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <Button onClick={handleSave} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Slug</TableHead>
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
                  <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.slug}</TableCell>
                  <TableCell className="text-foreground">{c.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => { setForm({ name: c.name, slug: c.slug, sort_order: String(c.sort_order) }); setEditId(c.id); setDialogOpen(true); }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
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
