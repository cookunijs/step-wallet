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
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const walletClient_1 = require("../../utlis/walletClient");
// const functions = fbFunctions.region('asia-northeast1')
const db = admin.firestore();
module.exports = functions.https.onCall((data, context) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(context);
    const authData = context.auth;
    if (!authData) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userUid = authData.uid;
    const userDoc = yield db
        .collection('users')
        .doc(userUid)
        .get();
    const walletDoc = yield db
        .collection('wallets')
        .doc(userUid)
        .get();
    if (userDoc.data() || walletDoc.data()) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called while authenticated.');
    }
    const cosigner = data.cosigner;
    const recover = data.recover;
    const contract = walletClient_1.default.getConfigData("contract");
    const walletFactory = contract.walletFactory;
    const nonce = yield walletClient_1.default.contract.WalletFactory.methods.nonce().call();
    //署名用のハッシュの作成
    const hash = yield walletClient_1.default.getSoliditySha3Hash(walletFactory, nonce, cosigner, recover);
    //authKeyで署名を実行
    const sign = walletClient_1.default.signAuthorized(hash);
    //signedTxに含める関数の実行データを作成(encodeABI)
    const encodeABI = walletClient_1.default.contract.WalletFactory.methods.deployCloneWallet(sign.v, sign.r, sign.s, nonce, cosigner, recover).encodeABI();
    const sendData = yield walletClient_1.default.sendSignedTransaction(cosigner, walletFactory, encodeABI);
    const wallet = sendData.receipt.logs[0].address;
    sendData.wallet = wallet;
    const batch = db.batch();
    batch.set(db.collection('users').doc(userUid), authData);
    batch.set(db.collection('wallets').doc(userUid), {
        address: wallet,
        recoveryCount: 0,
        recoveryPhoneAuth: false
    });
    batch.set(db.collection('hashs').doc(userUid), {
        state: false
    });
    yield batch.commit();
    return sendData;
}));
//# sourceMappingURL=createWallet.js.map