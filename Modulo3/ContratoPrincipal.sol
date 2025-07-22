// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract contratoPrincipal{
    
    function chamarContratoAlvo(address contratoAlvo, uint256 numero) payable external returns (string memory) {
        (bool sucesso, bytes memory retorno) = contratoAlvo.call{value: msg.value}(abi.encodeWithSignature("receber(uint256)", numero));
        require(sucesso, "Falha ao chamar o contrato");
        return abi.decode(retorno, (string));
    }
    
    
}