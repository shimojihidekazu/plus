#!/bin/bash
DIR=${PWD};
echo ${DIR}
rm -f ${DIR}/../html/assets/dist/*.js
ls -la ${DIR}/../html/assets/dist/*.js
npx webpack
