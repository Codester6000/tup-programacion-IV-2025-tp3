import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate } from "react-router-dom";

export const CrearUsuario = () => {
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);

  const [values, setValues] = useState({
    username: "",
    nombre: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrores(null);

    const response = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: values.nombre,
        email: values.username,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400) {
        return setErrores(data.errores);
      }
      return window.alert("Error al crear usuario");
    }
    navigate("/usuarios");
  };

  return (
    <article>
      <h2>Crear usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Email
            <input
              type="email"
              required
              value={values.username}
              onChange={(e) =>
                setValues({ ...values, username: e.target.value })
              }
              aria-invalid={
                errores && errores.some((e) => e.path === "username")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "username")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
              aria-invalid={
                errores && errores.some((e) => e.path === "apellido")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "nombre")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Contraseña
            <input
              required
              type="password"
              value={values.password}
              onChange={(e) =>
                setValues({ ...values, password: e.target.value })
              }
              aria-invalid={
                errores && errores.some((e) => e.path === "password")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "password")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
            <small>
              Debe tener al menos 8 caracteres, una letra y un número.
            </small>
          </label>
        </fieldset>
        <input type="submit" value="Crear usuario" />
      </form>
    </article>
  );
};
