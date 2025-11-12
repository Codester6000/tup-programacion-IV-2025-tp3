import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarAlumno = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [error, setError] = useState(null);

  const fetchAlumno = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/alumnos/${id}`);
    const data = await response.json();

    if (response.ok && data.success) {
      setValues(data.data);
    } else {
      console.error("Error al consultar por alumno:", data.message);
    }
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchAlumno();
  }, [fetchAlumno]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetchAuth(`http://localhost:3000/alumnos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Error al modificar el alumno.");
      return;
    }

    navigate("/alumnos");
  };

  if (!values) {
    return <article aria-busy="true">Cargando datos del alumno...</article>;
  }

  return (
    <article>
      <h2>Modificar Alumno</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input required value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} />
          </label>
          <label>
            Apellido
            <input required value={values.apellido} onChange={(e) => setValues({ ...values, apellido: e.target.value })} />
          </label>
          <label>
            DNI
            <input required value={values.dni} onChange={(e) => setValues({ ...values, dni: e.target.value })} />
          </label>
        </fieldset>

        {error && (
          <p>
            <mark>{error}</mark>
          </p>
        )}

        <input type="submit" value="Guardar Cambios" />
      </form>
    </article>
  );
};