import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

interface PromoBanner {
  id: string;
  title: string;
  subtitle: string | null;
  button_text: string | null;
  button_link: string | null;
  value: number | null;
  is_active: boolean;
  max_installments: number | null;
}

const AdminSettings = () => {
  const [banner, setBanner] = useState<PromoBanner | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanner = async () => {
    const { data } = await supabase
      .from("promo_banner")
      .select("*")
      .limit(1)
      .single();
    setBanner(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchBanner(); }, []);

  const handleSave = async () => {
    if (!banner) return;
    setSaving(true);
    const { error } = await supabase
      .from("promo_banner")
      .update({
        title: banner.title,
        subtitle: banner.subtitle,
        button_text: banner.button_text,
        button_link: banner.button_link,
        value: banner.value,
        is_active: banner.is_active,
        max_installments: banner.max_installments,
      })
      .eq("id", banner.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Banner promocional atualizado!");
  };

  if (loading) return <div className="text-muted-foreground">Carregando...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">Configurações gerais do sistema</p>

      {/* Promo Banner Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Banner Promocional (CTA)</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Controle o banner amarelo que aparece na página inicial antes do rodapé.
        </p>

        {banner && (
          <div className="mt-4 space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">Ativar banner</label>
              <Switch
                checked={banner.is_active}
                onCheckedChange={(v) => setBanner({ ...banner, is_active: v })}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Título *</label>
              <Input
                value={banner.title}
                onChange={(e) => setBanner({ ...banner, title: e.target.value })}
                placeholder="Ex: Frete grátis acima de R$ 299"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Subtítulo</label>
              <Textarea
                value={banner.subtitle || ""}
                onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })}
                placeholder="Ex: Aproveite condições especiais..."
                rows={2}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Valor (R$)</label>
              <Input
                type="number"
                value={banner.value ?? ""}
                onChange={(e) => setBanner({ ...banner, value: parseFloat(e.target.value) || 0 })}
                placeholder="299"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Texto do botão</label>
                <Input
                  value={banner.button_text || ""}
                  onChange={(e) => setBanner({ ...banner, button_text: e.target.value })}
                  placeholder="Comprar Agora"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Link do botão</label>
                <Input
                  value={banner.button_link || ""}
                  onChange={(e) => setBanner({ ...banner, button_link: e.target.value })}
                  placeholder="/novidades"
                />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="bg-gradient-ocean text-primary-foreground hover:opacity-90">
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
