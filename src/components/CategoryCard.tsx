import { Link } from "react-router-dom";

interface CategoryCardProps {
  image: string;
  title: string;
  href: string;
}

const CategoryCard = ({ image, title, href }: CategoryCardProps) => {
  return (
    <Link
      to={href}
      className="group relative aspect-[3/4] overflow-hidden rounded-lg sm:aspect-[4/5]"
    >
      <img
        src={image}
        alt={title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
        <span className="mt-1 inline-block text-sm font-medium text-primary transition-colors group-hover:text-ocean-glow">
          Ver coleção →
        </span>
      </div>
    </Link>
  );
};

export default CategoryCard;
