import { PROJECT_ENV } from 'react-native-dotenv'
const project = PROJECT_ENV

import client from './ethereum-client.js'
import crypto from 'crypto'
import * as SecureStore from 'expo-secure-store'

import firebase from './firebase'
require('firebase/functions')
const functions = firebase.functions()

//[DONE]
const createWallet = async (_user) => {
	console.log("start: createWallet")
	const _getValUserUrl = client.config.host[project] + client.config.url.getValUser
	const _getValUserBody = {
		user: _user
	}
	const _getValUserUrlResult = await reqPost(_getValUserUrl, _getValUserBody)
	if(!_getValUserUrlResult.unregistered){
		await setWallet(_getValUserUrlResult.wallet)
		return _getValUserUrlResult
	}
	// if(await getWalletAddress()) return
	// if (!await getCosignerPrivateKey()){
		const cosignerPrivateKey = await client.createAccount()
		const recoverPrivateKey = await client.createAccount()
		await setCosignerPrivateKey(cosignerPrivateKey)
		await setRecoverPrivateKey(recoverPrivateKey)
	// }
	const cosigner = await getCosignerAddress()
	const recover = await getRecoverAddress()
	const _createWalletResult = await functions.httpsCallable('createWallet')({
		cosigner: cosigner,
		recover: recover,
	}).catch((error) => {
		console.log(error)
	})
	const data = _createWalletResult.data
	if(data.unregistered){
		await setWallet(data.wallet)
		return data
	} else {
		return data
	}
}

//[DONE]
const executeWallet = async (_to, _encodeABI, _value) => {
	console.log("start: execute")

	const result = await getToWeiValue(_value)
	_value = result.value
	if(_value != 0) {
		_value = _value
	} else {
		_value = 0
	}

	const wallet = await getWalletAddress()
	const data = await getWalletData(wallet)//
	const nonce = data.nonce//
	const authorized = data.authorized//
	const hash = await client.web3.utils.soliditySha3(
		wallet,
		nonce,
		authorized,
		_encodeABI
	)
	const cosignerPrivateKey = await getCosignerPrivateKey()
	const sign = client.web3.eth.accounts.sign(
		hash,
		cosignerPrivateKey
	)
	const cosigner = await getCosignerAddress()

	const executeWalletResult = await functions.httpsCallable('executeWallet')({
		cosigner: cosigner,
		wallet: wallet,
		data: _encodeABI,
		sign: sign,
		hash: hash,
		authorized: authorized,
		nonce: nonce,
		to: _to,
		value: _value,
	}).catch((error) => {
		console.log(error)
	})
	return executeWalletResult.balance
}

//[DONE]
const recoveryWallet = async (_user, _encodeABI, _password) => {
	const _getRecoverKeyHashResult = await functions.httpsCallable('getRecoveryHash')({})
	.catch((error) => {
		console.log(error)
	})
	const wallet = _getRecoverKeyHashResult.data.wallet

	if(_getRecoverKeyHashResult.unregistered) return
	const crypted = _getRecoverKeyHashResult.data.crypted
	const decipher = crypto.createDecipher('aes-256-cbc', _password)
	let dec = decipher.update(crypted, 'hex', 'utf-8')
	const recoverPrivateKey = dec + decipher.final('utf-8')
	const cosignerPrivateKey = await client.createAccount()
	await setCosignerPrivateKey(cosignerPrivateKey)

	const cosignerAddress = await getCosignerAddress()
	const _data = await getWalletData(wallet)

	const nonce = _data.nonce
	const hash = await client.web3.utils.soliditySha3(
		wallet,
		nonce,
		cosignerAddress,
		_encodeABI
	)
	const sign = client.web3.eth.accounts.sign(
		hash,
		recoverPrivateKey
	)

	const _recoveryWalletResult = await functions.httpsCallable('recoveryWallet')({
		new: cosignerAddress,
		wallet: wallet,
		sign: sign,
		hash: hash,
		nonce: nonce,
		data: _encodeABI
	}).catch((error) => {
		console.log(error)
		throw new functions.https.HttpsError(
      'unauthenticated',
      'phone unauthenticated.'
    )
	})
	setWallet(_recoveryWalletResult.data.wallet)
	return _recoveryWalletResult.data
}

