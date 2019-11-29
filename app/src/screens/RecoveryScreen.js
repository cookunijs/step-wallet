import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet, RefreshControl, Clipboard } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button, Input } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Madoka } from 'react-native-textinput-effects'
import LoaderScreen from './LoaderScreen'

class RecoveryScreen extends React.Component {
	static navigationOptions = {
		title: 'Recovery',
	}
	constructor(props){
    super(props)
    this.state = {
      pass: "",
      appStatus: 0
    }
	}
	onChangePass = (_pass) => {
    this.setState({ pass: _pass })
  }
  recoveryWallet = async () => {
    Wallet.recoveryWallet(this.props.navigation.state.params.user, "0x",this.state.pass).then(async (data) => {
      await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'RecoveryScreen' }))
      this.setState({ appStatus: 0 })
    })
    this.setState({ appStatus: 1 })
  }
  render() {
    if (this.state.appStatus === 1) {
      return <LoaderScreen />
    } else {
      return(
        <View>
          <Madoka
            value={this.state.pass}
            style={styles.textInputMadokaPass}
            label={'PASS WORD'}
            // this is used as active and passive border color
            borderColor={'#11bdff'}
            inputPadding={20}
            labelHeight={25}
            labelStyle={{ color: '#909090' }}
            inputStyle={{ color: '#909090' }}
            onChangeText={this.onChangePass}
          />
          <Button
            type="Clear"
            icon={
              <Icon
                size={70}
                name='key'
                color='#11bdff'
                style={styles.sendButton}
                iconStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
              />
            }
            style={styles.button}
            onPress={this.recoveryWallet}
          />
        </View>
      )
    }
  }
}

export default RecoveryScreen

const styles = StyleSheet.create({
  container: {
    color: "#000",
    backgroundColor: '#fff',
	},
  button: {
    marginTop: 250,
    margin: 15,
    fontSize: 10,
  },
	textInputMadoka: {
    width:300,
		height:100,
	},
	textInputMadokaPass: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    margin: 15,
    height:100,
    // flex: 3
	}
})
