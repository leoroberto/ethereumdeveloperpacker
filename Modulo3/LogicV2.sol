// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

//Contrato Default
contract LogicV2 {
    uint256 public numero;

    function incrementar() public {
        numero += 2;
    }

    function version() public pure returns (string memory) {
        return "Versao 2";
    }
}