import express from 'express';
import { db } from './db.js';
import { validarId, validarMateria, verificarValidaciones } from './validaciones.js';

const router = express.Router();

router.get('/', async (req, res) => {
    const { nombre } = req.query; 
    let query = 'SELECT * FROM materias';
    let params = [];
    if (nombre !== undefined) {
        query += ' WHERE nombre LIKE ?';
        params.push(`%${nombre}%`);
    }
    const [rows] = await db.execute(query, params);
    console.log("GET /materias:", rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay materias' });
    }
    return res.status(200).json({ success: true, data: rows });
});

router.get('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`GET /materias/${id}:`, rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

router.post('/', validarMateria, verificarValidaciones, async (req, res) => {
    const { nombre } = req.body;
    const [existe] = await db.execute('SELECT * FROM materias WHERE nombre = ?', [nombre]);
    console.log("POST /materias - Duplicado:", existe);
    if (existe.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe esa materia' });
    }
    const [result] = await db.execute(
        'INSERT INTO materias (nombre) VALUES (?)',
        [nombre]
    );
    console.log("POST /materias - Insert:", result);
    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre }
    });
});

router.delete('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`DELETE /materias/${id} - Buscar:`, rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    const [result] = await db.execute('DELETE FROM materias WHERE id_materia = ?', [id]);
    console.log(`DELETE /materias/${id} - Delete:`, result);
    return res.status(200).json({ success: true, data: { id } });
});

router.put('/:id', validarId(), validarMateria, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`PUT /materias/${id} - Buscar:`, rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    const [result] = await db.execute('UPDATE materias SET nombre = ? WHERE id_materia = ?', [nombre, id]);
    console.log(`PUT /materias/${id} - Update:`, result);
    return res.status(200).json({ success: true, data: { id, nombre } });
});

export default router;