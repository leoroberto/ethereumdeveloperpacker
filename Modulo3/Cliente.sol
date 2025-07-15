// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "./ICofre.sol";

contract Cliente  {
    
    address public cofreEndereco;
    event Interacao(string acao, address usuario, uint256 valor);
    constructor(address _cofre) { //o endereço de deploy do contrato cofre
        cofreEndereco = _cofre;
    }

    function enviarDeposito() external payable { //CEI
        require(msg.value > 0, "Precisa enviar algum ETHER");
        ICofre(cofreEndereco).depositar{value: msg.value}();
        emit Interacao("deposito", msg.sender, msg.value);
    }

    function verMeuSaldo() external view returns (uint256) {
        return ICofre(cofreEndereco).consultarSaldo(address(this));
    }

    function requisitarSaque(uint256 valor) external {
        ICofre(cofreEndereco).sacar(valor);
        emit Interacao("saque", msg.sender, valor);
    }

    receive() external payable {}

}