#!/bin/bash
browserify -o build/main.js $1
can-compile views/* -o views.js
cat ./views.js >> build/main.js
rm views.js
