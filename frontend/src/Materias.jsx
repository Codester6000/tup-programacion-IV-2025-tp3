import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router-dom";

export function Materias() {
  const { fetchAuth } = useAuth();
  const [materias, setMaterias] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [mostrarMaterias, setMostrarMaterias] = useState(true);

  const fetchMaterias = useCallback(async (query) => {
    try {
      const searchParams = new URLSearchParams();
      if (query) {
        searchParams.append("buscar", query);
      }

      const response = await fetchAuth(`http://localhost:3000/materias?${searchParams.toString()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setMaterias(data.data);
      } else {
        console.error("Error al cargar materias:", data.message);
        setMaterias([]);
      }
    } catch (error) {
      console.error("Error de red al cargar materias:", error);
    }
  }, [fetchAuth]);

  useEffect(() => {
    fetchMaterias(buscar);
  }, [fetchMaterias, buscar]);

  const handleQuitar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta materia?")) {
      const response = await fetchAuth(`http://localhost:3000/materias/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchMaterias(buscar);
      } else {
        window.alert(data.message || "Error al eliminar la materia");
      }
    }
  };

  return (
    <article>
      <h2>Gestión de Materias</h2>
      <Link role="button" to="/materias/crear">
        Nueva Materia
      </Link>
      <input
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="Buscar por nombre o código..."
        style={{ marginTop: '1rem' }}
      />
      <button onClick={() => setMostrarMaterias(!mostrarMaterias)} className="contrast" style={{ marginBottom: '1rem' }}>
        {mostrarMaterias ? "Ocultar Lista" : "Mostrar Lista"}
      </button>

      {mostrarMaterias && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Código</th>
              <th>Año</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {materias.map((m) => (
              <tr key={m.id_materia}>
                <td>{m.id_materia}</td>
                <td>{m.nombre}</td>
                <td>{m.codigo}</td>
                <td>{m.año}</td>
                <td>
                  <Link role="button" to={`/materias/${m.id_materia}/modificar`}>Modificar</Link>
                  <button className="secondary" onClick={() => handleQuitar(m.id_materia)}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}