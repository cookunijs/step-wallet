import { PROJECT_ENV } from 'react-native-dotenv'
const project = PROJECT_ENV

import client from './ethereum-client.js'
import crypto from 'crypto'
import * as SecureStore from 'expo-secure-store'

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
	console.log(_getValUserUrlResult)
	// if(await getWalletAddress()) return
	// if (!await getCosignerPrivateKey()){
		const _cosignerPrivateKey = await client.createAccount()
		const _recoverPrivateKey = await client.createAccount()
		await setCosignerPrivateKey(_cosignerPrivateKey)
		await setRecoverPrivateKey(_recoverPrivateKey)
	// }
	const _createWalletUrl = client.config.host[project] + client.config.url.createWallet
	const _cosigner = await getCosignerAddress()
	const _recover = await getRecoverAddress()
	const _createWalletBody = {
		user: _user,
		cosigner: _cosigner,
		recover: _recover,
	}
	const _createWalletResult = await reqPost(_createWalletUrl, _createWalletBody)
	if(_createWalletResult.unregistered){
		await setWallet(_createWalletResult.wallet)
		await setUser(_user)
		return _createWalletResult
	} else {
		return _createWalletResult
	}
}

const execute = async (_to, _encodeABI, _value) => {
	console.log("start: execute")

	const result = await getToWeiValue(_value)
	_value = result.value
	if(_value != 0) {
		_value = _value
	} else {
		_value = 0
	}

	const _wallet = await getWalletAddress()
	const _data = await getWalletData(_wallet)
	const _nonce = _data.nonce
	const _authorized = _data.authorized
	const _hash = await client.web3.utils.soliditySha3(
		_wallet,
		_nonce,
		_authorized,
		_encodeABI
	)
	const _cosignerPrivateKey = await getCosignerPrivateKey()
	const _sign = client.web3.eth.accounts.sign(
		_hash,
		_cosignerPrivateKey
	)

	const _executeUrl = client.config.host[project] + client.config.url.execute
	const _cosigner = await getCosignerAddress()
	const _executeBody = {
		address: _cosigner,
		wallet: _wallet,
		data: _encodeABI,
		sign: _sign,
		hash: _hash,
		authorized: _authorized,
		nonce: _nonce,
		to: _to,
		value: _value,
	}
	const _result = await reqPost(_executeUrl, _executeBody)
	return _result.balance
}

const recoveryWallet = async (_user, _encodeABI, _password) => { //ユーザーのmaillいるかも、serverの方でdbからemail->wallet（address）を取り出す。
	const _getRecoverKeyHashUrl = client.config.host[project] + client.config.url.getRecoverKeyHash
	const _getRecoverKeyHashBody = {
		user: _user,
	}
	const _getRecoverKeyHashResult = await reqPost(_getRecoverKeyHashUrl, _getRecoverKeyHashBody)
	const _wallet = _getRecoverKeyHashResult.wallet

	if(_getRecoverKeyHashResult.unregistered) return
	const _crypted = _getRecoverKeyHashResult.recoverKeyHash
	const _decipher = crypto.createDecipher('aes-256-cbc', _password)
	let _dec = _decipher.update(_crypted, 'hex', 'utf-8')
	const recoverPrivateKey = _dec + _decipher.final('utf-8')
	const _cosignerPrivateKey = await client.createAccount()
	await setCosignerPrivateKey(_cosignerPrivateKey)

	const _cosignerAddress = await getCosignerAddress()
	const _data = await getWalletData(_wallet)
	const _nonce = _data.nonce
	const _hash = await client.web3.utils.soliditySha3(
		_wallet,
		_nonce,
		_cosignerAddress,
		_encodeABI
	)
	const _sign = client.web3.eth.accounts.sign(
		_hash,
		recoverPrivateKey
	)

	const _recoveryWalletUrl = client.config.host[project] + client.config.url.recoveryWallet
	const _recoveryWalletBody = {
		new: _cosignerAddress,
		wallet: _wallet,
		sign: _sign,
		hash: _hash,
		nonce: _nonce,
		data: _encodeABI
	}
	const _recoveryWalletResult = await reqPost(_recoveryWalletUrl, _recoveryWalletBody)
	// if(_createWalletResult.unregistered){
	// 	await setWallet(_createWalletResult.wallet)
	// 	await setUser(_user)
	// 	return _createWalletResult
	// }
	setWallet(_recoveryWalletResult.wallet)
	return _recoveryWalletResult
}

const setUser = async (_user) => {
	console.log("start: setUser")
	const _url = client.config.host[project] + client.config.url.setUser
	const _wallet = await getWalletAddress()
	const _body = {
		user: _user,
		wallet: _wallet,
	}
	const _result = await reqPost(_url, _body)
	return _result
}

const setPass = async (_password) => {
	console.log("start: setPass")

	const _cipher = crypto.createCipher('aes-256-cbc', _password)
	let _crypted = _cipher.update(await getRecoverPrivateKey(), 'utf-8', 'hex')
	_crypted += _cipher.final('hex')
	await setRecoverPassword(_password)
	await deleteRecoverKey()

	const _wallet = await getWalletAddress()
	const _keyStorage = await getKeyStorageData()
	const _nonce = _keyStorage.nonce
	const _hash = await client.web3.utils.soliditySha3(
		client.config.contract[project].keyStorage,
		_nonce,
		_wallet,
		_crypted
	)
	const _sign = client.web3.eth.accounts.sign(
		_hash,
		await getCosignerPrivateKey()
	)

	const _setPassUrl = client.config.host[project] + client.config.url.setPass
	const _cosigner = await getCosignerAddress()
	const _setPassUrlBody = {
		address: _cosigner,
		keyStorage: client.config.contract[project].keyStorage,
		wallet: _wallet,
		nonce: _nonce,
		crypted: _crypted,
		hash: _hash,
		sign: _sign
	}
	const _setPassResult = await reqPost(_setPassUrl, _setPassUrlBody)
	return _setPassResult
}

const getPass = async () => { //ユーザーのmaillいるかも、serverの方でdbからemail->wallet（address）を取り出す。
	const _wallet = await getWalletAddress()
	const _keyStorage = await getKeyStorageData()
	const _nonce = _keyStorage.nonce
	const _getPassUrl = client.config.host[project] + client.config.url.getPass
	const _getPassUrlBody = {
		wallet: _wallet,
		nonce: _nonce
	}
	const _getPassResult = await reqPost(_getPassUrl, _getPassUrlBody)
	return _getPassResult.crypted
}

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

const Wallet = {
	web3: client.web3,
	createWallet: createWallet,
	recoveryWallet: recoveryWallet,
	setUser: setUser,
	setPass: setPass,
	execute: execute,
	getCosignerAddress: getCosignerAddress,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance,
	getCosignerPrivateKey: getCosignerPrivateKey
}

export default Wallet
