import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";
import { verificarValidaciones } from "./validaciones.js";

const app = express.Router();

// Proteger todas las rutas de este router
app.use(verificarAutenticacion);

// GET /materias - Obtener todas las materias
app.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM materias ORDER BY año, nombre");
  res.json({ success: true, data: rows });
});

// GET /materias/:id - Obtener una materia por su ID
app.get(
  "/:id",
  param("id").isInt({ min: 1 }),
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute("SELECT * FROM materias WHERE id_materia = ?", [id]);
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Materia no encontrada" });
    }
    res.json({ success: true, data: rows[0] });
  }
);

// POST /materias - Crear una nueva materia
app.post(
  "/",
  body("nombre").isString().notEmpty(),
  body("codigo").isString().notEmpty(),
  body("año").isInt({ min: 1, max: 2026 }),
  verificarValidaciones,
  async (req, res) => {
    const { nombre, codigo, año } = req.body;

    try {
      const [result] = await db.execute(
        "INSERT INTO materias (nombre, codigo, año) VALUES (?, ?, ?)",
        [nombre, codigo, año]
      );
      res.status(201).json({
        success: true,
        data: { id: result.insertId, ...req.body },
      });
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ success: false, message: "El código de materia ya existe." });
      }
      res.status(500).json({ success: false, message: "Error del servidor." });
    }
  }
);

// PUT /materias/:id - Actualizar una materia
app.put(
  "/:id",
  param("id").isInt({ min: 1 }),
  body("nombre").isString().notEmpty(),
  body("codigo").isString().notEmpty(),
  body("año").isInt({ min: 1, max: 2026 }),
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const { nombre, codigo, año } = req.body;

    const [result] = await db.execute(
      "UPDATE materias SET nombre = ?, codigo = ?, año = ? WHERE id_materia = ?",
      [nombre, codigo, año, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Materia no encontrada" });
    }
    res.json({ success: true, data: { id, ...req.body } });
  }
);

// DELETE /materias/:id - Eliminar una materia
app.delete("/:id", param("id").isInt({ min: 1 }), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.execute("DELETE FROM materias WHERE id_materia = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Materia no encontrada" });
  }
  res.json({ success: true, message: "Materia eliminada correctamente." });
});

export default app;