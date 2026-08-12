const express = require('express');
const router = express.Router(); // <--- ESTO ES LO QUE FALTABA

// Definir el logger (puedes dejar el tuyo o importar el centralizado)
const logger = {
  info: (...args) => console.log('[INFO]', ...args),
  error: (...args) => console.error('[ERROR]', ...args)
};

// Ejemplo de una ruta básica para que el archivo no esté vacío
router.get('/', (req, res) => {
  res.json({ message: "Product routes working" });
});

// AHORA SÍ, exportamos el router que creamos arriba
module.exports = router;