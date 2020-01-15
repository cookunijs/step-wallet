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
    const wallet = walletDoc.data().address;
    const contract = walletClient_1.default.getConfigData("contract");
    const keyStorage = contract.keyStorage;
    const hashWord = walletClient_1.default.hashWord;
    const nonce = yield walletClient_1.default.contract.KeyStorage.methods.nonce().call();
    //署名用のハッシュの作成
    const hash = yield walletClient_1.default.getSoliditySha3Hash(keyStorage, nonce, wallet, hashWord);
    //authKeyで署名を実行
    const sign = walletClient_1.default.signAuthorized(hash);
    const v = sign.v;
    const r = sign.r;
    const s = sign.s;
    //ユーザーの署名を復元
    const crypted = yield walletClient_1.default.contract.KeyStorage.methods.getStorage(v, r, s, nonce, wallet, hashWord).call();
    const sendData = {
        wallet: wallet,
        crypted: crypted,
        unregistered: false
    };
    return sendData;
}));
//# sourceMappingURL=getRecoveryHash.js.map