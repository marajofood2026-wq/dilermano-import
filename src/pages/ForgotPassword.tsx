import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Email de recuperação enviado!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="text-xl font-extrabold tracking-tight text-foreground">DILERMANO</span>
          <span className="text-xs font-semibold tracking-widest text-gradient-ocean">IMPORT</span>
        </Link>

        <div className="rounded-lg border border-border bg-card p-6">
          <h1 className="text-lg font-bold text-foreground">Recuperar Senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {sent ? "Verifique seu email" : "Enviaremos um link para redefinir sua senha"}
          </p>

          {!sent && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gradient-ocean text-primary-foreground hover:opacity-90">
                {loading ? "Enviando..." : "Enviar Link"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Voltar ao login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
