import React, { Component } from 'react'
import { Platform, AppState } from 'react-native'
import { createAppContainer, createSwitchNavigator } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import GoogleLoginScreen from './GoogleLoginScreen'
import SettingPassScreen from './SettingPassScreen'
import AppIntroScreen from './AppIntroScreen'
import RecoveryScreen from './RecoveryScreen'
import AuthScreen from './AuthScreen'
import WalletScreen from './WalletScreen'
import ScannerScreen from './ScannerScreen'
import DetailScreen from './DetailScreen'
import SmsAuthScreen from './SmsAuthScreen'

const _navigationOptions = {
	headerStyle: {
		marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
	},
	headerBackTitle: null,
	headerShown: false,
	header:null,
}

const SetupScreens = createSwitchNavigator({
	AuthScreen: {
		screen: AuthScreen,
		navigationOptions: _navigationOptions
	},
	GoogleLoginScreen: {
		screen: GoogleLoginScreen,
		navigationOptions: _navigationOptions
	},
	SmsAuthScreen: {
		screen: SmsAuthScreen,
		navigationOptions: _navigationOptions
	},
	RecoveryScreen: {
		screen: RecoveryScreen,
		navigationOptions: _navigationOptions
	},
  SettingPassScreen: {
		screen: SettingPassScreen,
		navigationOptions: _navigationOptions
	},
	AppIntroScreen: {
		screen: AppIntroScreen,
		navigationOptions: _navigationOptions
	},
	initialRouteName: 'AuthScreen',
})

const AppNavigator = createStackNavigator({
	SetupScreens: {
		screen: SetupScreens,
		navigationOptions: _navigationOptions
  },
	WalletScreen: {
		screen: WalletScreen,
		navigationOptions: _navigationOptions
	},
  ScannerScreen: {
		screen: ScannerScreen,
		navigationOptions: _navigationOptions
	},
	DetailScreen: {
		screen: DetailScreen,
		navigationOptions: _navigationOptions
	},
	initialRouteName: 'SetupScreens',
})

const App = createAppContainer(AppNavigator)

class NavigationScreen extends React.Component {
	constructor(props){
    super(props)
    this.state = {
			appState: AppState.currentState,
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange)
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange)
  }

  handleAppStateChange = async (nextAppState) => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      console.log('App has come to the foreground!')
    } else if(nextAppState.match(/inactive|background/)) {
			console.log('App has come to the inactive!')
      await this.props.navigation.navigate('AuthScreen')
    }
    this.setState({ appState: nextAppState })
  }
	render() {
		return <App/>
	}
}

export default NavigationScreen