import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { User, MapPin, Plus, Trash2, Star, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Profile {
  full_name: string | null;
  phone: string | null;
  cpf: string | null;
}

interface Address {
  id: string;
  label: string | null;
  zip_code: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  is_default: boolean | null;
}

const MyAccount = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile>({ full_name: "", phone: "", cpf: "" });
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Address dialog
  const [addrDialogOpen, setAddrDialogOpen] = useState(false);
  const [editAddrId, setEditAddrId] = useState<string | null>(null);
  const [addrForm, setAddrForm] = useState({
    label: "Casa",
    zip_code: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
  });

  const fetchData = async () => {
    if (!user) return;
    const [profileRes, addrRes] = await Promise.all([
      supabase.from("profiles").select("full_name, phone, cpf").eq("user_id", user.id).maybeSingle(),
      supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false }),
    ]);
    if (profileRes.data) setProfile(profileRes.data);
    setAddresses((addrRes.data as Address[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleProfileSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profile.full_name, phone: profile.phone, cpf: profile.cpf })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
    } else {
      toast.success("Perfil atualizado!");
    }
  };

  const lookupCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddrForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch {}
  };

  const resetAddrForm = () => {
    setAddrForm({ label: "Casa", zip_code: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
    setEditAddrId(null);
  };

  const handleAddrSave = async () => {
    if (!user) return;
    const payload = { ...addrForm, user_id: user.id };
    let error;
    if (editAddrId) {
      ({ error } = await supabase.from("addresses").update(payload).eq("id", editAddrId));
    } else {
      ({ error } = await supabase.from("addresses").insert(payload));
    }
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editAddrId ? "Endereço atualizado!" : "Endereço adicionado!");
      setAddrDialogOpen(false);
      resetAddrForm();
      fetchData();
    }
  };

  const handleAddrEdit = (a: Address) => {
    setAddrForm({
      label: a.label || "Casa",
      zip_code: a.zip_code,
      street: a.street,
      number: a.number,
      complement: a.complement || "",
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
    });
    setEditAddrId(a.id);
    setAddrDialogOpen(true);
  };

  const handleAddrDelete = async (id: string) => {
    const { error } = await supabase.from("addresses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Endereço removido!");
      fetchData();
    }
  };

  const handleSetDefault = async (id: string) => {
    if (!user) return;
    // Remove default from all, then set this one
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    toast.success("Endereço padrão atualizado!");
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container flex min-h-[60vh] items-center justify-center pt-16">
          <p className="text-muted-foreground">Carregando...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container pb-16 pt-24">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Minha Conta</h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>

        {/* Profile Section */}
        <section className="mt-8">
          <div className="flex items-center gap-2 mb-4">
            <User size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Dados Pessoais</h2>
          </div>
          <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Nome completo</label>
              <Input
                value={profile.full_name || ""}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Telefone</label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="(11) 99999-9999"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">CPF</label>
              <Input
                value={profile.cpf || ""}
                onChange={(e) => setProfile({ ...profile, cpf: e.target.value })}
                placeholder="000.000.000-00"
              />
            </div>
            <Button
              onClick={handleProfileSave}
              disabled={saving}
              className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90"
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </section>

        {/* Addresses Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              <h2 className="text-lg font-bold text-foreground">Meus Endereços</h2>
            </div>
            <Button
              size="sm"
              onClick={() => { resetAddrForm(); setAddrDialogOpen(true); }}
              className="bg-gradient-ocean text-primary-foreground hover:opacity-90"
            >
              <Plus size={14} className="mr-1" /> Novo Endereço
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <MapPin className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">Nenhum endereço cadastrado</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {addresses.map((a) => (
                <div
                  key={a.id}
                  className={`relative rounded-lg border p-4 ${a.is_default ? "border-primary bg-primary/5" : "border-border bg-card"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground">{a.label || "Endereço"}</span>
                        {a.is_default && (
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                            Padrão
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {a.street}, {a.number}{a.complement ? ` - ${a.complement}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {a.neighborhood} — {a.city}/{a.state}
                      </p>
                      <p className="text-xs text-muted-foreground">CEP: {a.zip_code}</p>
                    </div>
                    <div className="flex gap-1">
                      {!a.is_default && (
                        <button
                          onClick={() => handleSetDefault(a.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Definir como padrão"
                        >
                          <Star size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleAddrEdit(a)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleAddrDelete(a.id)}
                        className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />

      {/* Address Dialog */}
      <Dialog open={addrDialogOpen} onOpenChange={(v) => { setAddrDialogOpen(v); if (!v) resetAddrForm(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editAddrId ? "Editar Endereço" : "Novo Endereço"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Apelido</label>
              <Input
                value={addrForm.label}
                onChange={(e) => setAddrForm({ ...addrForm, label: e.target.value })}
                placeholder="Ex: Casa, Trabalho"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">CEP</label>
              <Input
                value={addrForm.zip_code}
                onChange={(e) => setAddrForm({ ...addrForm, zip_code: e.target.value })}
                onBlur={(e) => lookupCep(e.target.value)}
                placeholder="00000-000"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Rua</label>
                <Input value={addrForm.street} onChange={(e) => setAddrForm({ ...addrForm, street: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Número</label>
                <Input value={addrForm.number} onChange={(e) => setAddrForm({ ...addrForm, number: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Complemento</label>
              <Input
                value={addrForm.complement}
                onChange={(e) => setAddrForm({ ...addrForm, complement: e.target.value })}
                placeholder="Apto, Bloco..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Bairro</label>
              <Input value={addrForm.neighborhood} onChange={(e) => setAddrForm({ ...addrForm, neighborhood: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="mb-1 block text-sm font-medium text-foreground">Cidade</label>
                <Input value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">UF</label>
                <Input value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} maxLength={2} />
              </div>
            </div>
            <Button
              onClick={handleAddrSave}
              className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90"
            >
              {editAddrId ? "Salvar Alterações" : "Adicionar Endereço"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyAccount;
