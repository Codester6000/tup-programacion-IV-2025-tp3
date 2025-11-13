import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router-dom";

export function Alumnos() {
  const { fetchAuth } = useAuth();
  const [alumnos, setAlumnos] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [mostrarAlumnos, setMostrarAlumnos] = useState(true);

  const fetchAlumnos = useCallback(
    async (query) => {
      const searchParams = new URLSearchParams();
      if (query) {
        searchParams.append("buscar", query);
      }

      const response = await fetchAuth(
        `http://localhost:3000/alumnos?${searchParams.toString()}`
      );
      const data = await response.json();

      if (response.ok && data.success) {
        setAlumnos(data.data);
      } else {
        console.error("Error al cargar alumnos:", data.message);
      }
    },
    [fetchAuth]
  );

  useEffect(() => {
    fetchAlumnos(buscar);
  }, [fetchAlumnos, buscar]);

  const handleQuitar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este alumno?")) {
      const response = await fetchAuth(`http://localhost:3000/alumnos/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchAlumnos(buscar); // Recargar la lista
      } else {
        window.alert("Error al eliminar alumno");
      }
    }
  };

  return (
    <article>
      <h2>Gestión de Alumnos</h2>
      <Link role="button" to="/alumnos/crear">
        Nuevo Alumno
      </Link>
      <input
        value={buscar}
        onChange={(e) => setBuscar(e.target.value)}
        placeholder="Buscar por nombre, apellido o DNI..."
        style={{ marginTop: '1rem' }}
      />
      <button onClick={() => setMostrarAlumnos(!mostrarAlumnos)} className="contrast" style={{ marginBottom: '1rem' }}>
        {mostrarAlumnos ? "Ocultar Lista" : "Mostrar Lista"}
      </button>

      {mostrarAlumnos && (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Apellido</th>
              <th>DNI</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {alumnos.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.nombre}</td>
                <td>{a.apellido}</td>
                <td>{a.dni}</td>
                <td>
                  <Link role="button" to={`/alumnos/${a.id}/modificar`}>Modificar</Link>
                  <button className="secondary" onClick={() => handleQuitar(a.id)}>Quitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}