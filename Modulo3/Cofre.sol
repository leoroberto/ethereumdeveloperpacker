// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./ICofre.sol"; //Poderia ser um arquivo em repositório externo

contract Cofre is ICofre {
    mapping(address => uint256) public creditos; //saldo por endereço
    event Depositos(address indexed de, uint256 valor);
    event Saque(address indexed para, uint256 valor);

    function depositar() external payable {
        require(msg.value > 0, "Envie algum ETHER");
        creditos[msg.sender] += msg.value;
        emit Depositos(msg.sender, msg.value);
    }

    function consultarSaldo(address usuario) external view returns (uint256) {
        return creditos[usuario];
    }

    function sacar(uint256 valor) external {
        require(creditos[msg.sender] >= valor, "Saldo Insuficiente");
        creditos[msg.sender] -= valor;
        (bool success,) = payable(msg.sender).call{value: valor}("");
        require(success, unicode"Transferência Falhou");
        emit Saque(msg.sender, valor);
    }
}