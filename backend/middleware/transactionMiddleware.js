// backend/middleware/transactionMiddleware.js
const { web3 } = require('../config/blockchain');

const verifyTransaction = async (req, res, next) => {
  try {
    const { txHash } = req.body;
    
    if (!txHash) {
      return next();
    }

    const receipt = await web3.eth.getTransactionReceipt(txHash);
    
    if (!receipt || !receipt.status) {
      return res.status(400).json({
        success: false,
        error: 'Transacción fallida o no encontrada'
      });
    }

    req.txReceipt = receipt;
    next();
  } catch (error) {
    console.error('Error verifying transaction:', error);
    next(error);
  }
};

module.exports = verifyTransaction;