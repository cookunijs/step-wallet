import React, { Component } from 'react'
import { Platform } from 'react-native';
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import WalletScreen from './WalletScreen'
import ScannerScreen from './ScannerScreen'
import DetailScreen from './DetailScreen'

const _navigationOptions = {
	headerStyle: {
		marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
	},
	headerBackTitle: null,
	headerShown: false,
	header:null,
}

const AppNavigator = createStackNavigator({
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
	initialRouteName: "WalletScreen",
})

const App = createAppContainer(AppNavigator)

class SecondScreen extends React.Component {
	render() {
			return (
				<App/>
			)
	}
}

export default SecondScreen
