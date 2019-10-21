import React, { Component } from 'react'
import { StyleSheet } from 'react-native'
import { Card, ListItem } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'

class SettingScreen extends React.Component {
	static navigationOptions = {
		title: 'Setting',
	}
	render() {
		const { navigate } = this.props.navigation
		const users = [
			{
			   name: '一般設定',
				 icon: 'av-timer',
				 subtitle: 'Vice Chairman',
				 uri: 'https://twitter.com/'
			},
			{
				name: 'プロフィール',
				icon: 'flight-takeoff',
				subtitle: 'Vice Chairman',
				uri: 'https://note.mu/'
		  },
		  {
				name: '画面設定',
				icon: 'av-timer',
				subtitle: 'Vice Chairman',
				uri: 'https://scrapbox.io/dkunii-70603727/'
			},
			{
			   name: '利用規約',
				 icon: 'flight-takeoff',
				 subtitle: 'Vice Chairman',
				 uri: 'https://block-base.co/'
			},
			{
				name: 'プライバシーポリシー',
				icon: 'flight-takeoff',
				subtitle: 'Vice Chairman',
				uri: 'https://block-base.co/#COMPANY'
		 },
			{
				name: '運営詳細',
				icon: 'av-timer',
				subtitle: 'Vice Chairman',
				uri: 'https://block-base.co/#CONTACT'
		 },
		]
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