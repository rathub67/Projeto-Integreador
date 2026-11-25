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

function Layout() {
  return (
    <>
      <Navbar />

      <main className="min-w-0">
        <Outlet />
      </main>

      <footer className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] items-start gap-x-16 gap-y-8 break-words bg-[#9A479C] px-6 py-8 text-base text-white max-[640px]:grid-cols-1 max-[640px]:gap-6 max-[640px]:px-5">
        <div className="min-w-0">
          <NavLink
            className="inline-flex text-2xl font-bold text-[#FFAE0D] hover:text-[#bb7f07]"
            to="/about"
          >
            Sobre nós
          </NavLink>
          <br />
          <a
            className="mt-2 inline-block text-inherit hover:text-gray-400"
            href="#t"
          >
            Topo
          </a>
        </div>

        <div className="min-w-0">
          <h2 id="con" className="mb-2 text-2xl font-bold text-[#FFAE0D]">
            Contatos
          </h2>
          <p>1234234(23)</p>
        </div>

        <div className="col-span-full flex border-t border-white/30 pt-4">
          <p className="mx-auto text-center text-sm">
            © 2026 RMVM. Todos os direitos reservados.
          </p>
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
