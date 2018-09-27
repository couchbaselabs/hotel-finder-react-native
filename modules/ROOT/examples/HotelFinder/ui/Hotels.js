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
  constructor() {
    super();

    this.state = {
      descriptionText: null,
      locationText: '',
      hotels: [],
      bookmarkIds: [],
    };


  }
  componentWillMount() {
    // tag::query-bookmark-ids-js[]
    this.queryBookmarkIds();
    // end::query-bookmark-ids-js[]
  }
  onChangeText(descriptionText, locationText) {
    // tag::search-js[]
    HotelFinderNative.search(descriptionText, locationText, err => {
      console.log(err);
    }, hotels => {
      this.setState({hotels: hotels});
    });
    // end::search-js[]
  }
  bookmark(hotelId) {
    // tag::bookmark-method-js[]
    HotelFinderNative.bookmark(hotelId, err => {
      console.log(err);
    }, bookmarkIds => {
      this.setState({bookmarkIds: bookmarkIds});
    });
    // end::bookmark-method-js[]
  }
  unbookmark(hotelId) {
    // tag::unbookmark-method-js[]
    HotelFinderNative.unbookmark(hotelId, err => {
      console.log(err);
    }, bookmarkIds => {
      this.setState({bookmarkIds: bookmarkIds});
    });
    // end::unbookmark-method-js[]
  }
  queryBookmarkIds() {
    // tag::bookmarked-hotels-js[]
    HotelFinderNative.queryBookmarkIds(err => {
      console.log(err);
    }, hotels => {
      this.setState({bookmarkIds: hotels});
    });
    // end::bookmarked-hotels-js[]
  }
  isBookmarked(hotel) {
    return this.state.bookmarkIds.indexOf(hotel.id) !== -1;
  }
  isBookmarkedSwipeout(hotel) {
    if (this.isBookmarked(hotel)) {
      return [
        {
          text: 'Unbookmark',
          onPress: () => {
            this.unbookmark(hotel.id);
          },
        }
      ]
    } else {
      return [
        {
          text: 'Bookmark',
          onPress: () => {
            this.bookmark(hotel.id);
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
          inputStyle={styles.searchInputStyle}
          lightTheme
          onChangeText={(text) => {
            this.setState({descriptionText: text});
          }}
          placeholder='Description'
          style={styles.searchBar}/>
        <SearchBar
          inputStyle={styles.searchInputStyle}
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
                  hotel={data}
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
  searchInputStyle: {
    backgroundColor: 'white',
    color: 'black',
  },
});