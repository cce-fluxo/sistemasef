import { Ticker } from "@/components/Ticker";

// Conteúdo estático — sem tabela nova no banco. Textos são placeholder;
// a organização do evento deve customizar antes de publicar. As cores por
// seção vêm do protótipo (Figma): azul, laranja, amarelo e verde de marca.
const SECOES = [
  {
    titulo: "Como funciona",
    icone: "🎯",
    cor: "#4A5FCE",
    texto:
      "Escaneie o QR Code de estandes e palestras para registrar presença e ganhar pontos. Complete missões para pontos bônus extras e acompanhe sua posição no ranking.",
  },
  {
    titulo: "Pontuação",
    icone: "🏆",
    cor: "#E8521A",
    texto:
      "Cada estande e palestra vale pontos diferentes, definidos pela organização. O ranking é atualizado uma vez por dia, sempre à noite.",
  },
  {
    titulo: "Organização",
    icone: "🏛️",
    cor: "#F5C83C",
    texto: "Espaço reservado para a organização do evento se apresentar.",
  },
];

const TICKER_ITEMS = ["SEMANA FLUXO 021", "NOSSO JEITO DE FAZER O AMANHÃ", "DDD 021", "A RUA É A NOSSA ESCOLA"];

export default function SobrePage() {
  return (
    <div>
      <header className="header-gradient-info px-5 pt-12 pb-10 text-white">
        <p className="text-xs font-extrabold tracking-[0.15em] uppercase text-white/70">— Semana Fluxo 021 —</p>
        <h1 className="mt-3 font-display text-[38px] leading-[1.05] uppercase">Nosso jeito de fazer o amanhã</h1>
        <p className="mt-2 inline-block rounded-md bg-gold-400 px-3.5 py-1.5 font-heading text-[13px] font-bold tracking-wider uppercase text-navy-950">
          21ª Edição · DDD 021
        </p>
      </header>

      <Ticker items={TICKER_ITEMS} bgClassName="bg-info-500" textClassName="text-white" />

      <main className="px-5 py-7">
        <section className="relative overflow-hidden rounded-2xl border-2 border-brand-500 bg-brand-500/10 p-5">
          <span className="stripes absolute inset-0 opacity-30" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-[22px] uppercase text-gold-400">&ldquo;A rua é a nossa escola!&rdquo;</h2>
            <p className="mt-2 text-[15px] leading-[1.7] text-muted">
              O que o mercado chama de gestão de crise e resiliência, a gente treina todo dia — pegando ônibus lotado,
              ajustando a logística do campus e desenrolando problemas complexos.
            </p>
          </div>
        </section>

        <div className="mt-7 flex flex-col gap-4">
          {SECOES.map((secao) => (
            <section
              key={secao.titulo}
              className="rounded-2xl border border-l-4 bg-surface p-5"
              style={{ borderColor: `${secao.cor}30`, borderLeftColor: secao.cor }}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-2xl" aria-hidden>
                  {secao.icone}
                </span>
                <h2 className="font-heading text-lg font-bold uppercase" style={{ color: secao.cor }}>
                  {secao.titulo}
                </h2>
              </div>
              <p className="mt-2.5 text-sm leading-[1.7] text-muted">{secao.texto}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
