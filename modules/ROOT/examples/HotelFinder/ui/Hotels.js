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
      bookmarkedHotelIds: [],
    };

    this.queryBookmarkedHotelIds();
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
    this.queryBookmarkedHotelIds();
    // end::bookmark-method-js[]
  }
  unbookmarkHotel(hotelId) {
    // tag::unbookmark-method-js[]
    HotelFinderNative.unbookmarkHotel(hotelId);
    this.queryBookmarkedHotelIds();
    // end::unbookmark-method-js[]
  }
  queryBookmarkedHotelIds() {
    // tag::bookmarked-hotels-js[]
    HotelFinderNative.queryBookmarkedHotelIds(hotels => {
      console.log(hotels);
      if (hotels) {
        this.setState({bookmarkedHotelIds: hotels});
      }
    });
    // end::bookmarked-hotels-js[]
  }
  isBookmarked(hotel) {
    return this.state.bookmarkedHotelIds.indexOf(hotel['travel-sample'].id) !== -1;
  }
  isBookmarkedSwipeout(hotel) {
    if (this.isBookmarked(hotel)) {
      return [
        {
          text: 'Unbookmark',
          onPress: () => {

            this.unbookmarkHotel(hotel['travel-sample'].id);
          },
        }
      ]
    } else {
      return [
        {
          text: 'Bookmark',
          onPress: () => {
            let bookmarkedHotelIds = this.state.bookmarkedHotelIds;
            bookmarkedHotelIds.push(hotel['travel-sample'].id);
            this.setState({bookmarkedHotelIds: bookmarkedHotelIds});
            this.bookmarkHotel(hotel['travel-sample'].id);
          },
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