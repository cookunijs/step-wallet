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
module.exports = functions.pubsub.topic('executeUnlock').onPublish((message) => __awaiter(void 0, void 0, void 0, function* () {
    const deleteCollection = (db, collectionPath, batchSize) => __awaiter(void 0, void 0, void 0, function* () {
        let collectionRef = db.collection(collectionPath);
        let query = collectionRef.orderBy('__name__').limit(batchSize);
        return new Promise((resolve, reject) => {
            deleteQueryBatch(db, query, batchSize, resolve, reject);
        });
    });
    const deleteQueryBatch = (db, query, batchSize, resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        query.get()
            .then((snapshot) => {
            if (snapshot.size == 0) {
                return 0;
            }
            let batch = db.batch();
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            return batch.commit().then(() => {
                return snapshot.size;
            });
        }).then((numDeleted) => {
            if (numDeleted === 0) {
                resolve();
                return;
            }
            process.nextTick(() => {
                deleteQueryBatch(db, query, batchSize, resolve, reject);
            });
        })
            .catch(reject);
    });
    console.log('recoveryUnlock: START');
    yield deleteCollection(db, walletClient_1.default.deleteCollectionPath, walletClient_1.default.deleteCollectionBatchSize);
    console.log('recoveryUnlock: DONE');
}));
//# sourceMappingURL=recoveryUnlock.js.map