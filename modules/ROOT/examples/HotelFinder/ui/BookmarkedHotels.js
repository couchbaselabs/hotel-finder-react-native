import React from 'react';
import {
  ListView,
  StyleSheet,
  Text,
  View,
  Button,
  TouchableHighlight,
} from 'react-native';
import Row from './Row';
import Swipeout from 'rc-swipeout/lib';
// tag::import-statement[]
import {NativeModules} from 'react-native';
let HotelFinderNative = NativeModules.HotelFinderNative;
// end::import-statement[]

export default class BookmarkedHotels extends React.Component {
  constructor(props) {
    super(props);

    let method = this.onNavigatorEvent.bind(this);
    this.props.navigator.setOnNavigatorEvent(method);

    this.state = {
      bookmarkDocuments: [],
    };
  }
  onNavigatorEvent(event) {
    if (event.type === 'NavBarButtonPress') {
      /* The nav bar button is tapped */
      this.props.navigator.push({
        screen: 'HotelFinder.Hotels',
        title: 'Search',
      })
    } else if (event.id === 'willAppear') {
      /* The app is opening this screen */
      this.queryBookmarkDocuments();
    }
  }
  componentDidMount() {
    this.props.navigator.setButtons({
      rightButtons: [
        {
          title: 'Hotels',
        }
      ]
    });
  }
  queryBookmarkDocuments() {
    // tag::bookmark-list-method-js[]
    HotelFinderNative.queryBookmarkDocuments(err => {
      console.log(err);
    }, bookmarks => {
      this.setState({bookmarkDocuments: bookmarks});
    });
    // end::bookmark-list-method-js[]
  }
  unbookmarkHotel(hotelId) {
    HotelFinderNative.unbookmark(hotelId, err => {
      console.log(err);
    }, () => {
      this.queryBookmarkDocuments();
    });
  }
  render() {
    const ds = new ListView.DataSource(
      {rowHasChanged: (r1, r2) => r1 !== r2});
    let dataSource = ds.cloneWithRows(this.state.bookmarkDocuments);

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
                    onPress: () => this.unbookmarkHotel(`hotel_${data.id}`),
                  }
                ]}>
                <Row
                  hotel={data}
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