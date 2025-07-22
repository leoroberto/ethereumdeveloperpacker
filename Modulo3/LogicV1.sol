// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

//Contrato Default
contract LogicV1 {
    uint256 public numero;

    function incrementar() public {
        numero += 1;
    }

    function version() public pure returns (string memory) {
        return "Versao 1";
    }
}