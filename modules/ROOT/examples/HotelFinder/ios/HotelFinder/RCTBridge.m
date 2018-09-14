//
//  RCTBridge.m
//  HotelFinder
//
//  Created by James Nocentini on 25/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(HotelFinderNative, NSObject)
RCT_EXTERN_METHOD(queryHotel:(NSString *)id)
RCT_EXTERN_METHOD(queryBookmarkedHotels:(RCTResponseSenderBlock)callback)
// tag::bookmark-list-signature[]
RCT_EXTERN_METHOD(queryBookmarkedHotelsDocs:(RCTResponseSenderBlock)callback)
// end::bookmark-list-signature[]
// tag::bookmark-method-signature[]
RCT_EXTERN_METHOD(bookmarkHotel:(NSInteger *)id)
// end::bookmark-method-signature[]
// tag::unbookmark-method-signature[]
RCT_EXTERN_METHOD(unbookmarkHotel:(NSInteger *)id)
// end::unbookmark-method-signature[]
// tag::search-hotels-method-signature[]
RCT_EXTERN_METHOD(searchHotels:(NSString *)descriptionText withLocation:(NSString *)locationText :(RCTResponseSenderBlock)callback)
// end::search-hotels-method-signature[]

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}
@end
