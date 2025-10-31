import { useAuth } from "./Auth";

export const Roles = () => {
  const { roles } = useAuth();

  if (!roles) {
    return null;
  }

  return (
    <>
      <h2>Roles</h2>
      {roles.includes("admin") && <p>Administrador</p>}
      {roles.includes("usuario") && <p>Usuario</p>}
      {roles.includes("empleado") && <p>Empleado</p>}
    </>
  );
};
