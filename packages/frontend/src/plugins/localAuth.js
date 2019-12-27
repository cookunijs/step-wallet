
import * as LocalAuthentication from 'expo-local-authentication'

scanFingerPrint = async () => {
  try {
    let results = await LocalAuthentication.authenticateAsync()
    return results
  } catch (err) {
    console.log(err)
  }
}

const LocalAuth = {
  ...LocalAuthentication,
  scanFingerPrint
}

export default LocalAuth
