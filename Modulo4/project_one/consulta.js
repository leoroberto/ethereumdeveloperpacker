const { ethers } = require("ethers");

const address = '0x8a87f707cDe32D1490367915d38900030fF5da2e';
const providerUrl = 'https://eth-sepolia.g.alchemy.com/v2/lRx0AI85B5Ix1tC13VkQsCEmt-cNhWqc';
const provider = new ethers.JsonRpcProvider(providerUrl);

(async () => {
    try {
        const balance = await provider.getBalance(address);
        console.log('Saldo: ', ethers.formatEther(balance) + 'ETH');
    } catch (error) {
        console.error('Erro ao consultar saldo: ', error);
    }

})();
