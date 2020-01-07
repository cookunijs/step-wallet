import Wallet from '../plugins/wallet'
import * as React from 'react'
import {Text, View, ScrollView, TextInput, Button} from 'react-native'
import { NavigationActions } from 'react-navigation'
import LoaderScreen from './LoaderScreen'
import { Linking } from 'expo'
import * as WebBrowser from 'expo-web-browser'

import firebase from './../plugins/firebase'
const auth = firebase.auth()

const captchaUrl = `https://my-contract-wallet-development.firebaseapp.com/index.html?appurl=${Linking.makeUrl('')}`

export default class SmsLoginScreen extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      phone: '',
      confirmationResult: undefined,
      code: '',
      appStatus: "SignIn",
      createErrorStatus: false
    }
  }

  reset = () => {
    this.setState({
      phone: '',
      phoneCompleted: false,
      confirmationResult: undefined,
      code: ''
    })
  }

  onPhoneChange = (phone) => {
    this.setState({phone})
  }

  onCodeChange = (code) => {
    this.setState({code})
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

  onSignIn = async () => {
    const {confirmationResult, code} = this.state
    this.setState({ appStatus: "Loading" })
    try {
      const next = this.props.navigation.state.params.nextScreen
      const { user } = await confirmationResult.confirm(code).catch(() => {
        this.setState({ appStatus: "SignIn" })
        return
      })
      if(next === 'SettingPassScreen'){
        const prevUser = await firebase.auth().currentUser
        await Wallet.createWallet(prevUser.providerData[0])
        .catch((error) => {
          console.log(error)
          this.setState({ createErrorStatus: true })
        })
      }
      if(this.state.createErrorStatus) {
        await this.props.navigation.navigate('TopLoginScreen', {}, NavigationActions.navigate({ routeName: 'SmsLoginScreen' }))
      } else {
        await this.props.navigation.navigate(next, { user: user }, NavigationActions.navigate({ routeName: 'SmsLoginScreen' }))
      }
      this.setState({ appStatus: "SignIn" })
    } catch (error) {
      this.setState({ appStatus: "SignIn" })
      return
    }
    this.reset()
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