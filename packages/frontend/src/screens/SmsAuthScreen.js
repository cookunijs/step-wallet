import Wallet from '../plugins/wallet'
import * as React from 'react'
import {Text, View, ScrollView, TextInput, Button} from 'react-native'
import { NavigationActions } from 'react-navigation'
import LoaderScreen from './LoaderScreen'
import { Linking } from 'expo'
import * as WebBrowser from 'expo-web-browser';

import firebase from './../plugins/firebase'
const auth = firebase.auth()

const captchaUrl = `https://my-contract-wallet-development.firebaseapp.com/index.html?appurl=${Linking.makeUrl('')}`

export default class SmsAuthScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      phone: '',
      confirmationResult: undefined,
      code: '',
      appStatus: "SignIn"
    }
  }

  onPhoneChange = (phone) => {
    this.setState({phone})
  }
  onPhoneComplete = async () => {
    let token = null
    const listener = ({url}) => {
      WebBrowser.dismissBrowser()
      const tokenEncoded = Linking.parse(url).queryParams['token']
      if (tokenEncoded)
        token = decodeURIComponent(tokenEncoded)
    }
    Linking.addEventListener('url', listener)
    await WebBrowser.openBrowserAsync(captchaUrl)
    Linking.removeEventListener('url', listener)
    if (token) {
      const {phone} = this.state
      const captchaVerifier = {
        type: 'recaptcha',
        verify: () => Promise.resolve(token)
      }
      try {
        const confirmationResult = await auth.signInWithPhoneNumber(phone, captchaVerifier)
        this.setState({confirmationResult})
      } catch (error) {
        console.warn(error)
      }
    }
  }
  onCodeChange = (code) => {
    this.setState({code})
  }

  onSignIn = async () => {
    const {confirmationResult, code} = this.state
    try {
      this.setState({ appStatus: "Loading" })
      const prevUser = await firebase.auth().currentUser
      if (!prevUser) return
      await confirmationResult.confirm(code)
      const credential = firebase.auth.PhoneAuthProvider.credential(confirmationResult.verificationId, code)
      await auth.signInWithCredential(credential)
      await firebase.auth().currentUser.delete()
      await prevUser.linkWithCredential(credential)
      await auth.signInWithCredential(credential)
      await Wallet.createWallet(prevUser.providerData[0]).then(async (data) => { //[TODO]: firebase.functions().httpsCallable('')で呼び出せるようにする。認証情報をcontext記載したいので。
        if(data.unregistered){
          await this.props.navigation.navigate('SettingPassScreen', {}, NavigationActions.navigate({ routeName: 'SmsAuthScreen' }))
          this.setState({ appStatus: "SignIn" })
        } else {
          await this.props.navigation.navigate('WalletScreen', {}, NavigationActions.navigate({ routeName: 'SmsAuthScreen' }))
          this.setState({ appStatus: "SignIn" })
        }
      })
    } catch (error) {
      console.warn(error)
    }
    this.reset()
  }
  reset = () => {
    this.setState({
      phone: '',
      phoneCompleted: false,
      confirmationResult: undefined,
      code: ''
    })
  }

  render() {
    if (this.state.appStatus === "Loading") {
      return <LoaderScreen />
    } else if (this.state.appStatus === "SignIn"){
      if (!this.state.confirmationResult)
        return (
          <ScrollView style={{padding: 20, marginTop: 20}}>
            <TextInput
              value={this.state.phone}
              onChangeText={this.onPhoneChange}
              keyboardType="phone-pad"
              placeholder="Your phone"
            />
            <Button
              onPress={this.onPhoneComplete}
              title="Phone"
            />
          </ScrollView>
        )
      else {
        return (
          <ScrollView style={{padding: 20, marginTop: 20}}>
            <TextInput
              value={this.state.code}
              onChangeText={this.onCodeChange}
              keyboardType="numeric"
              placeholder="Code from SMS"
            />
            <Button
              onPress={this.onSignIn}
              title="Sign in"
            />
          </ScrollView>
        )
      }
    }
  }
}