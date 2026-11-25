import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

import { api } from "../api";
import fundo from "../assets/tipos.png";
import escritorio from "../assets/escritorio1 1.png";
import hero from "../assets/b4b7a069-6e24-47de-8b82-08aea7fa4b60.png";

const areas = [
  "Constitucional",
  "Administração",
  "Parcerias Público-Privado",
  "Relações Governamentais",
  "Probidade Administrativa",
  "Elaboração de Pareceres, Opiniões Legais e Consultas",
  "Atuações nos Tribunais de Contas",
  "Contencioso Judicial e Administrativo",
  "Cível",
  "Penal",
  "Empresarial",
  "Licitações e Contratos",
  "Ações Coletivas e Inquéritos Civis",
  "Recuperação Judicial e Falências",
];

const violencias = [
  {
    titulo: "Violência física",
    descricao:
      "É qualquer conduta que ofenda a integridade ou a saúde corporal de uma pessoa. Manifesta-se por meio de atos explícitos de força, como empurrões, socos, chutes, tapas, queimaduras ou o uso de armas. É a forma mais visível de agressão porque costuma deixar marcas, hematomas ou ferimentos físicos aparentes no corpo da vítima.",
  },
  {
    titulo: "Violência sexual",
    descricao:
      "Consiste em presenciar, manter ou forçar a participação em relações sexuais não consensuais, mediante coerção, força ou ameaça. Também abrange o impedimento do uso de métodos contraceptivos, o aborto forçado, o casamento forçado e a exploração por meio da prostituição. Ocorre inclusive dentro de casamentos ou relacionamentos afetivos estáveis.",
  },
  {
    titulo: "Violência moral",
    descricao:
      "Caracteriza-se por ações que configuram calúnia, difamação ou injúria, atacando diretamente a honra da pessoa. Ocorre quando o agressor faz acusações falsas, espalha boatos maliciosos, xinga ou expõe a vida íntima da vítima publicamente. O objetivo principal é desmoralizar o indivíduo perante a sociedade, amigos e familiares.",
  },
  {
    titulo: "Violência política",
    descricao:
      "Trata-se de agressões, ameaças, humilhações ou perseguições que visam impedir ou restringir os direitos políticos de alguém. É muito frequente contra mulheres que ocupam ou disputam cargos públicos, buscando silenciá-las ou questionar sua capacidade intelectual. Manifesta-se por meio de ofensas machistas e barreiras institucionais estruturais.",
  },
  {
    titulo: "Violência virtual",
    descricao:
      "Ocorre no ambiente digital e é praticada por meio da internet, redes sociais, e-mails ou aplicativos de mensagem. Envolve a disseminação de discursos de ódio, vazamento de fotos íntimas, linchamentos virtuais, perseguição online (cyberstalking) e criação de perfis falsos para ridicularizar a vítima. A velocidade da rede amplia o sofrimento e o alcance do ataque.",
  },
  {
    titulo: "Violência psicológica",
    descricao:
      "É qualquer comportamento que cause dano emocional, diminuição da autoestima ou controle das ações da vítima. Inclui ameaças constantes, humilhações, chantagens, isolamento social forçado e manipulações mentais (gaslighting). Esse abuso faz com que a pessoa passe a duvidar da sua própria capacidade e sanidade mental.",
  },
  {
    titulo: "Violência patrimonial",
    descricao:
      "Configura-se pela retenção, subtração ou destruição de bens, recursos econômicos ou documentos pessoais. Manifesta-se quando o agressor quebra objetos de valor, rasga documentos, controla o salário da vítima ou esconde instrumentos de trabalho. Funciona como uma ferramenta de controle para gerar extrema dependência financeira.",
  },
  {
    titulo: "Violência doméstica",
    descricao:
      "É aquela que acontece dentro do ambiente do lar ou em relações familiares, independentemente do parentesco de sangue. Pode englobar todos os outros tipos de violência (física, moral, psicológica, etc.) praticados por parceiros, ex-parceiros ou parentes. Baseia-se no abuso de poder e nos vínculos de afeto ou coabitação.",
  },
  {
    titulo: "Violência institucional",
    descricao:
      "É a agressão ou discriminação praticada por agentes públicos ou instituições do Estado no exercício de suas funções. Ocorre por meio de atendimento negligente, burocracia excessiva para negar direitos, humilhações em repartições públicas ou omissão de socorro. Acaba perpetuando as desigualdades sociais e a exclusão dos cidadãos.",
  },
  {
    titulo: "Violência obstétrica",
    descricao:
      "Consiste em abusos, maus-tratos, humilhações e intervenções médicas desnecessárias ou não consentidas durante a gestação, parto ou pós-parto. Inclui a negação de anestesia, ofensas verbais da equipe médica e a realização de procedimentos dolorosos sem justificativa científica real. Desrespeita a autonomia da gestante em um momento de extrema vulnerabilidade.",
  },
];

