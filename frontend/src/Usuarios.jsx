import { useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useCallback } from "react";
import { Link } from "react-router-dom";

export function Usuarios() {
  const { fetchAuth } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [buscar, setBuscar] = useState("");

  const fetchUsuarios = useCallback(
    async (buscar) => {
      const searchParams = new URLSearchParams();

      if (buscar) {
        searchParams.append("buscar", buscar);
      }

      const response = await fetchAuth(
        "http://localhost:3000/usuarios" +
          (searchParams.size > 0 ? "?" + searchParams.toString() : "")
      );
      const data = await response.json();

      if (!response.ok) {
        console.log("Error:", data.error);
        return;
      }

      setUsuarios(data.usuarios);
    },
    [fetchAuth]
  );

  useEffect(() => {
    fetchUsuarios();
  }, [fetchUsuarios]);

  const handleQuitar = async (id) => {
    // Preguntar si quiere quitar el usuario
    if (window.confirm("¿Desea quitar el usuario?")) {
      // Pedir a la api que quite el usuario
      const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return window.alert("Error al quitar usuario");
      }

      await fetchUsuarios();
    }
  };

  return (
    <article>
      <h2>Usuarios</h2>
      <Link role="button" to="/usuarios/crear">
        Nuevo usuario
      </Link>
      <div className="group">
        <input value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <button onClick={() => fetchUsuarios(buscar)}>Buscar</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nombre}</td>
              <td>
                <div>
                  <Link role="button" to={`/usuarios/${u.id}/modificar`}>
                    Modificar
                  </Link>
                  <button onClick={() => handleQuitar(u.id)}>Quitar</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}
