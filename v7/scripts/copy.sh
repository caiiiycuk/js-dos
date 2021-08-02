#!/bin/bash

cp -v build/index.html ../index.html
sed -i -- 's|^<script src="/v7/build/assets/js/.*||' ../index.html