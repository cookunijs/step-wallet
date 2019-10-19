import React, { Component } from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Card, ListItem, Button, Icon } from 'react-native-elements'

class ProfileScreen extends React.Component {
	static navigationOptions = {
		title: 'Welcome',
	}
	render() {
		const users = [
			{
			   name: '一般設定',
			   avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg'
			},
			{
				name: 'プロフィール',
				avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg'
		  },
		  {
				name: '画面設定',
				avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg'
			},
			{
			   name: '時間割',
			   avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg'
			},
			{
				name: '学校詳細',
				avatar: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg'
		 },
		]
		return (
			<View>
				<Card containerStyle={{padding: 0}}>
					{
						users.map((u, i) => {
							return (
								<ListItem
								key={i}
								roundAvatar
								title={u.name}
								avatar={{uri:u.avatar}}
								/>
							)
						})
					}
				</Card>
			</View>
		)

	}
}
export default ProfileScreen