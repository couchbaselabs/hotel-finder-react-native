//
//  RCTBridge.m
//  HotelFinder
//
//  Created by James Nocentini on 25/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
// tag::rct-extern-module[]
#import "React/RCTBridgeModule.h"

@interface RCT_EXTERN_MODULE(HotelFinderBridge, NSObject)
RCT_EXTERN_METHOD(queryHotel:(NSString *)id)
RCT_EXTERN_METHOD(queryBookmarkedHotels:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(queryBookmarkedHotelsDocs:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(bookmarkHotel:(NSInteger *)id)
RCT_EXTERN_METHOD(unbookmarkHotel:(NSInteger *)id)
RCT_EXTERN_METHOD(searchHotels:(NSString *)descriptionText withLocation:(NSString *)locationText :(RCTResponseSenderBlock)callback)

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}
@end
// end::rct-entern-module[]
