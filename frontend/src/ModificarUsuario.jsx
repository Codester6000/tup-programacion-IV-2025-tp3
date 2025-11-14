import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft } from "lucide-react";

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
    return <div className="text-center p-10" aria-busy="true">Cargando datos del usuario...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Modificar Usuario</h1>
        <Link to="/usuarios" className="btn btn-secondary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Usuarios
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" className="form-input" required value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} />
        </div>
        <div>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" className="form-input" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
        </div>
        <div>
          <label className="form-label" htmlFor="password">Nueva Contraseña</label>
          <input id="password" type="password" className="form-input" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} autoComplete="new-password" placeholder="Dejar vacío para no cambiar" />
          <p className="text-xs text-gray-500 mt-1">Debe tener al menos 8 caracteres, una letra y un número.</p>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary inline-flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Modificar Usuario
          </button>
        </div>
      </form>
    </div>
  );
};
