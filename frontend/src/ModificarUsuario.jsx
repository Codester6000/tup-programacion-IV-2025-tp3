import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarUsuario = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por usuario:", data.error);
      return;
    }
    setValues({
      nombre: data.data.nombre,
      email: data.data.email,
      password: "",
    });
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const bodyToSend = {
      nombre: values.nombre,
      email: values.email,
    };
    if (values.password) {
      bodyToSend.password = values.password;
    }

    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyToSend),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return window.alert("Error al modificar usuario");
    }

    navigate("/usuarios");
  };

  if (!values || !values.nombre) {
    return <article aria-busy="true">Cargando datos del usuario...</article>;
  }

  return (
    <article>
      <h2>Modificar usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
            />
          </label>
          <label>
            Email
            <input
              required
              type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          </label>
          <label>
            Nueva Contraseña (dejar vacío para no cambiar)
            <input
              type="password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              autoComplete="new-password"
              placeholder="********"
            />
            <small>
              Debe tener al menos 8 caracteres, una letra y un número.
            </small>
          </label>
        </fieldset>
        <input type="submit" value="Modificar usuario" />
      </form>
    </article>
  );
};
