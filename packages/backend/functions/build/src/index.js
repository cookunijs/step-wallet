"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const admin = require("firebase-admin");
admin.initializeApp();
// const db = admin.firestore()
// db.settings({ host: 'localhost:8080', ssl: false })//TODO function deploy時に不要
const funcs = {
    createWallet: './wallets/createWallet',
    executeWallet: './wallets/executeWallet',
    recoveryWallet: './wallets/recoveryWallet',
    setRecoveryHash: './keyStorage/setRecoveryHash',
    getRecoveryHash: './keyStorage/getRecoveryHash',
    executeUnlock: './admin/executeUnlock'
};
const loadFunctions = (funcsObj) => {
    console.log('loadFunctions ' + process.env.FUNCTION_NAME);
    for (const name in funcsObj) {
        if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
            exports[name] = require(funcsObj[name]);
        }
    }
};
loadFunctions(funcs);
console.log('index loaded');
//# sourceMappingURL=index.js.map