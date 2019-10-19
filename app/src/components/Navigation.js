import React, { Component } from 'react'
import { View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'

import ChartScreen from '../screens/HomeScreen'
import ProfileScreen from '../screens/ProfileScreen'
import WalletScreen from '../screens/WalletScreen'

const TabNavigator = createMaterialBottomTabNavigator(
	{
		Chart: { screen: ChartScreen,
			navigationOptions:{
				tabBarLabel:'Chart',
				tabBarIcon: ({ tintColor }) => (
					<View>
      			<Icon style={[{color: tintColor}]} size={25} name={'ios-pricetags'}/>
					</View>
				),
			}
		},
		Wallet: { screen: WalletScreen,
			navigationOptions:{
				tabBarLabel:'wallet',
				tabBarIcon: ({ tintColor }) => (
					<View>
						<Icon style={[{color: tintColor}]} size={25} name={'ios-wallet'}/>
					</View>
				),
			}
		},
		Profile: { screen: ProfileScreen,
			navigationOptions:{
				tabBarLabel:'Profile',
				tabBarIcon: ({ tintColor }) => (
					<View>
						<Icon style={[{color: tintColor}]} size={25} name={'ios-person'}/>
					</View>
				),
			}
		}
	},
	{
		initialRouteName: "Wallet",
		activeColor: '#f0edf6',
		inactiveColor: '#696969',
		barStyle: { backgroundColor: '#000000' },
	},
)

export default createAppContainer(TabNavigator)