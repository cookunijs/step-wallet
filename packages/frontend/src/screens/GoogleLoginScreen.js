import Wallet from '../plugins/wallet'
import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

import { NavigationActions } from 'react-navigation'
import * as AppAuth from 'expo-app-auth';
import * as Google from 'expo-google-app-auth'
import * as GoogleSignIn from 'expo-google-sign-in';

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

const GOOGLE_IOS_CLIENTID = '538365545759-uf0cdohaiesod91ua7rkpandmc0u6lob.apps.googleusercontent.com'
const GOOGLE_IOS_CLIENTID_FOR_EXPO = '538365545759-audut0sg98ispigd73gjboh2mskkr66v.apps.googleusercontent.com'
const GOOGLE_ANDROID_CLIENTID = '538365545759-37vfkj2bc0mmcnaov4e40qavn68f1om7.apps.googleusercontent.com'
const GOOGLE_ANDROID_CLIENTID_FOR_EXPO = '538365545759-v4s9m708be5qbph267aputpl1j9vm324.apps.googleusercontent.com'

class GoogleLoginScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      appStatus: 0
    }
  }

  componentDidMount() {
    this.initAsync();
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
      // this.setState({ user: null })
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
            h3
            style={{
              fontSize: 40,
              color: "#404040",
              fontWeight: 'bold',
            }}
          >
            First Step Wallet
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
