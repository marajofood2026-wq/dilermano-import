import { Heart } from "lucide-react";

interface ProductCardProps {
  image: string;
  name: string;
  price: number;
  originalPrice?: number;
  badge?: "novo" | "sale";
  category: string;
}

const ProductCard = ({ image, name, price, originalPrice, badge, category }: ProductCardProps) => {
  const formatPrice = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:shadow-card-hover">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge */}
        {badge === "novo" && (
          <span className="absolute left-3 top-3 rounded-sm bg-[hsl(var(--badge-new))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Novo
          </span>
        )}
        {badge === "sale" && (
          <span className="absolute left-3 top-3 rounded-sm bg-[hsl(var(--badge-sale))] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
            Sale
          </span>
        )}

        {/* Wishlist */}
        <button
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-background/60 text-muted-foreground opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:text-primary"
          aria-label="Favoritar"
        >
          <Heart size={16} />
        </button>

        {/* Quick add */}
        <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="w-full rounded-md bg-gradient-ocean py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{category}</p>
        <h3 className="mt-1 text-sm font-medium text-foreground">{name}</h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">{formatPrice(price)}</span>
          {originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
