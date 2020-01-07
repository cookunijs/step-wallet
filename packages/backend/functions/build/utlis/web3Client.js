"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const project = process.env.NODE_ENV || 'development';
const config = require('../config.json');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.HttpProvider(config.node[project].https));
const senderPublicKey = process.env.SENDERPUBLICKEY || '';
const senderPrivateKey = process.env.SENDERPRIVATEKEY || '';
const hashWord = process.env.HASHWORD || '';
const maxNumberOfExecution = Number(process.env.MAXNUMBEROFEXECUTION) || 10;
const RECOVERY = 2;
const contract = {
    WalletFactory: new web3.eth.Contract(config.abi.walletFactory, config.contract[project].walletFactory),
    KeyStation: new web3.eth.Contract(config.abi.keyStation, config.contract[project].keyStation),
    KeyStorage: new web3.eth.Contract(config.abi.keyStorage, config.contract[project].keyStorage)
};
const signAuthorized = (_hash) => {
    const authorizedPrivateKey = getAuthorizedPrivateKey();
    const sign = web3.eth.accounts.sign(_hash, authorizedPrivateKey);
    return sign;
};
const sendSignedTransaction = (_from, _to, _data) => __awaiter(void 0, void 0, void 0, function* () {
    const gasLimit = yield getGasLimit(_to, _data);
    const gasPrice = yield getGasPrice();
    const nonce = yield web3.eth.getTransactionCount(senderPublicKey);
    const value = web3.utils.numberToHex(web3.utils.toWei('0', 'ether'));
    const transactionObj = {
        nonce: nonce,
        gasPrice: gasPrice,
        gas: gasLimit,
        from: _from,
        to: _to,
        value: value,
        data: _data
    };
    const signedTx = yield web3.eth.accounts.signTransaction(transactionObj, senderPrivateKey);
    const receipt = yield web3.eth.sendSignedTransaction(signedTx.rawTransaction).on('error', console.error);
    const result = {
        receipt: receipt,
        unregistered: true
    };
    return result;
});
const getSoliditySha3Hash = (...args) => {
    const hash = web3.utils.soliditySha3(...args);
    return hash;
};
const getConfigData = (_key) => {
    return config[_key][project];
};
const getCloneableWallet = (_to) => {
    return new web3.eth.Contract(config.abi.cloneableWallet, _to);
};
const getAuthorizedPrivateKey = () => {
    return process.env.AUTHORIZEDPRIVATEKEY || '';
};
const getGasPrice = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield web3.eth.getGasPrice();
    const toWei = web3.utils.toWei(result, 'wei');
    return yield web3.utils.toHex(toWei);
});
const getGasLimit = (_to, _data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = parseInt(web3.eth.estimateGas({ to: _to, data: _data }), 16).toString();
    return yield web3.utils.toHex(result);
});
exports.default = {
    config,
    web3,
    contract,
    hashWord,
    maxNumberOfExecution,
    RECOVERY,
    signAuthorized,
    sendSignedTransaction,
    getConfigData,
    getCloneableWallet,
    getAuthorizedPrivateKey,
    getSoliditySha3Hash,
};
//# sourceMappingURL=web3Client.js.map