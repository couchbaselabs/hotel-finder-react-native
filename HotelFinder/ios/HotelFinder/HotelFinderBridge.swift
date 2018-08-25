//
//  HotelFinderBridge.swift
//  HotelFinder
//
//  Created by James Nocentini on 25/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
// tag::import-cbl[]
import CouchbaseLiteSwift
// end::import-cbl[]

// tag::hotel-finder-bridge[]
@objc (HotelFinderBridge)
class HotelFinderBridge: NSObject {
  
  // tag::open-database[]
  @objc func openDatabase() {
    // tag::open-database-body[]
    print("open database!")
    do {
      let _ = try Database(name: "hotels")
    } catch {
      print(error)
    }
    // end::open-database-body[]
  }
  // end::open-database[]
  
}
// end::hotel-finder-bridge[]
