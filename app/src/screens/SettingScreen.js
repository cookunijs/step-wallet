import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Card, ListItem } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
//MaterialIcons
class SettingScreen extends React.Component {
	static navigationOptions = {
		title: '',
	}
	render() {
		const { navigate } = this.props.navigation
		const users = [
			{
			   name: '一般設定',
				 icon: 'build',
				 subtitle: 'You can make general settings.',
				 uri: 'https://twitter.com/Daiki_k21'
			},
			{
				name: 'プロフィール',
				icon: 'face',
				subtitle: 'You can set profile settings.',
				uri: 'https://twitter.com/Daiki_k21'
		  },
		  {
				name: '画面設定',
				icon: 'phonelink-setup',
				subtitle: 'You can set screen settings.',
				uri: 'https://twitter.com/Daiki_k21'
			},
			{
			   name: '利用規約',
				 icon: 'security',
				 subtitle: 'You can see the terms of service.',
				 uri: 'https://docs.google.com/document/d/1dvHim2yzTXIt_ySZmb7sxCVtMpnMt4CKJQlpZ3dWm9E/edit?usp=sharing'
			},
			{
				name: 'プライバシーポリシー',
				icon: 'new-releases',
				subtitle: 'You can see the privacy policy.',
				uri: 'https://docs.google.com/document/d/1sLTECxh_OVooPFcH_Yo3qcU9X20ObUc7wEeiZMPY-UE/edit?usp=sharing'
		 },
			{
				name: '運営詳細',
				icon: 'business',
				subtitle: 'You can see the operation details.',
				uri: 'https://twitter.com/Daiki_k21'
		 },
		]
		//vpn-key
		return (
				<Card containerStyle={{padding: 0}}>
					{
						users.map((u, i) => {
							return (
								<ListItem
									key={i}
									leftIcon={{ name: u.icon }}
									title={u.name}
									subtitle={u.subtitle}
									bottomDivider
									onPress={() => navigate('WelcomeScreen', {uri: u.uri}, NavigationActions.navigate({ routeName: 'ProfileScreen' }))}
								>
								</ListItem>
							)
						})
					}
				</Card>
		)
	}
}
export default SettingScreen

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