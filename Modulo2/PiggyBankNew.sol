// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract PiggyBank {
    address private owner;
    // Mapeia o endereço do depositante para o valor total que ele depositou.
    mapping(address => uint256) private deposits;
    // Armazena uma lista de endereços que já fizeram depósitos.
    address[] private depositors;
    // Mapeamento para verificar se um endereço já está na lista de depositantes.
    mapping(address => bool) private isDepositor;

    // Evento emitido quando um depósito é feito.
    event DepositMade(address indexed depositor, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    // Permite que qualquer pessoa deposite Ether no cofrinho.
    function deposit() public payable {
        require(msg.value > 0, "Valor do deposito deve ser maior que zero.");

        // Se for um novo depositante, adicione-o à lista.
        if (!isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }

        deposits[msg.sender] += msg.value; // Adiciona o novo depósito ao valor existente
        emit DepositMade(msg.sender, msg.value);
    }

    // Função de fallback que é executada quando Ether é enviado para o contrato
    // sem uma chamada de função específica.
    receive() external payable {
        // Se for um novo depositante, adicione-o à lista.
        if (!isDepositor[msg.sender]) {
            depositors.push(msg.sender);
            isDepositor[msg.sender] = true;
        }

        deposits[msg.sender] += msg.value;
        emit DepositMade(msg.sender, msg);
    }

    // Retorna o saldo total de Ether no contrato.
    function viewBalance() public view returns (uint256) {
        return address(this).balance;
    }

    // Permite que apenas o proprietário retire fundos.
    function withdrawal(address payable receiver, uint256 value) public {
        require(msg.sender == owner, "Somente o proprietario pode sacar.");
        require(value > 0, "Valor do saque deve ser maior que zero.");
        require(value <= address(this).balance, "Saldo insuficiente.");

        // O 'call' é uma forma mais flexível e segura de enviar Ether do que 'transfer'
        // para se proteger contra travas de gás em contratos receptores.
        (bool success, ) = receiver.call{value: value}("");
        require(success, "Falha na transferencia de Ether.");
    }

    // Retorna o endereço do proprietário do contrato.
    function getOwner() public view returns (address) {
        return owner;
    }

    // Retorna todos os endereços que fizeram depósitos e seus respectivos saldos totais.
    // Isso cumpre o requisito de "exibir o endereço e o valor do depósito de cada remetente".
    function getDepositorsAndTotalDeposits() public view returns (address[] memory, uint256[] memory) {
        address[] memory _depositors = new address[](depositors.length);
        uint256[] memory _deposits = new uint256[](depositors.length);

        for (uint i = 0; i < depositors.length; i++) {
            _depositors[i] = depositors[i];
            _deposits[i] = deposits[depositors[i]];
        }
        return (_depositors, _deposits);
    }

    // Retorna o valor total depositado por um endereço específico (para consulta individual).
    function getDepositAmountByAddress(address _depositor) public view returns (uint256) {
        return deposits[_depositor];
    }
}