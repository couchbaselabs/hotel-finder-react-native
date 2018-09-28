#!/usr/bin/env bash
OUTPUT_FILE=${1}

if [[ ! -z ${1} ]]; then
		echo "Temporary folder..."
		mkdir $OUTPUT_FILE
		cp -R HotelFinder "${OUTPUT_FILE}/"
		echo "Clean..."
		rm -rf "${OUTPUT_FILE}/HotelFinder/node_modules/"
		rm -rf "${OUTPUT_FILE}/HotelFinder/ios/Frameworks/CouchbaseLiteSwift.framework"
		rm -rf "${OUTPUT_FILE}/HotelFinder/android/app/build"
		rm -rf "${OUTPUT_FILE}/HotelFinder/android/app/src/main/assets/travel-sample.cblite2.zip"
		rm -rf "${OUTPUT_FILE}/HotelFinder/ios/HotelFinder/travel-sample.cblite2.zip"
		echo "Zipping..."
		ditto -c -k --sequesterRsrc --keepParent "${OUTPUT_FILE}" "${OUTPUT_FILE}.zip"
		echo "Copy..."
		cp "${OUTPUT_FILE}.zip" "../assets/attachments/${OUTPUT_FILE}.zip"
		echo "Delete..."
		rm -rf $OUTPUT_FILE
		rm "${OUTPUT_FILE}.zip"
	else
		echo "Error: you must provide the output file as an argument."
fi