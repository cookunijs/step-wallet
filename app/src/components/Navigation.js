import React, { Component } from 'react'
import { View } from 'react-native'
import { createAppContainer } from 'react-navigation'
import { createMaterialBottomTabNavigator } from 'react-navigation-material-bottom-tabs'
import Icon from 'react-native-vector-icons/Ionicons'
import ChartScreen from '../screens/ChartScreen'
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
		activeColor: '#00acee',
		inactiveColor: '#a9a9a9',
		barStyle: { backgroundColor: '#fff' },
	},
)

export default createAppContainer(TabNavigator)