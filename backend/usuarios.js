import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion } from "./auth.js";

const app = express.Router();

app.get("/", verificarAutenticacion, 
  async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM usuarios");
  
  res.json({
    success: true,
    usuarios: rows.map((u) => ({ ...u, password_hash: undefined })),
  });
});

app.get("/:id",
  
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  
  async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute(
      "SELECT id, nombre, email FROM usuarios WHERE id=?",
      [id]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
  }
);

app.post(
  "/",
  verificarAutenticacion,  
  body("nombre").isString().isLength({ min: 2, max: 50 }),
  body("email").isEmail(),
  body("password").isStrongPassword({
    minLength: 8, // Minimo de 8 caracteres
    minLowercase: 1, // Al menos una letra en minusculas
    minUppercase: 0, // Letras mayusculas opcionales
    minNumbers: 1, // Al menos un número
    minSymbols: 0, // Símbolos opcionales
  }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    // Creamos Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute(
      "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?,?,?)",
      [nombre, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, nombre, email },
    });
  }
);

app.put(
  "/:id",
  //verificarAutenticacion,  
  validarId,
  body("nombre").isString().isLength({ min: 2, max: 50 }).optional(),
  body("password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
    })
    .optional(),  
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const u = rows[0];
    // Mantener los valores existentes si no se proporcionan nuevos
    const nuevoNombre = nombre || u.nombre;

    let sql = "UPDATE usuarios SET nombre=? ";
    const params = [nuevoNombre];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      sql += ", password_hash=? ";
      params.push(hashedPassword);
    }

    sql += "WHERE id=?";
    params.push(id);

    await db.execute(sql, params);

    res.json({ success: true });
  }
);

app.delete("/:id", verificarAutenticacion  , 
  validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM usuarios WHERE id=?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  res.json({ success: true });
});

export default app;
