//
//  HotelFinderBridge.swift
//  HotelFinder
//
//  Created by James Nocentini on 25/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation

// tag::hotel-finder-bridge[]
@objc (HotelFinderBridge)
class HotelFinderBridge: NSObject {
  
  // tag::open-database[]
  @objc func openDatabase() {
    print("open database!" )
  }
  // end::open-database[]
  
}
// end::hotel-finder-bridge[]
