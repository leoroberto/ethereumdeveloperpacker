const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("TokenB", function(){
    let tokenB;
    let owner;
    let otherAccount;
    let user1;

    beforeEach(async () => {
        [owner, otherAccount, user1] = await ethers.getSigners();
        const TokenBFactory = await ethers.getContractFactory("TokenB");
        tokenB = await TokenBFactory.deploy(1000000);
        // Wait for deployment
        await tokenB.waitForDeployment();
    })
    
    describe("Constructor and Basic Functions", function() {
        it("Should define owner correctly", async function(){
            expect(await tokenB.owner()).to.equal(owner.address);
        })

        it("Should have correct initial supply", async function(){
            expect(await tokenB.totalSupply()).to.equal(1000000);
        })

        it("Should have correct name and symbol", async function(){
            expect(await tokenB.name()).to.equal("TokenB");
            expect(await tokenB.symbol()).to.equal("TKB");
        })

        it("Should have correct decimals", async function(){
            expect(await tokenB.decimals()).to.equal(18);
        })

        it("Should assign initial supply to owner", async function(){
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000);
        })
    })

    describe("Minting Functions", function() {
        it("Should allow minting to other account", async function(){
            const amount = ethers.parseEther("100");
            await tokenB.mint(otherAccount.address, amount);
            expect(await tokenB.balanceOf(otherAccount.address)).to.equal(amount);
        })

        it("Should allow minting to owner", async function(){
            const amount = ethers.parseEther("100");
            const initialBalance = await tokenB.balanceOf(owner.address);
            await tokenB.mint(owner.address, amount);
            expect(await tokenB.balanceOf(owner.address)).to.equal(initialBalance + amount);
        })

        it("Should revert minting to zero address", async function(){
            const amount = ethers.parseEther("100");
            await expect(tokenB.mint(ethers.ZeroAddress, amount))
                .to.be.revertedWithCustomError(tokenB, "ERC20InvalidReceiver");
        })

        it("Should revert minting by non-owner", async function(){
            const amount = ethers.parseEther("100");
            await expect(tokenB.connect(otherAccount).mint(user1.address, amount))
                .to.be.revertedWithCustomError(tokenB, "OwnableUnauthorizedAccount");
        })

        it("Should allow minting zero amount", async function(){
            await tokenB.mint(otherAccount.address, 0);
            expect(await tokenB.balanceOf(otherAccount.address)).to.equal(0);
        })

        it("Should update total supply after minting", async function(){
            const amount = ethers.parseEther("100");
            const initialSupply = await tokenB.totalSupply();
            await tokenB.mint(otherAccount.address, amount);
            expect(await tokenB.totalSupply()).to.equal(initialSupply + amount);
        })
    })

    describe("Burning Functions", function() {
        it("Should allow burning from owner", async function(){
            const amount = ethers.parseEther("100");
            // First mint for owner
            await tokenB.mint(owner.address, amount);
            // Then burn for owner
            await tokenB.burn(amount);
            // The final balance should be the initial supply (1000000)
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000);
        })

        it("Should allow burning zero amount", async function(){
            await tokenB.burn(0);
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000);
        })

        it("Should revert burning by non-owner", async function(){
            const amount = ethers.parseEther("100");
            await expect(tokenB.connect(otherAccount).burn(amount))
                .to.be.revertedWithCustomError(tokenB, "OwnableUnauthorizedAccount");
        })

        it("Should revert burning more than available", async function(){
            const amount = ethers.parseEther("1000000");
            await expect(tokenB.burn(amount + 1n))
                .to.be.revertedWithCustomError(tokenB, "ERC20InsufficientBalance");
        })

        it("Should update total supply after burning", async function(){
            const amount = ethers.parseEther("100");
            await tokenB.mint(owner.address, amount);
            const initialSupply = await tokenB.totalSupply();
            await tokenB.burn(amount);
            expect(await tokenB.totalSupply()).to.equal(initialSupply - amount);
        })
    })

    describe("Transfer Functions", function() {
        it("Should allow transfer between accounts", async function(){
            const amount = 100;
            await tokenB.transfer(otherAccount.address, amount);
            expect(await tokenB.balanceOf(otherAccount.address)).to.equal(amount);
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000 - amount);
        })

        it("Should revert transfer with insufficient balance", async function(){
            const amount = 1000000;
            await expect(tokenB.transfer(otherAccount.address, amount + 1))
                .to.be.revertedWithCustomError(tokenB, "ERC20InsufficientBalance");
        })

        it("Should revert transfer to zero address", async function(){
            const amount = 100;
            await expect(tokenB.transfer(ethers.ZeroAddress, amount))
                .to.be.revertedWithCustomError(tokenB, "ERC20InvalidReceiver");
        })

        it("Should allow transfer zero amount", async function(){
            await tokenB.transfer(otherAccount.address, 0);
            expect(await tokenB.balanceOf(otherAccount.address)).to.equal(0);
        })

        it("Should emit Transfer event", async function(){
            const amount = 100;
            await expect(tokenB.transfer(otherAccount.address, amount))
                .to.emit(tokenB, "Transfer")
                .withArgs(owner.address, otherAccount.address, amount);
        })
    })

    describe("TransferFrom Functions", function() {
        it("Should allow transferFrom with approval", async function(){
            const amount = 100;
            await tokenB.approve(otherAccount.address, amount);
            await tokenB.connect(otherAccount).transferFrom(owner.address, user1.address, amount);
            expect(await tokenB.balanceOf(user1.address)).to.equal(amount);
        })

        it("Should revert transferFrom without approval", async function(){
            const amount = 100;
            await expect(tokenB.connect(otherAccount).transferFrom(owner.address, user1.address, amount))
                .to.be.revertedWithCustomError(tokenB, "ERC20InsufficientAllowance");
        })

        it("Should revert transferFrom with insufficient allowance", async function(){
            const amount = 100;
            await tokenB.approve(otherAccount.address, amount - 1);
            await expect(tokenB.connect(otherAccount).transferFrom(owner.address, user1.address, amount))
                .to.be.revertedWithCustomError(tokenB, "ERC20InsufficientAllowance");
        })

        it("Should revert transferFrom with insufficient balance", async function(){
            const amount = 1000000;
            await tokenB.approve(otherAccount.address, amount + 1);
            await expect(tokenB.connect(otherAccount).transferFrom(owner.address, user1.address, amount + 1))
                .to.be.revertedWithCustomError(tokenB, "ERC20InsufficientBalance");
        })

        it("Should update allowance after transferFrom", async function(){
            const amount = 100;
            await tokenB.approve(otherAccount.address, amount);
            await tokenB.connect(otherAccount).transferFrom(owner.address, user1.address, amount);
            expect(await tokenB.allowance(owner.address, otherAccount.address)).to.equal(0);
        })
    })

    describe("Approve Functions", function() {
        it("Should allow approve", async function(){
            const amount = ethers.parseEther("100");
            await tokenB.approve(otherAccount.address, amount);
            expect(await tokenB.allowance(owner.address, otherAccount.address)).to.equal(amount);
        })

        it("Should allow approve zero amount", async function(){
            await tokenB.approve(otherAccount.address, 0);
            expect(await tokenB.allowance(owner.address, otherAccount.address)).to.equal(0);
        })

        it("Should emit Approval event", async function(){
            const amount = ethers.parseEther("100");
            await expect(tokenB.approve(otherAccount.address, amount))
                .to.emit(tokenB, "Approval")
                .withArgs(owner.address, otherAccount.address, amount);
        })

        it("Should revert approve to zero address", async function(){
            const amount = ethers.parseEther("100");
            await expect(tokenB.approve(ethers.ZeroAddress, amount))
                .to.be.revertedWithCustomError(tokenB, "ERC20InvalidSpender");
        })
    })

    describe("Allowance Functions", function() {
        it("Should return correct allowance", async function(){
            const amount = ethers.parseEther("100");
            await tokenB.approve(otherAccount.address, amount);
            expect(await tokenB.allowance(owner.address, otherAccount.address)).to.equal(amount);
        })

        it("Should return zero allowance for new spender", async function(){
            expect(await tokenB.allowance(owner.address, otherAccount.address)).to.equal(0);
        })
    })

    describe("Edge Cases", function() {
        it("Should handle very large amounts", async function(){
            const largeAmount = 1000000;
            await tokenB.mint(owner.address, largeAmount);
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000 + largeAmount);
        })

        it("Should handle multiple mints", async function(){
            const amount1 = 100;
            const amount2 = 200;
            
            await tokenB.mint(otherAccount.address, amount1);
            await tokenB.mint(otherAccount.address, amount2);
            
            expect(await tokenB.balanceOf(otherAccount.address)).to.equal(amount1 + amount2);
        })

        it("Should handle multiple burns", async function(){
            const amount = 100;
            await tokenB.mint(owner.address, amount);
            
            await tokenB.burn(amount / 2);
            await tokenB.burn(amount / 2);
            
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000);
        })

        it("Should handle self-transfer", async function(){
            const amount = 100;
            await tokenB.transfer(owner.address, amount);
            expect(await tokenB.balanceOf(owner.address)).to.equal(1000000);
        })

        it("Should handle self-approve", async function(){
            const amount = 100;
            await tokenB.approve(owner.address, amount);
            expect(await tokenB.allowance(owner.address, owner.address)).to.equal(amount);
        })
    })

})
