import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";

const navLinks = [
  { label: "Novidades", href: "/novidades" },
  { label: "Masculino", href: "/masculino" },
  { label: "Feminino", href: "/feminino" },
  { label: "Acessórios", href: "/acessorios" },
  { label: "Promoções", href: "/promocoes" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile menu button */}
        <button
          className="mr-3 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            DILERMANO
          </span>
          <span className="text-xs font-semibold tracking-widest text-gradient-ocean">
            IMPORT
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Buscar">
            <Search size={20} />
          </button>
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Conta">
            <User size={20} />
          </button>
          <button className="relative text-muted-foreground transition-colors hover:text-foreground" aria-label="Carrinho">
            <ShoppingBag size={20} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-ocean text-[10px] font-bold text-primary-foreground">
              0
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t border-border bg-background px-6 py-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="block py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
