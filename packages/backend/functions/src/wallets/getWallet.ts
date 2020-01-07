import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import client from '../../utlis/web3Client'
// const functions = fbFunctions.region('asia-northeast1')

const db = admin.firestore()

module.exports = functions.https.onCall(async (data, context) => {
  console.log(context)
  const authData = context.auth
  if (!authData) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    )
  }
  const userUid: string = authData.uid

  const userDoc = await db
  .collection('users')
  .doc(userUid)
  .get()

  const walletDoc = await db
  .collection('wallets')
  .doc(userUid)
  .get()

  if (userDoc.data() || walletDoc.data()) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'The function must be called while authenticated.'
    )
  }

  if (!walletDoc.exists) {
    const sendData = { unregistered: true, wallet: "" }
    return sendData
  } else {
    const sendData = { unregistered: false, wallet: walletDoc.data() }
    return sendData
  }
})
