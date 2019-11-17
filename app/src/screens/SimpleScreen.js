import React, { Component } from 'react'
import { Text, View, StyleSheet, ScrollView, Image } from 'react-native'
import { Card, ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';

class SimpleScreen extends React.Component {
	render() {
		return (
				<View style={styles.content} >
          <Text style={styles.contentTitle}>
          Developing now
          </Text>
          <Image style={styles.image} source={require('../../assets/images/page2.png')} />
          <Text style={styles.contentText}>
          We will develop from now on.
          </Text>
				</View>
		)
	}
}

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
    width:330,
    height:330,
  },
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0)',
  },
  fixToText: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 10
  },
  contentTitle: {
    marginTop: 90,
    padding: 15,
    color: '#00acee',
    fontSize: 20,
    fontWeight: 'bold',
	},
	contentModalText: {
		padding: 15,
    fontSize: 10,
    marginBottom: 10,
	},
	contentText: {
		padding: 10,
    fontSize: 10,
    marginBottom: 300,
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

export default SimpleScreen