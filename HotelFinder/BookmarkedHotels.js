import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight,
} from 'react-native';
import {NativeModules} from 'react-native';
import { SearchBar } from 'react-native-elements';
let HotelFinderBridge = NativeModules.HotelFinderBridge;

export default class BookmarkedHotels extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Bookmarks',
      headerRight: (
        <Button
          onPress={() => navigation.navigate('Hotels', {})}
          title="Hotels"
        />
      ),
    };
  };
  constructor() {
    super();

    this.state = {
      bookmarkedHotels: [],
    };

    this.queryBookmarkedHotels();
  }
  queryBookmarkedHotels() {
    HotelFinderBridge.queryBookmarkedHotelsDocs(hotels => {
      this.setState({bookmarkedHotels: hotels});
    });
  }
  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let dataSource = ds.cloneWithRows(this.state.bookmarkedHotels);

    return (
      <View style={styles.container}>
        <ListView
          enableEmptySections={true}
          style={styles.listView}
          dataSource={dataSource}
          renderRow={(data, sectionID, rowID, highlightRow) => {
            // let hotel = HotelFinderBridge.queryHotel(`hotel_${data}`, hotel => {
            //
            // });
            return (
              <View style={styles.rowContainer}>
                <Text style={styles.rowTitle}>
                  {data.name}
                </Text>
              </View>
            )
          }}>

        </ListView>
      </View>
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
  listView: {
    flex: 1
  },
  rowContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  rowTitle: {
    fontSize: 30,
    padding: 15,
    flex: 1,
  },
});