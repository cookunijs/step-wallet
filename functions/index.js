//環境変数に設定する値
// const process = {
//   env: {
//     PROJECT: "development",
//     SENDERPUBLICKEY: "0x7A7A156dC4754f6ff7Cf0D66aB56a9c85b49fe13",
//     SENDERPRIVATEKEY: "0x73109EC5629ECFF977ACF3801418A63802229171BC4EB1C764A056C67758DFCE",
//     AUTHORIZEDPRIVATEKEY: "0xD188779DBEF13E791540C32F61AF70C8C2D8472B2BC28D31497172DFA32B4212",
//     HASHWORD: "kunii"
//   }
// }
// SENDERPUBLICKEY: "0x4fDD03ea775a490242Cbe1382997F477d2ccC59E",
// SENDERPRIVATEKEY: "0x2afd91ee7448708b7be2f7c4b6973bf6ba02973bdc2b8b10aeec3dfa632add06",
// AUTHORIZEDPRIVATEKEY: "0x26eca9d40ba07290aa3601e68d010d20116942eed3b7f1dd7bc33b219d00e4b6",

const project = "development"
const config = require('./config.json')

const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore()

const express = require('express')
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 5000
const app = express()

const bodyParser = require('body-parser')
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.node[project].https))
const senderPublicKey = process.env.SENDERPUBLICKEY
const senderPrivateKey = process.env.SENDERPRIVATEKEY

const RECOVERY = 2

const contract = {
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

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.post('/getValUser', async (req, res) => {
  const param = req.body
  const _getValUserResult = await getValUser(param.user.email)
  const _result = {
    wallet: _getValUserResult.wallet.address,
    unregistered: _getValUserResult.unregistered
  }
  res.send(_result)
})

app.post('/setUser', async (req, res) => {
  const param = req.body
  const email = param.user.email
	let docRefUsers = db.collection('users').doc(email)
  await docRefUsers.set({
    ...param.user
  })
  let docRefWallet = db.collection('wallet').doc(email)
  await docRefWallet.set({
    address: param.wallet
  })
  const _result = {
    done: true,
  }
  res.send(_result)
})

//コントラクトウォレットを作成する関数
app.post('/createWallet', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _getValUserResult = await getValUser(param.user.email)
  if(!_getValUserResult.unregistered){
    const _result = {
      wallet: _getValUserResult.wallet.address,
      unregistered: _getValUserResult.unregistered,
      receipt: ""
    }
    res.send(_result)
    return
  }
  const _cosigner = param.cosigner
  const _recover = param.recover
  const _walletFactory = config.contract[project].walletFactory
  const _nonce = await contract.WalletFactory.methods.nonce().call()

  //署名用のハッシュの作成
  const _hash = await web3.utils.soliditySha3(
    _walletFactory,
    _nonce,
    _cosigner,
    _recover
  )

  //authKeyで署名を実行
  const sign = web3.eth.accounts.sign(
    _hash,
    _authorizedPrivateKey
  )

　//signedTxに含める関数の実行データを作成(encodeABI)
  const _result = contract.WalletFactory.methods.deployCloneWallet(
    sign.v,
    sign.r,
    sign.s,
    _nonce,
    _cosigner,
    _recover
  ).encodeABI()
  const _gasLimit = await getGasLimit(_walletFactory, _result)
  const _gasPrice = await getGasPrice()

  try{
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    const transactionObj = {
			nonce: nonce,
			gasPrice: _gasPrice,
      gas: _gasLimit,
      from: _cosigner,
			to: _walletFactory,
			value: web3.utils.numberToHex(web3.utils.toWei('0', 'ether')),
			data: _result
    }
    const signedTx = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)

    //senderKeyにてtransactionを送信する
		await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
		.on('receipt', async (receipt) => {
			const wallet = receipt.logs[0].address
			const _result = {
				wallet: wallet,
        receipt: receipt,
        unregistered: true
			}
			console.log(`Success CreateWalletAddress: ${wallet}`)
			res.send(_result)
		})
		.on('error', console.error)
  } catch(error) {
    console.log(error)
    return
  }
})

app.post('/setPass', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _sigCosigner = param.sign
  const _hash = param.hash
  const _cosigner = param.address
  const _wallet = param.wallet
  const _nonce = param.nonce
  const _crypted = param.crypted.toString()
  const _keyStorage = config.contract[project].keyStorage
  //ユーザーの署名を復元
  const _cosignerSenderPubKey = await web3.eth.accounts.recover(_hash, _sigCosigner.signature)

  if(_cosigner === _cosignerSenderPubKey) {
    //authKeyで署名を実行
    const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
    const _v = [_sigAuth.v, _sigCosigner.v]
    const _r = [_sigAuth.r, _sigCosigner.r]
    const _s = [_sigAuth.s, _sigCosigner.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const _result = await contract.KeyStorage.methods.setStorage(
      _v,
      _r,
      _s,
      _nonce,
      _wallet,
      _crypted
    ).encodeABI()
    const _gasLimit = await getGasLimit(_keyStorage, _result)
    const _gasPrice = await getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    var transactionObj = {
      nonce: nonce,
      gasPrice: _gasPrice,
      gas: _gasLimit,
      from: _cosigner,
      to: _keyStorage,
      value: web3.utils.numberToHex(web3.utils.toWei('0', 'ether')),
      data: _result
    }
    const signedTx = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)
    console.log('Sending.......')
    //senderKeyにてtransactionを送信する
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', receipt => {
      console.log(`Success!!`)
      res.send(receipt)
    })
    .on('error', console.error)
  } else {
    console.log("error")
  }
})

//transferFromなどの関数の実行に対してユーザーのコントラクトウォレットに向けて命令を実行する関数
app.post('/execute', async function(req, res){
  //これはcreateWalletでも実装する必要あり。
  //sender=>transactionHashでdbに保存
  //そのsenderがpending中かどうかnullが返ってくるかで判定して、nullが返って来たら違うsenderの検証へ
  //値が返って来たら処理が終了しているので安全、sender=>transactionHashをsender=>nullの初期状態に戻し、そのsenderでsendする。
  // web3.eth.getTransactionReceipt(signedTx.transactionHash).then(console.log)
  // if(process.env.transactionHash) {
  //   if(!await web3.eth.getTransaction(process.env.transactionHash).then(console.log)) {
  //     const a = {
  //       a: 0
  //     }
  //     res.send(a)
  //     return
  //   }
  // }

  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _sigCosigner = param.sign
  const _hash = param.hash
  const _cosigner = param.address
  const _data = param.data
  const _wallet = param.wallet
  const _authorized = param.authorized
  const _nonce = param.nonce
  const _to = param.to
  const _value = param.value || 0
  const Wallet = new web3.eth.Contract(config.abi.cloneableWallet, _wallet)

  //ユーザーの署名を復元
  const _cosignerSenderPubKey = await web3.eth.accounts.recover(_hash, _sigCosigner.signature)

  if(_cosigner === _cosignerSenderPubKey) {
    //authKeyで署名を実行
    const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
    const _v = [_sigAuth.v, _sigCosigner.v]
    const _r = [_sigAuth.r, _sigCosigner.r]
    const _s = [_sigAuth.s, _sigCosigner.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const _result = await Wallet.methods.invoke(
      _v,
      _r,
      _s,
      _nonce,
      _authorized,
      _data,
      _to,
      _value
    ).encodeABI()
    const _gasLimit = await getGasLimit(_wallet, _result)
    const _gasPrice = await getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    var transactionObj = {
      nonce: nonce,
      gasPrice: _gasPrice,
      gas: _gasLimit,
      from: _cosigner,
      to: _wallet,
      value: web3.utils.numberToHex(web3.utils.toWei('0', 'ether')),
      data: _result
    }
    const signedTx = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)
    console.log('Sending.......')
    //senderKeyにてtransactionを送信する
    web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', receipt => {
      console.log(`Success!!`)
      res.send(receipt)
    })
    .on('error', console.error)
  } else {
    console.log("error")
  }
})

app.post('/getPass', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _wallet = param.wallet
  const _nonce = param.nonce

  const _hash = await web3.utils.soliditySha3(
    config.contract[project].keyStorage,
    _nonce,
    _wallet,
		hashWord,
	)
  //authKyで署名を実行
  const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
  const _v = _sigAuth.v
  const _r = _sigAuth.r
  const _s = _sigAuth.s

　  //signedTxに含める関数の実行データを作成(encodeABI)
  console.log('Calling.......')
  const _crypted = await contract.KeyStorage.methods.getStorage(
    _v,
    _r,
    _s,
    _nonce,
    _wallet,
    hashWord
  ).call()
  console.log(`Success!!`)
  const _result = {
    crypted: _crypted,
  }
  res.send(_result)
})

//recoveryの署名が必要
app.post('/recoveryUser', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _sigRecovery = param.sign
  const _hash = param.hash
  const _new = param.new
  const _wallet = param.wallet
  const _nonce = param.nonce
  const Wallet = new web3.eth.Contract(config.abi.cloneableWallet, _wallet)

  //recoveryの署名を復元
  const _recoveryPublicKey = await web3.eth.accounts.recover(_hash, _sigRecovery.signature)
  const recoveryPublicKey = await contract.KeyStation.methods.addresses(RECOVERY).call()
  if(_recoveryPublicKey === recoveryPublicKey) {

    //authKeyで署名を実行
    const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
    const _v = [_sigAuth.v, _sigRecovery.v]
    const _r = [_sigAuth.r, _sigRecovery.r]
    const _s = [_sigAuth.s, _sigRecovery.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const _result = await Wallet.methods.emergencyRecovery(
      _v,
      _r,
      _s,
      _nonce,
      _new,
    ).encodeABI()
    const _gasLimit = await getGasLimit(_wallet, _result)
    const _gasPrice = await getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    var transactionObj = {
      nonce: nonce,
      gasPrice: _gasPrice,
      gas: _gasLimit,
      from: recoveryPublicKey,
      to: _wallet,
      value: web3.utils.numberToHex(web3.utils.toWei('0', 'ether')),
      data: _result
    }
    const signedTx = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)
    console.log('Sending.......')

    //senderKeyにてtransactionを送信する
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', receipt => {
      console.log(`Success!!`)
      res.send(receipt)
    })
    .on('error', console.error)
  } else {
    console.log("else")
  }
})

