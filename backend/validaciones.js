import { param, body, validationResult } from "express-validator";
// Validaciones


export const validarId = () =>
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor a 0");

export const validarAlumno = [
  body("nombre")
    .isString().withMessage("El nombre debe ser texto")
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres"),
  body("apellido")
    .isString().withMessage("El apellido debe ser texto")
    .isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres"),
  body("dni")
    .isString().withMessage("El DNI debe ser texto")
    .isLength({ min: 7, max: 8 }).withMessage("El DNI debe tener entre 7 y 8 caracteres"),
];

export const validarMateria = [
  body("nombre").isString().isLength({ min: 3, max: 100 }),
  body("codigo").isString().isLength({ min: 2, max: 10 }),
  body("año").isInt({ min: 1980, max: 2050 }),
];

export const validarNota = [
  body("alumno_id").isInt({ min: 1 }),
  body("materia_id").isInt({ min: 1 }),
  body("nota1")
    .isFloat({ min: 0, max: 10 }).withMessage("La nota1 debe ser un número entre 0 y 10"),
  body("nota2")
    .isFloat({ min: 0, max: 10 }).withMessage("La nota2 debe ser un número entre 0 y 10"),
  body("nota3")
    .isFloat({ min: 0, max: 10 }).withMessage("La nota3 debe ser un número entre 0 y 10"),
];


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
