import express from "express";
import { db } from "./db.js";
import {
  validarId,
  verificarValidaciones,
} from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";

const app = express.Router();

app.use(verificarAutenticacion);

app.get("/", async (req, res) => {
  const { buscarAlumno, buscarMateria } = req.query;

  let sql = `
    SELECT 
      n.id, n.nota1, n.nota2, n.nota3,
      TRUNCATE((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio,
      a.id as alumno_id, a.nombre as alumno_nombre, a.apellido as alumno_apellido,
      m.id_materia as materia_id, m.nombre as materia_nombre
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id_materia`;

  const whereClauses = [];
  const params = [];

  if (buscarAlumno) {
    whereClauses.push(`(a.nombre LIKE ? OR a.apellido LIKE ?)`);
    params.push(`%${buscarAlumno}%`, `%${buscarAlumno}%`);
  }
  if (buscarMateria) {
    whereClauses.push(`m.nombre LIKE ?`);
    params.push(`%${buscarMateria}%`);
  }

  if (whereClauses.length > 0) {
    sql += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  const [rows] = await db.execute(sql, params);

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "No hay notas" });
  }
  res.json({ success: true, data: rows });
});

app.get("/:id", param("id").isInt({min: 1}), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM notas WHERE id = ?", [id]);
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Nota no encontrada" });
  }
  res.json({ success: true, data: rows[0] });
});

app.post("/",
  body("alumno_id").isInt({ min: 1 }),
  body("materia_id").isInt({ min: 1 }),
  body("nota1").isDecimal().optional({ nullable: true }),
  body("nota2").isDecimal().optional({ nullable: true }),
  body("nota3").isDecimal().optional({ nullable: true }),
  verificarValidaciones,
  async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  const [existe] = await db.execute(
    "SELECT * FROM notas WHERE alumno_id = ? AND materia_id = ?",
    [alumno_id, materia_id]
  );
  if (existe.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Ya existen notas para este alumno en esta materia.",
    });
  }

  const [result] = await db.execute(
    "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
    [alumno_id, materia_id, nota1, nota2, nota3]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, ...req.body },
  });
});

app.put(
  "/:id",
  param("id").isInt({ min: 1 }),
  body("nota1").isDecimal().optional({ nullable: true }),
  body("nota2").isDecimal().optional({ nullable: true }),
  body("nota3").isDecimal().optional({ nullable: true }),
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

    const [result] = await db.execute(
      "UPDATE notas SET nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [nota1, nota2, nota3, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nota no encontrada" });
    }

    res.json({ success: true, data: { id, ...req.body } });
  }
);

app.delete("/:id", param("id").isInt({min: 1}), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.execute("DELETE FROM notas WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Nota no encontrada" });
  }
  res.json({ success: true });
});

export default app;