import React, { Component } from 'react'
import { Text, View, StyleSheet, Button } from 'react-native'
import { NavigationActions } from 'react-navigation'
import * as Permissions from 'expo-permissions'
import { BarCodeScanner } from 'expo-barcode-scanner'
import * as SecureStore from 'expo-secure-store';

import { connect } from 'react-redux';
import { storeDid, storePubEncKey } from '../actions';

class ScannerScreen extends React.Component {
  static navigationOptions = {
		title: 'Scanner',
	}
  state = {
    hasCameraPermission: null,
    scanned: false,
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
          onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        {scanned && (
          <Button title={'Tap to Scan Again'} onPress={() => this.setState({ scanned: false })} />
        )}
      </View>
    )
  }

  handleBarCodeScanned = async ({ type, data }) => {
    this.props.navigation.navigate('WalletScreen', {to: data}, NavigationActions.navigate({ routeName: 'ScannerScreen' }))
  }
}

const mapStateToProps = state => {
  console.log(state.auth)
  return state.auth
};

export default connect(mapStateToProps,{ storeDid, storePubEncKey })(ScannerScreen);

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
})