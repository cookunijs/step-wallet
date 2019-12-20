import config from'../../config.json'
import '../../global'
import crypto from 'crypto'
import randomBytes from 'randombytes'
global.Web3  = require('web3')
global.web3  = new Web3(
  new Web3.providers.HttpProvider(config.node.https)
)

const web3 = global.web3

const account = {
  address: null,
  balance: null
}

const activate = async address => {
  try{
    setInterval(async () => {
      account.balance = await web3.eth.getBalance(address)
    }, 1000)
  } catch (err) {
    alert(err)
  }
}

const ownedTokens = async (name ,address)=> {
  const balance = await contract[name].methods.balanceOf(address).call()
  if (balance == 0) {
    return []
  }
  const promises = []
  for (var i = 0; i < balance; i++) {
    promises.push(contract[name].methods.tokenOfOwnerByIndex(address, i).call())
  }
  const result = await Promise.all(promises)
  return result
}

const createAccount = async () => {
  var x = await web3.eth.accounts.create(web3.utils.randomHex(32))
  return x.privateKey.substring(2)
}

const getAccountMetaData = async (_privateKey) => {
  return await web3.eth.accounts.privateKeyToAccount(_privateKey)
}

const client = {
  account: account,
  activate: activate,
  ownedTokens: ownedTokens,
  utils: web3.utils,
  web3: web3,
  createAccount: createAccount,
  getAccountMetaData: getAccountMetaData,
  config: config
}

export default client
