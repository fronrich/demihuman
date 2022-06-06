#/bin/bash

# construct the CWD path file
echo "" > CWD.js
echo 'export const CWD = ' >> CWD.js
realpath ./ >> CWD.js