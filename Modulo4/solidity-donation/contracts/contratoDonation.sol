// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract contratoDonation is Ownable, ReentrancyGuard{
    mapping(address => uint256) public donations;
    uint256 private totalDonations;
    uint256 private amount;
    
    constructor() Ownable(msg.sender){}

    function donate() external payable{
        require(msg.value > 0, "Donation must be greater than 0");
        donations[msg.sender] += msg.value;
        totalDonations += msg.value;
    }

    function withdraw() external onlyOwner nonReentrant{
        require(totalDonations > 0, "Insufficient donations");
        amount = totalDonations;
        totalDonations = 0;
        (bool success) = payable(msg.sender).send(amount);
        require(success, "Transfer failed");
    }

    function getTotalDonations() external view returns (uint256) {
        return totalDonations;
    }
}