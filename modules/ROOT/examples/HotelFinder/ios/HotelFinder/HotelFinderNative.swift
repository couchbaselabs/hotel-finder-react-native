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
  
  let DB_NAME = "travel-sample"
  let DOC_TYPE = "bookmarkedhotels"
  
  // tag::setup-database[]
  lazy var database: Database = {
    let path = Bundle.main.path(forResource: self.DB_NAME, ofType: "cblite2")!
    if !Database.exists(withName: self.DB_NAME) {
      do {
        try Database.copy(fromPath: path, toDatabase: self.DB_NAME, withConfig: nil)
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
  // end::setup-database[]
  
  // tag::create-index[]
  func createIndexes(_ database: Database) {
    do {
      try database.createIndex(IndexBuilder.fullTextIndex(items: FullTextIndexItem.property("description")).ignoreAccents(false), withName: "descFTSIndex")
    } catch {
      print(error)
    }
  }
  // end::create-index[]
  
  // tag::search[]
  @objc func search(_ description: String?, _ location: String = "", _ errorCallback: @escaping () -> Void, _ successCallback: @escaping ([[[AnyHashable : Any]]]) -> Void) {
    
    let locationExpression = Expression.property("country")
      .like(Expression.string("%\(location)%"))
      .or(Expression.property("city").like(Expression.string("%\(location)%")))
      .or(Expression.property("state").like(Expression.string("%\(location)%")))
      .or(Expression.property("address").like(Expression.string("%\(location)")))
    
    var searchExpression: ExpressionProtocol = locationExpression
    if let text = description {
      let descriptionFTSExpression = FullTextExpression.index("descFTSIndex").match(text)
      searchExpression = descriptionFTSExpression.and(locationExpression)
    }
    
    let query = QueryBuilder
      .select(
        SelectResult.expression(Meta.id),
        SelectResult.expression(Expression.property("name")),
        SelectResult.expression(Expression.property("address")),
        SelectResult.expression(Expression.property("phone"))
      )
      .from(DataSource.database(self.database))
      .where(
        Expression.property("type").equalTo(Expression.string("hotel"))
          .and(searchExpression)
    )
    
    do {
      let resultSet = try query.execute()
      var array: [[AnyHashable : Any]] = []
      for result in resultSet {
        let map = result.toDictionary()
        array.append(map)
      }
      successCallback([array])
    } catch {
      print(error)
      errorCallback();
    }
  }
  // end::search[]
  
  // tag::bookmark[]
  @objc func bookmark(_ hotelId: String, _ errorCallback: @escaping ([Any]) -> Void, _ successCallback: @escaping ([Any]) -> Void) {
    let mutableDocument = findOrCreateBookmarkDocument()
    mutableDocument
      .array(forKey: "hotels")!
      .addString(hotelId)
    do {
      try database.saveDocument(mutableDocument)
      let array = mutableDocument.array(forKey: "hotels")!.toArray()
      successCallback([array])
    } catch {
      errorCallback([error.localizedDescription])
      fatalError(error.localizedDescription)
    }
  }
  // end::bookmark[]
  
  // tag::query-ids[]
  @objc func queryBookmarkIds(_ errorCallback: @escaping ([Any]) -> Void, _ successCallback: @escaping ([Any]) -> Void) {
    let mutableDocument = findOrCreateBookmarkDocument()
    let array = mutableDocument.array(forKey: "hotels")!.toArray()
    successCallback([array])
  }
  // end::query-ids[]
  
  // tag::query-bookmarks[]
  @objc func queryBookmarkDocuments(_ errorCallback: @escaping ([Any]) -> Void, _ successCallback: @escaping ([Any]) -> Void) {
    // Do a JOIN Query to fetch bookmark document and for every hotel Id listed
    // in the "hotels" property, fetch the corresponding hotel document
    let bookmarkDS = DataSource.database(database).as("bookmarkDS")
    let hotelsDS = DataSource.database(database).as("hotelsDS")
    
    let hotelsExpr = Expression.property("hotels").from("bookmarkDS")
    let hotelIdExpr = Meta.id.from("hotelsDS")
    
    let joinExpr = ArrayFunction.contains(hotelsExpr, value: hotelIdExpr)
    let join = Join.join(hotelsDS).on(joinExpr);
    
    let typeExpr = Expression.property("type").from("bookmarkDS")
    
    let bookmarkAllColumns = SelectResult.all().from("bookmarkDS")
    let hotelsAllColumns = SelectResult.all().from("hotelsDS")
    
    let query = QueryBuilder.select(bookmarkAllColumns, hotelsAllColumns)
      .from(bookmarkDS)
      .join(join)
      .where(typeExpr.equalTo(Expression.string(DOC_TYPE)));
    
    do {
      let resultSet = try query.execute()
      var array: [Any] = []
      for (_, item) in resultSet.enumerated() {
        let dictionary = item.dictionary(forKey: "hotelsDS")!
        array.append(dictionary.toDictionary())
      }
      successCallback([array])
    } catch {
      errorCallback([error.localizedDescription])
      fatalError(error.localizedDescription)
    }
  }
  // end::query-bookmarks[]
  
  // tag::unbookmark[]
  @objc func unbookmark(_ hotelId: String, _ errorCallback: @escaping ([Any]) -> Void, _ successCallback: @escaping ([Any]) -> Void) {
    let mutableDocument = findOrCreateBookmarkDocument()
    let array = mutableDocument.array(forKey: "hotels")!
    for (index, item) in array.enumerated().reversed() {
      if (item as! String == hotelId) {
        array.removeValue(at: index)
      }
    }
    mutableDocument.setArray(array, forKey: "hotels")
    do {
      try database.saveDocument(mutableDocument)
      successCallback([array.toArray()])
    } catch {
      errorCallback([error.localizedDescription])
      fatalError(error.localizedDescription)
    }
  }
  // end::unbookmark[]
  
  func findOrCreateBookmarkDocument() -> MutableDocument {
    let query = QueryBuilder
      .select(
        SelectResult.expression(Meta.id),
        SelectResult.property("hotels")
      )
      .from(DataSource.database(database))
      .where(
        Expression.property("type")
          .equalTo(Expression.string(DOC_TYPE))
    )
    
    do {
      let resultSet = try query.execute()
      let array = resultSet.allResults()
      if (array.count == 0) {
        let mutableDocument = MutableDocument()
          .setString(DOC_TYPE, forKey: "type")
          .setArray(MutableArrayObject(), forKey: "hotels")
        try database.saveDocument(mutableDocument)
        return mutableDocument
      } else {
        let documentId = array[0].string(forKey: "id")!
        let document = database.document(withID: documentId)!
        return document.toMutable()
      }
    } catch {
      fatalError(error.localizedDescription);
    }
  }
  
}
