// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\auth\networkServices.js

export const switchToPolygon = async () => {
  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId === '0x89') return true;

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }],
    });
    return true;
  } catch (error) {
    if (error.code === 4902) {
      return await addPolygonNetwork();
    }
    throw error;
  }
};

const addPolygonNetwork = async () => {
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        nativeCurrency: {
          name: 'MATIC',
          symbol: 'MATIC',
          decimals: 18
        },
        rpcUrls: ['https://polygon-rpc.com/'],
        blockExplorerUrls: ['https://polygonscan.com/']
      }]
    });
    return true;
  } catch (error) {
    throw new Error('NETWORK_CHANGE_FAILED');
  }
};

export const handleNetworkChange = function() {
  this.error = 'Por favor cambia a Polygon para continuar';
};