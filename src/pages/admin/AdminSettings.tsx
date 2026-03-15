const AdminSettings = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
      <p className="mt-1 text-sm text-muted-foreground">Configurações gerais do sistema</p>

      <div className="mt-6 rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Em breve: configurações de loja, integrações de pagamento e opções de envio.
        </p>
      </div>
    </div>
  );
};

export default AdminSettings;
