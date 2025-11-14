import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";

export function Notas() {
  const { fetchAuth } = useAuth();
  const [notas, setNotas] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [editingNota, setEditingNota] = useState(null); // Para el modal de edición
  const [buscarAlumno, setBuscarAlumno] = useState("");
  const [buscarMateria, setBuscarMateria] = useState("");
  const [mostrarNotas, setMostrarNotas] = useState(true);

  const [newNota, setNewNota] = useState({
    alumno_id: "",
    materia_id: "",
    nota1: "",
    nota2: "",
    nota3: "",
  });

  const cargarNotas = useCallback(async (alumno, materia) => {
    try {
      const searchParams = new URLSearchParams();
      if (alumno) {
        searchParams.append("buscarAlumno", alumno);
      }
      if (materia) {
        searchParams.append("buscarMateria", materia);
      }

      const response = await fetchAuth(`http://localhost:3000/notas?${searchParams.toString()}`);
      const data = await response.json();
      if (data.success) {
        setNotas(data.data);
      } else if (response.status !== 404) {
        console.error("Error al cargar las notas:", data.message);
        setNotas([]);
      }
    } catch (error) {
      console.error("Error de red al cargar notas:", error);
    }
  }, [fetchAuth]);

  const cargarAlumnos = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/alumnos");
      const data = await response.json();
      if (data.success) {
        setAlumnos(data.data);
      }
    } catch (error) {
      console.error("Error de red al cargar alumnos:", error);
    }
  }, [fetchAuth]);

  const cargarMaterias = useCallback(async () => {
    try {
      const response = await fetchAuth("http://localhost:3000/materias");
      const data = await response.json();
      if (data.success) {
        setMaterias(data.data);
      }
    } catch (error) {
      console.error("Error de red al cargar materias:", error);
    }
  }, [fetchAuth]);

  useEffect(() => {
    cargarAlumnos();
    cargarMaterias();
  }, [cargarAlumnos, cargarMaterias]);

  useEffect(() => {
    cargarNotas(buscarAlumno, buscarMateria);
  }, [buscarAlumno, buscarMateria, cargarNotas]);
  const handleCrearNota = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchAuth("http://localhost:3000/notas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNota,
          nota1: newNota.nota1 || null,
          nota2: newNota.nota2 || null,
          nota3: newNota.nota3 || null,
        }),
      });
      const data = await response.json();
      if (data.success) {
        cargarNotas();
        setNewNota({
          alumno_id: "",
          materia_id: "",
          nota1: "",
          nota2: "",
          nota3: "",
        });
      } else {
        alert(`Error al crear la nota: ${data.message}`);
      }
    } catch (error) {
      console.error("Error de red al crear nota:", error);
    }
  };

  const handleEliminarNota = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta nota?")) {
      try {
        const response = await fetchAuth(`http://localhost:3000/notas/${id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (data.success) {
          cargarNotas();
        } else {
          alert(`Error al eliminar la nota: ${data.message}`);
        }
      } catch (error) {
        console.error("Error de red al eliminar nota:", error);
      }
    }
  };

  const handleEditarNota = async (e) => {
    e.preventDefault();
    try {
      const response = await fetchAuth(
        `http://localhost:3000/notas/${editingNota.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nota1: editingNota.nota1 || null,
            nota2: editingNota.nota2 || null,
            nota3: editingNota.nota3 || null,
          }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setEditingNota(null);
        cargarNotas();
      } else {
        alert(`Error al actualizar la nota: ${data.message}`);
      }
    } catch (error) {
      console.error("Error de red al editar nota:", error);
    }
  };

  return (
    <article>
      <h2>Gestión de Notas</h2>

      {/* Formulario para crear */}
      <form onSubmit={handleCrearNota}>
        <h3>Agregar Nueva Nota</h3>
        <div className="grid">
          <select
            value={newNota.alumno_id}
            onChange={(e) => setNewNota({ ...newNota, alumno_id: e.target.value })}
            required
          >
            <option value="" disabled>Seleccionar Alumno</option>
            {alumnos.map(alumno => (
              <option key={alumno.id} value={alumno.id}>
                {alumno.nombre} {alumno.apellido}
              </option>
            ))}
          </select>
          <select
            value={newNota.materia_id}
            onChange={(e) => setNewNota({ ...newNota, materia_id: e.target.value })}
            required
          >
            <option value="" disabled>Seleccionar Materia</option>
            {materias.map(materia => (
              <option key={materia.id_materia} value={materia.id_materia}>{materia.nombre}</option>
            ))}
          </select>
          <input type="number" step="0.01" value={newNota.nota1} onChange={(e) => setNewNota({ ...newNota, nota1: e.target.value })} placeholder="Nota 1" />
          <input type="number" step="0.01" value={newNota.nota2} onChange={(e) => setNewNota({ ...newNota, nota2: e.target.value })} placeholder="Nota 2" />
          <input type="number" step="0.01" value={newNota.nota3} onChange={(e) => setNewNota({ ...newNota, nota3: e.target.value })} placeholder="Nota 3" />
        </div>
        <button type="submit"><Plus /> Agregar Nota</button>
      </form>

      <button onClick={() => setMostrarNotas(!mostrarNotas)} className="contrast" style={{ marginTop: '1rem' }}>
        {mostrarNotas ? "Ocultar Lista de Notas" : "Mostrar Lista de Notas"}
      </button>

      {mostrarNotas && (
        <>
          <hr />

          <h3>Buscar Notas</h3>
          <div className="grid">
            <input value={buscarAlumno} onChange={(e) => setBuscarAlumno(e.target.value)} placeholder="Buscar por alumno..." />
            <input value={buscarMateria} onChange={(e) => setBuscarMateria(e.target.value)} placeholder="Buscar por materia..." />
          </div>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Alumno</th>
                <th>Materia</th>
                <th>Nota 1</th>
                <th>Nota 2</th>
                <th>Nota 3</th>
                <th>Promedio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {notas.map((nota) => (
                <tr key={nota.id}>
                  <td>{nota.id}</td>
                  <td>{`${nota.alumno_nombre} ${nota.alumno_apellido}`}</td>
                  <td>{nota.materia_nombre}</td>
                  <td>{nota.nota1 ?? "-"}</td>
                  <td>{nota.nota2 ?? "-"}</td>
                  <td>{nota.nota3 ?? "-"}</td>
                  <td>{nota.promedio ?? "-"}</td>
                  <td>
                    <button onClick={() => setEditingNota(nota)}><Edit /> Editar</button>
                    <button className="secondary" onClick={() => handleEliminarNota(nota.id)}><Trash2 /> Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {editingNota && (
            <dialog open>
              <article>
                <h3>Editar Nota</h3>
                <form onSubmit={handleEditarNota}>
                  <label>Nota 1</label>
                  <input type="number" step="0.01" value={editingNota.nota1 ?? ""} onChange={(e) => setEditingNota({ ...editingNota, nota1: e.target.value })} />
                  <label>Nota 2</label>
                  <input type="number" step="0.01" value={editingNota.nota2 ?? ""} onChange={(e) => setEditingNota({ ...editingNota, nota2: e.target.value })} />
                  <label>Nota 3</label>
                  <input type="number" step="0.01" value={editingNota.nota3 ?? ""} onChange={(e) => setEditingNota({ ...editingNota, nota3: e.target.value })} />
                  <footer>
                    <button type="button" className="secondary" onClick={() => setEditingNota(null)}><X /> Cancelar</button>
                    <button type="submit"><Save /> Guardar Cambios</button>
                  </footer>
                </form>
              </article>
            </dialog>
          )}
        </>
      )}
    </article>
  );
}