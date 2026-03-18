import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  sort_order: number;
  position: string | null;
}

const Banners = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", subtitle: "", image_url: "", link_url: "", sort_order: "0", is_active: true,
  });

  const fetchBanners = async () => {
    const { data } = await supabase.from("banners").select("*").order("sort_order");
    setBanners(data || []);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.image_url) {
      toast.error("Título e URL da imagem são obrigatórios");
      return;
    }
    const payload = {
      title: form.title,
      subtitle: form.subtitle || null,
      image_url: form.image_url,
      link_url: form.link_url || null,
      sort_order: parseInt(form.sort_order) || 0,
      is_active: form.is_active,
      position: "hero" as const,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("banners").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("banners").insert(payload));
    }
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Banner atualizado!" : "Banner criado!");
    resetForm();
    fetchBanners();
  };

  const resetForm = () => {
    setDialogOpen(false);
    setEditId(null);
    setForm({ title: "", subtitle: "", image_url: "", link_url: "", sort_order: "0", is_active: true });
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    fetchBanners();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Banner excluído!");
    fetchBanners();
  };

  const openEdit = (b: Banner) => {
    setForm({
      title: b.title,
      subtitle: b.subtitle || "",
      image_url: b.image_url,
      link_url: b.link_url || "",
      sort_order: String(b.sort_order),
      is_active: b.is_active,
    });
    setEditId(b.id);
    setDialogOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Banners / Carrossel</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {banners.length} banners — Os banners ativos com posição "hero" aparecem no carrossel da home (máx. 5)
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { if (!v) resetForm(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Novo Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar" : "Novo"} Banner</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Título *</label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Subtítulo</label>
                <Input value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">URL da imagem *</label>
                <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Link (opcional)</label>
                <Input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/masculino ou https://..." />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Ordem</label>
                <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Ativo</label>
                <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
              </div>
              <Button onClick={handleSave} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagem</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead>Ordem</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum banner</TableCell>
              </TableRow>
            ) : (
              banners.map((b) => (
                <TableRow key={b.id}>
                  <TableCell>
                    <img src={b.image_url} alt={b.title} className="h-12 w-20 rounded object-cover" />
                  </TableCell>
                  <TableCell className="font-medium text-foreground">{b.title}</TableCell>
                  <TableCell>
                    <Switch checked={b.is_active} onCheckedChange={() => toggleActive(b.id, b.is_active)} />
                  </TableCell>
                  <TableCell className="text-foreground">{b.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(b)} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(b.id)} className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
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

export default Banners;
