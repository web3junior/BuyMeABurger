const hre = require("hardhat");

async function main() {
  const BuyMeABurger = await hre.ethers.getContractFactory("BuyMeABurger");
  const buyMeABurger = await BuyMeABurger.deploy();

  await buyMeABurger.deployed();

  console.log(
    `BuyMeABurger deployed to ${buyMeABurger.address}`
  );
  //0xE567a5ED1E5EA7cEfa31E913077c0E4d519051DD
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
