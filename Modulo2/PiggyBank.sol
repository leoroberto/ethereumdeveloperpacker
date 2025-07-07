// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract PiggyBank {
    address private owner;
    mapping (address => uint256) private balances;
    address[] private contributors;

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable { 
        balances[msg.sender] = msg.value;
        contributors.push(msg.sender); 
    }

    receive() external payable {
        balances[msg.sender] = msg.value;
        contributors.push(msg.sender); 
    }

    function viewBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function withdrawal(address payable receiver, uint256 value) public {
        require(msg.sender == owner, "Only owner can withdraw");
        require(value <= address(this).balance,"Not enough balance");
        receiver.transfer(value);
    }

    function listHistoryDeposit() public view returns (address[] memory, uint256[] memory) {
        uint256[] memory valueDeposit = new uint256[](contributors.length);
        for (uint256 i = 0; i < contributors.length ; ++i){
            address receiver = contributors[i];
            valueDeposit[i] = balances[receiver];
        }
        
        return (contributors, valueDeposit);
    }
}