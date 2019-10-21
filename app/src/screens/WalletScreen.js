import Wallet from '../plugins/wallet'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image, ScrollView, RefreshControl } from 'react-native'
import { Card, Button, ButtonGroup, Input } from 'react-native-elements'
import { NavigationActions } from 'react-navigation'
import Modal from "react-native-modal"
import QRCode from 'react-native-qrcode-svg'
import Icon from 'react-native-vector-icons/FontAwesome';

class WalletScreen extends React.Component {
	static navigationOptions = {
		title: 'Wallet',
	}
	constructor(props){
    super(props)
    this.state = {
			wallet: "",
			balance: "0",
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
	toggleWithdrawModal = () => {
    this.setState({ isWithdrawModalVisible: !this.state.isWithdrawModalVisible })
	}
	toggleDepositModal = () => {
    this.setState({ isDepositModalVisible: !this.state.isDepositModalVisible })
	}
	onChangeTo = (_to) => {
    this.setState({ to: _to })
	}
	onChangeQRCodeTo = () => {
    this.setState({ isWithdrawModalVisible: !this.state.isWithdrawModalVisible })
		this.props.navigation.navigate('ScannerScreen', {}, NavigationActions.navigate({ routeName: 'WalletScreen' }))
	}
	onChangeValue = (_value) => {
    this.setState({ value: _value })
	}
	createWallet = async () => {
		if(await Wallet.getWalletAddress()) return
		const _wallet = await Wallet.createWallet()
		this.setState({
	    wallet: _wallet
		})
	}
	transferEth = async () => {
		this.toggleWithdrawModal()
		await Wallet.execute(this.state.to, "0x", this.state.value)
		this.setState({
			balance: await Wallet.getWalletBalance(),
			to: ''
		})
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
	component1 = () =>
		<View>
			<Icon
				name="plus"
				size={50}
				color="#00acee"
				style={{
					alignItems: 'center',
					justifyContent: 'center',
        }}
			/>
			{/* <Text>入金</Text> */}
		</View>

	component2 = () =>
		<View　>
			<Icon
				name="minus"
				size={50}
				color="#00acee"
				style={{
					alignItems: 'center',
					justifyContent: 'center',
        }}
			/>
			{/* <Text 
				style={{
					fontSize: 20,
					alignItems: 'center',
					justifyContent: 'center',
        }}
			>出金</Text> */}
		</View>
  render() {
		const { navigate } = this.props.navigation
		if(this.props.navigation.state.params) {
			this.setState({ isWithdrawModalVisible: true })
			const { to } = this.props.navigation.state.params
			this.onChangeTo(to)
			this.props.navigation.state.params = undefined
		}
		const buttons = [{ element: this.component1 }, { element: this.component2 }]
  	const selectedIndex = this.state.selectedIndex
    return (
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
					<Card
						style={styles.card}
						title="Ethereum"
					>
					<Text style={styles.contentTitle}>
						<Icon
							name='user'
							size={24}
							color='black'
							style={styles.contentIcon}
						/>  Address：
					</Text>
					<Text style={styles.contentText}>
						{this.state.wallet}
					</Text>
					<Text style={styles.contentTitle}>
						<Icon
							name='database'
							size={24}
							color='black'
							style={styles.contentIcon}
						/>  Balance：
					</Text>
					<Text style={styles.contentText}>
						{this.state.balance} ETH
					</Text>
					<ButtonGroup
						onPress={this.updateIndex}
						selectedIndex={selectedIndex}
						buttons={buttons}
						containerStyle={{height: 90}}
					/>
					</Card>
					{/* <Button
						icon={
							<Icon
								name="eye"
								size={50}
								color="#00acee"
							/>
						}
						iconRight
						color="white"
						type="Clear"
						style={styles.button}
						buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
						title='deposit'
						onPress={this.toggleDepositModal}
					/>
					<Button
						icon={
							<Icon
								name="eye"
								size={50}
								color="#00acee"
							/>
						}
						iconContainerStyle={styles.button}
						color="white"
						type="Clear"
						style={styles.button}
						buttonStyle={{borderRadius: 0, marginLeft: 0, marginRight: 0, marginBottom: 0}}
						title='withdraw'
						onPress={this.toggleWithdrawModal}
					/> */}
					<Modal
						isVisible={this.state.isDepositModalVisible}
						onSwipeComplete={() => this.setState({ isDepositModalVisible: false })}
						swipeDirection={['up', 'left', 'right', 'down']}
						// style={styles.bottomModal}
        	>
						<View style={styles.content}>
							<Text style={styles.contentTitle}>QR Code</Text>
								<QRCode
									value={this.state.wallet}
									size={200}
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
								<Text style={styles.contentModalText}>{this.state.wallet}</Text>
								<View style={styles.fixToText}>
									<Button
										type="Clear"
										buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
										title="閉じる"
										onPress={this.toggleDepositModal}
										style={styles.button}
									/>
								</View>
							</View>
					</Modal>
					<Modal
						isVisible={this.state.isWithdrawModalVisible}
						onSwipeComplete={() => this.setState({ isWithdrawModalVisible: false })}
						swipeDirection={['up', 'left', 'right', 'down']}
						// style={styles.bottomModal}
        	>
						<View style={styles.content}>
							<Text style={styles.contentTitle}></Text>
							<Input
								label="ADDRESS"
								placeholder='送金先'
								value={this.state.to}
								leftIcon={
									<Icon
										name='smile-o'
										size={23}
										color='black'
										style={styles.contentIcon}
									/>
								}
								rightIcon={
									<Icon
										name='qrcode'
										size={23}
										color='black'
										style={styles.contentIcon}
										onPress={this.onChangeQRCodeTo}
										/>
								}
								style={{ height: 30, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20 }}
								onChangeText={this.onChangeTo}
							/>
							<Text style={styles.contentTitle}></Text>
							<Input
								label="VALUE"
								placeholder='金額'
								leftIcon={
									<Icon
										name='dollar'
										size={25}
										color='black'
										style={styles.contentIcon}
									/>
								}
								style={{ height: 30, width: 300, borderColor: 'gray', borderWidth: 1, marginBottom: 20}}
								onChangeText={this.onChangeValue}
							/>
							<View style={styles.fixToText}>
								<Button
									type="Clear"
									style={styles.button}
									title="送金"
									onPress={this.transferEth}
								/>
								<Button
									type="Clear"
									style={styles.button}
									title="閉じる"
									onPress={this.toggleWithdrawModal}
								/>
							</View>
						</View>
					</Modal>
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
		padding: 5,
    fontSize: 20,
    marginBottom: 12,
	},
	contentModalText: {
		padding: 15,
    fontSize: 10,
    marginBottom: 10,
	},
	contentText: {
		padding: 10,
    fontSize: 15,
    marginBottom: 10,
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
