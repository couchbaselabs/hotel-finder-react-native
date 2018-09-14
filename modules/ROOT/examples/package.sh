#!/usr/bin/env bash

echo "Temporary folder..."
mkdir final-project
cp -R HotelFinder final-project/
echo "Clean..."
rm -rf final-project/HotelFinder/node_modules/
rm -rf final-project/HotelFinder/ios/Frameworks/CouchbaseLiteSwift.framework
echo "Zipping..."
ditto -c -k --sequesterRsrc --keepParent "final-project" "final-project.zip"
echo "Copy..."
cp final-project.zip ../assets/attachments/starter-project.zip
echo "Delete..."
rm -rf final-project
rm final-project.zip

