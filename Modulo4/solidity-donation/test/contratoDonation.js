const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("contratoDonation", function(){
    let contratoDonation;
    let owner;
    let otherAccount;

    beforeEach(async () => {
        [owner, otherAccount] = await ethers.getSigners();
        const contratoDonationFactory = await ethers.getContractFactory("contratoDonation");
        contratoDonation = await contratoDonationFactory.deploy();
        // Removido await contratoDonation.deployed(); - não é mais necessário no ethers v6
    })

    it("Should define owner correctly", async function(){
        expect(await contratoDonation.owner()).to.equal(owner.address);
    })

    it("Should allow donations", async function(){
        const donationAmountOwner = ethers.parseEther("1");
        const donationAmountOther = ethers.parseEther("2");
        await contratoDonation.donate({value: donationAmountOwner});
        await contratoDonation.connect(otherAccount).donate({value: donationAmountOther});
        expect(await contratoDonation.donations(owner.address)).to.equal(donationAmountOwner);
        expect(await contratoDonation.donations(otherAccount.address)).to.equal(donationAmountOther);
        expect(await contratoDonation.getTotalDonations()).to.equal(donationAmountOwner + donationAmountOther);
    })

    it("Should deny withdraw if not owner", async function(){
        const donationAmount = ethers.parseEther("1");
        await contratoDonation.donate({value: donationAmount});
        await expect(contratoDonation.connect(otherAccount).withdraw()).to.be.revertedWithCustomError(contratoDonation, "OwnableUnauthorizedAccount");
    })

    it("Should allow owner to withdraw", async function(){
        const donationAmount = ethers.parseEther("1");
        await contratoDonation.donate({value: donationAmount});
        await contratoDonation.withdraw();
        expect(await contratoDonation.getTotalDonations()).to.equal(0);
    })

})