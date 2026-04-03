# Plan de Implementación: Sistema de Subastas (Proxy Bidding)

## Descripción General
Este track tiene como objetivo implementar un sistema de subastas descentralizado e inteligente (Proxy Bidding) para los tokens ERC-721 en Numisfera.mx. Los dueños de las piezas podrán poner en subasta sus NFTs especificando precio de salida y límite de tiempo. Los coleccionistas pujarán definiendo su límite máximo (Proxy) y el algoritmo on-chain se encargará de pujar el mínimo necesario para mantenerse a la cabeza. Al finalizar, se ejecutará el cobro, la transferencia de la pieza y el reparto de comisiones (15% para la plataforma, 85% para el vendedor).

## Fases del Desarrollo

### Fase 1: Arquitectura y Smart Contract (Solidity)
- [ ] **Task:** Crear el contrato inteligente `NumisferaAuction.sol` que se comunicará con `NumisferaNFT.sol`.
- [ ] **Task:** Implementar la lógica para iniciar una subasta (`createAuction`), bloquear la pieza (trasladar el NFT al contrato o dar *approve*).
- [ ] **Task:** Implementar lógica de *Proxy Bidding*. El pujador invía sus fondos (depósito del ETH de la puja máxima). El contrato on-chain determinará el "Current Bid" calculando el mínimo necesario vs el segundo mayor postor.
- [ ] **Task:** Implementar la lógica de resolución (`endAuction` / `settleAuction`), ejecutando el cobro, la transferencia del NFT al ganador y tomando la comisión del 15% para el *Treasury* de Numisfera.
- [ ] **Task:** Programar los *Unit Tests* del Smart Contract para garantizar seguridad (devoluciones a perdedores, cálculos correctos de Proxy Bid, etc).

### Fase 2: Backend e Integración de Modelos (Java/Spring Boot)
- [ ] **Task:** Modificar o crear entidades de Base de Datos para registrar localmente las subastas (Ej. `Auction`, `BidHistory`).  
- [ ] **Task:** Crear nuevos Endpoints (`POST /api/auctions`) para que el frontend anuncie la creación de la subasta tras firmar en Blockchain, y (`GET /api/auctions/{coinId}`) para leer los detalles y pujas en tiempo real.
- [ ] **Task:** Sincronizar el estatus de la subasta periodicamente o al leer los detalles (o mediante Endpoints donde el FE envíe los eventos de conclusión).

### Fase 3: Detalle de Moneda y Funcionalidad del Vendedor (React)
- [ ] **Task:** En `DetailPage.jsx`, agregar el formulario para **"Poner en Subasta"** si el dueño está autenticado y la pieza está minteada.
- [ ] **Task:** Permitir que el dueño introduzca el **Precio Base** y **Tiempo Límite** (Fecha).
- [ ] **Task:** Integrar MetaMask para enviar la orden `createAuction` concediendo permisos al Smart Contract sobre ese NFT en específico.

### Fase 4: Experiencia del Coleccionista y Proxy Bidding (React)
- [ ] **Task:** Si una pieza está en subasta, mostrar UI especial en `DetailPage.jsx` revelando la puja actual y tiempo restante.
- [ ] **Task:** Incluir formulario "Ingresa tu puja máxima" donde el comprador firme con Meta-Mask enviando el ether como garantía.
- [ ] **Task:** Crear la pantalla / Panel de Coleccionista "Mis Subastas Activas" para mostrar monto actual ganador vs su límite Proxy (Pujas Activas, Ganadas o Perdidas).
- [ ] **Task:** Al concluir el tiempo, mostrar botón o flujo automático de liquidación (`settleAuction`) que haga efectiva la transferencia del NFT y el pago al dueño (y a Numisfera).

## Notas Técnicas y Dudas de Diseño
* **Sobre la Puja Inicial:** Si Lock-Up ETH es complejo por la volatilidad, usaremos un flujo estándar Web3 (Depositar el Max Bid en Escrow o Contrato). El reembolso a las subastas superadas se hace automático (`auto-refund` mediante Pull/Withdrawal patterns para prevenir reentrancy).
* **Manejo del Tiempo:** El tiempo límite de la subasta existirá puro en bloque timestamp on-chain (`block.timestamp`).
