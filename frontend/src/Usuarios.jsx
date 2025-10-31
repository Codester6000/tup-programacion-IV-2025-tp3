import { useEffect, useState } from "react";
import { useAuth } from "./Auth";

export function Usuarios() {
  const { fetchAuth } = useAuth();

  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const fetchUsuarios = async () => {
      const response = await fetchAuth("http://localhost:3000/usuarios");
      const data = await response.json();

      if (!response.ok) {
        console.log("Error:", data.error);
        return;
      }

      return data.usuarios;
    };

    fetchUsuarios().then((usuarios) => setUsuarios(usuarios));
  }, [fetchAuth]);

  return (
    <>
      <h1>Usuarios</h1>
      <ul>
        {usuarios.map((u) => (
          <li key={u.id}>
            {u.username} ({u.apellido}, {u.nombre})
          </li>
        ))}
      </ul>
    </>
  );
}
