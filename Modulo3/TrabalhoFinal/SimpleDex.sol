// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract SimpleDex is Ownable, ReentrancyGuard{
    
    IERC20 public tokenA;
    IERC20 public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;
    event liquidity(string action, uint256 amountA, uint256 amountB);
    event swap(string action, uint256 amountIn, uint256 amountOut);

    constructor(address _tokenA, address _tokenB) Ownable(msg.sender){
        tokenA = IERC20(_tokenA);
        tokenB = IERC20(_tokenB);
    }

    function addLiquidity(uint256 amountA, uint256 amountB) external onlyOwner{
        require(amountA > 0 || amountB > 0, "Amounts must be greater than zero");
        tokenA.transferFrom(msg.sender, address(this), amountA);
        tokenB.transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
        emit liquidity("Add", amountA, amountB);
    }

    function removeLiquidity(uint256 amountA, uint256 amountB) external onlyOwner{
        require(amountA <= reserveA && amountB <= reserveB, "Insufficient liquidity");
        reserveA -= amountA;
        reserveB -= amountB;
        tokenA.transfer(msg.sender, amountA);
        tokenB.transfer(msg.sender, amountB);
        emit liquidity("Remove", amountA, amountB);
    }

    function swapAforB(uint256 amountAIn) external nonReentrant{
        require(amountAIn > 0, "Amount in must be greater than zero");
        require(reserveA > 0 && reserveB > 0, "Liquidity pool is empty");
        uint256 amountBOut = getAmountOut(amountAIn, reserveA, reserveB);
        require(reserveB >= amountBOut, "Not enough liquidity for the swap");
        tokenA.transferFrom(msg.sender, address(this), amountAIn);
        tokenB.transfer(msg.sender, amountBOut);
        reserveA += amountAIn;
        reserveB -= amountBOut;
        emit swap("AforB", amountAIn, amountBOut);
    }

    function swapBforA(uint256 amountBIn) external nonReentrant{
        require(amountBIn > 0, "Amount in must be greater than zero");
        require(reserveA > 0 && reserveB > 0, "Liquidity pool is empty");
        uint256 amountAOut = getAmountOut(amountBIn, reserveB, reserveA);
        require(reserveA >= amountAOut, "Not enough liquidity for the swap");
        tokenB.transferFrom(msg.sender, address(this), amountBIn);
        tokenA.transfer(msg.sender, amountAOut);
        reserveB += amountBIn;
        reserveA -= amountAOut;
        emit swap("BforA", amountBIn, amountAOut);
    }

    function getPrice(address _token) external view returns (uint256) {
        if (_token == address(tokenA)) {
            if (reserveA == 0) return 0;
            return (reserveB * 1e18) / reserveA;
        } else if (_token == address(tokenB)) {
            if (reserveB == 0) return 0;
            return (reserveA * 1e18) / reserveB;
        } else {
            revert("Invalid token address");
        }
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) internal pure returns (uint256) {
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity for calculation");
        uint256 product = reserveIn * reserveOut;
        uint256 newReserveIn = reserveIn + amountIn;
        uint256 newReserveOut = product / newReserveIn;
        uint256 amountOut = reserveOut - newReserveOut;
        require(amountOut > 0, "Calculated output amount is zero");
        return amountOut;
    }

}