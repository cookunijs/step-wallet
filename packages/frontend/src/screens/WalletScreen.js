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
import config from '../../config.json'

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
    }
  }
  componentDidMount = async () => {
		await this.loadData()
  }
	loadData = async () => {
    const wallet = await Wallet.getWalletAddress()
    const balance = await Wallet.getWalletBalance()
		this.setState({
			wallet: wallet,
			balance: balance
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
      const balance = await Wallet.getWalletBalance()
			this.setState({
				balance: balance,
				to: ''
			})
		}
	}

  render() {
		const users = config.screens.wallet.menus

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
					rightComponent={{ icon: 'dehaze', color: '#000', paddingRight: 20, size: 35, onPress:this.toggleSettingsModal}}
					containerStyle={styles.headerContainer}
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
											titleStyle={styles.modalListItemtitle}
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
									logo={{ url: config.screens.wallet.qrIcon }}
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
												iconStyle={styles.modalButtonIcon}
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
								labelStyle={styles.madokaLabel}
								inputStyle={styles.madokaInput}
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
                      iconStyle={styles.madokaButtonIcon}
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
  headerContainer: {
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingRight: 25,
    flex: 0.15
  },
  container: {
    color: "#000",
    backgroundColor: '#fff'
	},
	textInputMadoka: {
    width:300,
		height:100
	},
	textInputMadokaAddress: {
		paddingTop: -400,
		marginTop: 150,
		marginBottom: 30,
    width:300,
    height:100
	},
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)'
	},
	contentSend: {
    backgroundColor: 'white',
    paddingBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)'
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
    marginBottom: 30
	},
	contentSettingsTitle: {
		fontSize: 35,
		fontWeight: 'bold',
		marginTop: 30,
    marginBottom: 20
	},
	contentSendTitle: {
		fontSize: 35,
		fontWeight: 'bold',
		paddingTop: 180,
		paddingRight: 230,
		marginBottom: -30
	},
	contentModalText: {
		padding: 15,
    fontSize: 10,
    marginBottom: 10
	},
	contentAddressText: {
		padding: 10,
		color: "#000",
		fontSize: 10,
		fontWeight: 'bold',
    marginBottom: 10
	},
	contentBalanceText: {
		marginLeft: 40,
		color: "#404040",
		fontSize: 95,
		fontWeight: 'bold',
		marginTop: 40
	},
	contentEthText: {
		padding: 10,
		color: "#404040",
		fontSize: 35,
		fontWeight: 'bold',
		marginLeft: 254,
		marginTop: -65
	},
	contentOpenQRcode: {
		marginLeft: 182,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -145
	},
	contentReadQRcode: {
		marginLeft: 250,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -170
	},
	contentCloseSetting: {
		marginTop: 230,
		marginBottom: -210
	},
  button: {
		padding: 5,
		paddingLeft: 24,
    paddingRight: 24,
		marginTop: 30,
		marginLeft: 20,
    marginRight: 10,
		fontSize: 10
	},
	copeButton: {
		padding: 5,
		paddingLeft: 24,
		paddingRight: 24,
		marginTop: 150,
		marginLeft: 20,
		marginRight: 10,
    marginBottom: 70
	},
	sendButton: {
		padding: 5,
		paddingLeft: 24,
		paddingRight: 24,
		marginTop: 150,
		marginLeft: 20,
		marginRight: 10,
    marginBottom: 70
	},
	actionButtonIcon: {
    fontSize: 20,
    marginBottom: 40,
		marginRight: 10,
    color: '#00acee'
  },
	bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
	},
	contentIcon: {
		marginTop: 5,
    marginBottom: 10,
    marginRight: 10
  },
  modalListItemtitle: {
    color: "#303030",
    fontSize: 25,
    fontWeight: 'bold',
    paddingLeft: 15
  },
  modalButtonIcon: {
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  },
  madokaLabel: {
    color: '#909090'
  },
  madokaInput: {
    color: '#909090'
  },
  madokaButtonIcon: {
    borderRadius: 5,
    marginLeft: 5,
    marginRight: 5,
    marginBottom: 5
  }
})
