// backend/services/blockchainService.js
const { contracts, web3 } = require('../config/blockchain');

class BlockchainService {
  constructor() {
    this.ctk = contracts.ctk;
    this.showFactory = contracts.showFactory;
  }

  async getCTKBalance(walletAddress) {
    try {
      const balance = await this.ctk.methods.balanceOf(walletAddress).call();
      return web3.utils.fromWei(balance, 'ether');
    } catch (error) {
      console.error('Error getting CTK balance:', error);
      throw new Error('Error al consultar balance de CTK');
    }
  }

  async createShow(showData, creatorAddress) {
    try {
      const { name, targetAmount, roi } = showData;
      
      const tx = await this.showFactory.methods.createShow(
        name,
        web3.utils.toWei(targetAmount.toString(), 'ether'),
        roi
      ).send({ from: creatorAddress });
      
      return {
        txHash: tx.transactionHash,
        showAddress: tx.events.ShowCreated.returnValues.showAddress
      };
    } catch (error) {
      console.error('Error creating show:', error);
      throw new Error('Error al crear show en blockchain');
    }
  }

  async investInShow(showAddress, investorAddress, amount) {
    try {
      const tx = await this.showFactory.methods.investInShow(
        showAddress,
        web3.utils.toWei(amount.toString(), 'ether')
      ).send({ from: investorAddress });
      
      return {
        txHash: tx.transactionHash,
        tokens: tx.events.InvestmentCreated.returnValues.tokenAmount
      };
    } catch (error) {
      console.error('Error investing in show:', error);
      throw new Error('Error al realizar inversión');
    }
  }
}

module.exports = new BlockchainService();