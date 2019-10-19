//環境変数に設定する値
const process = {
  env: {
    SENDERPUBLICKEY: "0x4fDD03ea775a490242Cbe1382997F477d2ccC59E",
    SENDERPRIVATEKEY: "0x2afd91ee7448708b7be2f7c4b6973bf6ba02973bdc2b8b10aeec3dfa632add06",
    AUTHORIZEDPRIVATEKEY: "0x26eca9d40ba07290aa3601e68d010d20116942eed3b7f1dd7bc33b219d00e4b6",
  }
}

const express = require('express')
const host = process.env.HOST || '0.0.0.0'
const port = process.env.PORT || 5000
const app = express()

const bodyParser = require('body-parser')
const config = require('./config.json')
const Web3 = require('web3')
const web3 = new Web3(config.node.https)
const senderPublicKey = process.env.SENDERPUBLICKEY
const senderPrivateKey = process.env.SENDERPRIVATEKEY

const RECOVERY = 2

const contract = {
  walletFactory: new web3.eth.Contract(
    config.abi.walletFactory,
    config.contract.walletFactory
  ),
  keyManager: new web3.eth.Contract(
    config.abi.keyManager,
    config.contract.keyManager
  )
}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

//コントラクトウォレットを作成する関数
app.post('/createWallet', async function(req, res){
  const _authorizedPrivateKey = process.env.AUTHORIZEDPRIVATEKEY
  const param = req.body
  const _cosigner = param.cosigner
  const _walletFactory = config.contract.walletFactory
  const _nonce = await contract.walletFactory.methods.nonce().call()

  //署名用のハッシュの作成
  const _hash = await web3.utils.soliditySha3(
    _walletFactory,
    _nonce,
    _cosigner
  )

  //authKeyで署名を実行
  const sign = web3.eth.accounts.sign(
    _hash,
    _authorizedPrivateKey
  )

　//signedTxに含める関数の実行データを作成(encodeABI)
  const _result = contract.walletFactory.methods.deployCloneWallet(
    sign.v,
    sign.r,
    sign.s,
    _cosigner,
    _nonce
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

//transferFromなどの関数の実行に対してユーザーのコントラクトウォレットに向けて命令を実行する関数
app.post('/execute', async function(req, res){
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

  if(_cosigner === _cosignerSenderPubKey ) {

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
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
    .on('receipt', receipt => {
      console.log(`Success!!`)
      res.send(receipt)
    })
    .on('error', console.error)
  } else {
    console.log("error")
  }
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
  const recoveryPublicKey = await contract.keyManager.methods.addresses(RECOVERY).call()
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
  const _keyManager = config.contract.keyManager

  //recoveryの署名を復元
  const _recoveryPublicKey = await web3.eth.accounts.recover(_hash, _sigRecovery.signature)
  const recoveryPublicKey = await contract.keyManager.methods.addresses(RECOVERY).call()

  if(_recoveryPublicKey === recoveryPublicKey) {

    //authKeyで署名を実行
    const _sigAuth = web3.eth.accounts.sign(_hash, _authorizedPrivateKey)
    const _v = [_sigAuth.v, _sigRecovery.v]
    const _r = [_sigAuth.r, _sigRecovery.r]
    const _s = [_sigAuth.s, _sigRecovery.s]

　  //signedTxに含める関数の実行データを作成(encodeABI)
    const _result = await contract.keyManager.methods.update(
      _v,
      _r,
      _s,
      _nonce,
      _target,
      _new,
    ).encodeABI()
    const _gasLimit = await getGasLimit(_keyManager, _result)
    const _gasPrice = await getGasPrice()
    const nonce = await web3.eth.getTransactionCount(senderPublicKey)
    var transactionObj = {
      nonce: nonce,
      gasPrice: _gasPrice,
      gas: _gasLimit,
      from: recoveryPublicKey,
      to: _keyManager,
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

const getGasPrice = async() => {
  const result = await web3.eth.getGasPrice()
  return await web3.utils.toHex(web3.utils.toWei(result, 'wei'))
}

const getGasLimit = async(_to, _data) => {
  const result = parseInt(web3.eth.estimateGas({to: _to, data: _data}), 16).toString()
  return await web3.utils.toHex(result)
}

app.listen(port, function() {
  console.log('Node app is running')
})