#!/bin/bash

echo '---------------------------------------------'
echo '==> Copying contract into local tests folder:'
echo '---------------------------------------------'
cp ../sources/QUBCoin.sol QUBCoin.sol

echo '----------------------------------------------------------------------'
echo '==> Starting Test RPC in the background on port 8546 & limit 0x55D4A80:'
echo '----------------------------------------------------------------------'
testrpc -p 8546 -l 0x55D4A80 &

echo '-----------------------------------------------------------'
echo '==> Running jasmine spec tests with contract: QUBCoin.sol:'
echo '-----------------------------------------------------------'
jasmine-node --junitreport spec/QUBCoinSpec.js