const seta =
  "flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#d9a63e] bg-white text-[#360e53] transition hover:border-[#FF7043] hover:bg-[#FF7043] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#360e53]";

/* Animações da home. Ficam desligadas para quem usa "reduzir movimento". */
const estilos = `
@keyframes rm-subir {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes rm-pulso {
  0%   { box-shadow: 0 0 0 0 rgba(255, 20, 20, 0.55); }
  70%  { box-shadow: 0 0 0 16px rgba(255, 20, 20, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 20, 20, 0); }
}
@keyframes rm-abrir {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: no-preference) {
  .rm-subir { animation: rm-subir 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .rm-pulso { animation: rm-pulso 2.4s ease-out infinite; }
  .rm-abrir { animation: rm-abrir 0.3s ease-out both; }
}
`;

function Titulo({ children, escuro = false }) {
  return (
    <div className="mb-6 flex gap-2">
      <span
        className={`w-1 shrink-0 rounded-full ${
          escuro ? "bg-[#FFAB0B]" : "bg-[#FF7043]"
        }`}
      />
      <h2
        className={`text-2xl font-bold leading-tight sm:text-3xl ${
          escuro ? "text-white" : "text-[#FF7043]"
        }`}
      >
        {children}
      </h2>
    </div>
  );
}

function Hero() {
  return (
    <div className="relative flex min-h-[559px] items-end overflow-hidden bg-[#ffefa7]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${hero})` }}
        aria-hidden="true"
      />
      {/* Degradê só na base, para o texto ler bem sem esconder a imagem */}
      <div
        className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#360E53]/85 via-[#360E53]/40 to-transparent"
        aria-hidden="true"
      />

      <div className="rm-subir relative z-[1] w-full px-8 pb-10 sm:px-20 sm:pb-14">
        <p className="mb-4 max-w-xl text-lg font-semibold leading-7 text-white sm:text-xl">
          Você não está sozinha. Entenda seus direitos e peça orientação
          jurídica com sigilo.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <NavLink
            className="rm-pulso inline-block rounded-[5rem] bg-[#FF1414] px-[2em] py-[1em] text-base font-semibold text-white no-underline transition hover:-translate-y-0.5 hover:bg-[#B40909] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            to="/denunciar"
          >
            Denuncie
          </NavLink>

          <a
            href="tel:180"
            className="inline-block rounded-[5rem] border border-white/70 bg-white/10 px-[1.6em] py-[0.9em] text-base font-semibold text-white no-underline backdrop-blur-sm transition hover:bg-white hover:text-[#360E53] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Ligue 180
          </a>
        </div>
      </div>
    </div>
  );
}

function FaixaEmergencia() {
  return (
    <div className="bg-[#360E53] px-6 py-3 text-center text-sm text-white md:px-10">
      Em risco agora? Ligue{" "}
      <a href="tel:190" className="font-bold text-[#FFAB0B] hover:underline">
        190
      </a>{" "}
      (Polícia Militar) ou{" "}
      <a href="tel:180" className="font-bold text-[#FFAB0B] hover:underline">
        180
      </a>{" "}
      (Central de Atendimento à Mulher).
    </div>
  );
}

