import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack'
import GoogleLoginScreen from '../screens/GoogleLoginScreen'
import SettingPassScreen from '../screens/SettingPassScreen'
import SecondScreen from '../screens/SecondScreen'
import LoaderScreen from '../screens/LoaderScreen'

const AppNavigator = createStackNavigator({
	GoogleLoginScreen: {
		screen: GoogleLoginScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
			},
			headerBackTitle: null,
			headerShown: false,
			header:null,
		}
  },
  SettingPassScreen: {
		screen: SettingPassScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
			},
			headerBackTitle: null,
			headerShown: false,
			header:null,
		}
  },
  SecondScreen: {
		screen: SecondScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: Platform.OS === 'android' && options.headerShown !== false ? 56 : 0,
			},
			headerBackTitle: null,
			headerShown: false,
			header:null,
		}
	},
	initialRouteName: "GoogleLoginScreen",
})

const App = createAppContainer(AppNavigator)

class FirstScreen extends React.Component {
	render() {
			return (
				<App
					style={{
					}}
				/>
			)
	}
}
export default FirstScreen

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