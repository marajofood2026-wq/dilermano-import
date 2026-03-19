import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ImageIcon, Trash2, Star, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface ProductImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  dimensions?: string;
}

interface ProductImageManagerProps {
  productId: string;
  onImagesChange?: () => void;
}

const MAX_IMAGES = 3;

const ProductImageManager = ({ productId, onImagesChange }: ProductImageManagerProps) => {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("product_images")
      .select("id, url, alt_text, is_primary, sort_order")
      .eq("product_id", productId)
      .order("sort_order");
    if (data) {
      const imgs = (data as any[]).map((img) => ({ ...img, dimensions: "" }));
      setImages(imgs);
      // Load dimensions
      imgs.forEach((img, idx) => {
        const el = new Image();
        el.onload = () => {
          setImages((prev) =>
            prev.map((p, i) =>
              i === idx ? { ...p, dimensions: `${el.naturalWidth}x${el.naturalHeight}` } : p
            )
          );
        };
        el.src = img.url;
      });
    }
  };

  useEffect(() => {
    if (productId) fetchImages();
  }, [productId]);

  const handleUpload = async (file: File) => {
    if (images.length >= MAX_IMAGES) {
      toast.error(`Máximo de ${MAX_IMAGES} imagens por produto`);
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${productId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file);
    if (uploadError) {
      toast.error("Erro no upload: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    const { error: dbError } = await supabase.from("product_images").insert({
      product_id: productId,
      url: urlData.publicUrl,
      is_primary: images.length === 0,
      sort_order: images.length,
    });
    if (dbError) toast.error("Erro ao salvar imagem: " + dbError.message);
    else {
      toast.success("Imagem enviada!");
      fetchImages();
      onImagesChange?.();
    }
    setUploading(false);
  };

  const handleDelete = async (img: ProductImage) => {
    const { error } = await supabase.from("product_images").delete().eq("id", img.id);
    if (error) {
      toast.error("Erro ao excluir: " + error.message);
      return;
    }
    toast.success("Imagem removida!");
    fetchImages();
    onImagesChange?.();
  };

  const handleSetPrimary = async (img: ProductImage) => {
    // Unset all primary
    await supabase
      .from("product_images")
      .update({ is_primary: false })
      .eq("product_id", productId);
    // Set this one
    await supabase
      .from("product_images")
      .update({ is_primary: true })
      .eq("id", img.id);
    toast.success("Imagem principal definida!");
    fetchImages();
    onImagesChange?.();
  };

  const handleReorder = async (index: number, direction: "up" | "down") => {
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= images.length) return;
    const updated = [...images];
    [updated[index], updated[swapIdx]] = [updated[swapIdx], updated[index]];
    // Update sort_order in DB
    await Promise.all(
      updated.map((img, i) =>
        supabase.from("product_images").update({ sort_order: i }).eq("id", img.id)
      )
    );
    fetchImages();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Imagens ({images.length}/{MAX_IMAGES})
        </span>
        {images.length < MAX_IMAGES && (
          <label className="cursor-pointer">
            <Button variant="outline" size="sm" asChild disabled={uploading}>
              <span>
                <ImageIcon className="mr-1 h-3 w-3" />
                {uploading ? "Enviando..." : "Adicionar"}
              </span>
            </Button>
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {images.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">Nenhuma imagem cadastrada</p>
      )}

      <div className="mt-2 space-y-2">
        {images.map((img, idx) => (
          <div key={img.id} className="flex items-center gap-3 rounded-md border border-border p-2">
            <img
              src={img.url}
              alt={img.alt_text || ""}
              className="h-14 w-14 rounded object-cover"
            />
            <div className="flex-1 text-xs">
              <p className="font-medium text-foreground">
                {img.is_primary && (
                  <span className="mr-1 rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                    PRINCIPAL
                  </span>
                )}
                Imagem {idx + 1}
              </p>
              {img.dimensions && (
                <p className="text-muted-foreground">{img.dimensions}</p>
              )}
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => handleReorder(idx, "up")}
                disabled={idx === 0}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                title="Mover para cima"
              >
                <ArrowUp size={12} />
              </button>
              <button
                onClick={() => handleReorder(idx, "down")}
                disabled={idx === images.length - 1}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                title="Mover para baixo"
              >
                <ArrowDown size={12} />
              </button>
              {!img.is_primary && (
                <button
                  onClick={() => handleSetPrimary(img)}
                  className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-amber-500"
                  title="Definir como principal"
                >
                  <Star size={12} />
                </button>
              )}
              <button
                onClick={() => handleDelete(img)}
                className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Excluir"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImageManager;
