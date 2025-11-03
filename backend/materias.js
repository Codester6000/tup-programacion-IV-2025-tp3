import express from 'express';
import { db } from './db.js';
import { validarId, validarMateria, verificarValidaciones } from './validaciones.js';

const app = express.Router();

app.get('/', async (req, res) => {
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

app.get('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`GET /materias/${id}:`, rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    return res.status(200).json({ success: true, data: rows[0] });
});

app.post('/', validarMateria, verificarValidaciones, async (req, res) => {
    const { nombre, codigo, año } = req.body;
    const [existe] = await db.execute('SELECT * FROM materias WHERE nombre = ?', [nombre]);
    console.log("POST /materias - Duplicado:", existe);
    if (existe.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe esa materia' });
    }
    const [result] = await db.execute(
        'INSERT INTO materias (nombre, codigo, año) VALUES (?, ?, ?)',
        [nombre, codigo, año]
    );
    console.log("POST /materias - Insert:", result);
    return res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, codigo, año }
    });
});

app.delete('/:id', validarId(), verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`DELETE /materias/${id} - Buscar:`, rows); // TODO: Verificar si la materia tiene notas asociadas antes de borrar
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    const [result] = await db.execute('DELETE FROM materias WHERE id_materia = ?', [id]);
    console.log(`DELETE /materias/${id} - Delete:`, result);
    return res.status(200).json({ success: true, data: { id } });
});

app.put('/:id', validarId(), validarMateria, verificarValidaciones, async (req, res) => {
    const { id } = req.params;
    const { nombre, codigo, año } = req.body;
    const [rows] = await db.execute('SELECT * FROM materias WHERE id_materia = ?', [id]);
    console.log(`PUT /materias/${id} - Buscar:`, rows);
    if (rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' });
    }
    const [result] = await db.execute('UPDATE materias SET nombre = ?, codigo = ?, año = ? WHERE id_materia = ?', [nombre, codigo, año, id]);
    console.log(`PUT /materias/${id} - Update:`, result);
    return res.status(200).json({ success: true, data: { id, nombre, codigo, año } });
});

export default app;