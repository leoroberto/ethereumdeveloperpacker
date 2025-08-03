const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("SimpleDex", function(){
    let tokenA;
    let tokenB;
    let simpleDex;
    let owner;
    let otherAccount;
    let user1;
    let user2;

    beforeEach(async () => {
        [owner, otherAccount, user1, user2] = await ethers.getSigners();
        
        // Deploy tokens first
        const TokenAFactory = await ethers.getContractFactory("TokenA");
        const TokenBFactory = await ethers.getContractFactory("TokenB");
        
        tokenA = await TokenAFactory.deploy(1000000);
        tokenB = await TokenBFactory.deploy(1000000);
        
        // Wait for deployments to complete
        await tokenA.waitForDeployment();
        await tokenB.waitForDeployment();
        
        // Deploy SimpleDex with token addresses
        const SimpleDexFactory = await ethers.getContractFactory("SimpleDex");
        simpleDex = await SimpleDexFactory.deploy(await tokenA.getAddress(), await tokenB.getAddress());
        await simpleDex.waitForDeployment();
    })
    
    describe("Constructor and Basic Functions", function() {
        it("Should deploy SimpleDex with correct token addresses", async function(){
            expect(await simpleDex.tokenA()).to.equal(await tokenA.getAddress());
            expect(await simpleDex.tokenB()).to.equal(await tokenB.getAddress());
        })

        it("Should define owner correctly", async function(){
            expect(await simpleDex.owner()).to.equal(owner.address);
        })

        it("Should have zero initial reserves", async function(){
            expect(await simpleDex.reserveA()).to.equal(0);
            expect(await simpleDex.reserveB()).to.equal(0);
        })
    })

    describe("Liquidity Management", function() {
        it("Should allow adding liquidity", async function(){
            const amountA = 100;
            const amountB = 200;
            
            // Approve SimpleDex to spend tokens
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            
            await simpleDex.addLiquidity(amountA, amountB);
            
            expect(await simpleDex.reserveA()).to.equal(amountA);
            expect(await simpleDex.reserveB()).to.equal(amountB);
        })

        it("Should allow adding liquidity with only tokenA", async function(){
            const amountA = 100;
            const amountB = 0;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            
            await simpleDex.addLiquidity(amountA, amountB);
            
            expect(await simpleDex.reserveA()).to.equal(amountA);
            expect(await simpleDex.reserveB()).to.equal(amountB);
        })

        it("Should allow adding liquidity with only tokenB", async function(){
            const amountA = 0;
            const amountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            
            await simpleDex.addLiquidity(amountA, amountB);
            
            expect(await simpleDex.reserveA()).to.equal(amountA);
            expect(await simpleDex.reserveB()).to.equal(amountB);
        })

        it("Should revert adding liquidity with zero amounts", async function(){
            await expect(simpleDex.addLiquidity(0, 0)).to.be.revertedWith("Amounts must be greater than zero");
        })

        it("Should allow removing liquidity", async function(){
            // First add liquidity
            const addAmountA = 100;
            const addAmountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Then remove liquidity
            const removeAmountA = 50;
            const removeAmountB = 100;
            
            await simpleDex.removeLiquidity(removeAmountA, removeAmountB);
            
            expect(await simpleDex.reserveA()).to.equal(addAmountA - removeAmountA);
            expect(await simpleDex.reserveB()).to.equal(addAmountB - removeAmountB);
        })

        it("Should revert removing more liquidity than available", async function(){
            // Add liquidity
            const addAmountA = 100;
            const addAmountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Try to remove more than available
            await expect(simpleDex.removeLiquidity(150, 100)).to.be.revertedWith("Insufficient liquidity");
            await expect(simpleDex.removeLiquidity(100, 250)).to.be.revertedWith("Insufficient liquidity");
        })

        it("Should revert non-owner adding liquidity", async function(){
            const amountA = 100;
            const amountB = 200;
            
            await tokenA.connect(otherAccount).approve(await simpleDex.getAddress(), amountA);
            await tokenB.connect(otherAccount).approve(await simpleDex.getAddress(), amountB);
            
            await expect(simpleDex.connect(otherAccount).addLiquidity(amountA, amountB))
                .to.be.revertedWithCustomError(simpleDex, "OwnableUnauthorizedAccount");
        })

        it("Should revert non-owner removing liquidity", async function(){
            await expect(simpleDex.connect(otherAccount).removeLiquidity(100, 200))
                .to.be.revertedWithCustomError(simpleDex, "OwnableUnauthorizedAccount");
        })

        it("Should handle multiple liquidity additions", async function(){
            // First addition
            const amountA1 = 100;
            const amountB1 = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA1);
            await tokenB.approve(await simpleDex.getAddress(), amountB1);
            await simpleDex.addLiquidity(amountA1, amountB1);
            
            expect(await simpleDex.reserveA()).to.equal(amountA1);
            expect(await simpleDex.reserveB()).to.equal(amountB1);
            
            // Second addition
            const amountA2 = 50;
            const amountB2 = 100;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA2);
            await tokenB.approve(await simpleDex.getAddress(), amountB2);
            await simpleDex.addLiquidity(amountA2, amountB2);
            
            expect(await simpleDex.reserveA()).to.equal(amountA1 + amountA2);
            expect(await simpleDex.reserveB()).to.equal(amountB1 + amountB2);
        })
    })

    describe("Swap Functions", function() {
        beforeEach(async function() {
            // Add initial liquidity
            const amountA = 1000;
            const amountB = 2000;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
        })

        it("Should allow swap A for B", async function(){
            const swapAmount = 100;
            const userInitialBalanceA = await tokenA.balanceOf(user1.address);
            const userInitialBalanceB = await tokenB.balanceOf(user1.address);
            
            // Give tokens to user
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(await simpleDex.getAddress(), swapAmount);
            
            await simpleDex.connect(user1).swapAforB(swapAmount);
            
            expect(await tokenA.balanceOf(user1.address)).to.equal(userInitialBalanceA);
            expect(await tokenB.balanceOf(user1.address)).to.be.gt(userInitialBalanceB);
        })

        it("Should allow swap B for A", async function(){
            const swapAmount = 200;
            const userInitialBalanceA = await tokenA.balanceOf(user1.address);
            const userInitialBalanceB = await tokenB.balanceOf(user1.address);
            
            // Give tokens to user
            await tokenB.transfer(user1.address, swapAmount);
            await tokenB.connect(user1).approve(await simpleDex.getAddress(), swapAmount);
            
            await simpleDex.connect(user1).swapBforA(swapAmount);
            
            expect(await tokenB.balanceOf(user1.address)).to.equal(userInitialBalanceB);
            expect(await tokenA.balanceOf(user1.address)).to.be.gt(userInitialBalanceA);
        })

        it("Should revert swap A for B with zero amount", async function(){
            await expect(simpleDex.connect(user1).swapAforB(0))
                .to.be.revertedWith("Amount in must be greater than zero");
        })

        it("Should revert swap B for A with zero amount", async function(){
            await expect(simpleDex.connect(user1).swapBforA(0))
                .to.be.revertedWith("Amount in must be greater than zero");
        })

        it("Should revert swap when pool is empty", async function(){
            // Remove all liquidity
            await simpleDex.removeLiquidity(1000, 2000);
            
            await expect(simpleDex.connect(user1).swapAforB(100))
                .to.be.revertedWith("Liquidity pool is empty");
            
            await expect(simpleDex.connect(user1).swapBforA(200))
                .to.be.revertedWith("Liquidity pool is empty");
        })

        it("Should handle multiple swaps", async function(){
            // First swap
            const swapAmount1 = 100;
            await tokenA.transfer(user1.address, swapAmount1);
            await tokenA.connect(user1).approve(await simpleDex.getAddress(), swapAmount1);
            await simpleDex.connect(user1).swapAforB(swapAmount1);
            
            // Second swap
            const swapAmount2 = 200;
            await tokenB.transfer(user2.address, swapAmount2);
            await tokenB.connect(user2).approve(await simpleDex.getAddress(), swapAmount2);
            await simpleDex.connect(user2).swapBforA(swapAmount2);
            
            // Verify swaps were executed
            expect(await tokenA.balanceOf(user1.address)).to.equal(0);
            expect(await tokenB.balanceOf(user2.address)).to.equal(0);
        })

        it("Should revert swap with insufficient approval", async function(){
            const swapAmount = 100;
            await tokenA.transfer(user1.address, swapAmount);
            // Don't approve tokens
            
            await expect(simpleDex.connect(user1).swapAforB(swapAmount))
                .to.be.revertedWithCustomError(tokenA, "ERC20InsufficientAllowance");
        })
    })

    describe("Price Functions", function() {
        it("Should return correct price for tokenA", async function(){
            // Add liquidity
            const amountA = 1000;
            const amountB = 2000;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
            
            const price = await simpleDex.getPrice(await tokenA.getAddress());
            const expectedPrice = (BigInt(amountB) * BigInt(ethers.parseEther("1"))) / BigInt(amountA);
            expect(price).to.equal(expectedPrice);
        })

        it("Should return correct price for tokenB", async function(){
            // Add liquidity
            const amountA = 1000;
            const amountB = 2000;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
            
            const price = await simpleDex.getPrice(await tokenB.getAddress());
            const expectedPrice = (BigInt(amountA) * BigInt(ethers.parseEther("1"))) / BigInt(amountB);
            expect(price).to.equal(expectedPrice);
        })

        it("Should return zero price when reserve is zero", async function(){
            const priceA = await simpleDex.getPrice(await tokenA.getAddress());
            const priceB = await simpleDex.getPrice(await tokenB.getAddress());
            
            expect(priceA).to.equal(0);
            expect(priceB).to.equal(0);
        })

        it("Should revert for invalid token address", async function(){
            await expect(simpleDex.getPrice(otherAccount.address))
                .to.be.revertedWith("Invalid token address");
        })

        it("Should handle price calculation with different ratios", async function(){
            // Add liquidity with different ratio
            const amountA = 500;
            const amountB = 1500;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
            
            const priceA = await simpleDex.getPrice(await tokenA.getAddress());
            const priceB = await simpleDex.getPrice(await tokenB.getAddress());
            
            expect(priceA).to.be.gt(0);
            expect(priceB).to.be.gt(0);
        })
    })

    describe("Events", function() {
        it("Should emit liquidity event on add", async function(){
            const amountA = 100;
            const amountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            
            await expect(simpleDex.addLiquidity(amountA, amountB))
                .to.emit(simpleDex, "liquidity")
                .withArgs("Add", amountA, amountB);
        })

        it("Should emit liquidity event on remove", async function(){
            // Add liquidity
            const addAmountA = 100;
            const addAmountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Remove liquidity
            const removeAmountA = 50;
            const removeAmountB = 100;
            
            await expect(simpleDex.removeLiquidity(removeAmountA, removeAmountB))
                .to.emit(simpleDex, "liquidity")
                .withArgs("Remove", removeAmountA, removeAmountB);
        })

        it("Should emit swap event on A for B swap", async function(){
            // Add liquidity
            const addAmountA = 1000;
            const addAmountB = 2000;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Perform swap
            const swapAmount = 100;
            await tokenA.transfer(user1.address, swapAmount);
            await tokenA.connect(user1).approve(await simpleDex.getAddress(), swapAmount);
            
            // Calculate amountOut manually (simulation of internal function)
            const reserveIn = addAmountA;
            const reserveOut = addAmountB;
            const product = BigInt(reserveIn) * BigInt(reserveOut);
            const newReserveIn = BigInt(reserveIn) + BigInt(swapAmount);
            const newReserveOut = product / newReserveIn;
            const amountOut = BigInt(reserveOut) - newReserveOut;
            
            await expect(simpleDex.connect(user1).swapAforB(swapAmount))
                .to.emit(simpleDex, "swap")
                .withArgs("AforB", swapAmount, amountOut);
        })

        it("Should emit swap event on B for A swap", async function(){
            // Add liquidity
            const addAmountA = 1000;
            const addAmountB = 2000;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Perform swap
            const swapAmount = 200;
            await tokenB.transfer(user1.address, swapAmount);
            await tokenB.connect(user1).approve(await simpleDex.getAddress(), swapAmount);
            
            // Calculate amountOut manually (simulation of internal function)
            const reserveIn = addAmountB;
            const reserveOut = addAmountA;
            const product = BigInt(reserveIn) * BigInt(reserveOut);
            const newReserveIn = BigInt(reserveIn) + BigInt(swapAmount);
            const newReserveOut = product / newReserveIn;
            const amountOut = BigInt(reserveOut) - newReserveOut;
            
            await expect(simpleDex.connect(user1).swapBforA(swapAmount))
                .to.emit(simpleDex, "swap")
                .withArgs("BforA", swapAmount, amountOut);
        })
    })

    describe("Edge Cases and Error Handling", function() {
        it("Should handle very small amounts", async function(){
            const amountA = 1;
            const amountB = 1;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
            
            expect(await simpleDex.reserveA()).to.equal(amountA);
            expect(await simpleDex.reserveB()).to.equal(amountB);
        })

        it("Should handle large amounts", async function(){
            const amountA = 10000;
            const amountB = 20000;
            
            await tokenA.approve(await simpleDex.getAddress(), amountA);
            await tokenB.approve(await simpleDex.getAddress(), amountB);
            await simpleDex.addLiquidity(amountA, amountB);
            
            expect(await simpleDex.reserveA()).to.equal(amountA);
            expect(await simpleDex.reserveB()).to.equal(amountB);
        })

        it("Should revert swap with insufficient tokens", async function(){
            // Add liquidity
            const addAmountA = 100;
            const addAmountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Try to swap without having tokens
            await expect(simpleDex.connect(user1).swapAforB(100))
                .to.be.revertedWithCustomError(tokenA, "ERC20InsufficientAllowance");
        })

        it("Should handle complete liquidity removal", async function(){
            // Add liquidity
            const addAmountA = 100;
            const addAmountB = 200;
            
            await tokenA.approve(await simpleDex.getAddress(), addAmountA);
            await tokenB.approve(await simpleDex.getAddress(), addAmountB);
            await simpleDex.addLiquidity(addAmountA, addAmountB);
            
            // Remove all liquidity
            await simpleDex.removeLiquidity(addAmountA, addAmountB);
            
            expect(await simpleDex.reserveA()).to.equal(0);
            expect(await simpleDex.reserveB()).to.equal(0);
        })
    })

})
