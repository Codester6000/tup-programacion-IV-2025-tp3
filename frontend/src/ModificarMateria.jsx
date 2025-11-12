import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarMateria = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [values, setValues] = useState(null);
  const [error, setError] = useState(null);

  const fetchMateria = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/materias/${id}`);
    const data = await response.json();

    if (response.ok && data.success) {
      setValues(data.data);
    } else {
      console.error("Error al consultar por materia:", data.message);
    }
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchMateria();
  }, [fetchMateria]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetchAuth(`http://localhost:3000/materias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Error al modificar la materia.");
      return;
    }

    navigate("/materias");
  };

  if (!values) {
    return <article aria-busy="true">Cargando datos de la materia...</article>;
  }

  return (
    <article>
      <h2>Modificar Materia</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input required value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} />
          </label>
          <label>
            Código
            <input required value={values.codigo} onChange={(e) => setValues({ ...values, codigo: e.target.value })} />
          </label>
          <label>
            Año
            <input type="number" required value={values.año} onChange={(e) => setValues({ ...values, año: e.target.value })} />
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