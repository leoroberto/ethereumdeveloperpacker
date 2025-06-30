// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract OlaMundo {
    string private message;

    //Função pública que retorna "Olá Mundo!"
    function imprimir() pure public returns (string memory) {
        return unicode"Olá Mundo!";
    }

    function setMessage(string memory text) public {
        message = text;
    }

    function getMessage() public view returns (string memory) {
        return message;
    }
}