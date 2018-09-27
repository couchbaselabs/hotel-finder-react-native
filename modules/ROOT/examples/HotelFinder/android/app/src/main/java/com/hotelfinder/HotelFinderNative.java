package com.hotelfinder;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

public class HotelFinderNative extends ReactContextBaseJavaModule {

    HotelFinderNative(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "HotelFinderNative";
    }

}
