const proxyAddress = "0xAc5C8FA4A279f1BF0Bc6213Bbf8edFaD3482f0B3";
const clienteAbi = [
	{
		"inputs": [],
		"name": "incrementar",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "numero",
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
		"inputs": [],
		"name": "version",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "pure",
		"type": "function"
	}
];

let contract;

async function conectarContrato() {
    if (typeof window.ethereum !== "undefined") {
        provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        signer = await provider.getSigner();
        contract = new ethers.Contract(proxyAddress, clienteAbi, signer);
        const valor = await contract.numero();
        document.getElementById("numero").textContent = valor.toString();
    } else {
        alert("MetaMask não detectado.");
        return;
    }
};

async function incrementar() {
    if (!contract) return;
    const tx = await contract.incrementar();
    await tx.wait();
    conectarContrato();
}

conectarContrato();