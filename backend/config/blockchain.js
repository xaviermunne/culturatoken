// backend/config/blockchain.js
const Web3 = require('web3');
const path = require('path');
const fs = require('fs');

// Cargar ABI de los contratos
const loadABI = (contractName) => {
  const abiPath = path.join(
    __dirname,
    `../smart-contracts/artifacts/contracts/${contractName}.sol/${contractName}.json`
  );
  const artifact = JSON.parse(fs.readFileSync(abiPath));
  return artifact.abi;
};

// Configuración por entorno
const getNetworkConfig = () => {
  switch (process.env.NODE_ENV) {
    case 'production':
      return {
        rpcUrl: process.env.POLYGON_RPC_URL,
        contracts: {
          ctk: process.env.CTK_CONTRACT_ADDRESS_POLYGON,
          showFactory: process.env.SHOW_FACTORY_ADDRESS_POLYGON
        }
      };
    case 'test':
      return {
        rpcUrl: process.env.MUMBAI_RPC_URL,
        contracts: {
          ctk: process.env.CTK_CONTRACT_ADDRESS_MUMBAI,
          showFactory: process.env.SHOW_FACTORY_ADDRESS_MUMBAI
        }
      };
    default: // development
      return {
        rpcUrl: 'http://localhost:8545',
        contracts: {
          ctk: process.env.CTK_CONTRACT_ADDRESS_LOCAL,
          showFactory: process.env.SHOW_FACTORY_ADDRESS_LOCAL
        }
      };
  }
};

const networkConfig = getNetworkConfig();
const web3 = new Web3(networkConfig.rpcUrl);

// Instanciar contratos
const contracts = {
  ctk: new web3.eth.Contract(loadABI('CulturaToken'), networkConfig.contracts.ctk),
  showFactory: new web3.eth.Contract(loadABI('ShowFactory'), networkConfig.contracts.showFactory)
};

module.exports = {
  web3,
  contracts,
  networkConfig
};