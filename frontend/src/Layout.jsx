import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./Auth";
import { Ingresar } from "./Ingresar";

export const Layout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link to="/alumnos">Alumnos</Link>
          </li>
          <li>
            <Link to="/materias">Materias</Link>
          </li>
          <li>
            <Link to="/">Notas</Link>
          </li>
          <li>
            <Link to="/usuarios">Usuarios</Link>
          </li>
        </ul>
        <li>
          {isAuthenticated ? (
            <button onClick={() => logout()}>Salir</button>
          ) : (
            <Ingresar />
          )}
        </li>
      </nav>
      <Outlet />
    </main>
  );
};
