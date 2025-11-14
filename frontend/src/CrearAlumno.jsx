import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router-dom";
import { UserPlus, ArrowLeft } from "lucide-react";

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registrar Nuevo Alumno</h1>
        <Link to="/alumnos" className="btn btn-secondary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Alumnos
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" className="form-input" required value={values.nombre} onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            setValues({ ...values, nombre: value });
          }} />
        </div>
        <div>
          <label className="form-label" htmlFor="apellido">Apellido</label>
          <input id="apellido" className="form-input" required value={values.apellido} onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
            setValues({ ...values, apellido: value });
          }} />
        </div>
        <div>
          <label className="form-label" htmlFor="dni">DNI</label>
          <input id="dni" className="form-input" required value={values.dni} onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            setValues({ ...values, dni: value });
          }} />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        <button type="submit" className="w-full btn btn-primary inline-flex justify-center items-center">
          <UserPlus className="h-5 w-5 mr-2" />
          Registrar Alumno
        </button>
      </form>
    </div>
  );
};