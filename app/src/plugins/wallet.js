import client from './ethereum-client.js'
import * as SecureStore from 'expo-secure-store';

const createWallet = async () => {
	console.log("start")
	if(await getWalletAddress()) return
	if (await getCosignerPrivateKey() == null){
		const _privateKey = await client.createAccount()
		setPrivateKey(_privateKey)
	}
	return await fetch(client.config.host.createWallet, {
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
		return responseJson.wallet
	})
	.catch(error => {
		console.error(error)
	})
}


const execute = async (_to, _encodeABI, _value) => {
	if(_value != 0) {
		_value = client.web3.utils.toWei(_value, 'ether')
	} else {
		_value = 0
	}
	const _wallet = getWalletAddress()
	const CloneableWallet = getCloneableWallet(_wallet)
	const _nonce = await CloneableWallet.methods.nonce().call()
	const _keyManager = await CloneableWallet.methods.keyManager().call()
	const KeyManager = getKeyManager(_keyManager)
	const AUTHORIZED = await KeyManager.methods.AUTHORIZED().call()
	const _authorized = await KeyManager.methods.addresses(AUTHORIZED).call()

	const _hash = await client.web3.utils.soliditySha3(
		_wallet,
		_nonce,
		_authorized,
		_encodeABI
	)

	const _sign = client.web3.eth.accounts.sign(
		_hash,
		getCosignerPrivateKey()
	)

	await fetch(client.config.host.execute, {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			address: getCosignerAddress(),
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
		return responseJson.movies
	})
	.catch(error => {
		console.error(error)
	})
}

const getCloneableWallet = (_to) => {
  return new client.web3.eth.Contract(
    client.config.cloneableWallet.abi,
    _to
  )
}

const getKeyManager = (_to) => {
  return new client.web3.eth.Contract(
    client.config.keyManager.abi,
    _to
  )
}

const getCosignerAddress = async () => {
	if(!await SecureStore.getItemAsync('PrivateKey')) return
	return client.web3.eth.accounts.privateKeyToAccount(await SecureStore.getItemAsync('PrivateKey')).address
}

const getCosignerPrivateKey = async () => {
  return await SecureStore.getItemAsync('PrivateKey')
}

const getWalletAddress = async () => {
  return await SecureStore.getItemAsync('wallet')
}

const getTransaction = async (_hash) => {
  return await client.web3.eth.getTransaction(_hash)
}

const getWalletBalance = async () => {
  return await client.web3.eth.getBalance(await getWalletAddress())
}

const setPrivateKey = async (_privateKey) => {
  await SecureStore.setItemAsync("PrivateKey", _privateKey);
}

const setWallet = async (_wallet) => {
  await SecureStore.setItemAsync('wallet', _wallet)
}

const Wallet = {
  createWallet: createWallet,
	execute: execute,
	getCosignerAddress: getCosignerAddress,
	getWalletAddress: getWalletAddress,
	getWalletBalance: getWalletBalance
}

export default Wallet
