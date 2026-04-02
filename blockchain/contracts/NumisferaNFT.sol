// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error MintingFailed(string reason);
error AlreadyMinted();

contract NumisferaNFT is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping para evitar que un mismo tokenURI (o una pieza externa en particular) se mintee 2 veces (opcionalmente)
    mapping(string => bool) private _usedURIs;

    event PieceMinted(uint256 indexed tokenId, address indexed owner, string tokenURI);

    constructor(address initialOwner) ERC721("Numisfera", "NUMIS") Ownable(initialOwner) {
        // Inicializamos el contador de IDs en 1 (opcional, comúnmente empieza así o en 0)
        _nextTokenId = 1;
    }

    /**
     * @dev Función pública para mintear un nuevo NFT.
     * Cualquier usuario puede pagar el gas y ejecutar la transacción.
     * @param to La dirección a la que se transferirá el NFT minteado.
     * @param uri El tokenURI (JSON metadata) referenciando los datos de la pieza.
     */
    function mintPiece(address to, string memory uri) public returns (uint256) {
        if (_usedURIs[uri]) {
            revert AlreadyMinted();
        }

        uint256 tokenId = _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        _usedURIs[uri] = true;

        emit PieceMinted(tokenId, to, uri);

        return tokenId;
    }

    /**
     * @dev Devuelve el número total de tokens generados hasta el momento.
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId - 1;
    }
}
