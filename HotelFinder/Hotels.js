import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';
import { NativeModules } from 'react-native';
import {
  Icon,
  SearchBar,
  Button as ElementsButton
} from 'react-native-elements';
import Swipeout from 'rc-swipeout/lib';
let HotelFinderBridge = NativeModules.HotelFinderBridge;

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
  queryBookmarkedHotels() {
    HotelFinderBridge.queryBookmarkedHotels(hotels => {
      if (hotels.length > 0) {
        this.setState({bookmarkedHotels: hotels[0]['travel-sample'].hotels});
      }
    });
  }
  bookmarkHotel(hotelId) {
    HotelFinderBridge.bookmarkHotel(hotelId);
    this.queryBookmarkedHotels();
  }
  unbookmarkHotel(hotelId) {
    HotelFinderBridge.unbookmarkHotel(hotelId);
    this.queryBookmarkedHotels();
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
          style: {backgroundColor: 'red', color: 'white'}
        }
      ]
    } else {
      return [
        {
          text: 'Bookmark',
          onPress: () => this.bookmarkHotel(hotel['travel-sample'].id),
          style: {backgroundColor: 'blue', color: 'white'}
        }
      ]
    }
  }
  onChangeText(descriptionText, locationText) {
    HotelFinderBridge.searchHotels(descriptionText, locationText, hotels => {
      this.setState({hotels: hotels})
    });
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
          style={{flex: 1, width: '100%'}}/>
        <SearchBar
          lightTheme
          onChangeText={(text) => {
            this.setState({locationText: text});
          }}
          placeholder='Country'
          style={{flex: 1, width: '100%'}}/>
        <ElementsButton
          backgroundColor='lightblue'
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
                <View style={styles.rowContainer}>
                  <Text style={styles.rowTitle}>
                    {data['travel-sample'].name}
                  </Text>
                  {this.isBookmarkedIcon(data)}
                </View>
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
    backgroundColor: '#F5FCFF',
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
  rowSubtitle: {
    fontSize: 20,
    padding: 15,
    flex: 1,
  },
});