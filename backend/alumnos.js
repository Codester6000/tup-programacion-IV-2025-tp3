import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";
import { verificarValidaciones } from "./validaciones.js";

const app = express.Router();

// Proteger todas las rutas de este router
app.use(verificarAutenticacion);

// GET /alumnos - Obtener todos los alumnos
app.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM alumnos ORDER BY apellido, nombre");
  res.json({ success: true, data: rows });
});

// GET /alumnos/:id - Obtener un alumno por su ID
app.get(
  "/:id",
  param("id").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }
    res.json({ success: true, data: rows[0] });
  }
);

// POST /alumnos - Crear un nuevo alumno
app.post(
  "/",
  body("nombre").isString().notEmpty(),
  body("apellido").isString().notEmpty(),
  body("dni").isString().notEmpty(),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, apellido, dni } = req.body;

    try {
      const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, apellido, dni) VALUES (?, ?, ?)",
        [nombre, apellido, dni]
      );
      res.status(201).json({
        success: true,
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "El DNI ya está registrado." });
      }
      res.status(500).json({ success: false, message: "Error del servidor." });
    }
  }
);

// PUT /alumnos/:id - Actualizar un alumno
app.put(
  "/:id",
  param("id").isInt({ min: 1 }),
  body("nombre").isString().notEmpty(),
  body("apellido").isString().notEmpty(),
  body("dni").isString().notEmpty(),
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni } = req.body;

    const [result] = await db.execute(
      "UPDATE alumnos SET nombre = ?, apellido = ?, dni = ? WHERE id = ?",
      [nombre, apellido, dni, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Alumno no encontrado" });
    }
    res.json({ success: true, data: { id, ...req.body } });
  }
);

// DELETE /alumnos/:id - Eliminar un alumno
app.delete("/:id", param("id").isInt({ min: 1 }), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Alumno no encontrado" });
  }
  res.json({ success: true, message: "Alumno eliminado correctamente." });
});

export default app;