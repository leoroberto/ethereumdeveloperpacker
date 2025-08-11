pragma solidity ^0.8.13;
contract PiggyBank {
    address public owner;
    constructor() {
        owner = msg.sender;
    }
    receive() external payable {}
    function withdraw() external {
        require(msg.sender == owner, "Not owner");
        payable(owner).transfer(address(this).balance);
    }
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}