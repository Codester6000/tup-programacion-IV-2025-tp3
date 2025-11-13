import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { Link, useNavigate, useParams } from "react-router-dom";

export const DetallesUsuario = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por usuario:", data.error);
      return;
    }
    setUsuario(data.data);
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleQuitar = async () => {
    if (window.confirm("¿Desea quitar el usuario?")) {
      const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        return window.alert("Error al quitar usuario");
      }

      navigate("/usuarios");
    }
  };

  if (!usuario) {
    return null;
  }

  return (
    <article>
      <h2>Detalles de usuario</h2>
      <p>
        ID: <b>{usuario.id}</b>
      </p>
      <p>
        Nombre: <b>{usuario.nombre}</b>
      </p>
      <p>
        Email: <b>{usuario.email}</b>
      </p>
      <div className="grid">
        <Link role="button" to={`/usuarios/${id}/modificar`}>
          Modificar
        </Link>
        <button className="secondary" onClick={handleQuitar}>
          Quitar
        </button>
      </div>
    </article>
  );
};
