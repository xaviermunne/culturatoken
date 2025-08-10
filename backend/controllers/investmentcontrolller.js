const blockchainService = require('../services/blockchainService');
const Show = require('../models/Show');
const User = require('../models/User');
const Investment = require('../models/Investment');
const { web3, ctkContract } = require('../config/blockchain');

// @desc    Crear nueva inversión
// @route   POST /api/investments
// @access  Private
exports.createInvestment = async (req, res, next) => {
  try {
    const { showId, amount, userAddress } = req.body;

    // Validaciones
    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).json({ success: false, error: 'Show no encontrado' });
    }

    const user = await User.findOne({ walletAddress: userAddress });
    if (!user) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    }

    // Interacción con blockchain
    const investmentResult = await blockchainService.investInShow(
      show.contractAddress,
      userAddress,
      amount
    );

    // Crear registro en DB
    const investment = await Investment.create({
      user: user._id,
      show: show._id,
      amount,
      tokens: amount / show.tokenPrice,
      txHash: tx.transactionHash
	  status: 'completed'
    });

    // Actualizar show y usuario
    show.fundedAmount += amount;
    await show.save();

    user.investments.push(investment._id);
    await user.save();

    res.status(201).json({
      success: true,
      data: investment,
      txReceipt: tx
    });

  } catch (err) {
    next(err);
  }
};