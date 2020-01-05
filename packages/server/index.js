const firebase = require('firebase')

const confirm = async () => {
  await firebase.initializeApp({
    apiKey: "AIzaSyD4jsW4ADkonZ31Tt318reVWF6QWm60lPA",
    authDomain: "test-demo-functions.firebaseapp.com",
    databaseURL: "https://test-demo-functions.firebaseio.com",
    projectId: "test-demo-functions",
    storageBucket: "test-demo-functions.appspot.com",
    messagingSenderId: "1095068460762",
    appId: "1:1095068460762:web:7a6f73b26db7495a5327e3"
  })

 await firebase.functions().httpsCallable('createWallet')({
      cosigner: "0x04c599c3E1091CbD00e8da14Ed3a7E72cAeEdaF8",
      recover: "0x65CAb099B26E45C007BEcdb30e5ca592e85987Cf"
    })
    .then((result) => {
      console.log(result)
    }).catch((result) => {
      console.log(result)
    })
}
confirm()