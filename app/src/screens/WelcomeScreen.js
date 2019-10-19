import React, { Component } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Image } from 'react-native-elements'

class WelcomeScreen extends Component {
  render() {
    return (
      <ScrollView>
        {/* <Image
          style={styles.image}
          source={require('../../assets/15.png')}
          PlaceholderContent={<ActivityIndicator />}
        /> */}
      </ScrollView>
    );
  }
}

export default WelcomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
