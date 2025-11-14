import { useState } from "react";
import { useAuth } from "./Auth";
import { Link } from "react-router-dom";
import { LogIn, UserPlus, X } from "lucide-react";

export const Ingresar = () => {
  const { error, login } = useAuth();

  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <>
      <button onClick={() => setOpen(true)}><LogIn /> Ingresar</button>
      <dialog open={open}>
        <article>
          <h2>Ingrese usuario y contraseña</h2>
          <form onSubmit={handleSubmit}>
            <fieldset>
              <label htmlFor="email">Email:</label>
              <input name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <label htmlFor="password">Contraseña:</label>
              <input name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {error && <p style={{ color: "red" }}>{error}</p>}
            </fieldset>
            <footer>
              <div className="grid">
                <button type="button" className="secondary" onClick={() => setOpen(false)}><X /> Cancelar</button>
                <button type="submit"><LogIn /> Ingresar</button>
                <Link to="/usuarios/crear" role="button" className="contrast" onClick={() => setOpen(false)}>
                  <UserPlus /> Registrarse
                </Link>
              </div>
            </footer>
          </form>
        </article>
      </dialog>
    </>
  );
};
