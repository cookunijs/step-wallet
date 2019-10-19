import config from'../../config.json'
import '../../global'
global.Web3 = require('web3')
global.web3 = new Web3(new Web3.providers.HttpProvider(config.node.https))
// console.log(global.Web3)
// console.log(global.web3)

import crypto from 'crypto'
import randomBytes from "randombytes"

const web3 = global.web3

const account = {
  address: null,
  balance: null
}

// const activate = async provider => {
//   try{
//     web3.setProvider(provider)
//     if(window.ethereum){
//       await ethereum.enable()
//     }
//     const accounts = await web3.eth.getAccounts()
//     if(accounts.length > 0) {
//       account.address = accounts[0]
//       account.balance = await web3.eth.getBalance(accounts[0])

//       setInterval(async () => {
//         web3.eth.getAccounts().then(accounts => {
//           if (account.address != accounts[0]) {
//             account.address = accounts[0]
//             location.reload()
//           }
//         })
//       }, 100)
//     }
//     return account
//   } catch (err) {
//     alert(err)
//   }
// }

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
  // console.log(await global.web3.eth.getBalance("0x7Ac6FaC041d4522F8C362d78EfEC60396364C559").call())
  // web3.eth.getBalance("0x7Ac6FaC041d4522F8C362d78EfEC60396364C559")
  // .then(console.log);
  var x = await web3.eth.accounts.create(web3.utils.randomHex(32))
  return x.privateKey
}

const client = {
  account: account,
  activate: activate,
  ownedTokens: ownedTokens,
  utils: web3.utils,
  web3: web3,
  createAccount: createAccount,
  config: config
}

export default client
