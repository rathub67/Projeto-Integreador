import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

import { api, clearToken, clearUser, getUser } from "./api";
import { initials, roleLabel } from "./utils";
import logo from "./assets/download.png";

/* ---------- Ícones ---------- */
const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const MenuIcon = () => (
  <svg {...iconProps}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
const CloseIcon = () => (
  <svg {...iconProps}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const UserIcon = () => (
  <svg {...iconProps} width={18} height={18}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);

/* ---------- Estilos dos itens do menu ---------- */
const itemBase =
  "group relative flex items-center gap-2 whitespace-nowrap px-[0.6em] py-[1em] no-underline transition-colors duration-200 hover:text-[#FFAB0B] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#FFAB0B] xl:px-[1.3em] max-[824.98px]:w-full max-[824.98px]:border-l-4 max-[824.98px]:py-[1.1em] max-[824.98px]:pl-[2.2em] max-[824.98px]:pr-[1.5em]";
const itemOn = "text-[#FFAB0B] max-[824.98px]:border-[#FFAB0B] max-[824.98px]:bg-white/5";
const itemOff = "text-white/90 max-[824.98px]:border-transparent";

/* Linha dourada que cresce do centro (some no celular, onde vira barra lateral) */
function Sublinhado({ ativo }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-[0.6em] bottom-2 h-0.5 origin-center rounded-full bg-[#FFAB0B] transition-transform duration-300 max-[824.98px]:hidden xl:inset-x-[1.3em] ${
        ativo ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );
}

/* Link que leva a uma seção da Home (#ar, #violencia...) */
function AnchorLink({ id, ativo, onClick, children }) {
  return (
    <a
      href={`/#${id}`}
      onClick={onClick}
      aria-current={ativo ? "location" : undefined}
      className={`${itemBase} ${ativo ? itemOn : itemOff}`}
    >
      {children}
      <Sublinhado ativo={ativo} />
    </a>
  );
}

/* Link que leva a outra página (/conta, /admin) */
function PageLink({ to, onClick, children }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) => `${itemBase} ${isActive ? itemOn : itemOff}`}
    >
      {({ isActive }) => (
        <>
          {children}
          <Sublinhado ativo={isActive} />
        </>
      )}
    </NavLink>
  );
}

