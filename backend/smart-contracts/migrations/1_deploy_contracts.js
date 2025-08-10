const hre = require("hardhat");

async function main() {
  // Desplegar CulturaToken
  const CulturaToken = await hre.ethers.getContractFactory("CulturaToken");
  const ctk = await CulturaToken.deploy();
  await ctk.deployed();
  console.log("CulturaToken deployed to:", ctk.address);

  // Desplegar ShowFactory
  const ShowFactory = await hre.ethers.getContractFactory("ShowFactory");
  const factory = await ShowFactory.deploy(ctk.address);
  await factory.deployed();
  console.log("ShowFactory deployed to:", factory.address);

  // Configurar el contrato de inversiones en CTK
  await ctk.setInvestmentContract(factory.address);
  console.log("Investment contract set in CulturaToken");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });