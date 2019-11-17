//環境変数に設定する値
const process = {
  env: {
    PROJECT: "development",
  }
}
const project = process.env.PROJECT

import client from './ethereum-client.js'
import * as SecureStore from 'expo-secure-store';

const createWallet = async () => {
	console.log("start")
	if(await getWalletAddress()) return
	if (!await getCosignerPrivateKey()){
		const _privateKey = await client.createAccount()
		setPrivateKey(_privateKey)
	}
	return await fetch(client.config.host[project] + client.config.url.createWallet, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			cosigner: await getCosignerAddress()
		}),
	}).then(response => response.json())
	.then(async responseJson => {
		await setWallet(responseJson.wallet)
		console.log("end")
		return responseJson.wallet
	})
	.catch(error => {
		console.error(error)
	})
}

const execute = async (_to, _encodeABI, _value) => {
	console.log("start")
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
	await fetch(client.config.host[project] + client.config.url.execute, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			address: await getCosignerAddress(),
			wallet: _wallet,
			data: _encodeABI,
			sign: _sign,
			hash: _hash,
			authorized: _authorized,
			nonce: _nonce,
			to: _to,
			value: _value,
		}),
	}).then(response => response.json())
	.then(responseJson => {
		console.log("end")
		return responseJson.balance
	})
	.catch(error => {
		console.error(error)
	})
}

const getCloneableWallet = (_to) => {
  return new client.web3.eth.Contract(
    client.config.abi.cloneableWallet,
    _to
  )
}

const getKeyManager = (_to) => {
  return new client.web3.eth.Contract(
    client.config.abi.keyManager,
    _to
  )
}

const getWalletData = async (_wallet) => {
  return await fetch(client.config.host[project] + client.config.url.getWalletData, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			wallet: _wallet,
		}),
	}).then(response => response.json())
	.then(responseJson => {
		return responseJson
	})
	.catch(error => {
		console.error(error)
	})
}

const getToWeiValue = async (_value) => {
  return await fetch(client.config.host[project] + client.config.url.getToWeiValue, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			value: _value,
		}),
	}).then(response => response.json())
	.then(responseJson => {
		return responseJson
	})
	.catch(error => {
		console.error(error)
	})
}

const getCosignerAddress = async () => {
	if(!await SecureStore.getItemAsync('PrivateKey')) return
	const result = await SecureStore.getItemAsync('PrivateKey')
	return client.web3.eth.accounts.privateKeyToAccount("0x" + result).address
}

const getCosignerPrivateKey = async () => {
	const result = await SecureStore.getItemAsync('PrivateKey')
	if(!result) return result
  return "0x" + result
}

const getWalletAddress = async () => {
  return await SecureStore.getItemAsync('wallet')
}

const getTransaction = async (_hash) => {
  return await client.web3.eth.getTransaction(_hash)
}

const getWalletBalance = async () => {
	return await fetch(client.config.host[project] + client.config.url.getWalletBalance, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			address: await getWalletAddress(),
		}),
	}).then(response => response.json())
	.then(responseJson => {
		return  Math.floor(responseJson.balance* 100000) / 100000
	})
	.catch(error => {
		console.log(error)
	})
}

const setPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("PrivateKey", _privateKey);
}

const setWallet = async (_wallet) => {
  await SecureStore.setItemAsync('wallet', _wallet)
}

const Wallet = {
	web3: client.web3,
  createWallet: createWallet,
	execute: execute,
	getCosignerAddress: getCosignerAddress,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance
}

export default Wallet
