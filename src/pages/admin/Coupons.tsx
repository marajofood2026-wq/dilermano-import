import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  is_active: boolean;
  uses_count: number;
  max_uses: number | null;
}

const Coupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ code: "", discount_type: "percentage", discount_value: "", max_uses: "" });

  const fetchCoupons = async () => {
    const { data } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });
    setCoupons(data || []);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSave = async () => {
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: parseFloat(form.discount_value),
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
    };
    let error;
    if (editId) {
      ({ error } = await supabase.from("coupons").update(payload).eq("id", editId));
    } else {
      ({ error } = await supabase.from("coupons").insert(payload));
    }
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? "Cupom atualizado!" : "Cupom criado!");
    setDialogOpen(false);
    setEditId(null);
    setForm({ code: "", discount_type: "percentage", discount_value: "", max_uses: "" });
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cupom excluído!");
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Cupons</h1>
          <p className="mt-1 text-sm text-muted-foreground">{coupons.length} cupons</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditId(null); setForm({ code: "", discount_type: "percentage", discount_value: "", max_uses: "" }); } }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Novo Cupom
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>{editId ? "Editar" : "Novo"} Cupom</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Código</label>
                <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="DESCONTO10" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Tipo</label>
                <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Valor do desconto</label>
                <Input type="number" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Máx. usos (opcional)</label>
                <Input type="number" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
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
              <TableHead>Código</TableHead>
              <TableHead>Desconto</TableHead>
              <TableHead>Usos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum cupom</TableCell>
              </TableRow>
            ) : (
              coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-medium text-foreground">{c.code}</TableCell>
                  <TableCell className="text-foreground">
                    {c.discount_type === "percentage" ? `${c.discount_value}%` : `R$ ${c.discount_value}`}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.uses_count}{c.max_uses ? `/${c.max_uses}` : ""}</TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.is_active ? "bg-[hsl(var(--badge-new))]/20 text-[hsl(var(--badge-new))]" : "bg-muted text-muted-foreground"}`}>
                      {c.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button onClick={() => { setForm({ code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), max_uses: c.max_uses ? String(c.max_uses) : "" }); setEditId(c.id); setDialogOpen(true); }} className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
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

export default Coupons;
