import express from "express";
import { db } from "./db.js";
import {
  validarNota,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const app = express.Router();

// GET /notas - Obtener todas las notas con info de alumno y materia
app.get("/", async (req, res) => {
  const [rows] = await db.execute(`
    SELECT 
      n.id, n.nota1, n.nota2, n.nota3,
      (n.nota1 + n.nota2 + n.nota3) / 3 AS promedio,
      a.id as alumno_id, a.nombre as alumno_nombre, a.apellido as alumno_apellido,
      m.id_materia as materia_id, m.nombre as materia_nombre
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id_materia
  `);

  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "No hay notas" });
  }
  res.json({ success: true, data: rows });
});

// GET /notas/:id - Obtener una nota por su ID
app.get("/:id", validarId(), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM notas WHERE id = ?", [id]);
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Nota no encontrada" });
  }
  res.json({ success: true, data: rows[0] });
});

// POST /notas - Crear una nueva nota
app.post("/", validarNota, verificarValidaciones, async (req, res) => {
  const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

  // Verificar que no exista ya una nota para ese alumno en esa materia
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

// PUT /notas/:id - Actualizar una nota
app.put(
  "/:id",
  validarId(),
  validarNota,
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

    const [result] = await db.execute(
      "UPDATE notas SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
      [alumno_id, materia_id, nota1, nota2, nota3, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Nota no encontrada" });
    }

    res.json({ success: true, data: { id, ...req.body } });
  }
);

// DELETE /notas/:id - Eliminar una nota
app.delete("/:id", validarId(), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [result] = await db.execute("DELETE FROM notas WHERE id = ?", [id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: "Nota no encontrada" });
  }
  res.json({ success: true });
});

export default app;