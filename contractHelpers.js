const { json } = require('express');
const W3 = require('web3');
const Constants = require('./constants');
// const Logger = require('./logger');

const web3 = new W3(Constants.infuraUrl);
const eeContract = new web3.eth.Contract(Constants.eeAbi, Constants.eeAddress);
const renContract = new web3.eth.Contract(Constants.renAbi, Constants.renAddress);

// Generic web3
const checkGas = async () => {
  return await web3.eth.getGasPrice().then((result) => {
    return web3.utils.fromWei(result, 'gwei')
    });
}

// Contract Read
const isReady = async (elfId) => {
  _elf = await eeContract.methods.elves(elfId).call();
  const now = Date.now()/1000;
  return now > _elf.timestamp;
}

// const collectedRen = async () => {

// }

module.exports = {
  checkGas,
  isReady,
}