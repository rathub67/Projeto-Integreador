import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api, getUser, setToken, setUser } from "../api";
import logo from "../assets/download.png";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

/* ---------- Ícones (SVG inline, sem dependências) ---------- */
const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const UserIcon = () => (
  <svg {...iconProps}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
  </svg>
);
const MailIcon = () => (
  <svg {...iconProps}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
const LockIcon = () => (
  <svg {...iconProps}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);
const EyeIcon = ({ off }) => (
  <svg {...iconProps}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
    {off && <path d="M4 4l16 16" />}
  </svg>
);
const ShieldIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const KeyIcon = () => (
  <svg {...iconProps}>
    <circle cx="8" cy="15" r="4" />
    <path d="m11 12 9-9M16 7l3 3" />
  </svg>
);
const CheckIcon = () => (
  <svg {...iconProps} width={14} height={14} strokeWidth={2.4}>
    <path d="m5 12 5 5 9-10" />
  </svg>
);
const Spinner = () => (
  <svg
    className="h-5 w-5 animate-spin"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeOpacity="0.3"
      strokeWidth="3"
    />
    <path
      d="M21 12a9 9 0 0 0-9-9"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    />
  </svg>
);

/* ---------- Força da senha ---------- */
function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) score++;

  const levels = [
    { label: "Muito fraca", color: "bg-red-400" },
    { label: "Fraca", color: "bg-orange-400" },
    { label: "Razoável", color: "bg-[#FFAB0B]" },
    { label: "Boa", color: "bg-lime-500" },
    { label: "Forte", color: "bg-emerald-500" },
  ];
  return { score, ...levels[score] };
}

