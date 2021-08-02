#!/bin/bash

cp -v build/index.html ../index.html
sed -i -- 's/script>/no-script>/g' ../index.html
sed -i -- 's/<script/<no-script/g' ../index.html