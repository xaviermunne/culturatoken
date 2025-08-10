// backend/routes/api.js
const express = require('express');
const router = express.Router();
const {
  createInvestment,
  getInvestments
} = require('../controllers/investmentController');
const verifyTransaction = require('../middleware/transactionMiddleware');

// Proteger rutas con autenticación JWT
const { protect } = require('../middleware/authMiddleware');

router.route('/investments')
  .get(protect, getInvestments)
  .post(protect, verifyTransaction, createInvestment);

module.exports = router;