function TiposDeViolencia() {
  const [aberto, setAberto] = useState(null);
  const atual = violencias.find((v) => v.titulo === aberto);

  function alternar(titulo) {
    setAberto((prev) => (prev === titulo ? null : titulo));
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {violencias.map((item) => {
          const ativo = item.titulo === aberto;

          return (
            <button
              key={item.titulo}
              type="button"
              onClick={() => alternar(item.titulo)}
              aria-expanded={ativo}
              aria-controls="descricao-violencia"
              className={`flex min-h-[56px] cursor-pointer items-center justify-center rounded-xl px-2 py-2 text-center text-sm font-semibold leading-5 transition duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#360e53] ${
                ativo
                  ? "-translate-y-0.5 bg-[#360E53] text-white shadow-lg"
                  : "bg-[#FFAB0B] text-white hover:-translate-y-0.5 hover:bg-[#F59E0B] hover:shadow-md"
              }`}
            >
              {item.titulo}
            </button>
          );
        })}
      </div>

      <div id="descricao-violencia" aria-live="polite">
        {atual ? (
          <div
            key={atual.titulo}
            className="rm-abrir mt-5 rounded-xl border-l-4 border-[#FF7043] bg-white p-5 shadow-lg"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-bold text-[#360E53]">
                {atual.titulo}
              </h3>
              <button
                type="button"
                onClick={() => setAberto(null)}
                aria-label="Fechar descrição"
                className="cursor-pointer rounded-full px-2 text-xl leading-none text-[#6f5a7c] hover:text-[#FF7043] focus-visible:outline-2 focus-visible:outline-[#360e53]"
              >
                ×
              </button>
            </div>
            <p className="mt-2 max-w-3xl text-base leading-7 text-gray-700">
              {atual.descricao}
            </p>
            <NavLink
              to="/denunciar"
              className="mt-4 inline-block text-sm font-semibold text-[#8048A9] hover:underline"
            >
              Passei por isso. Quero orientação
            </NavLink>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#6f5a7c]">
            Toque em um tipo para ler o que ele significa.
          </p>
        )}
      </div>
    </div>
  );
}

function Noticias() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef(null);

  useEffect(() => {
    api("/news")
      .then((dados) => setNews(dados.news || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function goTo(index) {
    const track = trackRef.current;

    if (!track || track.children.length === 0) return;

    const target = Math.min(Math.max(index, 0), track.children.length - 1);
    const card = track.children[target];

    track.scrollTo({
      left: card.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });

    setActiveIndex(target);
  }

  function handleScroll() {
    const track = trackRef.current;

    if (!track) return;

    let closest = 0;
    let minDistance = Infinity;

    Array.from(track.children).forEach((card, index) => {
      const distance = Math.abs(
        card.offsetLeft - track.offsetLeft - track.scrollLeft
      );

      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
      }
    });

    setActiveIndex(closest);
  }

  if (loading) {
    return (
      <div className="flex gap-4" aria-label="Carregando notícias">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-36 flex-1 animate-pulse rounded-xl bg-[#FFAB0B]/40"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-700">
        {error}
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#e7d7ee] px-5 py-10 text-center text-[#6f5a7c]">
        <h3 className="mb-1.5 text-lg font-bold text-[#241130]">
          Nenhuma notícia publicada
        </h3>
        <p className="m-0 text-base">
          Em breve a administração publicará novos conteúdos por aqui.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Carrossel de notícias"
      >
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex min-h-[9rem] shrink-0 basis-[88%] snap-start flex-col gap-2 rounded-xl bg-[#FFAB0B] p-4 text-white no-underline shadow-sm transition duration-200 hover:-translate-y-1 hover:bg-[#F59E0B] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#360e53] sm:basis-[calc((100%-1rem)/2)] md:basis-[calc((100%-2rem)/3)] lg:basis-[calc((100%-3rem)/4)] xl:basis-[calc((100%-4rem)/5)]"
          >
            <h3 className="m-0 break-words text-base font-bold leading-6 text-white">
              {item.title}
            </h3>
            <span className="mt-auto text-sm font-semibold text-white/90 transition group-hover:translate-x-1 group-hover:text-white">
              Ler notícia ↗
            </span>
          </a>
        ))}
      </div>

      {news.length > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {news.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ir para a notícia ${index + 1}`}
                className={`h-2 cursor-pointer rounded-full border-0 transition-all ${
                  index === activeIndex
                    ? "w-6 bg-[#FF7043]"
                    : "w-2 bg-[#d9a63e] hover:bg-[#FFAB0B]"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              className={seta}
              onClick={() => goTo(activeIndex - 1)}
              disabled={activeIndex === 0}
              aria-label="Notícia anterior"
            >
              ‹
            </button>
            <button
              type="button"
              className={seta}
              onClick={() => goTo(activeIndex + 1)}
              disabled={activeIndex >= news.length - 1}
              aria-label="Próxima notícia"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <div className="h-auto bg-[#F4E7F6]">
      <style>{estilos}</style>

      <section>
        <Hero />
        <FaixaEmergencia />
      </section>

      <section
        id="sobre"
        className="grid gap-8 bg-[#8048A9] px-6 py-12 text-white md:grid-cols-2 md:items-center md:px-10"
      >
        <div>
          <Titulo escuro>O Escritório</Titulo>
          <div className="space-y-4 text-base leading-7">
            <p>
              A RMVM Advogados tem como propósito oferecer orientação jurídica
              humanizada e acessível às mulheres, especialmente àquelas que
              vivenciam ou já vivenciaram situações de violência.
            </p>
            <p>
              O escritório busca unir conhecimento jurídico, escuta qualificada
              e atendimento personalizado, proporcionando informações claras
              sobre direitos e possíveis caminhos para a proteção e busca por
              Justiça. Por meio da Rede Mulher, a RMVM Advogados amplia esse
              compromisso, disponibilizando um espaço seguro para informação,
              identificação de diferentes formas de violência e solicitação de
              orientação jurídica.
            </p>
          </div>
        </div>

        <img
          className="mx-auto w-full max-w-md rounded-xl shadow-xl transition duration-500 hover:scale-[1.02]"
          src={escritorio}
          alt="Escritório da RMVM Advogados"
          loading="lazy"
        />
      </section>

      <section
        id="ar"
        className="bg-[#A67AC7] px-6 py-12 text-white md:px-10"
      >
        <Titulo escuro>Áreas de Atuação</Titulo>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {areas.map((area) => (
            <li
              key={area}
              className="rounded-lg border-l-4 border-[#FFAB0B] bg-white/10 px-4 py-3 text-base leading-6 transition duration-200 hover:translate-x-1 hover:bg-white/20"
            >
              {area}
            </li>
          ))}
        </ul>
      </section>

      <section
        id="violencia"
        className="relative flex min-h-[283px] items-center bg-[#ffefa7] px-6 py-12 md:px-10"
      >
        <div
          className="absolute inset-0 hidden bg-cover bg-center min-[767px]:block"
          style={{ backgroundImage: `url(${fundo})` }}
          aria-hidden="true"
        />

        <div className="relative z-[1] w-full">
          <Titulo>Tipos de Violência</Titulo>
          <TiposDeViolencia />
        </div>
      </section>

      <section
        id="noticias"
        className="scroll-mt-24 bg-[#ffefa7] px-6 py-12 md:px-10"
      >
        <div className="mx-auto max-w-6xl">
          <Titulo>Notícias</Titulo>
          <Noticias />
        </div>
      </section>
    </div>
  );
}
