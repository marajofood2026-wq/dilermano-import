import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  sort_order: number;
}

interface HeroCarouselProps {
  fallback: React.ReactNode;
}

const HeroCarousel = ({ fallback }: HeroCarouselProps) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from("banners")
        .select("id, title, subtitle, image_url, link_url, sort_order")
        .eq("is_active", true)
        .eq("position", "hero")
        .order("sort_order")
        .limit(5);
      setBanners(data || []);
      setLoading(false);
    };
    fetchBanners();
  }, []);

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
  }, [banners.length]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  // Loading: render nothing to avoid layout jump
  if (loading) return null;

  // No banners: show original hero
  if (banners.length === 0) return <>{fallback}</>;

  return (
    <section className="relative w-full overflow-hidden pt-16" style={{ minHeight: "85vh" }}>
      {banners.map((banner, i) => {
        return (
          <div
            key={banner.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-700 ease-in-out",
              i === current ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="h-full w-full object-cover"
              style={{ minHeight: "85vh" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-16 left-0 right-0 container z-20">
              <h2 className="text-2xl font-extrabold text-white sm:text-4xl lg:text-5xl drop-shadow-lg">
                {banner.title}
              </h2>
              {banner.subtitle && (
                <p className="mt-2 max-w-lg text-sm text-white/80 sm:text-base">
                  {banner.subtitle}
                </p>
              )}
              <button
                onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Comprar Agora
              </button>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-sm transition hover:bg-black/50"
            aria-label="Próximo"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === current ? "w-6 bg-white" : "w-2 bg-white/50"
                )}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default HeroCarousel;
