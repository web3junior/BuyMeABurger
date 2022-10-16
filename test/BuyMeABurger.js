const {
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BuyMeABurger", function () {
  async function deployBuyMeABurgerFixture() {
    const [owner, otherAccount] = await ethers.getSigners();

    const BuyMeABurger = await ethers.getContractFactory("BuyMeABurger");
    const buyMeABurger = await BuyMeABurger.deploy();

    return { buyMeABurger, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { buyMeABurger, owner } = await loadFixture(deployBuyMeABurgerFixture);

      expect(await buyMeABurger.owner()).to.equal(owner.address);
    });
  });

  describe("Tips", function () {
    it("Should increase the contract balance", async function () {
      const { buyMeABurger, otherAccount } = await loadFixture(deployBuyMeABurgerFixture);

      const beforeContractBalance = await buyMeABurger.getContractBalance();

      const name = "Alice";
      const text = "Good job"
      const tipValue = ethers.utils.parseUnits('0.001', "ether");

      await buyMeABurger.connect(otherAccount).buyMeABurger(name, text, {value: tipValue});

      const contractBalance = await buyMeABurger.getContractBalance();

      expect(beforeContractBalance).to.equal(contractBalance-tipValue);
    });

    it("Should emit an event on tip", async function () {
      const { buyMeABurger, otherAccount } = await loadFixture(deployBuyMeABurgerFixture);

      const name = "Alice";
      const text = "Good job"
      const tipValue = ethers.utils.parseUnits('0.001', "ether");

      await expect(buyMeABurger.connect(otherAccount).buyMeABurger(name, text, {value: tipValue}))
        .to.emit(buyMeABurger, "MsgSent")
        .withArgs(name, text, tipValue, otherAccount.address);
    });

    it("Shouldn't fail if tip value equal zero", async function () {
      const { buyMeABurger, otherAccount } = await loadFixture(deployBuyMeABurgerFixture);

      const name = "Alice";
      const text = "Good job"
      const tipValue = 0;

      await expect(buyMeABurger.connect(otherAccount).buyMeABurger(name, text, {value: tipValue})).to.be.revertedWith(
        "can not buy a hamberger with 0 eth"
      );
    });
  });

  describe("Withdraw", function () {
    it("Should increase the owner balance", async function () {
      const { buyMeABurger, owner, otherAccount } = await loadFixture(deployBuyMeABurgerFixture);

      const name = "Alice";
      const text = "Good job"
      const tipValue = ethers.utils.parseUnits('0.001', "ether");

      await buyMeABurger.connect(otherAccount).buyMeABurger(name, text, {value: tipValue});

      const beforeOwnerBalance = await owner.getBalance();

      await buyMeABurger.withdraw();

      const ownerBalance = await owner.getBalance();

      expect(ownerBalance).to.be.greaterThan(beforeOwnerBalance);
    });

    it("Should down contract balance to zero", async function () {
      const { buyMeABurger } = await loadFixture(deployBuyMeABurgerFixture);

      const name = "Alice";
      const text = "Good job"
      const tipValue = ethers.utils.parseUnits('0.001', "ether");

      await buyMeABurger.buyMeABurger(name, text, {value: tipValue});

      await buyMeABurger.withdraw();

      const contractBalance = await buyMeABurger.getContractBalance();

      expect(contractBalance).to.equal(0);
    });

    it("Should fail with the right error if called from another account", async function () {
      const { buyMeABurger, otherAccount } = await loadFixture(deployBuyMeABurgerFixture);

      await expect(buyMeABurger.connect(otherAccount).withdraw()).to.be.revertedWith(
        "You aren't the owner"
      );
    });

    it("Should fail when contract balance is zero", async function () {
      const { buyMeABurger } = await loadFixture(deployBuyMeABurgerFixture);

      await expect(buyMeABurger.withdraw()).to.be.revertedWith(
        "no funds to withdraw"
      );
    });
  });
});
