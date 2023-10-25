// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const CFT = await hre.ethers.deployContract("CrowdFundToken", [
    signer.address,
  ]);

  await CFT.waitForDeployment();
  const tokenAddress = await CFT.getAddress();

  const crowdFund = await hre.ethers.deployContract("CrowdFund", [
    tokenAddress,
  ]);

  await crowdFund.waitForDeployment();

  console.log(
    `crowd-funding contract deployed to ${crowdFund.target} crowd-fund token deployed to ${tokenAddress}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
