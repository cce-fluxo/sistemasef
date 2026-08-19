// Conteúdo estático — sem tabela nova no banco. Textos são placeholder;
// a organização do evento deve customizar antes de publicar.
const SECOES = [
  {
    titulo: "Como funciona",
    texto:
      "Durante os 5 dias de evento, escaneie o QR Code de estandes e palestras para registrar presença e ganhar pontos. Complete missões para pontos bônus extras e acompanhe sua posição no ranking.",
  },
  {
    titulo: "Pontuação",
    texto:
      "Cada estande e palestra vale pontos diferentes, definidos pela organização. O ranking é atualizado uma vez por dia, sempre à noite.",
  },
  {
    titulo: "Organização",
    texto: "Espaço reservado para a organização do evento se apresentar.",
  },
];

export default function SobrePage() {
  return (
    <div>
      <header className="header-gradient-info px-6 pb-10 pt-8 text-white">
        <p className="text-sm font-medium uppercase tracking-wide text-white/70">Sobre o evento</p>
        <h1 className="mt-1 font-display text-2xl font-bold">Nosso jeito de fazer o evento</h1>
      </header>

      <main className="flex flex-col gap-4 px-6 py-6">
        {SECOES.map((secao) => (
          <section
            key={secao.titulo}
            className="rounded-2xl border border-black/5 bg-surface p-5 shadow-sm dark:border-white/5"
          >
            <h2 className="font-display text-lg font-semibold text-foreground">{secao.titulo}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/70">{secao.texto}</p>
          </section>
        ))}
      </main>
    </div>
  );
}
