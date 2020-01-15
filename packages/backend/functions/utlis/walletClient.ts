require('dotenv').config()
const project: string = process.env.NODE_ENV || 'development'
const config: any = require('../config.json')
const Web3: any = require('web3')
const web3: any = new Web3(new Web3.providers.HttpProvider(config.node[project].https))
const senderPublicKey: string = process.env.SENDERPUBLICKEY || ''
const senderPrivateKey: string = process.env.SENDERPRIVATEKEY || ''
const hashWord: string = process.env.HASHWORD || ''
const maxNumberOfExecution: number = Number(process.env.MAXNUMBEROFEXECUTION) || 10
const maxNumberOfRecovery: number = Number(process.env.MAXNUMBEROFRECOVERY) || 10
const deleteCollectionBatchSize: number = Number(process.env.DELETECOLLECTIONBATCHSIZE) || 100
const deleteCollectionPath: string = process.env.DELETECOLLECTIONPATH || 'execution'
const RECOVERY: number = 2

const contract: any = {
  WalletFactory: new web3.eth.Contract(
    config.abi.walletFactory,
    config.contract[project].walletFactory
  ),
  KeyStation: new web3.eth.Contract(
    config.abi.keyStation,
    config.contract[project].keyStation
  ),
  KeyStorage: new web3.eth.Contract(
    config.abi.keyStorage,
    config.contract[project].keyStorage
  )
}

const signAuthorized = (_hash: string) => {
  const authorizedPrivateKey: string = getAuthorizedPrivateKey()
  const sign: any = web3.eth.accounts.sign(
    _hash,
    authorizedPrivateKey
  )
  return sign
}

const sendSignedTransaction = async (_from: string, _to: string, _data: string) => {
  const gasLimit: string = await getGasLimit(_to, _data)
  const gasPrice: string = await getGasPrice()
  const nonce: number = await web3.eth.getTransactionCount(senderPublicKey)
  const value: string = web3.utils.numberToHex(web3.utils.toWei('0', 'ether'))
  const transactionObj: object = {
    nonce: nonce,
    gasPrice: gasPrice,
    gas: gasLimit,
    from: _from,
    to: _to,
    value: value,
    data: _data
  }
  const signedTx: any = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)
  const receipt: any = await web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('error', console.error)
  const result: object  = {
    receipt: receipt,
    unregistered: true
  }
  return result
}

const getSoliditySha3Hash = (...args: string[]) => {
  const hash: string = web3.utils.soliditySha3(
    ...args
  )
  return hash
}

const getConfigData = (_key: string) => {
  return config[_key][project]
}

const getCloneableWallet = (_to: string) => {
  return new web3.eth.Contract(
    config.abi.cloneableWallet,
    _to
  )
}

const getAuthorizedPrivateKey = () => {
  return process.env.AUTHORIZEDPRIVATEKEY || ''
}

const getGasPrice = async () => {
  const result: string = await web3.eth.getGasPrice()
  const toWei: string = web3.utils.toWei(result, 'wei')
  return await web3.utils.toHex(toWei)
}

const getGasLimit = async (_to: string, _data: string) => {
  const result: string = parseInt(web3.eth.estimateGas({to: _to, data: _data}), 16).toString()
  return await web3.utils.toHex(result)
}

export default {
  config,
  web3,
  contract,
  hashWord,
  maxNumberOfExecution,
  maxNumberOfRecovery,
  deleteCollectionBatchSize,
  deleteCollectionPath,
  RECOVERY,
  signAuthorized,
  sendSignedTransaction,
  getConfigData,
  getCloneableWallet,
  getAuthorizedPrivateKey,
  getSoliditySha3Hash,
}