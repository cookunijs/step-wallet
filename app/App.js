import React, { Component } from 'react'
import { StyleSheet, AsyncStorage } from 'react-native'
import * as SecureStore from 'expo-secure-store';

import { Provider } from 'react-redux'
import { createStore } from 'redux'
import { Notifications } from 'expo'
import * as Permissions from 'expo-permissions'
import Constants from 'expo-constants'
import { Header } from 'react-native-elements'
import AppContainer from './src/components/Navigation'
import jwtDecode from 'jwt-decode'
import reducers from './src/reducers'
import { storeDToken, storeNotificationData } from './src/actions'
const store = createStore(reducers)
import FirstScreen from './src/screens/FirstScreen'
import AppIntroScreen from './src/screens/AppIntroScreen'
import GoogleLoginScreen from './src/screens/GoogleLoginScreen'


export default class App extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      data: []
    }
  }
  _handleNotification = async (notification) => {
    if(notification.origin === 'selected'){
      // バックグラウンドで起動中に通知がタップされたとき
      const datas = await this.loadData()
      //jwtDecode
      const data = await jwtDecode(notification.data.jwt)
      datas.push(data)
      this.updateData(datas)
    } else if(notification.origin === 'received'){
      // アプリ起動中に通知を受け取った
      alert('通知が来ました！')
      // await AsyncStorage.clear()
      const datas = await this.loadData()
      //jwtDecode
      const data = await jwtDecode(notification.data.jwt)
      datas.push(data)
      this.updateData(datas)
    }
  }

  registerForPushNotificationsAsync = async () => {
    // 実機端末か否かを判定
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS)
      let finalStatus = existingStatus
      // ユーザーによる通知の許可or許可しないが決定していないときのみ
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS)
        finalStatus = status
      }
      // ユーザーが通知許可しなかった場合は処理を抜ける
      if (finalStatus !== 'granted') return
      // デバイストークンを取得する
      let token
      try{
        token = await Notifications.getExpoPushTokenAsync()
      } catch(err) {
        alert(err)
      }
      // alert(token)
      store.dispatch(storeDToken(token))
    } else {
      alert('プッシュ通知は、実機端末を使用してください。')
    }
  }

  async componentDidMount() {
    const datas = await this.loadData()
    this.updateData(datas)
    this.registerForPushNotificationsAsync()
    this._notificationSubscription = await Notifications.addListener(await this._handleNotification)
  }

  async loadData () {
    try{
      // await AsyncStorage.clear()
      // await SecureStore.deleteItemAsync('PrivateKey')
      // await SecureStore.deleteItemAsync('wallet')
      const datas = []
      result = await AsyncStorage.getItem('notificationData')
      if (result) {
        const notificationData = JSON.parse(result)
        notificationData.forEach((result) => {
          datas.push(result)
        })
      }
      return datas
    } catch(err) {
      console.log(err)
    }
  }

  updateData (datas) {
    this.setState({data: datas})
    store.dispatch(storeNotificationData(datas))
    AsyncStorage.setItem('notificationData', JSON.stringify(datas))
  }
  //leftComponent={{ icon: 'chrome', color: '#fff' }}
  render () {
    return (
      <Provider store={store}>
        <FirstScreen/>
        {/* <SecondScreen/> */}
        {/* <AppIntroScreen/> */}
        {/* <GoogleLoginScreen/> */}
      </Provider>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width:200,
    height:200,
    borderWidth: 1,
  },
})
