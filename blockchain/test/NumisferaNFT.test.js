import { expect } from "chai";
import hre from "hardhat";

describe("NumisferaNFT Smart Contract", function () {
  // Fixture to reuse the same setup in every test
  async function deployNumisferaFixture() {
    // Get the standard signers (simulating wallets from Ganache/Hardhat)
    const [owner, minter1, minter2] = await hre.ethers.getSigners();
    
    // Deploy the contract instance
    const NumisferaNFT = await hre.ethers.getContractFactory("NumisferaNFT");
    // Deploy with the first address as the owner of the platform
    const nft = await NumisferaNFT.deploy(owner.address);
    
    return { nft, owner, minter1, minter2 };
  }

  describe("Deployment", function () {
    it("Deberia inicializar el contrato con el supply en 0", async function () {
      const { nft } = await deployNumisferaFixture();
      expect(await nft.totalSupply()).to.equal(0);
    });

    it("Deberia nombrar el NFT correctamente", async function () {
      const { nft } = await deployNumisferaFixture();
      expect(await nft.name()).to.equal("Numisfera");
      expect(await nft.symbol()).to.equal("NUMIS");
    });
  });

  describe("Minting (Creacion de Tokens por Duenos)", function () {
    it("Deberia permitir a un usuario mintear gastando su gas y asignando el token", async function () {
      const { nft, minter1 } = await deployNumisferaFixture();
      const exampleURI = "ipfs://QmMyNumisferaCoin123";

      // El usuario (minter1) paga su gas y hace el minteo conectado como msg.sender
      // Esperamos que se emita el evento PieceMinted local.
      await expect(nft.connect(minter1).mintPiece(minter1.address, exampleURI))
          .to.emit(nft, "PieceMinted")
          .withArgs(1, minter1.address, exampleURI); // El ID sera 1

      // Verificamos On-Chain el dueno actual y el total
      expect(await nft.ownerOf(1)).to.equal(minter1.address);
      expect(await nft.tokenURI(1)).to.equal(exampleURI);
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Deberia devolver un Custom Error bloqueando el 'Doble Minteo' del mismo tokenURI", async function () {
      const { nft, minter1, minter2 } = await deployNumisferaFixture();
      const uniqueURI = "https://numisfera.mx/api/coins/88/metadata";

      // Minteo exitoso primero
      await expect(nft.connect(minter1).mintPiece(minter1.address, uniqueURI)).to.not.be.reverted;

      // Un impostor (o el mismo) intenta registrar la misma URL
      await expect(nft.connect(minter2).mintPiece(minter2.address, uniqueURI))
          .to.be.revertedWithCustomError(nft, "AlreadyMinted");

      // Supply debe seguir siendo 1
      expect(await nft.totalSupply()).to.equal(1);
    });

    it("Deberia autoincrementar los IDs correctamente (1, 2, 3...)", async function () {
      const { nft, minter1, minter2 } = await deployNumisferaFixture();
      const uriA = "ipfs://CoinA";
      const uriB = "ipfs://CoinB";

      await nft.connect(minter1).mintPiece(minter1.address, uriA);
      await nft.connect(minter2).mintPiece(minter2.address, uriB);

      expect(await nft.totalSupply()).to.equal(2);
      expect(await nft.ownerOf(1)).to.equal(minter1.address);
      expect(await nft.ownerOf(2)).to.equal(minter2.address);
    });
  });
});
