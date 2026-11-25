import { useEffect, useRef, useState } from "react";

/* ---------- Revela o bloco quando ele entra na tela ---------- */
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

/* ---------- Ícones ---------- */
const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const EarIcon = () => (
  <svg {...iconProps}>
    <path d="M7 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.5" />
    <path d="M10 9a2 2 0 0 1 4 0" />
  </svg>
);
const HeartIcon = () => (
  <svg {...iconProps}>
    <path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z" />
  </svg>
);
const ShieldIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

/* ---------- Conteúdo ---------- */
const violences = [
  "Física",
  "Psicológica ou emocional",
  "Sexual",
  "Patrimonial",
  "Moral",
  "Doméstica e familiar",
  "Institucional",
  "Política",
  "Obstétrica",
  "Digital",
];

const pillars = [
  {
    icon: <EarIcon />,
    title: "Escuta",
    text: "Cada história é ouvida com atenção, seriedade e sensibilidade.",
  },
  {
    icon: <HeartIcon />,
    title: "Respeito",
    text: "Cada situação é analisada de forma individualizada, respeitando suas particularidades.",
  },
  {
    icon: <ShieldIcon />,
    title: "Informação segura",
    text: "Conhecimento claro sobre direitos e caminhos jurídicos disponíveis.",
  },
];

const values = ["Ética", "Responsabilidade", "Acolhimento", "Individualidade"];

export default function About() {
  return (
    <div className="bg-[#F4E7F6] text-[#17131c]">
      {/* ---------- Topo ---------- */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#360E53] via-[#4B057E] to-[#8048A9] px-6 py-16 text-white md:px-10 md:py-24">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#FFAB0B]/15 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-3xl">
          <Reveal>
            <div className="mb-5 flex items-center gap-3">
              <span className="h-10 w-1 rounded-full bg-[#FF7043]" />
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Sobre nós
              </h1>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-white/90">
              A RMVM Advogados é um escritório jurídico dedicado à proteção e à
              defesa dos direitos das mulheres.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <ul className="mt-8 flex flex-wrap gap-2">
              {values.map((value) => (
                <li
                  key={value}
                  className="rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm transition hover:bg-white/20"
                >
                  {value}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </header>

      <div className="px-6 py-12 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl space-y-14">
          {/* ---------- Quem somos ---------- */}
          <Reveal>
            <div className="space-y-4 text-base leading-7 md:text-lg md:leading-8">
              <p>
                A RMVM Advogados é um escritório jurídico dedicado à proteção e à
                defesa dos direitos das mulheres, com uma atuação pautada pela
                ética, responsabilidade, acolhimento e respeito à individualidade
                de cada caso.
              </p>
              <p>
                Acreditamos que o acesso à informação jurídica é um importante
                instrumento de proteção. Por isso, buscamos tornar o conhecimento
                sobre direitos e caminhos jurídicos mais claro e acessível,
                especialmente para mulheres que enfrentam situações de violência,
                vulnerabilidade ou violação de seus direitos.
              </p>
            </div>
          </Reveal>

          {/* ---------- Tipos de violência ---------- */}
          <Reveal>
            <div className="rounded-3xl bg-white p-6 shadow-[0_20px_50px_rgba(54,14,83,0.10)] sm:p-8">
              <h2 className="text-xl font-bold text-[#360E53] sm:text-2xl">
                Onde atuamos
              </h2>
              <p className="mt-3 text-base leading-7 text-[#4a3a57]">
                Nossa atuação contempla diferentes formas de violência contra a
                mulher:
              </p>

              <ul className="mt-5 flex flex-wrap gap-2.5">
                {violences.map((item) => (
                  <li
                    key={item}
                    className="cursor-default rounded-full border border-[#e0cde8] bg-[#F4E7F6] px-4 py-2 text-base font-medium text-[#4B057E] transition duration-200 hover:-translate-y-0.5 hover:border-[#8048A9] hover:bg-[#360E53] hover:text-white"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-l-4 border-[#FF7043] pl-4 text-base leading-7 text-[#4a3a57]">
                Cada situação é analisada de forma individualizada, considerando
                suas particularidades e as necessidades de cada mulher.
              </p>
            </div>
          </Reveal>

          {/* ---------- Nosso compromisso ---------- */}
          <section>
            <Reveal>
              <h2 className="mb-4 text-2xl font-bold text-[#360E53]">
                Nosso compromisso
              </h2>
              <div className="space-y-4 text-base leading-7 md:text-lg md:leading-8">
                <p>
                  Mais do que oferecer orientação jurídica, a RMVM Advogados
                  busca proporcionar um atendimento baseado na escuta, no
                  respeito e na informação segura. Nosso objetivo é auxiliar cada
                  mulher a compreender seus direitos, identificar as
                  possibilidades existentes e conhecer os instrumentos jurídicos
                  disponíveis para sua proteção.
                </p>
              </div>
            </Reveal>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {pillars.map((pillar, index) => (
                <Reveal key={pillar.title} delay={index * 120}>
                  <div className="group h-full rounded-2xl border border-[#e8d6ef] bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#8048A9] hover:shadow-[0_16px_40px_rgba(75,5,126,0.15)]">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F4E7F6] text-[#4B057E] transition duration-300 group-hover:bg-[#360E53] group-hover:text-[#FFAB0B]">
                      {pillar.icon}
                    </span>
                    <h3 className="mt-4 text-lg font-bold text-[#360E53]">
                      {pillar.title}
                    </h3>
                    <p className="mt-1.5 text-base leading-6 text-[#4a3a57]">
                      {pillar.text}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal className="mt-8">
              <p className="text-base leading-7 md:text-lg md:leading-8">
                Por meio da Rede Mulher, ampliamos esse compromisso ao
                disponibilizar um espaço de informação e orientação, permitindo
                que mulheres tenham acesso a conteúdos sobre os diferentes tipos
                de violência e possam solicitar orientação jurídica de maneira
                simples e acessível.
              </p>
            </Reveal>
          </section>

          {/* ---------- Informação, acolhimento e Justiça ---------- */}
          <Reveal>
            <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#360E53] via-[#4B057E] to-[#8048A9] p-7 text-white shadow-[0_24px_60px_rgba(54,14,83,0.25)] sm:p-10">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFAB0B]/20 blur-3xl"
              />
              <div className="relative">
                <h2 className="text-2xl font-bold">
                  Informação, acolhimento e Justiça
                </h2>
                <p className="mt-4 text-base leading-7 text-white/90 md:text-lg md:leading-8">
                  Entendemos que cada história possui suas particularidades e
                  merece ser tratada com seriedade e sensibilidade. A RMVM
                  Advogados trabalha para aproximar o conhecimento jurídico de
                  quem precisa dele, contribuindo para que mais mulheres
                  conheçam seus direitos e possam buscar os caminhos adequados
                  para sua proteção.
                </p>

                <p className="mt-7 flex gap-3 border-t border-white/20 pt-6 text-lg font-semibold">
                  <span className="mt-1 h-6 w-1 shrink-0 rounded-full bg-[#FFAB0B]" />
                  RMVM Advogados — informação, orientação e proteção para
                  mulheres.
                </p>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
