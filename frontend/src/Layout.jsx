import { Outlet, Link } from "react-router-dom";
import { useAuth } from "./Auth";
import { Ingresar } from "./Ingresar";
import { GraduationCap, Book, ClipboardList, Users, LogOut } from "lucide-react";

export const Layout = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <main className="container">
      <nav>
        <ul>
          <li>
            <Link to="/alumnos"><GraduationCap /> Alumnos</Link>
          </li>
          <li>
            <Link to="/materias"><Book /> Materias</Link>
          </li>
          <li>
            <Link to="/"><ClipboardList /> Notas</Link>
          </li>
          <li>
            <Link to="/usuarios"><Users /> Usuarios</Link>
          </li>
        </ul>
        <li>
          {isAuthenticated ? <button onClick={() => logout()}><LogOut /> Salir</button> : <Ingresar />}
        </li>
      </nav>
      <Outlet />
    </main>
  );
};
