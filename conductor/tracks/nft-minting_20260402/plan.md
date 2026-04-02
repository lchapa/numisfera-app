# Track: Creación de Non-Fungible Token (NFT) para Numisfera

## Objetivo del Track
Permitir a los dueños de las piezas (ya autenticados mediante una wallet de Ethereum en `numisfera.mx`) tokenizar, registrar y mintear de manera única su pieza numismática en la red de Ethereum, cumpliendo con el estándar ERC-721. 

## Estado Actual
- **Status:** Planeación

## Requisitos de Implementación
### Requerimientos Funcionales
1. Validar que el dueño de la pieza se encuentre autenticado usando su Web3 Wallet (Metamask).
2. Evitar el "doble minteo": Si la moneda en el sistema ya tiene un registro on-chain asociado (un Token ID), impedir volver a generar el NFT.
3. El Gas requerido para pagar esta transacción siempre correrá por cargo de la cuenta interactuante (el dueño). Promover la transacción mediante Ethers.js y firmada por la billetera local.
4. Desarrollar un Smart Contract de Numisfera implementando el estándar **ERC-721** (usar OpenZeppelin).

### Requerimientos No Funcionales
1. **Estándares:** Uso del estilo y guías de codificación de `Solidity` estipulados en `conductor/code_styleguides/solidity.md`.
2. **Entorno de Testing:** Exigir en este entorno local el ensayo en redes como **Ganache** para garantizar que los scripts de prueba interactúen sin riesgo y sin costo antes de pensar en redes de pruebas reales o mainnets.

---

## 🛠️ Plan de Ejecución (Fases)

### Fase 1: Entorno Blockchain y Creación del Contrato Inteligente
- [x] **Task:** Inicializar el ambiente Blockchain en el proyecto (Truffle o Hardhat) en una nueva carpeta `/blockchain` o `smart_contracts`.
- [x] **Task:** Crear el Smart Contract `NumisferaNFT.sol` utilizando Solidity `^0.8.20` importando bibliotecas `ERC721` y `Ownable` de OpenZeppelin.
- [x] **Task:** Implementar dentro del Contrato la función principal para `mintPiece(address to, string memory tokenURI)` (o similar), validando accesos y emitiendo el evento correspondiente de minteo.

### Fase 2: Configuración del Motor de Ganache y Pruebas
- [x] **Task:** Configurar adecuadamente la conexión a la blockchain local proveída por **Ganache** (`http://127.0.0.1:7545` o `http://127.0.0.1:8545`).
- [x] **Task:** Desarrollar scripts de despliegue (`deploy.js` o configuraciones `migrations/`) para montar el contrato `NumisferaNFT` en Ganache durante etapa de testing local.
- [x] **Task:** Construir los *Unit Tests* del Smart Contract en JavaScript/TypeScript para probar los flujos exitosos y bloqueantes de Minteo. (Garantizar cobertura probando que el minteo falla si la validación falla o que se le asigne la pieza a quien paga el gas).

### Fase 3: Integración Back-End 
- [x] **Task:** Agregar en la entidad `Coin` de Java 2 nuevas columnas: una para el `tokenId` global (string/integer) y otra referenciando el `contractAddress`. 
- [x] **Task:** Ofrecer un Endpoint (`PUT /api/coins/{id}/tokenize`) o expandir `/api/coins/{id}` para actualizar exclusivamente si una moneda se acaba de tokenizar (grabando un comprobante en BD).

### Fase 4: Frontend y Flujo de Wallet Web3 para el Minteo
- [ ] **Task:** Modificar la `DetailPage` o diseñar una pantalla específica interactiva para realizar el "Mint". Si el dueño está autenticado, verá un botón llamativo con `Mintear o Tokenizar Pieza en Ethereum`.
- [ ] **Task:** Cuando se da click a mintear, generar los parámetros (`tokenURI` temporal de metadatos estáticos construidos) y enviar a Ethers.js la transacción para que el SmartContract mintee a la *"Web3 Provider"* seleccionada en el Front (como MetaMask) consumiendo gas del usuario.
- [ ] **Task:** Una vez confirmada la Transacción Web3 de manera exitosa, guardar en base de datos vía el Endpoint mencionado el ID emitido y la dirección del nuevo token. Mostrar mensaje exitoso al usuario.
