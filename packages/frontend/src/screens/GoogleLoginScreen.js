import React, { Component } from 'react'
import { Platform, View, StyleSheet, Image } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'

import Constants from 'expo-constants'
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
      appStatus: "SignIn"
    }
  }

  componentWillMount = () => {
    this.initStandalone()
  }

  isStandaloneAndAndroid = () => {
    return Platform.OS === "android" && Constants.appOwnership !== "expo";
  }

  isStandaloneAndIos = () => {
    return Platform.OS === "ios" && Constants.appOwnership !== "expo";
  }

  signInWithGoogle = async () => {
    if (this.isStandaloneAndIos()) {
      this.signInWithGoogleStandalone()
    } else {
      this.signInWithGoogleExpo()
    }
  }

  signInRecoveryWithGoogle = async () => {
    if (this.isStandaloneAndIos()) {
      this.signInRecoveryWithGoogleStandalone()
    } else {
      this.signInRecoveryWithGoogleExpo()
    }
  }

  initStandalone = async () => {
    await GoogleSignIn.initAsync({
      clientId: GOOGLE_IOS_CLIENTID,
      scopes: ['profile', 'email']
    })
  }

  signInWithGoogleStandalone = async () => {
    try {
      await GoogleSignIn.signOutAsync()
      await GoogleSignIn.askForPlayServicesAsync()
      const { type, user } = await GoogleSignIn.signInAsync()
      if (type === 'success') {
        this.setState({ appStatus: "Loading" })
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        await this.props.navigation.navigate('SmsAuthScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
      }
    } catch ({ message }) {
      alert('login: Error:' + message)
    }
  }

  signInRecoveryWithGoogleStandalone = async () => {
    try {
      await GoogleSignIn.signOutAsync()
      await GoogleSignIn.askForPlayServicesAsync()
      const { type, user } = await GoogleSignIn.signInAsync()
      // alert(JSON.stringify(user))
      if (type === 'success') {
        this.setState({ appStatus: "Loading" })
        const credential = firebase.auth.GoogleAuthProvider.credential(user.auth.idToken, user.auth.accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        this.props.navigation.navigate('RecoveryScreen', {user: user}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
        this.setState({ appStatus: "SignIn" })
      }
    } catch ({ message }) {
      alert('login: Error:' + message)
    }
  }

  signOutStandalone = async () => {
    try {
      await GoogleSignIn.signOutAsync()
    } catch ({ message }) {
      alert('signOutAsync: ' + message)
    }
  }

  // Google OAuth認証メソッド
  signInWithGoogleExpo = async () => {
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
      if (type === 'success') {
        this.setState({ appStatus: "Loading" })
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        await this.props.navigation.navigate('SmsAuthScreen', {}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
      } else {
        console.log('ERROR')
      }
    } catch (e) {
      console.log(e)
    }
  }

  signInRecoveryWithGoogleExpo = async () => {
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
      this.setState({ appStatus: "Loading" })
      if (type === 'success') {
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken)
        await auth.signInWithCredential(credential)
        .catch(({ message }) => {
          console.log(message)
        })
        this.props.navigation.navigate('RecoveryScreen', {user: user}, NavigationActions.navigate({ routeName: 'GoogleLoginScreen' }))
        this.setState({ appStatus: "SignIn" })
      } else {
        console.log('ERROR')
      }
    } catch (e) {
      console.log(e)
    }
  }

  render() {
    if (this.state.appStatus === "Loading") {
      return <LoaderScreen />
    } else if (this.state.appStatus === "SignIn"){
      return (
        <View style={styles.container}>
          <Text
            h2
            style={styles.textAppTitle}
          >Step Wallet
          </Text>
          <Image
            source={require('../../assets/images/paper_airplane1.png')}
            style={styles.imagePaperAirplane}
          />
          <Button
            large
            title="Sign in with Google"
            titleStyle={styles.signInWithGoogleButtonTitle}
            icon={
              <Icon
                name="google"
                size={30}
                color="white"
              />
            }
            iconContainerStyle={styles.signInWithGoogleButtonIcon}
            buttonStyle={styles.signInWithGoogleButton}
            onPress={this.signInWithGoogle}
          />
          <Button
            large
            title="Sign in with Recovery"
            titleStyle={styles.signInWithRecoveryButtonTitle}
            icon={
              <Icon
                name="key"
                size={26}
                color="white"
              />
            }
            buttonStyle={styles.signInWithRecoveryButton}
            onPress={this.signInRecoveryWithGoogle}
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
  textAppTitle: {
    color: "#404040",
    fontWeight: 'bold'
  },
  imagePaperAirplane: {
    width: 230,
    height: 230,
    marginTop: 80,
    marginBottom: 90
  },
  signInWithGoogleButtonTitle: {
    marginLeft: 15
  },
  signInWithRecoveryButtonTitle: {
    marginLeft: 15
  },
  signInWithGoogleButtonIcon: {
    padding: 10
  },
  signInWithGoogleButton: {
    margin: 10,
    padding: 10,
    paddingRight: 24,
    paddingLeft: 16,
    borderRadius: 5,
    backgroundColor:'#DD5144'
  },
  signInWithRecoveryButton: {
    margin: 10,
    padding: 10,
    paddingLeft: 14,
    borderRadius: 5,
    backgroundColor:'#1DA1F2'
  }
})