/* ---------- Campo reutilizável ---------- */
function Field({ label, icon, right, children }) {
  return (
    <label className="group block">
      <span className="mb-1.5 block text-base font-medium text-[#360E53]">
        {label}
      </span>
      <span className="relative block">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a98bbd] transition-colors duration-200 group-focus-within:text-[#8048A9]">
          {icon}
        </span>
        {children}
        {right}
      </span>
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-[#e0cde8] bg-white py-3 pl-11 pr-4 text-base text-[#241130] outline-none transition duration-200 placeholder:text-[#b9a6c6] hover:border-[#c9a9dc] focus:border-[#8048A9] focus:ring-4 focus:ring-[#8048A9]/15";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [error, setError] = useState("");
  const [errorKey, setErrorKey] = useState(0); // reinicia a animação do erro
  const [submitting, setSubmitting] = useState(false);

  const loggedUser = getUser();
  const isRegister = mode === "register";

  const strength = useMemo(() => getStrength(form.password), [form.password]);
  const passwordsMatch =
    isRegister && form.confirm.length > 0 && form.password === form.confirm;
  const passwordsDiffer =
    isRegister && form.confirm.length > 0 && form.password !== form.confirm;

  if (loggedUser) {
    return (
      <Navigate
        to={loggedUser.role === "admin" ? "/admin" : "/conta"}
        replace
      />
    );
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError("");
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
  }

  function fail(message) {
    setError(message);
    setErrorKey((k) => k + 1);
  }

  function handleKey(event) {
    setCapsOn(event.getModifierState?.("CapsLock") ?? false);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      fail("Preencha e-mail e senha.");
      return;
    }

    if (isRegister) {
      if (form.name.trim().length < 2) {
        fail("Informe seu nome completo.");
        return;
      }
      if (password.length < 8) {
        fail("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (password !== form.confirm) {
        fail("As senhas não conferem.");
        return;
      }
    }

    setSubmitting(true);

    try {
      const data = isRegister
        ? await api("/auth/register", "POST", {
            name: form.name.trim(),
            email,
            password,
          })
        : await api("/auth/login", "POST", { email, password });

      setToken(data.token);
      setUser(data.user);
      window.location.href = data.user.role === "admin" ? "/admin" : "/";
    } catch (err) {
      fail(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#F4E7F6] px-4 py-10 sm:px-6 md:py-16">
      {/* Animações locais (respeitam prefers-reduced-motion) */}
      <style>{`
        @keyframes rmvm-float-a { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(40px,-30px) scale(1.12); } }
        @keyframes rmvm-float-b { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-36px,34px) scale(1.08); } }
        @keyframes rmvm-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes rmvm-shake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
        @keyframes rmvm-card-in { from { opacity: 0; transform: translateY(24px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .rmvm-orb-a { animation: rmvm-float-a 14s ease-in-out infinite; }
        .rmvm-orb-b { animation: rmvm-float-b 18s ease-in-out infinite; }
        .rmvm-rise { animation: rmvm-rise .45s cubic-bezier(.2,.7,.2,1) both; }
        .rmvm-shake { animation: rmvm-shake .4s ease-in-out; }
        .rmvm-card-in { animation: rmvm-card-in .6s cubic-bezier(.2,.7,.2,1) both; }
        @media (prefers-reduced-motion: reduce) {
          .rmvm-orb-a, .rmvm-orb-b, .rmvm-rise, .rmvm-shake, .rmvm-card-in { animation: none !important; }
        }
      `}</style>

      {/* Fundo decorativo suave */}
      <div
        aria-hidden="true"
        className="rmvm-orb-a pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#8048A9]/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="rmvm-orb-b pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 rounded-full bg-[#FFAB0B]/20 blur-3xl"
      />

      <div className="rmvm-card-in relative mx-auto grid max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_80px_rgba(54,14,83,0.22)] md:grid-cols-2">
        {/* ---------- Painel lateral ---------- */}
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-[#360E53] via-[#4B057E] to-[#8048A9] p-10 text-white md:flex">
          <div
            aria-hidden="true"
            className="rmvm-orb-b absolute -right-16 top-1/3 h-64 w-64 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden="true"
            className="rmvm-orb-a absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-[#FFAB0B]/15 blur-3xl"
          />

          <div className="relative">
            <img src={logo} alt="RMVM Advogados" className="h-16 w-auto" />

            {/* O texto muda conforme a aba, para o painel acompanhar o formulário */}
            <div key={mode} className="rmvm-rise">
              <h2 className="mt-10 text-3xl font-semibold leading-tight">
                {isRegister ? (
                  <>
                    Comece com
                    <br />a RMVM Advogados
                  </>
                ) : (
                  <>
                    Área reservada da
                    <br />
                    RMVM Advogados
                  </>
                )}
              </h2>
              <p className="mt-4 max-w-xs text-base leading-7 text-white/80">
                {isRegister
                  ? "Crie sua conta e tenha seus dados reunidos em um só lugar, com proteção e acolhimento."
                  : "Acesse sua conta para acompanhar seus dados com segurança. Informação, acolhimento e proteção em um só lugar."}
              </p>
            </div>
          </div>

          <ul className="relative space-y-3 text-base text-white/90">
            <li className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm transition hover:bg-white/15">
              <span className="text-[#FFAB0B]">
                <ShieldIcon />
              </span>
              Área pessoal protegida por senha
            </li>
            <li className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm transition hover:bg-white/15">
              <span className="text-[#FFAB0B]">
                <KeyIcon />
              </span>
              Alteração de senha a qualquer momento
            </li>
          </ul>
        </aside>

        {/* ---------- Formulário ---------- */}
        <div className="p-6 sm:p-10">
          {/* Abas com indicador deslizante */}
          <div
            role="tablist"
            aria-label="Entrar ou criar conta"
            className="relative mb-7 grid grid-cols-2 rounded-xl bg-[#F4E7F6] p-1"
          >
            <span
              aria-hidden="true"
              className={`absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-[#360E53] shadow-md transition-transform duration-300 ease-out ${
                isRegister ? "translate-x-full" : "translate-x-0"
              }`}
            />
            {[
              ["login", "Entrar"],
              ["register", "Criar conta"],
            ].map(([value, text]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => switchMode(value)}
                className={`relative z-10 rounded-lg px-4 py-2 text-base font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8048A9] ${
                  mode === value
                    ? "text-white"
                    : "text-[#4B057E] hover:text-[#8048A9]"
                }`}
              >
                {text}
              </button>
            ))}
          </div>

          <div key={`head-${mode}`} className="rmvm-rise">
            <h1 className="text-3xl font-semibold text-[#360E53]">
              {isRegister ? "Crie sua conta" : "Bem-vinda de volta"}
            </h1>
            <p className="mt-1.5 text-base leading-7 text-[#6f5a7c]">
              {isRegister
                ? "Leva menos de um minuto. A sua conta fica protegida por senha."
                : "Entre com seu e-mail e senha para acessar sua conta."}
            </p>
          </div>

          <form
            key={`form-${mode}`}
            className="rmvm-rise mt-6 space-y-4"
            onSubmit={handleSubmit}
            noValidate
          >
            {isRegister && (
              <Field label="Nome completo" icon={<UserIcon />}>
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  placeholder="Seu nome"
                  autoComplete="name"
                  className={inputClass}
                  required
                />
              </Field>
            )}

            <Field label="E-mail" icon={<MailIcon />}>
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                className={inputClass}
                required
              />
            </Field>

            <div>
              <Field
                label="Senha"
                icon={<LockIcon />}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#8048A9] transition hover:bg-[#F4E7F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8048A9]"
                  >
                    <EyeIcon off={showPassword} />
                  </button>
                }
              >
                <input
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) =>
                    updateField("password", event.target.value)
                  }
                  onKeyUp={handleKey}
                  onKeyDown={handleKey}
                  onBlur={() => setCapsOn(false)}
                  placeholder={
                    isRegister ? "Mínimo de 8 caracteres" : "Sua senha"
                  }
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  className={`${inputClass} pr-14`}
                  required
                />
              </Field>

              {capsOn && (
                <p className="rmvm-rise mt-1.5 text-sm text-[#b57600]">
                  Caps Lock está ativado.
                </p>
              )}

              {/* Medidor de força da senha */}
              {isRegister && form.password.length > 0 && (
                <div className="rmvm-rise mt-2.5" aria-live="polite">
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <span
                        key={step}
                        className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                          strength.score >= step
                            ? strength.color
                            : "bg-[#eadcf0]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-sm text-[#6f5a7c]">
                    Força da senha:{" "}
                    <span className="font-semibold text-[#360E53]">
                      {strength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {isRegister && (
              <div>
                <Field
                  label="Confirmar senha"
                  icon={<LockIcon />}
                  right={
                    passwordsMatch && (
                      <span className="absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckIcon />
                      </span>
                    )
                  }
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.confirm}
                    onChange={(event) =>
                      updateField("confirm", event.target.value)
                    }
                    placeholder="Repita a senha"
                    autoComplete="new-password"
                    className={`${inputClass} pr-12 ${
                      passwordsDiffer
                        ? "!border-red-300 focus:!ring-red-200"
                        : passwordsMatch
                          ? "!border-emerald-400"
                          : ""
                    }`}
                    required
                  />
                </Field>
                {passwordsDiffer && (
                  <p className="rmvm-rise mt-1.5 text-sm text-red-600">
                    As senhas ainda não conferem.
                  </p>
                )}
              </div>
            )}

            {error && (
              <div
                key={errorKey}
                role="alert"
                className="rmvm-shake flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                <svg {...iconProps} width={16} height={16} className="mt-0.5 shrink-0">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v5M12 16.5v.01" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#360E53] via-[#4B057E] to-[#8048A9] bg-[length:200%_100%] bg-left px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-[#360E53]/25 transition-all duration-500 hover:bg-right hover:shadow-xl hover:shadow-[#4B057E]/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-[#8048A9]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Spinner />
                  Aguarde...
                </>
              ) : (
                <>{isRegister ? "Criar minha conta" : "Entrar"}</>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-base text-[#6f5a7c]">
            {isRegister ? "Já possui conta? " : "Ainda não tem conta? "}
            <button
              type="button"
              onClick={() => switchMode(isRegister ? "login" : "register")}
              className="font-semibold text-[#8048A9] underline-offset-4 hover:underline focus:outline-none focus-visible:underline"
            >
              {isRegister ? "Entrar" : "Cadastre-se"}
            </button>
          </p>

          <p className="mt-3 text-center text-sm text-[#9a86a4]">
            <Link
              to="/"
              className="underline-offset-4 transition hover:text-[#8048A9] hover:underline"
            >
              Voltar para a página inicial
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
