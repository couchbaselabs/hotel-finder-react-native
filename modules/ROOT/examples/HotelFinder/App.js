/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ListView} from 'react-native';
import { StackNavigator } from 'react-navigation';
import Hotels from './ui/Hotels';
import BookmarkedHotels from './ui/BookmarkedHotels';
const Navigator = StackNavigator({
  BookmarkedHotels: {screen: BookmarkedHotels},
  Hotels: {screen: Hotels},
  },
  {
    mode: 'modal',
  });

export default class App extends Component<Props> {
  constructor() {
    super();

    this.state = {
      bookmarkedHotels: [],
      hotels: [],
    };
  }
  render() {
    return (
      <Navigator
        screenProps={this.state}/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
