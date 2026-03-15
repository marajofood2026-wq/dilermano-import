import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-foreground">DILERMANO</span>
              <span className="text-xs font-semibold tracking-widest text-gradient-ocean">IMPORT</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Estilo importado com a qualidade que você merece. Surf, street e lifestyle.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Twitter">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Loja</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/masculino" className="transition-colors hover:text-foreground">Masculino</Link></li>
              <li><Link to="/feminino" className="transition-colors hover:text-foreground">Feminino</Link></li>
              <li><Link to="/acessorios" className="transition-colors hover:text-foreground">Acessórios</Link></li>
              <li><Link to="/promocoes" className="transition-colors hover:text-foreground">Promoções</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Ajuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="transition-colors hover:text-foreground">FAQ</Link></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Trocas e Devoluções</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Rastrear Pedido</a></li>
              <li><a href="#" className="transition-colors hover:text-foreground">Contato</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Newsletter</h4>
            <p className="mb-3 text-sm text-muted-foreground">Receba ofertas exclusivas</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
              />
              <button className="rounded-md bg-gradient-ocean px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
                OK
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Dilermano Import. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
