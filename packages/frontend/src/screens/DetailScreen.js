import React, { Component } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Header } from 'react-native-elements'
import { WebView } from 'react-native-webview';

class DetailScreen extends React.Component {
  render() {
    const { name, uri } = this.props.navigation.state.params
    return (
      <React.Fragment>
        <Header
          placement="left"
          statusBarProps={{ barStyle: 'light-content' }}
          barStyle="light-content"
          centerComponent={{ text: name, style: { color: '#000', fontSize: 35, fontWeight: 'bold' } }}
          rightComponent={{ icon: 'close', color: '#000', paddingRight: 20, size: 35, onPress:() => this.props.navigation.goBack()}}
          containerStyle={{
            backgroundColor: '#fff',
            paddingTop: 30,
            paddingRight: 25,
            flex: 0.15,
          }}
        />
        <ScrollView>
          <WebView source={{ uri: uri }} style={styles.container}/>
        </ScrollView>
      </React.Fragment>
    )
  }
}

const styles = StyleSheet.create({
  container: {
		width: 375,
    height: 500,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width:400,
    height:550,
    borderWidth: 1,
  },
})

export default DetailScreen

