import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { body, param } from "express-validator";
import bcrypt from "bcrypt";
import { verificarAutenticacion, verificarAutorizacion } from "./auth.js";

const app = express.Router();

app.get("/", verificarAutenticacion, async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM usuarios");
  // RECORDAR Quitar la contraseña en la api
  res.json({
    success: true,
    usuarios: rows.map((u) => ({ ...u, password_hash: undefined })),
  });
});

app.get(
  "/:id",
  //Aqui si se autentica
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  //Aqui no se autentica
  //verificarAutenticacion,
  async (req, res) => {
    const id = Number(req.params.id);
    const [rows] = await db.execute(
      "SELECT id, nombre, email, activo FROM usuarios WHERE id=?",
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
  verificarAutorizacion("admin"),
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
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("nombre").isString().isLength({ min: 2, max: 50 }).optional(),
  body("email").isEmail().optional(),
  body("activo").isBoolean().optional(),
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, email, activo } = req.body;

    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id=?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Usuario no encontrado" });
    }

    const u = rows[0];
    const updatedUser = {
      nombre: nombre || u.nombre,
      email: email || u.email,
      activo: activo !== undefined ? activo : u.activo,
    };

    await db.execute(
      "UPDATE usuarios SET nombre=?, email=?, activo=? WHERE id=?",
      [updatedUser.nombre, updatedUser.email, id]
    );

    res.json({ success: true, data: { id, ...updatedUser } });
  }
);

app.delete("/:id", verificarAutenticacion, verificarAutorizacion("admin"), validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const [result] = await db.execute("DELETE FROM usuarios WHERE id=?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Usuario no encontrado" });
  }
  res.json({ success: true });
});

// Consultar por roles de usuario
app.get(
  "/:id/roles",
  verificarAutenticacion,
  validarId,
  verificarValidaciones,
  async (req, res) => {
    const id = Number(req.params.id);

    // Verificar que exista usuario

    let sql =
      "SELECT r.id, r.nombre \
       FROM roles r \
       JOIN usuarios_roles ur ON r.id = ur.rol_id \
       WHERE ur.usuario_id = ? \
       ORDER BY r.nombre";

    const [rows] = await db.execute(sql, [id]);
    res.json({ success: true, data: rows });
  }
);

// Asignar un rol a un usuario
app.post(
  "/:id/roles",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  body("rolId").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const usuarioId = Number(req.params.id);
    const rolId = req.body.rolId;

    // Verificar que exista usuario
    // Verificar que exista rol

    let sql = "INSERT INTO usuarios_roles (usuario_id, rol_id) VALUES (?,?)";

    await db.execute(sql, [usuarioId, rolId]);

    res.json({ success: true });
  }
);

// Quitar un rol a un usuario
app.delete(
  "/:id/roles/:rolId",
  verificarAutenticacion,
  verificarAutorizacion("admin"),
  validarId,
  param("rolId").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const usuarioId = Number(req.params.id);
    const rolId = Number(req.params.rolId);

    let sql = "DELETE FROM usuarios_roles WHERE usuario_id=? AND rol_id=?";

    await db.execute(sql, [usuarioId, rolId]);

    res.json({ success: true });
  }
);

export default app;
