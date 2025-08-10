// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CulturaToken is ERC20, ERC20Snapshot, Ownable, Pausable {
    // Estructura para guardar recompensas
    struct Reward {
        uint256 amount;
        uint256 releaseTime;
    }
    
    // Mapeos
    mapping(address => Reward[]) public rewards;
    mapping(address => bool) public authorizedContracts;
    
    // Eventos
    event RewardAdded(address indexed recipient, uint256 amount, uint256 releaseTime);
    event RewardClaimed(address indexed recipient, uint256 amount);
    event ContractAuthorized(address indexed contractAddress);
    event ContractRevoked(address indexed contractAddress);
    
    // Constructor
    constructor() ERC20("CulturaToken", "CTK") {
        _mint(msg.sender, 10000000 * 10 ** decimals()); // 10 millones de tokens iniciales
    }
    
    // Función para crear snapshots (solo owner)
    function snapshot() public onlyOwner {
        _snapshot();
    }
    
    // Pausar el contrato (solo owner)
    function pause() public onlyOwner {
        _pause();
    }
    
    // Reanudar el contrato (solo owner)
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // Autorizar contrato para interactuar (solo owner)
    function authorizeContract(address contractAddress) public onlyOwner {
        authorizedContracts[contractAddress] = true;
        emit ContractAuthorized(contractAddress);
    }
    
    // Revocar autorización (solo owner)
    function revokeContract(address contractAddress) public onlyOwner {
        authorizedContracts[contractAddress] = false;
        emit ContractRevoked(contractAddress);
    }
    
    // Añadir recompensas (desde contratos autorizados)
    function addReward(address recipient, uint256 amount, uint256 lockDuration) external {
        require(authorizedContracts[msg.sender], "No autorizado");
        require(recipient != address(0), "Direccion invalida");
        require(amount > 0, "Cantidad debe ser mayor a 0");
        
        rewards[recipient].push(Reward({
            amount: amount,
            releaseTime: block.timestamp + lockDuration
        }));
        
        emit RewardAdded(recipient, amount, block.timestamp + lockDuration);
    }
    
    // Reclamar recompensas disponibles
    function claimRewards() public whenNotPaused {
        uint256 totalToClaim = 0;
        
        for (uint256 i = 0; i < rewards[msg.sender].length; i++) {
            if (rewards[msg.sender][i].releaseTime <= block.timestamp && rewards[msg.sender][i].amount > 0) {
                totalToClaim += rewards[msg.sender][i].amount;
                rewards[msg.sender][i].amount = 0;
            }
        }
        
        require(totalToClaim > 0, "No hay recompensas disponibles");
        _mint(msg.sender, totalToClaim);
        emit RewardClaimed(msg.sender, totalToClaim);
    }
    
    // Sobreescribir funciones de transferencia para incluir pausa
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override(ERC20, ERC20Snapshot)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
    
    // Función para quemar tokens
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}