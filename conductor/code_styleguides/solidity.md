# Guía de Estilos y Estándares para Solidity

Este documento define las convenciones de código y estándares arquitectónicos para el desarrollo de Smart Contracts (Contratos Inteligentes) en Numisfera utilizando Solidity.

## 1. Versión de Solidity
- Utilizar una versión fija y moderna del compilador (e.g., `pragma solidity 0.8.20;`).
- Evitar usar el operador `^` en producción (e.g., evitar `^0.8.0`) para asegurar que el contrato se compila con la versión esperada y exacta con la que fue probado.

## 2. Estándares y Frameworks Replicables
- Implementar de forma estricta los estándares ERC correspondientes. Para coleccionables únicos, utilizar **ERC-721** o su extensión **ERC-721A** para optimización de gas en minting de lotes.
- Utilizar librerías de `OpenZeppelin` para la implementación base de tokens y mecanismos de seguridad (`Ownable`, `Pausable`, `ReentrancyGuard`, etc.).

## 3. Disposición del Código (Layout)
El orden dentro de un contrato debe seguir la recomendación oficial de Solidity:
1. `pragma` (versión del compilador)
2. `import` (importaciones)
3. Las declaraciones de interfaz/librería/contrato
Dentro de cada contrato, el orden debe ser:
1. Variables de estado (state variables)
2. Eventos (events)
3. Modificadores (modifiers)
4. Constructor
5. Funciones en el siguiente orden:
   a. External
   b. Public
   c. Internal
   d. Private

## 4. Convenciones de Nomenclatura (Naming)
- **Contratos y Librerías:** `PascalCase` (e.g., `NumisferaNFT`, `SafeMath`).
- **Structs y Enums:** `PascalCase` (e.g., `CoinDetail`, `MintStatus`).
- **Funciones y Variables:** `camelCase` (e.g., `mintPiece`, `ownerAddress`).
- **Constantes y Variables Inmutables:** `UPPER_CASE_WITH_UNDERSCORES` (e.g., `MAX_SUPPLY`, `MINT_PRICE`).
- **Eventos:** `PascalCase` y de preferencia nombrar la acción e incluir detalles. (e.g., `PieceMinted(uint256 indexed tokenId, address indexed owner)`).

## 5. Prácticas de Rendimiento y Gas
- **Storage vs Memory:** Minimizar las lecturas y escrituras en el estado global (`storage`). Preferir el uso de variables locales, `memory` o `calldata` para parámetros de función.
- **Mapping vs Array:** Usar `mapping` para asociaciones (e.g. quién tiene qué ID) ya que es más eficiente en costo de gas comparado con iterar arrays.
- Mantener la lógica pesada de cálculo *off-chain* o en el Backend/Frontend, el Smart Contract solo debe validar y almacenar el estado irrefutable.

## 6. Prácticas de Seguridad
- Utilizar el patrón **Checks-Effects-Interactions** para evitar ataques de reentrada (Reentrancy).
- Emitir Eventos en todas las acciones importantes (Mint, Transfer, Appove, Funciones administrativas).
- Validaciones preventivas tempranas usando `require()` y revertir transacciones lo más rápido posible. Configurar mensajes de error claros, preferiblemente con Custom Errors (`error MintingFailed(string reason);`) para ahhorrar gas adicional aplicable en Solidity >=0.8.4.

## 7. Pruebas y Despliegue Local (Ganache / Hardhat / Truffle)
- Se requiere cobertura de código total en flujos críticos.
- Debe configurarse un entorno local en **Ganache** para simular la red Ethereum y costear el gas (sin gastar Ether real) de forma local. Alternativamente, usar entornos locales provistos por `Hardhat` Node o `Truffle`.
- Cada función pública o external (`mint`, `transfer`, `approve`) debe tener su prueba automatizada (e.g., en JavaScript/TypeScript consumiendo ethers.js o web3.js).
