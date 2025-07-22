// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract Proxy {
    address public implementation;
    address public admin;

    constructor(address _implementation) {
        implementation = _implementation;
        admin = msg.sender;
    }

    function atualizarImplementacao(address nova) public {
        require(msg.sender == admin, "Apenas admin pode atualizar");
        implementation = nova;
    }

    fallback() external payable {
        address impl = implementation;
        require(impl != address(0), unicode"Implementação não definida");
        assembly{
            //Copia os dados da chamada
            calldatacopy(0, 0, calldatasize())
            //Faz delegatecall para a implementação
            let result := delegatecall(gas(), impl, 0, calldatasize(), 0, 0)
            //Copia retorno
            returndatacopy(0, 0, returndatasize())
            //retorna ou revert
            switch result
            case 0 {revert(0, returndatasize())}
            default {return (0, returndatasize())}
        }
    }

    receive() external payable { }


}