//[DONE]
const setRecoveryHash = async (_password) => {
	console.log("start: setRecoveryHash")
	const _cipher = crypto.createCipher('aes-256-cbc', _password)
	let crypted = _cipher.update(await getRecoverPrivateKey(), 'utf-8', 'hex')
	crypted += _cipher.final('hex')
	await setRecoverPassword(_password)
	await deleteRecoverKey()

	const keyStorage = client.config.contract[project].keyStorage
	const wallet = await getWalletAddress()
	const data = await getKeyStorageData()
	const nonce = data.nonce
	const hash = await client.web3.utils.soliditySha3(
		keyStorage,
		nonce,
		wallet,
		crypted
	)
	const sign = client.web3.eth.accounts.sign(
		hash,
		await getCosignerPrivateKey()
	)
	const cosigner = await getCosignerAddress()

	const setRecoveryHashResult = await functions.httpsCallable('setRecoveryHash')({
		cosigner: cosigner,
		wallet: wallet,
		nonce: nonce,
		crypted: crypted,
		hash: hash,
		sign: sign
	}).catch((error) => {
		console.log(error)
		throw new functions.https.HttpsError(
      'unauthenticated',
      'phone unauthenticated.'
    )
	})
	return setRecoveryHashResult
}

//[TODO]: 除去できるかも
const getKeyStorageData = async () => {
  return await fetch(client.config.host[project] + client.config.url.getKeyStorageData, {
		method: 'GET',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
	}).then(response => response.json())
	.then(responseJson => {
		return responseJson
	})
	.catch(error => {
		console.error(error)
	})
}

//[TODO]: 除去できるかも
const getWalletData = async (_wallet) => {
	const _getWalletDataUrl = client.config.host[project] + client.config.url.getWalletData
	const _getWalletDataBody = {
		wallet: _wallet,
	}
	const _getWalletResult = await reqPost(_getWalletDataUrl, _getWalletDataBody)
	return _getWalletResult
}

const getToWeiValue = async (_value) => {
	const _getToWeiValueUrl = client.config.host[project] + client.config.url.getToWeiValue
	const _getToWeiValueBody = {
		value: _value,
	}
	const _result = await reqPost(_getToWeiValueUrl, _getToWeiValueBody)
	return _result
}

const getCosignerAddress = async () => {
	if(!await SecureStore.getItemAsync('CosignerPrivateKey')) return
	const result = await SecureStore.getItemAsync('CosignerPrivateKey')
	return client.web3.eth.accounts.privateKeyToAccount("0x" + result).address
}

const getCosignerPrivateKey = async () => {
	const result = await SecureStore.getItemAsync('CosignerPrivateKey')
	if(!result) return result
  return "0x" + result
}

const getRecoverAddress = async () => {
	if(!await SecureStore.getItemAsync('RecoverPrivateKey')) return
	const result = await SecureStore.getItemAsync('RecoverPrivateKey')
	return client.web3.eth.accounts.privateKeyToAccount("0x" + result).address
}

const getRecoverPrivateKey = async () => {
	const result = await SecureStore.getItemAsync('RecoverPrivateKey')
	if(!result) return result
  return "0x" + result
}

const getWalletAddress = async () => {
  return await SecureStore.getItemAsync('wallet')
}

const getWalletBalance = async () => {
	const _getWalletBalanceUrl = client.config.host[project] + client.config.url.getWalletBalance
	const _wallet = await getWalletAddress()
	const _getWalletBalanceBody = {
		address: _wallet,
	}
	const _result = await reqPost(_getWalletBalanceUrl, _getWalletBalanceBody)
	const balance = Math.floor(_result.balance* 100000) / 100000
	return balance.toFixed(2)
}

const setCosignerPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("CosignerPrivateKey", _privateKey);
}

const setRecoverPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("RecoverPrivateKey", _privateKey);
}

const setRecoverPassword = async (_password) => {
  await SecureStore.setItemAsync('RecoverPassword', _password);
}

const setWallet = async (_wallet) => {
  await SecureStore.setItemAsync('wallet', _wallet)
}

const deleteRecoverKey = async () => {
	await SecureStore.deleteItemAsync("RecoverPrivateKey")
}

const deleteWallet = async () => {
	await SecureStore.deleteItemAsync("wallet")
	await SecureStore.deleteItemAsync("CosignerPrivateKey")
}

//[TODO]: 除去できるかも
const reqPost = async (_url, _body) => {
	console.log("start: reqPost")
	return await fetch(_url, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			..._body
		}),
	}).then(response => response.json())
	.then(async responseJson => {
		console.log("end: reqPost")
		return responseJson
	})
	.catch(error => {
		console.error(error)
	})
}
// deleteWallet()
const Wallet = {
	web3: client.web3,
	createWallet: createWallet,
	recoveryWallet: recoveryWallet,
	setRecoveryHash: setRecoveryHash,
	executeWallet: executeWallet,
	getCosignerAddress: getCosignerAddress,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance,
	getCosignerPrivateKey: getCosignerPrivateKey
}

export default Wallet
