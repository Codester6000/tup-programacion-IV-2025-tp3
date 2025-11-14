import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md mt-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Crear Nuevo Usuario</h1>
        <Link to="/usuarios" className="btn btn-secondary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Usuarios
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label" htmlFor="email">Email</label>
          <input id="email" type="email" required className="form-input" value={values.username} onChange={(e) => setValues({ ...values, username: e.target.value })} />
          {errores && errores.some(e => e.path === 'username') && (
            <p className="text-sm text-red-600 mt-1">
              {errores.filter(e => e.path === 'username').map(e => e.msg).join(', ')}
            </p>
          )}
        </div>
        <div>
          <label className="form-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" required className="form-input" value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} />
          {errores && errores.some(e => e.path === 'nombre') && (
            <p className="text-sm text-red-600 mt-1">
              {errores.filter(e => e.path === 'nombre').map(e => e.msg).join(', ')}
            </p>
          )}
        </div>
        <div>
          <label className="form-label" htmlFor="password">Contraseña</label>
          <input id="password" required type="password" className="form-input" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
          <p className="text-xs text-gray-500 mt-1">Debe tener al menos 8 caracteres, una letra y un número.</p>
          {errores && errores.some(e => e.path === 'password') && (
            <p className="text-sm text-red-600 mt-1">
              {errores.filter(e => e.path === 'password').map(e => e.msg).join(', ')}
            </p>
          )}
        </div>
        <button type="submit" className="w-full btn btn-primary inline-flex justify-center items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Crear Usuario
        </button>
      </form>
    </div>
  );
};
