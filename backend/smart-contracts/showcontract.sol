// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ShowContract is Ownable {
    // Información del show
    struct ShowInfo {
        string name;
        uint256 targetAmount;
        uint256 fundedAmount;
        uint256 roi;
        bool isActive;
    }
    
    ShowInfo public show;
    
    // Token USDC (simulamos stablecoin)
    IERC20 public usdcToken;
    
    // Mapeo de inversiones
    mapping(address => uint256) public investments;
    
    // Eventos
    event Invested(address indexed investor, uint256 amount);
    event RoyaltyDistributed(address indexed investor, uint256 amount);

    constructor(
        string memory _name,
        uint256 _targetAmount,
        uint256 _roi,
        address _usdcAddress
    ) {
        show = ShowInfo(_name, _targetAmount, 0, _roi, true);
        usdcToken = IERC20(_usdcAddress);
    }

    // Función para invertir
    function invest(uint256 amount) external {
        require(show.isActive, "El show no está activo");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Transferencia fallida");
        
        investments[msg.sender] += amount;
        show.fundedAmount += amount;
        
        emit Invested(msg.sender, amount);
    }

    // Función para distribuir regalías
    function distributeRoyalty(uint256 totalAmount) external onlyOwner {
        require(!show.isActive, "El show debe estar completado");
        
        uint256 investorShare = (totalAmount * 98) / 100; // 98% para inversores
        uint256 platformShare = totalAmount - investorShare; // 2% para plataforma
        
        // Lógica simplificada de distribución
        // En una implementación real usaríamos un mapeo iterable
        // o un sistema más sofisticado para grandes cantidades de inversores
        
        usdcToken.transfer(owner(), platformShare);
        // Aquí iría la lógica para distribuir a inversores proporcionalmente
        
        emit RoyaltyDistributed(msg.sender, totalAmount);
    }
}