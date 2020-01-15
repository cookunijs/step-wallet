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
    if (!authData) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    let count = 0;
    const userUid = authData.uid;
    const docRefWallet = yield db.collection('wallets').doc(userUid);
    const walletDoc = yield docRefWallet
        .get();
    const userDoc = yield db
        .collection('users')
        .doc(userUid)
        .get();
    if (!userDoc.data() || !walletDoc.data()) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called while authenticated.');
    }
    if (walletDoc.data()) {
        count = walletDoc.data().recoveryCount;
    }
    if (count >= walletClient_1.default.maxNumberOfRecovery) {
        throw new functions.https.HttpsError('invalid-argument', 'The maximum number of recovery has been exceeded.');
    }
    else {
        count += 1;
        yield docRefWallet.update({
            recoveryCount: count,
        });
    }
    // if(!walletDoc.data().recoveryPhoneAuth) {
    //   throw new functions.https.HttpsError(
    //     'unauthenticated',
    //     'phone unauthenticated.'
    //   )
    // }
    const wallet = data.wallet;
    const sigRecovery = data.sign;
    const newAddress = data.new;
    const hash = data.hash;
    const nonce = data.nonce;
    const recoveryDataEncodeABI = data.data;
    const Wallet = walletClient_1.default.getCloneableWallet(wallet);
    const recovery = yield Wallet.methods.recover().call();
    const recoveryPublicKey = yield walletClient_1.default.web3.eth.accounts.recover(hash, sigRecovery.signature);
    if (recovery === recoveryPublicKey) {
        //authKeyで署名を実行
        const sigAuthorized = walletClient_1.default.signAuthorized(hash);
        const v = [sigAuthorized.v, sigRecovery.v];
        const r = [sigAuthorized.r, sigRecovery.r];
        const s = [sigAuthorized.s, sigRecovery.s];
        //signedTxに含める関数の実行データを作成(encodeABI)
        const encodeABI = yield Wallet.methods.emergencyRecovery(v, r, s, nonce, newAddress, recoveryDataEncodeABI).encodeABI();
        const sendData = yield walletClient_1.default.sendSignedTransaction(recoveryPublicKey, wallet, encodeABI);
        sendData.wallet = wallet;
        // await docRefWallet.set({
        //   recoveryCount: count,
        // })
        //recoveryPhoneAuth: false //address: wallet,
        return sendData;
    }
    else {
        throw new functions.https.HttpsError('invalid-argument', 'invalid recovery signature.');
    }
}));
//# sourceMappingURL=recoveryWallet.js.map