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
RCT_EXTERN_METHOD(queryBookmarkIds :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// tag::bookmark-list-signature[]
RCT_EXTERN_METHOD(queryBookmarkDocuments :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::bookmark-list-signature[]
// tag::bookmark-method-signature[]
RCT_EXTERN_METHOD(bookmark :(NSString *)hotelId :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::bookmark-method-signature[]
// tag::unbookmark-method-signature[]
RCT_EXTERN_METHOD(unbookmark:(NSString *)hotelId :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::unbookmark-method-signature[]
// tag::search-hotels-method-signature[]
RCT_EXTERN_METHOD(search :(NSString *)description :(NSString *)location :(RCTResponseSenderBlock)errorCallback :(RCTResponseSenderBlock)successCallback)
// end::search-hotels-method-signature[]

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}
@end
