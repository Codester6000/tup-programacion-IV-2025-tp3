import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion } from "./auth.js";

const app = express.Router();

app.get("/", verificarAutenticacion, async (req, res) => {
  const { buscar } = req.query;

  let sql = "SELECT id, nombre, email FROM usuarios";
  const params = [];

  if (buscar) {
    sql += " WHERE nombre LIKE ? OR email LIKE ?";
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  sql += " ORDER BY nombre";

  const [rows] = await db.execute(sql, params);

  res.json({
    success: true,
    usuarios: rows,
  });
});

app.get("/:id",
  
  verificarAutenticacion,
  validarId(),
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
  body("nombre").isString().isLength({ min: 2, max: 50 }),
  body("email").isEmail(),
  body("password").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, email, password } = req.body;

    // Creamos Hash de la contraseña con bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    const [result] = await db.execute( "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)", [nombre, email, hashedPassword] );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, nombre, email },
    });
  }
);

app.put(
  "/:id",
  validarId(),
  body("nombre").isString().isLength({ min: 2, max: 50 }).optional(),
  body("email").isEmail().optional(),
  body("password").isStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 0,
    minNumbers: 1,
    minSymbols: 0,
  }).optional(),
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, email, password } = req.body;

    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }
    const u = rows[0];
    let updateFields = [];
    let params = [];

    if (nombre !== undefined && nombre !== u.nombre) {
      updateFields.push("nombre=?");
      params.push(nombre);
    }

    if (email !== undefined && email !== u.email) {
      const [existingEmail] = await db.execute("SELECT id FROM usuarios WHERE email = ? AND id != ?", [email, id]);
      if (existingEmail.length > 0) {
        return res.status(400).json({ success: false, message: "El email ya está registrado por otro usuario." });
      }
      updateFields.push("email=?");
      params.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 12);
      updateFields.push("password_hash=?");
      params.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.json({ success: true, message: "No hay cambios para guardar." });
    }

    let sql = `UPDATE usuarios SET ${updateFields.join(", ")} WHERE id=?`;
    params.push(id);

    await db.execute(sql, params);
    res.json({ success: true, data: { id, nombre: nombre || u.nombre, email: email || u.email } });
  }
);

app.delete("/:id",
  verificarAutenticacion,
  validarId(),
  verificarValidaciones,
  async (req, res) => {
    try {
      const id = Number(req.params.id);
      const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Usuario no encontrado" });
      }

      await db.execute("DELETE FROM usuarios WHERE id=?", [id]);
      res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      res.status(500).json({ success: false, message: "Error del servidor. Es posible que el usuario tenga datos asociados (como notas) que impiden su eliminación." });
    }
  }  
);

export default app;
