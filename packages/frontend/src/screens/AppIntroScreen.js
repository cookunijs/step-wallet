import React, { Component } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';
import { NavigationActions } from 'react-navigation'
import { Button } from 'react-native-elements'
import AppIntroSlider from 'react-native-app-intro-slider';
import LoaderScreen from './LoaderScreen'
import WaitingScreen from './WaitingScreen'

import config from '../../config.json'

const slides = [
  {
    key: 'somethun',
    title: 'Contract Wallet',
    titleStyle: {fontSize: '35', color:'#404040'},
    text: 'Description.\nSay something cool',
    textStyle: {color:'#000'},
    image: require('../../assets/images/undraw_Savings_dwkw.png'),
    imageStyle: {width:300, height:250},
    backgroundColor: '#fff',
  },
  {
    key: 'somethun-dos',
    title: 'Gas fee',
    titleStyle: {fontSize: '35', color:'#404040'},
    text: 'Other cool stuff',
    textStyle: {color:'#000'},
    image: require('../../assets/images/undraw_connected_world_wuay.png'),
    imageStyle: {width:310, height:270},
    backgroundColor: '#fff',
  },
  {
    key: 'somethun1',
    title: 'Key Management',
    titleStyle: {fontSize: '35', color:'#404040'},
    text: 'I m already out of descriptions\n\nLorem ipsum bla bla bla',
    textStyle: {color:'#000'},
    image: require('../../assets/images/undraw_unlock_24mb.png'),
    imageStyle: {width:250, height:250},
    backgroundColor: '#fff',
  },
  {
    key: 'somethun1',
    title: 'Create Wallet',
    titleStyle: {fontSize: '35', color:'#404040'},
    text: 'I m already out of descriptions\n\nLorem ipsum bla bla bla',
    textStyle: {color:'#000'},
    image: require('../../assets/images/page5.png'),
    imageStyle: {width:270, height:270},
    backgroundColor: '#fff',
  }
];
// const slides = config.screens.appIntro.slides

const styles = StyleSheet.create({
  buttonCircle: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(85, 172, 238, .8)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonCircleDone: {
    width: 50,
    height: 50,
    backgroundColor: 'rgba(0, 230, 0, .5)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

class AppIntroScreen extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      appStatus: 0,
    }
  }
  async componentDidMount() {
		await this.loadData()
  }
  loadData = async () => {
    if(await Wallet.getWalletAddress()) {
      this.setState({
        appStatus: 0, //0：AppIntroSliderから、３：wallet作成済みの場合はwalletから
      })
    } else {
      this.setState({
        appStatus: 0,
      })
    }
  }
  renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Ionicons
          name="md-arrow-round-forward"
          color="rgba(255, 255, 255, .9)"
          size={30}
          style={{ backgroundColor: 'transparent' }}
        />
      </View>
    );
  };
  renderDoneButton = () => {
    return (
      <View style={styles.buttonCircleDone}>
        <Button
          buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
          type="Clear"
          icon={
            <Ionicons
              name="md-checkmark"
              color="rgba(255, 255, 255, .9)"
              size={30}
              style={{ backgroundColor: 'transparent' }}
            />
          }
					onPress={this.onDone}
					style={styles.button}
				/>
      </View>
    );
  };
  onDone = async () => {
    await this.props.navigation.navigate('SecondScreen', {}, NavigationActions.navigate({ routeName: 'AppIntroScreen' }))
  }
  render() {
    if (this.state.appStatus === 1) {
      return <WaitingScreen />
    } else if (this.state.appStatus === 2) {
      return <LoaderScreen />
    } else {
      return <AppIntroSlider
        slides={slides}
        dotStyle={{backgroundColor: 'rgba(0, 0, 0, .1)'}}
        activeDotStyle={{backgroundColor: 'rgba(85, 172, 238, .8)'}}
        renderDoneButton={this.renderDoneButton}
        renderNextButton={this.renderNextButton}
        onDone={this.onDone}
      />
    }
  }
}

export default AppIntroScreen
