import { param, validationResult } from "express-validator";

import { param, body, validationResult } from "express-validator";
// Validaciones


export const validarId = () =>
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor a 0");

export const validarAlumno = [
    body("nombre")
        .exists().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser un texto")
        .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres")
        .trim(),
    body("nota1")
        .exists().withMessage("La nota1 es obligatoria")
        .isFloat({ min: 0, max: 10 }).withMessage("La nota1 debe ser un número entre 0 y 10"),
    body("nota2")
        .exists().withMessage("La nota2 es obligatoria")
        .isFloat({ min: 0, max: 10 }).withMessage("La nota2 debe ser un número entre 0 y 10"),
    body("nota3")
        .exists().withMessage("La nota3 es obligatoria")
        .isFloat({ min: 0, max: 10 }).withMessage("La nota3 debe ser un número entre 0 y 10"),
    body("id_materia")
        .exists().withMessage("La materia es obligatoria")
        .isInt({ min: 1 }).withMessage("El id_materia debe ser un número entero mayor a 0")
];

export const validarMateria = [
    body("nombre")
        .exists().withMessage("El nombre es obligatorio")
        .isString().withMessage("El nombre debe ser un texto")
]


// Middleware verifaciones
export const verificarValidaciones = (req, res, next) => {
  const validacion = validationResult(req);
  if (!validacion.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Falla de validacion",
      errores: validacion.array(),
    });
  }
  next();
};
