const KeyManager = artifacts.require("KeyManager")
const CloneableWallet = artifacts.require("CloneableWallet")
const WalletFactory = artifacts.require("WalletFactory")
//"0x951D94319cF3bC6B4BFF5A33779C5a723b0B0c4e", "0x46Bfe6f8492e30D8465Cfb8E71AC7b9C320E20e3"
module.exports = (deployer) => {
  deployer.deploy(KeyManager, "0x6E773b93eeA8E4333eFEA4d847a8F2eb29dcF7a4", "0x65CAb099B26E45C007BEcdb30e5ca592e85987Cf").then(async (key) => {
    console.log(key.address)
    await deployer.deploy(CloneableWallet).then(async (cloneable) => {
      console.log(cloneable.address)
      await deployer.deploy(WalletFactory, cloneable.address, key.address).then(async (factory) => {
        console.log(factory.address)
      })
    })
  })
}

