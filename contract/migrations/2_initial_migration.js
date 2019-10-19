const KeyManager = artifacts.require("KeyManager")
const CloneableWallet = artifacts.require("CloneableWallet")
const WalletFactory = artifacts.require("WalletFactory")

module.exports = (deployer) => {
  deployer.deploy(KeyManager, "0x951D94319cF3bC6B4BFF5A33779C5a723b0B0c4e", "0x46Bfe6f8492e30D8465Cfb8E71AC7b9C320E20e3").then(async (key) => {
    console.log(key.address)
    await deployer.deploy(CloneableWallet).then(async (cloneable) => {
      console.log(cloneable.address)
      await deployer.deploy(WalletFactory, cloneable.address, key.address).then(async (factory) => {
        console.log(factory.address)
      })
    })
  })
}

