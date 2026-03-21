import { Link } from "react-router-dom";
import { Search, ShoppingBag, User, Menu, X, LogOut, Shield, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface NavCategory {
  id: string;
  name: string;
}

const staticLinks = [
  { label: "Novidades", href: "/categoria/novidades" },
];

const staticLinksEnd = [
  { label: "Promoções", href: "/categoria/promocoes" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems } = useCart();
  const [dbCategories, setDbCategories] = useState<NavCategory[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .eq("is_active", true)
        .order("sort_order");
      setDbCategories(data || []);
    };
    fetch();
  }, []);

  const navLinks = [
    ...staticLinks,
    ...dbCategories.map((c) => ({ label: c.name, href: `/categoria/${c.id}` })),
    ...staticLinksEnd,
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <button
          className="mr-3 text-foreground md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-foreground">DILERMANO</span>
          <span className="text-xs font-semibold tracking-widest text-gradient-ocean">IMPORT</span>
        </Link>

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

        <div className="flex items-center gap-4">
          <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Buscar">
            <Search size={20} />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Conta">
                  <User size={20} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/minha-conta" className="flex items-center gap-2">
                    <User size={14} /> Minha Conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/meus-pedidos" className="flex items-center gap-2">
                    <Package size={14} /> Meus Pedidos
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2">
                      <Shield size={14} /> Painel Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="flex items-center gap-2">
                  <LogOut size={14} /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground" aria-label="Conta">
              <User size={20} />
            </Link>
          )}

          <Link to="/carrinho" className="relative text-muted-foreground transition-colors hover:text-foreground" aria-label="Carrinho">
            <ShoppingBag size={20} />
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-ocean text-[10px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          </Link>
        </div>
      </div>

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
          {!user && (
            <Link
              to="/login"
              className="block py-3 text-sm font-medium text-primary transition-colors hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              Entrar / Cadastrar
            </Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