//recoveryの署名が必要
app.post('/keyUpdate', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _sigRecovery = param.sign
  const _hash = param.hash
  const _nonce = param.nonce
  const _target = param.target
  const _new = param.new
  const _keyStation = config.contract[project].keyStation

  //recoveryの署名を復元
  const _recoveryPublicKey = await web3.eth.accounts.recover(_hash, _sigRecovery.signature)
  const recoveryPublicKey = await contract.KeyStation.methods.addresses(RECOVERY).call()

  if(_recoveryPublicKey === recoveryPublicKey) {

    //authKeyで署名を実行
    const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
    const _v = [_sigAuth.v, _sigRecovery.v]
    const _r = [_sigAuth.r, _sigRecovery.r]
    const _s = [_sigAuth.s, _sigRecovery.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const _result = await contract.KeyStation.methods.update(
      _v,
      _r,
      _s,
      _nonce,
      _target,
      _new,
    ).encodeABI()
    const _gasLimit = await getGasLimit(_keyStation, _result)
    const _gasPrice = await getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    var transactionObj = {
      nonce: nonce,
      gasPrice: _gasPrice,
      gas: _gasLimit,
      from: recoveryPublicKey,
      to: _keyStation,
      value: web3.utils.numberToHex(web3.utils.toWei('0', 'ether')),
      data: _result
    }
    const signedTx = await web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey)
    console.log('Sending.......')

    //senderKeyにてtransactionを送信する
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', receipt => {
      console.log(`Success!!`)
      res.send(receipt)
    })
    .on('error', console.error)
  } else {
    console.log("else")
  }
})

app.post('/getWalletBalance', async function(req, res){
  const param = req.body
  const _address = param.address
  if(!_address){
    console.log("null address")
    const _result = {
      balance: 0,
    }
    res.send(_result)
    return
  }
  const balance = web3.utils.fromWei(await web3.eth.getBalance(_address), 'ether')
  const _result = {
    balance: balance,
  }
  res.send(_result)
})

app.post('/getWalletData', async function(req, res){
  const param = req.body
  const CloneableWallet = getCloneableWallet(param.wallet)
	const _nonce = await CloneableWallet.methods.nonce().call()
	const _keyStation = await CloneableWallet.methods.keyStation().call()
	const KeyManager = getKeyStation(_keyStation)
	const AUTHORIZED = await KeyManager.methods.AUTHORIZED().call()
  const _authorized = await KeyManager.methods.addresses(AUTHORIZED).call()
  const _result = {
    nonce: _nonce,
    authorized: _authorized
  }
  res.send(_result)
})

app.post('/getToWeiValue', async function(req, res){
  const param = req.body
  const _value = web3.utils.toWei(param.value, 'ether')
  const _result = {
    value: _value,
  }
  res.send(_result)
})

app.get('/getKeyStorageData', async function(req, res){
  const KeyStorage = getKeyStorage(config.contract[project].keyStorage)
	const _nonce = await KeyStorage.methods.nonce().call()
  const _result = {
    nonce: _nonce,
  }
  res.send(_result)
})

const getCloneableWallet = (_to) => {
  return new web3.eth.Contract(
    config.abi.cloneableWallet,
    _to
  )
}

const getKeyStation = (_to) => {
  return new web3.eth.Contract(
    config.abi.keyStation,
    _to
  )
}

const getKeyStorage = (_to) => {
  return new web3.eth.Contract(
    config.abi.keyStorage,
    _to
  )
}

const getGasPrice = async() => {
  const result = await web3.eth.getGasPrice()
  return await web3.utils.toHex(web3.utils.toWei(result, 'wei'))
}

const getGasLimit = async(_to, _data) => {
  const result = parseInt(web3.eth.estimateGas({to: _to, data: _data}), 16).toString()
  return await web3.utils.toHex(result)
}

const getValUser = async(_email) => {
  let cityRef = db.collection('wallet').doc(_email)
  return await cityRef.get()
  .then(doc => {
    if (!doc.exists) {
      const _data = { unregistered: true, wallet: "" }
      return _data
    } else {
      const _data = { unregistered: false, wallet: doc.data() }
      return _data
    }
  })
  .catch(err => {
    console.log('Error getting document', err);
  })
}

const api = functions.https.onRequest(app)
module.exports = { api }

// app.listen(port, function() {
//   console.log('Node app is running')
// })