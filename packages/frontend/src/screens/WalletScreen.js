import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, ScrollView, RefreshControl, Clipboard,  } from 'react-native'
import { Header, Button, ListItem } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import Modal from "react-native-modal"
import QRCode from 'react-native-qrcode-svg'
import Icon from 'react-native-vector-icons/FontAwesome'
import EvilIcon from 'react-native-vector-icons/EvilIcons'
import ActionButton from 'react-native-action-button'
import { Madoka } from 'react-native-textinput-effects'

class WalletScreen extends React.Component {
	static navigationOptions = {
		title: 'Wallet',
	}
	constructor(props){
    super(props)
    this.state = {
			isSettingsModalVisible: false,
			isDepositModalVisible: false,
			isWithdrawModalVisible: false,
			refreshing: false,
			wallet: "",
			to: "",
			value: "",
			balance: "0.00",
			selectedIndex: 2
    }
	}
	loadData = async () => {
		this.setState({
			wallet: await Wallet.getWalletAddress(),
			balance: await Wallet.getWalletBalance()
		})
  }
	onRefresh = () => {
    this.setState({refreshing: true})
    this.loadData().then(() => {
      this.setState({refreshing: false})
    })
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
	toggleDetailScreen = (_name, _uri) => {
		this.setState({ isSettingsModalVisible: !this.state.isSettingsModalVisible })
		this.props.navigation.navigate('DetailScreen', { name: _name, uri: _uri }, NavigationActions.navigate({ routeName: 'WalletScreen' }))
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
		const { navigate } = this.props.navigation
		if(this.props.navigation.state.params) {
			this.setState({ isWithdrawModalVisible: true })
			const { to } = this.props.navigation.state.params
			this.onChangeTo(to)
			this.props.navigation.state.params = undefined
		}

    return (
			<React.Fragment>
				<Header
					placement="left"
					statusBarProps={{ barStyle: 'light-content' }}
					barStyle="light-content"
					centerComponent={{ text: 'Wallet', style: { color: '#000', fontSize: 35, fontWeight: 'bold' } }}
					rightComponent={{ icon: 'dehaze', color: '#000', paddingRight: 20, size: 35, onPress:this.toggleSettingsModal}}//this.props.navigation.goBack()
					containerStyle={{
						backgroundColor: '#fff',
						paddingTop: 30,
						paddingRight: 25,
						flex: 0.15,
					}}
				/>
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
					}}
				>
					<Text style={styles.contentBalanceText}>
						{this.state.balance}
					</Text>
					<Text style={styles.contentEthText}>
						ETH
					</Text>
					<Button
						type="Clear"
						style={styles.contentOpenQRcode}
						onPress={this.toggleDepositModal}
						icon={
							<Icon
								name="qrcode"
								size={35}
								color="#404040"
							/>
						}
					/>
					<Modal
						isVisible={this.state.isSettingsModalVisible}
						onSwipeComplete={() => this.setState({ isSettingsModalVisible: false })}
						swipeDirection={['up', 'left', 'right', 'down']}
						style={styles.bottomModal}
					>
						<View style={styles.contentSettings}>
							<Text style={styles.contentSettingsTitle}>Menu</Text>
							{
								users.map((u, i) => {
									return (
										<ListItem
											style={styles.contentListItemSettings}
											key={i}
											leftIcon={{ name: u.icon, color: "#303030", size: 30, paddingLeft: 5 }}
											title={u.name}
											titleStyle={{ color: "#303030", fontSize: 25, fontWeight: 'bold', paddingLeft: 15 }}
											bottomDivider
											onPress={() => {this.toggleDetailScreen(u.name, u.uri)}}
										>
										</ListItem>
									)
								})
							}
							<Button
								type="Clear"
								style={styles.contentCloseSetting}
								onPress={this.toggleSettingsModal}
								icon={
									<EvilIcon
										name="close"
										size={60}
										color="#404040"
									/>
								}
							/>
						</View>
					</Modal>
					<Modal
						isVisible={this.state.isDepositModalVisible}
						onSwipeComplete={() => this.setState({ isDepositModalVisible: false })}
						swipeDirection={['up', 'left', 'right', 'down']}
						style={styles.bottomModal}
					>
						<View style={styles.content}>
							<Text style={styles.contentQRcodeTitle}>My QRCode</Text>
								<QRCode
									value={this.state.wallet}
									size={220}
									bgColor='#00acee'
									fgColor='white'
									logo={{
										url:
											'data:image/png;base64,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',
									}}
									logoSize={55}
									logoMargin={2}
									logoBorderRadius={50}
									logoBackgroundColor="white"
								/>
								<View>
									<Button
										type="Clear"
										icon={
											<Icon
												size={70}
												name='paperclip'
												color='#00acee'
												style={styles.copeButton}
												iconStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
											/>
										}
										onPress={this.setClipboardContent}
									/>
								</View>
							</View>
					</Modal>
					<Modal
						isVisible={this.state.isWithdrawModalVisible}
						onSwipeComplete={() => this.setState({ isWithdrawModalVisible: false })}
						swipeDirection={['up', 'left', 'right', 'down']}
						style={styles.bottomModal}
					>
						<View style={styles.contentSend}>
							<Text style={styles.contentSendTitle}>Send</Text>
							<Madoka
								value={this.state.to}
								style={styles.textInputMadokaAddress}
								label={'ADDRESS'}
								borderColor={'#11bdff'}
								inputPadding={16}
								labelHeight={24}
								labelStyle={{ color: '#909090' }}
								inputStyle={{ color: '#909090' }}
								onChangeText={this.onChangeTo}
							/>
							<Button
								type="Clear"
								style={styles.contentReadQRcode}
								onPress={this.onChangeQRCodeTo}
								icon={
									<Icon
										name="qrcode"
										size={35}
										color="#909090"
									/>
								}
							/>
							<Madoka
								style={styles.textInputMadoka}
								label={'VALUE'}
								borderColor={'#11bdff'}
								inputPadding={16}
								labelHeight={24}
								labelStyle={{ color: '#909090' }}
								inputStyle={{ color: '#909090' }}
								onChangeText={this.onChangeValue}
							/>
							<View style={styles.fixToText}>
								<Button
									type="Clear"
									icon={
										<Icon
											size={70}
											name='send-o'
											color='#11bdff'
											style={styles.sendButton}
											iconStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
										/>
									}
									style={styles.button}
									onPress={this.transferEth}
								/>
							</View>
						</View>
					</Modal>
				</ScrollView>
				<ActionButton
					style={styles.actionButtonIcon}
					buttonColor="#00acee"
					onPress={this.toggleWithdrawModal}
					size={65}
					icon={
						<Icon
							name="send"
							size={28}
							color="#fff"
						/>
					}
				/>
      </React.Fragment>
    )
  }
}

export default WalletScreen

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
