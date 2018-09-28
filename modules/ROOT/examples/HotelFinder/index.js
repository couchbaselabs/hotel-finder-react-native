import { Navigation } from "react-native-navigation";
import Search from './ui/Search';
import Bookmarks from './ui/Bookmarks';

Navigation.registerComponent('HotelFinder.Bookmarks', () => Bookmarks);
Navigation.registerComponent('HotelFinder.Search', () => Search);

export const startApp = () => {
  Navigation.startSingleScreenApp({
    screen: {
      screen: 'HotelFinder.Bookmarks',
      title: 'Bookmarks',
      navigatorStyle: { screenBackgroundColor: 'white' },
    },
    animationType: "fade"
  });
};

startApp();