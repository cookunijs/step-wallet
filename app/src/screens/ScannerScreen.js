import '../../global'
import React, { Component } from 'react'
import { Text, View, StyleSheet, Image } from 'react-native'
import Modal from "react-native-modal";
import { Button } from 'react-native-elements'

// import Constants from 'expo-constants'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as SecureStore from 'expo-secure-store';

import { connect } from 'react-redux';
import { storeDid, storePubEncKey } from '../actions';

import crypto from 'crypto'
import randomBytes from "randombytes"

//globalでのWeb3の作成
global.Web3  = require('web3');
global.web3  = new Web3(
  new Web3.providers.HttpProvider('https://mainnet.infura.io/v3/e6bff28e38264667949d1244613efd01')
);

class QRBarcodeScanner extends React.Component {
  state = {
    hasCameraPermission: null,
    scanned: false,
    url: "",
    isVisible: null,
    type: "",
    data: {},
    decodedValue: {}
  }
  data = ""
  chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  async componentDidMount() {
    this.getPermissionsAsync()
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA)
    this.setState({ hasCameraPermission: status === 'granted' })
  }

  atob = (input = '') => {
    let str = input.replace(/=+$/, '');
    let output = '';

    if (str.length % 4 == 1) {
      throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    }
    for (let bc = 0, bs = 0, buffer, i = 0;
      buffer = str.charAt(i++);

      ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
        bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
    ) {
      buffer = this.chars.indexOf(buffer);
    }

    return output;
  }

  btoa = (input = '')  => {
    let str = input;
    let output = '';

    for (let block = 0, charCode, i = 0, map = this.chars;
    str.charAt(i | 0) || (map = '=', i % 1);
    output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

      charCode = str.charCodeAt(i += 3/4);

      if (charCode > 0xFF) {
        throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
      }
      block = block << 8 | charCode;
    }
    return output;
  }

  render() {
    const { hasCameraPermission, scanned } = this.state
    if (hasCameraPermission === null) {
      return <Text>Requesting for camera permission</Text>
    }
    if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>
    }
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
        }}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : this.onModal}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false, url: ""})} />
        )}
        <Modal
          isVisible={this.state.isVisible === 'bottom'}
          onSwipeComplete={() => this.setState({ isVisible: null })}
          swipeDirection={['up', 'left', 'right', 'down']}
          style={styles.bottomModal}
        >
          <View style={styles.content}>
          <Text style={styles.contentTitle}>承認先</Text>
            <Image
              style={styles.image}
              source={require('../../assets/images/image.jpg')}
            />
            <Text style={styles.contentTitle}>{this.state.decodedValue.iat}</Text>
            <Text>{this.state.decodedValue.iss}</Text>
            <View style={styles.fixToText}>
              <Button
              	buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
                title="承認する"
                onPress={this.handleBarCodeScanned}
                style={styles.button}
              />
              <Button
              	buttonStyle={{borderRadius: 5, marginLeft: 5, marginRight: 5, marginBottom: 5}}
                title="閉じる"
                onPress={this.offModal}
                style={styles.button}
              />
            </View>
          </View>
        </Modal>
        <Text style={styles.content}>{this.state.url}</Text>
      </View>
    )
  }

  onModal = async ({ type, data }) => {
    const urlSplited =  data.split("/")
    const jwt = urlSplited[7]
    const base64Url = jwt.split('.')[1]
    const decodedValue = JSON.parse(this.atob(base64Url))
    this.setState({
      type: type,
      data: data,
      decodedValue: decodedValue,
      isVisible: 'bottom'
    })
  }

  offModal = async () => {
    this.setState({
      isVisible: null
    })
  }

  handleCreateAccount = (values, bag) => {
		var x = global.web3.eth.accounts.create(web3.utils.randomHex(32))
    return x.privateKey.substring(2)
  }

  handleBarCodeScanned = async () => {decodedValue
    const decodedValue = this.state.decodedValue
    const data = this.state.data
    const { pushToken, publicEncKey } = this.props
    const did = decodedValue.iss
    const pubKey = did.split(':')[2]
    const pubEncKey = this.btoa(pubKey)
    const privateKey = this.handleCreateAccount()
    if(!await SecureStore.getItemAsync("privateKey")) {
      await SecureStore.setItemAsync("privateKey", privateKey)
    }
    this.props.storeDid(did)
    this.props.storePubEncKey(pubEncKey)
    this.setState({
      scanned: true,
      url: data,
      isVisible: null,
    })
    // alert(`Bar code with type ${type} and data ${data} has been scanned!`)

    // fetch('https://mywebsite.com/endpoint/', {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     did: did,
    //     pushToken: pushToken,
    //     pubEncKey: pubEncKey
    //   }),
    // });

    await fetch('http://192.168.0.127:8080/endpoint/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        did: did,
        pushToken: pushToken,
        pubEncKey: pubEncKey
      }),
    }).then(response => response.json())
    .then(responseJson => {
      return responseJson.movies
    })
    .catch(error => {
      console.error(error)
    })
    // this.props.navigation.navigate('Home')
  }
}

const mapStateToProps = state => {
  return state.auth;
};

export default connect(mapStateToProps,{ storeDid, storePubEncKey })(QRBarcodeScanner);

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
  // bottomModal: {
  //   justifyContent: 'flex-end',
  //   margin: 0,
  // },
})
