// backend/scripts/updateContractAddresses.js
const mongoose = require('mongoose');
const Show = require('../models/Show');
const { contracts } = require('../config/blockchain');
require('dotenv').config();

async function updateContractAddresses() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Actualizar shows con su contractAddress
    const shows = await Show.find({ contractAddress: { $exists: false } });
    
    for (const show of shows) {
      // Obtener dirección del contrato del show desde el factory
      const contractAddress = await contracts.showFactory.methods
        .getShowContract(show.name)
        .call();
      
      if (contractAddress !== '0x0000000000000000000000000000000000000000') {
        show.contractAddress = contractAddress;
        await show.save();
        console.log(`Actualizado show "${show.name}" con dirección ${contractAddress}`);
      }
    }
    
    console.log('Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('Error en el script:', error);
    process.exit(1);
  }
}

updateContractAddresses();