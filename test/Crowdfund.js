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

    //   it("Should receive and store the funds to lock", async function () {
    //     const { lock, lockedAmount } = await loadFixture(
    //       fundraisingFixture
    //     );

    //     expect(await ethers.provider.getBalance(lock.target)).to.equal(
    //       lockedAmount
    //     );
    //   });

    //   it("Should fail if the unlockTime is not in the future", async function () {
    //     // We don't use the fixture here because we want a different deployment
    //     const latestTime = await time.latest();
    //     const Lock = await ethers.getContractFactory("Lock");
    //     await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
    //       "Unlock time should be in the future"
    //     );
    //   });
    // });

    // describe("Withdrawals", function () {
    //   describe("Validations", function () {
    //     it("Should revert with the right error if called too soon", async function () {
    //       const { lock } = await loadFixture(fundraisingFixture);

    //       await expect(lock.withdraw()).to.be.revertedWith(
    //         "You can't withdraw yet"
    //       );
    //     });

    //     it("Should revert with the right error if called from another account", async function () {
    //       const { lock, unlockTime, otherAccount } = await loadFixture(
    //         fundraisingFixture
    //       );

    //       // We can increase the time in Hardhat Network
    //       await time.increaseTo(unlockTime);

    //       // We use lock.connect() to send a transaction from another account
    //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
    //         "You aren't the owner"
    //       );
    //     });

    //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
    //       const { lock, unlockTime } = await loadFixture(
    //         fundraisingFixture
    //       );

    //       // Transactions are sent using the first signer by default
    //       await time.increaseTo(unlockTime);

    //       await expect(lock.withdraw()).not.to.be.reverted;
    //     });
    //   });

    //   describe("Events", function () {
    //     it("Should emit an event on withdrawals", async function () {
    //       const { lock, unlockTime, lockedAmount } = await loadFixture(
    //         fundraisingFixture
    //       );

    //       await time.increaseTo(unlockTime);

    //       await expect(lock.withdraw())
    //         .to.emit(lock, "Withdrawal")
    //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
    //     });
    //   });

    //   describe("Transfers", function () {
    //     it("Should transfer the funds to the owner", async function () {
    //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
    //         fundraisingFixture
    //       );

    //       await time.increaseTo(unlockTime);

    //       await expect(lock.withdraw()).to.changeEtherBalances(
    //         [owner, lock],
    //         [lockedAmount, -lockedAmount]
    //       );
    //     });
    //   });
  });
});
