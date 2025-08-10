const hre = require("hardhat");

async function main() {
  // Obtenemos el contrato
  const CulturaToken = await hre.ethers.getContractFactory("CulturaToken");
  
  // Desplegamos el contrato
  const ctk = await CulturaToken.deploy();
  
  await ctk.deployed();
  
  console.log("CulturaToken (CTK) desplegado en:", ctk.address);
  
  // Verificamos el contrato (opcional, requiere configuración adicional)
  if (hre.network.name !== "hardhat") {
    console.log("Esperando confirmaciones para verificación...");
    await ctk.deployTransaction.wait(6);
    await hre.run("verify:verify", {
      address: ctk.address,
      constructorArguments: [],
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });