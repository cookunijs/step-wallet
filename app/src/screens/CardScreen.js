import React, { Component } from 'react';
import { Card, ListItem, Button } from 'react-native-elements'
import { StyleSheet, Text, View, Alert, TextInput, Image, ScrollView } from 'react-native';
import { NavigationActions } from 'react-navigation'

class CardScreen extends React.Component {
	render() {
		const { navigate } = this.props.navigation
		return (
			<ScrollView>
				{
					this.props.screenProps.data.map((u, i) => {
						return (
							<Card
								key={i}
								title={u.credentialSubject.alumniOf.name[0].value}
								image={require('../../assets/icon.png')}>
								<Text style={{marginBottom: 10}}>
									The idea with React Native Elements is more about component structure than actual design.
								</Text>
								<Button
									color="white"
									type="outline"
									buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
									title='VIEW NOW'
									onPress={() => navigate('WelcomeScreen', {}, NavigationActions.navigate({ routeName: 'CardScreen' }))
								}
									/>
							</Card>
						)
					})
				}
			</ScrollView>
		)
	}
}
export default CardScreen