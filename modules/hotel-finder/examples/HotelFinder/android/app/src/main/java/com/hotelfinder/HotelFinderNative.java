package com.hotelfinder;

import android.content.Context;

import com.couchbase.lite.ArrayFunction;
import com.couchbase.lite.CouchbaseLiteException;
import com.couchbase.lite.DataSource;
import com.couchbase.lite.Database;
import com.couchbase.lite.DatabaseConfiguration;
import com.couchbase.lite.Dictionary;
import com.couchbase.lite.Expression;
import com.couchbase.lite.FullTextExpression;
import com.couchbase.lite.FullTextIndex;
import com.couchbase.lite.FullTextIndexItem;
import com.couchbase.lite.IndexBuilder;
import com.couchbase.lite.Join;
import com.couchbase.lite.Meta;
import com.couchbase.lite.MutableArray;
import com.couchbase.lite.MutableDocument;
import com.couchbase.lite.Query;
import com.couchbase.lite.QueryBuilder;
import com.couchbase.lite.Result;
import com.couchbase.lite.ResultSet;
import com.couchbase.lite.SelectResult;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.List;

public class HotelFinderNative extends ReactContextBaseJavaModule {

    private static String DOC_TYPE = "bookmarkedhotels";
    private Database database;

    HotelFinderNative(ReactApplicationContext reactContext) {
        super(reactContext);
        DatabaseManager.getSharedInstance(reactContext);
        this.database = DatabaseManager.getDatabase();
    }

    @Override
    public String getName() {
        return "HotelFinderNative";
    }

    // tag::search[]
    @ReactMethod
    private void search(String description, String location, Callback errorCallback, Callback successCallback) {
        Expression locationExp = Expression.property("country")
            .like(Expression.string("%" + location + "%"))
            .or(Expression.property("city").like(Expression.string("%" + location + "%")))
            .or(Expression.property("state").like(Expression.string("%" + location + "%")))
            .or(Expression.property("address").like(Expression.string("%" + location + "%")));

        Expression queryExpression = null;
        if (description == null) {
            queryExpression = locationExp;
        } else {
            Expression descExp = FullTextExpression.index("descFTSIndex").match(description);
            queryExpression = descExp.and(locationExp);
        }

        Query query = QueryBuilder
            .select(
                SelectResult.expression(Meta.id),
                SelectResult.property("name"),
                SelectResult.property("address"),
                SelectResult.property("phone")
            )
            .from(DataSource.database(database))
            .where(
                Expression.property("type").equalTo(Expression.string("hotel"))
                    .and(queryExpression)
            );

        ResultSet resultSet = null;
        try {
            resultSet = query.execute();
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
            errorCallback.invoke();
        }
        WritableArray writableArray = Arguments.createArray();
        assert resultSet != null;
        for (Result result : resultSet) {
            WritableMap writableMap = Arguments.makeNativeMap(result.toMap());
            writableArray.pushMap(writableMap);
        }
        successCallback.invoke(writableArray);
    }
    // end::search[]

    // tag::bookmark[]
    @ReactMethod
    private void bookmark(String hotelId, Callback errorCallback, Callback successCallback) {
        MutableDocument mutableDocument = findOrCreateBookmarkDocument();
        assert mutableDocument != null;
        MutableArray mutableArray = mutableDocument.getArray("hotels");
        mutableArray.addString(hotelId);
        mutableDocument.setArray("hotels", mutableArray);
        try {
            database.save(mutableDocument);
            successCallback.invoke(Arguments.fromList(mutableArray.toList()));
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
            errorCallback.invoke();
        }
    }
    // end::bookmark[]

    // tag::query-ids[]
    @ReactMethod
    private void queryBookmarkIds(Callback errorCallback, Callback successCallback) {
        MutableDocument mutableDocument = findOrCreateBookmarkDocument();
        assert mutableDocument != null;
        MutableArray mutableArray = mutableDocument.getArray("hotels");
        successCallback.invoke(Arguments.fromList(mutableArray.toList()));
    }
    // end::query-ids[]

    // tag::query-bookmarks[]
    @ReactMethod
    private void queryBookmarkDocuments(Callback errorCallback, Callback successCallback) {
        DataSource bookmarkDS = DataSource.database(database).as("bookmarkDS");
        DataSource hotelsDS = DataSource.database(database).as("hotelsDS");

        Expression hotelsExpr = Expression.property("hotels").from("bookmarkDS");
        Expression hotelIdExpr = Meta.id.from("hotelsDS");

        Expression joinExpr = ArrayFunction.contains(hotelsExpr, hotelIdExpr);
        Join join = Join.join(hotelsDS).on(joinExpr);

        Expression typeExpr = Expression.property("type").from("bookmarkDS");

        SelectResult bookmarkAllColumns = SelectResult.all().from("bookmarkDS");
        SelectResult hotelsAllColumns = SelectResult.all().from("hotelsDS");

        Query query = QueryBuilder
            .select(bookmarkAllColumns, hotelsAllColumns)
            .from(bookmarkDS)
            .join(join)
            .where(typeExpr.equalTo(Expression.string(DOC_TYPE)));

        ResultSet resultSet = null;
        try {
            resultSet = query.execute();
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
            errorCallback.invoke(e.toString());
        }

        WritableArray writableArray = Arguments.createArray();
        assert resultSet != null;
        for (Result result : resultSet) {
            Dictionary dictionary = result.getDictionary("hotelsDS");
            WritableMap writableMap = Arguments.makeNativeMap(dictionary.toMap());
            writableArray.pushMap(writableMap);
        }

        successCallback.invoke(writableArray);
    }
    // end::query-bookmarks[]

    // tag::unbookmark[]
    @ReactMethod
    private void unbookmark(String hotelId, Callback errorCallback, Callback successCallback) {
        MutableDocument mutableDocument = findOrCreateBookmarkDocument();
        assert mutableDocument != null;
        MutableArray mutableArray = mutableDocument.getArray("hotels");
        for (int i = 0; i < mutableArray.count(); i++) {
            if (mutableArray.getString(i).equals(hotelId)) {
                mutableDocument
                    .getArray("hotels")
                    .remove(i);
            }
        }
        try {
            database.save(mutableDocument);
            mutableArray = mutableDocument.getArray("hotels");
            successCallback.invoke(Arguments.fromList(mutableArray.toList()));
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
            errorCallback.invoke();
        }
    }
    // end::unbookmark[]

    // tag::find-or-create[]
    private MutableDocument findOrCreateBookmarkDocument() {
        Query query = QueryBuilder
            .select(
                SelectResult.expression(Meta.id)
            )
            .from(DataSource.database(database))
            .where(
                Expression.property("type")
                .equalTo(Expression.string(DOC_TYPE))
            );

        try {
            ResultSet resultSet = query.execute();
            List<Result> list = resultSet.allResults();

            if (list.isEmpty()) {
                MutableDocument mutableDocument = new MutableDocument()
                    .setString("type", DOC_TYPE)
                    .setArray("hotels", new MutableArray());
                database.save(mutableDocument);
                return mutableDocument.toMutable();
            } else {
                Result result = list.get(0);
                String documentId = result.getString("id");
                return database.getDocument(documentId).toMutable();
            }
        } catch (CouchbaseLiteException e) {
            e.printStackTrace();
            return null;
        }
    }
    // end::find-or-create[]

}
