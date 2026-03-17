import { Link } from "react-router-dom";
import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
  </svg>
);

const Footer = () => {
  const whatsappUrl = "https://wa.me/5591983997964";

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
              Vista atitude. Use estilo.<br />
              As melhores tendências em roupas, calçados e acessórios.<br />
              Qualidade, estilo e preço justo em um só lugar.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="https://www.instagram.com/dilermanocarmo" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.facebook.com/share/1HYXZNvxbh/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="Facebook">
                <Facebook size={18} />
              </a>
              <a href="https://www.tiktok.com/@lojadilermanoimports" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition-colors hover:text-primary" aria-label="TikTok">
                <TikTokIcon />
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

            <h4 className="mb-3 mt-6 text-sm font-semibold text-foreground">Ajuda</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="transition-colors hover:text-foreground">FAQ</Link></li>
              <li>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-foreground">
                  Trocas e Devoluções
                </a>
              </li>
              <li><a href="#" className="transition-colors hover:text-foreground">Rastrear Pedido</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Contato</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-primary" />
                <a href="tel:+5591983997964" className="transition-colors hover:text-foreground">(91) 98399-7964</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="shrink-0 text-primary" />
                <a href="tel:+5591985171639" className="transition-colors hover:text-foreground">(91) 98517-1639</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="shrink-0 text-primary" />
                <a href="mailto:dilermano3535@gmail.com" className="transition-colors hover:text-foreground">dilermano3535@gmail.com</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0 text-primary" />
                <span>
                  Rua Primeiro de Maio, 371<br />
                  Bairro Bosque – Portel/PA<br />
                  CEP: 68480-029
                </span>
              </li>
            </ul>
          </div>

          {/* Company info */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Empresa</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="text-xs font-medium text-muted-foreground/70">Razão Social</span>
                <p>D S DO CARMO COMERCIO DE VESTUARIO</p>
              </li>
              <li>
                <span className="text-xs font-medium text-muted-foreground/70">Nome Fantasia</span>
                <p>LOJA DILERMANO</p>
              </li>
              <li>
                <span className="text-xs font-medium text-muted-foreground/70">CNPJ</span>
                <p>51.178.777/0001-81</p>
              </li>
            </ul>

            <h4 className="mb-3 mt-6 text-sm font-semibold text-foreground">Newsletter</h4>
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
          © 2026 DILERMANO IMPORT. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
