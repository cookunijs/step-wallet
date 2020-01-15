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
    const authData = context.auth;
    console.log(authData);
    if (!authData) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userUid = authData.uid;
    const docRefHash = yield db.collection('hashs').doc(userUid);
    const hashDoc = yield docRefHash.get();
    const walletDoc = yield db
        .collection('wallets')
        .doc(userUid)
        .get();
    const userDoc = yield db
        .collection('users')
        .doc(userUid)
        .get();
    if (!userDoc.data() || !walletDoc.data() || !hashDoc.data()) {
        throw new functions.https.HttpsError('invalid-argument', 'Not document.');
    }
    const sigCosigner = data.sign;
    const cosigner = data.cosigner;
    const wallet = data.wallet;
    const hash = data.hash;
    const nonce = data.nonce;
    const crypted = data.crypted.toString();
    const contract = walletClient_1.default.getConfigData("contract");
    const keyStorage = contract.keyStorage;
    //ユーザーの署名を復元
    const cosignerSenderPubKey = yield walletClient_1.default.web3.eth.accounts.recover(hash, sigCosigner.signature);
    if (cosigner === cosignerSenderPubKey) {
        //authKeyで署名を実行
        const sigAuthorized = walletClient_1.default.signAuthorized(hash);
        const v = [sigAuthorized.v, sigCosigner.v];
        const r = [sigAuthorized.r, sigCosigner.r];
        const s = [sigAuthorized.s, sigCosigner.s];
        //signedTxに含める関数の実行データを作成(encodeABI)
        const encodeABI = yield walletClient_1.default.contract.KeyStorage.methods.setStorage(v, r, s, nonce, wallet, crypted).encodeABI();
        const sendData = yield walletClient_1.default.sendSignedTransaction(cosigner, keyStorage, encodeABI);
        yield docRefHash.set({
            state: true
        });
        return sendData;
    }
    else {
        console.log("error");
        return { states: "error" };
    }
}));
//# sourceMappingURL=setRecoveryHash.js.map