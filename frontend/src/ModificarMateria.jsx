import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Save, ArrowLeft, AlertCircle } from "lucide-react";

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
    return <div className="text-center p-10" aria-busy="true">Cargando datos de la materia...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Modificar Materia</h1>
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
        {error && <p className="text-sm text-red-600 bg-red-100 p-3 rounded-md flex items-center"><AlertCircle className="h-4 w-4 mr-2"/>{error}</p>}
        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary inline-flex items-center">
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};