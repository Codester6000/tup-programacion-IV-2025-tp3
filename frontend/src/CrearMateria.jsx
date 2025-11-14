import { useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, Link } from "react-router-dom";
import { BookPlus, ArrowLeft } from "lucide-react";

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
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Registrar Nueva Materia</h1>
        <Link to="/materias" className="btn btn-secondary inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Materias
        </Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" className="form-input" required value={values.nombre} onChange={(e) => setValues({ ...values, nombre: e.target.value })} />
        </div>
        <div>
          <label className="form-label" htmlFor="codigo">Código</label>
          <input id="codigo" className="form-input" required value={values.codigo} onChange={(e) => setValues({ ...values, codigo: e.target.value })} />
        </div>
        <div>
          <label className="form-label" htmlFor="año">Año</label>
          <input id="año" type="number" className="form-input" required value={values.año} onChange={(e) => setValues({ ...values, año: e.target.value })} />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
        <button type="submit" className="w-full btn btn-primary inline-flex justify-center items-center">
          <BookPlus className="h-5 w-5 mr-2" />
          Registrar Materia
        </button>
      </form>
    </div>
  );
};