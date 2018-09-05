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
  
  lazy var database: Database = {
    let path = Bundle.main.path(forResource: "travel-sample", ofType: "cblite2")!
    if !Database.exists(withName: "travel-sample") {
      do {
        try Database.copy(fromPath: path, toDatabase: "travel-sample", withConfig: nil)
      } catch {
        fatalError("Could not copy database")
      }
    }
    do {
      let database = try Database(name: "travel-sample")
      self.createIndexes(database)
      return database
    } catch {
      fatalError("Could not copy database")
    }
  }()
  
  func createIndexes(_ database: Database) {
    do {
      try database.createIndex(IndexBuilder.fullTextIndex(items: FullTextIndexItem.property("description")).ignoreAccents(false), withName: "descFTSIndex")
    } catch {
      print(error)
    }
  }
  
  @objc func bookmarkHotel(_ id: Int) {
    print("Bookmark hotel :: \(id)");
    do {
      var document = try fetchGuestBookmarkDocumentFromDB(self.database)
      if document == nil {
        document = MutableDocument(data: ["type": "bookmarkedhotels", "hotels": [String]()])
      }
      var mutableDocument = document!.toMutable()
      mutableDocument.array(forKey: "hotels")!.addInt(id)
      try self.database.saveDocument(mutableDocument)
    } catch {
      print(error)
    }
  }
  
  @objc func queryHotel(_ id: String, _ callback: @escaping ([AnyHashable : Any]) -> Void)  {
    let document = self.database.document(withID: id)
    let dictionary = document!.toDictionary()
    callback(dictionary)
  }
  
  @objc func unbookmarkHotel(_ id: Int) {
    print("Bookmark hotel :: \(id)");
    do {
      var document = try fetchGuestBookmarkDocumentFromDB(self.database)
      if document == nil {
        document = MutableDocument(data: ["type": "bookmarkedhotels", "hotels": [String]()])
      }
      var mutableDocument = document!.toMutable()
      let bookmarkedIds = mutableDocument.array(forKey: "hotels")!.toArray()
      let newBookmarkedIds = bookmarkedIds.filter { (item) -> Bool in
        return item as! Int != id
      }
      mutableDocument.setArray(MutableArrayObject(data: newBookmarkedIds), forKey: "hotels")
      try self.database.saveDocument(mutableDocument)
    } catch {
      print(error)
    }
  }
  
  func fetchGuestBookmarkDocumentFromDB(_ db:Database) throws ->Document? {
    let searchQuery = QueryBuilder
      .select(SelectResult.expression(Meta.id))
      .from(DataSource.database(db))
      .where(Expression.property("type")
        .equalTo(Expression.string("bookmarkedhotels")))
    
    /*
     {
     "type" : "bookmarkedhotelss"
     "hotels":["hotel1","hotel2"]
     }
     
     */
    
    for row in try searchQuery.execute() {
      print("Bookmarked doc is \(row.toDictionary())")
      if let docId = row.string(forKey: "id") {
        return db.document(withID:docId)
      }
    }
    
    return nil
  }
  
  // tag::query-bookmarked-hotels[]
  @objc func queryBookmarkedHotels(_ callback: @escaping ([[[AnyHashable : Any]]]) -> Void) {
    let query = QueryBuilder
      .select(SelectResult.all())
      .from(DataSource.database(self.database))
      .where(
        Expression.property("type").equalTo(Expression.string("bookmarkedhotels"))
      )
    
    var hotels: [[AnyHashable : Any]] = []
    for row in try! query.execute() {
      hotels.append(row.toDictionary())
    }
    callback([hotels])
  }
  // end::query-bookmarked-hotels[]
  
  @objc func queryBookmarkedHotelsDocs(_ callback: @escaping ([[[AnyHashable : Any]]]) -> Void) {
    let query = QueryBuilder
      .select(SelectResult.all())
      .from(DataSource.database(self.database))
      .where(
        Expression.property("type").equalTo(Expression.string("bookmarkedhotels"))
    )
    
    
    
    var hotels: [Dictionary<String,Any>] = []
    var result: [Dictionary<String,Any>] = []
    for row in try! query.execute() {
      hotels.append(row.toDictionary())
    }
    let hotelDoc = hotels[0]["travel-sample"]! as! Dictionary<String,Any>
    let hotelIds = hotelDoc["hotels"] as! [Int]
    print(hotelIds);
    for hotelId in hotelIds {
      let document = self.database.document(withID: "hotel_\(hotelId)")
      result.append(document!.toDictionary())
    }
    callback([result])
  }
  
  @objc func searchHotels(_ descriptionText: String?, withLocation locationText: String = "", _ callback: @escaping ([[[AnyHashable : Any]]]) -> Void) {
    
    let locationExpression = Expression.property("country").like(Expression.string("%\(locationText)%"))
      .or(Expression.property("city").like(Expression.string("%\(locationText)%")))
      .or(Expression.property("state").like(Expression.string("%\(locationText)%")))
      .or(Expression.property("address").like(Expression.string("%\(locationText)")))
    
    var searchExpression: ExpressionProtocol = locationExpression
    if let text = descriptionText {
      let descriptionFTSExpression = FullTextExpression.index("descFTSIndex").match(text)
      searchExpression = descriptionFTSExpression.and(locationExpression)
    }
    
    let query = QueryBuilder
      .select(
        SelectResult.expression(Meta.id),
        SelectResult.all()
      )
      .from(DataSource.database(self.database))
      .where(
        Expression.property("type").equalTo(Expression.string("hotel"))
        .and(searchExpression)
      )
    
    var hotels: [[AnyHashable : Any]] = []
    for row in try! query.execute() {
      hotels.append(row.toDictionary())
    }
    callback([hotels])
  }
  
}
// end::hotel-finder-bridge[]
