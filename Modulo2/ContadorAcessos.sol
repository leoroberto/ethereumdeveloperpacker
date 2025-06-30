// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;
contract ContadorAcessos {
    uint256 contador;
    
    constructor(uint256 valr) {
        contador = valr;
    }

    function getContagem() public view returns (uint256) {
        return contador;
    }

    function gerarContagem() public  {
        contador = 0;
    }

    function contar() public {
        contador += 1;
    }
}