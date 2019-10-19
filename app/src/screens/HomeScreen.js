import React, { Component } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import { Card, ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import { createAppContainer } from 'react-navigation'
import { createStackNavigator } from 'react-navigation-stack';
import WelcomeScreen from '../screens/WelcomeScreen'
import CardScreen from '../screens/CardScreen'

const AppNavigator = createStackNavigator({
	CardScreen: {
		screen: CardScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: -100
			},
		}
	},
  WelcomeScreen: {
		screen: WelcomeScreen,
		navigationOptions: {
      headerStyle: {
        marginTop: -45
			},
		}
	},
	initialRouteName: "CardScreen",
});
const App = createAppContainer(AppNavigator)
class HomeScreen extends React.Component {
	render() {
		const { navigate } = this.props.navigation
		return (
				<App
					style={{
					}}
					screenProps={{
						data: this.props.screenProps.data,
					}}
				/>
		)
	}
}
export default HomeScreen