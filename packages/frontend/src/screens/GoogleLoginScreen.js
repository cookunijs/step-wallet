import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'

import * as AppAuth from 'expo-app-auth'
import * as Google from 'expo-google-app-auth'
import * as GoogleSignIn from 'expo-google-sign-in'
import firebase from './../plugins/firebase'
const auth = firebase.auth()

import {
  GOOGLE_IOS_CLIENTID,
  GOOGLE_IOS_CLIENTID_FOR_EXPO,
  GOOGLE_ANDROID_CLIENTID,
  GOOGLE_ANDROID_CLIENTID_FOR_EXPO,
} from 'react-native-dotenv'

import LoaderScreen from './LoaderScreen'

class GoogleLoginScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      appStatus: 0
    }
  }

  async componentWillMount() {
    const wallet = await Wallet.getWalletAddress()
    const cosignerPrivateKey = await Wallet.getCosignerPrivateKey()
    if(wallet && cosignerPrivateKey) {
      await this.props.navigation.navigate('SecondScreen')
    }
    this.initAsync()
  }

  initAsync = async () => {
    await GoogleSignIn.initAsync({
      clientId: GOOGLE_IOS_CLIENTID,
      scopes: ['profile', 'email']
    })
  }

  signInAsyncWithGoogle = async () => {
    try {
      await GoogleSignIn.signOutAsync()
      await GoogleSignIn.askForPlayServicesAsync()
      const { type, user } = await GoogleSignIn.signInAsync()
      if (type === 'success') {
        this.setState({ appStatus: 1 })
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        await Wallet.createWallet(user).then(async (data) => {
          if(data.unregistered){
            await this.props.navigation.navigate('SettingPassScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
            this.setState({ appStatus: 0 })
          } else {
            await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
            this.setState({ appStatus: 0 })
          }
        })
      }
    } catch ({ message }) {
      alert('login: Error:' + message)
    }
  }

  signInAsyncRecoveryWithGoogle = async () => {
    try {
      await GoogleSignIn.signOutAsync()
      await GoogleSignIn.askForPlayServicesAsync()
      const { type, user } = await GoogleSignIn.signInAsync()
      // alert(JSON.stringify(user))
      if (type === 'success') {
        this.setState({ appStatus: 1 })
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        this.props.navigation.navigate('RecoveryScreen', {user: user}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
        this.setState({ appStatus: 0 })
      }
    } catch ({ message }) {
      alert('login: Error:' + message)
    }
  }

  signOutAsync = async () => {
    try {
      await GoogleSignIn.signOutAsync()
    } catch ({ message }) {
      alert('signOutAsync: ' + message)
    }
  }

  // Google OAuth認証メソッド
  signInWithGoogle = async () => {
    try {
      const { type, accessToken, idToken, user } = await Google.logInAsync({
        behavior: 'web',
        iosClientId: GOOGLE_IOS_CLIENTID_FOR_EXPO,
        androidClientId: GOOGLE_ANDROID_CLIENTID_FOR_EXPO,
        iosStandaloneAppClientId: GOOGLE_IOS_CLIENTID,
        androidStandaloneAppClientId: GOOGLE_ANDROID_CLIENTID,
        scopes: ['profile', 'email'],
      }).catch((e) => {
        alert(e)
      })
      this.setState({ appStatus: 1 })
      if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        await Wallet.createWallet(user).then(async (data) => {
          if(data.unregistered){
            await this.props.navigation.navigate('SettingPassScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
            this.setState({ appStatus: 0 })
          } else {
            await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
            this.setState({ appStatus: 0 })
          }
        })
      } else {
        alert('ERROR')
      }
    } catch (e) {
      alert(e)
    }
  }

  signInRecoveryWithGoogle = async () => {
    try {
      const { type, accessToken, idToken, user } = await Google.logInAsync({
        behavior: 'web',
        iosClientId: GOOGLE_IOS_CLIENTID_FOR_EXPO,
        androidClientId: GOOGLE_ANDROID_CLIENTID_FOR_EXPO,
        iosStandaloneAppClientId: GOOGLE_IOS_CLIENTID,
        androidStandaloneAppClientId: GOOGLE_ANDROID_CLIENTID,
        scopes: ['profile', 'email'],
        redirectUrl: `${AppAuth.OAuthRedirect}:/oauth2redirect/google`
      })
      this.setState({ appStatus: 1 })
      if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        this.props.navigation.navigate('RecoveryScreen', {user: user}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
        this.setState({ appStatus: 0 })
      } else {
        alert('ERROR')
      }
    } catch (e) {
      alert(e)
    }
  }

  render() {
    if (this.state.appStatus === 1) {
      return <LoaderScreen />
    } else {
      return (
        <View style={styles.container}>
          <Text
            h2
            style={{
              color: "#404040",
              fontWeight: 'bold',
            }}
          >Step Wallet
          </Text>
          <Image
            source={require('../../assets/images/paper_airplane1.png')}
            style={{ width: 230, height: 230, marginTop: 80, marginBottom: 90, }}
          />
          <Button
            icon={
              <Icon
                name="google"
                size={30}
                color="white"
              />
            }
            large
            iconContainerStyle={{
              padding: 10,
            }}
            buttonStyle={{
              margin: 10,
              padding: 10,
              paddingRight: 24,
              paddingLeft: 16,
              borderRadius: 5,
              backgroundColor:'#DD5144'
            }}
            title="  Sign in with Google"
            onPress={this.signInAsyncWithGoogle}
          />
          <Button
            icon={
              <Icon
                name="key"
                size={26}
                color="white"
              />
            }
            large
            buttonStyle={{
              margin: 10,
              padding: 10,
              paddingLeft: 14,
              borderRadius: 5,
              backgroundColor:'#1DA1F2'
            }}
            title="  Sign in with Recovery"
            onPress={this.signInAsyncRecoveryWithGoogle}
          />
        </View>
      )
    }
  }
}

export default GoogleLoginScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
