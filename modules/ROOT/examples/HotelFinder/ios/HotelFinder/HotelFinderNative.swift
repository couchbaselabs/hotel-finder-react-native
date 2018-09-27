//
//  HotelFinderBridge.swift
//  HotelFinder
//
//  Created by James Nocentini on 25/08/2018.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import CouchbaseLiteSwift

@objc (HotelFinderNative)
class HotelFinderNative: NSObject {
  
  // tag::lazy-database[]
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
  // end::lazy-database[]
  
  // tag::create-indexes[]
  func createIndexes(_ database: Database) {
    do {
      try database.createIndex(IndexBuilder.fullTextIndex(items: FullTextIndexItem.property("description")).ignoreAccents(false), withName: "descFTSIndex")
    } catch {
      print(error)
    }
  }
  // end::create-indexes[]
  
  // tag::bookmark[]
  @objc func bookmark(_ hotelId: Int, _ errorCallback: @escaping ([AnyHashable : Any]) -> Void, _ successCallback: @escaping ([AnyHashable : Any]) -> Void) {
    do {
      var document = try fetchBookmarkDocument(self.database)
      if document == nil {
        document = MutableDocument(data: ["type": "bookmarkedhotels", "hotels": [String]()])
      }
      var mutableDocument = document!.toMutable()
      mutableDocument.array(forKey: "hotels")!.addInt(hotelId)
      try self.database.saveDocument(mutableDocument)
    } catch {
      print(error)
    }
  }
  // end::bookmark[]
  
  func findOrCreateBookmarkDocument() {
//    let query = Query
  }
  
  // tag::unbookmark[]
  @objc func unbookmark(_ hotelId: String, _ errorCallback: @escaping ([AnyHashable : Any]) -> Void, _ success: @escaping ([AnyHashable : Any]) -> Void) {
    print("Bookmark hotel :: \(hotelId)");
    do {
      var document = try fetchBookmarkDocument(self.database)
      if document == nil {
        document = MutableDocument(data: ["type": "bookmarkedhotels", "hotels": [String]()])
      }
      var mutableDocument = document!.toMutable()
      let bookmarkedIds = mutableDocument.array(forKey: "hotels")!.toArray()
      let newBookmarkedIds = bookmarkedIds.filter { (item) -> Bool in
//        return item != hotelId
        return false
      }
      mutableDocument.setArray(MutableArrayObject(data: newBookmarkedIds), forKey: "hotels")
      try self.database.saveDocument(mutableDocument)
    } catch {
      print(error)
    }
  }
  // end::unbookmark[]
  
  // tag::fetch-bookmark-document[]
  func fetchBookmarkDocument(_ db:Database) throws ->Document? {
    let searchQuery = QueryBuilder
      .select(SelectResult.expression(Meta.id))
      .from(DataSource.database(db))
      .where(
        Expression.property("type")
        .equalTo(Expression.string("bookmarkedhotels"))
      )
    
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
  // end::fetch-bookmark-document[]
  
  // tag::query-ids[]
  @objc func queryBookmarkIds(_ errorCallback: @escaping ([AnyHashable : Any]) -> Void, _ successCallback: @escaping ([[AnyHashable]]) -> Void) {
    let query = QueryBuilder
      .select(SelectResult.all())
      .from(DataSource.database(self.database))
      .where(
        Expression.property("type").equalTo(Expression.string("bookmarkedhotels"))
      )
    
    var hotelIds: [AnyHashable] = []
    for row in try! query.execute() {
      let hotelDoc = row.toDictionary()
      if let documentBody = hotelDoc["travel-sample"] as? Dictionary<String,Any> {
        hotelIds = documentBody["hotels"] as! [Int]
      }
    }
    successCallback([hotelIds])
  }
  // end::query-ids[]
  
  // tag::bookmark-list-method-swift[]
  @objc func queryBookmarkDocuments(_ errorCallback: @escaping ([[[AnyHashable : Any]]]) -> Void, _ successCallback: @escaping ([[[AnyHashable : Any]]]) -> Void) {
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
    guard hotels.count > 0 else {
      successCallback([result])
      return
    }
    let hotelDoc = hotels[0]["travel-sample"]! as! Dictionary<String,Any>
    let hotelIds = hotelDoc["hotels"] as! [Int]
    for hotelId in hotelIds {
      let document = self.database.document(withID: "hotel_\(hotelId)")
      result.append(document!.toDictionary())
    }
    successCallback([result])
  }
  // end::bookmark-list-method-swift[]
  
  // tag::search[]
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
  // end::search[]
  
}
