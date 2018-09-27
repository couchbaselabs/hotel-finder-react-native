import { Navigation } from "react-native-navigation";
import Hotels from './ui/Hotels';
import BookmarkedHotels from './ui/BookmarkedHotels';

Navigation.registerComponent('HotelFinder.BookmarkedHotels', () => BookmarkedHotels);
Navigation.registerComponent('HotelFinder.Hotels', () => Hotels);

export const startApp = () => {
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'HotelFinder.BookmarkedHotels',
      title: 'Bookmarks',
      navigatorStyle: { screenBackgroundColor: 'white' },
    },
    animationType: "fade"
  });
};

startApp();