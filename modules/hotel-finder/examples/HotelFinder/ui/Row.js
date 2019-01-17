import React from 'react';
import {
  Text,
  View,
  StyleSheet,
} from "react-native";
import {Icon} from "react-native-elements";

export default class Row extends React.Component {
  isBookmarked() {
    if (this.props.isBookmarked) {
      return (
        <Icon
          color='#c0382b'
          name='bookmark'
          size={40}/>
      )
    } else {
      return <View/>
    }
  }
  render() {
    return (
      <View style={styles.rowContainer}>
        <View style={styles.rowInformation}>
          <Text style={styles.rowTitle}>
            {this.props.hotel.name}
          </Text>
          <Text style={styles.rowAddress}>
            {this.props.hotel.address}
          </Text>
          <Text style={styles.rowPhone}>
            {this.props.hotel.phone}
          </Text>
        </View>
        <View style={styles.rowBookmarkIcon}>
          {this.isBookmarked()}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  rowAddress: {
    color: 'gray',
    fontSize: 20,
    paddingTop: 5,
  },
  rowBookmarkIcon: {
    flex: 1,
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
  },
  rowIcon: {
    color: '#c0382b',
  },
  rowInformation: {
    padding: 15,
    flex: 5,
  },
  rowPhone: {
    color: 'darkblue',
    paddingTop: 5,
  },
  rowTitle: {
    fontSize: 25,
  },
});