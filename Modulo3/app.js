let signer;
let cliente;
const clienteAddress = "0xF0890FD8C57Fd01fA7eCC403DB150C1e89Cf72E9";
const clienteAbi =[
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_cofre",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "string",
				"name": "acao",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "usuario",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			}
		],
		"name": "Interacao",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "cofreEndereco",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "enviarDeposito",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "valor",
				"type": "uint256"
			}
		],
		"name": "requisitarSaque",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "verMeuSaldo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	}
]; //cole o ABI aqui
window.onload = async () => {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        cliente = new ethers.Contract(clienteAddress, clienteAbi, signer);
    } else {
        alert("MetaMask não detectado.");
    }
};

async function enviarDeposito() {
    const valorETH = document.getElementById("valor").value;
    const tx = await cliente.enviarDeposito({ value: ethers.parseEther(valorETH) });
    await tx.wait();
    document.getElementById("resultado").innerText = `Deposito confirmado!`;
}
async function verSaldo() {
    const saldo = await cliente.verMeuSaldo();
    document.getElementById("resultado").innerText = ` Saldo atual:
    ${ethers.formatEther(saldo)} ETH`;
}
async function requisitarSaque() {
    const valorETH = document.getElementById("valor").value;
    const tx = await cliente.requisitarSaque(ethers.parseEther(valorETH));
    await tx.wait();
    document.getElementById("resultado").innerText = `Saque solicitado!`;
}