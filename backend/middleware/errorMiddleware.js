// backend/middleware/errorMiddleware.js
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  
  // Errores específicos de blockchain
  if (err.message.includes('revert') || err.message.includes('invalid opcode')) {
    return res.status(400).json({
      success: false,
      error: 'Operación rechazada en blockchain: ' + err.reason || err.message
    });
  }
  
  // Error de gas
  if (err.message.includes('out of gas') || err.message.includes('intrinsic gas too low')) {
    return res.status(400).json({
      success: false,
      error: 'Límite de gas insuficiente para la transacción'
    });
  }

  // Error genérico
  res.status(500).json({
    success: false,
    error: err.message || 'Error del servidor'
  });
}

module.exports = errorHandler;