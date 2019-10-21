import React, { Component } from 'react'
import { Text, View, StyleSheet, ScrollView } from 'react-native'
import { Card, ListItem, Button } from 'react-native-elements'
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart, Grid, YAxis, XAxis } from 'react-native-svg-charts'


class ChartScreen extends React.Component {
	render() {
		const data = [ 50, 10, 40, 95, -4, -24, 85, 91, 35, 53, -53, 24, 50, -20, -80 ]
		const axesSvg = { fontSize: 10, fill: 'grey' };
		const verticalContentInset = { top: 10, bottom: 10 }
		const xAxisHeight = 30
		return (
			<Card>
				<Text>ETH Chart</Text>
				<View style={{ height: 240, padding: 20, flexDirection: 'row' }}>
					<YAxis
							data={data}
							style={{ marginBottom: xAxisHeight }}
							contentInset={verticalContentInset}
							svg={axesSvg}
					/>
					<View style={{ flex: 1, marginLeft: 10 }}>
							<LineChart
									style={{ flex: 1 }}
									data={data}
									contentInset={verticalContentInset}
									svg={{ stroke: 'rgb(134, 65, 244)' }}
							>
									<Grid/>
							</LineChart>
							<XAxis
									style={{ marginHorizontal: -10, height: xAxisHeight }}
									data={data}
									formatLabel={(value, index) => index}
									contentInset={{ left: 10, right: 10 }}
									svg={axesSvg}
							/>
					</View>
				</View>
				<Text>ETH Price：</Text>
				<Text>18990 JPY</Text>
			</Card>
		)
	}
}
export default ChartScreen