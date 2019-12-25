import React, { Component } from 'react'
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import GoogleLoginScreen from './GoogleLoginScreen'
import SettingPassScreen from './SettingPassScreen'
import AppIntroScreen from './AppIntroScreen'
import SecondScreen from './SecondScreen'
import RecoveryScreen from './RecoveryScreen'

const _navigationOptions = {
	headerStyle: {
		marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
	},
	headerBackTitle: null,
	headerShown: false,
	header:null,
}

const AppNavigator = createStackNavigator({
	GoogleLoginScreen: {
		screen: GoogleLoginScreen,
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
  SecondScreen: {
		screen: SecondScreen,
		navigationOptions: _navigationOptions
	},
	initialRouteName: 'GoogleLoginScreen',
})

const App = createAppContainer(AppNavigator)

class FirstScreen extends React.Component {
	render() {
			return (
				<App/>
			)
	}
}

export default FirstScreen