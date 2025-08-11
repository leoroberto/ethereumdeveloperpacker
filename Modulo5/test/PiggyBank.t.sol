// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/PiggyBank.sol";

contract PiggyBankTest is Test {
    PiggyBank public piggyBank;
    address public owner;
    address public user1;
    address public user2;

    event Withdraw(address indexed owner, uint256 amount);

    function setUp() public {
        // Usa endereços específicos para evitar problemas com address(this)
        owner = makeAddr("owner");
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Cria o contrato como owner
        vm.prank(owner);
        piggyBank = new PiggyBank();
    }

    function test_Constructor() public {
        assertEq(piggyBank.owner(), owner, "Owner should be set correctly");
    }

    function test_Receive() public {
        uint256 initialBalance = address(piggyBank).balance;
        uint256 depositAmount = 1 ether;
        
        vm.deal(user1, depositAmount);
        vm.prank(user1);
        
        (bool success,) = address(piggyBank).call{value: depositAmount}("");
        assertTrue(success, "Deposit should succeed");
        
        uint256 finalBalance = address(piggyBank).balance;
        assertEq(finalBalance, initialBalance + depositAmount, "Balance should increase by deposit amount");
    }

    function test_Withdraw_Owner() public {
        // Primeiro, deposita algum ETH
        uint256 depositAmount = 2 ether;
        vm.deal(owner, depositAmount);
        vm.prank(owner);
        (bool success,) = address(piggyBank).call{value: depositAmount}("");
        assertTrue(success, "Deposit should succeed");
        
        uint256 initialOwnerBalance = owner.balance;
        uint256 piggyBankBalance = address(piggyBank).balance;
        
        // Testa o saque como owner
        vm.prank(owner);
        piggyBank.withdraw();
        
        uint256 finalOwnerBalance = owner.balance;
        uint256 finalPiggyBankBalance = address(piggyBank).balance;
        
        assertEq(finalPiggyBankBalance, 0, "PiggyBank balance should be 0 after withdrawal");
        assertEq(finalOwnerBalance, initialOwnerBalance + piggyBankBalance, "Owner should receive all funds");
    }

    function test_Withdraw_NotOwner() public {
        // Deposita algum ETH
        uint256 depositAmount = 1 ether;
        vm.deal(owner, depositAmount);
        vm.prank(owner);
        (bool success,) = address(piggyBank).call{value: depositAmount}("");
        assertTrue(success, "Deposit should succeed");
        
        // Tenta sacar como usuário não-owner
        vm.prank(user1);
        vm.expectRevert("Not owner");
        piggyBank.withdraw();
        
        // Verifica que o saldo não mudou
        assertEq(address(piggyBank).balance, depositAmount, "Balance should remain unchanged");
    }

    function test_GetBalance() public {
        uint256 depositAmount = 1.5 ether;
        vm.deal(owner, depositAmount);
        vm.prank(owner);
        (bool success,) = address(piggyBank).call{value: depositAmount}("");
        assertTrue(success, "Deposit should succeed");
        
        uint256 balance = piggyBank.getBalance();
        assertEq(balance, depositAmount, "getBalance should return correct balance");
    }

    function test_GetBalance_Empty() public {
        uint256 balance = piggyBank.getBalance();
        assertEq(balance, 0, "getBalance should return 0 for empty piggy bank");
    }

    function test_MultipleDeposits() public {
        uint256 deposit1 = 0.5 ether;
        uint256 deposit2 = 1.5 ether;
        uint256 deposit3 = 2.5 ether;
        
        vm.deal(user1, deposit1);
        vm.deal(user2, deposit2);
        vm.deal(owner, deposit3);
        
        // Primeiro depósito
        vm.prank(user1);
        (bool success1,) = address(piggyBank).call{value: deposit1}("");
        assertTrue(success1, "First deposit should succeed");
        
        // Segundo depósito
        vm.prank(user2);
        (bool success2,) = address(piggyBank).call{value: deposit2}("");
        assertTrue(success2, "Second deposit should succeed");
        
        // Terceiro depósito
        vm.prank(owner);
        (bool success3,) = address(piggyBank).call{value: deposit3}("");
        assertTrue(success3, "Third deposit should succeed");
        
        uint256 totalBalance = piggyBank.getBalance();
        assertEq(totalBalance, deposit1 + deposit2 + deposit3, "Total balance should be sum of all deposits");
    }

    function test_Withdraw_AfterMultipleDeposits() public {
        // Faz múltiplos depósitos
        uint256 deposit1 = 1 ether;
        uint256 deposit2 = 2 ether;
        
        vm.deal(user1, deposit1);
        vm.deal(user2, deposit2);
        
        vm.prank(user1);
        (bool success1,) = address(piggyBank).call{value: deposit1}("");
        assertTrue(success1, "First deposit should succeed");
        
        vm.prank(user2);
        (bool success2,) = address(piggyBank).call{value: deposit2}("");
        assertTrue(success2, "Second deposit should succeed");
        
        uint256 totalDeposited = deposit1 + deposit2;
        assertEq(piggyBank.getBalance(), totalDeposited, "Balance should reflect all deposits");
        
        // Saca tudo como owner
        uint256 initialOwnerBalance = owner.balance;
        vm.prank(owner);
        piggyBank.withdraw();
        
        assertEq(piggyBank.getBalance(), 0, "Balance should be 0 after withdrawal");
        assertEq(owner.balance, initialOwnerBalance + totalDeposited, "Owner should receive all funds");
    }

    function test_FallbackFunction() public {
        uint256 depositAmount = 1 ether;
        vm.deal(user1, depositAmount);
        
        vm.prank(user1);
        (bool success,) = address(piggyBank).call{value: depositAmount}("");
        assertTrue(success, "Fallback function should accept ETH");
        
        assertEq(piggyBank.getBalance(), depositAmount, "getBalance should return correct balance");
    }

    function test_RevertOnInvalidWithdraw() public {
        // Tenta sacar de um cofrinho vazio
        // O contrato não reverte quando está vazio, apenas não transfere nada
        vm.prank(owner);
        piggyBank.withdraw();
        
        // Verifica que o saldo permanece 0
        assertEq(piggyBank.getBalance(), 0, "Balance should remain 0 after withdrawal from empty piggy bank");
        // Verifica que o owner não recebeu nada
        assertEq(owner.balance, 0, "Owner balance should remain unchanged when withdrawing from empty piggy bank");
    }
} 