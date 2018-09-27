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

// tag::search[]
RCT_EXTERN_METHOD(search :(NSString *)description :(NSString *)location :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::search[]

// tag::bookmark[]
RCT_EXTERN_METHOD(bookmark :(NSString *)hotelId :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::bookmark[]

// tag::query-ids[]
RCT_EXTERN_METHOD(queryBookmarkIds :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::query-ids[]

// tag::query-bookmarks[]
RCT_EXTERN_METHOD(queryBookmarkDocuments :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::query-bookmarks[]

// tag::unbookmark[]
RCT_EXTERN_METHOD(unbookmark:(NSString *)hotelId :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::unbookmark[]

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}
@end
