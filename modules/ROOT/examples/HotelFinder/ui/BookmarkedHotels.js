import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight,
} from 'react-native';
import { Icon } from 'react-native-elements';
import Row from './Row';
import Swipeout from 'rc-swipeout/lib';
// tag::import-statement[]
import {NativeModules} from 'react-native';
let HotelFinderNative = NativeModules.HotelFinderNative;
// end::import-statement[]

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
    HotelFinderNative.queryBookmarkedHotelsDocs(hotels => {
      this.setState({bookmarkedHotels: hotels});
    });
    // end::bookmark-list-method-js[]
  }
  unbookmarkHotel(hotelId) {
    HotelFinderNative.unbookmarkHotel(hotelId);
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
          renderRow={(hotel, sectionID, rowID, highlightRow) => {
            return (
              <Swipeout
                style={{flex: 1}}
                right={[
                  {
                    text: 'Unbookmark',
                    onPress: () => this.unbookmarkHotel(hotel.id),
                  }
                ]}>
                <Row
                  hotel={hotel}
                  isBookmarked={true}/>
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

});