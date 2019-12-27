import Wallet from '../plugins/wallet'
import React from 'react'
import { View, StyleSheet, Image } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Text } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import Constants from 'expo-constants'
import { ButtonGroup } from 'react-native-elements'
import LocalAuth from '../plugins/localAuth'

class AuthScreen extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      authenticated: false,
    }
  }
  componentDidMount = async() => {
    const wallet = await Wallet.getWalletAddress()
    const cosignerPrivateKey = await Wallet.getCosignerPrivateKey()
    if(wallet && cosignerPrivateKey) {
      await this.localAuthentication()
    } else {
      await this.props.navigation.navigate('GoogleLoginScreen', {}, NavigationActions.navigate({ routeName: 'AuthScreen' }))
    }
  }

  localAuthentication = async () => {
    const results = await LocalAuth.scanFingerPrint()
    if (results.success) {
      await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'AuthScreen' }))
    } else {
      this.setState({ authenticated: true })
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.authenticated && (
          <React.Fragment>
             <Text
              h2
              style={styles.textAppTitle}
            >
              Step Wallet
            </Text>
            <Image
              source={require('../../assets/images/paper_airplane1.png')}
              style={styles.imagePaperAirplane}
            />
            <Button
              large
              title="Authentication"
              titleStyle={styles.signInButtonTitle}
              icon={
                <Icon
                  name="sign-in"
                  size={30}
                  color="white"
                />
              }
              iconContainerStyle={styles.signInButtonIcon}
              buttonStyle={styles.signInButton}
              onPress={this.localAuthentication}
            />
          </React.Fragment>
        )}
      </View>
    )
  }
}

export default AuthScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    paddingTop: Constants.statusBarHeight,
    padding: 8,
    backgroundColor: '#fff',
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
  signInButtonTitle: {
    marginLeft: 15
  },
  signInButtonIcon: {
    padding: 10
  },
  signInButton: {
    margin: 10,
    padding: 10,
    paddingRight: 20,
    paddingLeft: 20,
    borderRadius: 5,
    backgroundColor:'#1DA1F2'
  }
})