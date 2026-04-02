import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("NumisferaNFTModule", (m) => {
  // Use the first account (the deployer) as the initial owner
  const initialOwner = m.getAccount(0);

  // Deploy the NumisferaNFT contract, passing the initial owner to the constructor
  const nft = m.contract("NumisferaNFT", [initialOwner]);

  return { nft };
});
