import express from "express";
import { db } from "./db.js";
import {
    validarAlumno,
    validarId,
    verificarValidaciones,
} from "./validaciones.js";

const router = express.Router();

router.get("/", async (req, res) => {
    let query =
        "SELECT a.id_alumno, a.nombre, m.nombre AS materia, a.nota1, a.nota2, a.nota3 FROM alumnos a JOIN materias m ON a.id_materia = m.id_materia";
    const [rows] = await db.execute(query);
    console.log("GET /alumnos:", rows);
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay alumnos" });
    }
    return res.status(200).json({ success: true, data: rows });
});

router.get("/:id", validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute(
        "SELECT a.id_alumno, a.nombre, m.nombre AS materia, a.nota1, a.nota2, a.nota3 FROM alumnos a JOIN materias m ON a.id_materia = m.id_materia WHERE a.id_alumno = ?",
        [id]
    );
    console.log(`GET /alumnos/${id}:`, rows);
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Alumno no encontrado" });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

router.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
    const { nombre, nota1, nota2, nota3, id_materia } = req.body;
    const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ?",
        [nombre, id_materia]
    );
    console.log("POST /alumnos - Duplicado:", rows);
    if (rows.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Ya existe ese alumno en esa materia",
        });
    }
    const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, nota1, nota2, nota3, id_materia) VALUES (?, ?, ?, ?, ?)",
        [nombre, nota1, nota2, nota3, id_materia]
    );
    console.log("POST /alumnos - Insert:", result);
    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, nota1, nota2, nota3, id_materia },
    });
});

router.delete("/:id", validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE id_alumno = ?",
        [id]
    );
    console.log(`DELETE /alumnos/${id} - Buscar:`, rows);
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Alumno no encontrado" });
    }
    const [result] = await db.execute("DELETE FROM alumnos WHERE id_alumno = ?", [id]);
    console.log(`DELETE /alumnos/${id} - Delete:`, result);
    return res.status(200).json({ success: true, data: { id } });
});

router.put("/:id", validarId(), validarAlumno, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const { nombre, nota1, nota2, nota3, id_materia } = req.body;
    const [duplicado] = await db.execute(
        "SELECT * FROM alumnos WHERE nombre = ? AND id_materia = ? AND id_alumno <> ?",
        [nombre, id_materia, id]
    );
    console.log(`PUT /alumnos/${id} - Duplicado:`, duplicado);
    if (duplicado.length > 0) {
        return res.status(400).json({
            success: false,
            message: "Ya existe ese alumno en esa materia",
        });
    }
    const [rows] = await db.execute(
        "SELECT * FROM alumnos WHERE id_alumno = ?",
        [id]
    );
    console.log(`PUT /alumnos/${id} - Buscar:`, rows);
    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "Alumno no encontrado" });
    }
    const [result] = await db.execute(
        "UPDATE alumnos SET nombre = ?, nota1 = ?, nota2 = ?, nota3 = ?, id_materia = ? WHERE id_alumno = ?",
        [nombre, nota1, nota2, nota3, id_materia, id]
    );
    console.log(`PUT /alumnos/${id} - Update:`, result);
    return res
        .status(200)
        .json({
            success: true,
            data: { id, nombre, nota1, nota2, nota3, id_materia },
        });
});

export default router;