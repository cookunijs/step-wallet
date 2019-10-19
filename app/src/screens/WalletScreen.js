import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, ScrollView } from 'react-native'
import { Card, ListItem, Button } from 'react-native-elements'

class SampleScreen extends React.Component {
	constructor(props){
    super(props)
    this.state = {
			wallet: "",
			balance: ""
    }
	}
	createWallet = async () => {
		if(await Wallet.getWalletAddress()) return
		const _wallet = await Wallet.createWallet()
		this.setState({
	    wallet: _wallet
		})
	}

	async componentDidMount() {
		this.setState({
			wallet: await Wallet.getWalletAddress(),
		})
		console.log(this.state.wallet)
		// console.log(this.state.balance)
		// balance: await Wallet.getWalletBalance()
	}

  render() {
    return (
      <ScrollView
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
				<Card
					title="Ethereum"
					image={require('../../assets/icon.png')}>
					<Text style={{marginBottom: 10}}>
						{this.state.wallet}
					</Text>
					<Text style={{marginBottom: 10}}>
						{this.state.balance}
					</Text>
					<Button
							color="white"
							type="outline"
							style={styles.button}
							buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
							title='VIEW NOW'
							onPress={() => navigate('WelcomeScreen', {}, NavigationActions.navigate({ routeName: 'CardScreen' }))
						}
					/>
					<Button
							color="white"
							type="outline"
							style={styles.button}
							buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
							title='VIEW NOW'
							onPress={() => navigate('WelcomeScreen', {}, NavigationActions.navigate({ routeName: 'CardScreen' }))
						}
					/>
				</Card>
        <Button
					buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
					title="作成"
					onPress={this.createWallet}
					style={styles.button}
				/>
      </ScrollView>
    )
  }
}

export default SampleScreen

const styles = StyleSheet.create({
  container: {
    color: "#000",
    backgroundColor: '#fff',
  },
  image: {
    width:200,
    height:200,
    borderWidth: 1,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10

  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  button: {
    margin: 10
  }
})
