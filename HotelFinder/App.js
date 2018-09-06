/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ListView} from 'react-native';
// tag::import-statement[]
import {NativeModules} from 'react-native';
let HotelFinderBridge = NativeModules.HotelFinderBridge;
// end::import-statement[]
// tag::stack-navigator[]
import { StackNavigator } from 'react-navigation';
// tag::import-hotels[]
import Hotels from './Hotels';
// end::import-hotels[]
import BookmarkedHotels from './BookmarkedHotels';
const Navigator = StackNavigator({
  BookmarkedHotels: {screen: BookmarkedHotels},
  Hotels: {screen: Hotels},
  },
  {
    mode: 'modal',
  });
// end::stack-navigator[]

type Props = {};
export default class App extends Component<Props> {
  // tag::constructor[]
  constructor() {
    super();

    this.state = {
      bookmarkedHotels: [],
      hotels: [],
    };
  }
  // end::constructor[]
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
