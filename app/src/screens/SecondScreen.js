import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';
import WalletScreen from '../screens/WalletScreen'
import ScannerScreen from '../screens/ScannerScreen'

const AppNavigator = createStackNavigator({
	WalletScreen: {
		screen: WalletScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: -100
			},
		}
	},
    ScannerScreen: {
		screen: ScannerScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: -45
			},
		}
	},
	initialRouteName: "WalletScreen",
});
const App = createAppContainer(AppNavigator)

class ProfileScreen extends React.Component {
	render() {
			return (
				<App
					style={{
					}}
				/>
			)
	}
}
export default ProfileScreen

const styles = StyleSheet.create({
  container: {
		width: 375,
    height: 800,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width:200,
    height:200,
    borderWidth: 1,
	},
	subtitleView: {
		flexDirection: 'row',
		paddingLeft: 10,
		paddingTop: 5
	},
	ratingImage: {
		height: 19.21,
		width: 100
	},
	ratingText: {
		paddingLeft: 10,
		color: 'grey'
	}
})