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
const web3Client_1 = require("../../utlis/web3Client");
// const functions = fbFunctions.region('asia-northeast1')
const db = admin.firestore();
module.exports = functions.https.onCall((data, context) => __awaiter(void 0, void 0, void 0, function* () {
    const authData = context.auth;
    if (!authData) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    const userUid = authData.uid;
    const walletDoc = yield db
        .collection('wallets')
        .doc(userUid)
        .get();
    const userDoc = yield db
        .collection('users')
        .doc(userUid)
        .get();
    if (!userDoc.data() || !walletDoc.data()) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called while authenticated.');
    }
    const docRefExecution = yield db.collection('execution').doc(userUid);
    const executionDoc = yield docRefExecution.get();
    let count = 0;
    if (executionDoc.data()) {
        count = executionDoc.data().count;
    }
    if (count >= web3Client_1.default.maxNumberOfExecution) {
        throw new functions.https.HttpsError('invalid-argument', 'The maximum number of executions has been exceeded.');
    }
    const cosigner = data.cosigner;
    const wallet = data.wallet;
    const sigCosigner = data.sign;
    const hash = data.hash;
    const executeDataEncodeABI = data.data;
    const authorized = data.authorized;
    const nonce = data.nonce;
    const to = data.to;
    const value = data.value || '0';
    const Wallet = web3Client_1.default.getCloneableWallet(wallet);
    const cosignerSenderPubKey = yield web3Client_1.default.web3.eth.accounts.recover(hash, sigCosigner.signature);
    if (cosigner === cosignerSenderPubKey) {
        //authKeyで署名を実行
        const sigAuthorized = web3Client_1.default.signAuthorized(hash);
        const v = [sigAuthorized.v, sigCosigner.v];
        const r = [sigAuthorized.r, sigCosigner.r];
        const s = [sigAuthorized.s, sigCosigner.s];
        //signedTxに含める関数の実行データを作成(encodeABI)
        const encodeABI = yield Wallet.methods.invoke(v, r, s, nonce, authorized, executeDataEncodeABI, to, value).encodeABI();
        const sendData = yield web3Client_1.default.sendSignedTransaction(cosigner, wallet, encodeABI);
        count += 1;
        yield docRefExecution.set({
            count: count,
        });
        return sendData;
    }
    else {
        throw new functions.https.HttpsError('invalid-argument', 'invalid cosigner signature.');
    }
}));
//# sourceMappingURL=executeWallet.js.map