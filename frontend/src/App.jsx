import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  Outlet,
} from "react-router-dom";

import { getUser } from "./api";

import Navbar from "./Navbar";

import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Admin from "./pages/Admin";
import Denuncia from "./pages/Denuncia";
import NotFound from "./pages/NotFound";

const linkRodape =
  "text-white/80 underline-offset-4 transition hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

const tituloRodape = "mb-3 text-lg font-bold text-[#E9D5F5]";

function Layout() {
  return (
    <>
      <Navbar />

      <main className="min-w-0">
        <Outlet />
      </main>

      <footer className="border-t-4 border-[#FF7043] bg-[#360E53] text-white">
        <div className="grid gap-10 px-6 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-10">
          <div className="min-w-0">
            <p className="text-2xl font-bold">RMVM Advogados</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/75">
              Orientação jurídica humanizada e acessível às mulheres, com
              sigilo e escuta qualificada.
            </p>
          </div>

          <nav className="min-w-0" aria-label="Links do rodapé">
            <h2 className={tituloRodape}>Navegue</h2>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink className={linkRodape} to="/about">
                  Sobre nós
                </NavLink>
              </li>
              <li>
                <NavLink className={linkRodape} to="/denunciar">
                  Denunciar
                </NavLink>
              </li>
              <li>
                <button
                  type="button"
                  className={`cursor-pointer ${linkRodape}`}
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Voltar ao topo ↑
                </button>
              </li>
            </ul>
          </nav>

          <div className="min-w-0">
            <h2 id="con" className={tituloRodape}>
              Contatos
            </h2>
            <ul className="space-y-2 text-sm">
              <li>
                <a className={linkRodape} href="tel:123423423">
                  1234234(23)
                </a>
              </li>
              <li className="text-white/75">
                Central de Atendimento à Mulher:{" "}
                <a className="font-bold text-[#E9D5F5] hover:underline" href="tel:180">
                  180
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/15 px-6 py-4 text-center text-xs text-white/60 md:px-10">
          © 2026 RMVM. Todos os direitos reservados.
        </div>
      </footer>
    </>
  );
}

function PrivateRoute({ children, admin = false }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (admin && user.role !== "admin") {
    return <Navigate to="/conta" replace state={{ denied: true }} />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/denunciar" element={<Denuncia />} />
          <Route
            path="/conta"
            element={
              <PrivateRoute>
                <Account />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute admin>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
