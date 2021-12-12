#!/bin/bash
DIR=${PWD};
rm -f ${DIR}/../html/assets/dist/*.js
ls -la ${DIR}/../html/assets/dist/*.js
npx webpack