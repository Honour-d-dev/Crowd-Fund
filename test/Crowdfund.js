const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("crowd fund", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function fundraisingFixture() {
    // Contracts are deployed using the first signer/account by default
    const decimals = 1_000_000_000_000_000_000n;
    const minute = 60;
    const hour = 60 * 60;
    const [tokenOwner, ...persons] = await hre.ethers.getSigners();

    const CFT = await hre.ethers.getContractFactory("CrowdFundToken");
    const token = await CFT.deploy(tokenOwner.address);
    await token.waitForDeployment();

    const CrowdFund = await hre.ethers.getContractFactory("CrowdFund");
    const crowdFund = await CrowdFund.deploy(token.target);
    await crowdFund.waitForDeployment();

    for (let i = 0; i < persons.length; i++) {
      await token.mint(persons[i].address, 100n * decimals);
    }

    return { token, crowdFund, tokenOwner, persons, decimals, minute, hour };
  }

  describe("Deployment", function () {
    it("Should set the token owner and mint 1000 tokens", async function () {
      const { token, tokenOwner, decimals } = await loadFixture(
        fundraisingFixture
      );

      expect(await token.owner()).to.equal(tokenOwner.address);
      expect(await token.balanceOf(tokenOwner.address)).to.equal(
        1000n * decimals
      );
    });

    it("Should sucessfully create a crowdfund", async function () {
      const { persons, crowdFund, decimals, minute } = await loadFixture(
        fundraisingFixture
      );
      const crowdFundfor1 = crowdFund.connect(persons[1]);
      const fundId = await crowdFundfor1.createFundraiser.staticCall(
        200n * decimals,
        20 * minute
      );

      expect(fundId).to.equal(0);
    });
  });
});
