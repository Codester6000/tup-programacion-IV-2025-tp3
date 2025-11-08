import express from "express";
import cors from "cors";
import passport from "passport";
import { conectarDB } from "./db.js";
// import usuariosRouter from "./usuarios.js";
// import authRouter, { authConfig } from "./auth.js";
import materiasRouter from "./materias.js";
import alumnosRouter from "./alumnos.js";
import notasRouter from "./notas.js";


conectarDB();

const app = express();
const port = 3000;

// Para interpretar body como JSON
app.use(express.json());

// Habilito CORS
app.use(cors());

// authConfig();

// Inicializo passport
app.use(passport.initialize());

app.get("/", (req, res) => {
  // Responder con string
  res.send("Hola mundo!");
});

// app.use("/usuarios", usuariosRouter);
// app.use("/auth", authRouter);
app.use("/materias", materiasRouter);
app.use("/alumnos", alumnosRouter);
app.use("/notas", notasRouter);

app.listen(port, () => {
  console.log(`La aplicación esta funcionando en el puerto ${port}`);
});
