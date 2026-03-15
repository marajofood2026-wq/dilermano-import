import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Quais são as formas de pagamento?",
    a: "Aceitamos cartões de crédito (Visa, Master, Elo, Amex), PIX, boleto bancário e parcelamento em até 10x sem juros.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "O prazo varia de 3 a 15 dias úteis, dependendo da região. Produtos importados podem levar até 20 dias úteis.",
  },
  {
    q: "Como funciona a troca e devolução?",
    a: "Você tem até 30 dias após o recebimento para solicitar troca ou devolução. O produto deve estar em perfeitas condições, com etiquetas originais.",
  },
  {
    q: "Os produtos são originais?",
    a: "Sim! Todos os nossos produtos são 100% originais e importados diretamente dos fabricantes e distribuidores autorizados.",
  },
  {
    q: "Como rastrear meu pedido?",
    a: "Após a confirmação do envio, você receberá um e-mail com o código de rastreamento. Também pode acompanhar pela sua conta no site.",
  },
  {
    q: "Tem frete grátis?",
    a: "Sim! Oferecemos frete grátis para compras acima de R$ 299,00 para todo o Brasil.",
  },
  {
    q: "Posso cancelar meu pedido?",
    a: "O cancelamento pode ser solicitado em até 2 horas após a compra, desde que o pedido ainda não tenha sido enviado.",
  },
];

const FAQ = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container max-w-2xl pb-16 pt-28">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Perguntas Frequentes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Tire suas dúvidas sobre compras, entregas e mais.
        </p>

        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium text-foreground">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </main>
      <Footer />
    </div>
  );
};

export default FAQ;
