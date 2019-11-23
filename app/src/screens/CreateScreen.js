import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, ScrollView, RefreshControl, Clipboard,  } from 'react-native'
import { Header, Card, Button, ButtonGroup, Input, ListItem } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import Modal from "react-native-modal"
import QRCode from 'react-native-qrcode-svg'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import ActionButton from 'react-native-action-button'
import { Madoka } from 'react-native-textinput-effects'

class CreateScreen extends React.Component {
	static navigationOptions = {
		title: 'Wallet',
	}
	constructor(props){
    super(props)
    this.state = {
			wallet: "",
			balance: "0",
			isSettingsModalVisible: false,
			isDepositModalVisible: false,
			isWithdrawModalVisible: false,
			to: "",
			value: "",
			refreshing: false,
			selectedIndex: 2
    }
	}
	loadData = async() => {
		this.setState({
			wallet: await Wallet.getWalletAddress(),
			balance: await Wallet.getWalletBalance()
		})
  }
	onRefresh = () => {
    this.setState({refreshing: true});
    this.loadData().then(() => {
      this.setState({refreshing: false});
    });
	}
	toggleSettingsModal = () => {
    this.setState({ isSettingsModalVisible: !this.state.isSettingsModalVisible })
	}
	toggleWithdrawModal = () => {
    this.setState({ isWithdrawModalVisible: !this.state.isWithdrawModalVisible })
	}
	toggleDepositModal = () => {
    this.setState({ isDepositModalVisible: !this.state.isDepositModalVisible })
	}
	onChangeTo = (_to) => {
		var searchTerm = 'ethereum:'
		var result = _to.indexOf(searchTerm)
		if(result !== -1) {
			_to = _to.replace('ethereum:', '')
		}
    this.setState({ to: _to })
	}
	onChangeQRCodeTo = () => {
    this.setState({ isWithdrawModalVisible: !this.state.isWithdrawModalVisible })
		this.props.navigation.navigate('ScannerScreen', {}, NavigationActions.navigate({ routeName: 'WalletScreen' }))
	}
	onChangeValue = (_value) => {
    this.setState({ value: _value })
	}
	setClipboardContent = () => {
		Clipboard.setString(this.state.wallet)
	}
	createWallet = async () => {
		const _wallet = await Wallet.createWallet()
		this.setState({
	    wallet: _wallet
		})
	}
	transferEth = async () => {
		if(this.state.isWithdrawModalVisible){
			this.toggleWithdrawModal()
			await Wallet.execute(this.state.to, "0x", this.state.value)
			this.setState({
				balance: await Wallet.getWalletBalance(),
				to: ''
			})
		}
	}
	async componentDidMount() {
		await this.loadData()
	}
	updateIndex = async (_index) => {
		if(_index == 0){
			this.toggleDepositModal()
		} else if (_index == 1) {
			this.toggleWithdrawModal()
		}
	}
  render() {
		const users = [
			{
			   name: 'Setting',
				 icon: 'build',
				 uri: 'https://twitter.com/Daiki_k21'
			},
			{
				name: 'Recovery',
				icon: 'face',
				uri: 'https://twitter.com/Daiki_k21'
		  },
			{
			   name: 'Terms',
				 icon: 'security',
				 uri: 'https://docs.google.com/document/d/1dvHim2yzTXIt_ySZmb7sxCVtMpnMt4CKJQlpZ3dWm9E/edit?usp=sharing'
			},
			{
				name: 'Privacy Policy',
				icon: 'new-releases',
				uri: 'https://docs.google.com/document/d/1sLTECxh_OVooPFcH_Yo3qcU9X20ObUc7wEeiZMPY-UE/edit?usp=sharing'
		 },
			{
				name: 'Operation',
				icon: 'business',
				uri: 'https://twitter.com/Daiki_k21'
		 },
		]
		// const { navigate } = this.props.navigation
		// if(this.props.navigation.state.params) {
		// 	this.setState({ isWithdrawModalVisible: true })
		// 	const { to } = this.props.navigation.state.params
		// 	this.onChangeTo(to)
		// 	this.props.navigation.state.params = undefined
		// }
		const buttons = [{ element: this.component1 }, { element: this.component2 }]
  	const selectedIndex = this.state.selectedIndex
    return (
			<React.Fragment>
			{/* <Header
				placement="left"
				statusBarProps={{ barStyle: 'light-content' }}
				barStyle="light-content" // or directly
				centerComponent={{ text: 'Wallet', style: { color: '#000', fontSize: 35, fontWeight: 'bold' } }}
				rightComponent={{ icon: 'dehaze', color: '#000', paddingRight: 20, size: 35, onPress:this.toggleSettingsModal}}//this.props.navigation.goBack()
				containerStyle={{
					backgroundColor: '#fff',
					paddingTop: 30,
					paddingRight: 25,
					flex: 0.15,
				}}
			/> */}
      <ScrollView
				refreshControl={
					<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={this.onRefresh}
					/>
				}
        style={{
          flex: 1,
          flexDirection: 'column',
        }}>
        <Button
					buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
					title="Create"
					onPress={this.createWallet}
					style={styles.button}
				/>
				</ScrollView>
      </React.Fragment>
    )
  }
}

