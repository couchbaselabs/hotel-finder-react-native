import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';
import {
  Icon,
  SearchBar,
  Button as ElementsButton
} from 'react-native-elements';
import Row from './Row';
import Swipeout from 'rc-swipeout/lib';
// tag::import-statement[]
import { NativeModules } from 'react-native';
let HotelFinderNative = NativeModules.HotelFinderNative;
// end::import-statement[]

export default class Hotels extends React.Component {
  static navigationOptions = ({ navigation }) => {
    return {
      headerTitle: 'Hotels',
      headerLeft: (
        <Button
          onPress={() => navigation.navigate('BookmarkedHotels', {})}
          title="Close"
        />
      ),
    };
  };
  constructor() {
    super();

    this.state = {
      descriptionText: null,
      locationText: null,
      hotels: [],
      bookmarkedHotels: [],
    };

    this.queryBookmarkedHotels();
  }
  onChangeText(descriptionText, locationText) {
    // tag::search-hotels-js[]
    HotelFinderNative.searchHotels(descriptionText, locationText, hotels => {
      this.setState({hotels: hotels})
    });
    // end::search-hotels-js[]
  }
  bookmarkHotel(hotelId) {
    // tag::bookmark-method-js[]
    HotelFinderNative.bookmarkHotel(hotelId);
    this.queryBookmarkedHotels();
    // end::bookmark-method-js[]
  }
  unbookmarkHotel(hotelId) {
    // tag::unbookmark-method-js[]
    HotelFinderNative.unbookmarkHotel(hotelId);
    this.queryBookmarkedHotels();
    // end::unbookmark-method-js[]
  }
  queryBookmarkedHotels() {
    // tag::bookmarked-hotels-js[]
    HotelFinderNative.queryBookmarkedHotels(hotels => {
      if (hotels.length > 0) {
        this.setState({bookmarkedHotels: hotels[0]['travel-sample'].hotels});
      }
    });
    // end::bookmarked-hotels-js[]
  }
  isBookmarkedIcon(hotel) {
    if (this.isBookmarked(hotel)) {
      return (
        <Icon name='bookmark'/>
      )
    } else {
      return (
        <View/>
      )
    }
  }
  isBookmarked(hotel) {
    if (this.state.bookmarkedHotels.length > 0) {
      var item;
      for (item in this.state.bookmarkedHotels) {
        let itemId = this.state.bookmarkedHotels[item];
        if (`hotel_${itemId}` === hotel.id) {
          return true;
        }
      }
      return false;
    }
    return false;
  }
  isBookmarkedSwipeout(hotel) {
    if (this.isBookmarked(hotel)) {
      return [
        {
          text: 'Unbookmark',
          onPress: () => this.unbookmarkHotel(hotel['travel-sample'].id),
        }
      ]
    } else {
      return [
        {
          text: 'Bookmark',
          onPress: () => this.bookmarkHotel(hotel['travel-sample'].id),
          style: {backgroundColor: 'darkblue', color: 'white'}
        }
      ]
    }
  }
  render() {
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    let dataSource = ds.cloneWithRows(this.state.hotels);

    return (
      <View style={styles.container}>
        <SearchBar
          lightTheme
          onChangeText={(text) => {
            this.setState({descriptionText: text});
          }}
          placeholder='Description'
          style={styles.searchBar}/>
        <SearchBar
          lightTheme
          onChangeText={(text) => {
            this.setState({locationText: text});
          }}
          placeholder='Country'
          style={styles.searchBar}/>
        <ElementsButton
          backgroundColor='#0cace0'
          fontSize={20}
          onPress={() => {
            this.onChangeText(this.state.descriptionText, this.state.locationText);
          }}
          title='Lookup' />
        <ListView
          dataSource={dataSource}
          enableEmptySections={true}
          renderRow={(data, sectionID, rowID, highlightRow) => {
            return (
              <Swipeout
                style={{flex: 1}}
                autoClose={true}
                right={this.isBookmarkedSwipeout(data)}>
                <Row
                  hotel={data['travel-sample']}
                  isBookmarked={this.isBookmarked(data)}/>
              </Swipeout>
            )
          }}
          style={styles.listView}>

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
  searchBar: {
    flex: 1,
    width: '100%',
  },
});