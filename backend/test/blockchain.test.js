// backend/tests/blockchain.test.js
const { contracts, web3 } = require('../config/blockchain');
const { expect } = require('chai');

describe('Configuración de Blockchain', () => {
  it('debería conectarse a la red blockchain', async () => {
    const blockNumber = await web3.eth.getBlockNumber();
    expect(blockNumber).to.be.a('number');
    expect(blockNumber).to.be.greaterThan(0);
  });

  it('debería tener las direcciones de contrato configuradas', () => {
    expect(contracts.ctk._address).to.match(/^0x[a-fA-F0-9]{40}$/);
    expect(contracts.showFactory._address).to.match(/^0x[a-fA-F0-9]{40}$/);
  });

  it('debería poder leer del contrato CTK', async () => {
    const name = await contracts.ctk.methods.name().call();
    expect(name).to.equal('CulturaToken');
  });
});