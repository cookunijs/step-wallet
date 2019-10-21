import React, { Component } from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

class WelcomeScreen extends Component {
  render() {
    const { uri } = this.props.navigation.state.params;
    return (
      <ScrollView>
       	<WebView source={{ uri: uri }} style={styles.container}/>
      </ScrollView>
    );
  }
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
		width: 375,
    height: 800,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width:400,
    height:550,
    borderWidth: 1,
  },
});
