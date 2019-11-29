import Wallet from '../plugins/wallet'
import React, { Component } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { NavigationActions } from 'react-navigation'
import * as Google from 'expo-google-app-auth'
import LoaderScreen from './LoaderScreen'

const config = {
  apiKey: "AIzaSyDwHlc13ZqyjIQs7ARsoUDSlGA75vo_Lr8",
  authDomain: "my-contract-wallet-development.firebaseapp.com",
  databaseURL: "https://my-contract-wallet-development.firebaseio.com",
  projectId: "my-contract-wallet-development",
  storageBucket: "my-contract-wallet-development.appspot.com",
  messagingSenderId: "538365545759",
  appId: "1:538365545759:web:7b8a1b3936f4ff2e70b42a",
  measurementId: "G-RYQM0FEGN8"
}

import firebase from 'firebase';
firebase.initializeApp(config)
const auth = firebase.auth()

const GOOGLE_IOS_CLIENTID = '538365545759-audut0sg98ispigd73gjboh2mskkr66v.apps.googleusercontent.com'
const GOOGLE_ANDROID_CLIENTID = '538365545759-37vfkj2bc0mmcnaov4e40qavn68f1om7.apps.googleusercontent.com'

class GoogleLoginScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      appStatus: 0
    }
	}
  // Google OAuth認証メソッド
  signInWithGoogle = async () => {
    try {
      await Google.logInAsync({
        behavior: 'web',
        iosClientId: GOOGLE_IOS_CLIENTID,
        scopes: ['profile', 'email'],
      }).then(async (result) => {
        this.setState({ appStatus: 1 })
        if (result.type === 'success') {
          const { idToken, accessToken } = result
          const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
          await auth.signInWithCredential(credential)
          .catch(({ message }) => {
            console.log(message)
          })
          await Wallet.createWallet(result.user).then(async (data) => {
            console.log(data.unregistered)
            if(data.unregistered){
              await this.props.navigation.navigate('SettingPassScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
              this.setState({ appStatus: 0 })
            } else {
              await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
              this.setState({ appStatus: 0 })
            }
          })
        } else {
          console.log('ERROR');
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  signInRecoveryWithGoogle = async () => {
    try {
      await Google.logInAsync({
        behavior: 'web',
        iosClientId: GOOGLE_IOS_CLIENTID,
        scopes: ['profile', 'email'],
      }).then(async (result) => {
        console.log(result.user.email)
        this.setState({ appStatus: 1 })
        if (result.type === 'success') {
          const { idToken, accessToken } = result
          const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
          await auth.signInWithCredential(credential)
          .catch(({ message }) => {
            console.log(message)
          })
          this.props.navigation.navigate('RecoveryScreen', {user: result.user}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
          this.setState({ appStatus: 0 })
        } else {
          console.log('ERROR');
        }
      })
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    if (this.state.appStatus === 1) {
      return <LoaderScreen />
    } else {
      return (
        <View style={styles.container}>
          <Button
            onPress={this.signInWithGoogle}
            title="Sign in with Google"
          />
          <Button
            onPress={this.signInRecoveryWithGoogle}
            title="Sign in with recovery"
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
