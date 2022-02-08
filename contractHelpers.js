require('dotenv').config();
const W3 = require('web3');
const Constants = require('./constants');
const Logger = require('./logger');
const address = Constants.address;
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

const shouldHeal = async (rangerId) => {
  _ranger = await eeContract.methods.elves(rangerId).call();
  const now = Date.now()/1000;
  // 3600 seconds = 1 hour
  const timePassed = parseFloat((now - _ranger.timestamp)/3600)
  // return true if timestamp is within 4 hours
  return timePassed < 4;
}

// Contract Write
// sendCampaign -> [ids], campaign, sector, rollWeapons (bool), rollItems(bool), useItem(bool)
const sendToCampaign = async (elfArray) => {
  let batch = new web3.BatchRequest();
  
  let lvlSevens = [];
  let lvlFourteens = [];
  let lvlThirties = [];

  elfArray.forEach((elfId) => {
    const _elf = await eeContract.methods.elves(elfId).call();
    if (_elf.level < 7) {
      console.log(`Elf ${elfId} is only level ${_elf.level} - can not run current active campaigns`)
      Logger.log(`Elf ${elfId} is only level ${_elf.level} - can not run current active campaigns`)
    } else if (_elf.level < 14) {
      lvlSevens.push(elfId)
    } else if (_elf.level < 30) {
      lvlFourteens.push(elfId)
    } else if (_elf.level > 29) {
      lvlThirties.push(elfId)
    } else {
      console.log(`Warning -- Elf ${elfId} is level ${_elf.level} and did not push into a campaign group`)
      Logger.log(`Warning -- Elf ${elfId} is level ${_elf.level} and did not push into a campaign group`)
    }
  })

 
  // update campaign & sector info - LVL 7-13
  const txSevens = eeContract.methods.sendCampaign(lvlSevens, 1, 5, 0, 0, 0);
  const data = txSevens.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);
  const gas = await txSevens.estimateGas({from: address});
  const gasPrice = await web3.eth.getGasPrice();

  const signedTxSevens = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  // update campaign & sector info - LVL 14-29
  const txFourteens = eeContract.methods.sendCampaign(lvlFourteens, 1, 5, 0, 0, 0);
  const data = txFourteens.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);
  const gas = await txFourteens.estimateGas({from: address});
  const gasPrice = await web3.eth.getGasPrice();

  const signedTxFourteens = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )
 
  // update campaign & sector info - LVL 30+
  const txThirties = eeContract.methods.sendCampaign(lvlThirties, 1, 5, 0, 0, 0);
  const data = txThirties.encodeABI();
  const nonce = await web3.eth.getTransactionCount(address);
  const gas = await txThirties.estimateGas({from: address});
  const gasPrice = await web3.eth.getGasPrice();

  const signedTxThirties = await web3.eth.accounts.signTransaction(
    {
      to: eeContract.options.address,
      data,
      nonce,
      gas,
      gasPrice,
    },
    process.env.KEY
  )

  if (lvlSevens.lenth > 0) {
    console.log(`Adding ${lvlSevens} to batch campaign`)
    Logger.log(`Adding ${lvlSevens} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxSevens.rawTransaction))
  }
  if (lvlFourteens.lenth > 0) {
    console.log(`Adding ${lvlFourteens} to batch campaign`)
    Logger.log(`Adding ${lvlFourteens} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxFourteens.rawTransaction))
  }
  if (lvlThirties.lenth > 0) {
    console.log(`Adding ${lvlThirties} to batch campaign`)
    Logger.log(`Adding ${lvlThirties} to batch campaign`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTxThirties.rawTransaction))
  }
  console.log(`Executing batch campaign`)
  Logger.log(`Executing batch campaign`)
  batch.execute();


}

const healRangers = async (druidIds, rangerIds) => {
  let shortLen = druidIds.length < rangerIds.length ? druidIds.length : rangerIds.length
  let batch = new web3.BatchRequest();
  for (let i = 0; i < shortLen; i++) {
    const tx = eeContract.methods.heal(druidIds[i], rangerIds[i]);
    const data = tx.encodeABI();
    const nonce = await web3.eth.getTransactionCount(address);
    const gas = await tx.estimateGas({from: address});
    const gasPrice = await web3.eth.getGasPrice();

    const signedTx = await web3.eth.accounts.signTransaction(
      {
        to: eeContract.options.address,
        data,
        nonce,
        gas,
        gasPrice,
      },
      process.env.KEY
    )

    console.log(`Batching heal from Druid ${druidIds[i]} to Ranger ${rangerIds[i]}`)
    Logger.log(`Batching heal from Druid ${druidIds[i]} to Ranger ${rangerIds[i]}`)
    batch.add(web3.eth.sendSignedTransaction.request(signedTx.rawTransaction))
  }

  console.log(`Executing batch heal`)
  Logger.log(`Executing batch heal`)
  batch.execute();
}

// const batchTest = async () => {
//   let batch = new web3.BatchRequest();
//   let rangers = [4158,3020,3565,3569,4017,4157,4501,258,288,2581,2591,2731,3557,3559,3561,994];

//   for (let i = 0; i < rangers.length; i++) {
//     console.log(`adding to batch ${rangers[i]}`)
//     batch.add(eeContract.methods.elves(rangers[i]).call.request())
//   }
//   console.log('executing batch')
//   batch.execute();
// }

module.exports = {
  checkGas,
  isReady,
  shouldHeal,
  sendToCampaign,
  healRangers,
}