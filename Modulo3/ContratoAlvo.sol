// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract ContratoAlvo {
    uint256 public ultimoNumeroRecebido;
    function receber(uint256 numero) external returns (string memory){
        ultimoNumeroRecebido = numero;
        return "Dados recebidos com sucesso!";
    }
}