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
import { Icon } from 'react-native-elements';
import Swipeout from 'rc-swipeout/lib';
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
  }
  componentDidMount() {
    /** Method for detecting when the user returns to this screen.
     * react navigation docs: https://reactnavigation.org/docs/en/navigation-prop.html#addlistener-subscribe-to-updates-to-navigation-lifecycle
     */
    this.props.navigation.addListener('willFocus', status => {
      this.queryBookmarkedHotels();
    });
  }
  queryBookmarkedHotels() {
    // tag::bookmark-list-method-js[]
    HotelFinderBridge.queryBookmarkedHotelsDocs(hotels => {
      this.setState({bookmarkedHotels: hotels});
    });
    // end::bookmark-list-method-js[]
  }
  unbookmarkHotel(hotelId) {
    HotelFinderBridge.unbookmarkHotel(hotelId);
    this.queryBookmarkedHotels();
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
            return (
              <Swipeout
                style={{flex: 1}}
                right={[
                  {
                    text: 'Unbookmark',
                    onPress: () => this.unbookmarkHotel(data.id),
                  }
                ]}>
                <View style={styles.rowContainer}>
                  <Text style={styles.rowTitle}>
                    {data.name}
                  </Text>
                  <Icon name='bookmark'/>
                </View>
              </Swipeout>
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
  },
  listView: {
    flex: 1
  },
  rowContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  rowTitle: {
    fontSize: 30,
    padding: 15,
    flex: 1,
  },
});