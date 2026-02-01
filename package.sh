#!/bin/sh

if [ ! -f metadata.json ]; then exit; fi

cp metadata.json dist/

version=$(cat metadata.json|grep \"version\"|awk -e '{print $2}'|tr -d ',')
name="arma3-super-key.mayson.io.v${version}.shell-extension.zip"

npm run build
zip $name dist/* -jr
