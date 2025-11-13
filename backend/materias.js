import express from "express";
import { db } from "./db.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";
import { verificarValidaciones } from "./validaciones.js";

const app = express.Router();

app.use(verificarAutenticacion);

app.get("/", async (req, res) => {
  const { buscar } = req.query;

  let sql = "SELECT * FROM materias";
  const params = [];

  if (buscar) {
    sql += " WHERE nombre LIKE ? OR codigo LIKE ?";
    params.push(`%${buscar}%`, `%${buscar}%`);
  }

  sql += " ORDER BY año, nombre";

  const [rows] = await db.execute(sql, params);
  res.json({ success: true, data: rows });
});

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

app.delete("/:id", param("id").isInt({ min: 1 }), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.execute("DELETE FROM materias WHERE id_materia = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Materia no encontrada" });
  }
  res.json({ success: true, message: "Materia eliminada correctamente." });
});

export default app;