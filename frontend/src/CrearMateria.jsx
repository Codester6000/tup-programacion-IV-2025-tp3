import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";

export const CrearMateria = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    nombre: "",
    codigo: "",
    año: new Date().getFullYear(),
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetchAuth("http://localhost:3000/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Error al crear la materia.");
      return;
    }

    navigate("/materias");
  };

  return (
    <article>
      <h2>Registrar Nueva Materia</h2>
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

        <input type="submit" value="Registrar Materia" />
      </form>
    </article>
  );
};