const secoes = [
  { id: "ar", texto: "Áreas de atuação" },
  { id: "violencia", texto: "Tipos de violência" },
  { id: "noticias", texto: "Notícias" },
  { id: "con", texto: "Contatos" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [ativo, setAtivo] = useState("");
  const { pathname } = useLocation();

  const user = getUser();
  const isAdmin = user?.role === "admin";

  async function sair() {
    try {
      await api("/auth/logout", "POST");
    } catch {
      clearToken();
    }

    clearToken();
    clearUser();
    window.location.href = "/";
  }

  const fechar = () => setOpen(false);

  /* Barra compacta ao rolar + destaque da seção que está na tela */
  useEffect(() => {
    let frame = 0;

    function calcular() {
      frame = 0;
      setScrolled(window.scrollY > 24);

      if (pathname !== "/") {
        setAtivo("");
        return;
      }

      const noFim =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;

      let atual = "";
      for (const { id } of secoes) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) atual = id;
      }
      setAtivo(noFim ? "con" : atual);
    }

    function aoRolar() {
      if (!frame) frame = requestAnimationFrame(calcular);
    }

    calcular();
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("resize", aoRolar);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("resize", aoRolar);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  /* Menu do celular: Esc fecha, trava a rolagem da página e fecha ao virar desktop */
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth > 824 && setOpen(false);
    const overflowAntes = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = overflowAntes;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      id="t"
      className={`sticky top-0 z-[110] flex items-center justify-between bg-[#360E53] px-4 text-base transition-all duration-300 xl:px-6 xl:text-[1.15rem] ${
        scrolled
          ? "h-[4.5rem] shadow-[0_10px_30px_rgba(20,4,34,0.45)]"
          : "h-[5.5rem]"
      }`}
    >
      {/* Âncoras não ficam escondidas sob a barra fixa; rolagem suave */}
      <style>{`
        html { scroll-padding-top: 5rem; }
        @media (prefers-reduced-motion: no-preference) {
          html { scroll-behavior: smooth; }
        }
      `}</style>

      <NavLink
        to="/"
        className="flex h-full shrink-0 items-center transition-transform duration-200 hover:scale-105"
        aria-label="RMVM Jurídica - Página inicial"
      >
        <img
          src={logo}
          alt="RMVM Jurídica"
          className={`block w-auto transition-all duration-300 ${
            scrolled
              ? "h-[3.6rem] max-[824.98px]:h-14"
              : "h-20 max-[824.98px]:h-[4.2rem]"
          }`}
        />
      </NavLink>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={open}
        className="ml-auto hidden cursor-pointer rounded-xl border border-white/20 bg-white/5 p-2.5 text-white transition hover:border-[#FFAB0B] hover:text-[#FFAB0B] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B] max-[824.98px]:block"
      >
        <MenuIcon />
      </button>

      {/* Fundo escurecido atrás do menu do celular */}
      <div
        onClick={fechar}
        aria-hidden="true"
        className={`fixed inset-0 z-[115] bg-black/55 transition-opacity duration-300 min-[825px]:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <nav
        aria-label="Menu principal"
        className={`flex flex-wrap items-center bg-[#360E53] max-[824.98px]:fixed max-[824.98px]:right-0 max-[824.98px]:top-0 max-[824.98px]:z-[120] max-[824.98px]:h-dvh max-[824.98px]:w-[min(80vw,20rem)] max-[824.98px]:flex-col max-[824.98px]:items-stretch max-[824.98px]:overflow-y-auto max-[824.98px]:border-l max-[824.98px]:border-white/15 max-[824.98px]:pt-2 max-[824.98px]:shadow-2xl max-[824.98px]:transition-[transform,visibility] max-[824.98px]:duration-300 ${
          open
            ? "max-[824.98px]:visible max-[824.98px]:translate-x-0"
            : "max-[824.98px]:invisible max-[824.98px]:translate-x-full"
        }`}
      >
        <button
          type="button"
          onClick={fechar}
          aria-label="Fechar menu"
          className="m-2 hidden cursor-pointer self-end rounded-xl border border-white/20 bg-white/5 p-2.5 text-white transition hover:border-[#FFAB0B] hover:text-[#FFAB0B] focus-visible:outline-2 focus-visible:outline-[#FFAB0B] max-[824.98px]:block"
        >
          <CloseIcon />
        </button>

        {!isAdmin &&
          secoes.map(({ id, texto }) => (
            <AnchorLink key={id} id={id} ativo={ativo === id} onClick={fechar}>
              {texto}
            </AnchorLink>
          ))}

        {user ? (
          <>
            <PageLink to="/conta" onClick={fechar}>
              Minha conta
            </PageLink>

            {isAdmin && (
              <PageLink to="/admin" onClick={fechar}>
                Painel admin
              </PageLink>
            )}

            <div className="ml-2 flex items-center gap-2 border-l border-white/20 py-1.5 pl-2 pr-2 xl:ml-3 xl:pl-3 max-[824.98px]:ml-0 max-[824.98px]:mt-2 max-[824.98px]:w-full max-[824.98px]:border-l-0 max-[824.98px]:border-t max-[824.98px]:border-white/20 max-[824.98px]:px-[2.2em] max-[824.98px]:py-[1em]">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FFAB0B] text-[0.75rem] font-bold text-[#3a2200] ring-2 ring-white/20"
                aria-hidden="true"
              >
                {initials(user.name)}
              </span>

              <span className="hidden max-w-36 flex-col leading-[1.15] text-white max-[824.98px]:flex max-[824.98px]:max-w-none max-[824.98px]:flex-1 lg:flex">
                <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.8rem] font-semibold">
                  {user.name}
                </strong>
                <small className="text-[0.68rem] text-[#d9c4e6]">
                  {roleLabel(user.role)}
                </small>
              </span>

              <button
                type="button"
                onClick={sair}
                className="cursor-pointer rounded-full border border-white/30 bg-transparent px-3.5 py-1.5 text-[0.75rem] font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-[#FFAB0B] hover:bg-[#FFAB0B] hover:text-[#3a2200] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FFAB0B]"
              >
                Sair
              </button>
            </div>
          </>
        ) : (
          /* "Entrar" vira botão de destaque, diferente dos links */
          <NavLink
            to="/login"
            onClick={fechar}
            className="ml-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#FFAB0B] px-[1.4em] py-[0.6em] font-semibold text-[#3a2200] no-underline shadow-[0_6px_18px_rgba(255,171,11,0.25)] transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffbd3a] hover:shadow-[0_10px_24px_rgba(255,171,11,0.4)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 xl:ml-4 max-[824.98px]:mx-[1.5em] max-[824.98px]:mt-4 max-[824.98px]:ml-[1.5em]"
          >
            <UserIcon />
            Entrar
          </NavLink>
        )}
      </nav>
    </header>
  );
}