export default CreateScreen

const styles = StyleSheet.create({
  container: {
    color: "#000",
    backgroundColor: '#fff',
	},
	card: {
		color: "red",
    backgroundColor: 'red',
	},
	textInputMadoka: {
    width:300,
		height:100,
	},
	textInputMadokaAddress: {
		paddingTop: -400,
		marginTop: 150,
		marginBottom: 30,
    width:300,
    height:100,
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
	contentSend: {
    backgroundColor: 'white',
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
	},
	contentSettings: {
		backgroundColor: 'white',
		paddingTop: 40,
		paddingBottom: 40,
		paddingLeft: 25,
    paddingRight: 25,
		paddingBottom: 270
	},
	contentListItemSettings: {
		padding: 5,
		fontSize: 30,
		fontWeight: 'bold'
	},
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 40
	},
	fixToFumi: {
		flexDirection: 'row',
		alignItems: 'center',
    justifyContent: 'center',
		margin: 20
	},
	fixToIcon: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		size: 200,
    margin: 10
  },
  contentTitle: {
		padding: 5,
		fontSize: 20,
    marginBottom: 12
	},
	contentQRcodeTitle: {
		padding: 12,
		fontSize: 30,
		fontWeight: 'bold',
		marginTop: 40,
    marginBottom: 30,
	},
	contentSettingsTitle: {
		fontSize: 35,
		fontWeight: 'bold',
		marginTop: 30,
    marginBottom: 20,
	},
	contentSendTitle: {
		fontSize: 35,
		fontWeight: 'bold',
		paddingTop: 180,
		paddingRight: 230,
		marginBottom: -30,
	},
	contentModalText: {
		padding: 15,
    fontSize: 10,
    marginBottom: 10,
	},
	contentAddressText: {
		padding: 10,
		color: "#000",
		fontSize: 10,
		fontWeight: 'bold',
    marginBottom: 10,
	},
	contentBalanceText: {
		marginLeft: 40,
		color: "#404040",
		fontSize: 95,
		fontWeight: 'bold',
		marginTop: 40,
	},
	contentEthText: {
		padding: 10,
		color: "#404040",
		fontSize: 35,
		fontWeight: 'bold',
		marginLeft: 254,
		marginTop: -65,
	},
	contentOpenQRcode: {
		marginLeft: 182,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -145,
	},
	contentReadQRcode: {
		marginLeft: 250,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -170,
	},
	contentCloseSetting: {
		marginTop: 230,
		marginBottom: -210,
	},
  button: {
		padding: 5,
		paddingLeft: 24,
    paddingRight: 24,
		marginTop: 30,
		marginLeft: 20,
    marginRight: 10,
		fontSize: 10,
	},
	copeButton: {
		padding: 5,
		paddingLeft: 24,
		paddingRight: 24,
		marginTop: 150,
		marginLeft: 20,
		marginRight: 10,
    marginBottom: 70,
	},
	sendButton: {
		padding: 5,
		paddingLeft: 24,
		paddingRight: 24,
		marginTop: 150,
		marginLeft: 20,
		marginRight: 10,
    marginBottom: 70,
	},
	actionButtonIcon: {
    fontSize: 20,
    marginBottom: 40,
		marginRight: 10,
    color: '#00acee',
  },
	bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
	},
	contentIcon: {
		marginTop: 5,
    marginBottom: 10,
    marginRight: 10,
	},
})
