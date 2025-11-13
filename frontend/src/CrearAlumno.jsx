import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";

export const CrearAlumno = () => {
  const { fetchAuth } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    nombre: "",
    apellido: "",
    dni: "",
  });
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetchAuth("http://localhost:3000/alumnos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Error al crear el alumno.");
      return;
    }

    navigate("/alumnos");
  };

  return (
    <article>
      <h2>Registrar Nuevo Alumno</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setValues({ ...values, nombre: value });
              }}
            />
          </label>
          <label>
            Apellido
            <input
              required
              value={values.apellido}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                setValues({ ...values, apellido: value });
              }}
            />
          </label>
          <label>
            DNI
            <input
              required
              value={values.dni}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setValues({ ...values, dni: value });
              }}
            />
          </label>
        </fieldset>

        {error && (
          <p>
            <mark>{error}</mark>
          </p>
        )}

        <input type="submit" value="Registrar Alumno" />
      </form>
    </article>
  );
};