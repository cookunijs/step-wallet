//環境変数に設定する値
const process = {
  env: {
    PROJECT: "development",
  }
}
const project = process.env.PROJECT

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
	console.log(_getValUserUrlResult)
	if(!_getValUserUrlResult.unregistered){
		await setWallet(_getValUserUrlResult.wallet)
		return _getValUserUrlResult
	}
	// if(await getWalletAddress()) return
	// if (!await getCosignerPrivateKey(){
		const _cosignerPrivateKey = await client.createAccount()
		const _recoverPrivateKey = await client.createAccount()
		await setCosignerPrivateKey(_cosignerPrivateKey)
		await setRecoverPrivateKey(_recoverPrivateKey)
	// }
	const _createWalletUrl = client.config.host[project] + client.config.url.createWallet
	const _createWalletBody = {
		user: _user,
		cosigner: await getCosignerAddress(),
		recover: await getRecoverAddress(),
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
	const data = await getWalletData(_wallet)
	const _nonce = data.nonce
	const _authorized = data.authorized
	const _hash = await client.web3.utils.soliditySha3(
		_wallet,
		_nonce,
		_authorized,
		_encodeABI
	)
	const _sign = client.web3.eth.accounts.sign(
		_hash,
		await getCosignerPrivateKey()
	)
	const _url = client.config.host[project] + client.config.url.execute
	const _body = {
		address: await getCosignerAddress(),
		wallet: _wallet,
		data: _encodeABI,
		sign: _sign,
		hash: _hash,
		authorized: _authorized,
		nonce: _nonce,
		to: _to,
		value: _value,
	}
	const _result = await reqPost(_url, _body)
	return _result.balance
}

const recovery = async (_password) => { //ユーザーのmaillいるかも、serverの方でdbからemail->wallet（address）を取り出す。
	const _crypted = await getPass()
	const _decipher = crypto.createDecipher('aes-256-cbc', _password)
	let _dec = _decipher.update(_crypted, 'hex', 'utf-8')
	.catch(error => {
		console.error(error)
	})
	_dec += _decipher.final('utf-8')
	await setRecoverPrivateKey(_dec)
}
const setUser = async (_user) => {
	console.log("start: setUser")
	const _url = client.config.host[project] + client.config.url.setUser
	const _body = {
		user: _user,
		wallet: await getWalletAddress(),
	}
	console.log(_body)
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
	const _url = client.config.host[project] + client.config.url.setPass
	const _body = {
		address: await getCosignerAddress(),
		keyStorage: client.config.contract[project].keyStorage,
		wallet: _wallet,
		nonce: _nonce,
		crypted: _crypted,
		hash: _hash,
		sign: _sign
	}
	const _result = await reqPost(_url, _body)
	return _result
}

const getPass = async () => { //ユーザーのmaillいるかも、serverの方でdbからemail->wallet（address）を取り出す。
	const _wallet = await getWalletAddress()
	const _keyStorage = await getKeyStorageData()
	const _nonce = _keyStorage.nonce
	const _url = client.config.host[project] + client.config.url.getPass
	const _body = {
		wallet: _wallet,
		nonce: _nonce
	}
	const _result = await reqPost(_url, _body)
	return _result.crypted
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
	const _url = client.config.host[project] + client.config.url.getWalletData
	const _body = {
		wallet: _wallet,
	}
	const _result = await reqPost(_url, _body)
	return _result
}

const getToWeiValue = async (_value) => {
	const _url = client.config.host[project] + client.config.url.getToWeiValue
	const _body = {
		value: _value,
	}
	const _result = await reqPost(_url, _body)
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
	const _url = client.config.host[project] + client.config.url.getWalletBalance
	const _body = {
		address: await getWalletAddress(),
	}
	const _result = await reqPost(_url, _body)
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
	setUser: setUser,
	setPass: setPass,
	execute: execute,
	getCosignerAddress: getCosignerAddress,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance
}

export default Wallet
