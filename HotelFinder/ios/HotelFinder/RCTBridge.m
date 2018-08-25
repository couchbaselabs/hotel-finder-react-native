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
RCT_EXTERN_METHOD(openDatabase)
@end
// end::rct-entern-module[]
