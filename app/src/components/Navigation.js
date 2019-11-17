import React, { Component } from 'react'
import { View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import SimpleScreen from '../screens/SimpleScreen'
import SecondScreen from '../screens/SecondScreen'
import ThirdScreen from '../screens/ThirdScreen'

const TabNavigator = createMaterialBottomTabNavigator(
	{
		Simple: { screen: SimpleScreen,
			navigationOptions:{
				tabBarLabel:'Simple',
				tabBarIcon: ({ tintColor }) => (
					<View>
      			<Icon style={[{color: tintColor}]} size={25} name={'ios-rocket'}/>
					</View>
				),
			}
		},
		Wallet: { screen: SecondScreen,
			navigationOptions:{
				tabBarLabel:'wallet',
				tabBarIcon: ({ tintColor }) => (
					<View>
						<Icon style={[{color: tintColor}]} size={25} name={'ios-wallet'}/>
					</View>
				),
			}
		},
		Setting: { screen: ThirdScreen,
			navigationOptions:{
				tabBarLabel:'Setting',
				tabBarIcon: ({ tintColor }) => (
					<View>
						<Icon style={[{color: tintColor}]} size={25} name={'ios-settings'}/>
					</View>
				),
			}
		}
	},
	{
		initialRouteName: "Wallet",
		activeColor: '#00acee',
		inactiveColor: '#a9a9a9',
		barStyle: { backgroundColor: '#fff' },
	},
)

export default createAppContainer(TabNavigator)