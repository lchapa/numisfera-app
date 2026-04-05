import hre from "hardhat";

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  // Ganache debug info: print the balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", balance.toString());

  const NumisferaNFT = await hre.ethers.getContractFactory("NumisferaNFT");
  
  // Custom gas configurations to avoid Ganache reverting on missing EIP1559 simulation support
  const txOptions = {
      gasLimit: 3000000
  };

  const nft = await NumisferaNFT.deploy(deployer.address, txOptions);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("NumisferaNFT deployed to:", nftAddress);

  // Deploy Auction and link it to the NFT
  const NumisferaAuction = await hre.ethers.getContractFactory("NumisferaAuction");
  const auction = await NumisferaAuction.deploy(nftAddress, txOptions);
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("NumisferaAuction deployed to:", auctionAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
