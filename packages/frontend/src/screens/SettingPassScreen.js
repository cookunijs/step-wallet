import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { View, StyleSheet } from 'react-native'
import { NavigationActions } from 'react-navigation'
import { Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Madoka } from 'react-native-textinput-effects'
import LoaderScreen from './LoaderScreen'

class SettingPassScreen extends React.Component {
	static navigationOptions = {
		title: 'SettingPass',
  }

	constructor(props){
    super(props)
    this.state = {
      pass: "",
      appStatus: 0
    }
  }

	loadData = async() => {
		this.setState({
			wallet: await Wallet.getWalletAddress(),
			balance: await Wallet.getWalletBalance()
		})
  }

	onChangePass = (_pass) => {
    this.setState({ pass: _pass })
  }

  setRecoveryHash = async () => {
    Wallet.setRecoveryHash(this.state.pass).then(async () => {
      await this.props.navigation.navigate('AppIntroScreen', {}, NavigationActions.navigate({ routeName: 'SettingPassScreen' }))
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
            style={styles.madokaTextInputPass}
            label={'PASS WORD'}
            borderColor={'#11bdff'}
            inputPadding={20}
            labelHeight={25}
            labelStyle={styles.madokaLabel}
            inputStyle={styles.madokaInput}
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
                iconStyle={styles.madokaButtonIcon}
              />
            }
            style={styles.button}
            onPress={this.setRecoveryHash}
          />
        </View>
      )
    }
  }
}

export default SettingPassScreen

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
  madokaLabel: {
    color: '#909090'
  },
  madokaInput: {
    color: '#909090'
  },
	madokaTextInputPass: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    margin: 15,
    height:100
  },
  madokaButtonIcon: {
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  }
})
