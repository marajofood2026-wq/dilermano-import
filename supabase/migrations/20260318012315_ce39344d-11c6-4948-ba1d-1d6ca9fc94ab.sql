
CREATE TABLE public.promo_banner (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Frete grátis acima de R$ 299',
  subtitle text DEFAULT 'Aproveite condições especiais em toda a loja. Parcele em até 10x sem juros.',
  button_text text DEFAULT 'Comprar Agora',
  button_link text DEFAULT '/novidades',
  value numeric DEFAULT 299,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_banner ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Promo banner publicly viewable" ON public.promo_banner FOR SELECT TO public USING (true);
CREATE POLICY "Admins manage promo banner" ON public.promo_banner FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.promo_banner (title, subtitle, button_text, button_link, value, is_active)
VALUES ('Frete grátis acima de R$ 299', 'Aproveite condições especiais em toda a loja. Parcele em até 10x sem juros.', 'Comprar Agora', '/novidades', 299, true);
