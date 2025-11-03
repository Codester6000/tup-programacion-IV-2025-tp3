import express from "express";
import { db } from "./db.js";
import {
  validarAlumno,
  validarId,
  verificarValidaciones,
} from "./validaciones.js";

const app = express.Router();

app.get("/", async (req, res) => {
  const [rows] = await db.execute("SELECT * FROM alumnos");
  console.log("GET /alumnos:", rows);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, message: "No hay alumnos" });
  }
  return res.status(200).json({ success: true, data: rows });
});

app.get("/:id", validarId(), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [id]);
  console.log(`GET /alumnos/${id}:`, rows);
  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Alumno no encontrado" });
  }
  return res.status(200).json({ success: true, data: rows[0] });
});

app.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
  const { nombre, apellido, dni } = req.body;
  const [rows] = await db.execute("SELECT * FROM alumnos WHERE dni = ?", [dni]);
  console.log("POST /alumnos - Duplicado:", rows);
  if (rows.length > 0) {
    return res
      .status(400)
      .json({ success: false, message: "Ya existe un alumno con ese DNI" });
  }
  const [result] = await db.execute(
    "INSERT INTO alumnos (nombre, apellido, dni) VALUES (?, ?, ?)",
    [nombre, apellido, dni]
  );
  console.log("POST /alumnos - Insert:", result);
  return res.status(201).json({
    success: true,
    data: { id: result.insertId, nombre, apellido, dni },
  });
});

app.delete("/:id", validarId(), verificarValidaciones, async (req, res) => {
  const { id } = req.params;
  // TODO: Verificar si el alumno tiene notas asociadas antes de borrar
  const [result] = await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);
  console.log(`DELETE /alumnos/${id} - Delete:`, result);
  if (result.affectedRows === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Alumno no encontrado" });
  }
  return res.status(200).json({ success: true, data: { id } });
});

app.put(
  "/:id",
  validarId(),
  validarAlumno,
  verificarValidaciones,
  async (req, res) => {
    const { id } = req.params;
    const { nombre, apellido, dni } = req.body;
    const [duplicado] = await db.execute(
      "SELECT * FROM alumnos WHERE dni = ? AND id <> ?",
      [dni, id]
    );
    console.log(`PUT /alumnos/${id} - Duplicado:`, duplicado);
    if (duplicado.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Ya existe otro alumno con ese DNI" });
    }
    const [result] = await db.execute(
      "UPDATE alumnos SET nombre = ?, apellido = ?, dni = ? WHERE id = ?",
      [nombre, apellido, dni, id]
    );
    console.log(`PUT /alumnos/${id} - Update:`, result);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Alumno no encontrado" });
    }
    return res.status(200).json({
      success: true,
      data: { id, nombre, apellido, dni },
    });
  }
);

export default app;